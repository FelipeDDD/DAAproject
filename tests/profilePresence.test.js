import assert from 'node:assert/strict';
import test from 'node:test';
import { getFunctionName } from 'convex/server';
import { availability,claim,claimGuest,cleanup,release,update } from '../convex/players.js';
import * as store from '../convex/profileStore.js';
import { claimCharacter,login,logout,me,register } from '../convex/profiles.js';
import { requireAuthenticatedPlayer } from '../convex/playerSessions.js';
import { get as getBossProgress } from '../convex/bossProgress.js';
import { forProfile as getCharacterItems } from '../convex/characterItems.js';
import { normalizeBossProgress } from '../src/boss/BossRewards.js';
import { inventoryItemsFromSources,inventorySlots } from '../src/inventory/config.js';
import { CHARACTERS } from '../src/characters.js';
import { PRESENCE_TIMEOUT_MS,isPlayerActive } from '../src/multiplayer/presencePolicy.js';
import { heartbeat } from '../convex/players.js';

test('shared expiry handles legacy, playing and terminal rows at exact boundaries',()=>{
  for(const presenceMode of [undefined,'playing']){
    assert.equal(isPlayerActive({presenceMode,lastSeen:1},60_000),true);
    assert.equal(isPlayerActive({presenceMode,lastSeen:1},60_001),false);
  }
  assert.equal(isPlayerActive({presenceMode:'terminal',lastSeen:0,terminalLeaseExpiresAt:600_000},599_999),true);
  assert.equal(isPlayerActive({presenceMode:'terminal',lastSeen:599_999,terminalLeaseExpiresAt:600_000},600_000),false);
  assert.equal(isPlayerActive({presenceMode:'terminal',lastSeen:599_999},600_000),false);
});

test('stationary expiry uses only a finite lease deadline, independent of lastSeen',()=>{
  for(const stationaryLeaseExpiresAt of [undefined,NaN,Infinity,-Infinity,100_000]){
    assert.equal(isPlayerActive({presenceMode:'stationary',lastSeen:100_000,stationaryLeaseExpiresAt},100_000),false);
  }
  assert.equal(isPlayerActive({presenceMode:'stationary',lastSeen:0,stationaryLeaseExpiresAt:100_001},100_000),true);
});

test('stationary availability, validation, GC and guest reclaim share the lease boundary',async t=>{
  let now=100_000;t.mock.method(Date,'now',()=>now);
  const ctx=memoryContext();
  const original={guestId:'guest-original-identity-123456',characterId:'felipe',sessionId:'original-session-123456'};
  await claimGuest._handler(ctx,original);
  const row=ctx.tables.players[0];Object.assign(row,{presenceMode:'stationary',lastSeen:0,stationaryLeaseExpiresAt:200_000});
  const replacement={...original,guestId:'guest-other-identity-123456',sessionId:'replacement-session-123456'};
  const available=(await availability._handler(ctx)).find(r=>r.characterId==='felipe');
  assert.equal(available.active,true);assert.equal(available.stationaryLeaseExpiresAt,200_000);
  assert.equal((await claimGuest._handler(ctx,replacement)).ok,false);
  await cleanup._handler(ctx);assert.equal(ctx.tables.players.length,1);
  await assert.rejects(requireAuthenticatedPlayer(ctx,row.characterId,row.sessionId),/PROFILE_REQUIRED/);
  const args={playerId:'felipe',characterId:'felipe',sessionId:row.sessionId,name:'Felipe',room:'school',x:1,y:2,direction:'down'};
  await heartbeat._handler(ctx,original);
  assert.equal(row.presenceMode,'stationary');assert.equal(row.stationaryLeaseExpiresAt,200_000);
  now=200_000;
  assert.equal((await availability._handler(ctx)).find(r=>r.characterId==='felipe').active,false);
  await assert.rejects(heartbeat._handler(ctx,original),/CHARACTER_SESSION_LOST/);
  await assert.rejects(update._handler(ctx,args),/CHARACTER_SESSION_LOST/);
  assert.equal(row.lastSeen,0);assert.equal(row.stationaryLeaseExpiresAt,200_000);
  assert.equal((await claimGuest._handler(ctx,replacement)).ok,true);
  assert.equal(row.presenceMode,'playing');assert.equal(row.stationaryLeaseExpiresAt,undefined);
  await assert.rejects(heartbeat._handler(ctx,original),/CHARACTER_SESSION_LOST/);
  assert.deepEqual(await release._handler(ctx,original),{released:false});
  Object.assign(row,{presenceMode:'stationary',lastSeen:now,stationaryLeaseExpiresAt:now});
  await cleanup._handler(ctx);assert.equal(ctx.tables.players.length,0);
});

