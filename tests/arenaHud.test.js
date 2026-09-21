import test from 'node:test';
import assert from 'node:assert/strict';
import { ArenaHudOverlay,healthPercent } from '../src/boss/ArenaHudOverlay.js';
import { PlayerHealthBar } from '../src/ui/PlayerHealthBar.js';

class FakeClassList {
  constructor(){this.values=new Set();}
  add(value){this.values.add(value);}
  remove(value){this.values.delete(value);}
  contains(value){return this.values.has(value);}
}

class FakeElement {
  constructor(tag){
    this.tagName=tag;this.children=[];this.attributes={};this.dataset={};this.classList=new FakeClassList();
    this.style={values:new Map(),setProperty:(key,value)=>this.style.values.set(key,value)};
    this.hidden=false;this.textContent='';this.parentElement=null;
  }
  append(...children){for(const child of children){child.parentElement=this;this.children.push(child);}}
  replaceChildren(...children){this.children=[];this.append(...children);}
  setAttribute(key,value){this.attributes[key]=value;}
  remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(child=>child!==this);this.parentElement=null;}
}

function fakeDocument(){return {createElement:tag=>new FakeElement(tag),body:new FakeElement('body'),defaultView:{requestAnimationFrame:callback=>callback()}};}

test('arena HTML HUD updates boss HP and phase',()=>{
  const documentRef=fakeDocument(),gameRoot=new FakeElement('div');
  const hud=new ArenaHudOverlay({game:{canvas:{parentElement:gameRoot}}},{documentRef});
  assert.equal(hud.bossHud.hidden,true);
  assert.equal(gameRoot.classList.contains('arena-hud-space'),true);
  hud.showBoss();assert.equal(hud.bossHud.hidden,false);
  assert.equal(hud.bossHud.classList.contains('visible'),true);
  hud.setBossHealth(34,100);hud.setPhase(3);hud.setBossName('DER DIREKTOR');
  assert.equal(hud.bossFill.style.values.get('--boss-health-percent'),'34%');
  assert.equal(hud.phase.textContent,'PHASE 3');assert.equal(hud.bossHp.textContent,'34 / 100 HP');
  assert.match(hud.bossHud.attributes['aria-label'],/Phase 3, 34 of 100 HP/i);
  assert.equal(hud.bossName.textContent,'DER DIREKTOR');
  assert.equal(healthPercent(120,100),100);assert.equal(healthPercent(-1,100),0);
  hud.hideBoss({immediate:true});assert.equal(hud.bossHud.hidden,true);
  hud.setVisible(false);assert.equal(gameRoot.classList.contains('arena-hud-space'),false);
  hud.setVisible(true);assert.equal(hud.bossHud.hidden,true);
  hud.destroy();
});

test('arena tutorial fades, can close immediately, and overlay cleanup removes all HTML',()=>{
  const documentRef=fakeDocument(),gameRoot=new FakeElement('div');
  const hud=new ArenaHudOverlay({game:{canvas:{parentElement:gameRoot}}},{documentRef});
  hud.showTutorial();assert.equal(hud.tutorial.hidden,false);assert.equal(hud.tutorial.classList.contains('visible'),true);
  assert.match(hud.tutorial.textContent,/SPACE or 0/);
  hud.hideTutorial({immediate:true});assert.equal(hud.tutorial.hidden,true);
  hud.destroy();assert.equal(gameRoot.children.length,0);assert.equal(hud.destroyed,true);
  assert.equal(gameRoot.classList.contains('arena-hud-space'),false);
});

function fakeGraphics(){
  return {visible:true,commands:[],clear(){this.commands=[];return this;},fillStyle(...args){this.commands.push(['fillStyle',...args]);return this;},
    fillRoundedRect(...args){this.commands.push(['rounded',...args]);return this;},fillRect(...args){this.commands.push(['rect',...args]);return this;},
    setVisible(value){this.visible=value;return this;},setPosition(x,y){this.position={x,y};return this;},setDepth(depth){this.depth=depth;return this;},destroy(){this.destroyed=true;}};
}

test('world player health bar is opt-in, follows the player and updates immediately',()=>{
  const graphics=fakeGraphics(),player={x:40,y:90,scene:{add:{graphics:()=>graphics}}};
  const bar=new PlayerHealthBar(player);assert.equal(bar.visible,false);assert.equal(graphics.visible,false);
  bar.setHealth(2,3).setVisible(true);
  assert.equal(graphics.visible,true);assert.deepEqual(graphics.position,{x:40,y:97});
  assert.ok(graphics.commands.some(command=>command[0]==='rect'&&command[3]===38*2/3));
  player.x=55;player.y=110;bar.updatePosition();assert.deepEqual(graphics.position,{x:55,y:117});
  bar.setVisible(false);assert.equal(graphics.visible,false);
});

test('legacy permanent attack hint is absent from the boss controller',async()=>{
  const source=await import('node:fs/promises').then(fs=>fs.readFile(new URL('../src/boss/BossController.js',import.meta.url),'utf8'));
  assert.equal(source.includes('SPACE: Attack'),false);
  assert.equal(source.includes('Player HP:'),false);
});
