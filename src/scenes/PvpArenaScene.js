import { PvpMapScene } from './PvpMapScene.js';
import { getPresence } from '../multiplayer/client.js';
import { characterById } from '../characters.js';
import { resolvedMovementState } from '../multiplayer/movementState.js';
import { PVP_MAP,PVP_RULES,pvpRoom } from '../pvp/config.js';
import { requirePvpMap } from '../pvp/mapConfig.js';
import { teamSpawn } from '../pvp/spawns.js';
import { PvpMatchClient } from '../pvp/PvpMatchClient.js';
import { PvpMovementClient } from '../pvp/PvpMovementClient.js';
import { PvpProjectileClient } from '../pvp/PvpProjectileClient.js';
import { PvpDamageClient } from '../pvp/PvpDamageClient.js';
import { pvpRealtimeUrl,pvpMovementDebugEnabled } from '../pvp/movementConfig.js';
import { PvpCombatController } from '../pvp/PvpCombatController.js';
import { PvpHud } from '../pvp/PvpHud.js';
import { PvpReturnFlow } from '../pvp/PvpReturnFlow.js';
import { createModeView } from '../pvp/modeView.js';
import { endMatch } from '../pvp/matchState.js';
import { cameraZoomForMap } from '../game/settings.js';
import '../pvp/pvp.css';

