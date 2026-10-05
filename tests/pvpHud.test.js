import test from 'node:test';
import assert from 'node:assert/strict';
import { PvpHud } from '../src/pvp/PvpHud.js';

class Element {
  constructor(tag){this.tag=tag;this.children=[];this.textContent='';this.hidden=false;}
  append(...nodes){this.children.push(...nodes);}
  setAttribute(name,value){(this.attributes??={})[name]=value;}
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
