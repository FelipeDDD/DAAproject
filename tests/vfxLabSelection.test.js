import assert from 'node:assert/strict';
import test from 'node:test';
import { LAB_EFFECTS } from '../src/vfx/lab/effects.js';
import { labSheets } from '../src/vfx/lab/sheetCatalog.js';
import { resolveTiming } from '../src/vfx/lab/timing.js';
import { proximityTrigger } from '../src/vfx/lab/proximityDemo.js';
import { smokeAlpha } from '../src/vfx/lab/visibilityDemo.js';
import { drainHit, lashTip, LASH, orbPosition } from '../src/vfx/lab/precisionDemo.js';

test('camouflage respects the ground ellipse, both perspectives and adjustable shared opacity',()=>{
  const center={x:40,y:80},edge={x:40,y:108},outside={x:40,y:109};
  for(const observer of ['blue','red']){
    const enemy=observer==='blue'?'red':'blue';
    assert.equal(smokeAlpha(edge,center,40,enemy,{observer}),0);
    assert.equal(smokeAlpha(edge,center,40,observer,{observer,opacity:0.45}),0.45);
    assert.equal(smokeAlpha(edge,center,40,enemy,{observer,mode:'all',opacity:0.6}),0.6);
    assert.equal(smokeAlpha(outside,center,40,enemy,{observer}),1);
  }
});

test('sentry and mine ignore allies even when the ally enters first; cooldown is per enemy',()=>{
  const ally={team:'blue',id:0,x:0,y:0},a={team:'red',id:1,x:0,y:54},b={...a,id:2,x:55,y:0};
  const enter=proximityTrigger(54,Infinity,1000),mine=proximityTrigger(54,1);
  assert.deepEqual(mine([ally],0),[]);
  assert.deepEqual(mine([ally,a],10),[a]);
  assert.deepEqual(enter([ally,a,b],10),[a]);
  b.x=52;
  assert.deepEqual(enter([ally,a,b],110),[b]);
  assert.deepEqual(enter([ally,a,b],1009),[]);
  assert.deepEqual(enter([ally,a,b],1010),[a]);
  assert.deepEqual(mine([b],2000),[]);
});

test('lash tip has fixed reach and drain only connects along the finite narrow release ray',()=>{
  const hand={x:0,y:0},east=lashTip(hand,{x:500,y:0});
  assert.deepEqual(east,lashTip(hand,{x:5,y:0}));
  assert.ok(Math.abs(east.x-LASH.reach)<0.01);
  assert.equal(LAB_EFFECTS.lash.castRangePx,undefined);
  const aim={x:150,y:0};
  assert.ok(drainHit(hand,aim,{x:80,y:6}));
  assert.ok(!drainHit(hand,aim,{x:80,y:8}));
  assert.ok(!drainHit(hand,aim,{x:160,y:0}));
  for(const distance of [28,215]){
    const target={x:distance,y:0},movingHand={x:-15,y:17};
    for(let i=0;i<4;i++){
      assert.equal(orbPosition(i,0,target,hand).x,distance);
      const end=orbPosition(i,1,target,movingHand);
      assert.ok(end.done&&Math.hypot(end.x-movingHand.x,end.y-movingHand.y)<1e-8);
    }
  }
});

test('extra snare wait and Life Steal charge run independently from Fire Ring casting toggle',()=>{
  const base=resolveTiming(LAB_EFFECTS.snare,{},false);
  assert.equal(base.castMs,600);
  assert.equal(base.durationMs,2970);
  assert.equal(resolveTiming(LAB_EFFECTS.snare,{castMs:1100}).durationMs,base.durationMs);
  assert.equal(resolveTiming(LAB_EFFECTS.drain,{},false).castMs,750);
  const stages=LAB_EFFECTS.portal.variants['Runic passage'];
  for(const c of stages){
    const native=labSheets[c.sheet].frameMs.reduce((sum,n)=>sum+n,0);
    const [a,b]=c.frames??[0,1];
    assert.ok(Math.abs(c.ms-native*(b-a))<0.001);
  }
});
