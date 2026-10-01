export const ARENA_CODE_ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const normalizeArenaCode=value=>String(value??'').trim().toUpperCase();
export const validArenaCode=value=>/^[A-Z2-9]{6}$/.test(normalizeArenaCode(value));

export function readArenaInvitation(search=globalThis.location?.search??''){
  const params=new URLSearchParams(search);
  return params.has('coop')?normalizeArenaCode(params.get('coop')):null;
}
export function consumeArenaInvitation(location=globalThis.location,history=globalThis.history){
  if(!location)return null;
  const code=readArenaInvitation(location.search);
  if(code===null)return null;
  // Consume only the invitation, preserving other parameters/hash and the current domain.
  const url=new URL(location.href);url.searchParams.delete('coop');
  history?.replaceState(history.state,'',`${url.pathname}${url.search}${url.hash}`);
  return code;
}
export function arenaClosureMessage(reason){
  return ({'host-left':'The host closed the lobby.',
    'host-disconnected':'The host disconnected. The lobby is closed.',
    expired:'This lobby has expired.',removed:'You are no longer in this lobby.'})[reason]
    ??'This lobby is no longer available.';
}
export function arenaLobbyErrorMessage(error){
  const text=String(error?.data??error?.message??error);
  const messages={
    ARENA_CODE_INVALID:'Enter a valid six-character lobby code.',
    ARENA_LOBBY_NOT_FOUND:'Lobby not found. Check the code and try again.',
    ARENA_LOBBY_FULL:'This lobby is full (4 players).',
    ARENA_LOBBY_CLOSED:'This lobby is closed. Ask the host for a new code.',
    ARENA_LOBBY_STARTED:'This encounter has already started.',
    ARENA_LOBBY_EXPIRED:'This lobby has expired. Ask the host for a new code.',
    ARENA_HOST_LEFT:'The host disconnected. Ask for a new lobby code.',
    ARENA_HOST_ONLY:'Only the host can start the encounter.',
    ARENA_DEV_DISABLED:'Experimental co-op is disabled on this backend.',
    CHARACTER_SESSION_LOST:'Your character session expired. Choose a character again.',
  };
  return Object.entries(messages).find(([code])=>text.includes(code))?.[1]
    ??'Could not reach the lobby. Check your connection and try again.';
}
export function setArenaDiagnostics(scene,state){
  scene.arenaDiagnostics=state;
  scene.devTools?.setArenaDiagnostics?.(state);
}
