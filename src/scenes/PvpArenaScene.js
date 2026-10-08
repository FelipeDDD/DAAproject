import { PvpMapScene } from './PvpMapScene.js';
import { getPresence } from '../multiplayer/client.js';
import { applyLocalAppearance } from '../characterAppearance.js';
import { startSceneEmotes,stopSceneEmotes } from '../emotes/sceneEmotes.js';
import { resolvedMovementState } from '../multiplayer/movementState.js';
import { PVP_MAP,pvpRoom } from '../pvp/config.js';
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
import { preparePlayerAttackVisuals,preloadPlayerAttackVisuals } from '../boss/PlayerAttackVisuals.js';
import { createModeView } from '../pvp/modeView.js';
import { endMatch } from '../pvp/matchState.js';
import { cameraZoomForMap } from '../game/settings.js';
import { isPersistentClassRoom } from '../maps/classState.js';
import { pvpMovementSpeed,effectiveMatchSettings } from '../pvp/matchSettings.js';
import { PlayerHealthBar } from '../ui/PlayerHealthBar.js';
import { PvpPickupView } from '../pvp/pickups/PvpPickupView.js';
import { pickupDebugEnabled } from '../pvp/pickups/visualConfig.js';
import { SkillClient } from '../pvp/skills/SkillClient.js';
import { SkillView } from '../pvp/skills/SkillView.js';
import { SkillHud } from '../pvp/skills/SkillHud.js';
import '../pvp/pvp.css';

