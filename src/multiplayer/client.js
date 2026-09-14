import { ConvexClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { Presence } from './Presence.js';

let presence;
export function getPresence() {
  if (presence) return presence;
  const status = text => { document.querySelector('.version').textContent = text; };
  const url = import.meta.env.VITE_CONVEX_URL;
  if (!url) { status('Local · configure Convex'); return null; }
  try {
    presence = new Presence(new ConvexClient(url), anyApi, null, status);
    return presence;
  } catch (error) { status('Convex is not configured'); console.warn(error); return null; }
}

export function closePresence() { const old = presence; presence = null; return old?.close(); }