test('profile claim clears stale stationary and terminal lease fields',async()=>{
  const ctx=memoryContext(),registered=await createAccount(ctx);
  await claimGuest._handler(ctx,{guestId:'stationary-guest-identity-123456',characterId:'felipe',sessionId:'stationary-session-123456789'});
  const row=ctx.tables.players[0];
  Object.assign(row,{presenceMode:'stationary',lastSeen:0,stationaryLeaseExpiresAt:Date.now()+60_000,terminalLeaseExpiresAt:Date.now()+60_000});
  const args={token:registered.token,characterId:'felipe',presenceSessionId:'profile-session-123456789'};
  assert.equal((await claimCharacter._handler(actionContext(ctx),args)).ok,false);
  row.stationaryLeaseExpiresAt=Date.now();
  assert.equal((await claimCharacter._handler(actionContext(ctx),args)).ok,true);
  assert.equal(row.presenceMode,'playing');assert.equal(row.stationaryLeaseExpiresAt,undefined);assert.equal(row.terminalLeaseExpiresAt,undefined);
});

test('terminal expiry governs availability, reclaim, cleanup and rejected updates',async t=>{
  let now=100_000;t.mock.method(Date,'now',()=>now);
  const ctx=memoryContext();
  const guest={guestId:'guest-original-identity-123456',characterId:'felipe',sessionId:'original-session-123456'};
  await claimGuest._handler(ctx,guest);
  const row=ctx.tables.players[0];Object.assign(row,{presenceMode:'terminal',lastSeen:0,terminalLeaseExpiresAt:200_000});
  const other={...guest,guestId:'guest-other-identity-123456',sessionId:'replacement-session-123456'};
  assert.equal((await availability._handler(ctx,{})).find(r=>r.characterId==='felipe').active,true);
  assert.equal((await claimGuest._handler(ctx,other)).ok,false);
  await cleanup._handler(ctx);assert.equal(ctx.tables.players.length,1);
  await assert.rejects(requireAuthenticatedPlayer(ctx,row.characterId,row.sessionId),/PROFILE_REQUIRED/);
  now=200_000;
  assert.equal((await availability._handler(ctx,{})).find(r=>r.characterId==='felipe').active,false);
  await assert.rejects(heartbeat._handler(ctx,{characterId:row.characterId,sessionId:row.sessionId}),/CHARACTER_SESSION_LOST/);
  await assert.rejects(update._handler(ctx,{playerId:'felipe',characterId:'felipe',sessionId:row.sessionId,name:'Felipe',room:'school',x:1,y:2,direction:'down'}),/CHARACTER_SESSION_LOST/);
  assert.equal(row.lastSeen,0);assert.equal(row.terminalLeaseExpiresAt,200_000);
  assert.equal((await claimGuest._handler(ctx,other)).ok,true);
  assert.equal(row.presenceMode,'playing');assert.equal(row.terminalLeaseExpiresAt,undefined);
  Object.assign(row,{presenceMode:'terminal',lastSeen:now,terminalLeaseExpiresAt:now});
  await cleanup._handler(ctx);assert.equal(ctx.tables.players.length,0);
});

test('profile claims respect terminal lease expiry and clear the reclaimed lease',async()=>{
  const ctx=memoryContext(),registered=await createAccount(ctx);
  const guest={guestId:'terminal-guest-identity-123456',characterId:'felipe',sessionId:'terminal-session-123456789'};
  await claimGuest._handler(ctx,guest);
  const row=ctx.tables.players[0];Object.assign(row,{presenceMode:'terminal',lastSeen:0,terminalLeaseExpiresAt:Date.now()+60_000});
  const args={token:registered.token,characterId:'felipe',presenceSessionId:'profile-session-123456789'};
  assert.equal((await claimCharacter._handler(actionContext(ctx),args)).ok,false);
  row.terminalLeaseExpiresAt=Date.now();
  assert.equal((await claimCharacter._handler(actionContext(ctx),args)).ok,true);
  assert.equal(row.presenceMode,'playing');assert.equal(row.terminalLeaseExpiresAt,undefined);
});

