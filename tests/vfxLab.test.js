import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { collisionAreas } from '../src/maps/collision.js';
import { LAB_EFFECTS, LAB_HOTBAR_SLOTS } from '../src/vfx/lab/effects.js';
import { VFX_LAB_MAP, VFX_LAB_PLAYER, VFX_LAB_SIZE, VFX_LAB_TARGET } from '../src/vfx/lab/layout.js';
import { VfxPlayback } from '../src/vfx/lab/Playback.js';
import { trackArenaAim, worldPointAt } from '../src/vfx/lab/ArenaAim.js';
import { CastRangeIndicator } from '../src/vfx/lab/CastRangeIndicator.js';
import { clampSkillAim } from '../src/pvp/skills/config.js';
import { defaultTiming, resolveTiming } from '../src/vfx/lab/timing.js';
import { groundFire } from '../src/vfx/lab/groundFire.js';

test('the original Tiled map has a clear lane from the lab spawn to the target',()=>{
  const url=new URL(`../public/assets/maps/${VFX_LAB_MAP}`,import.meta.url);
  const map=JSON.parse(readFileSync(url,'utf8'));
  assert.deepEqual([map.width,map.height],[26,18]);
  assert.deepEqual(VFX_LAB_SIZE,{width:map.width*map.tilewidth,height:map.height*map.tileheight});
  const clearances=collisionAreas(map.layers.find(layer=>layer.name==='Collision').objects);
  const {x,y}=VFX_LAB_TARGET;
  assert.equal(Math.hypot(x-VFX_LAB_PLAYER.x,y-VFX_LAB_PLAYER.y),3*map.tilewidth);
  assert.equal(y,VFX_LAB_PLAYER.y);
  for(const area of clearances){
    const blocksLane=area.y<y&&area.y+area.height>y-16
      &&area.x<x+12&&area.x+area.width>VFX_LAB_PLAYER.x-12;
    assert.equal(blocksLane,false,area.name);
  }
  for(const layer of ['Floor','Walls','Decoration'])assert.ok(map.layers.some(entry=>entry.name===layer));
  for(const tileset of map.tilesets)assert.ok(readFileSync(new URL(tileset.source,url)).length>0);
});

function sceneFixture(){
  const textures=new Map(),objects=new Set();
  const createObject=()=>({
    setDepth(){return this;},setOrigin(){return this;},
    setPosition(x,y){this.position={x,y};return this;},
    setRotation(angle){this.angle=angle;return this;},
    setScale(scale){this.scale=scale;return this;},setAlpha(alpha){this.alpha=alpha;return this;},
    clear(){return this;},fillStyle(){return this;},lineStyle(){return this;},
    fillCircle(){return this;},strokeCircle(){return this;},fillRect(){return this;},
    destroy(){assert.ok(objects.delete(this),'object disposed once');},
  });
  const addObject=()=>{const object=createObject();objects.add(object);return object;};
  return {
    objects,textures,
    scene:{
      add:{image:(x,y)=>addObject().setPosition(x,y),graphics:addObject},
      textures:{
        createCanvas(key,w,h){
          assert.ok(!textures.has(key),'texture was released before reuse');
          const texture={
            setFilter(){},refresh(){},
            getContext(){return {
              createImageData:()=>({data:new Uint8ClampedArray(w*h*4)}),
              putImageData(pixels){texture.pixels=pixels.data;},
            };},
          };
          textures.set(key,texture);
          return texture;
        },
        remove(key){assert.ok(textures.delete(key),'texture disposed once');},
      },
    },
  };
}

test('both lab effects replay, switch, loop and release all graphics and textures',()=>{
  const {scene,objects,textures}=sceneFixture();
  const playback=new VfxPlayback(LAB_EFFECTS,effect=>effect.create(scene,VFX_LAB_TARGET,0));
  for(let run=0;run<5;run++){
    playback.play('fire-ring');
    assert.equal(objects.size,2);
    assert.equal(textures.size,2);
    for(let frame=0;frame<75;frame++)playback.update(20,true);
    const pixels=textures.get('vfx-lab-back').pixels;
    assert.equal(pixels.length,192*192*4);
    assert.equal(pixels[3],0);
    assert.ok(pixels.some((value,index)=>index%4===3&&value>0),'visible fire over transparent canvas');
    playback.play('fire-zone');
    assert.equal(textures.size,0);
    assert.equal(objects.size,1);
    for(let frame=0;frame<56;frame++)playback.update(100,false);
    assert.equal(objects.size,0);
  }
  playback.play('fire-ring');
  const prior=playback.active.view;
  for(let frame=0;frame<30;frame++)playback.update(100,true);
  assert.notEqual(playback.active.view,prior);
  assert.equal(textures.size,2);
  playback.stop();
  playback.stop();
  assert.equal(objects.size,0);
  assert.equal(textures.size,0);
});