export class PvpArenaScene extends PvpMapScene {
  constructor(){super(PVP_MAP);}
  create(destination){
    super.create(destination);
    this.events.on('sleep',this.stopPvp,this);
    this.events.once('shutdown',()=>{this.events.off('sleep',this.stopPvp,this);this.stopPvp();});
  }
  // Reuse only MapScene's Tiled loading/physics; no inventory, quests, boss rewards,
  // study, quiz seats or world interaction controllers are created in this scene.
  enter(destination={}){
    // PvP scenes can be reused after sleep; always re-read the map-only setting.
    this.cameras.main.setZoom(cameraZoomForMap(PVP_MAP));
    this.stopPvp();this.leaving=false;this.networkFailed=false;this.ending=false;this.preservePvpMembership=false;
    this.presence=getPresence();this.returnDestination=destination.returnDestination??{targetMap:'school'};
    this.matchId=destination.pvpMatchId;this.presenceRoom=pvpRoom(this.matchId);
    this.matchState=destination.pvpSnapshot;
    try{requirePvpMap(this.matchState);}
    catch(error){console.warn('[PvP map]',error.message);this.leavePvp();return;}
    this.initializePvpTeleports();
    const me=this.matchState?.participants.find(p=>p.playerId===this.presence?.identity?.playerId);
    if(!this.matchId||!me){this.leavePvp();return;}
    this.modeView=createModeView(this.matchState.mode,this);
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
    this.pvpHud=new PvpHud({onLeave:()=>this.leavePvp(),onRetry:()=>this.damageClient?.requestRetry()??false,onEnd:()=>this.forceEnd(),dev:import.meta.env.DEV});
    this.combat=new PvpCombatController(this,hit=>this.damageClient?.attempt(hit),
      {onSpawn:event=>this.projectileClient?.sendSpawn(event),onRemove:event=>this.projectileClient?.sendDestroy(event),
        canFire:()=>this.damageClient?.authorized&&this.damageClient.hp?.state==='active'&&this.movementClient?.authorizedPoseSent});
    this.projectileClient=new PvpProjectileClient(this.movementClient,this.combat);
    this.damageClient=new PvpDamageClient(this.movementClient,{matchId:this.matchId,sessionId:this.presence.identity.sessionId,
      onRound:state=>this.applyNextRound(state),
      onState:state=>{if(!this.networkFailed){this.matchState=state;
        this.movementClient?.setMatch(state);this.projectileClient?.setMatch(state);}},onError:error=>this.showPvpError(error)});
    this.matchClient=new PvpMatchClient(this.presence,this.matchId,state=>{
      if(!state){if(!this.matchState?.retry)this.showPvpError(new Error('PvP lobby unavailable'));return;}
      try{requirePvpMap(state);}catch(error){this.showPvpError(error);return;}
      if(!this.networkFailed){this.matchState=this.damageClient?.project(state)??state;
        this.movementClient?.setMatch(this.matchState);this.projectileClient?.setMatch(this.matchState);}
    },error=>{if(!this.matchState?.retry)this.showPvpError(error);});
    const client=this.matchClient;
    this.returnFlow=new PvpReturnFlow((action,args)=>client.request(action,args),matchId=>this.leavePvp(matchId));
  }
  applyNextRound(state){
    if(this.leaving||this.networkFailed)return;
    if(!state||!state.participants.some(p=>p.playerId===this.presence.identity.playerId)){this.leavePvp();return;}
    try{requirePvpMap(state);}catch(error){this.showPvpError(error);return;}
    this.teleports?.reset();
    this.matchClient.snapshot=state;this.matchState=state;
    if(state.state==='waiting'){this.leavePvp(this.matchId);return;}
    this.returnFlow?.close();
    const client=this.matchClient;
    this.returnFlow=new PvpReturnFlow((action,args)=>client.request(action,args),matchId=>this.leavePvp(matchId));
    this.combat.clear();this.projectileClient.reset();
    this.modeView?.reset();
    this.combat.serial=0;this.combat.nextShotAt=0;this.combat.life=undefined;
    const me=state.participants.find(p=>p.playerId===this.presence.identity.playerId);
    this.player.body.enable=true;this.placeAtSpawn(me);this.lastLife=me.life;
    this.player.setAlpha(1).setCombatHealth(me.hp,PVP_RULES.maxHp);
    this.movementState={moving:false,velocityX:0,velocityY:0};
    this.movementClient.switchRound(state);this.projectileClient.setMatch(state);
    this.combat.update(state,me,0,Date.now());
  }
  placeAtSpawn(me){
    const index=this.matchState.participants.filter(p=>p.team===me.team).findIndex(p=>p.playerId===me.playerId);
    const spawn=teamSpawn(this.source,me.team,index);
    this.player.body.reset(spawn.x,spawn.y);this.player.setVelocity(0,0);this.player.setFacing(spawn.direction,false);
  }
  showPvpError(error){
    if(!this.pvpHud)return;
    this.pvpHud.status.textContent=typeof error?.data==='string'?error.data:'Connection failed. Leave and rejoin the test.';
    if(!this.networkFailed&&this.matchState){
      const {retry,...state}=this.matchState;
      this.matchState={...endMatch(state,Date.now(),'lobby_unavailable'),reason:'lobby_unavailable',endedAt:Date.now()};
    }
    this.networkFailed=true;
    this.damageClient?.close();
    this.projectileClient?.close();
    this.movementClient?.close();
    if(String(error).includes('CHARACTER_SESSION_LOST'))this.presence.fail(error);
  }
  forceEnd(){
    if(this.matchState?.hostPlayerId!==this.presence.identity.playerId||this.ending)return;
    this.damageClient?.requestEnd();
  }
  update(_time,delta){
    if(!this.matchState||this.leaving)return;
    const now=Date.now(),state=this.matchState,me=state.participants.find(p=>p.playerId===this.presence.identity.playerId);
    if(!me){this.leavePvp();return;}
    if(!state.retry)this.returnFlow?.update(state,now);
    if(this.leaving)return;
    const playable=state.state==='active'&&me.hp>0&&!this.networkFailed;
    this.player.body.enable=me.hp>0;
    if(me.life!==this.lastLife){this.lastLife=me.life;this.placeAtSpawn(me);}
    this.player.setAlpha(me.hp>0?1:.25).setCombatHealth(me.hp,PVP_RULES.maxHp);
    this.movementState=resolvedMovementState(this.player.body);
    if(playable)this.player.update();else{this.player.setVelocity(0,0);this.player.setFacing(this.player.facing,false);}
    if(playable)this.updatePvpTeleports(now);
    this.movementClient?.update();
    this.remotes.update();
    for(const p of state.participants){
      const remote=this.remotes.players.get(p.playerId);if(!remote)continue;
      remote.sprite.setAlpha(p.hp>0?1:.2);
      remote.label.setColor(p.team==='A'?'#27698b':'#a33f30');
      remote.label.setText(`${p.displayName} · ${p.team} · ${p.hp} HP`);
    }
    this.combat?.update(this.networkFailed?{...state,state:'ended'}:state,me,delta,now);
    this.modeView?.render(state);
    this.pvpHud?.render(state,me,now,this.returnFlow?.remaining(now)??null);

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
    this.teleports?.reset();this.teleports=null;
    this.modeView?.destroy();this.modeView=null;
    this.damageClient?.close();this.damageClient=null;
    this.projectileClient?.close();this.projectileClient=null;
    this.movementClient?.close();this.movementClient=null;
    this.returnFlow?.close();this.returnFlow=null;
    this.combat?.destroy();this.combat=null;this.pvpHud?.destroy();this.pvpHud=null;
    if(this.matchClient){const client=this.matchClient;this.matchClient=null;client.close();if(!this.preservePvpMembership)void client.request('leave',{round:this.matchState?.round??client.snapshot?.round??0}).catch(()=>{});}
    this.matchId=null;this.matchState=null;this.remotes?.receive([]);
    this.player?.setCombatHudVisible(false);if(this.player?.body)this.player.body.enable=true;
  }
}
