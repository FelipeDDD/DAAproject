import assert from 'node:assert/strict';
import test from 'node:test';
import * as boss from '../convex/bossProgress.js';
import * as items from '../convex/characterItems.js';
import { attachLegacyCharacterData } from '../convex/profileDataMigration.js';
import { sessionTokenHash } from '../convex/profileStore.js';
import { BOSS_REWARDS,DIRECTOR_BOSS_ID } from '../src/boss/BossRewards.js';
import { CHARACTER_ITEM_IDS } from '../src/inventory/characterItems.js';

function memoryContext(){
  const tables={profiles:[],profileSessions:[],players:[],bossProgress:[],bossVictoryReceipts:[],characterItems:[],characterLoadouts:[]};
  let nextId=1;
  const query=table=>({
    collect:async()=>[...tables[table]],
    withIndex:(_name,build)=>{
      const predicates=[];const builder={eq(field,value){predicates.push(row=>row[field]===value);return builder;}};build(builder);
      const matching=()=>tables[table].filter(row=>predicates.every(predicate=>predicate(row)));
      return {unique:async()=>matching()[0]??null,first:async()=>matching()[0]??null,
        collect:async()=>matching(),take:async count=>matching().slice(0,count)};
    },
  });
  const db={query,
    async get(id){return Object.values(tables).flat().find(row=>row._id===id)??null;},
    async insert(table,value){const id=`${table}-${nextId++}`;tables[table].push({_id:id,...value});return id;},
    async patch(id,value){const row=await db.get(id);if(!row)throw new Error('missing row');Object.assign(row,value);},
    async replace(id,value){for(const rows of Object.values(tables)){const index=rows.findIndex(row=>row._id===id);if(index>=0){rows[index]={_id:id,...value};return;}}throw new Error('missing row');},
    async delete(id){for(const rows of Object.values(tables)){const index=rows.findIndex(row=>row._id===id);if(index>=0){rows.splice(index,1);return;}}},
  };
  return {db,tables};
}

async function addProfile(ctx,{name,character='felipe',token}){
  const now=Date.now();
  const profileId=await ctx.db.insert('profiles',{profileName:name,displayName:name,passwordHash:'set',passwordVersion:1,
    selectedCharacterId:character,createdAt:now,updatedAt:now});
  await ctx.db.insert('profileSessions',{profileId,tokenHash:await sessionTokenHash(token),createdAt:now,expiresAt:now+60_000});
  return profileId;
}

const TOKEN_A='profile-a-token-abcdefghijklmnopqrstuvwxyz-123456';
const TOKEN_B='profile-b-token-abcdefghijklmnopqrstuvwxyz-123456';

test('boss progress belongs to a profile, survives character changes, and is isolated',async()=>{
  const ctx=memoryContext();const profileA=await addProfile(ctx,{name:'felipe',token:TOKEN_A});
  await addProfile(ctx,{name:'other',character:'michael',token:TOKEN_B});
  const victoryId='victory-profile-a-00000001';
  const won=await boss.recordVictory._handler(ctx,{token:TOKEN_A,bossId:DIRECTOR_BOSS_ID,victoryId});
  assert.equal(won.progress.wins,1);
  await boss.chooseReward._handler(ctx,{token:TOKEN_A,bossId:DIRECTOR_BOSS_ID,rewardId:BOSS_REWARDS.REMASTERED_SKIN});
  await ctx.db.patch(profileA,{selectedCharacterId:'sarina'});
  const switched=await boss.get._handler(ctx,{token:TOKEN_A,bossId:DIRECTOR_BOSS_ID});
  assert.equal(switched.wins,1);assert.deepEqual(switched.rewards,[BOSS_REWARDS.REMASTERED_SKIN]);
  assert.equal((await boss.get._handler(ctx,{token:TOKEN_B,bossId:DIRECTOR_BOSS_ID,profileId:profileA,characterId:'sarina'})),null);
  const duplicate=await boss.recordVictory._handler(ctx,{token:TOKEN_A,bossId:DIRECTOR_BOSS_ID,victoryId});
  assert.equal(duplicate.duplicate,true);assert.equal(duplicate.progress.wins,1);
  assert.equal(ctx.tables.players.length,0,'persistent reads must not require presence');
});

