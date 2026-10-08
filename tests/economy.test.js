import test from 'node:test';
import assert from 'node:assert/strict';
import { recordSoloAnswer } from '../convex/quizStatistics.js';
import { grantReward,grantQuizReward,spendCoins,profileCoins } from '../convex/rewardStore.js';
import { balance,devGrantCoins } from '../convex/currency.js';
import * as puzzle from '../convex/puzzleQuiz.js';
import * as challenge from '../convex/itChallenge.js';
import { resolveRoulette,spin as spinRoulette,grantRoulettePrize } from '../convex/rouletteRewards.js';
import { COIN_BRACKETS,CIGARETTE_REWARDS,CIGARETTE_VOUCHER } from '../src/gamble/rewardCatalog.js';
import { claim as claimItem } from '../convex/characterItems.js';
import { inventoryItemsFromSources } from '../src/inventory/config.js';
import { canPreviewCharacterSkin } from '../src/WardrobeController.js';
import { characterById } from '../src/characters.js';
import { sessionTokenHash } from '../convex/profileStore.js';
import { itChallengeRulesKey } from '../src/quiz/itChallengeRules.js';
import QUESTIONS from '../convex/quizStaticQuestions.generated.js';
import { QUIZ_CORRECT_REWARD,ROULETTE_REWARDS,ROULETTE_COST } from '../src/economy/config.js';
import { selectWeightedReward,validateWeightedRewards } from '../src/economy/weightedRewards.js';
import { CurrencyClient } from '../src/economy/CurrencyClient.js';
import { CurrencyHud } from '../src/economy/CurrencyHud.js';
import { PuzzleQuizClient } from '../src/economy/PuzzleQuizClient.js';
import { SoloStudyController } from '../src/SoloStudyController.js';

class Database {
  constructor(){this.tables=new Map();this.nextId=0;}
  rows(table){if(!this.tables.has(table))this.tables.set(table,[]);return this.tables.get(table);}
  async get(id){return [...this.tables.values()].flat().find(row=>row._id===id)??null;}
  async insert(table,value){const id=`${table}:${++this.nextId}`;this.rows(table).push({_id:id,...structuredClone(value)});return id;}
  async patch(id,value){Object.assign(await this.get(id),structuredClone(value));}
  async replace(id,value){const row=await this.get(id);for(const key of Object.keys(row))if(key!=='_id')delete row[key];Object.assign(row,value);}
  async delete(id){for(const rows of this.tables.values()){const index=rows.findIndex(row=>row._id===id);if(index>=0)rows.splice(index,1);}}
  query(table){
    const filters=[];
    const query={withIndex(_name,build){const q={eq(field,value){filters.push([field,value]);return q;}};build(q);return query;},
      collect:async()=>this.rows(table).filter(row=>filters.every(([field,value])=>row[field]===value)),
      unique:async()=>{const rows=await query.collect();assert.ok(rows.length<=1);return rows[0]??null;},
    };return query;
  }
}
async function fixture(coins){
  const db=new Database();
  const profileId=await db.insert('profiles',{profileName:'test',passwordHash:'test',...(coins===undefined?{}:{currency:{coins}})});
  const token='economy-test-token-abcdefghijklmnopqrstuvwxyz';
  await db.insert('profileSessions',{profileId,tokenHash:await sessionTokenHash(token),expiresAt:Date.now()+60_000});
  const playerId='player',sessionId='session';
  const rowId=await db.insert('players',{playerId,sessionId,profileId,room:'school',characterBaseId:'michael',lastSeen:Date.now()});
  const questions=[0,1].map(index=>({id:`q${index}`,category:'Hardware',topic:null,difficulty:'medium',correctAnswer:0,answerCount:4}));
  const runId=await db.insert('soloQuizRuns',{profileId,playerId,sessionId,mode:'study',questions});
  return {db,ctx:{db},profileId,token,rowId,questions,args:{playerId,sessionId,runId},coins:async()=>profileCoins(await db.get(profileId))};
}

