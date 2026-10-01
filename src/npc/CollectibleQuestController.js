import { hasProfileSession, requireProfileSessionToken } from '../ProfileSessionClient.js';
import { CIGARETTE_SPAWNS } from '../../convex/npcCollectibleSpawns.generated.js';
import { CIGARETTE_QUEST } from './cigaretteQuest.js';
import { readNamedMapMarker } from '../maps/namedMapMarkers.js';
import { WorldPrompt } from '../ui/WorldPrompt.js';
import { normalizeCharacterItem } from '../inventory/characterItems.js';
import { cigarettePack,questInventoryItemId } from './cigarettePacks.js';

export class CollectibleQuestController {
  constructor(scene) {
    this.scene = scene; this.state = null; this.destroyed = false; this.submitting = false;this.pickupPackId=null;this.pickupSpawnId=null;
    this.spawns = CIGARETTE_SPAWNS.filter(spawn => spawn.room === scene.mapKey);
    const presence = scene.presence;
    if (!hasProfileSession(presence) || (scene.mapKey !== CIGARETTE_QUEST.npcRoom && !this.spawns.length)) return;
    this.prompt = new WorldPrompt(scene, '[E] Pick up cigarette pack');
    this.unsubscribe = presence.client.onUpdate(presence.api.npcQuests.progress,
      {token: requireProfileSessionToken(presence)}, state => this.receive(state),
      error => console.warn('NPC quest:', error));
    // One event-driven request on map entry; no polling, cron or idle mutations.
    void this.mutate('start').catch(error => console.warn('NPC quest start:', error));
  }
  auth() {
    const presence = this.scene.presence;
    return {token: requireProfileSessionToken(presence), playerId: presence.identity.playerId,
      sessionId: presence.identity.sessionId};
  }
  async mutate(method, extra = {}) {
    if (this.submitting || this.destroyed) return null;
    this.submitting = true;
    try {
      const presence = this.scene.presence;
      const result = await presence.client.mutation(presence.api.npcQuests[method], {...this.auth(), ...extra});
      if (!this.destroyed) this.receive(result);
      return result;
    } finally { this.submitting = false; }
  }
  receive(state) {
    if (this.destroyed) return;
    this.state = state;
    this.scene.inventoryHotbar?.setCollectionProgress(state);
    this.scene.devTools?.setFreeCollectEnabled?.(state?.devFreeCollect);
    const spawn = state?.devFreeCollect
      ? this.spawns.find(spawn => state.freeCollectPackIds?.includes(spawn.packId))
      : (!state?.hasPack && !state?.completed ? this.spawns.find(spawn => spawn.id === state?.activeSpawnId) : null);
    const marker = spawn && readNamedMapMarker(this.scene.source, spawn.markerName);
    const packId=spawn?.packId??state?.currentPackId;
    const key = marker ? `${packId}:${spawn.id}` : null;
    if (key === this.pickupKey) return;
    this.pickup?.destroy(); this.litter?.destroy();this.litter=null;this.pickup = null; this.pickupKey = key;
    this.pickupPackId=marker?packId:null;this.pickupSpawnId=marker?spawn.id:null;
    this.prompt?.setVisible(false);
    if (marker) {
      this.pickupPosition = marker;
      const pack=cigarettePack(packId);
      if(pack.litter)this.litter=this.createLitter(marker);
      this.pickup = this.scene.add.image(marker.x, marker.y, pack.groundTexture)
        .setOrigin(.5, 1).setDisplaySize(pack.width, pack.height).setDepth(marker.y + 1);
    }
  }
  createLitter(marker){
    // Small local scraps; decoration only, no collision or collectible logic.
    const g=this.scene.add.graphics().setPosition(marker.x,marker.y).setDepth(marker.y-.5);
    g.fillStyle(0x887b69,.7).fillRect(-14,-2,5,2).fillRect(7,1,4,2);
    g.fillStyle(0xc8bc99,.7).fillTriangle(-9,-4,-5,-5,-6,-2).fillTriangle(12,-6,15,-4,11,-3);
    g.fillStyle(0x4b514c,.65).fillRect(-2,3,3,2);
    return g;
  }
  pickupNear() {
    const s = this.scene;
    if (s.chat?.isInputActive || s.terminal?.active || s.puzzleTerminal?.active || s.networkTerminal?.active
      || s.wardrobe?.active || s.quiz?.seated || s.soloStudy?.active || s.characterItems?.transforming) return false;
    const p = this.scene.player.body.center, marker = this.pickupPosition;
    return Boolean(this.pickup && Math.hypot(p.x - marker.x, p.y - marker.y) <= 32);
  }
  update() {
    this.prompt?.setVisible(this.pickupNear());
    if (this.pickup) this.prompt?.setPosition(this.pickupPosition.x, this.pickupPosition.y - 15);
  }
  async collect() {
    if (!this.pickupNear() || this.submitting) return;
    const packId = this.pickupPackId??this.state.currentPackId;
    try {
      const state = await this.mutate('collect', {packId, spawnId: this.pickupSpawnId??this.state.activeSpawnId});
      if (!state || this.destroyed) return;
      await this.scene.characterItems?.restore();
      if (!this.destroyed) this.scene.characterItems?.onItemCollected(normalizeCharacterItem({itemId: questInventoryItemId(packId), quantity: 1}));
    } catch(error) { if (!this.destroyed) this.scene.hint.textContent = `Could not collect item: ${error.message}`; }
  }
  async handIn() {
    if (!this.state?.hasPack || this.submitting) return null;
    const packId = this.state.currentPackId;
    const state = await this.mutate('handIn', {packId});
    if (!this.destroyed && state) {
      const inventory = this.scene.characterItems;
      if (inventory) inventory.setItems(inventory.items.filter(item => ![packId,questInventoryItemId(packId)].includes(item.itemId)), {applyVisual: false});
      await inventory?.restore();
    }
    return state;
  }
  async devCollection(action) {
    const method = action === 'reset' ? 'devResetCollection' : action === 'grant' ? 'devGrantCollection' : null;
    if (!method) return null;
    const state = await this.mutate(method);
    if (state && !this.destroyed) await this.scene.characterItems?.restore();
    return state;
  }
  async setDevFreeCollect(enabled){
    if(this.destroyed)return null;
    return this.mutate('devSetFreeCollect',{enabled:Boolean(enabled)});
  }
  destroy() {
    this.destroyed = true; this.unsubscribe?.(); this.pickup?.destroy();this.litter?.destroy(); this.prompt?.destroy();
  }
}
