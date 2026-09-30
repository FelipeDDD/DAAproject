import test from 'node:test';
import assert from 'node:assert/strict';
import * as workstation from '../convex/directorWorkstation.js';
import { sessionTokenHash } from '../convex/profileStore.js';
import { BOSS_REWARDS,DIRECTOR_BOSS_ID } from '../src/boss/BossRewards.js';
import { directorSecurityState } from '../src/office2/directorSecurity.js';
import { DirectorSecurityFlow } from '../src/office2/DirectorSecurityFlow.js';

const TOKEN_A='director-security-token-a-abcdefghijklmnopqrstuvwxyz';
const TOKEN_B='director-security-token-b-abcdefghijklmnopqrstuvwxyz';

function memoryContext(){
  const tables={profiles:[],profileSessions:[],players:[],bossProgress:[],directorWorkstations:[]};
  let id=0;
  const db={
    query(table){return {withIndex(_index,build){const conditions=[];
      const q={eq(field,value){conditions.push(row=>row[field]===value);return q;}};build(q);
      return {unique:async()=>tables[table].find(row=>conditions.every(test=>test(row)))??null};
    }};},
    async get(rowId){return Object.values(tables).flat().find(row=>row._id===rowId)??null;},
    async insert(table,value){const rowId=`${table}-${++id}`;tables[table].push({_id:rowId,...value});return rowId;},
    async patch(rowId,values){Object.assign(await db.get(rowId),values);},
  };
  return {db,tables};
}

async function addPlayer(ctx,token,name,{profileId=null,playerId=`player-${name}`,sessionId=`session-${name}`,room='office2'}={}){
  const now=Date.now();
  profileId??=await ctx.db.insert('profiles',{profileName:name,passwordHash:'set',selectedCharacterId:'felipe',createdAt:now,updatedAt:now});
  await ctx.db.insert('profileSessions',{profileId,tokenHash:await sessionTokenHash(token),createdAt:now,expiresAt:now+60_000});
  const playerRow=await ctx.db.insert('players',{profileId,playerId,sessionId,room,lastSeen:now});
  return {profileId,playerRow,args:{token,playerId,sessionId}};
}

test('Director key is required; two rejected answers persist the local lockout per profile',async()=>{
  const ctx=memoryContext(),user=await addPlayer(ctx,TOKEN_A,'felipe');
  assert.deepEqual(await workstation.status._handler(ctx,user.args),directorSecurityState(false));
  assert.equal((await workstation.submitChoice._handler(ctx,{...user.args,choice:'left'})).stage,'locked');
  assert.equal(ctx.tables.directorWorkstations.length,0);

  await ctx.db.insert('bossProgress',{profileId:user.profileId,bossId:DIRECTOR_BOSS_ID,
    wins:1,defeated:true,rewards:[BOSS_REWARDS.DIRECTOR_ACCESS_BADGE],updatedAt:Date.now()});
  const unlocked=await workstation.status._handler(ctx,user.args);
  assert.equal(unlocked.stage,'locked');assert.equal(unlocked.factor1Verified,false);
  assert.equal(ctx.tables.directorWorkstations.length,0,'opening does not verify the key');
  const verified=await workstation.verifyPhysicalKey._handler(ctx,user.args);
  assert.equal(verified.stage,'question');assert.equal(verified.factor1Verified,true);
  assert.deepEqual(ctx.tables.bossProgress[0].rewards,[BOSS_REWARDS.DIRECTOR_ACCESS_BADGE],'key is not consumed');
  const first=await workstation.submitChoice._handler(ctx,{...user.args,choice:'left'});
  assert.equal(first.stage,'question');assert.equal(first.failedAttempts,1);
  const second=await workstation.submitChoice._handler(ctx,{...user.args,choice:'right'});
  assert.equal(second.stage,'compromised');assert.equal(second.failedAttempts,2);
  assert.equal(ctx.tables.directorWorkstations.length,1);
  assert.ok(ctx.tables.directorWorkstations[0].compromisedAt);
  assert.equal((await workstation.submitChoice._handler(ctx,{...user.args,choice:'left'})).stage,'compromised');
  assert.equal(ctx.tables.directorWorkstations[0].failedAttempts,2);

  await ctx.db.patch(user.playerRow,{sessionId:'next-session',playerId:'next-player'});
  const next={...user.args,playerId:'next-player',sessionId:'next-session'};
  assert.equal((await workstation.status._handler(ctx,next)).stage,'compromised',
    'switching character sessions keeps profile progress');
  await assert.rejects(workstation.submitChoice._handler(ctx,{...user.args,choice:'left'}),/CHARACTER_SESSION_LOST/);
  assert.equal(ctx.tables.directorWorkstations.length,1);
});

