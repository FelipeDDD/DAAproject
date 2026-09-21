import test from 'node:test';
import assert from 'node:assert/strict';
import { BossDevTools } from '../src/boss/BossDevTools.js';

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
  assert.equal(buttons.length,6);
  tools.toggleButton.events.click();
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
