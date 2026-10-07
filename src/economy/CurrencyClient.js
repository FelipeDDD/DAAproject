// This subscription belongs to the logged-in profile, never to a Phaser scene.
export class CurrencyClient {
  constructor(presence,view){this.presence=presence;this.view=view;this.generation=0;this.listeners=new Set();this.balanceState={coins:null,available:false};}
  subscribe(listener){
    this.listeners.add(listener);listener(this.balanceState);
    return ()=>this.listeners.delete(listener);
  }
  publish(state){
    this.balanceState=state;
    for(const listener of this.listeners)listener(state);
  }
  start(token){
    this.stop();
    if(!token||!this.presence)return;
    this.token=token;
    const generation=this.generation;
    this.unsubscribe=this.presence.client.onUpdate(this.presence.api.currency.balance,{token},balance=>{
      if(generation===this.generation){
        if(!Number.isSafeInteger(balance?.coins)||balance.coins<0){this.setUnavailable();return;}
        this.publish({coins:balance.coins,available:true});this.view.setBalance(balance.coins);
      }
    },()=>{if(generation===this.generation)this.setUnavailable();});
  }
  async devGrantCoins(){
    const identity=this.presence?.identity;
    if(!this.token||!identity?.playerId||!identity?.sessionId)throw new Error('Profile session is unavailable.');
    return this.presence.client.mutation(this.presence.api.currency.devGrantCoins,{
      token:this.token,playerId:identity.playerId,sessionId:identity.sessionId,
    });
  }
  async spinRoulette(spinId){
    const identity=this.presence?.identity;
    if(!this.token||!identity?.playerId||!identity?.sessionId)throw new Error('Profile session is unavailable.');
    return this.presence.client.mutation(this.presence.api.rouletteRewards.spin,{
      token:this.token,playerId:identity.playerId,sessionId:identity.sessionId,spinId,
    });
  }
  setUnavailable(){this.publish({coins:null,available:false});this.view.setUnavailable();}
  stop(){this.generation++;this.unsubscribe?.();this.unsubscribe=null;this.token=null;this.publish({coins:null,available:false});this.view.clear();}
  destroy(){this.stop();}
}

let currentCurrencyClient=null;
export function setCurrentCurrencyClient(client){currentCurrencyClient=client;}
export function getCurrentCurrencyClient(){return currentCurrencyClient;}