test('profile and guest claims reclaim stale rows without cleanup',async()=>{
  const ctx=memoryContext();const registered=await createAccount(ctx);
  const guest={guestId:'guest-temporary-identity-123456',characterId:'felipe',sessionId:'guest-session-123456789'};
  await claimGuest._handler(ctx,guest);
  const row=ctx.tables.players[0],rowId=row._id;
  const profileClaim={token:registered.token,characterId:'felipe',presenceSessionId:'profile-session-123456789'};
  assert.equal((await claimCharacter._handler(actionContext(ctx),profileClaim)).ok,false);
  row.lastSeen=Date.now()-PRESENCE_TIMEOUT_MS;
  assert.equal((await claimCharacter._handler(actionContext(ctx),profileClaim)).ok,true);
  assert.equal(ctx.tables.players.length,1);assert.equal(row._id,rowId);
  assert.equal(row.sessionId,profileClaim.presenceSessionId);
  assert.equal((await claimGuest._handler(ctx,guest)).ok,false);
  row.lastSeen=Date.now()-PRESENCE_TIMEOUT_MS;
  assert.equal((await claimGuest._handler(ctx,guest)).ok,true);
  assert.equal(ctx.tables.players.length,1);assert.equal(row._id,rowId);
  assert.equal(row.sessionId,guest.sessionId);
});

test('same-owner takeover is preserved and delayed release cannot delete the new reservation',async()=>{
  const ctx=memoryContext();const registered=await createAccount(ctx);
  const initial={token:registered.token,characterId:'felipe',presenceSessionId:'profile-session-123456789'};
  await claimCharacter._handler(actionContext(ctx),initial);
  const replacement={...initial,presenceSessionId:'profile-session-987654321'};
  assert.equal((await claimCharacter._handler(actionContext(ctx),replacement)).ok,true);
  assert.deepEqual(await release._handler(ctx,{characterId:'felipe',sessionId:initial.presenceSessionId}),{released:false});
  assert.equal(ctx.tables.players[0].sessionId,replacement.presenceSessionId);
  assert.deepEqual(await release._handler(ctx,{characterId:'felipe',sessionId:replacement.presenceSessionId}),{released:true});
  const guest={guestId:'guest-temporary-identity-123456',characterId:'felipe',sessionId:'guest-session-123456789'};
  await claimGuest._handler(ctx,guest);
  assert.equal((await claimGuest._handler(ctx,{...guest,sessionId:'guest-session-987654321'})).ok,true);
  assert.deepEqual(await release._handler(ctx,{characterId:'felipe',sessionId:guest.sessionId}),{released:false});
  assert.equal(ctx.tables.players.length,1);
});

function memoryContext(){
  const tables={
    players:[],profiles:[],profileSessions:[],profileLoginAttempts:[],bossProgress:[],characterItems:[],
    quizPerformance:[],itChallengeHighScores:[],quizQuestionHistory:[],quizAttempts:[],
  };let nextId=1;
  const query=table=>({
    collect:async()=>[...tables[table]],
    withIndex:(_name,build)=>{
      const conditions=[];
      const queryBuilder={
        eq(field,value){conditions.push(row=>row[field]===value);return queryBuilder;},
        lt(field,value){conditions.push(row=>row[field]<value);return queryBuilder;},
        lte(field,value){conditions.push(row=>row[field]===undefined||row[field]<=value);return queryBuilder;},
      };
      build(queryBuilder);
      const matching=()=>tables[table].filter(row=>conditions.every(condition=>condition(row)));
      const result={unique:async()=>matching()[0]??null,first:async()=>matching()[0]??null,
        collect:async()=>matching(),take:async count=>matching().slice(0,count)};
      result.filter=buildFilter=>{conditions.push(buildFilter({field:key=>key,neq:(key,value)=>row=>row[key]!==value,
        and:(...predicates)=>row=>predicates.every(predicate=>predicate(row))}));return result;};
      return result;
    },
  });
  const db={query,
    async get(id){return Object.values(tables).flat().find(row=>row._id===id)??null;},
    async insert(table,value){const id=`${table}-${nextId++}`;tables[table].push({_id:id,...value});return id;},
    async patch(id,value){const row=await db.get(id);if(row)Object.assign(row,value);},
    async delete(id){for(const rows of Object.values(tables)){const index=rows.findIndex(row=>row._id===id);if(index>=0){rows.splice(index,1);return;}}},
  };
  return {db,tables,transaction:Promise.resolve()};
}

