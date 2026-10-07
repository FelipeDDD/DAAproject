import test from 'node:test';
import assert from 'node:assert/strict';
import { BossDevTools } from '../src/boss/BossDevTools.js';
import { devPuzzleOneAnswerEnabled,DEV_PUZZLE_ONE_ANSWER_KEY } from '../src/boss/devPuzzleSettings.js';
import { coopArenaEnabled,setCoopArenaEnabled } from '../src/boss/devArenaSettings.js';

class Element {
  constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.events={};}
  append(...children){this.children.push(...children);}
  addEventListener(name,callback){this.events[name]=callback;}
  setAttribute(name,value){this.attributes[name]=value;}
  querySelectorAll(tag){const tags=tag.split(',').map(value=>value.trim());return this.children.flatMap(child=>[...(tags.includes(child.tag)?[child]:[]),...child.querySelectorAll(tag)]);}
  remove(){}
}

test('arena toggle works immediately and DEV diagnostics track lobby state separately from player UI',()=>{
  setCoopArenaEnabled(false);
  const documentRef={createElement:tag=>new Element(tag),body:new Element('body')};
  const tools=new BossDevTools({arenaDiagnostics:{mode:'lobby',status:'waiting',lobbyId:'lobby-private',
    hostPlayerId:'host-private',participantCount:2}},null,{documentRef});
  assert.match(tools.arenaDiagnostics.textContent,/Lobby: lobby-private/);
  assert.match(tools.arenaDiagnostics.textContent,/Players: 2/);
  assert.equal(tools.coopArenaButton.textContent,'Co-op Arena: OFF');
  tools.coopArenaButton.events.click();assert.equal(coopArenaEnabled({DEV:true}),true);
  assert.equal(tools.coopArenaButton.textContent,'Co-op Arena: ON');
  tools.setArenaDiagnostics({mode:'coop',status:'started',lobbyId:'same',hostPlayerId:'host',participantCount:3});
  assert.match(tools.arenaDiagnostics.textContent,/Arena: coop.*State: started/);
  tools.setArenaDiagnostics(null);assert.equal(tools.arenaDiagnostics.textContent,'Arena: none');
  tools.coopArenaButton.events.click();assert.equal(coopArenaEnabled({DEV:true}),false);
  tools.destroy();
});

test('Dev Tools can collapse and reopen without losing presets or blocking the toggle during requests',async()=>{
  const documentRef={createElement:tag=>new Element(tag),body:new Element('body')};
  let applied=0,resolve;
  const tools=new BossDevTools({applyBossProgress:()=>applied++},null,{documentRef});
  tools.client.devSetPreset=()=>new Promise(done=>resolve=done);
  const buttons=tools.content.querySelectorAll('button');
  assert.equal(tools.content.children[0].querySelectorAll('button').length,6);
  assert.equal(tools.content.hidden,true);assert.equal(tools.toggleButton.attributes['aria-expanded'],'false');
  tools.toggleButton.events.click();
  assert.equal(tools.content.hidden,false);
  const pending=tools.apply('fresh','Fresh');
  assert.ok(buttons.every(button=>button.disabled));
  assert.notEqual(tools.toggleButton.disabled,true);
  tools.toggleButton.events.click();resolve({wins:0});await pending;
  assert.equal(applied,1);assert.equal(tools.content.hidden,true);
  tools.toggleButton.events.click();
  assert.equal(tools.content.querySelectorAll('button')[0],buttons[0]);
  assert.equal(tools.status.textContent,'DEV: Fresh state loaded');
  assert.ok(buttons.every(button=>!button.disabled));
});

test('clear potions action updates the status and re-enables Dev Tools',async()=>{
  const documentRef={createElement:tag=>new Element(tag),body:new Element('body')};
  const tools=new BossDevTools({devClearHealthPotions:async()=>10},null,{documentRef});
  assert.equal(await tools.runAction('clearPotions','Clear my potions'),true);
  assert.equal(tools.status.textContent,'DEV: removed 10 potions');
  assert.ok(tools.content.querySelectorAll('button').every(button=>!button.disabled));
});

test('Get 30 coins calls the dev grant and reports the persistent balance',async()=>{
  const documentRef={createElement:tag=>new Element(tag),body:new Element('body')};
  let grants=0;
  const tools=new BossDevTools({devGrantCoins:async()=>{grants++;return {amount:30,coins:42};}},null,{documentRef});
  const button=tools.content.querySelectorAll('button').find(item=>item.textContent==='Get 30 coins');
  assert.ok(button);
  await tools.runAction('coins','Get 30 coins');
  assert.equal(grants,1);
  assert.equal(tools.status.textContent,'DEV: Get 30 coins (balance: 42)');
  assert.ok(tools.content.querySelectorAll('button').every(item=>!item.disabled));
});

