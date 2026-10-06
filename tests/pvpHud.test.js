import test from 'node:test';
import assert from 'node:assert/strict';
import { PvpHud } from '../src/pvp/PvpHud.js';

class Element {
  constructor(tag){this.tag=tag;this.children=[];this.textContent='';this.hidden=false;this.listeners={};}
  append(...nodes){this.children.push(...nodes);}
  setAttribute(name,value){(this.attributes??={})[name]=value;}
  addEventListener(name,listener){(this.listeners[name]??=[]).push(listener);}
  dispatchEvent(event){for(const listener of this.listeners[event.type]??[])listener(event);}
  remove(){this.removed=true;}
}

const documentRef=()=>{
  const shell=new Element('div');
  return {shell,document:{body:new Element('body'),createElement:tag=>new Element(tag),getElementById:id=>id==='game-shell'?shell:null}};
};
const self={playerId:'alice',team:'A',hp:90,kills:2,deaths:1};
const match={matchId:'private-match-id',mode:'tdm',state:'active',round:0,startedAt:0,endsAt:90000,
  scores:{A:3,B:1},participants:[self]};

test('PvP HUD anchors to the game shell and shows match/player essentials without technical IDs',()=>{
  const {shell,document}=documentRef();
  const hud=new PvpHud({documentRef:document,onLeave(){}});
  hud.render(match,self,10000);
  assert.equal(shell.children[0],hud.root);
  assert.equal(hud.mode.textContent,'TDM');
  assert.equal(hud.phase.textContent,'ACTIVE');
  assert.match(hud.score.textContent,/3.*1/);
  assert.equal(hud.timer.textContent,'01:20');
  assert.equal(hud.team.textContent,'BLUE');
  assert.match(hud.personal.textContent,/K 2 \/ D 1/);
  assert.equal(hud.diagnostics,undefined);
  assert.equal(hud.leave.textContent,'Leave');
  hud.render({...match,state:'ended',retry:{deadline:20000,playerIds:['alice'],activePlayerIds:['alice'],resolving:false}},self,10000);
  assert.doesNotMatch(hud.retryStatus.textContent,/alice|private-match-id/);
  hud.destroy();assert.equal(hud.root.removed,true);
});

test('Payload HUD keeps control and cart position visible; DEV diagnostics stay behind details',()=>{
  const {document}=documentRef();
  const hud=new PvpHud({documentRef:document,onLeave(){},onEnd(){},dev:true});
  for(const [payload,status] of [
    [{contested:false,control:null},'NEUTRAL'],
    [{contested:true,control:null},'CONTESTED'],
    [{contested:false,control:'A'},'BLUE PUSHING'],
    [{contested:false,control:'B'},'RED PUSHING'],
  ]){
    hud.render({...match,mode:'payload',payload:{...payload,distance:60,routeLength:100}},self,10000);
    assert.equal(hud.mode.textContent,'PAYLOAD');
    assert.equal(hud.score.textContent,status);
    assert.equal(hud.payloadProgress.textContent,'60%');
  }
  assert.equal(hud.phase.textContent,'');
  const devSection=hud.root.children.find(child=>child.className==='pvp-hud-player').children.find(child=>child.tag==='details');
  assert.equal(devSection.children[0].textContent,'DEV');
  assert.match(hud.diagnostics.textContent,/private-match-id/);
  hud.render({...match,mode:'payload',state:'ended',payload:{control:'A'}},self,90000);
  assert.equal(hud.phase.textContent,'ENDED');
  hud.destroy();
});

test('DEV panel stays enabled through death/respawn and restores its preference if the HUD is recreated',()=>{
  const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const first=documentRef(),hud=new PvpHud({documentRef:first.document,onLeave(){},onEnd(){},dev:true,storage});
  const devPanel=hud.devPanel;devPanel.open=true;devPanel.dispatchEvent({type:'toggle'});
  hud.render({...match,state:'active'}, {...self,hp:0},10000);
  assert.equal(devPanel.open,true,'death does not close the DEV panel');
  hud.render({...match,state:'active'}, {...self,hp:100},13000);
  assert.equal(devPanel.open,true,'respawn preserves the enabled DEV panel');
  hud.destroy();

  const resumed=documentRef(),recreated=new PvpHud({documentRef:resumed.document,onLeave(){},onEnd(){},dev:true,storage});
  assert.equal(recreated.devPanel.open,true,'a recreated HUD restores the saved preference');
  recreated.devPanel.open=false;recreated.devPanel.dispatchEvent({type:'toggle'});recreated.destroy();
  const closed=documentRef(),closedHud=new PvpHud({documentRef:closed.document,onLeave(){},onEnd(){},dev:true,storage});
  assert.equal(closedHud.devPanel.open,false,'the disabled preference also remains disabled');
  closedHud.destroy();
});

test('Retry stays visible when the active voters can form a valid 1v1 round',()=>{
  const {document}=documentRef(),hud=new PvpHud({documentRef:document,onLeave(){}});
  const participants=[{...self,playerId:'alice',team:'A'},{...self,playerId:'bob',team:'B'}];
  const state={...match,state:'ended',participants,retry:{deadline:20000,activePlayerIds:['alice','bob'],playerIds:[],resolving:false}};
  hud.render(state,participants[0],11000);
  assert.equal(hud.retry.hidden,false);assert.equal(hud.retry.disabled,false);
  assert.match(hud.returnTimer.textContent,/Retry or leave/);hud.destroy();
});

test('Retry is hidden with one survivor and HUD shows the automatic return countdown',()=>{
  const {document}=documentRef(),hud=new PvpHud({documentRef:document,onLeave(){}});
  const state={...match,state:'ended',reason:'host_left',participants:[self],retry:{deadline:20000,activePlayerIds:['alice'],playerIds:[],resolving:false}};
  hud.render(state,self,11000);
  assert.equal(hud.retry.hidden,true);assert.equal(hud.retryStatus.textContent,'');
  assert.equal(hud.returnTimer.textContent,'Returning in 9s');assert.equal(hud.leave.textContent,'Leave');hud.destroy();
});

test('Retry is hidden when remaining active participants are all on the same team',()=>{
  const {document}=documentRef(),hud=new PvpHud({documentRef:document,onLeave(){}});
  const participants=[{...self,playerId:'alice',team:'A'},{...self,playerId:'bob',team:'A'},
    {...self,playerId:'carol',team:'A'}];
  const state={...match,state:'ended',participants,retry:{deadline:20000,activePlayerIds:participants.map(p=>p.playerId),playerIds:[],resolving:false}};
  hud.render(state,participants[0],11000);
  assert.equal(hud.retry.hidden,true);assert.equal(hud.returnTimer.textContent,'Returning in 9s');hud.destroy();
});