test('the hotbar layout is configured and Fire Ring prep can replay, cancel and loop independently',()=>{
  assert.deepEqual(LAB_HOTBAR_SLOTS,[
    'fire-zone','fire-ring','campfire-ground','spirit-ground','healing-ground','frost-ground',
  ]);
  const {scene,objects,textures}=sceneFixture();
  const player={...VFX_LAB_PLAYER};
  let prepEnabled=true;
  const playback=new VfxPlayback(LAB_EFFECTS,
    stage=>stage.create(scene,VFX_LAB_TARGET,0,player),{canPrepare:()=>prepEnabled});
  const fireRing=LAB_EFFECTS['fire-ring'];
  playback.play('fire-ring');
  const firstPrep=playback.active.view;
  playback.update(100,false);
  playback.play('fire-ring');
  assert.notEqual(playback.active.view,firstPrep);
  assert.equal(playback.active.elapsed,0);
  assert.equal(objects.size,1);
  assert.equal(textures.size,0);
  assert.equal(playback.active.duration,1500);
  for(let elapsed=0;elapsed<1499;elapsed+=100)playback.update(Math.min(100,1499-elapsed),false);
  assert.equal(playback.active.stage,fireRing.preparation);
  playback.update(1,false);
  assert.equal(playback.active.stage,fireRing);
  assert.equal(playback.active.duration,3000);
  assert.equal(playback.active.elapsed,0);
  assert.equal(objects.size,3);
  assert.equal(textures.size,2);
  playback.update(85,true);
  assert.equal(objects.size,2);
  for(let elapsed=85;elapsed<3000;elapsed+=100)playback.update(100,true);
  assert.equal(playback.active.stage,fireRing.preparation);
  assert.equal(textures.size,0);
  playback.play('fire-zone');
  assert.equal(playback.active.stage,LAB_EFFECTS['fire-zone']);
  assert.equal(objects.size,1);
  playback.play('fire-ring');
  playback.stop();
  assert.equal(objects.size,0);
  assert.equal(textures.size,0);
  prepEnabled=false;
  playback.play('fire-ring');
  assert.equal(playback.active.stage,fireRing);
  assert.equal(textures.size,2);
  playback.stop();
  assert.equal(objects.size,0);
  assert.equal(textures.size,0);
});

test('timing is sampled per cast and each loop captures live aim when it releases',()=>{
  const samples=[];
  let settings={castMs:0,effectMs:1950};
  const playback=new VfxPlayback(LAB_EFFECTS,(stage,anchor)=>({
    update(elapsed,delta,duration){samples.push({stage,anchor,elapsed,delta,duration});},
    destroy(){},
  }),{canPrepare:()=>true,settings:()=>settings});
  const ring=LAB_EFFECTS['fire-ring'];
  assert.deepEqual(defaultTiming(ring),{castMs:1500,effectMs:3000,castRangePx:192});
  assert.equal(resolveTiming(ring).speed,1.3);
  for(const castMs of [0,500,700,1000,1500]){
    settings={castMs,effectMs:1950};
    const aim={x:481,y:271};
    playback.play('fire-ring',{captureAim:()=>aim});
    aim.x=200;
    settings={castMs:500,effectMs:7800};
    assert.equal(playback.active.preparing,castMs>0);
    for(let elapsed=0;elapsed<castMs;elapsed+=100)playback.update(100,false);
    assert.equal(playback.active.stage,ring);
    assert.equal(playback.active.duration,1950);
    const anchor={x:castMs>0?200:481,y:271};
    assert.deepEqual(playback.active.anchor,anchor);
    aim.x=110;
    playback.update(100,false);
    assert.deepEqual(samples.at(-1),{stage:ring,anchor,elapsed:200,delta:200,duration:3900});
  }
  for(let elapsed=100;elapsed<1950;elapsed+=100)playback.update(100,true);
  assert.equal(playback.active.duration,500);
  assert.equal(playback.active.timing.durationMs,7800);
  assert.deepEqual(playback.active.anchor,{x:110,y:271});
  const zone=LAB_EFFECTS['fire-zone'];
  assert.deepEqual(resolveTiming(zone,{castMs:800,effectMs:2000}),{castMs:0,durationMs:2500,speed:1});
  assert.deepEqual(resolveTiming({durationMs:1200},{effectMs:8000}),{castMs:0,durationMs:1200,speed:1});
});

