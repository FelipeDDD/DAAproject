import test from 'node:test';
import assert from 'node:assert/strict';
import { BackpackMenu } from '../src/inventory/BackpackMenu.js';
import { menuFixture } from './helpers/menuFixture.js';
import { collectionsFromQuestProgress } from '../src/collections/catalog.js';
import { InventoryHotbar } from '../src/inventory/InventoryHotbar.js';

const potion={itemId:'health_potion',type:'consumable',consumable:true,useBehavior:'functional',quantity:2,name:'Potion',description:'Heals.',icon:'assets/items/potion-felipe-inventory.png'};
const officeKey={itemId:'office2_key',type:'key',quantity:1,name:'Office key',description:'Opens the office.',icon:'assets/items/key-office.png'};
test('backpack lists all owned items beyond quick-slot capacity, selectable details and empty spaces',()=>{
  const items=[potion,officeKey,...Array.from({length:8},(_,i)=>({...officeKey,itemId:`key-${i}`}))];
  const {menu}=menuFixture(BackpackMenu,{items});assert.equal(menu.open(),true);
  assert.equal(menu.itemButtons.size,10);assert.equal(menu.body.children[0].children[0].children.length,12);
  menu.itemButtons.get(officeKey.itemId).events.click();
  assert.equal(menu.selectedId,officeKey.itemId);assert.equal(menu.preview.querySelector('h3').textContent,officeKey.name);
  assert.equal(menu.useButton,null);assert.ok(menu.inspectButton);
  menu.setItems([]);assert.equal(menu.selectedId,null);assert.match(menu.preview.querySelector('h3').textContent,/empty/);
});
test('backpack delegates consumption/equipment, blocks cooldown/incompatible classes and keeps selection on updates',async()=>{
  const used=[];const {menu}=menuFixture(BackpackMenu,{items:[potion],onUse:item=>used.push(item.itemId)});
  menu.open();await menu.useSelected();assert.deepEqual(used,['health_potion']);
  menu.setItems([{...potion,quantity:1,cooldownUntil:Date.now()+5000}]);assert.equal(menu.selectedId,potion.itemId);
  assert.equal(menu.useButton.disabled,true);await menu.useSelected();assert.equal(used.length,1);
  menu.setItems([{...potion,compatible:false}]);await menu.useSelected();assert.equal(used.length,1);
  const equipment={...officeKey,itemId:'equipment',type:'character_item',activatable:true,useBehavior:'functional',active:true};
  menu.setItems([equipment]);assert.equal(menu.useButton.textContent,'Unequip');await menu.useSelected();assert.equal(used[1],'equipment');
});
test('inventory examination stays in the dialog; Back/X/Escape return to backpack without closing it',()=>{
  const f=menuFixture(BackpackMenu,{items:[officeKey]});
  f.menu.open();f.menu.inspectButton.events.click();assert.equal(f.menu.active,true);
  assert.equal(f.menu.inspection.source,'inventory');assert.equal(f.menu.inspection.backButton.textContent,'Back');
  assert.equal(f.scene.input.keyboard.enabled,false);
  f.menu.handleBackdrop();assert.equal(f.menu.inspection.active,true);
  f.menu.inspection.backButton.events.click({stopPropagation(){}});assert.equal(f.menu.inspection.active,false);
  assert.equal(f.menu.active,true);assert.equal(f.menu.selectedId,officeKey.itemId);
  f.menu.inspectButton.events.click();f.menu.closeButton.events.click();assert.equal(f.menu.inspection.active,false);assert.equal(f.menu.active,true);
  f.menu.inspectButton.events.click();
  const event={key:'Escape',type:'keydown',preventDefault(){},stopImmediatePropagation(){this.stopped=true;}};
  f.menu.handleKey(event);assert.equal(f.menu.active,true);assert.equal(f.menu.inspection.active,false);
  f.menu.handleKey({...event,repeat:true});assert.equal(f.menu.active,true,'held Escape cannot close both views');
  f.menu.handleKey({...event,type:'keyup'});f.menu.handleKey(event);
  assert.equal(f.menu.active,false);assert.equal(event.stopped,true);assert.equal(f.doc.activeElement,f.game);
  f.menu.destroy();assert.equal(f.listeners.size,0);
});
test('cigarette collection history survives hand-in while current inventory is empty',()=>{
  const before=collectionsFromQuestProgress({hasPack:true,currentPackId:'cigarette_pack_01',deliveredPackIds:[]},[{itemId:'lung_crusher_3000_pack'}]);
  const after=collectionsFromQuestProgress({hasPack:false,currentPackId:'cigarette_pack_02',deliveredPackIds:['cigarette_pack_01']},[]);
  assert.equal(before[0].items[0].unlocked,true);assert.equal(after[0].items[0].unlocked,true);
  assert.equal(after[0].items[1].unlocked,false);assert.ok(after[0].items.some(item=>item.rarity==='rare'&&!item.unlocked));
  assert.equal(collectionsFromQuestProgress(null,[])[0].items[0].unlocked,false,'empty/new profile has no invented discoveries');
});
test('owned-item updates do not interrupt inspection and return renders the latest inventory',()=>{
  const f=menuFixture(BackpackMenu,{items:[potion,officeKey]});f.menu.open();f.menu.inspectButton.events.click();
  const card=f.menu.inspection.root.children[0];
  f.menu.setItems([officeKey]);assert.equal(f.menu.inspection.root.children[0],card);
  assert.equal(f.scene.input.keyboard.enabled,false);
  f.menu.inspection.dismiss();assert.equal(f.menu.selectedId,officeKey.itemId);assert.equal(f.menu.itemButtons.size,1);
  f.menu.inspectButton.events.click();f.menu.destroy();assert.equal(f.menu.inspection.active,false);assert.equal(f.menu.active,false);
});
test('collection on-demand refresh ignores stale query results after a newer quest update',async()=>{
  let resolve;const updates=[];
  const hotbar=Object.create(InventoryHotbar.prototype);
  hotbar.presence={profileSessionToken:'test',identity:{kind:'profile'},client:{query:()=>new Promise(done=>resolve=done)},api:{npcQuests:{progress:'progress'}}};
  hotbar.collections={open:()=>true,setCollections:rows=>updates.push(rows)};hotbar.items=[];
  const request=hotbar.openCollections();hotbar.setCollectionProgress({deliveredPackIds:['cigarette_pack_01']});
  resolve({deliveredPackIds:[]});await request;assert.equal(updates.length,1);assert.equal(updates[0][0].items[0].unlocked,true);
});
