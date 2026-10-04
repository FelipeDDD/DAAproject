import { WebSocketTransport } from './WebSocketTransport.js';

// Add future adapters here without changing LabState or gameplay consumers.
export const TRANSPORTS=Object.freeze({websocket:options=>new WebSocketTransport(options)});
export function createRealtimeTransport({kind='websocket',...options}){
  if(!Object.hasOwn(TRANSPORTS,kind))throw new Error(`Unsupported transport: ${kind}`);return TRANSPORTS[kind](options);
}
