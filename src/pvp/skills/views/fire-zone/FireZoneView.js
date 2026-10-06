import { FIRE_ZONE_VISUAL } from './visualConfig.js';

// A quiet placeholder on the ground, below players. Future animation/assets
// belong here; no timers, damage decisions or lifecycle events are authored.
export class FireZoneView {
  constructor(scene,instance,{config=FIRE_ZONE_VISUAL}={}){
    this.config=config;this.object=scene.add.graphics().setDepth(config.depth);
    this.render(instance);
  }
  render(instance){
    this.object.setPosition(instance.x,instance.y);
    if(this.phase===instance.phase&&this.radius===instance.radius)return;
    this.phase=instance.phase;this.radius=instance.radius;
    const c=this.config,active=instance.phase==='active',g=this.object;
    g.clear().fillStyle(c.color,active?c.activeFillAlpha:c.telegraphFillAlpha).fillCircle(0,0,instance.radius);
    g.lineStyle(c.lineWidth,c.color,active?c.activeAlpha:c.telegraphAlpha).strokeCircle(0,0,instance.radius);
    if(!active)g.fillStyle(c.color,c.telegraphAlpha).fillCircle(0,0,c.centerRadius);
  }
  destroy(){this.object.destroy();}
}
