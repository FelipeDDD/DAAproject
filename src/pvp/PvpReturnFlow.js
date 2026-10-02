import { PVP_RULES } from './config.js';
import { interruptedMatch } from './matchState.js';

// Driven by the scene clock. No polling or background timeout survives a scene exit.
export class PvpReturnFlow {
  constructor(request,onReturn){Object.assign(this,{request,onReturn,deadline:null,closed:false,started:false});}
  update(state,now){
    if(this.closed)return;
    // A background tab can miss the ended snapshot if another survivor has
    // already reset the lobby. A waiting snapshot must still release this arena.
    if(this.deadline===null&&state?.state==='waiting'){
      this.deadline=now;this.round=Math.max(0,(state.round??0)-1);
    }
    if(this.deadline===null&&(!state||interruptedMatch(state))){
      this.deadline=(state?.endedAt??now)+PVP_RULES.returnMs;
      this.round=state?.round??0;
    }
    if(this.deadline!==null&&(now>=this.deadline||state?.state==='waiting')&&!this.started){
      this.started=true;this.requestedAt=now;
      this.pending=Promise.resolve().then(()=>this.closed?null:this.request('returnToLobby',{round:this.round}))
        .catch(()=>null).then(result=>{
          if(!this.closed&&!this.completed)this.complete(result?.matchId??null);
          else if(result?.matchId&&!this.returnedMatchId)
            void this.request('leave',{round:this.round+1}).catch(()=>{});
        });
    }
    // A lost connection must not strand the survivor while awaiting the return mutation.
    if(this.started&&!this.completed&&now-this.requestedAt>=5000)this.complete(null);
  }
  complete(matchId){this.completed=true;this.returnedMatchId=matchId;this.onReturn(matchId);}
  remaining(now){return this.deadline===null?null:Math.max(0,Math.ceil((this.deadline-now)/1000));}
  close(){this.closed=true;}
}
