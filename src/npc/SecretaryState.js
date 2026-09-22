export const SECRETARY_LINES=Object.freeze({
  greeting:'Hast du den Direktor gesehen? Er war heute seltsam … und jetzt weiß niemand, wo er ist.',
  followup:'Zuletzt habe ich gesehen, wie er in sein Büro ging und die Tür hinter sich schloss. Seitdem ist es ganz still.',
  door:'Ich habe auch versucht reinzukommen. Ich habe keinen Schlüssel für das Büro.',
  spare:'Irgendwo muss es einen Ersatzschlüssel geben. Ich weiß nur nicht, wo er aufbewahrt wird.',
});

export const SECRETARY_PROXIMITY_RADIUS=100;
export const SECRETARY_SECOND_DELAY_MS=4500;
export const SECRETARY_DOOR_DELAY_MS=2300;
export const SECRETARY_GREETING_DURATION_MS=3900;
export const SECRETARY_SPEECH_GAP_MS=500;
const SPEECH_DURATION_MS=4800;

// Kept local to one visit. The scene calls update only while this map is active.
export class SecretaryDialogueState {
  constructor(){this.reset();}
  reset(){
    this.heardGreeting=false;this.heardFollowup=false;this.heardDoor=false;
    this.secondDue=null;this.doorDue=null;this.doorQueue=[];this.active=null;
  }
  attemptDoor(time){
    if(this.heardDoor||this.doorQueue.length||this.doorDue!==null)return false;
    this.secondDue=null;
    this.doorQueue=[SECRETARY_LINES.door,SECRETARY_LINES.spare];
    this.doorDue=Math.max(time+SECRETARY_DOOR_DELAY_MS,
      (this.active?.until??time)+SECRETARY_SPEECH_GAP_MS);
    return true;
  }
  update(time,near){
    if(!near){
      // Only lines that have not started are cancelled by leaving.
      this.secondDue=null;this.doorDue=null;this.doorQueue=[];
    }
    // An already-started line keeps its full reading time, even offscreen.
    if(this.active&&time<this.active.until)return this.active;
    this.active=null;
    if(!near)return null;
    if(this.doorQueue.length){
      if(time<this.doorDue)return null;
      const text=this.doorQueue.shift();
      this.active={text,kind:'door',until:time+SPEECH_DURATION_MS};
      this.doorDue=this.active.until+SECRETARY_SPEECH_GAP_MS;
      if(!this.doorQueue.length)this.heardDoor=true;
      return this.active;
    }
    if(!this.heardGreeting){
      this.heardGreeting=true;
      this.secondDue=time+SECRETARY_SECOND_DELAY_MS;
      this.active={text:SECRETARY_LINES.greeting,kind:'greeting',until:time+SECRETARY_GREETING_DURATION_MS};
      return this.active;
    }
    if(!this.heardFollowup){
      this.secondDue??=time+SECRETARY_SECOND_DELAY_MS;
      if(time>=this.secondDue){
        this.heardFollowup=true;
        this.active={text:SECRETARY_LINES.followup,kind:'followup',until:time+SPEECH_DURATION_MS};
      }
    }
    return this.active;
  }
}
