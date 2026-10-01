import test from 'node:test';
import assert from 'node:assert/strict';
import { BackpackPopup } from '../src/inventory/BackpackPopup.js';
import { ItemRewardOverlay } from '../src/inventory/ItemRewardOverlay.js';
import { menuFixture } from './helpers/menuFixture.js';

const item={itemId:'potion',type:'consumable',consumable:true,useBehavior:'functional',quantity:2,name:'Potion',icon:'assets/items/potion-felipe-inventory.png'};
test('mini backpack toggles, positions above its anchor and expands after restoring input',()=>{
  const anchor={setAttribute(){},contains:()=>false,getBoundingClientRect:()=>({x:650,top:500,width:40,height:40})};
  let expanded=false;
  const f=menuFixture(BackpackPopup,{anchor,items:[item],onExpand:()=>{assert.equal(f.menu.active,false);assert.equal(f.scene.input.enabled,true);expanded=true;}});
  assert.equal(f.menu.toggle(),true);assert.equal(f.menu.root.open,true);assert.equal(f.menu.root.style.top,'290px');
  assert.equal(f.menu.root.style.left,'507px');assert.equal(f.scene.input.enabled,false);
  f.menu.expandButton.events.click();assert.equal(expanded,true);assert.equal(f.menu.active,false);
  f.menu.toggle();f.menu.toggle();assert.equal(f.menu.active,false);
  f.menu.destroy();assert.equal(f.listeners.size,0);
});
test('popup uses existing callbacks and limits preview to eight items without hiding full ownership',async()=>{
  const used=[];const f=menuFixture(BackpackPopup,{items:Array.from({length:10},(_,i)=>({...item,itemId:`potion-${i}`})),onUse:item=>used.push(item.itemId)});
  f.menu.open();assert.equal(f.menu.itemButtons.size,8);assert.equal(f.menu.items.length,10);
  await f.menu.useItem(f.menu.items[0]);assert.deepEqual(used,['potion-0']);
  f.menu.setItems([{...item,cooldownUntil:Date.now()+5000}]);
  f.menu.itemButtons.get('potion').events.click();
  assert.equal(f.menu.inspection.active,true);
  assert.equal(f.menu.inspection.root.children[0].children.at(-1).disabled,true);
  f.menu.requestClose();assert.equal(f.menu.inspection.active,false);
  await f.menu.useItem(f.menu.items[0]);assert.equal(used.length,1);f.menu.destroy();
});
test('clicking a small-inventory item examines it in place and Back restores the same popup',()=>{
  let expanded=0;const pack={itemId:'lung_crusher_3000_pack',type:'quest',quantity:1,
    name:'Lung Crusher 3000 Pack',icon:'assets/items/lung-crusher-floor.png',presentationImage:'assets/items/lung-crusher-3000.png'};
  const f=menuFixture(BackpackPopup,{items:[pack],onExpand:()=>expanded++});
  f.menu.open();f.menu.itemButtons.get(pack.itemId).events.click();
  assert.equal(expanded,0);assert.equal(f.menu.active,true);assert.equal(f.menu.inspection.active,true);
  assert.equal(f.menu.root.dataset.view,'inspection');
  assert.equal(f.menu.inspection.root.children[0].children[1].src,'https://game.test/assets/items/lung-crusher-3000.png');
  f.menu.setItems([pack,{...pack,itemId:'another-pack'}]);
  assert.equal(f.menu.inspection.active,true,'inventory updates do not dismiss the card');
  f.menu.inspection.backButton.events.click({stopPropagation(){}});
  assert.equal(f.menu.active,true);assert.equal(f.menu.inspection.active,false);
  assert.equal(f.menu.itemButtons.size,2);assert.equal(f.menu.root.dataset.view,'overview');
  f.menu.itemButtons.get(pack.itemId).events.click();f.menu.close();
  assert.equal(f.menu.inspection.active,false);f.menu.destroy();
});
test('a functional item can be examined while cooling down and used from its card when ready',async()=>{
  const used=[];const f=menuFixture(BackpackPopup,{items:[item],onUse:entry=>used.push(entry.itemId)});
  f.menu.open();f.menu.itemButtons.get(item.itemId).events.click();
  assert.equal(f.menu.inspection.active,true);assert.deepEqual(used,[]);
  f.menu.inspection.root.children[0].children.at(-1).events.click();
  await Promise.resolve();assert.deepEqual(used,[item.itemId]);
  assert.equal(f.menu.active,true);assert.equal(f.menu.inspection.active,false);
  f.menu.destroy();
});
test('outside click and Escape close just the popup, consume the input, and restore gameplay',()=>{
  const f=menuFixture(BackpackPopup);f.menu.open();
  const outside={target:f.game,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};
  f.menu.onOutside(outside);assert.equal(f.menu.active,false);assert.ok(outside.prevented&&outside.stopped);
  assert.equal(f.scene.input.keyboard.enabled,true);
  f.menu.open();const escape={key:'Escape',type:'keydown',preventDefault(){},stopImmediatePropagation(){}};
  f.menu.handleKey(escape);assert.equal(f.menu.active,false);f.menu.destroy();
});
test('pickup mode still uses Continue and its dismissal lock; inventory mode ignores backdrop and force-close callbacks',()=>{
  const {menu:overlay}=menuFixture(ItemRewardOverlay);
  overlay.show(item);assert.equal(overlay.source,'pickup');assert.equal(overlay.backButton.textContent,'Continue');
  assert.equal(overlay.backButton.disabled,true);assert.equal(overlay.dismiss(),false);
  overlay.state.unlock();overlay.onClick();assert.equal(overlay.active,false);
  let returns=0;overlay.show(item,{source:'inventory',onReturn:()=>returns++});
  overlay.onClick();assert.equal(overlay.active,true);assert.equal(returns,0);
  overlay.dismiss();assert.equal(returns,1);
  overlay.show(item,{source:'inventory',onReturn:()=>returns++});overlay.destroy();assert.equal(returns,1);
});
