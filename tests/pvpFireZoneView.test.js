import test from 'node:test';
import assert from 'node:assert/strict';
import { FireZoneView } from '../src/pvp/skills/views/fire-zone/FireZoneView.js';
import { FIRE_ZONE_VISUAL } from '../src/pvp/skills/views/fire-zone/visualConfig.js';
import { SkillView } from '../src/pvp/skills/SkillView.js';

function fixture(){
  const objects=[];
  const scene={input:{manager:{defaultCursor:'default'},setDefaultCursor(cursor){this.manager.defaultCursor=cursor;}},add:{graphics(){
    const g={pixels:[],clears:0,destroyCalls:0};objects.push(g);
    for(const method of ['setDepth','setPosition','fillStyle','fillCircle','lineStyle','strokeCircle'])g[method]=()=>g;
    g.clear=()=>{g.clears++;g.pixels=[];return g;};
    g.fillRect=(...pixel)=>{g.pixels.push(pixel);return g;};
    g.setVisible=value=>{g.visible=value;return g;};
    g.destroy=()=>g.destroyCalls++;
    return g;
  }}};
  return {scene,objects};
}
const snapshot={x:250,y:300,radius:56,phase:'telegraph',activeAt:1000,endsAt:6000};

test('telegraph waits for the server phase, then animates pixels within the damage area',()=>{
  const {scene,objects}=fixture(),view=new FireZoneView(scene,snapshot);
  view.render(snapshot,2000);assert.equal(objects[0].pixels.length,0);
  const active={...snapshot,phase:'active'},before=structuredClone(active);
  view.render(active,2000);const first=structuredClone(objects[0].pixels);
  assert.ok(first.length>100);
  assert.equal(view.flames.length,49);
  assert.ok(view.flames.filter(p=>Math.hypot(p.x,p.y)>active.radius*.9).length>=16,'flames reach the perimeter');
  view.render(active,2001);assert.deepEqual(objects[0].pixels,first);
  view.render(active,2000+FIRE_ZONE_VISUAL.flameFrameMs);
  assert.notDeepEqual(objects[0].pixels,first);
  for(const [x,y,width,height] of objects[0].pixels){
    for(const corner of [[x,y],[x+width,y],[x,y+height],[x+width,y+height]])assert.ok(Math.hypot(...corner)<=active.radius);
  }
  assert.deepEqual(active,before);assert.equal(objects.length,1);
  view.destroy();
});

test('target preview reuses graphics, changes cursor and restores it on cancel/round cleanup',()=>{
  const {scene,objects}=fixture(),view=new SkillView(scene);
  const preview={skillId:'fire-zone',x:250,y:300,radius:56,clamped:false};
  view.renderTargeting(preview);assert.equal(scene.input.manager.defaultCursor,'crosshair');
  for(let frame=0;frame<20;frame++)view.renderTargeting({...preview,x:250+frame,clamped:true});
  assert.equal(objects.length,1);assert.equal(view.items.size,0,'preview never creates a gameplay instance');
  view.renderTargeting(null);assert.equal(scene.input.manager.defaultCursor,'default');assert.equal(objects[0].visible,false);
  view.renderTargeting(preview);view.reset(1);assert.equal(objects[0].destroyCalls,1);
  assert.equal(scene.input.manager.defaultCursor,'default');
  view.renderTargeting(preview);view.destroy();assert.equal(objects[1].destroyCalls,1);
  assert.equal(scene.input.manager.defaultCursor,'default');
});

test('visual cleanup/recreation owns no timers and never overrides server lifetime',()=>{
  const {scene,objects}=fixture(),active={...snapshot,phase:'active'};
  const view=new FireZoneView(scene,active);view.render(active,999999);
  assert.ok(objects[0].pixels.length>0,'no local expiry even after endsAt');
  view.destroy();view.destroy();const clears=objects[0].clears;
  view.render(active,1000000);assert.equal(objects[0].clears,clears);assert.equal(objects[0].destroyCalls,1);
  const next=new FireZoneView(scene,active);next.render(active,2000);
  assert.ok(objects[1].pixels.length>0);next.destroy();assert.equal(objects[1].destroyCalls,1);
});
