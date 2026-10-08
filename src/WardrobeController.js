import { characterById } from './characters.js';
import { BossProgressClient } from './boss/BossProgressClient.js';
import { BOSS_REWARDS,CHARACTER_SKINS,hasBossReward,normalizeBossProgress } from './boss/BossRewards.js';
import { nearbyWardrobe } from './maps/wardrobes.js';
import { WorldPrompt } from './ui/WorldPrompt.js';
import { characterColorParts,defaultCharacterPalette } from './art/characterRecolor.js';
import { selectPreviewSkin,clearPreviewSkin } from './characterAppearance.js';

const PREVIEW_COLORS=Object.freeze({
  hair:['#604333','#231e2b','#a57040','#d2b07a','#744878'],
  shirt:['#276d7a','#3778bb','#873f85','#be5b54','#41846a'],
  trousers:['#9a9fa5','#35485f','#654b70','#655b4d','#d3c29d'],
  shoes:['#693340','#282b38','#5b402e','#75818a','#b78355'],
});
const PREVIEW_LABELS=Object.freeze({hair:'Hair',shirt:'Shirt',trousers:'Trousers',shoes:'Shoes'});

export function canPreviewCharacterSkin(character,identity,dev=import.meta.env?.DEV===true,ownsTier3=false){
  return Boolean(character?.experimentalVisual&&(ownsTier3||(dev&&identity?.devAllSkins)));
}

