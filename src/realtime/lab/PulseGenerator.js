// One deadline timer, independent of rAF and anchored to performance.now().
export function validatePulseSettings(intervalMs,count,{benchmark=false}={}){
  if(!Number.isFinite(intervalMs)||intervalMs<(benchmark?20:50)||intervalMs>2000||!(count===null||(benchmark?[10,20,50]:[10,50]).includes(count)))throw new Error('Invalid pulse settings');
}
export class PulseGenerator {
  constructor({now=()=>performance.now(),schedule=(callback,delay)=>globalThis.setTimeout(callback,delay),cancel=timer=>globalThis.clearTimeout(timer),onShot=()=>{},onComplete=()=>{}}={}){
    Object.assign(this,{now,schedule,cancel,onShot,onComplete});this.generation=0;this.active=false;
  }
  start({intervalMs=100,count=10,benchmark=false}={}){
    validatePulseSettings(intervalMs,count,{benchmark});this.stop();
    this.intervalMs=intervalMs;this.count=count;this.sequence=0;this.skipped=0;this.maxWakeLateness=0;this.nextShotAt=this.now()+intervalMs;this.active=true;this.arm();
  }
  arm(){const generation=this.generation;this.timer=this.schedule(()=>{if(generation!==this.generation||!this.active)return;this.timer=null;this.tick();},Math.max(1,this.nextShotAt-this.now()));}
  tick(){
    const actualFireAt=this.now();if(actualFireAt<this.nextShotAt){this.arm();return;}
    this.maxWakeLateness=Math.max(this.maxWakeLateness,actualFireAt-this.nextShotAt);
    const skipped=Math.floor((actualFireAt-this.nextShotAt)/this.intervalMs);this.skipped+=skipped;this.nextShotAt+=skipped*this.intervalMs;
    const scheduledAt=this.nextShotAt;this.nextShotAt+=this.intervalMs;
    this.onShot({sequence:++this.sequence,scheduledAt,actualFireAt});
    if(!this.active)return;
    if(this.count!==null&&this.sequence>=this.count){this.active=false;this.onComplete('completed');}
    else this.arm();
  }
  stop(){this.cancel(this.timer);this.timer=null;this.active=false;++this.generation;}
}
