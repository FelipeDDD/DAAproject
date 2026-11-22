import test from 'node:test';
import assert from 'node:assert/strict';
import { cropReactionActor } from '../src/vfx/lab/reactionActor.js';
import { REACTIONS } from '../src/vfx/lab/targetReactions.js';
import { createFrame,clearFrame,createFx } from '../src/vfx/lab/vendor/pixelfx/core/index.js';
import { LAB_EFFECTS } from '../src/vfx/lab/effects.js';
import { grovePulse } from '../src/vfx/lab/SheetSequence.js';
import { precisionView,handOf,lashTip } from '../src/vfx/lab/precisionDemo.js';
import { smokeAlpha } from '../src/vfx/lab/visibilityDemo.js';

test('all six reactions render on the supplied mask and pixels with transparent padding removed',()=>{
  const rgba=new Uint8Array(22*36*4);
  for(let y=2;y<33;y++)for(let x=4;x<18;x++)rgba.set([139,119,97,255],(y*22+x)*4);
  const f=cropReactionActor(rgba,22,36);
  assert.deepEqual([f.actor.w,f.actor.h,f.actor.pixels[0]>>>0],[14,31,0xff61778b]);
  assert.equal(f.pivotY,33/36);
  assert.deepEqual(Object.keys(REACTIONS),['Burning','Poisoned','Frozen','Electrified','Stunned','Slowed']);
  for(const fx of Object.values(REACTIONS)){
    const render=createFx(fx,{actor:f.actor});
    const frame=createFrame(...fx.meta.size,-fx.meta.origin[0],-fx.meta.origin[1]);
    for(const dt of [0.14,0.37,1.1]){
      render.update(dt);clearFrame(frame);render.draw(frame);
      assert.ok(frame.color.some(Boolean),fx.meta.name);
    }
  }
});

test('approved defaults retain the original smoke option, cold melee and native portal timing',()=>{
  const smoke=LAB_EFFECTS['smoke-burst'];
  assert.equal(smoke.variantRadius.Camouflage.defaultPx,96);
  assert.ok(smoke.variants['Smoke screen']);
  const center={x:0,y:0};
  assert.equal(smokeAlpha(center,center,96,'blue'),0.8);
  assert.equal(smokeAlpha(center,center,96,'red'),0);
  assert.deepEqual(Object.keys(LAB_EFFECTS.flurry.variants),['Original']);
  assert.equal(LAB_EFFECTS.flurry.variants.Original[0].sheet,'pfx-ice-daggers');
  assert.equal(LAB_EFFECTS.portal.defaultVariant,'Runic passage');
});

test('grove grants visual haste once to allies within the ground ellipse',()=>{
  const g={setPosition(){return this;},setDepth(){return this;},clear(){return this;},lineStyle(){return this;},strokeEllipse(){return this;}};
  const calls=[],ally={x:0,y:0},outside={x:0,y:32};
  const pulse=grovePulse({player:outside,allyDummy:ally,target:{x:0,y:0},add:{graphics:()=>g},
    reactions:{apply:(...args)=>calls.push(args)}},{x:0,y:0});
  pulse.draw(0);pulse.draw(0.5);pulse.draw(0.99);
  assert.deepEqual(calls,[[ally,'Haste',1700]]);
});

test('precision hits report once, use live target position at crack and never report misses',()=>{
  const g={clear(){return this;},setDepth(){return this;},lineStyle(){return this;},strokeCircle(){return this;},
    fillStyle(){return this;},fillCircle(){return this;},fillRect(){return this;},lineBetween(){return this;}};
  const victim={x:130,y:88,displayHeight:50},player={x:0,y:0,displayHeight:0},aim={x:110,y:0},hits=[];
  const scene={add:{graphics:()=>g},target:victim,previewHit:(sprite,point)=>hits.push({sprite,...point})};
  const run=(precision,ms)=>precisionView(scene,{precision,ms},aim,player,()=>aim);
  const lash=run('tip',810);lash.draw(0);
  const tip=lashTip(handOf(player),aim);victim.x=tip.x;victim.y=tip.y+21;
  lash.draw(0.26);lash.draw(0.27);
  assert.equal(hits.length,1);assert.equal(hits[0].sprite,victim);
  const drain=run('drain',1350);drain.draw(0);drain.draw(0.3);
  assert.equal(hits.length,2);
  victim.y+=35;
  run('tip',810).draw(0.3);run('drain',1350).draw(0.3);
  assert.equal(hits.length,2);
});
