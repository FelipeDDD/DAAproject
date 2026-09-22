import { WorldPrompt } from '../ui/WorldPrompt.js';
import {
  SECRETARY_PROXIMITY_RADIUS,SecretaryDialogueState,
} from './SecretaryState.js';

const TEXTURE='school-secretary';
const FRAME_WIDTH=180;
const FRAME_X=320,FRAME_STEP_X=212;
// Rows have different padding: one uniform spritesheet grid would cut feet
// from the first row and include pixels from the next pose in another.
const FRAME_ROWS=[
  {direction:'down',y:0,height:284},
  {direction:'up',y:284,height:262},
  {direction:'left',y:546,height:255},
  {direction:'right',y:801,height:262},
];
const PATROL_HALF_WIDTH=74;
const PATROL_Y_OFFSET=24;
const PATROL_SPEED=32;
const END_PAUSE_MS=300;
const DISPLAY_SCALE=.25;

export function secretaryPatrolArea(transition){
  return {left:transition.x-PATROL_HALF_WIDTH,right:transition.x+PATROL_HALF_WIDTH,
    y:transition.y-PATROL_Y_OFFSET};
}

export function registerSecretaryFrames(scene){
  const texture=scene.textures.get(TEXTURE);
  for(const {direction,y,height} of FRAME_ROWS){
    for(let col=0;col<4;col++){
      const frame=`${direction}-${col}`;
      if(!texture.has(frame))texture.add(frame,0,FRAME_X+col*FRAME_STEP_X,y,FRAME_WIDTH,height);
    }
    const key=`school-secretary-walk-${direction}`;
    if(!scene.anims.exists(key))scene.anims.create({
      key,frames:Array.from({length:4},(_,col)=>({key:TEXTURE,frame:`${direction}-${col}` })),
      frameRate:7,repeat:-1,
    });
  }
}

export class SecretaryNpc {
  constructor(scene,transition){
    this.scene=scene;this.area=secretaryPatrolArea(transition);
    this.x=this.area.left;this.direction=1;this.pauseUntil=0;
    this.state=new SecretaryDialogueState();
    this.sprite=scene.add.sprite(this.x,this.area.y,TEXTURE,'right-0')
      .setOrigin(.5,1).setScale(DISPLAY_SCALE)
      .setDepth(this.area.y);
    this.prompt=new WorldPrompt(scene,'',{className:'secretary-speech-prompt',clamp:true});
    this.lastSpeech=null;
  }
  resetVisit(){
    this.state.reset();this.lastSpeech=null;this.prompt.setVisible(false);
  }
  onDoorAttempt(time){
    if(!this.state.attemptDoor(time))return false;
    return true;
  }
  update(time,delta){
    if(time>=this.pauseUntil){
      this.x+=this.direction*PATROL_SPEED*delta/1000;
      if(this.x>=this.area.right||this.x<=this.area.left){
        this.x=Math.max(this.area.left,Math.min(this.area.right,this.x));
        this.direction*=-1;this.pauseUntil=time+END_PAUSE_MS;
        this.sprite.setFrame(this.direction>0?'right-0':'left-0').stop();
      }else this.sprite.play(`school-secretary-walk-${this.direction>0?'right':'left'}`,true);
    }
    this.sprite.setPosition(this.x,this.area.y).setDepth(this.area.y);
    const feet=this.scene.player.body.center;
    const centerX=(this.area.left+this.area.right)/2;
    const near=Math.hypot(feet.x-centerX,feet.y-this.area.y)<=SECRETARY_PROXIMITY_RADIUS;
    const speech=this.state.update(time,near);
    if(speech!==this.lastSpeech){
      this.lastSpeech=speech;
      if(speech){this.prompt.setText(speech.text).setVisible(true);
        if(speech.kind==='door')this.scene.doorMessage='';}
      else this.prompt.setVisible(false);
    }
    if(speech)this.prompt.setPosition(this.x,this.area.y-this.sprite.displayHeight-10);
  }
  hide(){this.prompt.setVisible(false);this.sprite.stop();this.lastSpeech=null;}
  destroy(){this.prompt.destroy();this.sprite.destroy();}
}
