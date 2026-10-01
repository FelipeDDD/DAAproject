import test from 'node:test';
import assert from 'node:assert/strict';
import { NpcProximityDialogue, BEGGAR_LINES, BEGGAR_PROXIMITY, proximityBand } from '../src/npc/beggarDialogue.js';
import { chooseCollectibleSpawn, CIGARETTE_QUEST } from '../src/npc/cigaretteQuest.js';
import { collectQuestPack, findQuest, grantQuestCollection, handInQuestPack, resetQuestCollection, setDevFreeCollect, startQuest } from '../convex/npcCollectibleQuestStore.js';
import * as quests from '../convex/npcQuests.js';
import { claim } from '../convex/characterItems.js';
import { sessionTokenHash } from '../convex/profileStore.js';
import { BeggarInteraction } from '../src/npc/BeggarInteraction.js';
import { CollectibleQuestController } from '../src/npc/CollectibleQuestController.js';
import { CIGARETTE_SPAWNS } from '../convex/npcCollectibleSpawns.generated.js';
import { CIGARETTE_PACKS,questInventoryItemId } from '../src/npc/cigarettePacks.js';
import { readFileSync } from 'node:fs';
import {readNamedMapMarker} from '../src/maps/namedMapMarkers.js';

const spawns = [{id:'test-a', markerName:'cigarette-spawn-a', room:'outside', x:100, y:100},
  {id:'test-b', markerName:'cigarette-spawn-b', room:'office3', x:200, y:200}];

async function harness() {
  const tables = {profiles:[], profileSessions:[], players:[], npcCollectibleQuests:[], characterItems:[]};
  let sequence = 0;
  const db = {
    async get(id) {return Object.values(tables).flat().find(row => row._id === id) ?? null;},
    async insert(table, value) {const id = `${table}-${++sequence}`;tables[table].push({_id:id, ...value});return id;},
    async patch(id, values) {const row = await db.get(id);for (const [key,value] of Object.entries(values)) {
      if (value === undefined) delete row[key];else row[key] = value;
    }},
    async delete(id) {for (const rows of Object.values(tables)) {const index = rows.findIndex(row => row._id === id);if (index >= 0) rows.splice(index,1);}},
    query(table) {return {withIndex(name, build) {
      const filters = [], builder = {eq(key,value) {filters.push(row => row[key] === value);return builder;}};
      build(builder);
      return {async unique() {const rows = tables[table].filter(row => filters.every(filter => filter(row)));
        assert.ok(rows.length <= 1);return rows[0] ?? null;}};
    }};},
  };
  const profileId = await db.insert('profiles', {passwordHash:'test', selectedCharacterId:'felipe'});
  const token = 'beggar-test-token-abcdefghijklmnopqrstuvwxyz-123456';
  await db.insert('profileSessions',{profileId,tokenHash:await sessionTokenHash(token),expiresAt:Date.now()+100_000});
  const player = {profileId,playerId:'live-a',sessionId:'session-a',characterBaseId:'felipe',room:'outside',x:100,y:100,lastSeen:Date.now()};
  const playerRow = await db.insert('players',player);
  return {db,tables,profileId,player,playerRow,auth:{token,playerId:player.playerId,sessionId:player.sessionId}};
}

