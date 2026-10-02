import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as quest from '../convex/directorInvestigation.js';
import { claim } from '../convex/characterItems.js';
import { sessionTokenHash } from '../convex/profileStore.js';
import { DIRECTOR_CLUES,DIRECTOR_HIDDEN_WALL } from '../convex/directorInvestigationLocations.generated.js';
import { DIRECTOR_CLUE_IDS,DIRECTOR_HIDDEN_KEY_ITEM_ID,DIRECTOR_INVESTIGATION_EVENT,
  availableDirectorClue,readDirectorClues } from '../src/office2/directorInvestigation.js';
import { DirectorInvestigationController } from '../src/office2/DirectorInvestigationController.js';
import { BOSS_REWARDS,DIRECTOR_BOSS_ID } from '../src/boss/BossRewards.js';
import { CHARACTER_ITEM_IDS,characterItemDefinition } from '../src/inventory/characterItems.js';
import { canUnlockOffice2Door } from '../src/art/office2LockedDoor.js';
import { DIRECTOR_COMPUTER } from '../src/office2/directorComputer.js';
import { createComputerSession,runComputerCommand } from '../src/terminal/virtualComputer.js';

function context(){
  const tables={profiles:[],profileSessions:[],players:[],bossProgress:[],directorWorkstations:[],directorInvestigations:[],characterItems:[]};
  let next=0;
  const db={
    query(table){return {withIndex(_index,build){const conditions=[];
      const q={eq(field,value){conditions.push(row=>row[field]===value);return q;}};build(q);
      return {unique:async()=>tables[table].find(row=>conditions.every(check=>check(row)))??null};
    }};},
    async get(id){return Object.values(tables).flat().find(row=>row._id===id)??null;},
    async insert(table,row){const id=`${table}-${++next}`;tables[table].push({_id:id,...row});return id;},
    async patch(id,update){Object.assign(await db.get(id),update);},
  };
  return {db,tables};
}
async function addProfile(ctx,name='A',unlocked=true){
  const now=Date.now(),token=`investigation-${name}-test-token-abcdefghijklmnopqrstuvwxyz`;
  const profileId=await ctx.db.insert('profiles',{selectedCharacterId:'felipe',profileName:name,passwordHash:'test-only'});
  await ctx.db.insert('profileSessions',{profileId,tokenHash:await sessionTokenHash(token),expiresAt:now+60_000});
  const playerRow=await ctx.db.insert('players',{profileId,characterBaseId:'felipe',characterId:'felipe',
    playerId:`player-${name}`,sessionId:`session-${name}`,room:'office2',x:320,y:161,lastSeen:now});
  if(unlocked){
    await ctx.db.insert('bossProgress',{profileId,bossId:DIRECTOR_BOSS_ID,rewards:[BOSS_REWARDS.DIRECTOR_ACCESS_BADGE]});
    await ctx.db.insert('directorWorkstations',{profileId,physicalKeyVerifiedAt:now,compromisedAt:now,recoveryCompletedAt:now});
  }
  return {profileId,playerRow,args:{token,playerId:`player-${name}`,sessionId:`session-${name}`}};
}
async function inspect(ctx,user,id){
  const clue=DIRECTOR_CLUES.find(row=>row.id===id);
  await ctx.db.patch(user.playerRow,{room:clue.room,x:clue.area.x+clue.area.width/2,y:clue.area.y+clue.area.height/2});
  return quest.investigate._handler(ctx,{...user.args,clueId:id});
}
async function start(ctx,user,threshold){
  const random=Math.random;
  try{Math.random=()=>threshold===5?0:.99;return await quest.activate._handler(ctx,user.args);}
  finally{Math.random=random;}
}

