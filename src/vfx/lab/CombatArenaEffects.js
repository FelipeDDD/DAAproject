import { drawField } from './fieldDetails.js';
import { drawFlight } from './SheetSequence.js';
import { clamp,boxCenter } from './combatGeometry.js';
import { AREAS } from './combatAreas.js';
import { MUSHROOM_BOSS } from './mushroomBoss.js';


const TAU=2*Math.PI;

function electricPulse(g,x,y,radius,squash,phase,opacity){
  const tick=Math.floor(phase*12);
  for(let i=0;i<3;i++){
    const a=tick*0.77+i*TAU/3,dx=Math.cos(a)*radius,dy=Math.sin(a)*radius*squash;
    const mx=x+dx*0.55-dy*0.23,my=y+dy*0.55+dx*0.10;
    g.lineStyle(1,0xfff68c,opacity).lineBetween(x+dx*0.18,y+dy*0.18,mx,my)
      .lineBetween(mx,my,x+dx,y+dy);
  }
}

function landingShadow(g,point,progress,radius,color){
  const {x,y}=point;
  g.fillStyle(0x17182a,0.24+0.39*progress).fillEllipse(x,y,radius*2,31)
    .fillStyle(0x17121b,0.14+0.18*progress).fillEllipse(x,y,45,21)
    .lineStyle(1,color,0.76).strokeCircle(x,y,radius)
    .lineStyle(3,color,0.96).beginPath();
  g.arc(x,y,radius,-Math.PI/2,-Math.PI/2+TAU*progress).strokePath();
}

const fadeGroundArea=area=>Math.min(1,(area.lifetime-area.age)/480);

export function drawGroundArea(g,area){
  const {x,y,age,radius,squash,kind}=area;
  const time=age/1000,width=radius*2,height=width*squash;
  const opacity=Math.min(0.4+age/210,fadeGroundArea(area));
  if(kind==='electric'){
    const pulse=(1+Math.cos(time*TAU*2))/2;
    g.fillStyle(0x9b7216,0.44*opacity).fillEllipse(x,y,width,height)
      .lineStyle(1,0xffde50,opacity).strokeEllipse(x,y,width,height);
    electricPulse(g,x,y,radius*0.9,squash,time,(0.45+0.55*pulse)*opacity);
    return;
  }
  const ice=kind==='ice',big=kind==='unstable',haze=kind==='haze';
  const dark=ice?0x306888:big?0x582a76:0x427729;
  const light=ice?0xbdf4ff:big?0xf5b5fd:0xb3ec65;
  const wave=(1+Math.sin(time*(big?5:3)))/2;
  g.fillStyle(dark,(haze?0.25:0.60)*opacity).fillEllipse(x,y,width,height)
    .lineStyle(1,light,0.8*opacity).strokeEllipse(x,y,width,height)
    .fillStyle(light,(0.12+wave*0.10)*opacity).fillEllipse(x,y,width*(0.72+0.09*wave),height*0.70);
  for(let i=0;i<(big?12:8);i++){
    const angle=i*2.39996+area.sourceId;
    const distance=radius*(0.30+0.6*((i*0.618)%1));
    const px=Math.round(x+distance*Math.cos(angle)),py=Math.round(y+distance*squash*Math.sin(angle));
    const t=(time*0.85+i/8)%1;
    if(ice){
      const dx=Math.round(Math.cos(angle)*6);
      g.lineStyle(1,light,0.62*opacity).lineBetween(px,py,px+dx,py-3)
        .lineBetween(px+dx,py-3,px+dx+2,py-7);
      g.fillStyle(0xf0ffff,opacity*Math.sin(t*Math.PI)).fillRect(px,py,2,2);
    }else{
      const a=Math.sin(t*Math.PI)*opacity;
      const cy=py-(big?5:9)*t;
      g.fillStyle(light,0.36*a).fillCircle(px,cy,2+t*(big?5:2))
        .fillStyle(0xfff6da,0.68*a).fillRect(px-1,cy-1,2,1);
    }
  }
}

