import { BossProgressClient } from '../boss/BossProgressClient.js';
import { CHARACTER_ITEM_IDS,itemCooldownRemaining } from './characterItems.js';
import { INVENTORY_SLOT_COUNT,INVENTORY_POSITION_STORAGE_KEY,inventoryItemUseBehavior,inventoryItemsFromSources,inventoryShortcutSlot,inventorySlots,isHealthPotionShortcut } from './config.js';
import { ItemRewardOverlay } from './ItemRewardOverlay.js';
import { FloatingHotbar } from '../ui/FloatingHotbar.js';
import { fixedHudEnabled,HUD_LAYOUT } from '../hud/config.js';
import { CollectionsMenu } from '../collections/CollectionsMenu.js';
import { collectionsFromQuestProgress } from '../collections/catalog.js';
import { BackpackMenu } from './BackpackMenu.js';
import { BackpackPopup } from './BackpackPopup.js';
import { icon } from '../ui/GameMenuModal.js';
import { hasProfileSession,requireProfileSessionToken } from '../ProfileSessionClient.js';
import { createItemIconImage } from './itemPresentation.js';

const publicAsset=path=>new URL(`${import.meta.env.BASE_URL}${path}`,document.baseURI).href;

export class InventoryHotbar {
  constructor(presence,{onToggleItem=()=>{},layout=HUD_LAYOUT,scene=null,
    quickSlotActions=null,mount=null,documentRef=globalThis.document,windowRef=globalThis.window}={}){
    const document=documentRef,window=windowRef;
    this.document=document;this.window=window;this.quickSlotActions=quickSlotActions;this.actionViews=new Map();
    this.client=quickSlotActions?null:new BossProgressClient(presence);
    this.presence=presence;this.onToggleItem=onToggleItem;this.items=[];this.progress=null;this.characterItems=[];
    this.overlay=quickSlotActions?null:new ItemRewardOverlay();this.slots=[];
    this.root=document.createElement('section');this.root.className='school-hotbar inventory-hotbar';this.root.setAttribute('aria-label','Inventory');
    const header=document.createElement('div');header.className='school-hotbar-header inventory-drag-handle';
    const title=document.createElement('span');title.textContent='INVENTORY';
    const reset=document.createElement('button');reset.type='button';reset.className='hotbar-reset-position';reset.textContent='↺';
    reset.title='Reset bar position';reset.setAttribute('aria-label','Reset inventory bar position');header.append(title,reset);
    this.slotsRoot=document.createElement('div');this.slotsRoot.className='school-hotbar-slots';
    this.quickGroup=document.createElement('div');this.quickGroup.className='inventory-quick-group';this.quickGroup.setAttribute('aria-label','Quick slots 1 to 4');
    this.utilityGroup=document.createElement('div');this.utilityGroup.className='inventory-utility-group';this.utilityGroup.setAttribute('role','group');this.utilityGroup.setAttribute('aria-label','Inventory and collections');
    // Reuse the consumable bar for temporary scene actions without loading
    // persistent inventory, item rewards or backpack/collection controllers.
    if(!quickSlotActions){
      this.collections=new CollectionsMenu({scene,collections:collectionsFromQuestProgress(null,[])});
      this.backpack=new BackpackMenu({scene,onUse:item=>this.activate(item)});
      this.backpackButton=this.menuButton('Inventory','backpack',()=>this.popup.toggle());
      this.collectionsButton=this.menuButton('Collections','book',()=>void this.openCollections());
      this.utilityGroup.append(this.backpackButton,this.collectionsButton);
      this.popup=new BackpackPopup({scene,anchor:this.backpackButton,utilityGroup:this.utilityGroup,onUse:item=>this.activate(item),onExpand:id=>{
        if(this.backpack.open()&&id)this.backpack.selectItem(id);
      }});
      this.backpackButton.setAttribute('aria-expanded','false');
    }else this.utilityGroup.hidden=true;
    this.root.append(header,this.slotsRoot);
    (mount??document.getElementById('hud-inventory-mount')??document.body).append(this.root);this.render();
    if(!quickSlotActions){this.onKeyDown=event=>this.handleHotkey(event);window.addEventListener('keydown',this.onKeyDown,true);}
    this.floating=fixedHudEnabled(layout)?null:new FloatingHotbar({root:this.root,handle:header,resetButton:reset,
      storageKey:INVENTORY_POSITION_STORAGE_KEY,kind:'inventory',getSnapTargets:()=>[
        document.getElementById('emote-bar'),document.getElementById('game'),document.querySelector('.boss-dev-tools'),
      ]});
  }