test('authoritative correct answer grants one coin; wrong answer grants zero',async()=>{
  const h=await fixture();
  await recordSoloAnswer._handler(h.ctx,{...h.args,questionIndex:0,answerIndex:0});
  assert.equal(await h.coins(),QUIZ_CORRECT_REWARD);
  await recordSoloAnswer._handler(h.ctx,{...h.args,questionIndex:1,answerIndex:1});
  assert.equal(await h.coins(),1);assert.equal(h.db.rows('currencyEvents').length,1);
});

test('repeated attempts, retries and changed answers cannot grant twice',async()=>{
  const h=await fixture(),args={...h.args,questionIndex:0,answerIndex:0};
  await recordSoloAnswer._handler(h.ctx,args);
  assert.equal((await recordSoloAnswer._handler(h.ctx,args)).created,false);
  await assert.rejects(recordSoloAnswer._handler(h.ctx,{...args,answerIndex:1}),/CONFLICT/);
  const wrong={...h.args,questionIndex:1,answerIndex:1};
  await recordSoloAnswer._handler(h.ctx,wrong);
  await assert.rejects(recordSoloAnswer._handler(h.ctx,{...wrong,answerIndex:0}),/CONFLICT/);
  assert.equal(await h.coins(),1);
});

test('live session, owner, bounds and guest checks precede a reward',async()=>{
  const h=await fixture();
  await assert.rejects(recordSoloAnswer._handler(h.ctx,{...h.args,sessionId:'foreign',questionIndex:0,answerIndex:0}),/SESSION_LOST/);
  await assert.rejects(recordSoloAnswer._handler(h.ctx,{...h.args,questionIndex:0,answerIndex:99}),/Invalid answer/);
  await h.db.patch(h.args.runId,{profileId:'foreign-profile'});
  await assert.rejects(recordSoloAnswer._handler(h.ctx,{...h.args,questionIndex:0,answerIndex:0}),/unavailable/);
  await h.db.patch(h.rowId,{profileId:undefined});
  await assert.rejects(recordSoloAnswer._handler(h.ctx,{...h.args,questionIndex:0,answerIndex:0}),/PROFILE_REQUIRED/);
  assert.equal(await h.coins(),0);assert.equal(h.db.rows('currencyEvents').length,0);
});

test('saved profile balance survives map/class changes and a fresh session query',async()=>{
  const h=await fixture(27);
  await recordSoloAnswer._handler(h.ctx,{...h.args,questionIndex:0,answerIndex:0});
  await h.db.patch(h.rowId,{room:'outside',characterBaseId:'felipe'});
  const loggedInAgain={db:h.db};
  assert.deepEqual(await balance._handler(loggedInAgain,{token:h.token}),{coins:28});
  await h.db.patch(h.rowId,{sessionId:'new-session'});
  assert.equal((await balance._handler(loggedInAgain,{token:h.token})).coins,28);
  await assert.rejects(balance._handler(loggedInAgain,{token:'unknown-token-abcdefghijklmnopqrstuvwxyz'}),/SESSION_INVALID/);
});

test('dev coin grant adds exactly 30 only for an enabled tool and the active profile session',async()=>{
  const previous=process.env.DEV_TOOLS_ENABLED;
  delete process.env.DEV_TOOLS_ENABLED;
  const h=await fixture(7);
  try{
    await assert.rejects(devGrantCoins._handler(h.ctx,{token:h.token,...h.args}),/disabled/);
    process.env.DEV_TOOLS_ENABLED='true';
    assert.deepEqual(await devGrantCoins._handler(h.ctx,{token:h.token,...h.args}),{amount:30,coins:37});
    assert.equal(await h.coins(),37);
    assert.equal(h.db.rows('currencyEvents').length,1);
    await assert.rejects(devGrantCoins._handler(h.ctx,{token:h.token,...h.args,sessionId:'other'}),/SESSION_LOST/);
    await h.db.patch(h.rowId,{profileId:'another-profile'});
    await assert.rejects(devGrantCoins._handler(h.ctx,{token:h.token,...h.args}),/PROFILE_REQUIRED/);
    assert.equal(await h.coins(),37);
  }finally{
    if(previous===undefined)delete process.env.DEV_TOOLS_ENABLED;
    else process.env.DEV_TOOLS_ENABLED=previous;
  }
});

