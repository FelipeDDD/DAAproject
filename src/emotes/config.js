import {
  clampFloatingPosition,loadFloatingPosition,resetFloatingPosition,saveFloatingPosition,
} from '../ui/FloatingHotbar.js';

export const EMOTE_DURATION_MS=2500;
export const EMOTE_COOLDOWN_MS=1000;
export const EMOTE_STORAGE_PREFIX='daa-emote-slots:';
export const EMOTE_POSITION_STORAGE_KEY='daa-emote-bar-position';
export const ACTIVE_EMOTE_PACK_ID='default';

const defaultEmotes=[
  ['laugh','😂','Laugh'],['thumbs-up','👍','Thumbs up'],['skull','💀','Skull'],['question','❓','Question'],
  ['coffee','☕','Coffee'],['party','🎉','Celebrate'],['heart','❤️','Heart'],['clap','👏','Clap'],
  ['fire','🔥','Fire'],['surprised','😮','Surprised'],['sad','😢','Sad'],['angry','😡','Angry'],
  ['thinking','🤔','Thinking'],['wave','👋','Wave'],['check','✅','Check'],['cross','❌','Cross'],
  ['computer','💻','Computer'],['books','📚','Books'],
].map(([id,icon,name])=>Object.freeze({id,icon,name}));

export const EMOTE_PACKS=Object.freeze({
  default:Object.freeze({id:'default',name:'Default',emotes:Object.freeze(defaultEmotes)}),
});

export const activeEmotePack=()=>EMOTE_PACKS[ACTIVE_EMOTE_PACK_ID]??EMOTE_PACKS.default;
export const AVAILABLE_EMOTES=Object.freeze(activeEmotePack().emotes.map(emote=>emote.icon));
export const DEFAULT_EMOTE_SLOTS=Object.freeze(['😂','👍','💀','❓','☕','🎉']);
export const emoteDefinition=icon=>activeEmotePack().emotes.find(emote=>emote.icon===icon);

export function emoteStorageKey(characterId){return `${EMOTE_STORAGE_PREFIX}${characterId}`;}

export function normalizeEmoteSlots(value) {
  if(!Array.isArray(value)||value.length!==6||value.some(emote=>!AVAILABLE_EMOTES.includes(emote)))return [...DEFAULT_EMOTE_SLOTS];
  return [...value];
}

export function loadEmoteSlots(characterId,storage=globalThis.localStorage) {
  try{return normalizeEmoteSlots(JSON.parse(storage?.getItem(emoteStorageKey(characterId))??'null'));}
  catch{return [...DEFAULT_EMOTE_SLOTS];}
}

export function saveEmoteSlots(characterId,slots,storage=globalThis.localStorage) {
  const normalized=normalizeEmoteSlots(slots);storage?.setItem(emoteStorageKey(characterId),JSON.stringify(normalized));return normalized;
}

export function clampHotbarPosition(position,barSize,viewport){
  return clampFloatingPosition(position,barSize,viewport);
}

export function loadEmoteBarPosition(storage=globalThis.localStorage){
  return loadFloatingPosition(EMOTE_POSITION_STORAGE_KEY,storage);
}

export function saveEmoteBarPosition(position,storage=globalThis.localStorage){
  return saveFloatingPosition(EMOTE_POSITION_STORAGE_KEY,position,storage);
}

export function resetEmoteBarPosition(storage=globalThis.localStorage){resetFloatingPosition(EMOTE_POSITION_STORAGE_KEY,storage);}

export function isTextEntryTarget(target,activeElement=globalThis.document?.activeElement) {
  const editable=element=>Boolean(element?.closest?.('input,textarea,select,[contenteditable="true"],[contenteditable=""]'));
  return editable(target)||editable(activeElement);
}

export function shortcutSlot(event,activeElement=globalThis.document?.activeElement) {
  if(event.repeat||event.ctrlKey||event.altKey||event.metaKey||isTextEntryTarget(event.target,activeElement))return -1;
  return /^[1-6]$/.test(event.key)?Number(event.key)-1:-1;
}
