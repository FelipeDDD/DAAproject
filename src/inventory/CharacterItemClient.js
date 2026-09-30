import { requireProfileSessionToken } from '../ProfileSessionClient.js';

export class CharacterItemClient {
  constructor(presence){this.presence=presence;this.submitting=false;}
  get identity(){return this.presence?.identity;}
  async getItems(){
    if(!this.identity)return [];
    return this.presence.client.query(this.presence.api.characterItems.forProfile,{
      token:requireProfileSessionToken(this.presence),playerId:this.identity.playerId,sessionId:this.identity.sessionId,
    });
  }
  async claim(itemId,amount=1){return this.mutate('claim',{itemId,amount});}
  async setActive(itemId,active){return this.mutate('setActive',{itemId,active});}
  async consume(itemId){return this.mutate('consume',{itemId});}
  async claimKoettingPotions(amount){return this.mutate('claimKoettingPotions',{amount});}
  async devClearPotions(){return this.mutate('devClearPotions',{});}
  async devGrantOffice2Key(){return this.mutate('devGrantOffice2Key',{});}
  async mutate(method,args){
    if(!this.identity||this.submitting)throw new Error('Character item service is unavailable.');
    this.submitting=true;
    try{return await this.presence.client.mutation(this.presence.api.characterItems[method],{
      token:requireProfileSessionToken(this.presence),
      ...(['setActive','consume','devClearPotions','devGrantOffice2Key','claimKoettingPotions'].includes(method)?{playerId:this.identity.playerId,sessionId:this.identity.sessionId}:{}),...args,
    });}finally{this.submitting=false;}
  }
}
