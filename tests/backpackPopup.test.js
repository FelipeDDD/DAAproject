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
  f.menu.setItems([{...item,cooldownUntil:Date.now()+5000}]);assert.equal(f.menu.itemButtons.get('potion').disabled,true);
  await f.menu.useItem(f.menu.items[0]);assert.equal(used.length,1);f.menu.destroy();
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
