import Phaser from 'phaser';
import combatArt from '../../tools/vfx-lab/sheets/combat-pixelfx.json' with {type:'json'};
import { CombatSkillRunner } from '../vfx/lab/CombatSkillRunner.js';
import { CombatSkillView, combatSheets } from '../vfx/lab/CombatSkillView.js';
import { preloadLabSheets } from '../vfx/lab/SheetSequence.js';
import { trackArenaAim } from '../vfx/lab/ArenaAim.js';
import { bindSwampCastInput } from './swampCastInput.js';

const nearest=Phaser.Textures.FilterMode.NEAREST;
const meteor='pfx-combat-meteor';

export function preloadSwampSkills(scene){
  const base=import.meta.env.BASE_URL;
  preloadLabSheets(scene,base,combatSheets.filter(name=>!scene.textures.exists('vfx-lab-sheet-'+name)));
  const {width,height,frameMs}=combatArt[meteor];
  if(!scene.textures.exists(meteor))scene.load.spritesheet(meteor,base+'tools/vfx-lab/sheets/'+meteor+'.png',{
    frameWidth:width,frameHeight:height,endFrame:frameMs.length-1,
  });
}

export class SwampCombatCasts {
  constructor(scene,run,bout,canUse,onHeal){
    Object.assign(this,{scene,run,canUse});
    this.listeners=new AbortController();
    this.views=new Map();
    this.runner=new CombatSkillRunner(bout,onHeal);
    const canvas=scene.game.canvas;
    const signal=this.listeners.signal;
    const aim=trackArenaAim(canvas,scene.cameras.main,{x:scene.player.x+80,y:scene.player.y-20},{signal});
    this.aim=aim.capture;
    bindSwampCastInput(canvas,slot=>this.use(slot),signal);
  }

  use(slot){
    return this.canUse()&&this.runner.use(slot,this.run.skills,this.scene.player,this.aim);
  }

  update(dt){
    this.runner.update(dt,this.scene.player);
    for(const [action,view] of this.views){
      if(this.runner.actions.includes(action))continue;
      view.destroy();
      this.views.delete(action);
    }
    for(const action of this.runner.actions){
      if(!this.views.has(action))this.views.set(action,new CombatSkillView(this.scene,action,nearest));
      this.views.get(action).draw();
    }
  }

  reset(){
    this.runner.reset();
    for(const view of this.views.values())view.destroy();
    this.views.clear();
  }

  destroy(){
    this.listeners.abort();
    this.reset();
  }
}