test('all six generated hotspots resolve from Notes and remain small, accessible and close to their objects',()=>{
  const all=[];
  for(const room of ['office2','office3']){
    const source=JSON.parse(readFileSync(new URL(`../public/assets/maps/${room}.tmj`,import.meta.url),'utf8'));
    const clues=readDirectorClues(source,room);all.push(...clues);
    for(const clue of clues){
      assert.equal(clue.area.width,32);assert.equal(clue.area.height,24);
      assert.ok(Math.abs(clue.area.x+16-clue.markerX)<=48);
      assert.ok(clue.area.y+12-clue.markerY<=128);
      for(const rect of source.layers.find(layer=>layer.name==='Collision').objects.filter(r=>r.width>0&&r.height>0))
        assert.equal(clue.area.x+32>rect.x&&clue.area.x<rect.x+rect.width&&clue.area.y+24>rect.y&&clue.area.y<rect.y+rect.height,false,clue.id);
    }
  }
  assert.deepEqual(all,DIRECTOR_CLUES);
  assert.deepEqual(all.map(row=>row.id).sort(),[...DIRECTOR_CLUE_IDS].sort());
});

test('no prompts or progression before activation; remote investigation is rejected',async()=>{
  const ctx=context(),user=await addProfile(ctx),clue=DIRECTOR_CLUES[0];
  const initial=await quest.status._handler(ctx,user.args);
  assert.equal(availableDirectorClue(DIRECTOR_CLUES,initial,clue.area.x,clue.area.y),null);
  await assert.rejects(inspect(ctx,user,clue.id),/INVESTIGATION_NOT_ACTIVE/);
  await start(ctx,user,5);
  await ctx.db.patch(user.playerRow,{room:'office2',x:1000,y:1000});
  await assert.rejects(quest.investigate._handler(ctx,{...user.args,clueId:clue.id}),/OUT_OF_RANGE/);
  assert.equal(ctx.tables.directorInvestigations[0].investigatedClueIds.length,0);
});

test('reading only the special file emits the activation event; listing files and the optional album do not',()=>{
  const session=createComputerSession(DIRECTOR_COMPUTER);
  const listing=runComputerCommand(DIRECTOR_COMPUTER,session,'dir');
  assert.match(listing.message,/Lost key.txt/);assert.equal(listing.interaction,undefined);
  for(const command of ['type Lost key.txt','open "Lost key.txt"','Lost key.txt']){
    const result=runComputerCommand(DIRECTOR_COMPUTER,session,command);
    assert.match(result.note,/Future me will figure it out/);assert.equal(result.interaction,DIRECTOR_INVESTIGATION_EVENT);
  }
  assert.equal(runComputerCommand(DIRECTOR_COMPUTER,session,'open Private/Endlich_Ferien.album').interaction,undefined);
});

test('activation requires recovered Director access and persists once, including its hidden 5/6 threshold',async()=>{
  const ctx=context(),locked=await addProfile(ctx,'locked',false);
  await assert.rejects(quest.activate._handler(ctx,locked.args),/DIRECTOR_FILES_LOCKED/);
  for(const threshold of [5,6]){
    const user=await addProfile(ctx,String(threshold));
    const initial=await start(ctx,user,threshold);
    assert.equal(initial.active,true);assert.equal('discoveryCount' in initial,false);
    const row=ctx.tables.directorInvestigations.find(row=>row.profileId===user.profileId);
    assert.equal(row.discoveryCount,threshold);
    assert.deepEqual(await start(ctx,user,threshold===5?6:5),initial);
    assert.equal(row.discoveryCount,threshold,'re-reading cannot re-roll');
  }
  assert.equal(ctx.tables.directorInvestigations.length,2);
});

for(const threshold of [5,6])test(`first four fail, the ${threshold}th unique clue awards exactly one key`,async()=>{
  const ctx=context(),user=await addProfile(ctx);await start(ctx,user,threshold);
  for(let index=0;index<threshold;index++){
    const result=await inspect(ctx,user,DIRECTOR_CLUE_IDS[index]);
    assert.equal(result.state.investigationCount,index+1);
    assert.equal(result.state.keyFound,index+1===threshold);
    assert.equal(Boolean(result.item),index+1===threshold);
    const duplicate=await inspect(ctx,user,DIRECTOR_CLUE_IDS[index]);
    assert.equal(duplicate.duplicate,true);assert.equal(duplicate.item,undefined);
    assert.equal(duplicate.state.investigationCount,index+1);
    if(index<4)assert.match(result.message,/dust|painting|paper clips/i);
  }
  assert.equal(ctx.tables.characterItems.length,1);
  assert.equal(ctx.tables.characterItems[0].itemId,DIRECTOR_HIDDEN_KEY_ITEM_ID);
  assert.equal(ctx.tables.characterItems[0].quantity,1);
  const restored=await quest.status._handler(ctx,user.args);
  assert.equal(availableDirectorClue(DIRECTOR_CLUES,restored,0,0),null);
  const item=characterItemDefinition(DIRECTOR_HIDDEN_KEY_ITEM_ID);
  assert.equal(item.name,"Director's Hidden Key");assert.equal(item.type,'key');assert.equal(item.consumable,undefined);
});

