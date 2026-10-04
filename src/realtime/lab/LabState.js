import { REALTIME_CONFIG as config } from '../config.js';
import { BENCHMARK_CONFIG } from './Benchmark.js';
export const MAX_REMEMBERED_LAB_PROJECTILES=2048;

export class LabSnapshotBuffer {
  constructor(){this.snapshots=[];this.lastSeq=-1;}
  push(position,sequence,arrivalAt){
    if(sequence<=this.lastSeq)return false;this.lastSeq=sequence;
    const previous=this.snapshots.at(-1);
    this.snapshots.push({...position,at:previous?Math.max(arrivalAt,previous.at+.001):arrivalAt});
    if(this.snapshots.length>config.maxSnapshots)this.snapshots.shift();return true;
  }
  sample(now,delayMs,interpolate=true){
    if(!this.snapshots.length)return null;
    if(!interpolate)return this.snapshots.at(-1);
    const at=now-delayMs;
    while(this.snapshots.length>1&&this.snapshots[1].at<=at)this.snapshots.shift();
    const [before,after]=this.snapshots;
    if(!after||at<=before.at)return before;
    const fraction=Math.min(1,(at-before.at)/(after.at-before.at));
    return {...before,x:before.x+(after.x-before.x)*fraction,y:before.y+(after.y-before.y)*fraction};
  }
}

export class LabState {
  constructor(){this.reset();}
  reset(){this.remotes=new Map();this.projectiles=new Map();this.seenProjectiles=new Map();this.testSequences=new Map();this.stale=0;this.lastReceivedTest=0;}
  addPeer(id){if(!this.remotes.has(id))this.remotes.set(id,new LabSnapshotBuffer());}
  removePeer(id){this.remotes.delete(id);this.testSequences.delete(id);for(const [key,p] of this.projectiles)if(p.ownerId===id)this.projectiles.delete(key);}
  receive(m,arrivalAt,serverNow){
    const p=m.payload;
    if(m.type==='room-state'){this.reset();for(const peer of p.peers){this.addPeer(peer.clientId);if(peer.position)this.remotes.get(peer.clientId).push(peer.position,peer.position.sampleSeq??0,arrivalAt);}return;}
    if(m.type==='peer-joined'){this.addPeer(p.clientId);return;}
    if(m.type==='peer-left'){this.removePeer(p.clientId);return;}
    // A delayed lab message from a departed peer cannot recreate that entity.
    if(m.type==='position'){const buffer=this.remotes.get(m.senderId);if(buffer&&!buffer.push(p,p.sampleSeq??m.seq,arrivalAt))this.stale++;}
    if(m.type==='projectile-spawn'&&this.remotes.has(m.senderId))this.spawn(p,m.senderId,serverNow);
    if(m.type==='projectile-destroy'){const projectile=this.projectiles.get(p.id);if(!projectile||projectile.ownerId===m.senderId){this.projectiles.delete(p.id);this.rememberProjectile(p.id,serverNow+3000);}}
    if(m.type==='test-event'){
      if(p.value<=(this.testSequences.get(m.senderId)??-1))this.stale++;
      else{this.testSequences.set(m.senderId,p.value);this.lastReceivedTest=p.value;}
    }
  }
  rememberProjectile(id,expiresAt){this.seenProjectiles.set(id,expiresAt);if(this.seenProjectiles.size>MAX_REMEMBERED_LAB_PROJECTILES)this.seenProjectiles.delete(this.seenProjectiles.keys().next().value);}
  spawn(p,ownerId,now){
    if(this.seenProjectiles.has(p.id))return false;
    this.rememberProjectile(p.id,Math.max(now,p.startedAt)+p.ttlMs+3000);
    if(now>=p.startedAt+p.ttlMs)return false;
    this.projectiles.set(p.id,{...p,ownerId,...(p.pulse?.benchmark?{visualExpiresAt:now+BENCHMARK_CONFIG.visualLifetimeMs}:{})});
    if(p.pulse?.benchmark){
      const visuals=[...this.projectiles].filter(([,item])=>item.pulse?.benchmark);
      for(const [id] of visuals.slice(0,Math.max(0,visuals.length-BENCHMARK_CONFIG.visualCap)))this.projectiles.delete(id);
    }
    return true;
  }
  projectileSamples(now){
    const samples=[];
    for(const [id,p] of this.projectiles){
      if(now>=p.startedAt+p.ttlMs||now>=p.visualExpiresAt){this.projectiles.delete(id);continue;}
      const age=Math.max(0,now-p.startedAt)/1000;const x=p.x+p.vx*age,y=p.y+p.vy*age;
      if(x<0||y<0||x>config.width||y>config.height){this.projectiles.delete(id);continue;}
      samples.push({...p,x,y});
    }
    for(const [id,expiresAt] of this.seenProjectiles)if(expiresAt<now)this.seenProjectiles.delete(id);
    return samples;
  }
}