test('coin spending validates amount/balance, is idempotent, and never goes negative',async()=>{
  const h=await fixture(5),event={profileId:h.profileId,eventKey:'purchase:server-id',source:'purchase',amount:5};
  assert.equal((await spendCoins(h.ctx,event)).coins,0);
  assert.equal((await spendCoins(h.ctx,event)).created,false);
  await assert.rejects(spendCoins(h.ctx,{...event,eventKey:'second'}),/INSUFFICIENT_COINS/);
  for(const cost of [-1,0,.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])
    await assert.rejects(async()=>spendCoins(h.ctx,{...event,eventKey:'invalid',amount:cost}),/INVALID_COIN_AMOUNT/);
  assert.equal(await h.coins(),0);assert.equal(h.db.rows('currencyEvents').length,1);
});

test('central reward event cannot be reused with different amounts; unsupported types fail',async()=>{
  const h=await fixture(),event={profileId:h.profileId,eventKey:'future-source:event',source:'future-source'};
  await grantReward(h.ctx,event,{type:'coins',amount:3});
  assert.equal((await grantReward(h.ctx,event,{type:'coins',amount:3})).created,false);
  await assert.rejects(grantReward(h.ctx,event,{type:'coins',amount:9}),/CONFLICT/);
  await assert.rejects(grantReward(h.ctx,event,{type:'emote',id:'test'}),/UNSUPPORTED/);
  await assert.rejects(grantQuizReward(h.ctx,{attemptKey:'guest',correct:true}),/PROFILE_REQUIRED/);
  assert.equal(await h.coins(),3);
});

test('IT Challenge grants immediately and finishing the same run does not reward again',async()=>{
  const h=await fixture();
  const runId=await h.db.insert('itChallengeRuns',{...h.args,profileId:h.profileId,questions:h.questions,
    rulesKey:itChallengeRulesKey(),rulesVersion:1,variant:'test',durationMs:300_000,deadline:Date.now()+300_000});
  const args={...h.args,runId,questionIndex:0,answerIndex:0};
  await challenge.answer._handler(h.ctx,args);assert.equal(await h.coins(),1);
  await challenge.answer._handler(h.ctx,args);
  const finishArgs={...h.args,runId,outcomes:[{questionIndex:0,type:'answer',answerIndex:0}],lastViewedQuestionIndex:0};
  await challenge.finish._handler(h.ctx,finishArgs);await challenge.finish._handler(h.ctx,finishArgs);
  assert.equal(await h.coins(),1);assert.equal(h.db.rows('quizAttempts').length,1);
});

test('controller sends challenge answers to the backend immediately',async()=>{
  const calls=[];
  const controller=Object.assign(Object.create(SoloStudyController.prototype),{runId:'run',session:{mode:'challenge',index:3},
    presence:{identity:{playerId:'p',sessionId:'s'},api:{itChallenge:{answer:'challenge-answer'}}},
    terminalMutation:async(...args)=>{calls.push(args);},status:{},render(){},
  });
  controller.recordCurrentAnswer({answerIndex:2});await controller.statisticsPending;
  assert.deepEqual(calls,[['challenge-answer',{playerId:'p',sessionId:'s',runId:'run',questionIndex:3,answerIndex:2}]]);
});

for(const [source,room] of [['office3','office3'],['koetting','secret-path']])
test(`${source}: shuffled puzzle answers are server-validated and presentations reward once`,async()=>{
  const h=await fixture();await h.db.patch(h.rowId,{room});
  const {runId}=await puzzle.start._handler(h.ctx,{...h.args,source});
  const question=QUESTIONS.find(q=>q.answers.length===4),args={...h.args,runId,questionIndex:0};
  await puzzle.prepare._handler(h.ctx,{...args,questionId:question.id});
  await puzzle.prepare._handler(h.ctx,{...args,questionId:question.id});
  const correctAnswer=question.answers[question.correctAnswer];
  assert.equal((await puzzle.answer._handler(h.ctx,{...args,answer:correctAnswer})).correct,true);
  assert.equal((await puzzle.answer._handler(h.ctx,{...args,answer:correctAnswer})).duplicate,true);
  await assert.rejects(puzzle.answer._handler(h.ctx,{...args,answer:question.answers[(question.correctAnswer+1)%4]}),/CONFLICT/);
  const next={...args,questionIndex:1};
  await puzzle.prepare._handler(h.ctx,{...next,questionId:question.id});
  assert.equal((await puzzle.answer._handler(h.ctx,{...next,answer:question.answers[(question.correctAnswer+1)%4]})).correct,false);
  assert.equal(await h.coins(),1);
  await puzzle.start._handler(h.ctx,{...h.args,source});
  await assert.rejects(puzzle.answer._handler(h.ctx,{...args,answer:correctAnswer}),/SESSION_LOST/);
});

