import { DIRECTOR_BOSS_ID } from './BossRewards.js';

export class BossProgressClient {
  constructor(presence){this.presence=presence;this.submitting=false;}

  get identity(){return this.presence?.identity;}

  async getProgress(){
    if(!this.identity)return null;
    return this.presence.client.query(this.presence.api.bossProgress.get,{
      characterId:this.identity.characterId,bossId:DIRECTOR_BOSS_ID,
    });
  }

  async recordVictory(victoryId){
    if(!this.identity||this.submitting)throw new Error('Boss progress is unavailable.');
    this.submitting=true;
    try{return await this.presence.client.mutation(this.presence.api.bossProgress.recordVictory,{
      characterId:this.identity.characterId,sessionId:this.identity.sessionId,
      bossId:DIRECTOR_BOSS_ID,victoryId,
    });}finally{this.submitting=false;}
  }

  async chooseReward(rewardId){
    if(!this.identity||this.submitting)throw new Error('Boss progress is unavailable.');
    this.submitting=true;
    try{return await this.presence.client.mutation(this.presence.api.bossProgress.chooseReward,{
      characterId:this.identity.characterId,sessionId:this.identity.sessionId,
      bossId:DIRECTOR_BOSS_ID,rewardId,
    });}finally{this.submitting=false;}
  }

  async equipSkin(skin){
    if(!this.identity||this.submitting)throw new Error('Appearance settings are unavailable.');
    this.submitting=true;
    try{return await this.presence.client.mutation(this.presence.api.bossProgress.equipSkin,{
      characterId:this.identity.characterId,sessionId:this.identity.sessionId,skin,
    });}finally{this.submitting=false;}
  }

  async devSetPreset(preset){
    if(!this.identity||this.submitting)throw new Error('DEV progress tools are unavailable.');
    this.submitting=true;
    try{return await this.presence.client.mutation(this.presence.api.bossProgress.devSetPreset,{
      characterId:this.identity.characterId,sessionId:this.identity.sessionId,preset,
    });}finally{this.submitting=false;}
  }
}
