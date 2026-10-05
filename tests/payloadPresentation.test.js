import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { payloadCartFrame,PAYLOAD_CART_ASSET,payloadTheme } from '../src/pvp/payload/visualConfig.js';
import { PayloadDialogue,PAYLOAD_DIALOGUE } from '../src/pvp/payload/PayloadDialogue.js';
import { PayloadView } from '../src/pvp/payload/PayloadView.js';
import { PayloadCollider } from '../src/pvp/payload/PayloadCollider.js';

test('selected cart is the single 128 x 64 blue-screen sprite; legacy animation remains available',()=>{
  const png=readFileSync(new URL('../public/'+PAYLOAD_CART_ASSET.path,import.meta.url));
  assert.equal(png.readUInt32BE(16),PAYLOAD_CART_ASSET.frameWidth);
  assert.equal(png.readUInt32BE(20),PAYLOAD_CART_ASSET.frameHeight);
  assert.equal(PAYLOAD_CART_ASSET.frameWidth,128);assert.equal(PAYLOAD_CART_ASSET.frameHeight,64);
  assert.equal(payloadTheme().animation,false);assert.equal(payloadTheme().speech,true);
  for(let t=0;t<10000;t+=37)for(const moving of [true,false])assert.ok([0,1,2,3].includes(payloadCartFrame(t,moving)));
  assert.notEqual(payloadCartFrame(0,true),payloadCartFrame(200,true));
  assert.equal(payloadTheme({sprite:'other-cart'}).animation,false);
});

test('cart speech alternates speakers, avoids repeats, follows cart and resets/cleans up',()=>{
  let now=0;
  const prompt={setText(text){this.text=text;return this;},setVisible(v){this.visible=v;return this;},
    setPosition(x,y){this.x=x;this.y=y;return this;},destroy(){this.destroyed=true;}};
  const dialogue=new PayloadDialogue({}, {now:()=>now,random:()=>0,promptFactory:()=>prompt});
  const position={x:100,y:200};
  dialogue.update(position,true,true);assert.equal(prompt.visible,false);
  now=3500;dialogue.update(position,true,true);assert.match(prompt.text,/^Monitor:/);
  const first=prompt.text;assert.equal(prompt.y,200+PAYLOAD_DIALOGUE.speakers[0].y);
  dialogue.update({x:120,y:210},true,true);assert.equal(prompt.x,120+PAYLOAD_DIALOGUE.speakers[0].x);
  now+=4500;dialogue.update(position,true,true);assert.equal(prompt.visible,false);
  now+=9000;dialogue.update(position,true,true);assert.match(prompt.text,/^Drucker:/);
  now+=13500;dialogue.update(position,true,true);assert.match(prompt.text,/^Monitor:/);assert.notEqual(prompt.text,first);
  dialogue.update(position,true,false);assert.equal(prompt.visible,false);
  dialogue.reset();assert.equal(prompt.visible,false);assert.equal(dialogue.speakerIndex,0);
  dialogue.destroy();assert.equal(prompt.destroyed,true);
});

test('single-frame sprite never requests animation frames or moves authoritative payload',()=>{
  const objects=[];
  const node=()=>{
    const value={destroy(){this.destroyed=true;},setFrame(frame){this.frame=frame;return this;}};
    for(const method of ['setOrigin','setScale','setDepth','setVisible','setPosition','setAlpha','setText','lineStyle','beginPath','lineTo','moveTo','strokePath','fillStyle','fillCircle','clear','strokeCircle'])value[method]=()=>value;
    objects.push(value);return value;
  };
  const source={layers:[{name:'PayloadRoute',type:'objectgroup',objects:[{name:'payload-route',x:0,y:0,polyline:[{x:0,y:0},{x:100,y:0}]}]},
    {name:'Notes',type:'objectgroup',objects:[{name:'spawnBlue',x:0,y:0},{name:'spawnRed',x:100,y:0}]}]};
  let now=0;
  const view=new PayloadView({source,textures:{exists:()=>true},add:{graphics:node,text:node,image:node}}, {now:()=>now,config:{showRoute:false}});
  const payload={x:50,y:0,moving:true};
  view.render({state:'active',payload});assert.equal(view.cart.frame,undefined);
  now=200;view.render({state:'active',payload});assert.equal(view.cart.frame,undefined);
  assert.deepEqual(payload,{x:50,y:0,moving:true});
  view.reset();assert.deepEqual(view.position,{x:50,y:0});
  view.destroy();assert.ok(objects.every(object=>object.destroyed));
});

test('cart collision follows its center, updates the physics body and removes collider on exit',()=>{
  let syncs=0;
  const zone={body:{enable:true,updateFromGameObject(){syncs++;}},
    setPosition(x,y){this.x=x;this.y=y;},destroy(){this.destroyed=true;}};
  const collider={destroy(){this.destroyed=true;}},player={body:{}};
  const scene={player,add:{zone(x,y,w,h){assert.deepEqual([w,h],[64,22]);return zone;}},
    physics:{add:{existing(value,isStatic){assert.equal(value,zone);assert.equal(isStatic,true);},
      collider(a,b){assert.equal(a,player);assert.equal(b,zone);return collider;}}}};
  const obstacle=new PayloadCollider(scene,{width:64,height:22,offsetX:0,offsetY:-20});
  obstacle.update({x:100,y:200});assert.deepEqual([zone.x,zone.y],[100,180]);
  obstacle.update({x:120,y:210});assert.deepEqual([zone.x,zone.y],[120,190]);assert.equal(syncs,2);
  obstacle.update({x:120,y:210},false);assert.equal(zone.body.enable,false);
  obstacle.update({x:50,y:100});assert.equal(zone.body.enable,true);
  obstacle.destroy();assert.ok(zone.destroyed&&collider.destroyed);
});
