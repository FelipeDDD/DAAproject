import { WorldPrompt } from '../ui/WorldPrompt.js';
import { NpcProximityDialogue, BEGGAR_PROXIMITY, proximityBand } from './beggarDialogue.js';

export class BeggarInteraction {
  constructor(scene, npc) {
    this.scene = scene; this.npc = npc; this.dialogue = new NpcProximityDialogue();
    this.speech = new WorldPrompt(scene, '', {className: 'secretary-speech-prompt', clamp: true});
    this.prompt = new WorldPrompt(scene, '', {className: 'terminal-world-prompt'});
    this.nextCheck = 0; this.inRange = false; this.pending = false; this.destroyed = false;
  }
  available() {
    const s = this.scene;
    return Boolean(!this.suspended && this.npc.sprite && !s.chat?.isInputActive && !s.terminal?.active
      && !s.puzzleTerminal?.active && !s.networkTerminal?.active && !s.wardrobe?.active
      && !s.quiz?.seated && !s.soloStudy?.active && !s.characterItems?.transforming);
  }
  distance() {
    const p = this.scene.player.body.center, npc = this.npc.sprite;
    return npc ? Math.hypot(p.x - npc.x, p.y - npc.y) : Infinity;
  }
  canInteract() {
    return this.available() && proximityBand(this.distance(), this.scene.source.tilewidth) === 'interaction';
  }
  lookAtPlayer(now) {
    const position = this.scene.player.body.center;
    this.npc.lookAtPlayer?.(position, now, BEGGAR_PROXIMITY.speechMs);
  }
  show(pool, now) {
    this.lookAtPlayer(now);
    this.speech.setText(this.dialogue.say(pool, now)).setVisible(true);
  }
  update(time) {
    const npc = this.npc.sprite;
    if (!npc) return;
    if (time >= this.nextCheck) {
      this.nextCheck = time + BEGGAR_PROXIMITY.checkMs;
      this.inRange = this.canInteract();
      const state = this.scene.collectibleQuest?.state;
      const text = this.dialogue.update(time, this.distance(), this.scene.source.tilewidth,
        {hasPack: state?.hasPack, completed: state?.completed, enabled: this.available()});
      if (text) {
        this.lookAtPlayer(time);
        this.speech.setText(text).setVisible(true);
      }
      this.prompt.setText(state?.hasPack ? '[E] Zigarettenschachtel geben' : '[E] Sprechen');
    }
    this.prompt.setVisible(this.inRange && this.available() && !this.pending)
      .setPosition(npc.x, npc.y - 12);
    this.speech.setVisible(time < this.dialogue.speechUntil)
      .setPosition(npc.x, npc.y - npc.displayHeight - 10);
  }
  async interact(time) {
    if (!this.canInteract() || this.pending) return;
    this.lookAtPlayer(time);
    const quest = this.scene.collectibleQuest;
    if (!quest?.state?.hasPack) {
      this.show(quest?.state?.completed ? 'completed' : 'near', time); return;
    }
    this.pending = true;
    try {
      const state = await quest.handIn();
      if (state && !this.destroyed && !this.suspended) this.show(state.completed ? 'completed' : 'handed', this.scene.time.now);
      // Completion/reward hook is deliberately state-only; no reward is granted.
    } catch(error) {
      if (!this.destroyed) this.scene.hint.textContent = `Could not hand in item: ${error.message}`;
    } finally { this.pending = false; }
  }
  hide() { this.suspended = true; this.inRange = false; this.prompt.setVisible(false); this.speech.setVisible(false); }
  resume() { this.suspended = false; this.nextCheck = 0; }
  destroy() { this.destroyed = true; this.speech.destroy(); this.prompt.destroy(); }
}