function actionContext(ctx){
  return {
    runQuery:async(reference,args)=>{
      const name=getFunctionName(reference);
      if(name==='profileStore:loginRecord')return store.loginRecord._handler(ctx,args);
      if(name==='profileStore:sessionProfile')return store.sessionProfile._handler(ctx,args);
      throw new Error(`Unexpected query ${name}`);
    },
    runMutation:async(reference,args)=>{
      const name=getFunctionName(reference);
      const handlers={
        'profileStore:register':store.register,'profileStore:beginLogin':store.beginLogin,
        'profileStore:recordLoginFailure':store.recordLoginFailure,'profileStore:completeLogin':store.completeLogin,
        'profileStore:logout':store.logout,'players:claim':claim,
      };
      const handler=handlers[name];if(!handler)throw new Error(`Unexpected mutation ${name}`);
      if(name!=='profileStore:register')return handler._handler(ctx,args);
      const run=ctx.transaction.then(()=>handler._handler(ctx,args));
      ctx.transaction=run.catch(()=>{});return run;
    },
  };
}

async function createAccount(ctx,profileName='Felipe',characterId='felipe'){
  return register._handler(actionContext(ctx),{profileName,password:'correct horse',selectedCharacterId:characterId});
}

test('registration normalizes names, hashes passwords and returns no secret fields',async()=>{
  const ctx=memoryContext();
  const result=await createAccount(ctx,'  Felipe  ');
  assert.equal(ctx.tables.profiles[0].profileName,'felipe');
  assert.match(ctx.tables.profiles[0].passwordHash,/^scrypt\$v1\$/);
  assert.ok(!ctx.tables.profiles[0].passwordHash.includes('correct horse'));
  assert.equal(result.profile.passwordHash,undefined);
  assert.equal(result.profile.passwordVersion,undefined);
  assert.doesNotMatch(JSON.stringify(result),/passwordHash|tokenHash|salt/i);
  assert.ok(result.token.length>=32);
  assert.notEqual(ctx.tables.profileSessions[0].tokenHash,result.token);
});

test('a newly registered profile starts without boss progress or inventory items',async()=>{
  const ctx=memoryContext();
  const registered=await createAccount(ctx,'new_player','michael');
  const progress=await getBossProgress._handler(ctx,{token:registered.token});
  const items=await getCharacterItems._handler(ctx,{token:registered.token});
  assert.equal(progress,null);
  assert.deepEqual(normalizeBossProgress(progress),{
    characterId:'',bossId:'director',wins:0,defeated:false,rewards:[],equippedSkin:'classic',
  });
  assert.deepEqual(items,[]);
  assert.deepEqual(inventorySlots(inventoryItemsFromSources(progress,items,'michael')),
    [null,null,null,null,null,null]);
});

test('profile names are case-insensitively unique',async()=>{
  const ctx=memoryContext();await createAccount(ctx,'Felipe');
  await assert.rejects(createAccount(ctx,'felipe'),/PROFILE_EXISTS/);
  assert.equal(ctx.tables.profiles.length,1);
});

test('concurrent normalized registrations commit only one profile',async()=>{
  const ctx=memoryContext();
  const results=await Promise.allSettled([createAccount(ctx,'Felipe'),createAccount(ctx,'felipe')]);
  assert.deepEqual(results.map(result=>result.status).sort(),['fulfilled','rejected']);
  assert.equal(ctx.tables.profiles.length,1);
});