test('three exact proximity bands reserve the closest band for explicit interaction', () => {
  assert.deepEqual([0,32,64,64.1,96,96.1,192,193].map(distance => proximityBand(distance,32)),
    ['interaction','interaction','interaction','near','near','far','far','outside']);
  const dialogue = new NpcProximityDialogue({random:()=>0});
  assert.equal(dialogue.update(0,32,32),null);
  assert.ok(BEGGAR_LINES.near.includes(dialogue.update(750,80,32)));
});
test('far dialogue cooldown is longer, checks are throttled and failed rolls consume cooldown', () => {
  const dialogue = new NpcProximityDialogue({random:()=>0});
  assert.ok(dialogue.update(0,128,32));
  for (let now=750;now<12_000;now+=750) assert.equal(dialogue.update(now,128,32),null);
  assert.ok(dialogue.update(12_000,128,32));
  let rolls=0;
  const silent = new NpcProximityDialogue({random:()=>{rolls++;return .99;}});
  assert.equal(silent.update(0,80,32),null);
  for (let now=1;now<11_960;now+=751) silent.update(now,80,32);
  assert.equal(rolls,2,'failed roll does not retry every proximity tick');
  assert.ok(BEGGAR_PROXIMITY.farCooldownMs[0] > BEGGAR_PROXIMITY.nearCooldownMs[0]);
});
test('near speech prefers the owned pack pool and avoids consecutive identical lines', () => {
  const dialogue = new NpcProximityDialogue({random:()=>0});
  const first = dialogue.update(0,80,32,{hasPack:true});
  const second = dialogue.update(8000,80,32,{hasPack:true});
  assert.ok(BEGGAR_LINES.owned.includes(first));assert.ok(BEGGAR_LINES.owned.includes(second));
  assert.notEqual(first,second);
  assert.equal(dialogue.update(16_000,80,32,{enabled:false}),null);
});
test('only the current pack can be collected; collecting does not advance the quest', async () => {
  const ctx = await harness();
  const state = await startQuest(ctx,ctx.profileId,spawns);
  const spawn = spawns.find(spawn => spawn.id === state.activeSpawnId);
  Object.assign(ctx.player,{room:spawn.room,x:spawn.x,y:spawn.y});
  await assert.rejects(collectQuestPack(ctx,ctx.profileId,ctx.player,{packId:'cigarette_pack_02',spawnId:spawn.id},spawns),/NOT_CURRENT/);
  const collected = await collectQuestPack(ctx,ctx.profileId,ctx.player,{packId:state.currentPackId,spawnId:spawn.id},spawns);
  await collectQuestPack(ctx,ctx.profileId,ctx.player,{packId:state.currentPackId,spawnId:spawn.id},spawns);
  assert.equal(collected.hasPack,true);assert.equal(ctx.tables.characterItems.length,1);
  assert.equal((await findQuest(ctx,ctx.profileId)).currentPackId,'cigarette_pack_01');
  assert.deepEqual(collected.deliveredPackIds,[]);
});
test('DEV free collection mode allows any authored cigarette pack without advancing deliveries',async()=>{
  const ctx=await harness();
  let state=await setDevFreeCollect(ctx,ctx.profileId,true,CIGARETTE_SPAWNS);
  assert.equal(state.devFreeCollect,true);
  assert.deepEqual(state.freeCollectPackIds,CIGARETTE_QUEST.packIds);
  const blue=CIGARETTE_SPAWNS.find(spawn=>spawn.packId==='cigarette_pack_04');
  Object.assign(ctx.player,{room:blue.room,x:blue.x,y:blue.y});
  state=await collectQuestPack(ctx,ctx.profileId,ctx.player,{packId:blue.packId,spawnId:blue.id},CIGARETTE_SPAWNS);
  assert.deepEqual(state.freeCollectPackIds,CIGARETTE_QUEST.packIds.filter(id=>id!==blue.packId));
  assert.equal(state.currentPackId,'cigarette_pack_01');
  assert.deepEqual(state.deliveredPackIds,[]);
  await assert.rejects(collectQuestPack(ctx,ctx.profileId,ctx.player,{packId:blue.packId,spawnId:blue.id},CIGARETTE_SPAWNS),/PACK_ALREADY_OWNED/);
  state=await setDevFreeCollect(ctx,ctx.profileId,false,CIGARETTE_SPAWNS);
  assert.equal(state.devFreeCollect,false);
  assert.deepEqual(state.freeCollectPackIds,[]);
});
test('free collection displays the current map pack even when it is not the quest step',()=>{
  const blue=CIGARETTE_SPAWNS.find(spawn=>spawn.packId==='cigarette_pack_04');
  const source=JSON.parse(readFileSync(new URL('../public/assets/maps/secret-path.tmj',import.meta.url),'utf8'));
  const images=[];let mode;
  const scene={source,inventoryHotbar:{setCollectionProgress(){}},devTools:{setFreeCollectEnabled(value){mode=value;}},
    add:{image(x,y,key){const image={x,y,key,setOrigin(){return this;},setDisplaySize(){return this;},setDepth(){return this;},destroy(){}};images.push(image);return image;}}};
  const controller=Object.assign(Object.create(CollectibleQuestController.prototype),{
    scene,state:null,destroyed:false,spawns:[blue],pickups:new Map(),pickupKey:null,
  });
  controller.receive({devFreeCollect:true,freeCollectPackIds:['cigarette_pack_04'],currentPackId:'cigarette_pack_01',hasPack:false,completed:false});
  assert.equal(mode,true);assert.equal(images.length,1);assert.equal(images[0].key,CIGARETTE_PACKS[3].groundTexture);
  assert.equal(controller.pickupPackId,'cigarette_pack_04');assert.equal(controller.pickupSpawnId,blue.id);
});
test('hand-in removes once, advances one pack, survives reload and completes after four without reward', async () => {
  const ctx = await harness();
  let state = await startQuest(ctx,ctx.profileId,spawns);
  await ctx.db.insert('characterItems',{profileId:ctx.profileId,itemId:'office2_key',quantity:1,cooldownUntil:0});
  for (const packId of CIGARETTE_QUEST.packIds) {
    const previousSpawn = state.activeSpawnId;
    const spawn = spawns.find(spawn => spawn.id === previousSpawn);
    Object.assign(ctx.player,{room:spawn.room,x:spawn.x,y:spawn.y});
    await collectQuestPack(ctx,ctx.profileId,ctx.player,{packId,spawnId:spawn.id},spawns);
    ctx.player.room='outside';
    state = await handInQuestPack(ctx,ctx.profileId,ctx.player,packId,spawns);
    await assert.rejects(handInQuestPack(ctx,ctx.profileId,ctx.player,packId,spawns),/NOT_CURRENT/);
    assert.equal(ctx.tables.characterItems.some(item => item.itemId === packId),false);
    assert.deepEqual(await startQuest(ctx,ctx.profileId,spawns),state,'reload/login keeps progress');
    if (!state.completed) assert.notEqual(state.activeSpawnId,previousSpawn);
  }
  assert.equal(state.completed,true);assert.equal(state.currentPackId,null);assert.equal(state.activeSpawnId,null);
  assert.equal(state.rewardClaimed,false);assert.equal(state.deliveredPackIds.length,4);
  assert.equal(ctx.tables.characterItems.length,1,'unrelated key is preserved');
});
test('hand-in rejects unowned packs and collection validates room/position/spawn', async () => {
  const ctx=await harness();const state=await startQuest(ctx,ctx.profileId,spawns);
  await assert.rejects(handInQuestPack(ctx,ctx.profileId,ctx.player,state.currentPackId,spawns),/NOT_OWNED/);
  await assert.rejects(collectQuestPack(ctx,ctx.profileId,{...ctx.player,x:999,y:999},
    {packId:state.currentPackId,spawnId:state.activeSpawnId},spawns),/OUT_OF_RANGE/);
  await assert.rejects(collectQuestPack(ctx,ctx.profileId,ctx.player,
    {packId:state.currentPackId,spawnId:'invented'},spawns),/NOT_CURRENT/);
});
test('real mutation guards reject stale sessions, cross-profile sessions and generic inventory claims', async () => {
  const ctx=await harness();await quests.start._handler(ctx,ctx.auth);
  const progress=await quests.progress._handler(ctx,{token:ctx.auth.token});
  assert.equal(progress.currentPackId,'cigarette_pack_01');
  assert.equal(progress.activeSpawnId,CIGARETTE_SPAWNS.find(spawn=>spawn.packId==='cigarette_pack_01')?.id??null);
  await assert.rejects(quests.handIn._handler(ctx,{...ctx.auth,sessionId:'stale',packId:progress.currentPackId}),/SESSION_LOST/);
  await ctx.db.patch(ctx.playerRow,{profileId:'another-profile'});
  await assert.rejects(quests.start._handler(ctx,ctx.auth),/SESSION_LOST/);
  await ctx.db.patch(ctx.playerRow,{profileId:undefined,identityKind:'guest'});
  await assert.rejects(quests.start._handler(ctx,ctx.auth),/PROFILE_REQUIRED/);
  await assert.rejects(claim._handler(ctx,{token:ctx.auth.token,itemId:progress.currentPackId}),/quest pickup/);
  assert.equal(ctx.tables.characterItems.length,0);
});
test('missing spawns remain unplaced; other profiles start independently and invalid duplicates are ignored', async () => {
  const ctx=await harness();const a=await startQuest(ctx,ctx.profileId,[]);
  const b=await startQuest(ctx,'another-profile',[]);
  assert.equal(a.activeSpawnId,null);assert.equal(b.currentPackId,'cigarette_pack_01');
  assert.equal(ctx.tables.npcCollectibleQuests.length,2);
  assert.equal(chooseCollectibleSpawn([{},spawns[0],spawns[0]],undefined,()=>0),spawns[0].id);
  assert.equal(chooseCollectibleSpawn(spawns,'test-a',()=>0),'test-b');
});
test('NPC requires explicit action within the expanded two-tile range; proximity never submits hand-in', async () => {
  let delivered=0;
  const interaction=Object.assign(Object.create(BeggarInteraction.prototype),{
    scene:{source:{tilewidth:32},player:{body:{center:{x:0,y:0}}},time:{now:0},
      collectibleQuest:{state:{hasPack:true},async handIn(){delivered++;return {completed:false};}}},
    npc:{sprite:{x:65,y:0}},show(){},
  });
  await interaction.interact(0);assert.equal(delivered,0);
  interaction.npc.sprite.x=64;
  assert.equal(interaction.canInteract(),true);assert.equal(delivered,0);
  await interaction.interact(0);assert.equal(delivered,1);
});
test('destroying quest controller unsubscribes and late callbacks cannot recreate pickups', () => {
  let unsubscribed=0,destroyed=0;
  const controller=Object.assign(Object.create(CollectibleQuestController.prototype),{
    unsubscribe(){unsubscribed++;},pickup:{destroy(){destroyed++;}},prompt:{destroy(){destroyed++;}},
  });
  controller.destroy();controller.receive({hasPack:false});
  assert.equal(unsubscribed,1);assert.equal(destroyed,2);assert.equal(controller.state,undefined);
});

