import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CAMERA_ZOOM, cameraZoomForMap } from '../src/game/settings.js';
import { readFootObstacles, isFootPositionClear } from '../src/maps/footCollision.js';
import { SWAMP_RUN } from '../src/swamp/runConfig.js';
import { SwampRun, prepareCheckpoint } from '../src/swamp/SwampRun.js';
import { bindSwampCastInput, bindSwampMovementFocus } from '../src/swamp/swampCastInput.js';
import { CombatBout } from '../src/vfx/lab/CombatBout.js';
import { CombatSkillRunner } from '../src/vfx/lab/CombatSkillRunner.js';

const [entrance,southeast,north,ultimate]=SWAMP_RUN.checkpoints;
function collect(run,step){
  assert.equal(run.defeat(step.elite),true);
  assert.equal(run.defeat(step.elite),false);
  assert.equal(run.pendingDrop,step);
  assert.equal(run.collect(step.id),true);
  assert.equal(run.collect(step.id),false);
}

test('Swamp V3 is the only map with the experimental zoom factor',()=>{
  assert.equal(CAMERA_ZOOM.swampV3Factor,0.85);
  assert.equal(cameraZoomForMap('swamp-v3-large'),1.36);
  assert.equal(cameraZoomForMap('swamp'),1.6);
  assert.equal(cameraZoomForMap('arena'),1.3);
});

test('every reward location has room for player feet in the real map',()=>{
  const url=new URL('../public/assets/maps/swamp-v3-large.tmj',import.meta.url);
  const obstacles=readFootObstacles(JSON.parse(readFileSync(url)));
  for(const {drop} of SWAMP_RUN.checkpoints.filter(step=>step.drop)){
    assert.ok(isFootPositionClear(obstacles,{left:0,top:0,right:1920,bottom:1920},8,drop));
  }
});

for(const first of ['offense','survival'])test('ordered unlocks with '+first+' first',()=>{
  const run=new SwampRun();
  assert.equal(run.pendingChoice,entrance);
  assert.deepEqual(run.skills,[null,null,null,null]);
  assert.equal(run.defeat(southeast.elite),false);
  assert.equal(run.choose('ultimate','meteor'),false);
  assert.ok(run.choose('starter','fireball'));
  assert.equal(run.collect(southeast.id),false);
  assert.equal(run.defeat(ultimate.elite),false);
  collect(run,southeast);
  assert.deepEqual(run.offers().map(offer=>offer.id),['offense','survival']);
  assert.equal(run.choose('offense','fireball'),false);
  assert.equal(run.choose('ultimate','meteor'),false);
  run.setHealth(22);
  assert.ok(run.choose(first,first==='offense'?'lash':'drain'));
  assert.equal(run.hp,100);
  collect(run,north);
  const second=first==='offense'?'survival':'offense';
  assert.deepEqual(run.offers().map(offer=>offer.id),[second]);
  assert.ok(run.choose(second,second==='offense'?'lash':'drain'));
  collect(run,ultimate);
  assert.deepEqual(run.offers().map(offer=>offer.id),['ultimate']);
  assert.ok(run.choose('ultimate','meteor'));
  assert.equal(run.activeCheckpoint,ultimate);
  assert.equal(run.next,undefined);
});

test('pending drops and choices survive a reload, with respawn and restart restoring consistent state',()=>{
  const run=new SwampRun();
  assert.ok(run.choose('starter','lash'));
  assert.ok(run.defeat(southeast.elite));
  const afterDrop=new SwampRun(SWAMP_RUN,run.snapshot());
  assert.equal(afterDrop.pendingDrop,southeast);
  assert.ok(afterDrop.collect(southeast.id));
  const afterPickup=new SwampRun(SWAMP_RUN,afterDrop.snapshot());
  assert.equal(afterPickup.pendingDrop,undefined);
  assert.equal(afterPickup.pendingChoice,southeast);
  assert.ok(afterPickup.choose('survival','drain'));
  afterPickup.setHealth(0);
  assert.equal(afterPickup.respawn(),southeast);
  assert.equal(afterPickup.hp,100);
  assert.deepEqual(afterPickup.skills,['lash','drain',null,null]);
  assert.equal(afterPickup.defeat(southeast.elite),false);
  afterPickup.restart();
  assert.equal(afterPickup.pendingChoice,entrance);
  assert.deepEqual(afterPickup.skills,[null,null,null,null]);
  assert.equal(afterPickup.defeated.size+afterPickup.collected.size,0);
});

