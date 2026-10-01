import { isPackSpawn } from './cigarettePacks.js';

export const CIGARETTE_QUEST = Object.freeze({
  id: 'beggar-cigarettes', npcRoom: 'outside',
  packIds: ['cigarette_pack_01', 'cigarette_pack_02', 'cigarette_pack_03', 'cigarette_pack_04'],
});

// Reusable ordered-collectible state; ownership belongs to the profile.
export function chooseCollectibleSpawn(spawns, previousId, random = Math.random, packId) {
  const valid = spawns.filter(spawn => spawn.id && spawn.room && spawn.markerName
    && Number.isFinite(spawn.x) && Number.isFinite(spawn.y) && isPackSpawn(spawn,packId));
  const distinct = [...new Map(valid.map(spawn => [spawn.id, spawn])).values()];
  const alternatives = distinct.filter(spawn => spawn.id !== previousId);
  const pool = alternatives.length ? alternatives : distinct;
  return pool.length ? pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))].id : undefined;
}

export function initialCollectibleQuest(config, spawns, now) {
  return {questId: config.id, deliveredPackIds: [], currentPackId: config.packIds[0],
    activeSpawnId: chooseCollectibleSpawn(spawns, undefined, Math.random, config.packIds[0]), completed: false, rewardClaimed: false, updatedAt: now};
}

export function advanceCollectibleQuest(state, packId, config, spawns, now) {
  if (state.completed || state.currentPackId !== packId
    || state.deliveredPackIds.includes(packId)
    || config.packIds[state.deliveredPackIds.length] !== packId) throw new Error('PACK_NOT_CURRENT');
  const deliveredPackIds = [...state.deliveredPackIds, packId];
  const completed = deliveredPackIds.length === config.packIds.length;
  return {deliveredPackIds, currentPackId: completed ? undefined : config.packIds[deliveredPackIds.length],
    activeSpawnId: completed ? undefined : chooseCollectibleSpawn(spawns, state.activeSpawnId, Math.random, config.packIds[deliveredPackIds.length]),
    completed, rewardClaimed: false, updatedAt: now};
}
