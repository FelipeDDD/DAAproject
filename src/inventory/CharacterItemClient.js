import { requireProfileSessionToken } from '../ProfileSessionClient.js';

export class CharacterItemClient {
  constructor(presence){this.presence=presence;this.submitting=false;}
  get identity(){return this.presence?.identity;}
  async getItems(){
    if(!this.identity)return [];
    return this.presence.client.query(this.presence.api.characterItems.forProfile,{token:requireProfileSessionToken(this.presence)});
  }
  async claim(itemId){return this.mutate('claim',{itemId});}
  async setActive(itemId,active){return this.mutate('setActive',{itemId,active});}
  async mutate(method,args){
    if(!this.identity||this.submitting)throw new Error('Character item service is unavailable.');
    this.submitting=true;
    try{return await this.presence.client.mutation(this.presence.api.characterItems[method],{
      token:requireProfileSessionToken(this.presence),...args,
    });}finally{this.submitting=false;}
  }
}