test('confirmed hand-in removes the local slot immediately and preserves other items', async () => {
  const key={itemId:'office2_key'}, pack={itemId:'cigarette_pack_01'};
  let restored=0;
  const inventory={items:[key,pack],setItems(items){this.items=items;},async restore(){restored++;}};
  const controller=Object.assign(Object.create(CollectibleQuestController.prototype),{
    state:{hasPack:true,currentPackId:pack.itemId},scene:{characterItems:inventory},
    async mutate(method,args){assert.equal(method,'handIn');assert.equal(args.packId,pack.itemId);return {hasPack:false};},
  });
  await controller.handIn();
  assert.deepEqual(inventory.items,[key]);assert.equal(restored,1);
});

test('ambient speech never interrupts an explicit hand-in line or starts when outside six tiles', () => {
  const dialogue=new NpcProximityDialogue({random:()=>0});
  const line=dialogue.say('handed',0);
  for(let now=0;now<6000;now+=750)assert.equal(dialogue.update(now,64,32,{hasPack:true}),null);
  assert.equal(dialogue.lastLine,line);
  assert.equal(dialogue.update(20_000,193,32),null);
});

test('quest controller makes one entry mutation and no backend calls during idle updates', async () => {
  const previousDocument=globalThis.document;
  globalThis.document={createElement:()=>({hidden:true,style:{},setAttribute(){},remove(){},
    classList:{toggle(){}},offsetWidth:160,offsetHeight:32}),body:{append(){}}};
  try {
    let mutations=0,subscriptions=0,unsubscribed=0;
    const scene={mapKey:'outside',source:{layers:[]},player:{body:{center:{x:0,y:0}}},
      presence:{identity:{kind:'profile',playerId:'a',sessionId:'b'},profileSessionToken:'token',
        api:{npcQuests:{progress:'progress',start:'start'}},client:{
          onUpdate(){subscriptions++;return ()=>unsubscribed++;},
          async mutation(){mutations++;return {hasPack:false,currentPackId:'cigarette_pack_01'};},
        }}};
    const controller=new CollectibleQuestController(scene);
    await new Promise(resolve=>setImmediate(resolve));
    for(let i=0;i<1000;i++)controller.update();
    assert.equal(mutations,1);assert.equal(subscriptions,1);
    controller.destroy();assert.equal(unsubscribed,1);
    const other=new CollectibleQuestController({...scene,mapKey:'unconfigured-map'});
    other.update();other.destroy();
    assert.equal(mutations,1);assert.equal(subscriptions,1,'unconfigured maps do not subscribe');
    const guest=new CollectibleQuestController({...scene,presence:{identity:{kind:'guest'}}});
    guest.update();guest.destroy();
    assert.equal(mutations,1);assert.equal(subscriptions,1,'guests do not call quest backend');
  } finally {globalThis.document=previousDocument;}
});

