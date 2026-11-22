import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LAB_BANKS, LAB_EFFECTS } from '../src/vfx/lab/effects.js';
import { bankShortcut } from '../src/vfx/lab/EffectHotbar.js';
import { preloadLabSheets } from '../src/vfx/lab/SheetSequence.js';
import { VfxPlayback } from '../src/vfx/lab/Playback.js';
import { resolveTiming } from '../src/vfx/lab/timing.js';
import { labSheets as sheets } from '../src/vfx/lab/sheetCatalog.js';

test('four banks cover the catalog once and preserve the surviving shortcut numbers',()=>{
  assert.equal(LAB_BANKS.length,4);
  for(const bank of LAB_BANKS){
    const keys=bank.keys??'1234567890';
    assert.equal(new Set(keys).size,bank.slots.length);
  }
  assert.equal(LAB_BANKS[3].slots[LAB_BANKS[3].keys.indexOf('4')],'drain');
  assert.equal(LAB_BANKS[3].slots[LAB_BANKS[3].keys.indexOf('8')],'skulls');
  const ids=LAB_BANKS.flatMap(bank=>bank.slots);
  assert.deepEqual([...ids].sort(),Object.keys(LAB_EFFECTS).sort());
  for(let i=0;i<10;i++)assert.deepEqual(bankShortcut({key:String((i+1)%10)}),{slot:i});
  assert.deepEqual(bankShortcut({key:'PageUp'}),{step:-1});
  assert.deepEqual(bankShortcut({key:'PageDown'}),{step:1});
  for(const event of [{key:'0',repeat:true},{key:'1',ctrlKey:true},{key:'ß'},{key:'!'},
    {key:'2',target:{isContentEditable:true}},{key:'PageDown',target:{closest:()=>true}}]){
    assert.equal(bankShortcut(event),null);
  }
});

test('every sheet is used, loads from the lab and has valid cells, pivots, posters and timings',()=>{
  const used=new Set();
  for(const effect of Object.values(LAB_EFFECTS)){
    for(const clips of Object.values(effect.variants??{})){
      for(const clip of clips){
        if(clip.sheet)used.add(clip.sheet);
        if(clip.missileSheet)used.add(clip.missileSheet);
      }
    }
  }
  assert.deepEqual([...used].sort(),Object.keys(sheets).sort());
  preloadLabSheets({load:{spritesheet(key,url,config){
    const name=key.slice('vfx-lab-sheet-'.length);
    const {width,height,frameMs,anchor,poster:[index,x,y,w,h]}=sheets[name];
    assert.equal(url,'/tools/vfx-lab/sheets/'+name+'.png');
    const png=readFileSync(new URL('..'+url,import.meta.url));
    assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],
      [width*Math.min(8,frameMs.length),height*Math.ceil(frameMs.length/8)]);
    assert.deepEqual(config,{frameWidth:width,frameHeight:height,endFrame:frameMs.length-1});
    assert.ok(frameMs.length>1&&frameMs.every(ms=>ms>0));
    assert.ok(index>=0&&index<frameMs.length&&w>0&&h>0&&x+w<=width&&y+h<=height);
    assert.ok(anchor[0]>=0&&anchor[0]<=width&&anchor[1]>=0&&anchor[1]<=height);
  }}},'/');
});

test('a layered meteor can switch variants, finish, loop and reset without leaving display objects',()=>{
  const live=new Set(),seen=new Map();
  function object(name){
    const obj={
      texture:{setFilter(){}},setScale(){return this;},setOrigin(){return this;},setDepth(){return this;},
      setFrame(frame){assert.ok(Number.isInteger(frame)&&frame>=0);return this;},
      setPosition(){return this;},clear(){return this;},lineStyle(){return this;},strokeEllipse(){return this;},
      lineBetween(){return this;},destroy(){assert.ok(live.delete(this));},
    };
    live.add(obj);seen.set(name,(seen.get(name)??0)+1);
    return obj;
  }
  const scene={add:{image:(x,y,key)=>object(key),graphics:()=>object('mark')}};
  let variant='Shower';
  const target={x:120,y:90},caster={x:30,y:80};
  const playback=new VfxPlayback(LAB_EFFECTS,(stage,anchor,ctx)=>stage.create(scene,anchor,0,caster,ctx),
    {settings:()=>({variant})});
  playback.play('meteor',{anchor:target});
  assert.equal(live.size,1);
  while(playback.active)playback.update(40,false);
  assert.equal(live.size,0);
  assert.equal(seen.get('vfx-lab-sheet-meteor'),3);
  variant='Original';
  playback.play('meteor',{anchor:target});
  const first=playback.active;
  while(playback.active===first)playback.update(40,true);
  assert.equal(seen.get('vfx-lab-sheet-meteor'),4);
  assert.equal(live.size,1);
  playback.stop();
  playback.stop();
  assert.equal(live.size,0);
});

test('portal preparation, channel duration and the twelve storm pulses keep their authored timing',()=>{
  const portal=LAB_EFFECTS.portal.variants['Ritual threshold'];
  assert.equal(portal[1].at,2450);
  assert.equal(resolveTiming(LAB_EFFECTS.portal,{variant:'Ritual threshold'}).durationMs,5250);
  assert.equal(resolveTiming(LAB_EFFECTS.beam,{variant:'Channel'}).durationMs,2500);
  assert.equal(resolveTiming(LAB_EFFECTS.beam).durationMs,1850);
  const strikes=LAB_EFFECTS.tempest.variants['Storm field'].filter(c=>c.sheet==='bolt');
  assert.equal(strikes.length,12);
  assert.ok(strikes.slice(1).every((c,i)=>c.at-strikes[i].at===300));
});

test('fireball chooses a single nearby point for the warning and secondary impact per cast',()=>{
  const positions=[];
  function object(){
    return {texture:{setFilter(){}},setPosition(x,y){positions.push([x,y]);return this;},
      setOrigin(){return this;},setDepth(){return this;},setScale(){return this;},setFrame(){return this;},
      clear(){return this;},lineStyle(){return this;},strokeEllipse(){return this;},lineBetween(){return this;},
      destroy(){}};
  }
  const scene={add:{image:(x,y)=>object().setPosition(x,y),graphics:object}};
  const random=[0,0.5];
  const view=LAB_EFFECTS.fireball.create(scene,{x:100,y:90},0,{x:30,y:80},{
    settings:{variant:'Echo blast'},random:()=>{assert.ok(random.length);return random.shift();},
  });
  const ratio=1870/LAB_EFFECTS.fireball.durationMs;
  view.update(680/ratio);
  assert.deepEqual(positions.at(-1),[133,90]);
  view.update(1070/ratio);
  assert.deepEqual(positions.at(-1),[133,90]);
  assert.equal(random.length,0);
  view.destroy();
});
