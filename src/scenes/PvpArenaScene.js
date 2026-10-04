import { MapScene } from './MapScene.js';
import { getPresence } from '../multiplayer/client.js';
import { characterById } from '../characters.js';
import { resolvedMovementState } from '../multiplayer/movementState.js';
import { PVP_MAP,PVP_RULES,pvpRoom } from '../pvp/config.js';
import { teamSpawn } from '../pvp/spawns.js';
import { PvpMatchClient } from '../pvp/PvpMatchClient.js';
import { PvpMovementClient } from '../pvp/PvpMovementClient.js';
import { PvpProjectileClient } from '../pvp/PvpProjectileClient.js';
import { PvpDamageClient } from '../pvp/PvpDamageClient.js';
import { pvpRealtimeUrl,pvpMovementDebugEnabled } from '../pvp/movementConfig.js';
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
    this.movementState={moving:false,velocityX:0,velocityY:0};
    this.movementClient=new PvpMovementClient({matchId:this.matchId,match:this.matchState,
      playerId:this.presence.identity.playerId,url:pvpRealtimeUrl(import.meta.env),remotes:this.remotes,
      config:{debug:pvpMovementDebugEnabled(import.meta.env)},
      getSpawn:(p,state)=>teamSpawn(this.source,p.team,state.participants.filter(member=>member.team===p.team).findIndex(member=>member.playerId===p.playerId)),
      snapshot:()=>{
        const self=this.matchState?.participants.find(p=>p.playerId===this.presence.identity.playerId);
        if(!self)return null;
        const moving=this.matchState.state==='active'&&self.hp>0&&!this.networkFailed&&this.movementState.moving;
        return {x:this.player.x,y:this.player.y,direction:this.player.facing,life:self.life,moving,
          vx:moving?this.movementState.velocityX:0,vy:moving?this.movementState.velocityY:0};
      }});
    // Keep the arena membership and existing heartbeat/lease flow in Convex.
    // A fixed entry snapshot avoids sending the movement stream to both servers.
    const entryPresence={x:this.player.x,y:this.player.y,direction:this.player.facing,
      equippedSkin:this.presence.identity.equippedSkin??'classic',activeCharacterItem:null};
    this.presence.enter(this.presenceRoom,()=>entryPresence,rows=>this.movementClient?.receiveRoster(rows));
    this.pvpHud=new PvpHud({onLeave:()=>this.leavePvp(),onEnd:()=>this.forceEnd(),dev:import.meta.env.DEV});
    this.combat=new PvpCombatController(this,hit=>this.damageClient?.attempt(hit),
      {onSpawn:event=>this.projectileClient?.sendSpawn(event),onRemove:event=>this.projectileClient?.sendDestroy(event)});
    this.projectileClient=new PvpProjectileClient(this.movementClient,this.combat);
    this.damageClient=new PvpDamageClient(this.movementClient,{matchId:this.matchId,sessionId:this.presence.identity.sessionId,
      onState:state=>{if(!this.networkFailed)this.matchState=state;},onError:error=>this.showPvpError(error)});
    this.matchClient=new PvpMatchClient(this.presence,this.matchId,state=>{
      if(!state){this.showPvpError(new Error('PvP lobby unavailable'));return;}
      if(!this.networkFailed){this.matchState=this.damageClient?.project(state)??state;
        this.movementClient?.setMatch(this.matchState);this.projectileClient?.setMatch(this.matchState);}
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
    this.damageClient?.close();
    this.projectileClient?.close();
    this.movementClient?.close();
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
    this.movementState=resolvedMovementState(this.player.body);
    if(playable)this.player.update();else{this.player.setVelocity(0,0);this.player.setFacing(this.player.facing,false);}
    this.movementClient?.update();
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
    this.damageClient?.close();
    this.projectileClient?.close();
    this.movementClient?.close();
    this.preservePvpMembership=Boolean(lobbyId);this.player.setVelocity(0,0);
    this.travelTo({...this.returnDestination,...(lobbyId?{pvpLobbyId:lobbyId}:{})});
  }
  stopPvp(){
    this.damageClient?.close();this.damageClient=null;
    this.projectileClient?.close();this.projectileClient=null;
    this.movementClient?.close();this.movementClient=null;
    this.returnFlow?.close();this.returnFlow=null;
    this.combat?.destroy();this.combat=null;this.pvpHud?.destroy();this.pvpHud=null;
    if(this.matchClient){const client=this.matchClient;this.matchClient=null;client.close();if(!this.preservePvpMembership)void client.request('leave').catch(()=>{});}
    this.matchId=null;this.matchState=null;this.remotes?.receive([]);
    this.player?.setCombatHudVisible(false);if(this.player?.body)this.player.body.enable=true;
  }
}