test('each colored pack selects only its own authored marker and remains unavailable when its marker is missing',async()=>{
  const ctx=await harness();
  const locations=spawns.map((spawn,i)=>({...spawn,packId:CIGARETTE_QUEST.packIds[i]}));
  let state=await startQuest(ctx,ctx.profileId,locations);
  assert.equal(state.activeSpawnId,'test-a');
  await collectQuestPack(ctx,ctx.profileId,ctx.player,{packId:state.currentPackId,spawnId:'test-a'},locations);
  state=await handInQuestPack(ctx,ctx.profileId,ctx.player,state.currentPackId,locations);
  assert.equal(state.currentPackId,'cigarette_pack_02');assert.equal(state.activeSpawnId,'test-b');
  Object.assign(ctx.player,{room:'office3',x:200,y:200});
  await collectQuestPack(ctx,ctx.profileId,ctx.player,{packId:state.currentPackId,spawnId:'test-b'},locations);
  ctx.player.room='outside';
  state=await handInQuestPack(ctx,ctx.profileId,ctx.player,state.currentPackId,locations);
  assert.equal(state.currentPackId,'cigarette_pack_03');assert.equal(state.activeSpawnId,null);
});

test('the existing first school pack is recognized and consumed, including duplicate early test inventory',async()=>{
  const ctx=await harness();
  for(const itemId of ['lung_crusher_3000_pack','cigarette_pack_01'])
    await ctx.db.insert('characterItems',{profileId:ctx.profileId,itemId,quantity:1,cooldownUntil:0});
  const state=await startQuest(ctx,ctx.profileId,spawns);
  assert.equal(state.hasPack,true);assert.equal(questInventoryItemId(state.currentPackId),'lung_crusher_3000_pack');
  await handInQuestPack(ctx,ctx.profileId,ctx.player,state.currentPackId,spawns);
  assert.equal(ctx.tables.characterItems.length,0);
  await assert.rejects(claim._handler(ctx,{token:ctx.auth.token,itemId:'lung_crusher_3000_pack'}),/quest pickup/);
});

