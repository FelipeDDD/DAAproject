import { MapScene } from './MapScene.js';
import { MendigaNpc } from '../npc/MendigaNpc.js';
import { MENDIGA_VISUAL } from '../npc/mendigaPatrol.js';
import { BeggarInteraction } from '../npc/BeggarInteraction.js';

export class OutsideScene extends MapScene {
  constructor() { super('outside', 'outside.tmj'); }

  preload() {
    super.preload();
    if (!this.textures.exists(MENDIGA_VISUAL.texture)) this.load.spritesheet(
      MENDIGA_VISUAL.texture, `${import.meta.env.BASE_URL}assets/npc/mendiga-walk.png`,
      {frameWidth: MENDIGA_VISUAL.frameWidth, frameHeight: MENDIGA_VISUAL.frameHeight},
    );
  }

  create(destination = {}) {
    super.create(destination);
    this.mendiga = new MendigaNpc(this);
    this.npcQuestInteraction = new BeggarInteraction(this, this.mendiga);
    const resume = () => this.npcQuestInteraction?.resume();
    this.events.on('wake', resume);
    this.events.once('shutdown', () => this.events.off('wake', resume));
    this.events.once('shutdown', () => { this.npcQuestInteraction?.destroy();this.npcQuestInteraction=null; });
    this.events.once('shutdown', () => { this.mendiga?.destroy(); this.mendiga = null; });
  }

  update(time, delta) {
    this.mendiga?.update(time, delta);
    this.npcQuestInteraction?.update(time);
    super.update(time, delta);
  }
}
