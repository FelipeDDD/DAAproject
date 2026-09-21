import test from 'node:test';
import assert from 'node:assert/strict';
import { GameHudController } from '../src/hud/GameHudController.js';
import { fixedHudEnabled,HUD_LAYOUT,hudHealthPercent,hudThemeDefinition,normalizeHudTheme } from '../src/hud/config.js';

class FakeClassList {
  constructor(){this.values=new Set();}
  add(value){this.values.add(value);}
  toggle(value,force){if(force)this.values.add(value);else this.values.delete(value);}
  contains(value){return this.values.has(value);}
}
class FakeNode {
  constructor(){this.style={values:new Map(),setProperty:(key,value)=>this.style.values.set(key,value)};this.attributes={};this.dataset={};this.classList=new FakeClassList();this.children=[];this.textContent='';}
  setAttribute(key,value){this.attributes[key]=value;}
  append(child){this.children.push(child);}
}
function harness(){
  const nodes=new Map(['#hud-hp-orb','#hud-hp-text','#hud-info-text','#hud-status-text','#hud-emote-mount'].map(id=>[id,new FakeNode()]));
  const root=new FakeNode();root.querySelector=id=>nodes.get(id)??null;
  const emote=new FakeNode(),documentRef={baseURI:'http://localhost/',getElementById:id=>id==='emote-bar'?emote:null};
  return {root,nodes,emote,documentRef};
}

test('gothic HUD theme centralizes assets and fixed layout settings',()=>{
  assert.equal(normalizeHudTheme('missing'),'gothic');assert.equal(fixedHudEnabled(),true);
  assert.match(hudThemeDefinition().barAsset,/hud-bar-body\.png$/);
  assert.deepEqual(HUD_LAYOUT,{bottomHeight:200,rightPanelWidth:160,frameOverflow:18,floatingHotbars:false});
});

test('HP orb fills from bottom using current over maximum health',()=>{
  const h=harness(),hud=new GameHudController({root:h.root,documentRef:h.documentRef});
  assert.equal(hud.setHealth(50,100),50);
  assert.equal(h.nodes.get('#hud-hp-orb').style.values.get('--hud-hp-percent'),'50%');
  assert.equal(h.nodes.get('#hud-hp-text').textContent,'50 / 100');
  assert.equal(h.nodes.get('#hud-hp-orb').attributes['aria-valuemax'],'100');
  assert.equal(h.nodes.get('#hud-hp-orb').attributes['aria-valuenow'],'50');
  assert.equal(h.nodes.get('#hud-hp-orb').attributes['aria-label'],'Player health: 50 of 100');
  hud.setHealth(0,100);
  assert.equal(h.nodes.get('#hud-hp-orb').style.values.get('--hud-hp-percent'),'0%');
  hud.setHealth(100,100);
  assert.equal(h.nodes.get('#hud-hp-orb').style.values.get('--hud-hp-percent'),'100%');
  assert.equal(hudHealthPercent(0,100),0);assert.equal(hudHealthPercent(150,100),100);
});

test('HUD panels keep dynamic text separate from their artwork',()=>{
  const h=harness(),hud=new GameHudController({root:h.root,documentRef:h.documentRef});
  hud.setInfoText('System ready');hud.setStatusLines(['LEARN','PLAY']);
  assert.equal(h.nodes.get('#hud-info-text').textContent,'System ready');
  assert.equal(h.nodes.get('#hud-status-text').textContent,'LEARN\nPLAY');
  assert.equal(h.nodes.get('#hud-emote-mount').children[0],h.emote);
});

test('game frame is authored outside the clipped Phaser container',async()=>{
  const source=await import('node:fs/promises').then(fs=>fs.readFile(new URL('../src/hud/hud.css',import.meta.url),'utf8'));
  assert.match(source,/#game-shell[\s\S]*overflow:\s*visible/);
  assert.match(source,/repeat-x/);
  assert.match(source,/repeat-y/);
  assert.doesNotMatch(source,/border-image-source/);
  assert.match(source,/#bottom-hud[\s\S]*position:\s*absolute/);
});
