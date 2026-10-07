import { EmoteBar } from './EmoteBar.js';
import { EmoteSync } from './EmoteSync.js';
import { EmoteRenderer } from './EmoteRenderer.js';

export function stopSceneEmotes(scene){
  scene.emoteBar?.close();scene.emoteBar=null;
  scene.emoteSync?.close();scene.emoteSync=null;
  scene.emoteRenderer?.close();scene.emoteRenderer=null;
}
export function startSceneEmotes(scene){
  stopSceneEmotes(scene);
  if(!scene.presence?.identity)return;
  const room=scene.presenceRoom??scene.mapKey;
  scene.emoteRenderer=new EmoteRenderer(scene,room,scene.presence.identity.playerId,scene.remotes);
  scene.emoteSync=new EmoteSync(scene.presence,room,scene.emoteRenderer);
  scene.emoteBar=new EmoteBar(scene.presence.identity.characterId,emote=>scene.emoteSync?.trigger(emote));
}