test('all four packs expose the matching card/icon and small colored ground visual',()=>{
  for(const pack of CIGARETTE_PACKS){
    assert.ok(readFileSync(new URL(`../public/${pack.icon}`,import.meta.url)).length);
    assert.ok(readFileSync(new URL(`../public/${pack.card}`,import.meta.url)).length);
    assert.ok(readFileSync(new URL(`../public/${pack.groundAsset}`,import.meta.url)).length);
    assert.ok(pack.width<=10&&pack.height<=12);
  }
  assert.equal(CIGARETTE_PACKS[1].litter,true);
  assert.equal(CIGARETTE_PACKS[3].room,'secret-path');
});

test('all four authored pickups occur in the requested order and rooms, using exact Tiled coordinates',async()=>{
  assert.equal(CIGARETTE_SPAWNS.length,4);
  const expectedRooms=['school','office3','school','secret-path'];
  for(const [index,pack]of CIGARETTE_PACKS.entries()){
    const entries=CIGARETTE_SPAWNS.filter(spawn=>spawn.packId===pack.packId);
    assert.equal(entries.length,1);
    const spawn=entries[0];assert.equal(spawn.room,expectedRooms[index]);
    const file=spawn.room==='school'?'classroom':spawn.room;
    const source=JSON.parse(readFileSync(new URL(`../public/assets/maps/${file}.tmj`,import.meta.url),'utf8'));
    const marker=readNamedMapMarker(source,spawn.markerName);
    assert.deepEqual([spawn.x,spawn.y],[marker.x,marker.y]);
  }
  const ctx=await harness();let state=await startQuest(ctx,ctx.profileId,CIGARETTE_SPAWNS);
  for(const pack of CIGARETTE_PACKS){
    const spawn=CIGARETTE_SPAWNS.find(spawn=>spawn.id===state.activeSpawnId);
    assert.equal(spawn.packId,pack.packId);
    Object.assign(ctx.player,{room:spawn.room,x:spawn.x,y:spawn.y});
    await collectQuestPack(ctx,ctx.profileId,ctx.player,{packId:pack.packId,spawnId:spawn.id},CIGARETTE_SPAWNS);
    ctx.player.room='outside';state=await handInQuestPack(ctx,ctx.profileId,ctx.player,pack.packId,CIGARETTE_SPAWNS);
  }
  assert.equal(state.completed,true);assert.equal(state.activeSpawnId,null);
});