test('DOM pointer coordinates account for canvas scale and camera pan and zoom',()=>{
  const canvas={width:832,height:576,getBoundingClientRect:()=>({left:110,top:210,width:416,height:288})};
  const camera={getWorldPoint:(x,y)=>({x:190+x/1.25,y:44+y/1.25})};
  assert.deepEqual(worldPointAt(canvas,camera,240,280),{x:398,y:156});
  assert.equal(worldPointAt(canvas,camera,98,280),null);
});

test('live aim follows camera movement while inside and stays at the last valid world point after leaving',()=>{
  const canvas=Object.assign(new EventTarget(),{
    width:832,height:576,getBoundingClientRect:()=>({left:110,top:210,width:416,height:288}),
  });
  let pan=190;
  const camera={getWorldPoint:(x,y)=>({x:pan+x/1.25,y:44+y/1.25})};
  const listeners=new AbortController();
  const aim=trackArenaAim(canvas,camera,VFX_LAB_TARGET,{signal:listeners.signal});
  assert.deepEqual(aim.capture(),VFX_LAB_TARGET);
  canvas.dispatchEvent(Object.assign(new Event('pointermove'),{clientX:240,clientY:280}));
  assert.deepEqual(aim.capture(),{x:398,y:156});
  pan+=40;
  assert.deepEqual(aim.capture(),{x:438,y:156});
  canvas.dispatchEvent(new Event('pointerleave'));
  pan+=40;
  assert.deepEqual(aim.capture(),{x:438,y:156});
  listeners.abort();
});

test('cast range draws from the player, marks only clamped aim and releases its graphics',()=>{
  const radius=LAB_EFFECTS['fire-ring'].castRangePx;
  assert.equal(radius,192);
  const player={x:100,y:200};
  const graphics={
    setName(){return this;},setDepth(){return this;},
    setVisible(visible){this.visible=visible;return this;},
    setPosition(x,y){this.position={x,y};return this;},
    clear(){this.circles=[];return this;},
    lineStyle(){return this;},
    strokeCircle(...args){this.circles.push(args);return this;},
    destroy(){this.disposed=true;},
  };
  const indicator=new CastRangeIndicator({add:{graphics:()=>graphics}},player);
  assert.equal(graphics.visible,false);
  indicator.update(clampSkillAim(player,{x:200,y:200},radius),radius);
  assert.deepEqual(graphics.circles,[[0,0,192]]);
  player.x=145;
  indicator.update(clampSkillAim(player,{x:500,y:200},64),64);
  assert.deepEqual(graphics.position,{x:145,y:200});
  assert.deepEqual(graphics.circles,[[0,0,64],[64,0,4]]);
  indicator.update(null);
  assert.equal(graphics.visible,false);
  indicator.destroy();
  assert.equal(graphics.disposed,true);
});

test('Spirit Ground stays animated after its source cycle and uses duration as a real-time limit',()=>{
  const {scene,objects,textures}=sceneFixture();
  const id='spirit-ground';
  const effect=LAB_EFFECTS[id];
  const view=effect.create(scene,VFX_LAB_TARGET,0);
  view.update(0,0);
  const first=textures.get('vfx-lab-front').pixels.slice();
  for(const [elapsed,dt] of [[400,400],[3400,3000]]){
    view.update(elapsed,dt);
    const rgba=textures.get('vfx-lab-front').pixels;
    assert.equal(rgba[3],0);
    assert.ok(rgba.some((value,index)=>index%4===3&&value>0),'fire remains visible');
    assert.notDeepEqual(rgba,first);
    assert.ok(Math.abs(view.effect.t-elapsed/1000)<1e-8);
  }
  view.destroy();
  assert.equal(textures.size,0);
  assert.equal(objects.size,0);

  for(const effectMs of [3000,5000,8000]){
    let lastVisualTime=0;
    const playback=new VfxPlayback(LAB_EFFECTS,
      ()=>({update(time){lastVisualTime=time;},destroy(){}}),{settings:()=>({effectMs})});
    playback.play(id);
    assert.equal(playback.active.preparing,false);
    for(let elapsed=0;elapsed<effectMs-100;elapsed+=100)playback.update(100,false);
    assert.equal(lastVisualTime,effectMs-100);
    assert.equal(playback.active.duration,effectMs);
    playback.update(100,false);
    assert.equal(playback.active,null);
  }
});

