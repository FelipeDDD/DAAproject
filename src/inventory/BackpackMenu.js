import { GameMenuModal,node } from '../ui/GameMenuModal.js';
import { inventoryItemUseBehavior,inventoryPresentationAsset,normalizeInventoryItems } from './config.js';
import { itemCooldownRemaining } from './characterItems.js';
import { ItemRewardOverlay } from './ItemRewardOverlay.js';
import { createItemIconImage,createItemPresentationImage } from './itemPresentation.js';

// Owns only selection/presentation. Item actions still use the existing controller.
export class BackpackMenu extends GameMenuModal {
  constructor({items=[],onUse=()=>{},...options}={}){
    super({...options,title:'Inventory',eyebrow:'YOUR BACKPACK',footerText:'Quick items: 1–4 · Potion: 0'});
    Object.assign(this,{items:normalizeInventoryItems(items),onUse});
    this.inspection=new ItemRewardOverlay({documentRef:this.doc,baseUrl:this.baseUrl});
    this.panel.className+=' backpack-panel';
  }
  setItems(items){
    this.items=normalizeInventoryItems(items);
    if(this.active&&!this.inspection.active){
      const focused=this.doc.activeElement;
      const selected=this.selectedId;
      this.showOverview(false);
      if(focused?.dataset?.action==='use')this.useButton?.focus();
      else if(focused?.dataset?.action==='inspect')this.inspectButton?.focus();
      else (this.itemButtons.get(selected)??this.closeButton).focus();
    }
  }
  showOverview(){
    this.footerHint.textContent='Esc to close';
    this.back.hidden=true;this.panel.dataset.view='backpack';
    const layout=node(this.doc,'div','collections-detail backpack-detail');
    const grid=node(this.doc,'div','backpack-grid');grid.setAttribute('aria-label','Owned inventory items');
    this.itemButtons=new Map();
    for(const item of this.items){
      const button=this.button('','backpack-slot',()=>{
        this.selectItem(item.itemId);
        if(this.win?.matchMedia?.('(max-width:490px)').matches)this.preview.scrollIntoView({block:'nearest'});
      });
      button.dataset.itemId=item.itemId;button.setAttribute('aria-pressed','false');
      button.setAttribute('aria-label',`${item.name}, quantity ${item.quantity}`);
      const art=node(this.doc,'span','backpack-slot-art');this.renderItemIcon(art,item);
      button.append(art,node(this.doc,'span','backpack-slot-name',item.name));
      if(item.quantity>1)button.append(node(this.doc,'span','backpack-quantity',String(item.quantity)));
      if(item.active)button.append(node(this.doc,'small','backpack-equipped','EQUIPPED'));
      grid.append(button);this.itemButtons.set(item.itemId,button);
    }
    // Empty visual cells are not inventory capacity or saved slot assignments.
    const cellCount=Math.max(12,Math.ceil((this.items.length+1)/4)*4);
    for(let i=this.items.length;i<cellCount;i++){
      const empty=node(this.doc,'div','backpack-slot backpack-slot-empty');empty.setAttribute('aria-label','Empty inventory space');grid.append(empty);
    }
    this.preview=node(this.doc,'aside','collection-preview backpack-preview');layout.append(grid,this.preview);
    this.body.replaceChildren(layout);
    const selected=this.items.find(item=>item.itemId===this.selectedId)??this.items[0];
    if(selected)this.selectItem(selected.itemId);
    else{this.selectedId=null;this.preview.append(node(this.doc,'h3','collection-preview-title','Your backpack is empty'),node(this.doc,'p','collection-preview-description','Items you collect will appear here.'));}
  }
  renderImage(target,path,clip,scale){
    if(!path)return;
    const image=node(this.doc,'img','collection-image');image.alt='';image.loading='lazy';image.decoding='async';
    if(clip)image.style.clipPath=clip;if(scale)image.style.transform=`scale(${scale})`;
    image.addEventListener('error',()=>target.replaceChildren(node(this.doc,'span','collection-art-missing','Image unavailable')),{once:true});
    image.src=new URL(`${this.baseUrl}${path}`,this.doc.baseURI).href;target.append(image);
  }
  renderItemIcon(target,item){
    if(!item.iconFrame){BackpackMenu.prototype.renderImage.call(this,target,item.icon,item.iconClip,item.iconScale);return;}
    const image=createItemIconImage(this.doc,item,this.baseUrl);image.setAttribute('class','collection-image');target.append(image);
  }
  selectItem(id){
    const item=this.items.find(entry=>entry.itemId===id);if(!item)return;
    this.selectedId=id;for(const [key,button]of this.itemButtons)button.setAttribute('aria-pressed',String(key===id));
    const art=node(this.doc,'div','collection-preview-art');
    if(item.presentationFrame){
      const image=createItemPresentationImage(this.doc,item,this.baseUrl);
      image.setAttribute('class','collection-image');art.append(image);
    }else this.renderImage(art,inventoryPresentationAsset(item));
    const title=node(this.doc,'h3','collection-preview-title',item.name);title.setAttribute('aria-live','polite');
    const description=node(this.doc,'p','collection-preview-description',item.description);
    const metadata=node(this.doc,'p','backpack-metadata',`${item.type.replaceAll('_',' ')} · Quantity: ${item.quantity}${item.active?' · Equipped':''}`);
    const actions=node(this.doc,'div','backpack-actions');this.useButton=null;this.inspectButton=null;
    if(inventoryItemUseBehavior(item)==='functional'){
      const remaining=itemCooldownRemaining(item);
      this.useButton=this.button(item.compatible===false?'Unavailable for this class':remaining>0?`Cooldown: ${Math.ceil(remaining/1000)}s`:item.consumable?'Use item':item.active?'Unequip':'Equip','backpack-action',()=>void this.useSelected());
      this.useButton.dataset.action='use';this.useButton.disabled=item.compatible===false||remaining>0||this.using;
      actions.append(this.useButton);
    }
    if(inventoryPresentationAsset(item)){
      this.inspectButton=this.button('Examine item','backpack-action backpack-action-secondary',()=>{
        this.inspectItem(item);
      });
      this.inspectButton.dataset.action='inspect';actions.append(this.inspectButton);
    }
    this.preview.replaceChildren(art,title,metadata,description,actions);
  }
  inspectItem(item){
    this.footerHint.textContent='Esc to return';
    this.panel.dataset.view='inspection';this.body.replaceChildren();
    this.inspection.show(item,{source:'inventory',eyebrow:'ITEM INSPECTION',mount:this.body,onReturn:()=>{
      if(!this.active||this.destroyed)return;
      this.showOverview();(this.inspectButton??this.closeButton).focus({preventScroll:true});
    }});
  }
  requestClose(){if(this.inspection.active)this.inspection.dismiss();else super.requestClose();}
  handleBackdrop(){if(!this.inspection.active)super.handleBackdrop();}
  close(options){this.inspection.close(true);super.close(options);}
  destroy(){super.destroy();this.inspection.destroy();}
  async useSelected(){
    const item=this.items.find(entry=>entry.itemId===this.selectedId);
    if(this.using||!item||item.compatible===false||itemCooldownRemaining(item)>0)return;
    this.using=true;this.selectItem(item.itemId);
    try{await this.onUse(item);}finally{this.using=false;if(this.active)this.selectItem(this.selectedId);}
  }
}