  async refresh(){if(!this.client)return;try{this.setProgress(await this.client.getProgress());}catch(error){console.warn('Inventory:',error);}}
  setProgress(progress){this.progress=progress;this.refreshItems();}
  setCharacterItems(items){this.characterItems=items??[];this.refreshItems();}
  showItem(item,options){this.overlay.show(item,options);}
  menuButton(label,symbol,onClick){
    const button=document.createElement('button');button.type='button';
    button.className='inventory-menu-button';
    button.title=label;button.dataset.tooltip=label;button.setAttribute('aria-label',label);
    button.setAttribute('aria-haspopup','dialog');
    const spriteClass={backpack:'inventory-menu-sprite inventory-menu-sprite--backpack',book:'inventory-menu-sprite inventory-menu-sprite--book'}[symbol];
    if(spriteClass){
      const sprite=document.createElement('span');sprite.className=spriteClass;sprite.setAttribute('aria-hidden','true');
      sprite.style.backgroundImage=`url("${publicAsset('assets/ui/menu-icons.png')}")`;button.append(sprite);
    }else button.append(icon(document,symbol));
    button.addEventListener('click',onClick);return button;
  }
  setCollectionProgress(progress){
    this.collectionProgress=progress;this.collectionRevision=(this.collectionRevision??0)+1;
    this.collections.setCollections(collectionsFromQuestProgress(progress,this.items));
  }
  async openCollections(){
    this.popup?.close({restoreFocus:false});
    if(!this.collections.open()||!hasProfileSession(this.presence))return;
    // Refresh historical discoveries on demand in maps without the quest subscription.
    const revision=this.collectionRevision;
    try{
      const state=await this.presence.client.query(this.presence.api.npcQuests.progress,{token:requireProfileSessionToken(this.presence)});
      if(!this.destroyed&&revision===this.collectionRevision)this.setCollectionProgress(state);
    }catch(error){console.warn('Collections:',error);}
  }
  refreshItems(){
    this.items=inventoryItemsFromSources(this.progress,this.characterItems,this.presence?.identity?.characterBaseId);
    this.backpack.setItems(this.items);
    this.popup.setItems(this.items);
    this.collections.setCollections(collectionsFromQuestProgress(this.collectionProgress,this.items));this.render();
    clearTimeout(this.cooldownTimer);const next=Math.min(...this.items.filter(item=>itemCooldownRemaining(item)>0).map(item=>itemCooldownRemaining(item)),Infinity);
    if(Number.isFinite(next))this.cooldownTimer=setTimeout(()=>this.refreshItems(),Math.min(next,250));
  }
  async activate(item){
    if(item?.compatible===false)return;
    const behavior=inventoryItemUseBehavior(item);
    if(behavior==='presentation'){this.overlay.show(item);return;}
    if(behavior!=='functional'||(!item.activatable&&!item.consumable)||itemCooldownRemaining(item)>0)return;
    try{
      await this.onToggleItem(item);
    }catch(error){console.warn('Inventory activation:',error);}
  }
  handleHotkey(event){
    if(document.querySelector('[data-block-game-shortcuts]:not([hidden])'))return;
    if(event.defaultPrevented)return;
    const potionShortcut=isHealthPotionShortcut(event);
    const index=potionShortcut
      ?this.slots.findIndex(item=>item?.itemId===CHARACTER_ITEM_IDS.HEALTH_POTION)
      :inventoryShortcutSlot(event);
    if(index<0)return;
    const item=this.slots[index];if(!item||itemCooldownRemaining(item)>0)return;
    if(!potionShortcut)event.preventDefault();
    void this.activate(item);
  }
  render(){
    const document=this.document??globalThis.document;
    this.slots=this.quickSlotActions?Array(INVENTORY_SLOT_COUNT).fill(null):inventorySlots(this.items);
    if(this.quickSlotActions)for(const action of this.quickSlotActions){
      if(Number.isInteger(action.slot)&&action.slot>=1&&action.slot<=this.slots.length)
        this.slots[action.slot-1]={...action,quickSlotAction:true};
    }
    this.quickGroup.replaceChildren(...this.slots.map((item,index)=>{
      const wrapper=document.createElement('div');wrapper.className='inventory-slot-wrap';
      const usable=item?.quickSlotAction||(Boolean(inventoryItemUseBehavior(item))&&item?.compatible!==false);
      const slot=document.createElement(usable?'button':'div');slot.className='school-hotbar-slot inventory-slot';slot.dataset.slot=String(index+1);
      if(usable)slot.type='button';
      const hotkey=document.createElement('kbd');hotkey.textContent=String(index+1);slot.append(hotkey);
      if(!item){slot.classList.add('empty');slot.setAttribute('aria-label',`Empty inventory slot ${index+1}`);wrapper.append(slot);return wrapper;}
      if(item.quickSlotAction){
        const image=document.createElementNS('http://www.w3.org/2000/svg','svg');
        image.setAttribute('viewBox','0 0 24 24');image.setAttribute('aria-hidden','true');image.setAttribute('class','inventory-slot-icon');
        const path=document.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('d',item.iconPath??'M12 3 21 12 12 21 3 12Z');image.append(path);
        const status=document.createElement('span');status.className='inventory-action-status';
        slot.classList.add('inventory-action-slot');slot.disabled=true;slot.append(image,status);
        slot.onclick=()=>{if(!this.destroyed&&!this.root.hidden&&!slot.disabled)item.onUse?.();};
        this.actionViews.set(item.id,{slot,image,status,item});
        this.setQuickSlotActionState(item.id,{visible:true,enabled:false,status:'--'});
        wrapper.append(slot);return wrapper;
      }
      slot.dataset.itemId=item.itemId;
      if(!item.consumable)slot.dataset.tooltip=`${item.name}\n${item.description}`;
      slot.setAttribute('aria-label',`${item.name}. ${item.description}`);
      const image=createItemIconImage(document,item,import.meta.env.BASE_URL);slot.append(image);
      // Some supplied single-icon images have large baked-in margins. Crop their
      // display region only; preserve the original assets and other item styles.
      if(item.iconScale)image.style.transform=`scale(${item.iconScale})`;
      if(item.iconClip)image.style.clipPath=item.iconClip;
      let consumableActions;
      if(item.activatable||item.consumable){
        const remaining=itemCooldownRemaining(item);slot.disabled=remaining>0||item.compatible===false;
        slot.classList.toggle('active',Boolean(item.active));
        if(!item.consumable)slot.dataset.tooltip=`${item.name}\n${item.compatible===false?'Unavailable for this character.':remaining>0?`Cooldown: ${Math.ceil(remaining/1000)}s`:item.active?'Click to deactivate.':'Click to activate.'}`;
      }
      if(item.consumable){
        consumableActions=document.createElement('div');consumableActions.className='inventory-consumable-actions';
        const description=document.createElement('p');description.textContent=`${item.name}\n${item.description}`;
        const examine=document.createElement('button');examine.type='button';examine.textContent='Examine item';
        examine.addEventListener('click',event=>{event.stopPropagation();this.overlay.show(item,{eyebrow:'ITEM PREVIEW'});});
        consumableActions.append(description,examine);
      }
      if(usable)slot.addEventListener('click',()=>void this.activate(item));
      if(item.quantity>1){const quantity=document.createElement('span');quantity.className='inventory-quantity';quantity.textContent=String(item.quantity);slot.append(quantity);}
      wrapper.append(slot);if(consumableActions)wrapper.append(consumableActions);return wrapper;
    }));
    this.slotsRoot.replaceChildren(this.quickGroup,this.utilityGroup);
  }
  setQuickSlotActionState(id,{visible=true,enabled=false,status=''}){
    const view=this.actionViews.get(id);if(!view||this.destroyed)return;
    const {slot,image,item}=view;slot.disabled=!visible||!enabled;
    slot.classList.toggle('empty',!visible);slot.classList.toggle('active',visible&&enabled);
    image.style.display=visible?'':'none';view.status.hidden=!visible;view.status.textContent=visible?status:'';
    slot.dataset.tooltip=visible?`${item.label} (${item.slot})\n${status}`:`Empty inventory slot ${item.slot}`;
    slot.setAttribute('aria-label',slot.dataset.tooltip);
  }
  destroy(){
    if(this.destroyed)return;this.destroyed=true;clearTimeout(this.cooldownTimer);
    if(this.onKeyDown)this.window.removeEventListener('keydown',this.onKeyDown,true);
    for(const {slot} of this.actionViews.values())slot.onclick=null;
    this.actionViews.clear();this.floating?.destroy();this.popup?.destroy();this.backpack?.destroy();this.collections?.destroy();this.overlay?.destroy();this.root.remove();
  }
}
