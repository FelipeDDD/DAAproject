import { characterBaseIdFor, characterById } from '../characters.js';
import { applyCharacterVisual,updateCharacterVisual } from '../characterVisuals.js';
import { RemoteSnapshotBuffer } from './remoteMovement.js';
import { appearanceStyle,logPlayerSkin } from '../characterAppearance.js';

// Rasterize nameplates above their displayed size so camera zoom does not
// magnify a low-resolution text canvas. Logical font size/scale stay unchanged.
export const REMOTE_NAME_LABEL_STYLE=Object.freeze({
  fontSize:'10px',color:'#152c42',backgroundColor:'#ffffffcc',
});

export class RemotePlayers {
  constructor(scene, { clock = () => performance.now(),labelResolution=1,labelFontSize=REMOTE_NAME_LABEL_STYLE.fontSize,showLabels=true, ...bufferOptions } = {}) {
    this.scene = scene; this.players = new Map();this.labelResolution=labelResolution;this.labelFontSize=labelFontSize;this.showLabels=showLabels;
    this.clock = clock; this.bufferOptions = bufferOptions;
  }

  receive(rows, { movement = true } = {}) {
    const arrivalAt = this.clock();
    const present = new Set(rows.map(p => p.playerId));
    for (const [id, remote] of this.players) if (!present.has(id)) {
      remote.sprite.destroy(); remote.label?.destroy(); this.players.delete(id);
    }
    for (const row of rows) {
      let remote = this.players.get(row.playerId);
      if (!remote) {
        const character=characterById(characterBaseIdFor(row));
        const sprite = this.scene.add.sprite(row.x,row.y,'student').setOrigin(0.5,1);
        const style=appearanceStyle(character,row);
        const visual=applyCharacterVisual(sprite,character,style);
        const label = this.showLabels?this.scene.add.text(row.x, row.y, row.displayName??row.name,
          {...REMOTE_NAME_LABEL_STYLE,fontSize:this.labelFontSize,resolution:this.labelResolution}).setOrigin(0.5, 1):null;
        remote = { sprite,label,visual,character,characterBaseId:characterBaseIdFor(row),style,buffer:new RemoteSnapshotBuffer(this.bufferOptions) };
        this.players.set(row.playerId, remote);
        logPlayerSkin(this.scene,row,visual,'remote','players.inRoom',sprite);
        if(!movement){sprite.setDepth(row.y);label?.setPosition(row.x,row.y-visual.labelOffset).setDepth(row.y+1);}
        this.movementDebug?.('remote created',{playerId:row.playerId,spriteCreated:true,...this.spriteState(remote)});
      }
      const nextBaseId=characterBaseIdFor(row);
      const nextCharacter=characterById(nextBaseId);
      const nextStyle=appearanceStyle(nextCharacter,row);
      if(remote.characterBaseId!==nextBaseId||remote.style!==nextStyle){
        remote.character=characterById(nextBaseId);remote.characterBaseId=nextBaseId;
        remote.style=nextStyle;
        remote.visual=applyCharacterVisual(remote.sprite,remote.character,nextStyle);
        logPlayerSkin(this.scene,row,remote.visual,'remote','players.inRoom update',remote.sprite);
        if(!movement)remote.label?.setPosition(remote.sprite.x,remote.sprite.y-remote.visual.labelOffset);
      }
      remote.row=row;
      const { teleport } = movement ? remote.buffer.push(row, arrivalAt) : { teleport:false };
      remote.presenceMode=row.presenceMode??'playing';
      remote.terminalLeaseExpiresAt=row.terminalLeaseExpiresAt;
      if (teleport) remote.sprite.setPosition(row.x, row.y);
      remote.label?.setText(row.displayName??row.name);
    }
  }

  // Metadata can arrive through Presence while movement uses a separate adapter.
  receiveMovement(playerId, movement, { reset = false } = {}) {
    const remote=this.players.get(playerId);if(!remote)return false;
    if(reset)remote.buffer=new RemoteSnapshotBuffer(this.bufferOptions);
    const row={...remote.row,...movement,lastSeen:undefined};
    const { accepted,teleport }=remote.buffer.push(row,this.clock());
    if(reset||teleport)remote.sprite.setPosition(row.x,row.y);
    this.movementDebug?.('movement buffered',{playerId,accepted,reset,teleport,...this.spriteState(remote)});
    return true;
  }

  spriteState({sprite}){
    const camera=this.scene.cameras?.main,view=camera?.worldView;
    return {x:sprite.x,y:sprite.y,visible:sprite.visible,alpha:sprite.alpha,depth:sprite.depth,
      texture:sprite.texture?.key,textureReady:this.scene.textures?.exists(sprite.texture?.key),
      inCamera:view?.contains?.(sprite.x,sprite.y)};
  }

  update() {
    const now = this.clock();
    for (const remote of this.players.values()) {
      const { sprite, label } = remote;
      const target = remote.buffer.sample(now);
      if (!target) continue;
      // Appearance is current metadata, not part of the delayed movement
      // timeline. Late rosters and stationary players update immediately.
      sprite.setPosition(target.x, target.y);
      updateCharacterVisual(sprite,remote.visual,target.direction,target.moving);
      sprite.setDepth(sprite.y);
      label?.setPosition(sprite.x,sprite.y-remote.visual.labelOffset).setDepth(sprite.y+1);
      if(this.movementDebug&&now>=(remote.nextDebugAt??0)){
        remote.nextDebugAt=now+(this.movementDebugIntervalMs??1000);
        this.movementDebug('position rendered',{playerId:remote.row.playerId,
          bufferedSnapshots:remote.buffer.snapshots.length,...this.spriteState(remote)});
      }
    }
  }
}