test('puzzle authority rejects guests, wrong map/session and unissued questions',async()=>{
  const h=await fixture();
  await assert.rejects(puzzle.start._handler(h.ctx,{...h.args,source:'office3'}),/SESSION_LOST/);
  await h.db.patch(h.rowId,{room:'office3'});
  const {runId}=await puzzle.start._handler(h.ctx,{...h.args,source:'office3'}),args={...h.args,runId,questionIndex:0};
  await assert.rejects(puzzle.answer._handler(h.ctx,{...args,answer:'anything'}),/INVALID_QUESTION/);
  await assert.rejects(puzzle.prepare._handler(h.ctx,{...args,questionIndex:2,questionId:QUESTIONS[0].id}),/PREVIOUS/);
  await assert.rejects(puzzle.prepare._handler(h.ctx,{...args,sessionId:'old',questionId:QUESTIONS[0].id}),/SESSION_LOST/);
  await h.db.patch(h.rowId,{profileId:undefined});
  await assert.rejects(puzzle.start._handler(h.ctx,{...h.args,source:'office3'}),/PROFILE_REQUIRED/);
  assert.equal(await h.coins(),0);
});

test('puzzle client retries preparation with the same event and maps shuffled choice to answer text',async()=>{
  const calls=[];let prepared=false;
  const presence={identity:{playerId:'p',sessionId:'s'},api:{puzzleQuiz:{start:'start',prepare:'prepare',answer:'answer'}},client:{
    async mutation(method,args){calls.push([method,args]);if(method==='start')return {runId:'run'};
      if(method==='prepare'&&!prepared){prepared=true;throw Error('connection');}return {correct:true};},
  }};
  const client=await new PuzzleQuizClient(presence,'office3').start();
  client.prepare({id:'q',answers:['shuffled-B','shuffled-A']});await client.answer(1);
  assert.deepEqual(calls.filter(([method])=>method==='prepare').map(([,args])=>args.questionIndex),[0,0]);
  assert.equal(calls.at(-1)[1].answer,'shuffled-A');
});

class Node {
  constructor(){this.hidden=false;this.attributes={};this.children=[];this.animations=[];this.textContent='';}
  append(...nodes){this.children.push(...nodes);}
  setAttribute(key,value){this.attributes[key]=value;}
  animate(){const animation={cancel(){}};this.animations.push(animation);return animation;}
  getAnimations(){return this.animations;}
  remove(){this.removed=true;}
}

test('HUD subscription restores backend balance, reacts to gains/spends and ignores old-profile events',()=>{
  const callbacks=[],errors=[];let unsubscriptions=0;
  const presence={api:{currency:{balance:'balance'}},client:{onUpdate(_api,args,callback,error){
    callbacks.push(callback);errors.push(error);assert.ok(args.token);return ()=>{unsubscriptions++;};
  }}};
  const mount=new Node(),view=new CurrencyHud({mount,documentRef:{createElement:()=>new Node()}});
  const client=new CurrencyClient(presence,view);client.start('profile-token');
  callbacks[0]({coins:27});assert.equal(view.value.textContent,'27');assert.equal(view.gain.textContent,'');
  callbacks[0]({coins:28});assert.equal(view.value.textContent,'28');assert.equal(view.gain.textContent,'+1');
  callbacks[0]({coins:23});assert.equal(view.value.textContent,'23');
  // A scene transition doesn't recreate this page-level client or view.
  assert.equal(mount.children[0],view.root);assert.equal(callbacks.length,1);
  client.start('another-profile');assert.equal(unsubscriptions,1);assert.equal(view.root.hidden,true);
  callbacks[0]({coins:999});assert.equal(view.root.hidden,true);
  callbacks[1]({coins:4});assert.equal(view.value.textContent,'4');assert.equal(view.gain.textContent,'');
  errors[1](Error('session expired'));assert.equal(view.value.textContent,'—');
  client.stop();assert.equal(view.root.hidden,true);assert.equal(unsubscriptions,2);
  callbacks[1]({coins:999});assert.equal(view.root.hidden,true);view.destroy();assert.equal(view.root.removed,true);
});

