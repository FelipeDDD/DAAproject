import { WorldPrompt } from '../../ui/WorldPrompt.js';

// Local presentation only. Offsets are world pixels relative to the cart's feet.
export const PAYLOAD_DIALOGUE={
  initialDelayMs:3500,durationMs:4500,cooldownMinMs:9000,cooldownMaxMs:15000,
  speakers:[
    {name:'Monitor',x:-17,y:-47,lines:[
      'Ich brauche eine Reparatur. Kein weiteres Windows-Update!',
      'Habt ihr es schon mit Ausschalten versucht? Mich bitte nicht wieder einschalten.',
      'Meine Auflösung ist schlecht. Meine Laune noch schlechter.',
      'Das ist kein Bluescreen. Das ist mein Gesicht.',
    ]},
    {name:'Drucker',x:24,y:-30,lines:[
      'Papierstau? Ich nenne das kreative Arbeitsverweigerung.',
      'Ich brauche eine Reparatur. Und drei Wochen bezahlten Urlaub.',
      'Cyan ist leer. Deshalb kann ich natürlich auch kein Schwarz drucken.',
      'Bitte schiebt vorsichtig. Meine Garantie ist seit 1998 beleidigt.',
    ]},
  ],
};

export class PayloadDialogue {
  constructor(scene,{now=()=>performance.now(),random=Math.random,config=PAYLOAD_DIALOGUE,promptFactory=(s)=>new WorldPrompt(s,'',{className:'payload-speech-prompt'})}={}){
    Object.assign(this,{scene,now,random,config});this.prompt=promptFactory(scene);
    this.reset();
  }
  reset(){this.nextAt=this.now()+this.config.initialDelayMs;this.until=0;this.speakerIndex=0;this.lastLines=new Map();this.prompt.setVisible(false);}
  update(position,visible,active){
    const at=this.now();
    if(!visible||!active){this.prompt.setVisible(false);return;}
    if(at>=this.nextAt&&at>=this.until){
      this.speaker=this.config.speakers[this.speakerIndex++%this.config.speakers.length];
      const choices=this.speaker.lines.filter(line=>line!==this.lastLines.get(this.speaker.name));
      const line=(choices.length?choices:this.speaker.lines)[Math.floor(this.random()*(choices.length||this.speaker.lines.length))];
      this.lastLines.set(this.speaker.name,line);this.prompt.setText(`${this.speaker.name}: ${line}`);
      this.until=at+this.config.durationMs;
      this.nextAt=this.until+this.config.cooldownMinMs+this.random()*(this.config.cooldownMaxMs-this.config.cooldownMinMs);
    }
    if(this.speaker)this.prompt.setPosition(position.x+this.speaker.x,position.y+this.speaker.y);
    this.prompt.setVisible(at<this.until);
  }
  destroy(){this.prompt.destroy();}
}
