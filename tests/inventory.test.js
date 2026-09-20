import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDirectorRewardChoice,applyDirectorVictory,BOSS_REWARDS } from '../src/boss/BossRewards.js';
import {
  INVENTORY_SLOT_COUNT,ITEM_CATALOG,inventoryItemsFromBossProgress,inventorySlots,normalizeInventoryItems,
} from '../src/inventory/config.js';

test('inventory starts with six empty slots and the badge appears only after its real unlock',()=>{
  assert.deepEqual(inventorySlots(inventoryItemsFromBossProgress(null)),Array(INVENTORY_SLOT_COUNT).fill(null));
  const victory=applyDirectorVictory(null,'michael').progress;
  const skin=applyDirectorRewardChoice(victory,BOSS_REWARDS.REMASTERED_SKIN).progress;
  assert.equal(inventoryItemsFromBossProgress(skin).length,0);
  const badge=applyDirectorRewardChoice(applyDirectorVictory(null,'felipe').progress,
    BOSS_REWARDS.DIRECTOR_ACCESS_BADGE).progress;
  assert.deepEqual(inventoryItemsFromBossProgress(badge),[ITEM_CATALOG.director_access_badge]);
});

test('unique inventory items cannot occupy duplicate hotbar slots',()=>{
  const badge=ITEM_CATALOG.director_access_badge;
  const items=normalizeInventoryItems([badge,{...badge,quantity:4}]);
  assert.equal(items.length,1);assert.equal(items[0].quantity,1);
  assert.equal(inventorySlots(items).filter(Boolean).length,1);
});

test('badge metadata provides its key type, icon and tooltip copy',()=>{
  const badge=ITEM_CATALOG.director_access_badge;
  assert.equal(badge.type,'key');assert.equal(badge.quantity,1);
  assert.match(badge.icon,/school-key\.png$/);assert.equal(badge.name,'Director Access Badge');
  assert.equal(badge.description,'Opens restricted school areas.');
});
