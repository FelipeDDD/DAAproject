import { BossProgressClient } from '../boss/BossProgressClient.js';
import { itemCooldownRemaining } from './characterItems.js';
import { INVENTORY_POSITION_STORAGE_KEY,inventoryItemUseBehavior,inventoryItemsFromSources,inventoryShortcutSlot,inventorySlots } from './config.js';
import { ItemRewardOverlay } from './ItemRewardOverlay.js';
import { FloatingHotbar } from '../ui/FloatingHotbar.js';
import { fixedHudEnabled,HUD_LAYOUT } from '../hud/config.js';

const publicAsset=path=>new URL(`${import.meta.env.BASE_URL}${path}`,document.baseURI).href;

export class InventoryHotbar {
  constructor(presence,{onToggleItem=()=>{},layout=HUD_LAYOUT}={}){
    this.client=new BossProgressClient(presence);
    this.presence=presence;this.onToggleItem=onToggleItem;this.items=[];this.progress=null;this.characterItems=[];
    this.overlay=new ItemRewardOverlay();this.slots=[];
    this.root=document.createElement('section');this.root.className='school-hotbar inventory-hotbar';this.root.setAttribute('aria-label','Inventory');
    const header=document.createElement('div');header.className='school-hotbar-header inventory-drag-handle';
    const title=document.createElement('span');title.textContent='INVENTORY';
    const reset=document.createElement('button');reset.type='button';reset.className='hotbar-reset-position';reset.textContent='↺';
    reset.title='Reset bar position';reset.setAttribute('aria-label','Reset inventory bar position');header.append(title,reset);
    this.slotsRoot=document.createElement('div');this.slotsRoot.className='school-hotbar-slots';
    this.root.append(header,this.slotsRoot);
    (document.getElementById('hud-inventory-mount')??document.body).append(this.root);this.render();
    this.onKeyDown=event=>this.handleHotkey(event);window.addEventListener('keydown',this.onKeyDown);
    this.floating=fixedHudEnabled(layout)?null:new FloatingHotbar({root:this.root,handle:header,resetButton:reset,
      storageKey:INVENTORY_POSITION_STORAGE_KEY,kind:'inventory',getSnapTargets:()=>[
        document.getElementById('emote-bar'),document.getElementById('game'),document.querySelector('.boss-dev-tools'),
      ]});
  }

  async refresh(){try{this.setProgress(await this.client.getProgress());}catch(error){console.warn('Inventory:',error);}}
  setProgress(progress){this.progress=progress;this.refreshItems();}
  setCharacterItems(items){this.characterItems=items??[];this.refreshItems();}
  refreshItems(){
    this.items=inventoryItemsFromSources(this.progress,this.characterItems,this.presence?.identity?.characterId);this.render();
    clearTimeout(this.cooldownTimer);const next=Math.min(...this.items.filter(item=>itemCooldownRemaining(item)>0).map(item=>itemCooldownRemaining(item)),Infinity);
    if(Number.isFinite(next))this.cooldownTimer=setTimeout(()=>this.refreshItems(),Math.min(next,250));
  }
  async activate(item){
    if(item?.compatible===false)return;
    const behavior=inventoryItemUseBehavior(item);
    if(behavior==='presentation'){this.overlay.show(item);return;}
    if(behavior!=='functional'||!item.activatable||itemCooldownRemaining(item)>0)return;
    try{await this.onToggleItem(item);}catch(error){console.warn('Inventory activation:',error);}
  }
  handleHotkey(event){
    if(event.defaultPrevented)return;
    const index=inventoryShortcutSlot(event);if(index<0)return;
    const item=this.slots[index];if(!item||itemCooldownRemaining(item)>0)return;
    event.preventDefault();void this.activate(item);
  }
  render(){
    this.slots=inventorySlots(this.items);
    this.slotsRoot.replaceChildren(...this.slots.map((item,index)=>{
      const usable=Boolean(inventoryItemUseBehavior(item))&&item?.compatible!==false;
      const slot=document.createElement(usable?'button':'div');slot.className='school-hotbar-slot inventory-slot';slot.dataset.slot=String(index+1);
      if(slot instanceof HTMLButtonElement)slot.type='button';
      const hotkey=document.createElement('kbd');hotkey.textContent=`⇧${index+1}`;slot.append(hotkey);
      if(!item){slot.classList.add('empty');slot.setAttribute('aria-label',`Empty inventory slot ${index+1}`);return slot;}
      slot.dataset.itemId=item.itemId;slot.dataset.tooltip=`${item.name}\n${item.description}`;
      slot.setAttribute('aria-label',`${item.name}. ${item.description}`);
      const image=document.createElement('img');image.src=publicAsset(item.icon);image.alt='';slot.append(image);
      if(item.activatable){
        const remaining=itemCooldownRemaining(item);slot.disabled=remaining>0||item.compatible===false;
        slot.classList.toggle('active',Boolean(item.active));
        slot.dataset.tooltip=`${item.name}\n${item.compatible===false?'Available while playing Michael.':remaining>0?`Cooldown: ${Math.ceil(remaining/1000)}s`:item.active?'Click to deactivate.':'Click to activate.'}`;
      }
      if(usable)slot.addEventListener('click',()=>void this.activate(item));
      if(item.quantity>1){const quantity=document.createElement('span');quantity.className='inventory-quantity';quantity.textContent=String(item.quantity);slot.append(quantity);}
      return slot;
    }));
  }
  destroy(){clearTimeout(this.cooldownTimer);window.removeEventListener('keydown',this.onKeyDown);this.floating?.destroy();this.overlay.destroy();this.root.remove();}
}
