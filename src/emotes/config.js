export const EMOTE_DURATION_MS=2500;
export const EMOTE_COOLDOWN_MS=1000;
export const EMOTE_STORAGE_PREFIX='daa-emote-slots:';

export const AVAILABLE_EMOTES=Object.freeze([
  '😂','👍','💀','❓','☕','🎉','❤️','👏','🔥','😮','😢','😡','🤔','👋','✅','❌','💻','📚',
]);

export const DEFAULT_EMOTE_SLOTS=Object.freeze(['😂','👍','💀','❓','☕','🎉']);

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

export function isTextEntryTarget(target,activeElement=globalThis.document?.activeElement) {
  const editable=element=>Boolean(element?.closest?.('input,textarea,select,[contenteditable="true"],[contenteditable=""]'));
  return editable(target)||editable(activeElement);
}

export function shortcutSlot(event,activeElement=globalThis.document?.activeElement) {
  if(event.repeat||event.ctrlKey||event.altKey||event.metaKey||isTextEntryTarget(event.target,activeElement))return -1;
  return /^[1-6]$/.test(event.key)?Number(event.key)-1:-1;
}