test('Campfire launches to a fixed, clamped target, then spreads, sustains and fades before looping',()=>{
  const {scene,objects,textures}=sceneFixture();
  const id='campfire-ground';
  const player={x:100,y:100};
  const aim={x:500,y:100};
  const defaults=defaultTiming(LAB_EFFECTS[id]);
  assert.deepEqual(defaults,{castMs:0,effectMs:5000,castRangePx:256,areaRadiusPx:80,projectileEnabled:true});
  const captureAim=()=>clampSkillAim(player,aim,defaults.castRangePx);
  let effectMs=3000;
  const playback=new VfxPlayback(LAB_EFFECTS,
    (stage,point,context)=>stage.create(scene,point,0,player,context),{settings:()=>({effectMs})});
  const advance=(ms,loop=false)=>{
    for(let passed=0;passed<ms;passed+=100)playback.update(Math.min(100,ms-passed),loop);
  };

  for(effectMs of [3000,5000,8000]){
    playback.play(id,{captureAim});
    const {view}=playback.active;
    assert.deepEqual(view.anchor,{x:356,y:100,clamped:true});
    assert.equal(textures.size,1);
    const launchPosition=view.projectile.layers[0].image.position;
    aim.x=20;
    player.x=120;
    advance(170);
    assert.ok(view.projectile.layers[0].image.position.x>launchPosition.x);
    assert.ok(view.projectile.layers[0].pixels.data.some((value,index)=>index%4===3&&value>0));
    assert.equal(view.ground,undefined);
    advance(view.travelMs-170);
    assert.equal(view.projectile,null);
    assert.equal(textures.size,2);
    assert.ok(view.impact);
    assert.deepEqual(view.ground.layers[0].image.position,{x:356,y:100});
    advance(500);
    assert.equal(view.impact,null);
    const ignitionFrame=view.ground.layers[1].pixels.data.slice();
    advance(effectMs-100);
    assert.notDeepEqual(view.ground.layers[1].pixels.data,ignitionFrame);
    advance(100);
    assert.equal(playback.active.view,view);
    assert.ok(Math.abs(view.ground.effect.t-(500+effectMs)/1000)<1e-8);
    advance(399);
    assert.equal(playback.active.view,view);
    advance(1,true);
    assert.notEqual(playback.active.view,view);
    assert.deepEqual(playback.active.anchor,{x:20,y:100,clamped:false});
    assert.equal(textures.size,1);
    playback.stop();
    assert.equal(textures.size,0);
    assert.equal(objects.size,0);
    player.x=100;
    aim.x=500;
  }
});

test('ground fire ignites outward at the configured radius and fades without slowing the source loop',()=>{
  for(const spread of [32,80,160]){
    const source={meta:{duration:3,options:{seed:4}},draw(p,time){samples.push({...p.position,alpha:p.fade,time});}};
    const effect=groundFire(source,{count:12,spread,expansion:{spreadMs:500,durationMs:5900,fadeMs:400}});
    const samples=[];
    const painter={place(x,y){this.position={x,y};}};
    const sample=time=>{
      samples.length=0;
      effect.drawBack(painter,time);
      effect.draw(painter,time);
      return samples.slice();
    };
    assert.deepEqual(sample(0),[{x:0,y:0,alpha:1,time:0}]);
    assert.equal(sample(0.25).length,4);
    const full=sample(0.5);
    assert.equal(full.length,12);
    assert.ok(full.every(site=>site.alpha===1));
    assert.ok(Math.abs(Math.max(...full.map(({x,y})=>Math.hypot(x,y)))-spread)<1);
    const later=sample(3.5);
    assert.ok(full.every((site,i)=>Math.abs(site.time-later[i].time)<1e-8));
    assert.ok(sample(5.7).every(site=>Math.abs(site.alpha-0.5)<1e-8));
    assert.ok(sample(5.9).every(site=>site.alpha===0));
  }
});