export class CombatArenaEffects{
  constructor(scene,kind,sheets){
    if(kind==='slime')this.spores=scene.add.graphics().setDepth(-0.55);
    this.floor=scene.add.graphics().setDepth(-0.45);
    if(kind==='mushroom'){
      this.charge=scene.add.graphics();
      const sheet=sheets['pfx-spores'];
      this.mine=scene.add.image(0,0,'pfx-spores').setOrigin(sheet.anchor[0]/sheet.width,sheet.anchor[1]/sheet.height)
        .setScale(0.65).setVisible(false);
      this.mineFrames=sheet.frameMs.length;
    }
    if(kind!=='ghost'&&kind!=='snake'&&kind!=='frog'){
      this.missiles=Array.from({length:3},()=>scene.add.graphics());
    }else this.missiles=[];
    if(kind==='ghost'||kind==='frost'){
      const key=kind==='ghost'?'pfx-spectral-orb':'pfx-frost-nova';
      const sheet=sheets[key];
      const offset=kind==='ghost'?52:0;
      this.accent=scene.add.image(0,0,key,0).setOrigin(sheet.anchor[0]/sheet.width,(sheet.anchor[1]-offset)/sheet.height)
        .setVisible(false);
      this.accentFrames=sheet.frameMs.length;
    }
  }

  destroy(){
    this.spores?.destroy();
    this.floor.destroy();
    for(const missile of this.missiles)missile.destroy();
    this.accent?.destroy();
    this.mine?.destroy();
    this.charge?.destroy();
  }