test('correct password authenticates while a wrong password returns one generic error',async()=>{
  const ctx=memoryContext();await createAccount(ctx);
  const authenticated=await login._handler(actionContext(ctx),{profileName:'FELIPE',password:'correct horse'});
  assert.equal(authenticated.profile.profileName,'felipe');
  await assert.rejects(login._handler(actionContext(ctx),{
    profileName:'felipe',password:'wrong password',
  }),/INVALID_CREDENTIALS/);
});

test('wrong and nonexistent credentials expose the same public error',async()=>{
  const ctx=memoryContext();await createAccount(ctx);
  const errors=[];
  for(const profileName of ['felipe','missing']){
    try{await login._handler(actionContext(ctx),{profileName,password:'wrong password'});}
    catch(error){errors.push(error.message);}
  }
  assert.deepEqual(errors,['INVALID_CREDENTIALS','INVALID_CREDENTIALS']);
});

test('five failures block login for fifteen minutes, then a valid login resets failures',async()=>{
  const ctx=memoryContext();await createAccount(ctx);
  const realNow=Date.now,start=2_000_000_000_000;Date.now=()=>start;
  try{
    for(let index=0;index<5;index++)await assert.rejects(login._handler(actionContext(ctx),{
      profileName:'felipe',password:'wrong password',
    }),/INVALID_CREDENTIALS/);
    assert.equal(ctx.tables.profileLoginAttempts[0].failures,5);
    await assert.rejects(login._handler(actionContext(ctx),{
      profileName:'felipe',password:'correct horse',
    }),/INVALID_CREDENTIALS/);
    Date.now=()=>start+15*60*1000+1;
    const result=await login._handler(actionContext(ctx),{profileName:'felipe',password:'correct horse'});
    assert.equal(result.profile.profileName,'felipe');
    assert.equal(ctx.tables.profileLoginAttempts.length,0);
  }finally{Date.now=realNow;}
});

test('valid sessions restore only public profile data and logout invalidates them',async()=>{
  const ctx=memoryContext();const registered=await createAccount(ctx);
  const restored=await me._handler(actionContext(ctx),{token:registered.token});
  assert.equal(restored.profileId,registered.profile.profileId);
  assert.equal(restored.passwordHash,undefined);
  assert.equal(await me._handler(actionContext(ctx),{token:'invalid-token-that-is-long-enough-123'}),null);
  await logout._handler(actionContext(ctx),{token:registered.token});
  assert.equal(await me._handler(actionContext(ctx),{token:registered.token}),null);
  assert.equal(ctx.tables.profiles.length,1);
});

test('logout invalidates only its current token and leaves another profile session valid',async()=>{
  const ctx=memoryContext();const first=await createAccount(ctx);
  const second=await login._handler(actionContext(ctx),{profileName:'felipe',password:'correct horse'});
  await logout._handler(actionContext(ctx),{token:first.token});
  assert.equal(await me._handler(actionContext(ctx),{token:first.token}),null);
  assert.equal((await me._handler(actionContext(ctx),{token:second.token})).profileName,'felipe');
});

test('expired sessions fail validation and are removed by session cleanup',async()=>{
  const ctx=memoryContext();const registered=await createAccount(ctx);
  ctx.tables.profileSessions[0].expiresAt=0;
  assert.equal(await me._handler(actionContext(ctx),{token:registered.token}),null);
  await store.cleanupSessions._handler(ctx);
  assert.equal(ctx.tables.profileSessions.length,0);assert.equal(ctx.tables.profiles.length,1);
});

test('authenticated character changes preserve session and replace only presence',async()=>{
  const ctx=memoryContext();const registered=await createAccount(ctx);
  const actions=actionContext(ctx);
  await claimCharacter._handler(actions,{
    token:registered.token,characterId:'felipe',presenceSessionId:'presence-session-123456',
  });
  await claimCharacter._handler(actions,{
    token:registered.token,characterId:'sarina',presenceSessionId:'presence-session-123456',
  });
  assert.deepEqual(ctx.tables.players.map(row=>row.characterId),['sarina']);
  assert.equal(ctx.tables.profileSessions.length,1);
  assert.equal(ctx.tables.profiles[0].selectedCharacterId,'sarina');
});