test('concurrent Campfire patches reuse their own textures, with an optional direct ignition',()=>{
  const {scene,objects,textures}=sceneFixture();
  const effect=LAB_EFFECTS['campfire-ground'];
  const instances=[32,80,160].map((areaRadiusPx,i)=>effect.create(
    scene,{x:420+i*25,y:304},0,VFX_LAB_PLAYER,{settings:{areaRadiusPx,projectileEnabled:false}},
  ));
  for(const view of instances){
    assert.equal(view.travelMs,0);
    assert.equal(view.durationMs,5900);
    view.update(0,0);
  }
  assert.equal(textures.size,6);
  const keys=[...textures.keys()];
  for(const view of instances){
    view.update(250,250);
    view.update(940,690);
    assert.equal(view.impact,null);
  }
  assert.deepEqual([...textures.keys()],keys);
  instances.forEach(view=>view.destroy());
  assert.equal(textures.size,0);
  assert.equal(objects.size,0);
});

test('healing and frost expand from the clamped target, animate during the configured hold and then fade',()=>{
  const cases=[['healing-ground',64,3000],['frost-ground',72,4000]];
  for(const [id,areaRadiusPx,defaultMs] of cases){
    const effect=LAB_EFFECTS[id];
    assert.deepEqual(defaultTiming(effect),{castMs:0,effectMs:defaultMs,castRangePx:160,areaRadiusPx});
    const {scene,objects,textures}=sceneFixture();
    const player={x:100,y:100};
    const aim={x:500,y:100};
    let effectMs;
    const playback=new VfxPlayback(LAB_EFFECTS,
      (stage,point,context)=>stage.create(scene,point,0,player,context),{settings:()=>({effectMs})});
    const advance=(ms,loop=false)=>{
      for(let passed=0;passed<ms;passed+=100)playback.update(Math.min(100,ms-passed),loop);
    };
    for(effectMs of [undefined,5000,8000]){
      playback.play(id,{captureAim:()=>clampSkillAim(player,aim,effect.castRangePx)});
      const {view}=playback.active;
      assert.equal(view.radius,areaRadiusPx);
      assert.deepEqual(view.floor.position,{x:260,y:100});
      assert.equal(view.floor.scale,0);
      assert.equal(textures.size,1);
      advance(200);
      assert.ok(view.floor.scale>0&&view.floor.scale<1);
      aim.y=140;
      advance(view.spreadMs-200);
      assert.equal(view.floor.scale,1);
      assert.equal(view.floor.alpha,1);
      assert.deepEqual(view.floor.position,{x:260,y:100});
      const firstFrame=view.detail.layers[0].pixels.data.slice();
      assert.ok(firstFrame.some((value,index)=>index%4===3&&value>0));
      advance(1250);
      assert.notDeepEqual(view.detail.layers[0].pixels.data,firstFrame);
      advance((effectMs??defaultMs)-1250);
      assert.equal(view.floor.alpha,1);
      advance(view.fadeMs-50);
      assert.ok(view.floor.alpha<0.1);
      assert.equal(view.detail.layers[0].image.alpha,view.floor.alpha);
      advance(50,true);
      assert.notEqual(playback.active.view,view);
      assert.ok(playback.active.anchor.y>100);
      assert.equal(textures.size,1);
      playback.stop();
      assert.equal(textures.size,0);
      assert.equal(objects.size,0);
      aim.y=100;
    }
  }
});

test('small, large and concurrent persistent areas use independent bounds and reuse their single texture',()=>{
  const {scene,objects,textures}=sceneFixture();
  const cases=[['healing-ground',32],['frost-ground',160],['healing-ground',160]];
  const views=cases.map(([id,areaRadiusPx])=>LAB_EFFECTS[id].create(
    scene,VFX_LAB_TARGET,0,VFX_LAB_PLAYER,{settings:{areaRadiusPx}},
  ));
  const keys=[...textures.keys()];
  assert.equal(keys.length,3);
  assert.deepEqual(views.map(view=>view.radius),[32,160,160]);
  for(const view of views){
    view.update(800,800);
    view.update(1800,1000);
    assert.equal(view.detail.frame.w,view.radius*2+20);
  }
  assert.deepEqual([...textures.keys()],keys);
  views.forEach(view=>view.destroy());
  assert.equal(textures.size,0);
  assert.equal(objects.size,0);
});