test('weights validate config and permit precise one-percent or smaller chances',()=>{
  assert.equal(validateWeightedRewards(ROULETTE_REWARDS),100);assert.equal(ROULETTE_COST,5);
  assert.equal(COIN_BRACKETS.reduce((sum,bracket)=>sum+bracket.weight,0),40);
  assert.equal(selectWeightedReward(ROULETTE_REWARDS,.835).id,'lung_crusher_rare');
  assert.equal(selectWeightedReward(ROULETTE_REWARDS,.845).id,'tier3_skin');
  const precise=[{id:'common',weight:99.99,reward:{type:'none'}},{id:'rare',weight:.01,reward:{type:'none'}}];
  assert.equal(validateWeightedRewards(precise),100);assert.equal(selectWeightedReward(precise,.99995).id,'rare');
  for(const weight of [0,-1,NaN,Infinity])assert.throws(()=>validateWeightedRewards([{id:'x',weight,reward:{type:'none'}}]));
  assert.throws(()=>validateWeightedRewards([]));assert.throws(()=>validateWeightedRewards([precise[0],precise[0]]));
  assert.throws(()=>validateWeightedRewards([{id:'bad',weight:1,reward:{type:'coins',amount:-1}}]));
  for(const random of [-1,1,NaN])assert.throws(()=>selectWeightedReward(precise,random));
});

test('prepared roulette uses server RNG, stable result and one spend per spin',async t=>{
  const h=await fixture(10);t.mock.method(Math,'random',()=>.845);
  const args={profileId:h.profileId,spinId:'server-spin'};
  const expected={rewardId:'tier3_skin',categoryId:'tier3_skin',outcome:{type:'item',itemId:'tier3_skin',label:'Tier 3 Skin'}};
  assert.deepEqual(await resolveRoulette(h.ctx,args),{...expected,duplicate:false});
  assert.equal(await h.coins(),5);assert.equal(h.db.rows('characterItems').length,1);
  t.mock.method(Math,'random',()=>0);
  assert.deepEqual(await resolveRoulette(h.ctx,args),{...expected,duplicate:true});
  assert.equal(await h.coins(),5);assert.equal(h.db.rows('currencyEvents').length,1);
  const poor=await fixture(4);
  await assert.rejects(resolveRoulette(poor.ctx,{profileId:poor.profileId,spinId:'no-funds'}),/INSUFFICIENT/);
  assert.equal(await poor.coins(),4);assert.equal(poor.db.rows('rouletteResults').length,0);
});

test('public roulette spin authenticates the live owner and returns stable rewardId with updated balance',async t=>{
  const h=await fixture(10);t.mock.method(Math,'random',()=>.835);
  const args={token:h.token,...h.args,spinId:'client-spin-001'};
  const expected={rewardId:'lung_crusher_rare',categoryId:'lung_crusher_rare',outcome:{type:'item',itemId:'roulette_pack_rare',label:'Lung Crusher 3000 Rare'},coins:5};
  assert.deepEqual(await spinRoulette._handler(h.ctx,args),{...expected,duplicate:false});
  assert.deepEqual(await spinRoulette._handler(h.ctx,args),{...expected,duplicate:true});
  assert.equal(h.db.rows('currencyEvents').length,1);
  await assert.rejects(spinRoulette._handler(h.ctx,{...args,sessionId:'other'}),/SESSION_LOST/);
  await h.db.patch(h.rowId,{profileId:'foreign'});
  await assert.rejects(spinRoulette._handler(h.ctx,{...args,spinId:'client-spin-002'}),/PROFILE_REQUIRED/);
});

