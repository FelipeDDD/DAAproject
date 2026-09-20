import { BossProgressClient } from '../boss/BossProgressClient.js';
import { INVENTORY_POSITION_STORAGE_KEY,inventoryItemsFromBossProgress,inventorySlots } from './config.js';
import { FloatingHotbar } from '../ui/FloatingHotbar.js';

const publicAsset=path=>new URL(`${import.meta.env.BASE_URL}${path}`,document.baseURI).href;

export class InventoryHotbar {
  constructor(presence){
    this.client=new BossProgressClient(presence);this.items=[];
    this.root=document.createElement('section');this.root.className='school-hotbar inventory-hotbar';this.root.setAttribute('aria-label','Inventory');
    const header=document.createElement('div');header.className='school-hotbar-header inventory-drag-handle';
    const title=document.createElement('span');title.textContent='INVENTORY';
    const reset=document.createElement('button');reset.type='button';reset.className='hotbar-reset-position';reset.textContent='↺';
    reset.title='Reset bar position';reset.setAttribute('aria-label','Reset inventory bar position');header.append(title,reset);
    this.slotsRoot=document.createElement('div');this.slotsRoot.className='school-hotbar-slots';
    this.root.append(header,this.slotsRoot);document.body.append(this.root);this.render();
    this.floating=new FloatingHotbar({root:this.root,handle:header,resetButton:reset,
      storageKey:INVENTORY_POSITION_STORAGE_KEY,kind:'inventory',getSnapTargets:()=>[
        document.getElementById('emote-bar'),document.getElementById('game'),document.querySelector('.boss-dev-tools'),
      ]});
  }

  async refresh(){try{this.setProgress(await this.client.getProgress());}catch(error){console.warn('Inventory:',error);}}
  setProgress(progress){this.items=inventoryItemsFromBossProgress(progress);this.render();}
  render(){
    this.slotsRoot.replaceChildren(...inventorySlots(this.items).map((item,index)=>{
      const slot=document.createElement('div');slot.className='school-hotbar-slot inventory-slot';slot.dataset.slot=String(index+1);
      const hotkey=document.createElement('kbd');hotkey.textContent=String(index+1);slot.append(hotkey);
      if(!item){slot.classList.add('empty');slot.setAttribute('aria-label',`Empty inventory slot ${index+1}`);return slot;}
      slot.dataset.itemId=item.itemId;slot.dataset.tooltip=`${item.name}\n${item.description}`;
      slot.setAttribute('aria-label',`${item.name}. ${item.description}`);
      const image=document.createElement('img');image.src=publicAsset(item.icon);image.alt='';slot.append(image);
      if(item.quantity>1){const quantity=document.createElement('span');quantity.className='inventory-quantity';quantity.textContent=String(item.quantity);slot.append(quantity);}
      return slot;
    }));
  }
  destroy(){this.floating?.destroy();this.root.remove();}
}
