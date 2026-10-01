import { CIGARETTE_QUEST as config, advanceCollectibleQuest, chooseCollectibleSpawn, initialCollectibleQuest } from '../src/npc/cigaretteQuest.js';
import { CIGARETTE_SPAWNS } from './npcCollectibleSpawns.generated.js';
import { isPackSpawn,questInventoryItemId } from '../src/npc/cigarettePacks.js';

export function findQuest(ctx, profileId) {
  return ctx.db.query('npcCollectibleQuests').withIndex('by_profile_quest', q =>
    q.eq('profileId', profileId).eq('questId', config.id)).unique();
}
export async function findQuestPack(ctx, profileId, packId) {
  const itemId=questInventoryItemId(packId);
  const existing=await ctx.db.query('characterItems').withIndex('by_profile_item', q =>
    q.eq('profileId', profileId).eq('itemId', itemId)).unique();
  // Accept an early test quest's first item without duplicating an existing school pack.
  if(existing||itemId===packId)return existing;
  return ctx.db.query('characterItems').withIndex('by_profile_item',q=>q.eq('profileId',profileId).eq('itemId',packId)).unique();
}
export async function publicQuest(ctx, profileId, state) {
  if (!state) return null;
  const pack = state.currentPackId ? await findQuestPack(ctx, profileId, state.currentPackId) : null;
  const freeCollectPackIds = [];
  if(state.devFreeCollect)for(const packId of config.packIds){
    const owned=await findQuestPack(ctx,profileId,packId);
    if(!owned||(owned.quantity??1)<1)freeCollectPackIds.push(packId);
  }
  return {questId: state.questId, deliveredPackIds: state.deliveredPackIds,
    currentPackId: state.currentPackId ?? null, activeSpawnId: state.activeSpawnId ?? null,
    hasPack: Boolean(pack && (pack.quantity ?? 1) > 0), completed: state.completed,
    devFreeCollect:Boolean(state.devFreeCollect),freeCollectPackIds,
    rewardClaimed: state.rewardClaimed};
}
export async function startQuest(ctx, profileId, spawns = CIGARETTE_SPAWNS) {
  let state = await findQuest(ctx, profileId);
  if (!state) {
    const value = {profileId, ...initialCollectibleQuest(config, spawns, Date.now())};
    state = {_id: await ctx.db.insert('npcCollectibleQuests', value), ...value};
  } else if (!state.completed && !await findQuestPack(ctx, profileId, state.currentPackId)
    && !spawns.some(spawn => spawn.id === state.activeSpawnId&&isPackSpawn(spawn,state.currentPackId))) {
    const next = {activeSpawnId: chooseCollectibleSpawn(spawns,undefined,Math.random,state.currentPackId), updatedAt: Date.now()};
    if (next.activeSpawnId !== state.activeSpawnId) {
      await ctx.db.patch(state._id, next); state = {...state, ...next};
    }
  }
  return publicQuest(ctx, profileId, state);
}
export async function collectQuestPack(ctx, profileId, player, {packId, spawnId}, spawns = CIGARETTE_SPAWNS) {
  const state = await findQuest(ctx, profileId);
  const freeCollect=Boolean(state?.devFreeCollect);
  if (!state || (state.completed&&!freeCollect) || !config.packIds.includes(packId)
    || (!freeCollect&&(state.currentPackId !== packId||state.activeSpawnId !== spawnId))) throw new Error('PACK_NOT_CURRENT');
  const spawn = spawns.find(spawn => spawn.id === spawnId);
  if (!spawn || !isPackSpawn(spawn,packId) || player.room !== spawn.room || Math.hypot(player.x - spawn.x, player.y - spawn.y) > 64)
    throw new Error('PACK_OUT_OF_RANGE');
  const existing = await findQuestPack(ctx, profileId, packId);
  if(freeCollect&&existing&&(existing.quantity??1)>0)throw new Error('PACK_ALREADY_OWNED');
  if (!existing) await ctx.db.insert('characterItems', {
    profileId, itemId: questInventoryItemId(packId), quantity: 1, cooldownUntil: 0, updatedAt: Date.now(),
  });
  else if((existing.quantity??1)<1)await ctx.db.patch(existing._id,{quantity:1,cooldownUntil:0,updatedAt:Date.now()});
  return publicQuest(ctx, profileId, state);
}
export async function handInQuestPack(ctx, profileId, player, packId, spawns = CIGARETTE_SPAWNS) {
  if (player.room !== config.npcRoom) throw new Error('NPC_WRONG_ROOM');
  const state = await findQuest(ctx, profileId);
  if (!state) throw new Error('QUEST_NOT_STARTED');
  const next = advanceCollectibleQuest(state, packId, config, spawns, Date.now());
  const pack = await findQuestPack(ctx, profileId, packId);
  if (!pack || (pack.quantity ?? 1) < 1) throw new Error('PACK_NOT_OWNED');
  // Both operations run in the same Convex transaction. Repeated/concurrent requests
  // cannot deliver the same ID twice or preserve the consumed inventory item.
  await ctx.db.delete(pack._id);
  if(questInventoryItemId(packId)!==packId&&pack.itemId!==packId){
    const earlyTestPack=await ctx.db.query('characterItems').withIndex('by_profile_item',q=>q
      .eq('profileId',profileId).eq('itemId',packId)).unique();
    if(earlyTestPack)await ctx.db.delete(earlyTestPack._id);
  }
  await ctx.db.patch(state._id, next);
  return publicQuest(ctx, profileId, {...state, ...next});
}

// DEV actions affect only this profile's collection, never equipment or other quests.
export async function resetQuestCollection(ctx, profileId, spawns = CIGARETTE_SPAWNS) {
  const itemIds = new Set(config.packIds.flatMap(packId => [packId, questInventoryItemId(packId)]));
  for (const itemId of itemIds) {
    const item = await ctx.db.query('characterItems').withIndex('by_profile_item', q =>
      q.eq('profileId', profileId).eq('itemId', itemId)).unique();
    if (item) await ctx.db.delete(item._id);
  }
  const state = await findQuest(ctx, profileId);
  const initial = {...initialCollectibleQuest(config, spawns, Date.now()),devFreeCollect:false};
  if (state) await ctx.db.patch(state._id, initial);
  else await ctx.db.insert('npcCollectibleQuests', {profileId, ...initial});
  return publicQuest(ctx, profileId, initial);
}

export async function setDevFreeCollect(ctx,profileId,enabled,spawns=CIGARETTE_SPAWNS){
  await startQuest(ctx,profileId,spawns);
  const state=await findQuest(ctx,profileId);
  await ctx.db.patch(state._id,{devFreeCollect:Boolean(enabled),updatedAt:Date.now()});
  return publicQuest(ctx,profileId,{...state,devFreeCollect:Boolean(enabled)});
}

export async function grantQuestCollection(ctx, profileId) {
  await startQuest(ctx, profileId);
  for (const packId of config.packIds) {
    const item = await findQuestPack(ctx, profileId, packId);
    if (!item) await ctx.db.insert('characterItems', {
      profileId, itemId: questInventoryItemId(packId), quantity: 1, cooldownUntil: 0, updatedAt: Date.now(),
    });
    else if ((item.quantity ?? 1) < 1) await ctx.db.patch(item._id, {quantity: 1, updatedAt: Date.now()});
  }
  return publicQuest(ctx, profileId, await findQuest(ctx, profileId));
}