test('recovery persists per profile, requires explicit key and compromise, and is idempotent',async()=>{
  const ctx=memoryContext(),a=await addPlayer(ctx,TOKEN_A,'a'),b=await addPlayer(ctx,TOKEN_B,'b');
  for(const user of [a,b])await ctx.db.insert('bossProgress',{profileId:user.profileId,bossId:DIRECTOR_BOSS_ID,
    wins:1,defeated:true,rewards:[BOSS_REWARDS.DIRECTOR_ACCESS_BADGE],updatedAt:Date.now()});
  await ctx.db.patch(a.playerRow,{room:'office3'});
  await assert.rejects(workstation.completeRecovery._handler(ctx,a.args),/RECOVERY_NOT_AVAILABLE/);
  await ctx.db.patch(a.playerRow,{room:'office2'});
  await workstation.verifyPhysicalKey._handler(ctx,a.args);
  await workstation.submitChoice._handler(ctx,{...a.args,choice:'left'});
  assert.equal((await workstation.status._handler(ctx,b.args)).failedAttempts,0);
  await assert.rejects(workstation.submitChoice._handler(ctx,{...a.args,token:TOKEN_B,choice:'right'}),/CHARACTER_SESSION_LOST/);
  await ctx.db.patch(a.playerRow,{room:'office3'});
  await assert.rejects(workstation.completeRecovery._handler(ctx,a.args),/RECOVERY_NOT_AVAILABLE/);
  await ctx.db.patch(a.playerRow,{room:'office2'});
  await workstation.submitChoice._handler(ctx,{...a.args,choice:'right'});
  await assert.rejects(workstation.completeRecovery._handler(ctx,a.args),/CHARACTER_SESSION_LOST/);
  await ctx.db.patch(a.playerRow,{room:'office3'});
  await assert.rejects(workstation.completeRecovery._handler(ctx,{...a.args,token:TOKEN_B}),/CHARACTER_SESSION_LOST/);
  await assert.rejects(workstation.completeRecovery._handler(ctx,{...a.args,sessionId:'old'}),/CHARACTER_SESSION_LOST/);
  assert.equal((await workstation.recoveryStatus._handler(ctx,a.args)).stage,'compromised');
  assert.equal((await workstation.completeRecovery._handler(ctx,a.args)).stage,'recovered');
  const saved={...ctx.tables.directorWorkstations[0]};
  await workstation.completeRecovery._handler(ctx,a.args);
  assert.deepEqual(ctx.tables.directorWorkstations[0],saved,'retry does not rewrite completion');
  await ctx.db.patch(a.playerRow,{room:'office2',playerId:'reopened',sessionId:'new-session'});
  const reopened=await workstation.status._handler(ctx,{...a.args,playerId:'reopened',sessionId:'new-session'});
  assert.equal(reopened.recoveryComplete,true);assert.equal(reopened.factor1Verified,true);
  assert.equal(reopened.compromised,true);
  assert.equal((await workstation.status._handler(ctx,b.args)).recoveryComplete,false);
});

test('missing key cannot verify and old compromise state does not implicitly verify a key',async()=>{
  const ctx=memoryContext(),user=await addPlayer(ctx,TOKEN_A,'a');
  assert.equal((await workstation.verifyPhysicalKey._handler(ctx,user.args)).factor1Verified,false);
  assert.equal(ctx.tables.directorWorkstations.length,0);
  assert.equal(directorSecurityState(true,{failedAttempts:2,remoteApprovedAt:123}).stage,'locked');
});

function domNode(tag){return {tagName:tag.toUpperCase(),children:[],classList:{add(){},remove(){}},
  append(...children){this.children.push(...children);},addEventListener(_type,listener){this.click=listener;},
  querySelector(){return null;},focus(){},textContent:''};}

test('Director UI rejects either choice, then shows a local lockout without shell access',async t=>{
  const previous=globalThis.document;globalThis.document={createElement:domNode};t.after(()=>{globalThis.document=previous;});
  const panel=domNode('section');let calls=0;
  const host={active:true,generation:1,panel,root:domNode('div'),
    resetPanel(title){panel.children=[];panel.append(domNode('button'),Object.assign(domNode('h2'),{textContent:title}));},
    scene:{presence:{identity:{playerId:'p',sessionId:'s'},profileSessionToken:'token',
      api:{directorWorkstation:{status:'status',submitChoice:'submitChoice',verifyPhysicalKey:'verifyPhysicalKey'}},
      client:{query:async()=>directorSecurityState(true),mutation:async method=>{
        if(method==='submitChoice')calls++;
        return directorSecurityState(true,{physicalKeyVerifiedAt:1,failedAttempts:calls});}},
    }},
  };
  const flow=new DirectorSecurityFlow(host);
  await flow.open();
  assert.equal(panel.children.some(node=>node.textContent==='VERIFY PHYSICAL KEY'),true);
  assert.equal(panel.children.some(node=>node.textContent?.includes('Remote Network Approval')),false);
  assert.equal(panel.children.some(node=>node.textContent?.includes('Confirmation ........ LOCKED')),true);
  await flow.verifyKey();
  assert.equal(panel.children.some(node=>node.className==='director-security-choices'),true);
  await flow.choose('left');
  assert.equal(panel.children.some(node=>node.textContent?.includes('Incorrect password.')),true);
  await flow.choose('right');
  assert.equal(calls,2);
  assert.equal(panel.children.some(node=>node.textContent==='LOCAL ACCESS COMPROMISED'),true);
  assert.equal(panel.children.some(node=>node.textContent==='Emergency Remote Recovery is required.'),true);
  assert.equal(panel.children.some(node=>node.className==='director-security-choices'),false);
});
