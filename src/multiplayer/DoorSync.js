export class DoorSync {
  constructor(presence,room,doors,body) {
    Object.assign(this,{presence,room,doors,body});
    this.ready=false;
    this.pending=new Set();
    this.unsubscribe=presence.client.onUpdate(presence.api.doors.inRoom,{room},states=>{
      if(this.closed)return;
      for(const state of states){
        const door=doors.find(d=>d.id===state.doorId);
        if(door)door.applySharedState(state,this.body());
      }
      this.ready=true;
    },error=>{this.ready=false;presence.fail(error);});
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
        room:this.room,doorId:door.id,playerId:this.presence.identity.playerId,open:!door.open,
      });
      return '';
    } catch(error){return error.message.includes('Doorway occupied')?'Doorway occupied.':'Could not update the door. Move closer and try again.';}
    finally{this.pending.delete(door.id);}
  }
  close(){this.closed=true;this.unsubscribe();}
}
