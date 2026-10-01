const element=(doc,tag,className,text)=>{
  const node=doc.createElement(tag);node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
};

// The host delegates keyboard events here while active. No backend or preloading.
export class PhotoAlbumViewer {
  constructor({mount,documentRef=globalThis.document,baseUrl='/',onClose=()=>{}}={}){
    this.doc=documentRef;this.baseUrl=baseUrl;this.onClose=onClose;this.active=false;
    this.root=element(this.doc,'div','photo-album-overlay');this.root.hidden=true;
    this.root.dataset.blockGameShortcuts='';
    this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');
    this.panel=element(this.doc,'section','photo-album-panel');
    this.title=element(this.doc,'h2','photo-album-title');
    this.closeButton=this.button('Close album','×',()=>this.close());this.closeButton.className='photo-album-close';
    this.stage=element(this.doc,'div','photo-album-stage');
    this.caption=element(this.doc,'p','photo-album-caption');
    this.filename=element(this.doc,'p','photo-album-filename');
    const navigation=element(this.doc,'nav','photo-album-navigation');navigation.setAttribute('aria-label','Photo navigation');
    this.previous=this.button('Previous photo','← Previous',()=>this.navigate(-1));
    this.counter=element(this.doc,'span','photo-album-counter');this.counter.setAttribute('aria-live','polite');
    this.next=this.button('Next photo','Next →',()=>this.navigate(1));
    navigation.append(this.previous,this.counter,this.next);
    this.panel.append(this.closeButton,this.title,this.stage,this.caption,this.filename,navigation);
    this.root.append(this.panel);(mount??this.doc.body).append(this.root);
    this.root.addEventListener('click',event=>{if(event.target===this.root)this.close();});
  }

  button(label,text,action){
    const button=element(this.doc,'button','',text);button.type='button';
    button.setAttribute('aria-label',label);button.addEventListener('click',action);return button;
  }

  open(album,{filename='Photo album',underlay=null}={}){
    if(this.active)this.close({restoreFocus:false});
    this.photos=Array.isArray(album?.photos)?album.photos:[];this.index=0;
    this.focusTarget=this.doc.activeElement;this.underlay=underlay;this.previousInert=underlay?.inert??false;
    if(underlay)underlay.inert=true;
    this.active=true;this.root.hidden=false;this.title.textContent=album?.title??filename;
    this.root.setAttribute('aria-label',`${filename} — Photo album`);
    this.render();this.closeButton.focus();
  }

  navigate(step){
    if(!this.active||!this.photos.length)return;
    const next=Math.max(0,Math.min(this.photos.length-1,this.index+step));
    if(next===this.index)return;
    this.index=next;this.render();
  }

  render(){
    const photo=this.photos[this.index];
    this.counter.textContent=this.photos.length?`${this.index+1} / ${this.photos.length}`:'0 / 0';
    this.previous.disabled=this.index===0;this.next.disabled=this.index>=this.photos.length-1;
    this.caption.textContent=photo?.caption??'';
    this.filename.textContent=photo?.filename??photo?.src?.split('/').at(-1)??'';
    const status=element(this.doc,'p','photo-album-status',photo?.src?'Loading photo...':'No photos available yet.');
    status.setAttribute('role','status');this.stage.replaceChildren(status);this.image=null;
    if(!photo?.src)return;
    const image=element(this.doc,'img','photo-album-image');this.image=image;
    image.alt=photo.caption??this.filename.textContent;image.decoding='async';image.hidden=true;
    image.addEventListener('load',()=>{if(this.active&&this.image===image){image.hidden=false;status.hidden=true;}});
    image.addEventListener('error',()=>{
      if(this.active&&this.image===image){image.hidden=true;status.hidden=false;status.textContent='Photo not available yet. Add the image to the album asset folder.';}
    });
    this.stage.append(image);
    image.src=new URL(`${this.baseUrl}${photo.src}`,this.doc.baseURI).href;
  }

  handleKey(event){
    if(!this.active)return false;
    if(event.type!=='keydown')return true;
    if(event.key==='Escape'){
      event.preventDefault();if(!event.repeat)this.close();
    }else if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
      event.preventDefault();this.navigate(event.key==='ArrowLeft'?-1:1);
    }else if(event.key==='Tab'){
      event.preventDefault();
      const buttons=[this.closeButton,this.previous,this.next].filter(button=>!button.disabled);
      const index=buttons.indexOf(this.doc.activeElement),step=event.shiftKey?-1:1;
      buttons[(index+step+buttons.length)%buttons.length].focus();
    }
    return true;
  }

  close({restoreFocus=true}={}){
    if(!this.active)return;
    this.active=false;this.root.hidden=true;this.image=null;this.stage.replaceChildren();
    if(this.underlay)this.underlay.inert=this.previousInert;
    this.underlay=null;
    if(restoreFocus&&this.focusTarget?.isConnected!==false)this.focusTarget?.focus?.({preventScroll:true});
    this.onClose();
  }

  destroy(){this.close({restoreFocus:false});this.root.remove();}
}
