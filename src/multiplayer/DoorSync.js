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
    if(!this.ready)return 'Aguardando estado das portas…';
    if(this.pending.has(door.id))return 'Atualizando porta…';
    if(door.locked)return 'Porta trancada.';
    if(!door.interactive)return 'Passagem fixa.';
    if(door.open&&door.overlaps(this.body()))return 'Saia da passagem para fechar a porta.';
    this.pending.add(door.id);
    try {
      await this.presence.client.mutation(this.presence.api.doors.setOpen,{
        room:this.room,doorId:door.id,playerId:this.presence.identity.playerId,open:!door.open,
      });
      return '';
    } catch(error){return error.message.includes('Passagem ocupada')?'Passagem ocupada.':'Não foi possível alterar a porta. Aproxime-se e tente novamente.';}
    finally{this.pending.delete(door.id);}
  }
  close(){this.closed=true;this.unsubscribe();}
}
