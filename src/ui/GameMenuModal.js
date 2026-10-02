const ICONS={
  backpack:['M8 5V3h8v2','M6 5h12l2 4v12H4V9z','M8 12h8v6H8zM4 10h16'],
  pack:['M7 3h10l3 5v13H4V8z','M4 8h16M7 3v5M8 12h8M8 16h5'],
  flask:['M9 3h6M10 3v6l-5 8a3 3 0 0 0 3 4h8a3 3 0 0 0 3-4l-5-8V3','M7 15h10'],
  book:['M12 5C8 2 4 3 3 4v15c4-2 6-1 9 1 3-2 5-3 9-1V4c-1-1-5-2-9 1z','M12 5v15'],
  diamond:['M7 4h10l5 6-10 12L2 10z','M2 10h20M7 4l5 18 5-18'],
};
export function node(doc,tag,className,text){
  const element=doc.createElement(tag);element.className=className;
  if(text!==undefined)element.textContent=text;
  return element;
}
export function icon(doc,name){
  const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
  for(const d of ICONS[name]??ICONS.pack){
    const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);svg.append(path);
  }
  return svg;
}

// Shared dialog lifecycle: input isolation, Escape, focus restoration and UI frame.
export class GameMenuModal {
  constructor({scene=null,title='Collections',eyebrow='THE CURIOSITY CABINET',footerText='Every find has a story.',documentRef=globalThis.document,
    windowRef=globalThis.window,baseUrl=import.meta.env?.BASE_URL??'/',modal=true}={}){
    Object.assign(this,{scene,doc:documentRef,win:windowRef,baseUrl,modal,active:false,destroyed:false,generation:0});
    this.root=node(this.doc,'dialog','collections-overlay');this.root.hidden=true;
    this.root.dataset.blockGameShortcuts='';this.root.setAttribute('aria-label',title);
    this.root.setAttribute('aria-modal',String(modal));
    this.panel=node(this.doc,'section','collections-panel');
    this.header=node(this.doc,'div','collections-header');
    this.back=this.button('← All collections','collections-back',()=>this.showOverview());this.back.hidden=true;
    const heading=node(this.doc,'div','collections-heading');
    heading.append(node(this.doc,'span','collections-eyebrow',eyebrow),node(this.doc,'h2','',title));
    this.closeButton=this.button('','collections-close',()=>this.requestClose());this.closeButton.setAttribute('aria-label',`Close ${title.toLowerCase()}`);
    this.header.append(this.back,heading,this.closeButton);
    this.body=node(this.doc,'div','collections-body');
    const footer=node(this.doc,'div','collections-footer');
    this.footerHint=node(this.doc,'span','','Esc to close');
    footer.append(node(this.doc,'span','',footerText),this.footerHint);
    this.panel.append(this.header,this.body,footer);this.root.append(this.panel);this.doc.body.append(this.root);
    this.onKey=event=>this.handleKey(event);
    this.win?.addEventListener('keydown',this.onKey,true);this.win?.addEventListener('keyup',this.onKey,true);
    this.root.addEventListener('cancel',event=>{event.preventDefault();this.requestClose();});
    this.root.addEventListener('click',event=>{if(event.target===this.root)this.handleBackdrop();});
  }

  button(text,className,onClick){
    const button=node(this.doc,'button',className,text);button.type='button';button.addEventListener('click',onClick);return button;
  }

  open(){
    if(this.active||this.destroyed)return false;
    const s=this.scene;
    if(s&&(s.chat?.isInputActive||s.terminal?.active||s.puzzleTerminal?.active||s.networkTerminal?.active
      ||s.soloStudy?.active||s.quiz?.seated||s.wardrobe?.active))return false;
    if(this.doc.querySelector('[data-block-game-shortcuts]:not([hidden]),.boss-reward-overlay:not([hidden])'))return false;
    this.focusTarget=this.doc.activeElement;this.active=true;this.generation++;
    // Capture controls before rendering: a failed render must not leave an
    // active, hidden dialog whose close would restore undefined input flags.
    this.keyboardWasEnabled=s?.input?.keyboard?.enabled;this.inputWasEnabled=s?.input?.enabled;
    this.previousOverflow=this.doc.body.style.overflow;if(this.modal)this.doc.body.style.overflow='hidden';
    try{
      this.showOverview(false);this.root.hidden=false;
      if(this.modal)this.root.showModal();else this.root.show();
      // Clear held keys and stop Phaser pointer input as well as keyboard input.
      s?.input?.keyboard?.resetKeys();s?.player?.setVelocity(0,0);
      if(s?.input){s.input.enabled=false;if(s.input.keyboard)s.input.keyboard.enabled=false;}
      this.closeButton.focus({preventScroll:true});return true;
    }catch(error){this.close();throw error;}
  }

  handleKey(event){
    if(event.key==='Escape'&&(this.active||this.releaseEscape)){
      event.preventDefault();event.stopImmediatePropagation();
      if(event.type==='keydown'){this.releaseEscape=true;if(!event.repeat)this.requestClose();}
      else{this.releaseEscape=false;this.restoreFocus();}
      return;
    }
    if(event.type==='keydown')this.releaseEscape=false;
    if(!this.active)return;
    event.stopImmediatePropagation();
    if(event.type==='keydown'&&event.key==='Tab'){
      event.preventDefault();
      const buttons=[...this.panel.querySelectorAll('button')].filter(button=>!button.hidden&&!button.disabled);
      const index=buttons.indexOf(this.doc.activeElement),step=event.shiftKey?-1:1;
      buttons[(index+step+buttons.length)%buttons.length]?.focus();
    }
    // Native button Enter/Space activation remains available within the dialog.
  }

  restoreFocus(){
    if(this.active||this.destroyed||(this.scene?.scene?.isActive&&!this.scene.scene.isActive()))return;
    this.win?.focus?.();
    (this.scene?this.doc.getElementById('game'):this.focusTarget)?.focus?.({preventScroll:true});
  }

  requestClose(){this.close();}
  handleBackdrop(){this.requestClose();}

  close({restoreFocus=true}={}){
    if(!this.active)return;
    this.active=false;this.generation++;
    const s=this.scene;s?.input?.keyboard?.resetKeys();
    if(s?.input){s.input.enabled=this.inputWasEnabled;if(s.input.keyboard)s.input.keyboard.enabled=this.keyboardWasEnabled;}
    this.root.close();this.root.hidden=true;this.body.replaceChildren();this.itemButtons?.clear();
    this.doc.body.style.overflow=this.previousOverflow;
    if(restoreFocus){
      this.restoreFocus();const generation=this.generation;
      (this.win?.requestAnimationFrame?.bind(this.win)??queueMicrotask)(()=>{if(this.generation===generation)this.restoreFocus();});
    }
  }

  destroy(){
    this.destroyed=true;this.close({restoreFocus:false});
    this.win?.removeEventListener('keydown',this.onKey,true);this.win?.removeEventListener('keyup',this.onKey,true);this.root.remove();
  }
}