test('collection awards an unowned eligible pack; completed collection stacks vouchers',async t=>{
  const h=await fixture(30);t.mock.method(Math,'random',()=>.75);
  for(const item of CIGARETTE_REWARDS.slice(0,3))await h.db.insert('characterItems',{profileId:h.profileId,itemId:item.itemId,quantity:1});
  const category=ROULETTE_REWARDS.find(reward=>reward.id==='cigarette_collection'),event={profileId:h.profileId,eventKey:'collection'};
  const outcome=await grantRoulettePrize(h.ctx,event,category);
  assert.equal(outcome.itemId,CIGARETTE_VOUCHER.itemId);
  assert.equal(h.db.rows('characterItems').length,4);
  assert.equal((await grantRoulettePrize(h.ctx,event,category)).itemId,CIGARETTE_VOUCHER.itemId);
  await grantRoulettePrize(h.ctx,event,category);
  assert.equal(h.db.rows('characterItems').find(item=>item.itemId===CIGARETTE_VOUCHER.itemId).quantity,2);
  t.mock.method(Math,'random',()=>.75);
  const args={profileId:h.profileId,spinId:'collection-voucher-id'};
  const result=await resolveRoulette(h.ctx,args);assert.equal(result.outcome.type,'voucher');
  await resolveRoulette(h.ctx,args);
  assert.equal(h.db.rows('characterItems').find(item=>item.itemId===CIGARETTE_VOUCHER.itemId).quantity,3);
  assert.equal(await h.coins(),25);
});

test('coin category picks a weighted bracket then an integer amount, preserving the spin receipt',async t=>{
  const h=await fixture(10),draws=[.33,.1,.5];t.mock.method(Math,'random',()=>draws.shift()??0);
  const args={profileId:h.profileId,spinId:'coin-bracket-id'},result=await resolveRoulette(h.ctx,args);
  assert.equal(result.categoryId,'coins');assert.deepEqual(result.outcome,{type:'coins',amount:4,label:'Coins \u00d74'});
  assert.equal(await h.coins(),9);
  assert.deepEqual(await resolveRoulette(h.ctx,args),{...result,duplicate:true});
  assert.equal(await h.coins(),9);
});

test('roulette grants appear in inventory after reload and cannot be claimed by the client',async()=>{
  const h=await fixture(10);await h.db.patch(h.profileId,{selectedCharacterId:'michael'});
  for(const id of ['lung_crusher_rare','tier3_skin','special'])await grantRoulettePrize(h.ctx,{profileId:h.profileId,eventKey:id},ROULETTE_REWARDS.find(reward=>reward.id===id));
  const items=inventoryItemsFromSources(null,h.db.rows('characterItems'),'sarina');
  assert.equal(items.length,3);assert.ok(items.some(item=>item.type==='cosmetic'));
  assert.ok(canPreviewCharacterSkin(characterById('sarina'),{},false,items.some(item=>item.itemId==='tier3_skin')));
  for(const item of items)await assert.rejects(claimItem._handler(h.ctx,{token:h.token,itemId:item.itemId}),/only be granted by the Lucky Machine/);
  const vouchers=inventoryItemsFromSources(null,[{itemId:CIGARETTE_VOUCHER.itemId,quantity:2}],'michael');
  assert.equal(vouchers[0].quantity,2);assert.equal(vouchers[0].type,'voucher');
});

test('historical spin receipts map to the new category without another charge or grant',async()=>{
  const h=await fixture(27);await h.db.insert('rouletteResults',{profileId:h.profileId,spinId:'legacy-spin',rewardId:'coins_5',createdAt:0});
  assert.deepEqual(await resolveRoulette(h.ctx,{profileId:h.profileId,spinId:'legacy-spin'}),{rewardId:'coins_5',categoryId:'coins',duplicate:true});
  assert.equal(await h.coins(),27);assert.equal(h.db.rows('currencyEvents').length,0);
});
