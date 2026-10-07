import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GAMBLE_MACHINE } from '../src/gamble/config.js';
import { gambleMachinePlacement,machineDisplaySize,nearMachineBase } from '../src/gamble/placement.js';
import { GambleMachineController,GambleMachinePanel,createPrizeWheel,createWheelSegments,landingJitterDegrees,
  rewardChancePercent,wheelSegmentIndexForReward,wheelTargetRotation } from '../src/gamble/GambleMachineController.js';
import { ROULETTE_COST,ROULETTE_REWARDS } from '../src/economy/config.js';
import { collisionAreas } from '../src/maps/collision.js';
import { menuFixture } from './helpers/menuFixture.js';

const map=JSON.parse(readFileSync(new URL('../public/assets/maps/classroom.tmj',import.meta.url)));

test('machine asset is copied unchanged and runtime placement uses the Notes floor marker',()=>{
  const original=readFileSync(new URL('../assets-drafts/gamble-machine.png',import.meta.url));
  const runtime=readFileSync(new URL(`../public/${GAMBLE_MACHINE.assetPath}`,import.meta.url));
  assert.ok(original.equals(runtime));
  const placement=gambleMachinePlacement(map);
  assert.equal(placement.marker.layer,'Notes');assert.equal(placement.marker.point,true);
  assert.deepEqual([placement.x,placement.y],[752,912]);
  const size=machineDisplaySize({width:runtime.readUInt32BE(16),height:runtime.readUInt32BE(20)},placement);
  assert.deepEqual([size.width,size.height],[62,124]);
  assert.deepEqual(placement.base,{x:726,y:896,width:52,height:16});
  assert.ok(placement.base.height<size.height/4);
  const collisions=collisionAreas(map.layers.find(layer=>layer.name==='Collision').objects);
  assert.ok(!collisions.some(c=>c.x<778&&c.x+c.width>726&&c.y<912&&c.y+c.height>896),'base does not intersect existing blockers');
});

test('marker movement updates placement; missing marker never creates a hidden hardcoded object',()=>{
  const source={tilewidth:32,tileheight:32,layers:[{name:'Notes',type:'objectgroup',objects:[]}]},warnings=[];
  assert.equal(gambleMachinePlacement(source),null);
  assert.equal(gambleMachinePlacement(source,{dev:true,warn:text=>warnings.push(text)}),null);
  assert.match(warnings[0],/DEV.*Missing.*machine disabled/);
  source.layers[0].objects.push({name:'gamble-machine-dev',id:1,point:true,x:100,y:200});
  assert.equal(gambleMachinePlacement(source),null,'DEV fallback is not used in production');
  assert.equal(gambleMachinePlacement(source,{dev:true,warn:text=>warnings.push(text)}).x,100);
  source.layers[0].objects.push({name:'gamble-machine',id:2,point:true,x:300,y:400});
  const placement=gambleMachinePlacement(source);
  assert.deepEqual([placement.x,placement.y,placement.base.x,placement.base.y],[300,400,274,384]);
});

test('interaction range uses the physical base, not the tall visual',()=>{
  const placement=gambleMachinePlacement(map);
  assert.equal(nearMachineBase({center:{x:752,y:920}},placement),true);
  assert.equal(nearMachineBase({center:{x:752,y:780}},placement),false);
  assert.equal(nearMachineBase({center:{x:900,y:904}},placement),false);
  assert.equal(nearMachineBase(null,placement),false);
});

test('interaction radius is much larger than the collision base',()=>{
  const placement=gambleMachinePlacement(map);
  assert.equal(GAMBLE_MACHINE.interactionDistanceTiles*map.tilewidth,104);
  assert.ok(placement.interactionDistance>placement.base.width);
  assert.ok(placement.interactionDistance>GAMBLE_MACHINE.baseWidthTiles*map.tilewidth);
});

