import Phaser from 'phaser';
import { CHARACTER_ITEM_IDS } from './characterItems.js';

export const POTION_USE_EFFECT_DURATION_MS=1_250;

export class PotionUseEffectRenderer {
  constructor(scene,playerId,remotes){
    Object.assign(this,{scene,playerId,remotes,seen:new Map(),effects:new Map()});
  }

  spriteFor(playerId){
    return playerId===this.playerId?this.scene.player:this.remotes.players.get(playerId)?.sprite;
  }

  receive(rows){
    const present=new Set(rows.map(row=>row.playerId));
    for(const id of this.seen.keys())if(!present.has(id))this.seen.delete(id);
    for(const row of rows){
      const usedAt=Number(row.lastItemUseAt);
      const previous=this.seen.get(row.playerId);
      this.seen.set(row.playerId,Number.isFinite(usedAt)?usedAt:0);
      if(previous!==undefined&&Number.isFinite(usedAt)&&usedAt!==previous&&
        row.lastItemUseId===CHARACTER_ITEM_IDS.HEALTH_POTION)this.show(row.playerId);
    }
  }

  show(playerId){
    const sprite=this.spriteFor(playerId);if(!sprite)return false;
    this.remove(playerId);
    const glow=this.scene.add.graphics();
    glow.lineStyle(3,0x79ffb4,.9).strokeEllipse(0,-19,46,58);
    glow.lineStyle(2,0xfff2a3,.85).strokeEllipse(0,0,52,18);
    glow.fillStyle(0xc8ffe2,.9);
    for(const [x,y,r] of [[-19,-34,2],[18,-27,2.5],[-14,-12,1.5],[14,-49,1.5],[0,-58,2]])glow.fillCircle(x,y,r);
    glow.setBlendMode(Phaser.BlendModes.ADD).setPosition(sprite.x,sprite.y).setDepth(sprite.y+2);
    const tween=this.scene.tweens.add({targets:glow,
      alpha:{from:.95,to:0},scaleX:{from:.68,to:1.32},scaleY:{from:.68,to:1.32},
      duration:POTION_USE_EFFECT_DURATION_MS,ease:'Sine.easeOut',
      onComplete:()=>this.remove(playerId,glow),
    });
    this.effects.set(playerId,{glow,tween});return true;
  }

  update(){
    for(const [playerId,effect] of this.effects){
      const sprite=this.spriteFor(playerId);
      if(!sprite?.active){this.remove(playerId);continue;}
      effect.glow.setPosition(sprite.x,sprite.y).setDepth(sprite.y+2);
    }
  }

  remove(playerId,expected){
    const effect=this.effects.get(playerId);if(!effect||(expected&&effect.glow!==expected))return;
    this.effects.delete(playerId);effect.tween?.stop();effect.glow.destroy();
  }

  destroy(){for(const id of [...this.effects.keys()])this.remove(id);this.seen.clear();}
}
