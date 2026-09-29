import test from 'node:test';
import assert from 'node:assert/strict';
import { InventoryHotbar } from '../src/inventory/InventoryHotbar.js';
import { CHARACTER_ITEM_IDS,characterItemDefinition } from '../src/inventory/characterItems.js';

test('unusable potion opens its card while successful use does not interrupt combat',async()=>{
  const item=characterItemDefinition(CHARACTER_ITEM_IDS.HEALTH_POTION);
  const presentations=[];
  const hotbar={overlay:{show:(...args)=>presentations.push(args)},onToggleItem:async()=>false};
  await InventoryHotbar.prototype.activate.call(hotbar,item);
  assert.equal(presentations.length,1);
  assert.equal(presentations[0][0].itemId,item.itemId);
  assert.equal(presentations[0][1].eyebrow,'ITEM PREVIEW');
  hotbar.onToggleItem=async()=>true;
  await InventoryHotbar.prototype.activate.call(hotbar,item);
  assert.equal(presentations.length,1);
});
