import assert from 'node:assert/strict';
import test from 'node:test';
import { LAB_EFFECTS } from '../src/vfx/lab/effects.js';
import { proximityTrigger, createEncounter } from '../src/vfx/lab/proximityDemo.js';
import { smokeScreen } from '../src/vfx/lab/pixelCombinations.js';

test('Copper Lash follows both a moving hand and the live cursor without restarting its frames',()=>{
  const player={x:100,y:100,displayHeight:64,body:{center:{x:100,y:92}}};
  let aim={x:180,y:70};
  const image={
    texture:{setFilter(){}},setOrigin(){return this;},setDepth(d){this.depth=d;return this;},
    setScale(){return this;},setPosition(x,y){this.pos=[x,y];return this;},
    setRotation(a){this.angle=a;return this;},setFrame(n){this.frame=n;return this;},destroy(){},
  };
  const g={clear(){return this;},setDepth(){return this;},lineStyle(){return this;},strokeCircle(){return this;},destroy(){}};
  const view=LAB_EFFECTS.lash.create({target:{x:240,y:100,displayHeight:64},add:{image:()=>image,graphics:()=>g}},
    aim,0,player,{captureAim:()=>aim});
  view.update(40);
  const first=image.frame;
  player.y+=16;player.body.center={x:128,y:108};aim={x:60,y:80};
  view.update(200);
  assert.deepEqual(image.pos,[128,108-64*0.34]);
  assert.ok(Math.cos(image.angle)<0);
  assert.equal(image.depth,player.y+4);
  assert.ok(image.frame>first);
  view.destroy();
});

test('smoke spreads to larger radii by adding bounded, independently phased fixed-size plumes',()=>{
  const small=smokeScreen(32),large=smokeScreen(144);
  assert.equal(large.length,64);
  assert.ok(small.length<large.length);
  assert.deepEqual(smokeScreen(9999),large);
  assert.ok(large.every(c=>c.scale===small[0].scale&&c.at+c.ms===3800));
  assert.ok(large.some(c=>Math.hypot(...c.offset)>125));
  assert.equal(new Set(large.map(c=>c.smokePhase)).size,large.length);
});

test('a mine waits for actual range and spends one charge; an altar can acquire distinct targets',()=>{
  const one=proximityTrigger(32,1),many=proximityTrigger(32);
  const a={id:'a',x:33,y:0,team:'red'},b={id:'b',x:0,y:-32,team:'red'};
  assert.deepEqual(one([{id:'ally',team:'blue',x:0,y:0}]),[]);
  assert.deepEqual(one([a]),[]);
  assert.deepEqual(many([a]),[]);
  a.x=32;
  assert.deepEqual(one([a,b]),[a]);
  assert.deepEqual(one([b]),[]);
  assert.deepEqual(many([a]),[a]);
  assert.deepEqual(many([a,b]),[b]);
  assert.deepEqual(many([a,b]),[]);
});

test('mine consumption and skull releases are local to one cast and release every temporary object',()=>{
  for(const [id,variant] of [['sporecap','Proximity mine'],['skulls','Original']]){
    const base=LAB_EFFECTS[id].variants[variant][0];
    for(const stop of [0.1,0.44,0.98]){
      const objects=new Set(),layers=[];
      function object(){
        const obj={
          setPosition(){return this;},setDepth(){return this;},setVisible(v){this.visible=v;return this;},
          clear(){return this;},strokeCircle(){return this;},lineStyle(){return this;},strokeEllipse(){return this;},
          fillStyle(){return this;},fillCircle(){return this;},fillTriangle(){return this;},
          destroy(){assert.ok(objects.delete(this));},
        };
        objects.add(obj);return obj;
      }
      const view=createEncounter({add:{graphics:object}},base,{x:50,y:80},clip=>{
        const layer={clip,object:object(),draw(t){this.t=t;}};
        layers.push(layer);return layer;
      });
      for(let ms=0;ms<=base.ms*stop;ms+=30)view.draw(ms/base.ms);
      if(id==='sporecap'){
        if(stop===0.1)assert.equal(layers[0].t,0.12);
        if(stop===0.98)assert.equal(layers[0].object.visible,false);
      }else if(stop===0.98){
        assert.equal(layers.filter(l=>l.clip.sheet==='pfx-skull').length,2);
        assert.equal(layers.filter(l=>l.clip.sheet==='spark').length,2);
      }
      view.object.destroy();
      assert.equal(objects.size,0);
    }
  }
});