export function wardrobeSkinOptions(progress,{tier3Unlocked=false}={}){
  const normalized=normalizeBossProgress(progress);
  return [
    {id:CHARACTER_SKINS.CLASSIC,label:'Classic',unlocked:true},
    {id:CHARACTER_SKINS.REMASTERED,label:'Remastered',unlocked:hasBossReward(normalized,BOSS_REWARDS.REMASTERED_SKIN)},
    {id:'level3Preview',label:'Tier 3',unlocked:Boolean(tier3Unlocked)},
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
    if(!this.presence.identity.profileId)return 'classic';
    try{this.progress=normalizeBossProgress(await this.client.getProgress(),this.presence.identity.characterId);}
    catch{this.progress=normalizeBossProgress(null,this.presence.identity.characterId);}
    // Loading wardrobe UI must not race with a newer equip/scene transition.
    return this.progress.equippedSkin;
  }

  async open(){
    if(this.loading||this.active)return;this.loading=true;
    try{
      await this.scene.characterItems?.restore();
      if(this.presence.identity.profileId)this.progress=normalizeBossProgress(await this.client.getProgress(),this.presence.identity.characterId);
      this.render();this.root.hidden=false;
    }
    catch(error){this.render(error.message);this.root.hidden=false;}
    finally{this.loading=false;}
  }

  render(error=''){
    this.root.replaceChildren();const panel=document.createElement('div');panel.className='wardrobe-panel';
    const title=document.createElement('h2');title.textContent='CHANGE APPEARANCE';panel.append(title);
    const list=document.createElement('div');list.className='wardrobe-skins';
    const character=characterById(this.presence.identity.characterId);
    const ownsTier3=this.scene.characterItems?.items?.some(item=>item.itemId==='tier3_skin');
    const devPreview=canPreviewCharacterSkin(character,this.presence.identity,import.meta.env?.DEV===true,ownsTier3);
    const options=wardrobeSkinOptions(this.progress,{tier3Unlocked:ownsTier3||devPreview});
    for(const option of options){
      const button=document.createElement('button');button.type='button';button.className='wardrobe-skin';button.disabled=!option.unlocked;
      if(!option.unlocked)button.classList.add('locked');
      const selected=option.id==='level3Preview'
        ?this.presence.identity.visualPreview==='level3Preview'
        :this.presence.identity.visualPreview!=='level3Preview'&&this.progress?.equippedSkin===option.id;
      if(selected)button.classList.add('equipped');
      const image=document.createElement('img');image.alt='';image.src=`${import.meta.env.BASE_URL}${option.id==='level3Preview'
        ?character.experimentalVisual.previewAsset:option.id===CHARACTER_SKINS.REMASTERED?character.newVisual.previewAsset:character.asset}`;
      const label=document.createElement('strong');label.textContent=option.label;
      const state=document.createElement('span');state.textContent=option.unlocked?(selected?'Equipped':'Available'):'Locked';
      button.append(image,label,state);button.addEventListener('click',()=>this.equip(option.id));list.append(button);
    }
    if(list.childElementCount)panel.append(list);
    if(this.presence.identity.visualPreview==='level3Preview'&&character?.experimentalVisual?.recolorSource){
      const colors=document.createElement('div');colors.className='wardrobe-colors';
      const heading=document.createElement('h3');heading.textContent=`${character.name} · Skin test colors`;colors.append(heading);
      const note=document.createElement('p');note.textContent='Local preview only. Colors reset when you leave the game.';colors.append(note);
      const palette=this.presence.identity.previewPalette??defaultCharacterPalette(character.experimentalVisual);
      for(const part of characterColorParts(character.experimentalVisual)){
        const choices=PREVIEW_COLORS[part];
        const row=document.createElement('div');row.className='wardrobe-color-row';
        const label=document.createElement('label');label.textContent=PREVIEW_LABELS[part];
        const picker=document.createElement('input');picker.type='color';picker.value=palette[part]??character.experimentalVisual.materialColors?.[part]??choices[0];picker.setAttribute('aria-label',`${PREVIEW_LABELS[part]} color`);
        picker.addEventListener('change',()=>this.changePreviewColor(part,picker.value));label.append(picker);row.append(label);
        const swatches=document.createElement('div');swatches.className='wardrobe-swatches';
        for(const color of choices){
          const swatch=document.createElement('button');swatch.type='button';swatch.className='wardrobe-swatch';
          swatch.style.setProperty('--swatch-color',color);swatch.setAttribute('aria-label',`${PREVIEW_LABELS[part]} ${color}`);
          swatch.setAttribute('aria-pressed',String(palette[part]?.toLowerCase()===color));
          swatch.addEventListener('click',()=>this.changePreviewColor(part,color));swatches.append(swatch);
        }
        row.append(swatches);colors.append(row);
      }
      const reset=document.createElement('button');reset.type='button';reset.className='wardrobe-colors-reset';reset.textContent='Reset colors';
      reset.addEventListener('click',()=>this.changePreviewColor(null,null));colors.append(reset);panel.append(colors);
    }
    const status=document.createElement('p');status.className='wardrobe-status';status.setAttribute('role','status');status.textContent=error;
    const close=document.createElement('button');close.type='button';close.textContent='Close';close.addEventListener('click',()=>this.closePanel());
    panel.append(status,close);this.root.append(panel);
  }

  changePreviewColor(part,color){
    const character=characterById(this.presence.identity.characterBaseId??this.presence.identity.characterId);
    const current=this.presence.identity.previewPalette??defaultCharacterPalette(character.experimentalVisual);
    const palette=part?{...current,[part]:color}:defaultCharacterPalette(character.experimentalVisual);
    if(this.scene.applyPreviewPalette(palette))this.render();
  }

  async equip(skin){
    if(this.loading)return;this.loading=true;
    try{
      if(skin==='level3Preview'){
        const character=characterById(this.presence.identity.characterId);
        const ownsTier3=this.scene.characterItems?.items?.some(item=>item.itemId==='tier3_skin');
        if(!canPreviewCharacterSkin(character,this.presence.identity,import.meta.env?.DEV===true,ownsTier3))throw new Error('Tier 3 skin has not been unlocked.');
        selectPreviewSkin(this.presence.identity,character);
        this.scene.applyCharacterSkin(this.presence.identity.equippedSkin??this.progress?.equippedSkin);
      }else{
        this.progress=await this.client.equipSkin(skin);
        clearPreviewSkin(this.presence.identity);
        this.scene.applyCharacterSkin(skin);
      }
      this.render();
    }
    catch(error){this.render(error.message);}
    finally{this.loading=false;}
  }

  setProgress(progress){this.progress=normalizeBossProgress(progress,this.presence.identity.characterId);if(this.active)this.render();}

  closePanel(){this.root.hidden=true;this.root.replaceChildren();this.prompt.setVisible(false);}
  destroy(){this.closePanel();this.root.remove();this.prompt.destroy();for(const sprite of this.sprites)sprite.destroy();}
}