test('explicit presence release updates availability without deleting profile or login session',async()=>{
  const ctx=memoryContext();const registered=await createAccount(ctx);
  await claimCharacter._handler(actionContext(ctx),{
    token:registered.token,characterId:'felipe',presenceSessionId:'presence-session-123456',
  });
  assert.equal((await availability._handler(ctx)).find(row=>row.characterId==='felipe').active,true);
  await release._handler(ctx,{characterId:'felipe',sessionId:'presence-session-123456'});
  assert.equal((await availability._handler(ctx)).find(row=>row.characterId==='felipe').active,false);
  assert.equal(ctx.tables.profiles.length,1);assert.equal(ctx.tables.profileSessions.length,1);
});

test('guest presence uses a temporary identity without creating a profile',async()=>{
  const ctx=memoryContext();
  const result=await claimGuest._handler(ctx,{
    guestId:'guest-temporary-identity-123456',characterId:'felipe',sessionId:'guest-presence-session-123456',
  });
  assert.equal(result.ok,true);
  assert.equal(ctx.tables.profiles.length,0);assert.equal(ctx.tables.profileSessions.length,0);
  assert.equal(ctx.tables.players[0].identityKind,'guest');
  assert.equal(ctx.tables.players[0].guestId,'guest-temporary-identity-123456');
  assert.equal(ctx.tables.players[0].equippedSkin,'classic');
  assert.equal(ctx.tables.players[0].activeCharacterItem,null);
  assert.equal(ctx.tables.bossProgress.length,0);
  assert.equal(ctx.tables.characterItems.length,0);
  await update._handler(ctx,{
    playerId:'felipe',characterId:'felipe',sessionId:'guest-presence-session-123456',name:'Forged',
    room:'school',x:12,y:34,direction:'right',activeCharacterItem:null,profileId:'forged-profile',
  });
  assert.equal(ctx.tables.players[0].profileId,undefined);
  assert.equal(ctx.tables.players[0].name,'Felipe');
});

test('ten guests can occupy distinct slots even when character art is shared',async()=>{
  const ctx=memoryContext();
  for(const [index,character] of CHARACTERS.entries()){
    const result=await claimGuest._handler(ctx,{
      guestId:`guest-temporary-identity-${index.toString().padStart(6,'0')}`,
      characterId:character.id,sessionId:`guest-presence-session-${index.toString().padStart(6,'0')}`,
    });
    assert.equal(result.ok,true);
  }
  assert.equal(ctx.tables.players.length,10);
  assert.equal((await availability._handler(ctx)).filter(row=>row.active).length,10);
  assert.equal((await claimGuest._handler(ctx,{
    guestId:'guest-temporary-identity-999999',characterId:'michael-2',
    sessionId:'guest-presence-session-999999',
  })).ok,false);
  await update._handler(ctx,{
    playerId:'michael-2',characterId:'michael-2',sessionId:'guest-presence-session-000004',
    name:'Forged',room:'school',x:12,y:34,direction:'right',activeCharacterItem:null,
  });
  assert.equal(ctx.tables.players.find(row=>row.characterId==='michael-2').name,'Michael 2');
});

test('legacy presence without an active item remains compatible during deployment',async()=>{
  const ctx=memoryContext();
  await claimGuest._handler(ctx,{
    guestId:'guest-temporary-identity-123456',characterId:'felipe',sessionId:'guest-presence-session-123456',
  });
  delete ctx.tables.players[0].activeCharacterItem;
  await update._handler(ctx,{
    playerId:'felipe',characterId:'felipe',sessionId:'guest-presence-session-123456',name:'Felipe',
    room:'school',x:12,y:34,direction:'right',
  });
  assert.equal(ctx.tables.players[0].activeCharacterItem,null);
});

test('guest character changes release the old reservation immediately',async()=>{
  const ctx=memoryContext();const guestId='guest-temporary-identity-123456',sessionId='guest-presence-session-123456';
  await claimGuest._handler(ctx,{guestId,characterId:'felipe',sessionId});
  await release._handler(ctx,{characterId:'felipe',sessionId});
  await claimGuest._handler(ctx,{guestId,characterId:'sarina',sessionId});
  assert.deepEqual(ctx.tables.players.map(row=>row.characterId),['sarina']);
  assert.equal((await availability._handler(ctx)).find(row=>row.characterId==='felipe').active,false);
});