test('one-answer puzzle option persists and can be switched back off',()=>{
  const saved=new Map();
  const storage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
  const previous=globalThis.localStorage;globalThis.localStorage=storage;
  const documentRef={createElement:tag=>new Element(tag),body:new Element('body')};
  const tools=new BossDevTools({},null,{documentRef});
  const checkbox=tools.oneAnswerInput;
  assert.equal(checkbox.checked,false);
  checkbox.checked=true;checkbox.events.change();
  assert.equal(devPuzzleOneAnswerEnabled(),true);
  assert.equal(saved.get(DEV_PUZZLE_ONE_ANSWER_KEY),'true');
  checkbox.checked=false;checkbox.events.change();
  assert.equal(devPuzzleOneAnswerEnabled(),false);
  assert.equal(saved.get(DEV_PUZZLE_ONE_ANSWER_KEY),'false');
  globalThis.localStorage=previous;
});

test('All Skins enables the selected base preview only after the DEV preset succeeds',async()=>{
  const documentRef={createElement:tag=>new Element(tag),body:new Element('body')};
  const events=[];
  const tools=new BossDevTools({
    applyBossProgress:()=>events.push('progress'),
    enableAllDevSkins:()=>events.push('preview'),
    disableAllDevSkins:()=>events.push('disable'),
  },null,{documentRef});
  tools.client.devSetPreset=async preset=>{events.push(preset);return {wins:1,rewards:['remastered_skin']};};
  assert.equal(tools.content.querySelectorAll('button')[1].textContent,'All Skins');
  await tools.apply('all_skins','All Skins');
  assert.deepEqual(events,['all_skins','progress','preview']);
  await tools.apply('fresh','Fresh');
  assert.deepEqual(events.slice(3),['fresh','progress','disable']);
});

test('collection buttons grant/reset inventory and block repeated actions while pending',async()=>{
  const documentRef={createElement:tag=>new Element(tag),body:new Element('body')};
  const actions=[];let resolve;
  const tools=new BossDevTools({devCollection:action=>{actions.push(action);return new Promise(done=>resolve=done);}},null,{documentRef});
  const buttons=tools.content.querySelectorAll('button');
  assert.ok(buttons.some(button=>button.textContent==='Reset cigarette collection'));
  assert.ok(buttons.some(button=>button.textContent==='Get all cigarette packs'));
  const pending=tools.runAction('grantCollection');
  assert.ok(buttons.every(button=>button.disabled));
  assert.equal(await tools.runAction('resetCollection'),false);
  resolve({hasPack:true});assert.equal(await pending,true);
  assert.equal(tools.status.textContent,'DEV: all 4 packs available in your inventory');
  const reset=tools.runAction('resetCollection');resolve({hasPack:false});await reset;
  assert.deepEqual(actions,['grant','reset']);assert.equal(tools.status.textContent,'DEV: collection reset; all packs removed');
  assert.ok(buttons.every(button=>!button.disabled));
});

test('collection errors are visible and release the Dev Tools request lock',async()=>{
  const documentRef={createElement:tag=>new Element(tag),body:new Element('body')};
  const tools=new BossDevTools({devCollection:async()=>{throw new Error('CHARACTER_SESSION_LOST');}},null,{documentRef});
  assert.equal(await tools.runAction('grantCollection'),false);
  assert.equal(tools.status.textContent,'CHARACTER_SESSION_LOST');assert.equal(tools.busy,false);
  assert.ok(tools.content.querySelectorAll('button').every(button=>!button.disabled));
});

test('free cigarette pickup checkbox persists the returned state and reports failures',async()=>{
  const documentRef={createElement:tag=>new Element(tag),body:new Element('body')};
  let requested;
  const tools=new BossDevTools({devSetFreeCollect:async enabled=>{requested=enabled;return {devFreeCollect:enabled};}},null,{documentRef});
  assert.equal(tools.freeCollectInput.checked,false);
  tools.freeCollectInput.checked=true;await tools.freeCollectInput.events.change();
  assert.equal(requested,true);assert.equal(tools.freeCollectInput.checked,true);
  assert.match(tools.status.textContent,/any order/);
  tools.setFreeCollectEnabled(false);assert.equal(tools.freeCollectInput.checked,false);
});
