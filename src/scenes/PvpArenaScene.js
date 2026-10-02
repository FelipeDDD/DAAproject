import { MapScene } from './MapScene.js';
import { getPresence } from '../multiplayer/client.js';
import { characterById } from '../characters.js';
import { resolvedMovementState } from '../multiplayer/movementState.js';
import { PVP_MAP,PVP_RULES,pvpRoom } from '../pvp/config.js';
import { teamSpawn } from '../pvp/spawns.js';
import { PvpMatchClient } from '../pvp/PvpMatchClient.js';
import { PvpCombatController } from '../pvp/PvpCombatController.js';
import { PvpHud } from '../pvp/PvpHud.js';
import { PvpReturnFlow } from '../pvp/PvpReturnFlow.js';
import { endMatch } from '../pvp/matchState.js';
import '../pvp/pvp.css';

export class PvpArenaScene extends MapScene {
  constructor(){super(PVP_MAP,'pvp-arena-test.tmj');}
  create(destination){
    super.create(destination);
    this.events.on('sleep',this.stopPvp,this);
    this.events.once('shutdown',()=>{this.events.off('sleep',this.stopPvp,this);this.stopPvp();});
  }
  // Reuse only MapScene's Tiled loading/physics; no inventory, quests, boss rewards,
  // study, quiz seats or world interaction controllers are created in this scene.
  enter(destination={}){
    this.stopPvp();this.leaving=false;this.finishSent=false;this.networkFailed=false;this.ending=false;this.preservePvpMembership=false;
    this.presence=getPresence();this.returnDestination=destination.returnDestination??{targetMap:'school'};
    this.matchId=destination.pvpMatchId;this.presenceRoom=pvpRoom(this.matchId);
    this.matchState=destination.pvpSnapshot;
    const me=this.matchState?.participants.find(p=>p.playerId===this.presence?.identity?.playerId);
    if(!this.matchId||!me){this.leavePvp();return;}
    this.player.body.enable=true;this.player.setVisible(true).setAlpha(1).clearTint();
    this.player.setCharacter(characterById(me.characterBaseId),'old');
    this.placeAtSpawn(me);this.lastLife=me.life;
    this.hint.hidden=true;this.input.keyboard.enabled=true;this.input.enabled=true;
    this.input.keyboard.resetKeys();this.player.setCombatHudVisible(true);
    this.presence.enter(this.presenceRoom,()=>({x:this.player.x,y:this.player.y,direction:this.player.facing,
      equippedSkin:this.presence.identity.equippedSkin??'classic',activeCharacterItem:null}),rows=>this.remotes.receive(rows));
    this.pvpHud=new PvpHud({onLeave:()=>this.leavePvp(),onEnd:()=>this.forceEnd(),dev:import.meta.env.DEV});
    this.combat=new PvpCombatController(this,hit=>{
      const client=this.matchClient,round=this.matchState?.round??0;
      void client.request('hit',hit).catch(error=>{if(this.matchClient===client&&(this.matchState?.round??0)===round)this.showPvpError(error);});
    });
    this.matchClient=new PvpMatchClient(this.presence,this.matchId,state=>{
      if(!state){this.showPvpError(new Error('PvP lobby unavailable'));return;}
      if(!this.networkFailed)this.matchState=state;
    },error=>this.showPvpError(error));
    const client=this.matchClient;
    this.returnFlow=new PvpReturnFlow((action,args)=>client.request(action,args),matchId=>this.leavePvp(matchId));
  }
  placeAtSpawn(me){
    const index=this.matchState.participants.filter(p=>p.team===me.team).findIndex(p=>p.playerId===me.playerId);
    const spawn=teamSpawn(this.source,me.team,index);
    this.player.body.reset(spawn.x,spawn.y);this.player.setVelocity(0,0);this.player.setFacing(me.team==='A'?'right':'left',false);
  }
  showPvpError(error){
    if(!this.pvpHud)return;
    this.pvpHud.status.textContent=typeof error?.data==='string'?error.data:'Connection failed. Leave and rejoin the test.';
    if(!this.networkFailed&&this.matchState)this.matchState={...endMatch(this.matchState,Date.now(),'lobby_unavailable'),
      reason:'lobby_unavailable',endedAt:Date.now()};
    this.networkFailed=true;
    if(String(error).includes('CHARACTER_SESSION_LOST'))this.presence.fail(error);
  }
  forceEnd(){
    if(this.matchState?.hostPlayerId!==this.presence.identity.playerId||this.ending)return;
    this.ending=true;const client=this.matchClient,round=this.matchState?.round??0;
    void client.request('finish',{force:true}).catch(error=>{if(this.matchClient===client&&(this.matchState?.round??0)===round)this.showPvpError(error);})
      .finally(()=>{if(this.matchClient===client)this.ending=false;});
  }
  update(_time,delta){
    if(!this.matchState||this.leaving)return;
    const now=Date.now(),state=this.matchState,me=state.participants.find(p=>p.playerId===this.presence.identity.playerId);
    if(!me){this.leavePvp();return;}
    this.returnFlow?.update(state,now);
    if(this.leaving)return;
    const playable=state.state==='active'&&me.hp>0&&!this.networkFailed;
    this.player.body.enable=me.hp>0;
    if(me.life!==this.lastLife){this.lastLife=me.life;this.placeAtSpawn(me);}
    this.player.setAlpha(me.hp>0?1:.25).setCombatHealth(me.hp,PVP_RULES.maxHp);
    this.presence.observeMovement(resolvedMovementState(this.player.body));
    if(playable)this.player.update();else{this.player.setVelocity(0,0);this.player.setFacing(this.player.facing,false);}
    this.remotes.update();
    for(const p of state.participants){
      const remote=this.remotes.players.get(p.playerId);if(!remote)continue;
      remote.sprite.setAlpha(p.hp>0?1:.2);
      remote.label.setColor(p.team==='A'?'#27698b':'#a33f30');
      remote.label.setText(`${p.displayName} · ${p.team} · ${p.hp} HP`);
    }
    this.combat?.update(this.networkFailed?{...state,state:'ended'}:state,me,delta,now);
    this.pvpHud?.render(state,me,now,this.returnFlow?.remaining(now)??null);
    if(state.state==='ended'&&['timer','team_empty','host_left','host-left','expired'].includes(state.reason)&&!this.networkFailed&&!this.finishSent){
      this.finishSent=true;const client=this.matchClient,round=state.round??0;
      void client.request('finish').catch(error=>{if(this.matchClient===client&&(this.matchState?.round??0)===round)this.showPvpError(error);});
    }
  }
  leavePvp(lobbyId=null){
    if(this.leaving)return;this.leaving=true;this.returnFlow?.close();
    this.preservePvpMembership=Boolean(lobbyId);this.player.setVelocity(0,0);
    this.travelTo({...this.returnDestination,...(lobbyId?{pvpLobbyId:lobbyId}:{})});
  }
  stopPvp(){
    this.returnFlow?.close();this.returnFlow=null;
    this.combat?.destroy();this.combat=null;this.pvpHud?.destroy();this.pvpHud=null;
    if(this.matchClient){const client=this.matchClient;this.matchClient=null;client.close();if(!this.preservePvpMembership)void client.request('leave').catch(()=>{});}
    this.matchId=null;this.matchState=null;this.remotes?.receive([]);
    this.player?.setCombatHudVisible(false);if(this.player?.body)this.player.body.enable=true;
  }
}