test('the blue marker in the runtime TMJ matches the updated authoring TMX',()=>{
  const xml=readFileSync(new URL('../public/assets/maps/secret-path.tmx',import.meta.url),'utf8');
  const object=xml.match(/<object\b[^>]*name="long-crusher-3000-blue"[^>]*>/)?.[0];
  assert.ok(object);
  const x=Number(object.match(/\bx="([^"]+)"/)[1]),y=Number(object.match(/\by="([^"]+)"/)[1]);
  const spawn=CIGARETTE_SPAWNS.find(spawn=>spawn.packId==='cigarette_pack_04');
  assert.deepEqual([spawn.x,spawn.y],[x,y]);
});

test('DEV grants all four packs once without hand-ins and they can still be delivered in order',async()=>{
  const ctx=await harness();
  const state=await grantQuestCollection(ctx,ctx.profileId);
  await grantQuestCollection(ctx,ctx.profileId);
  assert.deepEqual(ctx.tables.characterItems.map(item=>item.itemId),CIGARETTE_QUEST.packIds.map(questInventoryItemId));
  assert.deepEqual(state.deliveredPackIds,[]);assert.equal(state.hasPack,true);
  for(const packId of CIGARETTE_QUEST.packIds){
    const next=await handInQuestPack(ctx,ctx.profileId,ctx.player,packId);
    assert.equal(next.hasPack,!next.completed,'already granted next pack is immediately available');
  }
  assert.equal((await findQuest(ctx,ctx.profileId)).completed,true);
  // Granting again is for inspecting items, not changing recorded quest progress.
  const completed=await grantQuestCollection(ctx,ctx.profileId);
  assert.equal(completed.completed,true);assert.equal(completed.deliveredPackIds.length,4);
});

