import { characterById } from './characters.js';
import { BossProgressClient } from './boss/BossProgressClient.js';
import { BOSS_REWARDS,CHARACTER_SKINS,hasBossReward,normalizeBossProgress } from './boss/BossRewards.js';
import { nearbyWardrobe } from './maps/wardrobes.js';
import { WorldPrompt } from './ui/WorldPrompt.js';

export function wardrobeSkinOptions(progress){
  const normalized=normalizeBossProgress(progress);
  return [
    {id:CHARACTER_SKINS.CLASSIC,label:'Classic',unlocked:true},
    {id:CHARACTER_SKINS.REMASTERED,label:'Remastered',unlocked:hasBossReward(normalized,BOSS_REWARDS.REMASTERED_SKIN)},
  ];
}

export class WardrobeController {
  constructor(scene,presence,definitions){
    this.scene=scene;this.presence=presence;this.definitions=definitions;this.client=new BossProgressClient(presence);
    this.sprites=definitions.map(item=>scene.add.image(item.x,item.y,'school-hanger').setOrigin(.5,1)
      .setDisplaySize(item.width,item.height).setDepth(item.y));
    this.prompt=new WorldPrompt(scene,'[E] Change appearance',{className:'wardrobe-world-prompt'});
    this.root=document.createElement('section');this.root.className='wardrobe-overlay';this.root.hidden=true;
    this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');document.body.append(this.root);
    this.progress=null;this.loading=false;
  }

  get active(){return !this.root.hidden;}
  nearby(){return nearbyWardrobe(this.definitions,this.scene.player?.body);}
  updatePrompt(wardrobe){
    this.prompt.setVisible(Boolean(wardrobe)&&!this.active);
    if(wardrobe)this.prompt.setPosition(wardrobe.x,wardrobe.y-wardrobe.height-6);
  }

  async restore(){
    try{this.progress=normalizeBossProgress(await this.client.getProgress(),this.presence.identity.characterId);}
    catch{this.progress=normalizeBossProgress(null,this.presence.identity.characterId);}
    this.scene.applyCharacterSkin(this.progress.equippedSkin);
    return this.progress.equippedSkin;
  }

  async open(){
    if(this.loading||this.active)return;this.loading=true;
    try{this.progress=normalizeBossProgress(await this.client.getProgress(),this.presence.identity.characterId);this.render();this.root.hidden=false;}
    catch(error){this.render(error.message);this.root.hidden=false;}
    finally{this.loading=false;}
  }

  render(error=''){
    this.root.replaceChildren();const panel=document.createElement('div');panel.className='wardrobe-panel';
    const title=document.createElement('h2');title.textContent='CHANGE APPEARANCE';panel.append(title);
    const list=document.createElement('div');list.className='wardrobe-skins';
    const character=characterById(this.presence.identity.characterId);
    for(const option of wardrobeSkinOptions(this.progress)){
      const button=document.createElement('button');button.type='button';button.className='wardrobe-skin';button.disabled=!option.unlocked;
      if(!option.unlocked)button.classList.add('locked');
      if(this.progress?.equippedSkin===option.id)button.classList.add('equipped');
      const image=document.createElement('img');image.alt='';image.src=`${import.meta.env.BASE_URL}${option.id===CHARACTER_SKINS.REMASTERED?character.newVisual.previewAsset:character.asset}`;
      const label=document.createElement('strong');label.textContent=option.label;
      const state=document.createElement('span');state.textContent=option.unlocked?(this.progress?.equippedSkin===option.id?'Equipped':'Available'):'Locked';
      button.append(image,label,state);button.addEventListener('click',()=>this.equip(option.id));list.append(button);
    }
    const status=document.createElement('p');status.className='wardrobe-status';status.setAttribute('role','status');status.textContent=error;
    const close=document.createElement('button');close.type='button';close.textContent='Close';close.addEventListener('click',()=>this.closePanel());
    panel.append(list,status,close);this.root.append(panel);
  }

  async equip(skin){
    if(this.loading)return;this.loading=true;
    try{this.progress=await this.client.equipSkin(skin);this.scene.applyCharacterSkin(skin);this.render();}
    catch(error){this.render(error.message);}
    finally{this.loading=false;}
  }

  setProgress(progress){this.progress=normalizeBossProgress(progress,this.presence.identity.characterId);if(this.active)this.render();}

  closePanel(){this.root.hidden=true;this.root.replaceChildren();this.prompt.setVisible(false);}
  destroy(){this.closePanel();this.root.remove();this.prompt.destroy();for(const sprite of this.sprites)sprite.destroy();}
}