test('machine modal isolates input and keeps spin unavailable without a server endpoint',()=>{
  const f=menuFixture(GambleMachinePanel),placement=gambleMachinePlacement(map);
  f.scene.player.body={center:{x:752,y:920}};
  f.scene.presence={client:{mutation(){assert.fail('placeholder must never mutate economy');},query(){assert.fail('placeholder must not query roulette');}}};
  let promptVisible=false;
  const controller=Object.assign(Object.create(GambleMachineController.prototype),{
    scene:f.scene,placement,dialog:f.menu,prompt:{setVisible(value){promptVisible=value;}},destroyed:false,suspended:false,
  });
  controller.update();assert.equal(promptVisible,true);
  assert.equal(controller.open(),true);assert.equal(promptVisible,false);
  assert.equal(f.scene.input.keyboard.enabled,false);
  assert.equal(f.menu.rewardRows.size,6);
  assert.equal(f.menu.body.querySelectorAll('p').some(p=>p.className==='gamble-cost'),false);
  assert.equal(f.menu.wheelView.querySelectorAll('svg').length,2);
  assert.equal(f.menu.body.querySelectorAll('button').find(button=>button.className==='gamble-spin-button').textContent,'BALANCE UNAVAILABLE');
  f.menu.setBalance({coins:27,available:true});
  const spin=f.menu.body.querySelectorAll('button').find(button=>button.className==='gamble-spin-button');
  assert.equal(f.menu.balanceValue.textContent,'27 Coins');assert.equal(spin.disabled,true);
  assert.equal(spin.disabled,true);
  assert.match(f.menu.spinStatus.textContent,/unavailable/i);
  f.menu.setBalance({coins:2,available:true});
  assert.equal(f.menu.body.querySelectorAll('button').find(button=>button.className==='gamble-spin-button').textContent,'NOT ENOUGH COINS');
  assert.equal(controller.open(),false,'cannot open twice');
  f.menu.handleKey({key:'Escape',type:'keydown',preventDefault(){},stopImmediatePropagation(){}});
  assert.equal(controller.active,false);assert.equal(f.scene.input.keyboard.enabled,true);
  f.scene.quiz={seated:true};assert.equal(controller.open(),false);
  f.scene.quiz=null;assert.equal(controller.open(),true);
  controller.suspend();assert.equal(controller.active,false);assert.equal(promptVisible,false);
  assert.equal(controller.canInteract(),false);controller.resume();assert.equal(controller.canInteract(),true);
  f.menu.destroy();assert.equal(f.listeners.size,0);
});

test('reward display probabilities are derived from the configured backend weights',()=>{
  const total=ROULETTE_REWARDS.reduce((sum,reward)=>sum+reward.weight,0);
  assert.deepEqual(ROULETTE_REWARDS.map(reward=>rewardChancePercent(reward,total)),[32,40,10,2,1,15]);
  assert.equal(rewardChancePercent({weight:1},100),1);
  const f=menuFixture(GambleMachinePanel),wheel=createPrizeWheel(f.doc,ROULETTE_REWARDS);
  assert.equal(wheel.segments.length,8);
  assert.equal(new Set(wheel.segments.map(segment=>segment.rewardIds[0])).size,6);
  for(const reward of ROULETTE_REWARDS){
    const index=wheelSegmentIndexForReward(reward.id,wheel.segments);
    assert.equal(wheel.segments[index].placeholder,undefined);
    for(const random of [0,.5,1]){
      const target=wheelTargetRotation(index,8,1270,5,landingJitterDegrees(8,()=>random));
      const pointerAngle=((-target%360)+360)%360;
      assert.equal(Math.floor(pointerAngle/45),index);
    }
  }
  f.menu.destroy();
});

test('backend rewardId resolves to a visual segment and the landing remains inside it',()=>{
  const segments=createWheelSegments(ROULETTE_REWARDS),rewardId='lung_crusher_rare';
  const index=wheelSegmentIndexForReward(rewardId,segments),angle=360/segments.length;
  const jitter=landingJitterDegrees(segments.length,()=>1);
  assert.equal(segments[index].rewardIds.includes(rewardId),true);
  assert.ok(Math.abs(jitter)<=angle*.16+1e-9);
  const target=wheelTargetRotation(index,segments.length,0,5,jitter);
  const centerOffset=(index+.5)*angle;
  const displacement=((centerOffset+target+180)%360+360)%360-180;
  assert.ok(Math.abs(displacement)<angle/2);
  assert.equal(createWheelSegments(Array.from({length:12},(_,i)=>({id:'r'+i,reward:{type:'none'}}))).length,8);
});