test('profile progress survives a new session; another profile using the same class is independent',async()=>{
  const ctx=context(),a=await addProfile(ctx),b=await addProfile(ctx,'B');
  await start(ctx,a,6);await start(ctx,b,5);await inspect(ctx,a,'clue3');
  await ctx.db.patch(a.playerRow,{sessionId:'new-session'});
  const restored=await quest.status._handler(ctx,{...a.args,sessionId:'new-session'});
  assert.deepEqual(restored.investigatedClueIds,['clue3']);
  assert.equal((await quest.status._handler(ctx,b.args)).investigationCount,0);
  await assert.rejects(quest.investigate._handler(ctx,{...a.args,clueId:'clue3'}),/CHARACTER_SESSION_LOST/);
  await assert.rejects(quest.activate._handler(ctx,{...b.args,playerId:a.args.playerId,sessionId:'new-session'}),/CHARACTER_SESSION_LOST/);
  await ctx.db.patch(b.playerRow,{profileId:undefined});
  await assert.rejects(quest.activate._handler(ctx,b.args),/PROFILE_REQUIRED/);
});

test('hidden wall requires its distinct quest key; explicit unlock persists and retains all existing keys',async()=>{
  const ctx=context(),user=await addProfile(ctx);await start(ctx,user,5);
  const wall=DIRECTOR_HIDDEN_WALL;
  for(const itemId of [CHARACTER_ITEM_IDS.OFFICE2_KEY,BOSS_REWARDS.DIRECTOR_ACCESS_BADGE])
    await ctx.db.insert('characterItems',{profileId:user.profileId,itemId,quantity:1});
  await ctx.db.patch(user.playerRow,{room:wall.room,x:wall.x,y:wall.y});
  await assert.rejects(quest.unlock._handler(ctx,user.args),/HIDDEN_KEY_REQUIRED/);
  assert.equal(canUnlockOffice2Door(ctx.tables.characterItems),false);
  for(const id of DIRECTOR_CLUE_IDS.slice(0,5))await inspect(ctx,user,id);
  assert.equal((await quest.status._handler(ctx,user.args)).doorUnlocked,false,'finding is not auto-use');
  assert.equal(canUnlockOffice2Door(ctx.tables.characterItems),true);
  await assert.rejects(quest.unlock._handler(ctx,user.args),/OUT_OF_RANGE/);
  await ctx.db.patch(user.playerRow,{room:wall.room,x:wall.x,y:wall.y});
  const unlocked=await quest.unlock._handler(ctx,user.args);
  assert.equal(unlocked.doorUnlocked,true);
  assert.deepEqual(await quest.unlock._handler(ctx,user.args),unlocked);
  assert.deepEqual(await quest.status._handler(ctx,user.args),unlocked);
  assert.equal(ctx.tables.characterItems.length,3);
  assert.ok(ctx.tables.characterItems.every(item=>item.quantity===1));
  assert.deepEqual(ctx.tables.bossProgress[0].rewards,[BOSS_REWARDS.DIRECTOR_ACCESS_BADGE]);
});

test('the normal item-claim endpoint cannot bypass the investigation to obtain its key',async()=>{
  const ctx=context(),user=await addProfile(ctx);
  await assert.rejects(claim._handler(ctx,{token:user.args.token,itemId:DIRECTOR_HIDDEN_KEY_ITEM_ID}),/quest pickup/);
  assert.equal(ctx.tables.characterItems.length,0);
});