test('dev checkpoint jump sets legal prerequisites and creates only one pending reward',()=>{
  const run=new SwampRun();
  assert.ok(prepareCheckpoint(run,ultimate));
  assert.equal(run.pendingDrop,ultimate);
  assert.equal(run.skills[3],null);
  assert.equal(run.collected.size,2);
  assert.equal(run.activeCheckpoint,north);
  assert.ok(run.collect(ultimate.id));
  assert.equal(run.pendingChoice,ultimate);
  assert.equal(prepareCheckpoint(run,southeast),false);
  assert.equal(prepareCheckpoint(run,ultimate),false);
});

test('an editor input keeps Q for editing until the player returns to the canvas',()=>{
  const run=new SwampRun();
  assert.ok(run.choose('starter','fireball'));
  const bout=new CombatBout();
  bout.started=true;
  const runner=new CombatSkillRunner(bout);
  const input={closest:()=>input};
  const listeners=new Map();
  const listen=(type,callback)=>listeners.set(type,callback);
  const document={activeElement:input,defaultView:{addEventListener:listen}};
  const game={focus(){document.activeElement=game;}};
  const canvas={ownerDocument:document,closest:selector=>selector==='#game'?game:null,addEventListener:listen};
  const player={x:400,y:304,displayHeight:64};
  bindSwampCastInput(canvas,slot=>runner.use(slot,run.skills,player,()=>({x:500,y:285})));
  const pressQ=()=>{
    let used=false;
    listeners.get('keydown')({key:'q',target:document.activeElement,preventDefault(){used=true;}});
    return used;
  };
  assert.equal(pressQ(),false);
  collect(run,southeast);
  assert.ok(run.choose('offense','lance'));
  assert.equal(pressQ(),false);
  assert.equal(run.respawn(),southeast);
  runner.reset();
  listeners.get('pointerdown')({button:0});
  assert.equal(document.activeElement,game);
  assert.equal(pressQ(),true);
  assert.deepEqual(runner.actions.map(action=>action.skill.id),['fireball','lance']);
});

test('Swamp focus loss resets Phaser movement and only a fresh game key press can resume it',()=>{
  const window=new EventTarget(), document=new EventTarget(), canvas=new EventTarget(), game=new EventTarget();
  document.defaultView=window;
  canvas.ownerDocument=document;
  canvas.closest=()=>game;
  game.contains=target=>target===game;
  const editorInput=new EventTarget();
  editorInput.closest=selector=>selector==='.swamp-editor'?editorInput:null;
  let down=false,velocity=0,active=true;
  const manager={queue:[]};
  const scene={game:{canvas},sys:{isActive:()=>active},input:{keyboard:{manager,resetKeys(){down=false;}}},
    player:{setVelocity(x){velocity=x;}}};
  const fire=(target,type,fields={})=>{
    const event=new Event(type,{cancelable:true});
    for(const [key,value] of Object.entries(fields))Object.defineProperty(event,key,{value});
    let stopped=false;
    event.stopPropagation=()=>{stopped=true;};
    target.dispatchEvent(event);
    return {stopped,defaultPrevented:event.defaultPrevented};
  };
  const press=(target=game,repeat=false)=>{
    const result=fire(document,'keydown',{key:'w',target,repeat});
    if(!result.stopped){down=true;velocity=-128;}
    return result;
  };
  const controller=new AbortController();
  bindSwampMovementFocus(scene,controller.signal);
  for(const loseFocus of [
    ()=>fire(window,'blur'),
    ()=>{document.hidden=true;fire(document,'visibilitychange');document.hidden=false;},
    ()=>fire(game,'focusout',{relatedTarget:editorInput}),
    ()=>fire(document,'focusin',{target:editorInput}),
  ]){
    press();
    const interact={type:'keydown',key:'e'};
    manager.queue=[{type:'keydown',key:'w'},interact];
    loseFocus();
    assert.deepEqual([down,velocity],[false,0]);
    assert.deepEqual(manager.queue,[interact]);
    assert.equal(press(game,true).stopped,true);
    assert.deepEqual([down,velocity],[false,0]);
    assert.equal(press().stopped,false);
    assert.equal(down,true);
  }
  assert.deepEqual(press(editorInput),{stopped:true,defaultPrevented:false});
  assert.equal(fire(canvas,'contextmenu').defaultPrevented,true);
  assert.equal(fire(editorInput,'contextmenu').defaultPrevented,false);
  active=false;
  assert.equal(fire(canvas,'contextmenu').defaultPrevented,false);
  active=true;
  controller.abort();
  assert.equal(fire(canvas,'contextmenu').defaultPrevented,false);
});