  draw(bout,deathArea){
    if(this.spores){
      this.spores.setVisible(Boolean(deathArea));
      if(deathArea){
        this.spores.setPosition(deathArea.x,deathArea.y).setScale(deathArea.radius/70).setAlpha(fadeGroundArea(deathArea));
        drawField(this.spores,'spores',deathArea.age/deathArea.lifetime);
      }
    }
    const {enemy,attack,phase,elapsed,shots,land,spec}=bout;
    const floor=this.floor.clear();
    this.charge?.clear();
    for(const missile of this.missiles)missile.clear();
    this.accent?.setVisible(false);
    const accent=spec.accent??0xffca88;
    if(attack?.kind==='jump'||attack?.leap){
      const {flightMs,windupMs,radius}=attack.leap??{flightMs:spec.jumpMs,windupMs:spec.jumpWindup,radius:spec.jumpRadius};
      const progress=phase==='jump'?0.4+0.6*elapsed/flightMs:0.4*elapsed/windupMs;
      landingShadow(floor,attack.to,clamp(progress,0,1),radius,accent);
    }
    if(land){
      const t=land.elapsed/360,haunt=land.kind==='haunt';
      if(spec.jumpStatus==='Stunned')electricPulse(floor,land.x,land.y,land.radius,0.70,t,1-t);
      floor.lineStyle(haunt?3:2,haunt?0xc5a5ff:accent,1-t)
        .strokeCircle(land.x,land.y,land.radius*(0.38+0.62*t));
      if(bout.kind==='frost'){
        // Sample the PixelFX frost-nova impact (after its anticipation), centered on the landing.
        this.accent.setPosition(land.x,land.y).setDepth(land.y+1).setScale(0.32)
          .setFrame(9+Math.floor(t*24)).setAlpha(1-t*t).setVisible(true);
      }
      if(haunt){
        floor.fillStyle(0xa18bfd,0.35*(1-t)).fillEllipse(land.x,land.y,land.radius*2*t,land.radius*t);
        for(let i=0;i<7;i++){
          const angle=i/7*TAU;
          const length=land.radius*(0.36+0.64*t);
          floor.fillStyle(0xe1dcff,1-t).fillCircle(land.x+length*Math.cos(angle),
            land.y+length*Math.sin(angle)*0.65-15*t,1.5*(1-t));
        }
      }
    }

    const color=bout.kind==='slime'?0xb3ec65:accent;
    const mushroom=bout.kind==='mushroom';
    const event=phase==='BossEvent'?bout.boss.event:null;
    if(this.mine){
      const area=bout.bout.areas.find(a=>a.sourceId===bout.id&&a.kind==='sporecap');
      this.mine.setVisible(Boolean(area));
      if(area){
        const t=area.triggeredAt===undefined?0.12:0.12+0.87*(area.age-area.triggeredAt)/area.burstMs;
        this.mine.setPosition(area.x,area.y).setDepth(area.y+1).setFrame(Math.floor(t*this.mineFrames));
      }
    }
    if(phase==='emerging'){
      const t=elapsed/bout.emergeMs;
      floor.lineStyle(2,0xc4e976,1-t).strokeEllipse(enemy.x,enemy.y,20+30*t,10+15*t);
    }
    const mineWarning=event?.id==='sporecap';
    const bloomWarning=event?.id==='bloom'||(event?.id==='final'&&!bout.bout.freeEnemySlots);
    if((event&&!event.released&&(mineWarning||bloomWarning))||(phase==='windup'&&attack.kind==='bloom')){
      const {radius,squash}=AREAS[mineWarning?'sporecap':'toxic-bloom'];
      const t=elapsed/(event?MUSHROOM_BOSS.releaseMs:spec.bloom.windupMs);
      const points=mineWarning?event.points.slice(0,1):event?.points??attack.points;
      for(const {x,y} of points){
        floor.fillStyle(0x40521d,0.15+t*0.25).fillEllipse(x,y,radius*2,radius*2*squash)
          .lineStyle(2,accent,0.9).strokeEllipse(x,y,radius*2,radius*2*squash)
          .lineStyle(1,0xe7fab2,0.7).strokeEllipse(x,y,radius*2*t,radius*2*squash*t);
      }
    }
    if((event&&!event.released)||(phase==='windup'&&(attack.windup||mushroom))){
      const center=mushroom?{x:enemy.x,y:enemy.y-spec.capHeight}:boxCenter(spec.box(enemy));
      const t=elapsed/(event?MUSHROOM_BOSS.releaseMs:mushroom?spec[attack.kind].windupMs:attack.windup);
      const g=(this.charge??this.missiles[0]).setPosition(center.x,center.y).setRotation(0).setDepth(enemy.y+15);
      g.fillStyle(color,0.28+0.33*t).fillCircle(0,0,7+9*t)
        .lineStyle(2,color,0.78).strokeCircle(0,0,16-7*t);
      for(let i=0;i<6;i++){
        const angle=i*TAU/6+t*TAU;
        const r=20-9*t;
        g.fillStyle(0xfff7e5,0.5+0.45*t).fillCircle(Math.cos(angle)*r,Math.sin(angle)*r,1+Number(t>0.68));
      }
    }
    for(const [index,shot] of shots.entries()){
      if(shot.kind==='bolt'){this.showOrb(shot,shot.elapsed,0.36,1,shot.y+15);continue;}
      const g=this.missiles[index].setPosition(shot.x,shot.y).setRotation(shot.angle).setDepth(shot.y+15);
      if(shot.special)g.lineStyle(1,color,0.55).strokeCircle(0,0,shot.radius+3);
      if(shot.kind==='glob'){
        const scale=shot.special?0.62:1;
        g.fillStyle(0x733990).fillEllipse(-3*scale,0,23*scale,15*scale)
          .fillStyle(0xcf83ef).fillEllipse(0,-2*scale,15*scale,9*scale).fillStyle(0xffe8fc).fillCircle(2*scale,-4*scale,2*scale);
      }else if(shot.kind==='spark'){
        g.fillStyle(0xffe654).fillCircle(0,0,5).fillStyle(0xffffd9).fillCircle(1,0,2)
          .lineStyle(2,0xffc53c).lineBetween(-14,2,-7,-2).lineBetween(-7,-2,-3,0);
      }else drawFlight(g,shot.kind==='frost'?'icicle':'acid',shot.elapsed/shot.lifetime,0);
    }
    if(phase==='windup'&&(attack.kind==='bolt'||attack.kind==='haunt')){
      const center=boxCenter(spec.box(enemy));
      const t=Math.min(1,elapsed/(attack.kind==='bolt'?490:450));
      this.showOrb({x:center.x-8,y:center.y+8},elapsed,0.10+0.17*t,0.42+0.58*t,enemy.y+2);
    }
  }

  showOrb(point,ms,scale,opacity,depth){
    this.accent.setPosition(point.x,point.y).setDepth(depth).setScale(scale)
      .setAlpha(opacity).setFrame(Math.floor(ms/50)%this.accentFrames).setVisible(true);
  }
}