test('guest presence cannot authorize persistent profile operations',async()=>{
  const ctx=memoryContext();
  await claimGuest._handler(ctx,{
    guestId:'guest-temporary-identity-123456',characterId:'michael',sessionId:'guest-presence-session-123456',
  });
  await assert.rejects(requireAuthenticatedPlayer(
    ctx,'michael','guest-presence-session-123456','selection',
  ),/PROFILE_REQUIRED/);
});

test('full logout removes both presence and authenticated session but retains profile',async()=>{
  const ctx=memoryContext();const registered=await createAccount(ctx);
  await claimCharacter._handler(actionContext(ctx),{
    token:registered.token,characterId:'felipe',presenceSessionId:'presence-session-123456',
  });
  await release._handler(ctx,{characterId:'felipe',sessionId:'presence-session-123456'});
  await logout._handler(actionContext(ctx),{token:registered.token});
  assert.equal(ctx.tables.players.length,0);assert.equal(ctx.tables.profileSessions.length,0);
  assert.equal(ctx.tables.profiles.length,1);
});

test('abandoned presence cleanup never removes profiles',async()=>{
  const ctx=memoryContext();const registered=await createAccount(ctx);
  await claimCharacter._handler(actionContext(ctx),{
    token:registered.token,characterId:'felipe',presenceSessionId:'presence-session-123456',
  });
  ctx.tables.players[0].lastSeen=0;
  await cleanup._handler(ctx);
  assert.equal(ctx.tables.players.length,0);assert.equal(ctx.tables.profiles.length,1);
});

test('a profile id alone cannot claim a character without a valid bearer token',async()=>{
  const ctx=memoryContext();const registered=await createAccount(ctx);
  await assert.rejects(claimCharacter._handler(actionContext(ctx),{
    token:`forged-${registered.profile.profileId}-token-value`,characterId:'felipe',
    presenceSessionId:'presence-session-123456',profileId:registered.profile.profileId,
  }),/SESSION_INVALID/);
  assert.equal(ctx.tables.players.length,0);
});

test('empty legacy automatic profiles are preserved and can be upgraded during registration',async()=>{
  const ctx=memoryContext();
  const id=await ctx.db.insert('profiles',{
    profileName:'felipe',displayName:'Felipe',selectedCharacterId:'felipe',createdAt:1,updatedAt:1,
  });
  const result=await createAccount(ctx,'Felipe');
  assert.equal(result.profile.profileId,id);assert.equal(ctx.tables.profiles.length,1);
  assert.ok(ctx.tables.profiles[0].passwordHash);
});

test('legacy profiles with persistent character data require administrative conversion',async()=>{
  const ctx=memoryContext();
  const id=await ctx.db.insert('profiles',{
    profileName:'felipe',displayName:'Felipe',selectedCharacterId:'felipe',createdAt:1,updatedAt:1,
  });
  await ctx.db.insert('characterItems',{characterId:'felipe',itemId:'important-item'});
  await assert.rejects(createAccount(ctx,'Felipe'),/PROFILE_EXISTS/);
  assert.equal(ctx.tables.profiles[0]._id,id);assert.equal(ctx.tables.profiles[0].passwordHash,undefined);
});

test('legacy profiles with profile-owned progress or items cannot be registered as fresh accounts',async()=>{
  for(const [table,data] of [
    ['bossProgress',{characterId:'felipe',bossId:'director',wins:1,rewards:['director_access_badge']}],
    ['characterItems',{characterId:'felipe',itemId:'lung_crusher_3000'}],
  ]){
    const ctx=memoryContext();
    const id=await ctx.db.insert('profiles',{
      profileName:'felipe',displayName:'Felipe',selectedCharacterId:'felipe',createdAt:1,updatedAt:1,
    });
    await ctx.db.insert(table,{profileId:id,...data});
    await assert.rejects(createAccount(ctx,'Felipe'),/PROFILE_EXISTS/);
    assert.equal(ctx.tables.profiles[0].passwordHash,undefined);
    assert.equal(ctx.tables.profileSessions.length,0);
  }
});