function localController(initial){
  const calls=[];const state=initial??{active:false,investigatedClueIds:[],keyFound:false,doorUnlocked:false};
  const prompt={setPosition(){},setVisible(value){this.visible=value;},destroy(){this.destroyed=true;}};
  const source={layers:[{name:'Notes',type:'objectgroup',objects:[{name:'clue1',x:50,y:50}]}]};
  const scene={source,mapKey:'office3',player:{x:50,y:82},hint:{},positionInteractionHint(){},
    characterItems:{items:[],setItems(items){this.items=items;},onItemCollected(item){calls.push(['present',item.itemId]);}},
    presence:{identity:{kind:'profile',playerId:'p',sessionId:'s',characterBaseId:'felipe'},profileSessionToken:'test',
      api:{directorInvestigation:{status:'status',activate:'activate',investigate:'investigate',unlock:'unlock'}},
      async send(_now,options){calls.push(['flush',options]);},fail(){calls.push(['fail']);},
      client:{async query(){calls.push(['query']);return state;},async mutation(method){
        calls.push([method]);return {active:true,investigatedClueIds:[],keyFound:false,doorUnlocked:false};
      }}}};
  return {scene,calls,prompt,controller:new DirectorInvestigationController(scene,{promptFactory:()=>prompt})};
}

test('local prompts activate once, make no polling calls, hide inspected clues and clean up on exit',async()=>{
  const f=localController();await f.controller.ready;
  f.scene.hint.hidden=true;f.controller.renderFeedback();assert.equal(f.scene.hint.hidden,true);
  assert.equal(f.controller.updatePrompt(true),null);assert.equal(f.prompt.visible,false);
  await f.controller.activate();await f.controller.activate();
  assert.equal(f.calls.filter(call=>call[0]==='activate').length,1);
  for(let index=0;index<100;index++)assert.equal(f.controller.updatePrompt(true).id,'clue1');
  assert.equal(f.calls.filter(call=>call[0]==='query').length,1);
  f.controller.accept({active:true,investigatedClueIds:['clue1'],keyFound:false});
  assert.equal(f.controller.updatePrompt(true),null);
  f.controller.destroy();assert.equal(f.prompt.destroyed,true);
});

test('local key award flushes position once and reuses existing inventory presentation',async()=>{
  const f=localController({active:true,investigatedClueIds:[],keyFound:false});await f.controller.ready;
  f.scene.presence.client.mutation=async()=>({state:{active:true,investigatedClueIds:['clue1'],keyFound:true},
    item:{itemId:DIRECTOR_HIDDEN_KEY_ITEM_ID,quantity:1},message:'You found the key.'});
  assert.equal(await f.controller.investigate(),true);
  assert.deepEqual(f.calls.find(call=>call[0]==='flush'),['flush',{forcePosition:true}]);
  assert.equal(f.scene.characterItems.items[0].name,"Director's Hidden Key");
  assert.deepEqual(f.calls.find(call=>call[0]==='present'),['present',DIRECTOR_HIDDEN_KEY_ITEM_ID]);
  f.controller.renderFeedback();assert.equal(f.scene.hint.textContent,'You found the key.');
  f.controller.destroy();
});

test('late entry query and responses after leaving cannot revert progress or award UI to another session',async()=>{
  const f=localController();await f.controller.ready;
  let resolveQuery;
  f.scene.presence.client.query=()=>new Promise(resolve=>{resolveQuery=resolve;});
  const pending=f.controller.restore();await Promise.resolve();
  f.controller.accept({active:true,investigatedClueIds:['clue1'],keyFound:true});
  resolveQuery({active:false});await pending;assert.equal(f.controller.state.keyFound,true);
  let resolveMutation;
  f.scene.presence.client.mutation=()=>new Promise(resolve=>{resolveMutation=resolve;});
  const request=f.controller.request('activate');
  f.controller.destroy();resolveMutation({active:true});
  assert.equal(await request,null);
  assert.equal(f.calls.some(call=>call[0]==='present'),false);
});
