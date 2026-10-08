import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { CurrencyHud } from '../src/economy/CurrencyHud.js';
import { CurrencyClient } from '../src/economy/CurrencyClient.js';
import { GameHudController,bindSceneHud } from '../src/hud/GameHudController.js';
import { PVP_MAP,PVP_MAP_FILE,PVP_MAP_DEFINITION,PVP_INSPECTION_SCENE } from '../src/pvp/config.js';

// Use the real scene constructors/configuration without starting Phaser's renderer.
const sceneNames=['MapScene','PvpMapScene','PvpArenaScene','ArenaScene','PayloadMapScene'];
const source=sceneNames.map(name=>readFileSync(new URL(`../src/scenes/${name}.js`,import.meta.url),'utf8')
  .replace(/^import[\s\S]*?;\r?\n/gm,'').replaceAll('import.meta.env','({})').replace('export class ','class ')).join('\n');
const scenes=runInNewContext(`${source}\n({${sceneNames.join(',')}})`,{
  Phaser:{Scene:class {constructor(){this.events=new EventEmitter();}}},
  PVP_MAP,PVP_MAP_FILE,PVP_MAP_DEFINITION,PVP_INSPECTION_SCENE,
});

class Node {
  constructor(){this.hidden=false;this.children=[];this.dataset={};this.attributes={};this.textContent='';}
  append(...children){this.children.push(...children);}
  setAttribute(key,value){this.attributes[key]=value;}
  remove(){this.removed=true;}
}
function fixture(){
  const shell=new Node(),bottom=new Node();
  const documentRef={createElement:()=>new Node(),getElementById:id=>({'game-shell':shell,'bottom-hud':bottom})[id]};
  const view=new CurrencyHud({documentRef});
  const hud=Object.assign(Object.create(GameHudController.prototype),{root:shell});
  const callbacks=[];let unsubscribed=0;
  const presence={api:{currency:{balance:'balance'}},client:{onUpdate(_api,_args,receive){
    callbacks.push(receive);return ()=>unsubscribed++;
  }}};
  const client=new CurrencyClient(presence,view);client.start('test-profile');
  return {shell,bottom,view,hud,client,callbacks,get unsubscribed(){return unsubscribed;}};
}

test('normal maps mount one compact currency view inside the frame, leaving the bottom HUD empty',()=>{
  const f=fixture(),map=new scenes.MapScene('school','classroom.tmj');
  bindSceneHud(map,f.hud);f.callbacks[0]({coins:46});
  assert.equal(f.shell.dataset.currencyVisible,'true');assert.equal(f.view.root.hidden,false);
  assert.deepEqual(f.shell.children,[f.view.root]);assert.equal(f.bottom.children.length,0);
  assert.equal(f.view.value.textContent,'46');assert.equal(f.view.root.attributes['aria-label'],'46 coins');
  f.client.destroy();
});

test('live balance updates and the existing gain feedback continue updating',()=>{
  const f=fixture();f.callbacks[0]({coins:46});f.callbacks[0]({coins:49});
  assert.equal(f.view.value.textContent,'49');assert.equal(f.view.gain.textContent,'+3');
  f.callbacks[0]({coins:44});assert.equal(f.view.value.textContent,'44');
  assert.equal(f.callbacks.length,1);f.client.destroy();
});

for(const mode of ['tdm','payload'])test(`${mode} hides currency through the shared PvP scene policy and returning restores the current balance`,()=>{
  const f=fixture(),normal=new scenes.MapScene('school','classroom.tmj');
  bindSceneHud(normal,f.hud);f.callbacks[0]({coins:46});normal.events.emit('sleep');
  const combat=new scenes.PvpArenaScene();combat.matchState={mode};
  bindSceneHud(combat,f.hud);assert.equal(f.shell.dataset.currencyVisible,'false');
  f.callbacks[0]({coins:51});assert.equal(f.view.value.textContent,'51');
  assert.equal(f.shell.dataset.currencyVisible,'false','a subscription update must not show the combat counter');
  combat.events.emit('wake');assert.equal(f.shell.dataset.currencyVisible,'false');
  combat.events.emit('shutdown');normal.events.emit('wake');
  assert.equal(f.shell.dataset.currencyVisible,'true');assert.equal(f.view.root.hidden,false);
  assert.equal(f.view.value.textContent,'51');assert.equal(f.callbacks.length,1);assert.equal(f.unsubscribed,0);
  assert.equal(combat.events.listenerCount('wake'),0);f.client.destroy();
});

test('Director arena, PvP inspection and future PvP maps inherit the combat HUD policy',()=>{
  const f=fixture();
  for(const scene of [new scenes.ArenaScene(),new scenes.PayloadMapScene(),new scenes.PvpMapScene('future-pvp')]){
    bindSceneHud(scene,f.hud);assert.equal(f.shell.dataset.currencyVisible,'false');
    scene.events.emit('shutdown');assert.equal(scene.events.listenerCount('wake'),0);
  }
  f.client.destroy();
});

test('currency styles anchor inside the top-right corner and honor the shared visibility flag',()=>{
  const css=readFileSync(new URL('../src/economy/currency.css',import.meta.url),'utf8');
  const position=/\.hud-currency\s*\{([^}]+)\}/.exec(css)[1];
  assert.match(position,/top:clamp\(/);assert.match(position,/right:clamp\(/);
  assert.doesNotMatch(position,/left:|bottom:/);
  assert.match(css,/#game-shell\[data-currency-visible="false"\] \.hud-currency,[\s\S]*?\{display:none;\}/);
  assert.doesNotMatch(css,/#bottom-hud/);
});
