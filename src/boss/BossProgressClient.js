import { DIRECTOR_BOSS_ID } from './BossRewards.js';
import { requireProfileSessionToken } from '../ProfileSessionClient.js';

export class BossProgressClient {
  constructor(presence){this.presence=presence;this.submitting=false;}

  get identity(){return this.presence?.identity;}

  async getProgress(){
    if(!this.identity)return null;const token=requireProfileSessionToken(this.presence);
    return this.presence.client.query(this.presence.api.bossProgress.get,{
      token,bossId:DIRECTOR_BOSS_ID,
    });
  }

  async recordVictory(victoryId){
    if(!this.identity||this.submitting)throw new Error('Boss progress is unavailable.');
    this.submitting=true;
    try{return await this.presence.client.mutation(this.presence.api.bossProgress.recordVictory,{
      token:requireProfileSessionToken(this.presence),bossId:DIRECTOR_BOSS_ID,victoryId,
    });}finally{this.submitting=false;}
  }

  async chooseReward(rewardId){
    if(!this.identity||this.submitting)throw new Error('Boss progress is unavailable.');
    this.submitting=true;
    try{return await this.presence.client.mutation(this.presence.api.bossProgress.chooseReward,{
      token:requireProfileSessionToken(this.presence),bossId:DIRECTOR_BOSS_ID,rewardId,
    });}finally{this.submitting=false;}
  }

  async equipSkin(skin){
    if(!this.identity||this.submitting)throw new Error('Appearance settings are unavailable.');
    this.submitting=true;
    try{return await this.presence.client.mutation(this.presence.api.bossProgress.equipSkin,{
      token:requireProfileSessionToken(this.presence),skin,
    });}finally{this.submitting=false;}
  }

  async devSetPreset(preset){
    if(!this.identity||this.submitting)throw new Error('DEV progress tools are unavailable.');
    this.submitting=true;
    try{return await this.presence.client.mutation(this.presence.api.bossProgress.devSetPreset,{
      token:requireProfileSessionToken(this.presence),preset,
    });}finally{this.submitting=false;}
  }
}
