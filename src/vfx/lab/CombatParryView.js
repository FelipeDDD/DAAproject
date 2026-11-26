import { drawWard } from './SheetSequence.js';
import { sequenceEffects } from './sequenceEffects.js';

const {offset:[offsetX,offsetY]}=sequenceEffects.shield.variants.Original.find(clip=>clip.ward);
const FLASH_MS=120;

export class CombatParryView{
  constructor(scene){
    this.ward=scene.add.graphics().setVisible(false);
    this.pulse=scene.add.graphics().setVisible(false);
  }

  draw(player,parry,variant){
    const active=parry?.phase==='active';
    this.ward.setVisible(active);
    this.pulse.setVisible(false);
    if(!active)return;
    const age=1-parry.remaining/parry.config.activeMs;
    const glow=parry.blockRemaining===undefined?0:Math.max(0,1-(parry.blockRemaining-parry.remaining)/FLASH_MS);
    const x=player.x+offsetX,y=player.y+offsetY;
    this.ward.setPosition(x,y).setDepth(player.y+4);
    drawWard(this.ward,age*(1-glow),1+0.12*glow);
    if(variant==='pulse'&&glow>0){
      this.pulse.setPosition(x,y).setDepth(player.y+5).setVisible(true)
        .setScale(1.2+(1-glow)*0.8).setAlpha(glow);
      drawWard(this.pulse,0,1);
    }
  }

  destroy(){
    this.ward.destroy();
    this.pulse.destroy();
  }
}