test('spin blocks duplicate requests and close while pending; result waits for animation',async()=>{
  const f=menuFixture(GambleMachinePanel);let requestCount=0,finishAnimation;
  const panel=f.menu;
  panel.spinRequest=async()=>{requestCount++;return {rewardId:'coins',categoryId:'coins',outcome:{label:'Coins \u00d75'},coins:27};};
  panel.animateWheel=()=>new Promise(resolve=>finishAnimation=resolve);
  panel.spinIdFactory=()=>'test-spin-id';panel.random=()=>.5;
  assert.equal(panel.open(),true);panel.setBalance({coins:27,available:true});
  const pending=panel.spin();
  assert.equal(panel.spinButton.textContent,'SPINNING...');assert.equal(panel.spinButton.disabled,true);
  assert.equal(await panel.spin(),false);assert.equal(requestCount,1);
  assert.equal(panel.requestClose(),false);assert.equal(panel.resultMessage.hidden,true);
  finishAnimation();assert.equal(await pending,true);
  assert.equal(panel.resultMessage.hidden,false);assert.match(panel.resultMessage.textContent,/^YOU WON COINS .5$/);
  assert.equal(panel.resultId,'coins');assert.equal(panel.balanceValue.textContent,'27 Coins');
  assert.match(panel.rewardRows.get('coins').class,/is-winner/);
  panel.destroy();
});

test('rare prize retains equal geometry and permanent styling; jackpot appears only after animation',async()=>{
  const f=menuFixture(GambleMachinePanel),panel=f.menu;
  let finishAnimation;
  panel.spinRequest=async()=>({rewardId:'tier3_skin',coins:22});
  panel.animateWheel=()=>new Promise(resolve=>finishAnimation=resolve);
  panel.spinIdFactory=()=>'rare-spin-id';panel.random=()=>.5;
  panel.open();panel.setBalance({coins:27,available:true});
  const index=wheelSegmentIndexForReward('tier3_skin',panel.wheelSegments);
  assert.equal(panel.wheelSegments[index].rare,true);
  assert.equal(panel.wheelSegments[index].icon,'star');
  assert.equal(panel.wheelView.segmentAngle,45);
  assert.match(panel.rewardRows.get('tier3_skin').className,/is-rare/);
  const pending=panel.spin();await Promise.resolve();
  assert.equal(panel.resultMessage.hidden,true);
  finishAnimation();assert.equal(await pending,true);
  assert.match(panel.resultMessage.textContent,/^JACKPOT/);
  assert.match(panel.rewardRows.get('tier3_skin').class,/is-rare-win/);
  assert.match(panel.wheelView.segmentPaths[index].class,/is-rare-win/);
  panel.spinRequest=async()=>({rewardId:'coins',outcome:{label:'Coins \u00d73'},coins:20});
  const next=panel.spin();await Promise.resolve();
  assert.equal(panel.resultMessage.hidden,true);
  assert.equal(panel.rewardRows.get('tier3_skin').class,'gamble-reward is-rare');
  finishAnimation();assert.equal(await next,true);
  assert.match(panel.resultMessage.textContent,/^YOU WON/);
  panel.destroy();
});

