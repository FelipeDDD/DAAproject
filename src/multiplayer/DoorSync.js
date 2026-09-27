export class DoorSync {
  constructor(presence,room,doors,body) {
    Object.assign(this,{presence,room,doors,body});
    this.ready=false;this.pending=new Set();this.closed=false;this.suspended=false;this.unsubscribe=null;
    this.subscriptionGeneration=0;
    void this.subscribe().catch(()=>{});
  }
  subscribe(){
    if(this.closed||this.suspended||this.unsubscribe)return Promise.resolve(false);
    this.ready=false;
    const generation=++this.subscriptionGeneration;
    this.initialSnapshot=new Promise((resolve,reject)=>{
      let settled=false;
      this.resolveSnapshot=resolve;
      this.unsubscribe=this.presence.client.onUpdate(this.presence.api.doors.inRoom,{room:this.room},states=>{
        if(this.closed||this.suspended||generation!==this.subscriptionGeneration)return;
        for(const state of states){
          const door=this.doors.find(d=>d.id===state.doorId);
          if(door)door.applySharedState(state,this.body());
        }
        this.ready=true;
        if(!settled){settled=true;this.resolveSnapshot=null;resolve(true);}
      },error=>{
        if(generation!==this.subscriptionGeneration)return;
        this.ready=false;this.presence.fail(error);
        this.unsubscribe?.();this.unsubscribe=null;
        if(!settled){settled=true;this.resolveSnapshot=null;reject(error);}
      });
    });
    return this.initialSnapshot;
  }
  suspend(){
    if(this.closed||this.suspended)return false;
    this.suspended=true;this.ready=false;this.subscriptionGeneration++;
    this.resolveSnapshot?.(false);this.resolveSnapshot=null;
    this.unsubscribe?.();this.unsubscribe=null;return true;
  }
  resume(){
    if(this.closed)return Promise.reject(new Error('DoorSync is closed.'));
    if(!this.suspended)return this.initialSnapshot??Promise.resolve(this.ready);
    this.suspended=false;
    return this.subscribe().catch(error=>{if(!this.closed){this.suspended=true;this.unsubscribe?.();this.unsubscribe=null;}throw error;});
  }
  async toggle(door) {
    if(!this.ready)return 'Waiting for door state…';
    if(this.pending.has(door.id))return 'Updating door…';
    if(door.locked)return 'Door locked.';
    if(!door.interactive)return 'Fixed passage.';
    if(door.open&&door.overlaps(this.body()))return 'Move out of the doorway before closing the door.';
    this.pending.add(door.id);
    try {
      await this.presence.client.mutation(this.presence.api.doors.setOpen,{
        room:this.room,doorId:door.id,playerId:this.presence.identity.playerId,sessionId:this.presence.identity.sessionId,open:!door.open,
      });
      return '';
    } catch(error){return error.message.includes('Doorway occupied')?'Doorway occupied.':'Could not update the door. Move closer and try again.';}
    finally{this.pending.delete(door.id);}
  }
  close(){if(this.closed)return;this.closed=true;this.suspended=false;this.ready=false;this.unsubscribe?.();this.unsubscribe=null;}
}
