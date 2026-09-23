import Phaser from 'phaser';
import { CHARACTER_ITEM_IDS,characterItemDefinition,normalizeCharacterItem } from './characterItems.js';
import { CharacterItemClient } from './CharacterItemClient.js';

export const LUNG_CRUSHER_PICKUP_OFFSET=Object.freeze({x:128,y:0});
const LUNG_CRUSHER_PICKUP_ENABLED=false;
const PICKUP_DISTANCE=34;
const TRANSFORM_ANIMATION='michael-lung-crusher-transform-v3';
const TRANSFORMATION_DISPLAY_SIZE=67;

export class CharacterItemController {
  constructor(scene,presence,{onVisualChange=()=>{},onItemsChange=()=>{}}={}){
    Object.assign(this,{scene,presence,onVisualChange,onItemsChange,client:new CharacterItemClient(presence),items:[]});
  }
  get characterId(){return this.presence?.identity?.characterId;}
  get lungCrusher(){return this.items.find(item=>item.itemId===CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000);}
  async restore(){
    const revision=this.revision??0;
    try{const rows=await this.client.getItems();if(!this.destroyed&&revision===(this.revision??0))this.setItems(rows);}
    catch(error){console.warn('Character items:',error);}
  }
  setItems(rows,{applyVisual=true}={}){
    if(this.destroyed)return;
    this.revision=(this.revision??0)+1;
    this.items=(rows??[]).map(row=>normalizeCharacterItem(row,this.characterId)).filter(Boolean);this.onItemsChange(this.items);
    const item=this.lungCrusher;if(applyVisual)this.onVisualChange(item?.active?item.itemId:null,{instant:true});
    if(this.pickup)this.pickup.setVisible(LUNG_CRUSHER_PICKUP_ENABLED&&this.characterId==='michael'&&!item);
  }
  createPickup(transition){
    if(!LUNG_CRUSHER_PICKUP_ENABLED||this.scene.mapKey!=='school'||!transition)return;
    const x=transition.x+LUNG_CRUSHER_PICKUP_OFFSET.x,y=transition.y+LUNG_CRUSHER_PICKUP_OFFSET.y;
    this.pickup=this.scene.add.sprite(x,y,'michael-lung-transform',6).setOrigin(.5,1).setDisplaySize(50,50).setDepth(y+1);
    this.pickup.setVisible(this.characterId==='michael'&&!this.lungCrusher);
    this.pickupPosition={x,y};
  }
  updatePrompt(){
    if(!LUNG_CRUSHER_PICKUP_ENABLED||!this.pickup?.visible||this.characterId!=='michael')return false;
    return Phaser.Math.Distance.Between(this.scene.player.body.center.x,this.scene.player.body.center.y,this.pickupPosition.x,this.pickupPosition.y)<=PICKUP_DISTANCE;
  }
  async collect(){
    if(!this.updatePrompt()||this.collecting)return false;this.collecting=true;
    const before=this.items;
    const optimistic={...characterItemDefinition(CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000),characterId:this.characterId,active:false,cooldownUntil:0};
    this.setItems([...before,optimistic]);this.pickup?.setVisible(false);
    try{
      const result=await this.client.claim(CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000);
      if(this.destroyed)return true;
      const item=normalizeCharacterItem(result.item,this.characterId);this.setItems([...this.items.filter(row=>row.itemId!==item.itemId),item]);
      this.pickup?.destroy();this.pickup=null;return true;
    }catch(error){
      if(this.destroyed)return false;
      this.setItems(before);this.pickup?.setVisible(true);
      this.scene.hint.textContent=`Could not save Lung Crusher 3000: ${error.message}`;
      console.warn('Character item pickup:',error);return false;
    }finally{this.collecting=false;}
  }
  async applyActiveItem(item){
    const normalized=normalizeCharacterItem(item,this.characterId);if(!normalized)return;
    if(normalized.active&&!this.previousSkin)this.previousSkin=this.scene.equippedSkin;
    this.setItems([...this.items.filter(existing=>existing.itemId!==normalized.itemId),normalized],{applyVisual:false});
    if(normalized.active){
      await this.playTransformation();if(!this.destroyed)this.onVisualChange(normalized.itemId,{instant:false});
    }else{
      this.onVisualChange(null,{instant:true,restoreSkin:this.previousSkin});this.previousSkin=null;
    }
  }
  async toggle(item){
    if(this.toggling||this.transforming)return false;
    this.toggling=true;
    try{
      const result=await this.client.setActive(item.itemId,!item.active);
      if(this.destroyed)return false;
      await this.applyActiveItem(result);return true;
    }catch(error){
      this.scene.hint.textContent=`Could not change ${item.name}: ${error.message}`;
      throw error;
    }finally{this.toggling=false;}
  }
  playTransformation(){
    if(this.transforming)return this.transforming;
    if(!this.scene.anims.exists(TRANSFORM_ANIMATION))this.scene.anims.create({
      // Six complete body frames; frame 6 is the standalone pickup.
      key:TRANSFORM_ANIMATION,frames:this.scene.anims.generateFrameNumbers('michael-lung-transform',{start:0,end:5}),frameRate:4,repeat:0,
    });
    this.transforming=new Promise(resolve=>{
      const player=this.scene.player;player.setVelocity(0,0);player.setVisible(false);
      const sprite=this.scene.add.sprite(player.x,player.y,'michael-lung-transform',0).setOrigin(.5,1)
        .setDisplaySize(TRANSFORMATION_DISPLAY_SIZE,TRANSFORMATION_DISPLAY_SIZE).setDepth(player.y+2);
      this.finishTransformation=()=>{sprite.destroy();player.setVisible(true);this.transforming=null;this.finishTransformation=null;resolve();};
      sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE,()=>this.finishTransformation?.());sprite.play(TRANSFORM_ANIMATION);
    });return this.transforming;
  }
  destroy(){this.destroyed=true;this.finishTransformation?.();this.pickup?.destroy();}
}
