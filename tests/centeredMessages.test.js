import test from 'node:test';
import assert from 'node:assert/strict';
import { WorldPrompt,centeredMessageViewport,worldToViewport } from '../src/ui/WorldPrompt.js';

test('general messages stay in the same screen position while the camera moves or stops at map edges',()=>{
  const canvas={left:100,top:50,width:960,height:540,right:1060,bottom:590};
  const scene={game:{canvas:{getBoundingClientRect:()=>canvas}},
    scale:{gameSize:{width:800,height:450}},cameras:{main:{zoom:1.5,scrollX:0,scrollY:0}}};
  const centered=centeredMessageViewport(scene,80);
  assert.deepEqual(centered,{x:580,y:464,canvas});
  scene.cameras.main.scrollX=500;
  scene.cameras.main.scrollY=200;
  assert.deepEqual(centeredMessageViewport(scene,80),centered);
  scene.cameras.main.zoom=2;
  assert.equal(centeredMessageViewport(scene,80).y,512);
});

test('character speech follows its world position separately from centered interaction messages',()=>{
  const canvas={left:100,top:50,width:960,height:540};
  const camera={zoom:1.5,scrollX:0,
    getViewMatrix(){return {transformPoint:(x,y)=>({x:x-this.scrollX,y})};}};
  const scene={game:{canvas:{getBoundingClientRect:()=>canvas}},
    scale:{gameSize:{width:800,height:450}},cameras:{main:camera}};
  const speechBefore=worldToViewport(scene,240,120);
  const generalBefore=centeredMessageViewport(scene,80);
  camera.scrollX=100;
  assert.equal(worldToViewport(scene,240,120).x,speechBefore.x-120);
  assert.deepEqual(centeredMessageViewport(scene,80),generalBefore);
});

test('an offscreen speech bubble stays visible at the canvas edge',()=>{
  const originalDocument=globalThis.document;
  const root={hidden:true,style:{},offsetWidth:160,offsetHeight:32,
    setAttribute(){},classList:{toggle(){}},remove(){}};
  globalThis.document={createElement:()=>root,body:{append(){}}};
  try{
    const canvas={left:0,top:0,width:800,height:450,right:800,bottom:450};
    const scene={game:{canvas:{getBoundingClientRect:()=>canvas}},
      scale:{gameSize:{width:800,height:450}},
      cameras:{main:{getViewMatrix:()=>({transformPoint:(x,y)=>({x,y})})}}};
    const bubble=new WorldPrompt(scene,'Hallo',{clamp:true});
    bubble.setPosition(-200,-200).setVisible(true);
    assert.equal(bubble.visible,true);
    assert.equal(root.style.left,'90px');
    assert.equal(root.style.top,'42px');
    bubble.setPosition(1200,1200);
    assert.equal(root.style.left,'710px');
    assert.equal(root.style.top,'440px');
    bubble.destroy();
  }finally{globalThis.document=originalDocument;}
});