test('profile items stay owned across characters but activation enforces visual compatibility',async()=>{
  const ctx=memoryContext();const profileA=await addProfile(ctx,{name:'michael',character:'michael',token:TOKEN_A});
  await addProfile(ctx,{name:'other',character:'felipe',token:TOKEN_B});
  const itemId=CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000;
  await items.claim._handler(ctx,{token:TOKEN_A,itemId});
  const sessionId='active-session-123456789',playerId='live-player-a';
  const playerRow=await ctx.db.insert('players',{profileId:profileA,playerId,sessionId,characterId:'sarina',characterBaseId:'sarina',lastSeen:Date.now(),room:'school'});
  const auth={token:TOKEN_A,playerId,sessionId};
  await ctx.db.patch(profileA,{selectedCharacterId:'sarina'});
  assert.equal((await items.forProfile._handler(ctx,auth)).length,1);
  await assert.rejects(items.setActive._handler(ctx,{...auth,itemId,active:true}),/cannot use/);
  await assert.rejects(items.forProfile._handler(ctx,{...auth,token:TOKEN_B}),/CHARACTER_SESSION_LOST/);
  await ctx.db.patch(profileA,{selectedCharacterId:'michael'});
  await ctx.db.patch(playerRow,{characterId:'michael',characterBaseId:'michael'});
  const active=await items.setActive._handler(ctx,{...auth,itemId,active:true});
  assert.equal(active.active,true);
});

test('DEV clear deletes only the active profile potion stack and rejects stale sessions',async()=>{
  const previous=process.env.DEV_TOOLS_ENABLED;process.env.DEV_TOOLS_ENABLED='true';
  try{
    const ctx=memoryContext();const profileA=await addProfile(ctx,{name:'michael',character:'michael',token:TOKEN_A});
    await addProfile(ctx,{name:'other',character:'sarina',token:TOKEN_B});
    await items.claim._handler(ctx,{token:TOKEN_A,itemId:CHARACTER_ITEM_IDS.HEALTH_POTION});
    await items.claim._handler(ctx,{token:TOKEN_A,itemId:CHARACTER_ITEM_IDS.HEALTH_POTION});
    await items.claim._handler(ctx,{token:TOKEN_A,itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000});
    await items.claim._handler(ctx,{token:TOKEN_B,itemId:CHARACTER_ITEM_IDS.HEALTH_POTION});
    const playerId='live-dev-player',sessionId='active-dev-session-123456';
    await ctx.db.insert('players',{profileId:profileA,playerId,sessionId,characterId:'michael',characterBaseId:'michael',lastSeen:Date.now(),room:'school'});
    await assert.rejects(items.devClearPotions._handler(ctx,{token:TOKEN_A,playerId,sessionId:'stale-dev-session-123456'}),/CHARACTER_SESSION_LOST/);
    assert.equal((await items.devClearPotions._handler(ctx,{token:TOKEN_A,playerId,sessionId})).removed,2);
    assert.deepEqual(ctx.tables.characterItems.map(item=>[item.profileId,item.itemId]),[
      [profileA,CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000],
      [ctx.tables.profiles[1]._id,CHARACTER_ITEM_IDS.HEALTH_POTION],
    ]);
    assert.equal((await items.devClearPotions._handler(ctx,{token:TOKEN_A,playerId,sessionId})).removed,0);
  }finally{
    if(previous===undefined)delete process.env.DEV_TOOLS_ENABLED;
    else process.env.DEV_TOOLS_ENABLED=previous;
  }
});

