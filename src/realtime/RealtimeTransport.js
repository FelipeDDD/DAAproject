// Future adapters implement these methods; gameplay never needs a socket object.
export class RealtimeTransport {
  constructor(){this.messageHandlers=new Set();this.stateHandlers=new Set();this.state='disconnected';}
  onMessage(handler){this.messageHandlers.add(handler);return ()=>this.messageHandlers.delete(handler);}
  onConnectionState(handler){this.stateHandlers.add(handler);handler(this.state);return ()=>this.stateHandlers.delete(handler);}
  emitMessage(message){for(const handler of this.messageHandlers)handler(message);}
  setState(state){if(this.state===state)return;this.state=state;for(const handler of this.stateHandlers)handler(state);}
  connect(){throw new Error('Transport adapter must implement connect');}
  disconnect(){throw new Error('Transport adapter must implement disconnect');}
  sendReliable(){throw new Error('Transport adapter must implement sendReliable');}
  sendUnreliable(){throw new Error('Transport adapter must implement sendUnreliable');}
  getStats(){throw new Error('Transport adapter must implement getStats');}
}