test('category buttons replace details, use inventory miniatures and the real character Tier 3 frame',()=>{
  const f=menuFixture(GambleMachinePanel),panel=f.menu;f.scene.presence={identity:{characterBaseId:'sarina'}};
  panel.open();
  assert.match(panel.detailsPanel.querySelector('img').src,/sarina-level3-hd-idle.png$/);
  assert.equal(panel.detailsPanel.querySelectorAll('figcaption').length,0);
  assert.equal(panel.detailsPanel.querySelectorAll('p').length,0);
  assert.equal(f.doc.activeElement,panel.closeActionButton);
  for(const category of ROULETTE_REWARDS){
    panel.categoryButtons.get(category.id).events.click();
    assert.equal(panel.selectedCategoryId,category.id);
    if(category.id==='tier3_skin')assert.equal(panel.detailsPanel.querySelectorAll('h3').length,0);
    else assert.equal(panel.detailsPanel.querySelector('h3').textContent,category.name);
    assert.equal(panel.categoryButtons.get(category.id)['aria-pressed'],'true');
  }
  panel.selectCategory('coins');assert.equal(panel.detailsPanel.querySelectorAll('tr').length,5);
  panel.selectCategory('cigarette_collection');
  const previews=panel.detailsPanel.querySelectorAll('image');assert.equal(previews.length,4);
  for(const image of previews)assert.match(image.href,/-inv.png$/);
  assert.ok(!previews.some(image=>image.href.includes('-rare-inv')));
  panel.selectCategory('lung_crusher_rare');assert.match(panel.detailsPanel.querySelector('image').href,/lung-crusher-3000-rare-inv.png$/);
  panel.destroy();
});

test('Lucky Machine item assets are copied unchanged from drafts, including inventory miniatures',()=>{
  for(const name of ['lung-crusher-3000-pink','lung-crusher-3000-orange','lung-crusher-3000-purple','lung-crusher-3000-rare','gutschein']){
    for(const suffix of ['','-inv']){
      const filename=`${name}${suffix}.png`;
      assert.ok(readFileSync(new URL(`../assets-drafts/${filename}`,import.meta.url)).equals(readFileSync(new URL(`../public/assets/items/${filename}`,import.meta.url))),filename);
    }
  }
});

test('view cleanup destroys collision, visual and dialog once',()=>{
  const calls=[];
  const controller=Object.assign(Object.create(GambleMachineController.prototype),{
    dialog:{destroy:()=>calls.push('dialog')},prompt:{destroy:()=>calls.push('prompt')},
    collider:{destroy:()=>calls.push('collider')},base:{destroy:()=>calls.push('base')},visual:{destroy:()=>calls.push('visual')},
  });
  controller.destroy();controller.destroy();
  assert.deepEqual(calls,['dialog','prompt','collider','base','visual']);
});

test('won packs use the existing item card after animation, without replaying duplicate receipts',async()=>{
  const {menu:panel,doc}=menuFixture(GambleMachinePanel);let finishAnimation,requests=0;
  panel.spinRequest=async()=>{requests++;return {rewardId:'cigarette_collection',coins:25,
    outcome:{type:'item',itemId:'roulette_pack_pink',label:'Lung Crusher 3000 Pink'}};};
  panel.animateWheel=()=>new Promise(resolve=>finishAnimation=resolve);
  panel.open();panel.setBalance({coins:30,available:true});
  const pending=panel.spin();await Promise.resolve();
  assert.equal(panel.itemPresentation.active,false);
  finishAnimation();assert.equal(await pending,true);
  const presentation=panel.itemPresentation;
  assert.equal(presentation.active,true);assert.equal(panel.active,true);
  assert.equal(presentation.root.dataset.itemId,'roulette_pack_pink');
  assert.equal(presentation.root.dataset.presentationStyle,'cigarette-pack');
  assert.match(presentation.root.querySelector('img').src,/lung-crusher-3000-pink.png$/);
  assert.match(presentation.root.querySelector('img').style.clipPath,/^polygon\(/);
  assert.equal(await panel.spin(),false);assert.equal(requests,1);
  assert.equal(presentation.dismiss(),false,'pickup presentation keeps its short dismissal lock');
  presentation.state.unlock();
  panel.handleKey({key:'Enter',type:'keydown',preventDefault(){},stopImmediatePropagation(){}});
  assert.equal(presentation.active,false);assert.equal(doc.activeElement,panel.spinButton);
  panel.spinRequest=async()=>({rewardId:'cigarette_collection',duplicate:true,coins:25,
    outcome:{type:'item',itemId:'roulette_pack_pink',label:'Lung Crusher 3000 Pink'}});
  const replay=panel.spin();await Promise.resolve();finishAnimation();await replay;
  assert.equal(presentation.active,false);
  panel.destroy();assert.equal(presentation.root.removed,true);
});