test('Mysterious Man grants three shared potions atomically and respects the stack cap and live session',async()=>{
  const ctx=memoryContext();const profileId=await addProfile(ctx,{name:'felipe',token:TOKEN_A});
  const playerId='live-koetting-player',sessionId='koetting-session-123456789';
  const rowId=await ctx.db.insert('players',{profileId,playerId,sessionId,characterId:'felipe',
    characterBaseId:'felipe',lastSeen:Date.now(),room:'secret-path'});
  const args={token:TOKEN_A,playerId,sessionId,amount:3};
  const first=await items.claimKoettingPotions._handler(ctx,args);
  assert.deepEqual([first.added,first.item.quantity],[3,3]);
  await ctx.db.patch(profileId,{selectedCharacterId:'sarina'});
  await ctx.db.patch(rowId,{characterId:'sarina',characterBaseId:'sarina'});
  const second=await items.claimKoettingPotions._handler(ctx,args);
  assert.deepEqual([second.added,second.item.quantity],[3,6]);
  await items.claimKoettingPotions._handler(ctx,args);
  const capped=await items.claimKoettingPotions._handler(ctx,args);
  assert.deepEqual([capped.added,capped.item.quantity],[1,10]);
  assert.equal((await items.claimKoettingPotions._handler(ctx,args)).added,0);
  assert.equal(ctx.tables.characterItems.length,1);
  await assert.rejects(items.claimKoettingPotions._handler(ctx,{...args,sessionId:'stale-session-123456789'}),/CHARACTER_SESSION_LOST/);
  await assert.rejects(items.claimKoettingPotions._handler(ctx,{...args,amount:4}),/Invalid potion reward amount/);
});

test('presence cleanup and logout do not erase profile-owned progress',async()=>{
  const ctx=memoryContext();const profileId=await addProfile(ctx,{name:'felipe',token:TOKEN_A});
  await boss.recordVictory._handler(ctx,{token:TOKEN_A,bossId:DIRECTOR_BOSS_ID,victoryId:'victory-persistent-000001'});
  ctx.tables.players.length=0;
  ctx.tables.profileSessions.length=0;
  assert.equal(ctx.tables.bossProgress.length,1);
  await assert.rejects(boss.get._handler(ctx,{token:TOKEN_A}),/SESSION_INVALID/);
  const now=Date.now();await ctx.db.insert('profileSessions',{profileId,tokenHash:await sessionTokenHash(TOKEN_B),createdAt:now,expiresAt:now+60_000});
  assert.equal((await boss.get._handler(ctx,{token:TOKEN_B})).wins,1);
});

test('legacy migration is explicit and refuses an unproven or conflicting owner',async()=>{
  const ctx=memoryContext();const wrong=await ctx.db.insert('profiles',{profileName:'other',displayName:'Other',passwordHash:'set',
    selectedCharacterId:'felipe',createdAt:1,updatedAt:1});
  await ctx.db.insert('bossProgress',{characterId:'felipe',bossId:DIRECTOR_BOSS_ID,wins:2,defeated:true,rewards:[],equippedSkin:'classic',updatedAt:1});
  await assert.rejects(attachLegacyCharacterData._handler(ctx,{profileId:wrong,characterId:'felipe'}),/cannot be proven/);
  assert.equal(ctx.tables.bossProgress[0].profileId,undefined);
  const correct=await ctx.db.insert('profiles',{profileName:'felipe',displayName:'Felipe',passwordHash:'set',
    selectedCharacterId:'sarina',createdAt:1,updatedAt:1});
  const migrated=await attachLegacyCharacterData._handler(ctx,{profileId:correct,characterId:'felipe'});
  assert.equal(migrated.bossProgress,1);assert.equal(ctx.tables.bossProgress[0].profileId,correct);
  await ctx.db.insert('bossProgress',{characterId:'felipe',bossId:'other',wins:1,defeated:true,rewards:[],updatedAt:2});
  await assert.rejects(attachLegacyCharacterData._handler(ctx,{profileId:correct,characterId:'felipe'}),/merge manually/);
});
