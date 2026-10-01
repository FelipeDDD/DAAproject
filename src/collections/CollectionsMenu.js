import { createPreviewCollections } from './catalog.js';
import { GameMenuModal,node,icon } from '../ui/GameMenuModal.js';

export class CollectionsMenu extends GameMenuModal {
  constructor(options={}){
    super(options);this.collections=options.collections??createPreviewCollections();
  }

  setCollections(collections){
    this.collections=Array.isArray(collections)?collections:[];
    if(this.active){
      const collection=this.collections.find(entry=>entry.id===this.collectionId);
      if(collection)this.showCollection(collection.id,false);else this.showOverview(false);
      (this.itemButtons?.get(this.selectedId)??this.closeButton).focus({preventScroll:true});
    }
  }

  showOverview(focus=true){
    this.collectionId=null;this.selectedId=null;this.back.hidden=true;this.panel.dataset.view='overview';
    const intro=node(this.doc,'div','collections-intro');
    intro.append(node(this.doc,'h3','','Treasures of the everyday strange.'),node(this.doc,'p','','Browse the things worth keeping.'));
    const grid=node(this.doc,'div','collections-directory');
    for(const collection of this.collections){
      const button=this.button('','collection-entry',()=>this.showCollection(collection.id));
      const emblem=node(this.doc,'span','collection-emblem');emblem.append(icon(this.doc,collection.icon));
      const copy=node(this.doc,'span','collection-entry-copy');
      copy.append(node(this.doc,'strong','',collection.name),node(this.doc,'span','',collection.description),
        node(this.doc,'small','',collection.comingSoon?'COMING SOON':'EXPLORE COLLECTION'));
      button.append(emblem,copy,node(this.doc,'span','collection-entry-arrow','›'));grid.append(button);
    }
    if(!this.collections.length)grid.append(node(this.doc,'p','collections-empty','No collections yet.'));
    this.body.replaceChildren(intro,grid);
    if(focus)this.body.querySelector('button')?.focus();
  }

  showCollection(id,focus=true){
    const collection=this.collections.find(entry=>entry.id===id);if(!collection)return;
    const previous=this.collectionId===id?this.selectedId:null;
    this.collectionId=id;this.back.hidden=false;this.panel.dataset.view='detail';
    const intro=node(this.doc,'div','collections-detail-heading');
    const emblem=node(this.doc,'span','collection-small-emblem');emblem.append(icon(this.doc,collection.icon));
    const copy=node(this.doc,'div','');copy.append(node(this.doc,'h3','',collection.name),node(this.doc,'p','',collection.description));
    intro.append(emblem,copy);
    if(collection.comingSoon||!collection.items?.length){
      this.selectedId=null;
      const empty=node(this.doc,'div','collections-empty');empty.append(icon(this.doc,collection.icon),
        node(this.doc,'h3','',collection.comingSoon?'Coming soon':'No items yet'),
        node(this.doc,'p','','There is room here for more curious discoveries.'));
      this.body.replaceChildren(intro,empty);if(focus)this.back.focus();return;
    }
    const layout=node(this.doc,'div','collections-detail');
    const grid=node(this.doc,'div','collection-item-grid');grid.setAttribute('aria-label',`${collection.name} items`);
    this.itemButtons=new Map();
    for(const item of collection.items){
      const button=this.button('','collection-item',()=>{
        this.selectItem(item.id);
        if(this.win?.matchMedia?.('(max-width:490px)').matches)this.preview.scrollIntoView({block:'nearest'});
      });
      button.dataset.rarity=item.rarity??'normal';button.dataset.unlocked=String(Boolean(item.unlocked));
      button.setAttribute('aria-pressed','false');button.setAttribute('aria-label',`${item.name}${item.unlocked?'':', locked'}${item.rarity==='rare'?', rare':''}`);
      const art=node(this.doc,'span','collection-item-art');this.renderArt(art,item);
      button.append(art,node(this.doc,'span','collection-item-name',item.name),
        node(this.doc,'small','collection-item-status',item.rarity==='rare'?'✧ RARE DISCOVERY':item.unlocked?'COLLECTED':'NOT DISCOVERED'));
      grid.append(button);this.itemButtons.set(item.id,button);
    }
    this.preview=node(this.doc,'aside','collection-preview');this.preview.setAttribute('aria-label','Selected item');
    layout.append(grid,this.preview);this.body.replaceChildren(intro,layout);
    const initial=collection.items.find(item=>item.id===previous)??collection.items.find(item=>item.unlocked)??collection.items[0];
    this.selectItem(initial.id);if(focus)this.itemButtons.get(initial.id).focus();
  }

  renderArt(target,item){
    if(!item.unlocked){
      target.append(node(this.doc,'span','collection-mystery',item.rarity==='rare'?'✧':'?'));return;
    }
    const image=node(this.doc,'img','collection-image');image.alt='';image.loading='lazy';image.decoding='async';
    if(item.imageClip)image.style.clipPath=item.imageClip;
    const unavailable=()=>target.replaceChildren(node(this.doc,'span','collection-art-missing','Image unavailable'));
    image.addEventListener('error',unavailable,{once:true});target.append(image);
    if(item.image||item.icon)image.src=new URL(`${this.baseUrl}${item.image??item.icon}`,this.doc.baseURI).href;
    else unavailable();
  }

  selectItem(id){
    const item=this.collections.find(entry=>entry.id===this.collectionId)?.items?.find(entry=>entry.id===id);if(!item)return;
    this.selectedId=id;
    for(const [key,button]of this.itemButtons)button.setAttribute('aria-pressed',String(key===id));
    this.preview.dataset.rarity=item.rarity??'normal';
    const art=node(this.doc,'div','collection-preview-art');this.renderArt(art,item);
    const label=node(this.doc,'span','collection-preview-label',item.unlocked?(item.edition??'Collected curiosity'):'NOT DISCOVERED');
    const title=node(this.doc,'h3','collection-preview-title',item.name);title.setAttribute('aria-live','polite');
    const divider=node(this.doc,'div','collection-divider','✧');divider.setAttribute('aria-hidden','true');
    const description=node(this.doc,'p','collection-preview-description',item.description);
    this.preview.replaceChildren(label,art,title,divider,description);
  }

}
