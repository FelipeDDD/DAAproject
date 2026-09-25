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

function memoryContext(){
  const tables={
    players:[],profiles:[],profileSessions:[],profileLoginAttempts:[],bossProgress:[],characterItems:[],
    quizPerformance:[],itChallengeHighScores:[],quizQuestionHistory:[],quizAttempts:[],
  };let nextId=1;
  const query=table=>({
    collect:async()=>[...tables[table]],
    withIndex:(_name,build)=>{
      let operation='eq',field,value;
      const queryBuilder={
        eq(candidate,nextValue){operation='eq';field=candidate;value=nextValue;return queryBuilder;},
        lt(candidate,nextValue){operation='lt';field=candidate;value=nextValue;return queryBuilder;},
      };
      build(queryBuilder);
      const matching=()=>tables[table].filter(row=>operation==='lt'?row[field]<value:row[field]===value);
      return {unique:async()=>matching()[0]??null,first:async()=>matching()[0]??null,
        collect:async()=>matching(),take:async count=>matching().slice(0,count)};
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
