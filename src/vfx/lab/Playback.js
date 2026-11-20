import { resolveTiming } from './timing.js';

function captureAnchor(captureAim,fallback){
  const point=captureAim?.()??fallback;
  return point&&{...point};
}

// The scene drives time, so switching, replaying and looping never add timers.
export class VfxPlayback {
  constructor(effects,create,{canPrepare=()=>false,settings=()=>({})}={}){
    this.effects=effects;
    this.create=create;
    this.canPrepare=canPrepare;
    this.settings=settings;
    this.active=null;
  }

  play(id,{anchor,captureAim}={}){
    const effect=this.effects[id];
    const settings=this.settings(id);
    const timing=resolveTiming(effect,settings,this.canPrepare());
    const run={id,anchor:captureAnchor(captureAim,anchor),captureAim,timing,settings};
    this.startStage(run,timing.castMs>0);
  }

  startStage(run,preparing){
    this.stop();
    const effect=this.effects[run.id];
    const stage=preparing?effect.preparation:effect;
    const durationMs=preparing?run.timing.castMs:run.timing.durationMs;
    const speed=preparing?1:run.timing.speed;
    const view=this.create(stage,run.anchor,{
      id:run.id,preparing,effect,captureAim:run.captureAim,durationMs,settings:run.settings,
    });
    const duration=view.durationMs??durationMs;
    this.active={...run,preparing,stage,duration,speed,elapsed:0,view};
    this.active.view.update(0,0,duration*speed);
  }

  update(delta,loop){
    if(!this.active)return;
    const effect=this.active;
    const dt=Math.min(100,Math.max(0,delta));
    const release=effect.release;
    if(release){
      release.elapsed+=dt;
      if(release.elapsed>=release.duration){
        release.view.destroy();
        effect.release=null;
      }else release.view.update(release.elapsed,dt,release.duration);
    }
    effect.elapsed+=dt;
    if(effect.elapsed<effect.duration){
      const {speed}=effect;
      effect.view.update(effect.elapsed*speed,dt*speed,effect.duration*speed);
      return;
    }
    if(effect.preparing){
      const {id,captureAim,timing,settings}=effect;
      const anchor=captureAnchor(captureAim,effect.anchor);
      this.startStage({id,anchor,timing,captureAim,settings},false);
      const flash=effect.stage.release;
      if(flash){
        const view=this.create(flash,anchor);
        this.active.release={view,elapsed:0,duration:flash.durationMs};
        view.update(0,0,flash.durationMs);
      }
      const remainder=effect.elapsed-effect.duration;
      if(remainder>0)this.update(remainder,loop);
    }else if(loop)this.play(effect.id,{anchor:effect.anchor,captureAim:effect.captureAim});
    else this.stop();
  }

  stop(){
    const previous=this.active;
    this.active=null;
    previous?.release?.view.destroy();
    previous?.view.destroy();
  }
}
