import { GameMenuModal,node } from '../ui/GameMenuModal.js';
import { BackpackMenu } from './BackpackMenu.js';
import { inventoryItemUseBehavior,normalizeInventoryItems } from './config.js';
import { itemCooldownRemaining } from './characterItems.js';
import { ItemRewardOverlay } from './ItemRewardOverlay.js';

// A non-modal dialog anchored to the HUD, sharing the full menu's input lifecycle.
export class BackpackPopup extends GameMenuModal {
  constructor({anchor,utilityGroup=null,items=[],onUse=()=>{},onExpand=()=>{},...options}={}){
    super({...options,modal:false,title:'Inventory',eyebrow:'QUICK BACKPACK',footerText:''});
    Object.assign(this,{anchor,utilityGroup,items:normalizeInventoryItems(items),onUse,onExpand});
    this.inspection=new ItemRewardOverlay({documentRef:this.doc,baseUrl:this.baseUrl});
    this.root.className='backpack-popup';this.panel.className='backpack-popup-panel';
    this.header.className='backpack-popup-header';this.body.className='backpack-popup-body';
    this.panel.children[this.panel.children.length-1].hidden=true;
    this.onOutside=event=>{
      if(!this.active||this.root.contains(event.target)||this.utilityGroup?.contains(event.target)||this.anchor?.contains(event.target))return;
      event.preventDefault();event.stopImmediatePropagation();this.requestClose();
    };
    this.onResize=()=>{if(this.active)this.position();};
    this.win?.addEventListener('pointerdown',this.onOutside,true);
    this.win?.addEventListener('resize',this.onResize);this.win?.addEventListener('scroll',this.onResize,true);
  }
  toggle(){if(this.active){this.close();return false;}return this.open();}
  open(){
    if(!super.open())return false;
    this.anchor?.setAttribute('aria-expanded','true');this.position();return true;
  }
  position(){
    const anchor=this.anchor?.getBoundingClientRect();if(!anchor)return;
    const rect=this.root.getBoundingClientRect(),gap=10;
    this.root.style.left=`${Math.max(8,Math.min(anchor.x+anchor.width/2-rect.width/2,this.win.innerWidth-rect.width-8))}px`;
    this.root.style.top=`${Math.max(8,anchor.top-rect.height-gap)}px`;
  }
  setItems(items){
    this.items=normalizeInventoryItems(items);
    if(this.active&&!this.inspection.active){
      const id=this.doc.activeElement?.dataset?.itemId;
      const expandFocused=this.doc.activeElement===this.expandButton;
      this.showOverview();this.position();
      (expandFocused?this.expandButton:this.itemButtons.get(id)??this.closeButton).focus({preventScroll:true});
    }
  }
  showOverview(){
    this.root.dataset.view='overview';
    this.back.hidden=true;this.itemButtons=new Map();
    const grid=node(this.doc,'div','backpack-popup-grid');grid.setAttribute('aria-label','Quick inventory preview');
    for(const item of this.items.slice(0,8)){
      const button=this.button('','backpack-popup-item',()=>this.inspectItem(item));
      button.dataset.itemId=item.itemId;
      button.title=`Examine ${item.name}`;
      button.setAttribute('aria-label',button.title);
      const art=node(this.doc,'span','backpack-slot-art');
      BackpackMenu.prototype.renderItemIcon.call(this,art,item);
      button.append(art);if(item.quantity>1)button.append(node(this.doc,'span','backpack-quantity',String(item.quantity)));
      grid.append(button);this.itemButtons.set(item.itemId,button);
    }
    if(!this.items.length)grid.append(node(this.doc,'p','backpack-popup-empty','Your backpack is empty.'));
    const summary=node(this.doc,'small','backpack-popup-summary',this.items.length>8?`${this.items.length-8} more items in Backpack`:'Select an item to examine it');
    this.expandButton=this.button('Open Backpack','backpack-action backpack-popup-expand',()=>this.expand());
    this.body.replaceChildren(grid,summary,this.expandButton);
  }
  inspectItem(item){
    if(!this.active||!this.items.some(entry=>entry.itemId===item.itemId))return;
    this.selectedId=item.itemId;this.root.dataset.view='inspection';
    this.body.replaceChildren();
    this.inspection.show(item,{source:'inventory',eyebrow:'ITEM INSPECTION',mount:this.body,onReturn:()=>{
      if(!this.active||this.destroyed)return;
      this.showOverview();this.position();
      (this.itemButtons.get(item.itemId)??this.closeButton).focus({preventScroll:true});
    }});
    if(inventoryItemUseBehavior(item)==='functional'){
      const remaining=itemCooldownRemaining(item);
      const use=this.button(item.consumable?'Use item':item.active?'Unequip':'Equip','backpack-action',()=>{
        this.inspection.dismiss();void this.useItem(item);
      });
      use.disabled=item.compatible===false||remaining>0||this.using;
      this.inspection.root.children[0].append(use);
    }
    this.position();
  }
  async useItem(item){
    if(this.using||item.compatible===false||itemCooldownRemaining(item)>0)return;
    this.using=true;this.showOverview();
    try{await this.onUse(item);}finally{this.using=false;if(this.active){this.showOverview();this.itemButtons.get(item.itemId)?.focus({preventScroll:true});}}
  }
  expand(itemId){this.close({restoreFocus:false});this.onExpand(itemId);}
  requestClose(){if(this.inspection.active)this.inspection.dismiss();else super.requestClose();}
  close(options){this.inspection.close(true);super.close(options);this.anchor?.setAttribute('aria-expanded','false');}
  destroy(){
    super.destroy();this.inspection.destroy();this.win?.removeEventListener('pointerdown',this.onOutside,true);
    this.win?.removeEventListener('resize',this.onResize);this.win?.removeEventListener('scroll',this.onResize,true);
  }
}
