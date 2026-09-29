import { MapScene } from './MapScene.js';
import Phaser from 'phaser';
import { KoettingNpc } from '../npc/KoettingNpc.js';
import { CHARACTER_ITEMS, CHARACTER_ITEM_IDS } from '../inventory/characterItems.js';

export class SecretPathScene extends MapScene {
  constructor(){super('secret-path','secret-path.tmj');}

  preload(){
    super.preload();
    if(!this.textures.exists('secret-path-koetting'))this.load.image('secret-path-koetting',
      `${import.meta.env.BASE_URL}assets/npc/koetting-brille.png`);
    for(const [baseId,path] of Object.entries(CHARACTER_ITEMS[CHARACTER_ITEM_IDS.HEALTH_POTION].iconsByCharacterBaseId)){
      const key=`secret-path-potion-${baseId}`;
      if(!this.textures.exists(key))this.load.image(key,`${import.meta.env.BASE_URL}${path}`);
    }
  }

  create(destination={}){
    super.create(destination);
    this.koettingNpc=new KoettingNpc(this);
    this.puzzleTerminal=this.koettingNpc;
    this.events.on('sleep',()=>{
      this.koettingNpc?.close();
      this.koettingNpc?.updatePrompt(false);
    });
    this.events.once('shutdown',()=>{
      this.koettingNpc?.destroy();this.koettingNpc=null;this.puzzleTerminal=null;
    });
  }

  update(time,delta){
    const npc=this.koettingNpc;
    const available=Boolean(npc&&!npc.active&&!this.terminal?.active&&!this.chat?.isInputActive&&
      !this.quiz?.seated&&!this.soloStudy?.active&&!this.wardrobe?.active&&
      !this.characterItems?.transforming);
    const nearGift=available&&npc.nearGift(),nearNpc=available&&npc.nearNpc();
    if((nearGift||nearNpc)&&Phaser.Input.Keyboard.JustDown(this.interactKey)){
      if(nearGift)void npc.collectGift();
      else npc.open();
    }
    super.update(time,delta);
    npc?.updatePrompt(available);
    if(nearGift||nearNpc)this.hint.hidden=true;
  }
}