test('DEV reset removes all pack aliases and deliveries but preserves other profiles and unrelated items',async()=>{
  const ctx=await harness();
  await grantQuestCollection(ctx,ctx.profileId);
  for(const packId of CIGARETTE_QUEST.packIds)await handInQuestPack(ctx,ctx.profileId,ctx.player,packId);
  await grantQuestCollection(ctx,ctx.profileId);
  await ctx.db.insert('characterItems',{profileId:ctx.profileId,itemId:'cigarette_pack_01',quantity:1});
  const sharedItems=['office2_key','health_potion','lung_crusher_3000'];
  for(const itemId of sharedItems)await ctx.db.insert('characterItems',{profileId:ctx.profileId,itemId,quantity:1});
  await grantQuestCollection(ctx,'another-profile');
  const other=JSON.stringify(ctx.tables.characterItems.filter(item=>item.profileId==='another-profile'));
  const reset=await resetQuestCollection(ctx,ctx.profileId);
  assert.deepEqual(reset.deliveredPackIds,[]);assert.equal(reset.completed,false);assert.equal(reset.rewardClaimed,false);
  assert.equal(reset.currentPackId,CIGARETTE_QUEST.packIds[0]);assert.equal(reset.hasPack,false);
  assert.equal(reset.activeSpawnId,CIGARETTE_SPAWNS.find(spawn=>spawn.packId===reset.currentPackId).id);
  assert.deepEqual(ctx.tables.characterItems.filter(item=>item.profileId===ctx.profileId).map(item=>item.itemId),sharedItems);
  assert.equal(JSON.stringify(ctx.tables.characterItems.filter(item=>item.profileId==='another-profile')),other);
  await resetQuestCollection(ctx,ctx.profileId);assert.equal(ctx.tables.npcCollectibleQuests.length,2);
});

test('DEV collection endpoints require enabled tools and the current authenticated profile session',async()=>{
  const ctx=await harness();
  const previousFlag=process.env.DEV_TOOLS_ENABLED,previousUrl=process.env.CONVEX_CLOUD_URL;
  try{
    process.env.DEV_TOOLS_ENABLED='false';process.env.CONVEX_CLOUD_URL='https://example.convex.cloud';
    for(const endpoint of [quests.devResetCollection,quests.devGrantCollection,quests.devSetFreeCollect])
      await assert.rejects(endpoint._handler(ctx,ctx.auth),/disabled/);
    process.env.DEV_TOOLS_ENABLED='true';
    for(const endpoint of [quests.devResetCollection,quests.devGrantCollection])
      await assert.rejects(endpoint._handler(ctx,{...ctx.auth,sessionId:'stale'}),/SESSION_LOST/);
    await assert.rejects(quests.devSetFreeCollect._handler(ctx,{...ctx.auth,enabled:true,sessionId:'stale'}),/SESSION_LOST/);
    await ctx.db.patch(ctx.playerRow,{profileId:'another-profile'});
    await assert.rejects(quests.devGrantCollection._handler(ctx,ctx.auth),/SESSION_LOST/);
    await ctx.db.patch(ctx.playerRow,{profileId:undefined,identityKind:'guest'});
    await assert.rejects(quests.devResetCollection._handler(ctx,ctx.auth),/PROFILE_REQUIRED/);
    assert.equal(ctx.tables.characterItems.length,0);assert.equal(ctx.tables.npcCollectibleQuests.length,0);
    await ctx.db.patch(ctx.playerRow,{profileId:ctx.profileId,identityKind:'profile'});
    assert.equal((await quests.devGrantCollection._handler(ctx,ctx.auth)).hasPack,true);
    assert.equal((await quests.devSetFreeCollect._handler(ctx,{...ctx.auth,enabled:true})).devFreeCollect,true);
    assert.equal((await quests.devResetCollection._handler(ctx,ctx.auth)).hasPack,false);
  }finally{
    if(previousFlag===undefined)delete process.env.DEV_TOOLS_ENABLED;else process.env.DEV_TOOLS_ENABLED=previousFlag;
    if(previousUrl===undefined)delete process.env.CONVEX_CLOUD_URL;else process.env.CONVEX_CLOUD_URL=previousUrl;
  }
});

test('DEV collection controller refreshes the existing inventory after a successful action only',async()=>{
  let restored=0;const methods=[];
  const controller=Object.assign(Object.create(CollectibleQuestController.prototype),{
    scene:{characterItems:{async restore(){restored++;}}},
    async mutate(method){methods.push(method);return {hasPack:method==='devGrantCollection'};},
  });
  await controller.devCollection('grant');await controller.devCollection('reset');
  assert.deepEqual(methods,['devGrantCollection','devResetCollection']);assert.equal(restored,2);
  assert.equal(await controller.devCollection('invalid'),null);
  controller.destroyed=true;await controller.devCollection('grant');assert.equal(restored,2);
});