export class PvpArenaScene extends PvpMapScene {
  constructor(){super(PVP_MAP);}
  preload(){
    super.preload();
    preloadPlayerAttackVisuals(this,import.meta.env.BASE_URL);
  }
  create(destination){
    // MapScene.create() calls this.enter(), which opens the realtime listeners.
    // Register attack animations first so the very first remote shot can use them.
    preparePlayerAttackVisuals(this);
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
    this.hostLeaveObserved=false;this.hostLeaveSeconds=undefined;
    this.pvpRemoteHealthBars=new Map();
    this.presence=getPresence();
    this.returnDestination=isPersistentClassRoom(destination.returnDestination?.targetMap)
      ?destination.returnDestination:{targetMap:'school'};
    this.matchId=destination.pvpMatchId;this.presenceRoom=pvpRoom(this.matchId);
    this.matchState=destination.pvpSnapshot;
    try{requirePvpMap(this.matchState);}
    catch(error){console.warn('[PvP map]',error.message);this.leavePvp();return;}
    this.applyMatchSettings(this.matchState);
    this.initializePvpTeleports();
    const me=this.matchState?.participants.find(p=>p.playerId===this.presence?.identity?.playerId);
    if(!this.matchId||!me){this.leavePvp();return;}
    this.modeView=createModeView(this.matchState.mode,this);
    this.pickupView=new PvpPickupView(this,{debug:pickupDebugEnabled(import.meta.env)});
    this.player.body.enable=true;this.player.setVisible(true).setAlpha(1).clearTint();
    applyLocalAppearance(this,{activeCharacterItem:null});
    this.placeAtSpawn(me);this.lastLife=me.life;
    this.hint.hidden=true;this.input.keyboard.enabled=true;this.input.enabled=true;
    this.input.keyboard.resetKeys();this.player.setCombatHudVisible(true);this.updatePvpHudHealth(me.hp);
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
      activeCharacterItem:null};
    this.presence.enter(this.presenceRoom,()=>entryPresence,rows=>this.movementClient?.receiveRoster(rows),
      {appearanceChanged:()=>applyLocalAppearance(this,{activeCharacterItem:null})});
    startSceneEmotes(this);
    this.pvpHud=new PvpHud({onLeave:()=>this.leavePvp(),onRetry:()=>this.damageClient?.requestRetry()??false,onEnd:()=>this.forceEnd(),dev:import.meta.env.DEV});
    this.combat=new PvpCombatController(this,hit=>this.damageClient?.attempt(hit),
      {onSpawn:event=>this.projectileClient?.sendSpawn(event),onRemove:event=>this.projectileClient?.sendDestroy(event),
        consumePointer:pointer=>this.skillClient?.handlePointer(pointer)??false,
        canFire:()=>this.damageClient?.authorized&&this.damageClient.hp?.state==='active'&&this.movementClient?.authorizedPoseSent});
    this.projectileClient=new PvpProjectileClient(this.movementClient,this.combat);
    this.damageClient=new PvpDamageClient(this.movementClient,{matchId:this.matchId,sessionId:this.presence.identity.sessionId,
      onRound:state=>this.applyNextRound(state),
      onState:state=>{if(!this.networkFailed){this.matchState=state;
        this.movementClient?.setMatch(state);this.projectileClient?.setMatch(state);}},onError:error=>this.showPvpError(error)});
    this.skillClient=new SkillClient(this.damageClient,{keyboard:this.input.keyboard,
      getAimPoint:pointer=>{const p=pointer??this.input.activePointer;return this.cameras.main.getWorldPoint(p.x,p.y);},
      getOrigin:()=>({x:this.player.x,y:this.player.y}),now:()=>this.matchClient?.now?.()??Date.now()});
    this.skillView=new SkillView(this);
    this.skillHud=new SkillHud(undefined,{onUse:id=>this.skillClient?.activate(id)});
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
    this.traceHostLeave('return/waiting transition',{nextState:state?.state??'leave',nextRound:state?.round});
    if(!state||!state.participants.some(p=>p.playerId===this.presence.identity.playerId)){this.leavePvp();return;}
    try{requirePvpMap(state);}catch(error){this.showPvpError(error);return;}
    this.applyMatchSettings(state);
    this.teleports?.reset();
    this.matchClient.snapshot=state;this.matchState=state;
    if(state.state==='waiting'){this.leavePvp(this.matchId);return;}
    this.hostLeaveObserved=false;this.hostLeaveSeconds=undefined;
    this.returnFlow?.close();
    const client=this.matchClient;
    this.returnFlow=new PvpReturnFlow((action,args)=>client.request(action,args),matchId=>this.leavePvp(matchId));
    this.combat.clear();this.projectileClient.reset();
    this.modeView?.reset();
    this.pickupView?.reset();
    this.skillView?.reset(state.round);
    this.skillClient?.reset(state.round);
    this.emoteRenderer?.clear();
    this.combat.serial=0;this.combat.nextShotAt=0;this.combat.life=undefined;
    const me=state.participants.find(p=>p.playerId===this.presence.identity.playerId);
    this.player.body.enable=true;this.placeAtSpawn(me);this.lastLife=me.life;
    this.player.setAlpha(1).setCombatHealth(me.hp,this.pvpSettings.maxHp);
    this.movementState={moving:false,velocityX:0,velocityY:0};
    this.movementClient.switchRound(state);this.projectileClient.setMatch(state);
    this.combat.update(state,me,0,Date.now());
  }
  placeAtSpawn(me){
    const index=this.matchState.participants.filter(p=>p.team===me.team).findIndex(p=>p.playerId===me.playerId);
    const spawn=teamSpawn(this.source,me.team,index);
    this.player.body.reset(spawn.x,spawn.y);this.player.setVelocity(0,0);this.player.setFacing(spawn.direction,false);
  }
  applyMatchSettings(state){
    const self=state?.participants?.find(p=>p.playerId===this.presence?.identity?.playerId);
    this.pvpSettings=effectiveMatchSettings(state,self?.team);this.player.speed=pvpMovementSpeed(state,self?.team);
  }
  showPvpError(error){
    if(!this.pvpHud)return;
    this.pvpHud.status.textContent='Connection failed. Leave and rejoin the arena.';
    this.pvpHud.errorDetail=typeof error?.data==='string'?error.data:String(error);
    if(!this.networkFailed&&this.matchState){
      const {retry,...state}=this.matchState;
      this.matchState={...endMatch(state,Date.now(),'lobby_unavailable'),reason:'lobby_unavailable',endedAt:Date.now()};
    }
    this.networkFailed=true;
    this.skillClient?.close();this.skillView?.reset();
    this.damageClient?.close();
    this.projectileClient?.close();
    this.movementClient?.close();
    if(String(error).includes('CHARACTER_SESSION_LOST'))this.presence.fail(error);
  }
  forceEnd(){
    if(this.matchState?.hostPlayerId!==this.presence.identity.playerId||this.ending)return;
    this.damageClient?.requestEnd();
  }
  // TEMP: trace only this departure/recovery, without logging every frame.
  traceHostLeave(event,detail={}){
    if(!this.hostLeaveObserved&&!['host_left','host-left'].includes(this.matchState?.reason))return;
    this.hostLeaveObserved=true;
    console.info(`[PVP host leave] ${event}`,{matchId:this.matchId,round:this.matchState?.round,state:this.matchState?.state,...detail});
  }
  update(_time,delta){
    if(!this.matchState||this.leaving)return;
    const now=Date.now(),state=this.matchState,me=state.participants.find(p=>p.playerId===this.presence.identity.playerId);
    const matchNow=this.matchClient?.now?.()??now;
    if(!me){this.leavePvp();return;}
    if(!this.hostLeaveObserved)this.traceHostLeave('client lifecycle transition',{reason:state.reason,endedAt:state.endedAt});
    this.updatePvpHudHealth(me.hp);
    // The return deadline is latched: a delayed Retry snapshot cannot suspend
    // recovery already started by host departure/connection loss.
    if(!state.retry||this.returnFlow?.deadline!=null)this.returnFlow?.update(state,matchNow);
    if(this.leaving)return;
    const playable=state.state==='active'&&me.hp>0&&!this.networkFailed;
    this.player.body.enable=me.hp>0;
    if(me.life!==this.lastLife){this.lastLife=me.life;this.placeAtSpawn(me);}
    this.player.setAlpha(me.hp>0?1:.25).setCombatHealth(me.hp,this.pvpSettings.maxHp);
    this.movementState=resolvedMovementState(this.player.body);
    if(playable)this.player.update();else{this.player.setVelocity(0,0);this.player.setFacing(this.player.facing,false);}
    if(playable)this.updatePvpTeleports(now);
    this.movementClient?.update();
    this.skillClient?.update();
    this.remotes.update();
    this.emoteRenderer?.update();
    const renderedRemoteIds=new Set();
    for(const p of state.participants){
      const remote=this.remotes.players.get(p.playerId);if(!remote)continue;
      renderedRemoteIds.add(p.playerId);
      remote.sprite.setAlpha(p.hp>0?1:.2);
      this.updateRemoteHealthBar(p,remote);
    }
    for(const [playerId,entry] of this.pvpRemoteHealthBars)if(!renderedRemoteIds.has(playerId)){
      entry.bar.destroy();this.pvpRemoteHealthBars.delete(playerId);
      this.traceHostLeave('departed HP bar removed',{playerId});
    }
    this.combat?.update(this.networkFailed?{...state,state:'ended'}:state,me,delta,now);
    this.modeView?.render(state);
    this.pickupView?.render(state,matchNow);
    this.skillView?.render(state,matchNow);
    this.skillView?.renderTargeting(this.skillClient?.targetingPreview?.());
    this.skillHud?.render(state,me,matchNow);
    const returnSeconds=this.returnFlow?.remaining(matchNow)??null;
    this.pvpHud?.render(returnSeconds===null?state:{...state,retry:undefined},me,matchNow,returnSeconds);
    const seconds=returnSeconds??(state.retry?Math.max(0,Math.ceil((state.retry.deadline-matchNow)/1000)):null);
    if(this.hostLeaveObserved&&seconds!==this.hostLeaveSeconds){
      this.hostLeaveSeconds=seconds;this.traceHostLeave('return countdown',{seconds,retryResolving:state.retry?.resolving??false});
    }

  }
  updateRemoteHealthBar(participant,remote){
    let entry=this.pvpRemoteHealthBars.get(participant.playerId);
    if(!entry){
      const anchor={scene:this,x:remote.sprite.x,y:remote.sprite.y};
      entry={anchor,bar:new PlayerHealthBar(anchor)};entry.bar.setVisible(true);
      this.pvpRemoteHealthBars.set(participant.playerId,entry);
    }
    const maxHp=effectiveMatchSettings(this.matchState,participant.team).maxHp,hp=Number.isFinite(participant.hp)?participant.hp:maxHp;
    entry.anchor.x=remote.sprite.x;entry.anchor.y=remote.sprite.y;
    entry.bar.setHealth(hp,maxHp).updatePosition();
  }
  updatePvpHudHealth(hp){
    const maxHp=this.pvpSettings.maxHp;
    if(this.pvpHudHealth===hp&&this.pvpHudMaxHp===maxHp)return;
    this.pvpHudHealth=hp;this.pvpHudMaxHp=maxHp;
    this.gameHud?.setHealth(hp,maxHp);
  }
  leavePvp(lobbyId=null){
    if(this.leaving)return;this.leaving=true;this.returnFlow?.close();
    this.traceHostLeave('return/waiting transition',{targetMap:this.returnDestination?.targetMap,lobbyId});
    this.skillClient?.close();this.skillView?.reset();
    this.damageClient?.close();
    this.projectileClient?.close();
    this.movementClient?.close();
    this.preservePvpMembership=Boolean(lobbyId);this.player.setVelocity(0,0);
    this.travelTo({...this.returnDestination,...(lobbyId?{pvpLobbyId:lobbyId}:{})});
  }
  stopPvp(){
    stopSceneEmotes(this);
    for(const entry of this.pvpRemoteHealthBars?.values?.()??[])entry.bar.destroy();
    this.pvpRemoteHealthBars?.clear();this.pvpRemoteHealthBars=null;
    this.teleports?.reset();this.teleports=null;
    this.modeView?.destroy();this.modeView=null;
    this.pickupView?.destroy();this.pickupView=null;
    this.skillClient?.close();this.skillClient=null;
    this.skillView?.destroy();this.skillView=null;
    this.skillHud?.destroy();this.skillHud=null;
    this.damageClient?.close();this.damageClient=null;
    this.projectileClient?.close();this.projectileClient=null;
    this.movementClient?.close();this.movementClient=null;
    this.returnFlow?.close();this.returnFlow=null;
    this.combat?.destroy();this.combat=null;this.pvpHud?.destroy();this.pvpHud=null;
    if(this.matchClient){const client=this.matchClient;this.matchClient=null;client.close();if(!this.preservePvpMembership)void client.request('leave',{round:this.matchState?.round??client.snapshot?.round??0}).catch(()=>{});}
    this.matchId=null;this.matchState=null;this.remotes?.receive([]);
    if(this.pvpHudHealth!==undefined){this.gameHud?.resetHealth();this.pvpHudHealth=undefined;this.pvpHudMaxHp=undefined;}
    this.player?.setCombatHudVisible(false);if(this.player?.body)this.player.body.enable=true;
  }
}
