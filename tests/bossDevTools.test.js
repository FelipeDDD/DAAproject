import test from 'node:test';
import assert from 'node:assert/strict';
import { BossDevTools } from '../src/boss/BossDevTools.js';
import { devPuzzleOneAnswerEnabled,DEV_PUZZLE_ONE_ANSWER_KEY } from '../src/boss/devPuzzleSettings.js';

class Element {
  constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.events={};}
  append(...children){this.children.push(...children);}
  addEventListener(name,callback){this.events[name]=callback;}
  setAttribute(name,value){this.attributes[name]=value;}
  querySelectorAll(tag){return this.children.flatMap(child=>[...(child.tag===tag?[child]:[]),...child.querySelectorAll(tag)]);}
  remove(){}
}

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
