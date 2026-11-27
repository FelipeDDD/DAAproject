import { SheetSequence,createSentryView,drawFlight } from './SheetSequence.js';
import { SKILLS } from './combatSkills.js';
import { handOf } from './precisionDemo.js';
import { boxCenter } from './combatGeometry.js';
import { createFireRingView,FIRE_RING_ART_CHARGE_MS,FIRE_RING_ART_RADIUS } from './fireRingVisual.js';
import sheets from '../../../tools/vfx-lab/sheets/combat-pixelfx.json' with {type:'json'};

export const combatSheets=[...new Set(Object.values(SKILLS).filter(skill=>!skill.meteor)
  .flatMap(skill=>skill.clips.map(c=>c.sheet).filter(Boolean)))];
let fireRingSerial=0;

export class CombatSkillView{
  constructor(scene,action,filter){
    this.scene=scene;
    this.action=action;
    this.filter=filter;
  }

  sequence(clips){
    const {scene,action,filter}=this;
    return new SheetSequence(scene,clips,action.anchor,scene.player,filter,Math.random,
      action.captureAim,undefined,()=>action.contact);
  }

  draw(){
    const {action,scene}=this;
    const {skill,shot,age}=action;
    if(skill.shape==='missile'){
      if(!action.released)return;
      if(shot){
        this.graphics??=scene.add.graphics();
        this.graphics.clear().setPosition(shot.x,shot.y).setRotation(shot.angle).setDepth(shot.y+24);
        drawFlight(this.graphics,skill.flight,shot.traveled/skill.range,0);
      }else{
        this.graphics?.clear();
        this.track??=this.sequence([{sheet:skill.impact,at:0,ms:skill.impactMs,scale:skill.radius?0.85:1}]);
        this.track.update(age-action.impactAt);
      }
      return;
    }
    if(skill.shape==='self-area'){this.drawFireRing();return;}
    if(skill.shape==='sentry'){this.drawSentry();return;}
    if(skill.meteor){this.drawMeteor();return;}
    if(skill.castSpeed&&!action.released){this.drawDrainCharge();return;}
    this.graphics?.clear();
    this.track??=this.sequence(skill.clips);
    const artAge=skill.artImpactMs===undefined?age-(skill.effect.preparation?skill.cast:0):
      age<skill.cast?age*skill.artImpactMs/skill.cast:age-skill.cast+skill.artImpactMs;
    this.track.update(artAge);
  }

  drawSentry(){
    const {scene,action,filter}=this;
    const {skill,age,anchor,sentry}=action;
    if(!sentry){
      this.graphics??=scene.add.graphics().setPosition(anchor.x,anchor.y).setDepth(-0.3);
      this.graphics.clear().lineStyle(1,0x81c9ff,0.35+0.55*age/skill.cast)
        .strokeCircle(0,0,skill.radius);
      return;
    }
    this.graphics?.clear();
    this.coil??=createSentryView(scene,anchor,skill.radius,filter);
    const ms=age-skill.cast;
    this.coil.draw(ms,Array.from(sentry.flashes,([actor,at])=>({
      ...boxCenter(actor.spec.box(actor.enemy)),age:ms-at,
    })));
  }

  drawFireRing(){
    const {scene,action,filter}=this;
    const {skill,age,released}=action;
    const center=released?action.anchor:scene.player;
    const progress=Math.min(1,age/skill.cast);
    const artAge=released?FIRE_RING_ART_CHARGE_MS+age-skill.cast:progress*FIRE_RING_ART_CHARGE_MS;
    this.fireRing??=createFireRingView(scene,center,filter,undefined,{texturePrefix:'combat-fire-ring-'+(++fireRingSerial)});
    for(const {image,name} of this.fireRing.layers){
      image.setPosition(center.x,center.y).setScale(skill.radius/FIRE_RING_ART_RADIUS);
      if(name==='front')image.setDepth(center.y+1);
    }
    this.fireRing.update(artAge,artAge-(this.fireRingAge??0));
    this.fireRingAge=artAge;
    this.graphics?.clear();
    if(released)return;
    this.graphics??=scene.add.graphics().setDepth(-0.3);
    this.graphics.setPosition(center.x,center.y)
      .lineStyle(1,0xff9554,0.25+0.45*progress).strokeCircle(0,0,skill.radius)
      .lineStyle(2,0xffbc71,0.2+0.6*progress).strokeCircle(0,0,skill.radius*progress);
  }

  drawDrainCharge(){
    const {scene,action}=this;
    const {skill,age}=action;
    const hand=handOf(scene.player);
    const progress=age/skill.cast;
    this.graphics??=scene.add.graphics();
    const g=this.graphics.clear().setPosition(hand.x,hand.y).setDepth(scene.player.y+5);
    g.fillStyle(0x962131,0.32+progress*0.25).fillCircle(0,0,10+progress*5)
      .fillStyle(0xe34750,0.65+progress*0.35).fillCircle(0,0,3+progress*3)
      .lineStyle(1,0xff8d87,0.5+progress*0.5).strokeCircle(0,0,9-progress*2)
      .fillStyle(0xffd2bf,0.55+progress*0.45).fillCircle(0,0,1+progress*2);
    for(let i=0;i<5;i++){
      const angle=age/170+i*Math.PI*2/5;
      const radius=15-progress*7;
      g.fillStyle(0xff616a,0.45+progress*0.5).fillCircle(Math.cos(angle)*radius,Math.sin(angle)*radius,1+i%2);
    }
  }

  drawMeteor(){
    const {scene,action,filter}=this;
    const {skill,age,anchor,released}=action;
    const {sheet,fallMs,scale}=skill.meteor;
    const start=skill.cast-fallMs;
    this.graphics??=scene.add.graphics().setPosition(anchor.x,anchor.y).setDepth(-0.3);
    const g=this.graphics.clear();
    if(!released){
      const progress=age/skill.cast;
      const descent=Math.max(0,(age-start)/fallMs);
      g.fillStyle(0x301c24,0.12+descent*0.46)
        .fillEllipse(0,0,skill.radius*(1.6-descent*0.6),skill.radius*(0.72-descent*0.26))
        .lineStyle(1,0xffaa68,0.65).strokeCircle(0,0,skill.radius)
        .lineStyle(2,0xffc58b).beginPath()
        .arc(0,0,skill.radius,-Math.PI/2,-Math.PI/2+2*Math.PI*progress).strokePath();
    }
    if(age<start)return;
    const atlas=sheets[sheet];
    if(!this.meteor){
      this.meteor=scene.add.image(anchor.x,anchor.y,sheet,0)
        .setOrigin(atlas.anchor[0]/atlas.width,atlas.anchor[1]/atlas.height).setScale(scale).setDepth(anchor.y+1);
      this.meteor.texture.setFilter(filter);
    }
    const frame=Math.min(atlas.frameMs.length-1,Math.floor((age-start)/atlas.frameMs[0]));
    this.meteor.setFrame(frame);
  }

  destroy(){
    this.track?.destroy();
    this.meteor?.destroy();
    this.fireRing?.destroy();
    this.coil?.destroy();
    this.graphics?.destroy();
  }
}
