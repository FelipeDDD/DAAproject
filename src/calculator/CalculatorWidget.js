import { CalculatorEngine } from './CalculatorEngine.js';

const KEYS=Object.freeze([
  ['C','clear','utility'],['⌫','backspace','utility'],['%','percent','operator'],['÷','/','operator'],
  ['7','7'],['8','8'],['9','9'],['×','*','operator'],
  ['4','4'],['5','5'],['6','6'],['−','-','operator'],
  ['1','1'],['2','2'],['3','3'],['+','+','operator'],
  ['0','0','wide'],['.','decimal'],['=','equals','equals'],
]);

function makeButton(documentRef,label,action,kind=''){
  const button=documentRef.createElement('button');button.type='button';button.textContent=label;
  button.dataset.calculatorAction=action;if(kind)button.dataset.calculatorKind=kind;return button;
}

export class CalculatorWidget {
  constructor({mount,scene,documentRef=document,windowRef=window}){
    Object.assign(this,{mount,scene,documentRef,windowRef,engine:new CalculatorEngine(),openState:false,positioned:false});
    this.launcher=makeButton(documentRef,'🧮','open');this.launcher.className='calculator-launcher';
    this.launcher.title='Open calculator';this.launcher.setAttribute('aria-label','Open calculator');
    this.launcher.setAttribute('aria-expanded','false');
    this.panel=documentRef.createElement('section');this.panel.className='calculator-widget';this.panel.hidden=true;
    this.panel.tabIndex=-1;this.panel.dataset.calculatorWidget='';this.panel.setAttribute('role','dialog');
    this.panel.setAttribute('aria-label','Calculator');
    this.header=documentRef.createElement('header');this.header.className='calculator-header';
    const title=documentRef.createElement('strong');title.textContent='Calculator';
    this.closeButton=makeButton(documentRef,'×','close');this.closeButton.className='calculator-close';
    this.closeButton.setAttribute('aria-label','Close calculator');this.header.append(title,this.closeButton);
    this.display=documentRef.createElement('output');this.display.className='calculator-display';
    this.display.setAttribute('aria-live','polite');this.display.textContent=this.engine.displayText;
    this.keypad=documentRef.createElement('div');this.keypad.className='calculator-keypad';
    this.keypad.append(...KEYS.map(key=>makeButton(documentRef,...key)));
    this.panel.append(this.header,this.display,this.keypad);this.mount.prepend(this.launcher);documentRef.body.append(this.panel);

    this.onLauncher=()=>this.open();this.onPanelClick=event=>this.handleAction(event.target.closest?.('[data-calculator-action]')?.dataset.calculatorAction);
    this.onKeyDown=event=>this.handleKey(event);
    this.onPointerDown=event=>this.startDrag(event);this.onPointerMove=event=>this.drag(event);this.onPointerUp=event=>this.endDrag(event);
    this.onResize=()=>{if(this.openState)this.clampToViewport();};
    this.launcher.addEventListener('click',this.onLauncher);this.panel.addEventListener('click',this.onPanelClick);
    this.panel.addEventListener('keydown',this.onKeyDown);this.header.addEventListener('pointerdown',this.onPointerDown);
    this.windowRef.addEventListener('pointermove',this.onPointerMove);this.windowRef.addEventListener('pointerup',this.onPointerUp);
    this.windowRef.addEventListener('resize',this.onResize);
  }

  get isOpen(){return this.openState;}

  open(){
    if(this.openState)return;
    this.openState=true;this.panel.hidden=false;this.launcher.setAttribute('aria-expanded','true');
    this.blockGameKeyboard();
    if(!this.positioned){this.placeBesideQuestion();this.positioned=true;}else this.clampToViewport();
    this.panel.focus({preventScroll:true});
  }

  close({reset=false}={}){
    if(reset){this.engine.clear();this.renderDisplay();}
    if(!this.openState)return;
    this.openState=false;this.dragState=null;this.panel.hidden=true;this.launcher.setAttribute('aria-expanded','false');
    this.restoreGameKeyboard();
  }

  handleAction(action){
    if(!action)return;
    if(action==='open')return this.open();
    if(action==='close')return this.close();
    if(action==='clear')this.engine.clear();
    else if(action==='backspace')this.engine.backspace();
    else if(action==='percent')this.engine.percent();
    else if(action==='decimal')this.engine.inputDecimal();
    else if(action==='equals')this.engine.equals();
    else if(/^\d$/.test(action))this.engine.inputDigit(action);
    else this.engine.setOperator(action);
    this.renderDisplay();this.panel.focus({preventScroll:true});
  }

  handleKey(event){
    event.stopImmediatePropagation();
    if(event.isComposing)return;
    const key=event.key;
    if(key==='Escape'){event.preventDefault();this.close();return;}
    let action=null;
    if(/^\d$/.test(key))action=key;
    else if(key==='.'||key===',')action='decimal';
    else if(['+','-','*','/','%'].includes(key))action=key;
    else if(key==='Enter'||key==='=')action='equals';
    else if(key==='Backspace')action='backspace';
    else if(key.toLowerCase()==='c'||key==='Delete')action='clear';
    if(action){event.preventDefault();this.handleAction(action);}
  }

  renderDisplay(){this.display.textContent=this.engine.displayText;}

  blockGameKeyboard(){
    const keyboard=this.scene?.input?.keyboard;
    this.keyboardWasEnabled=keyboard?.enabled!==false;keyboard?.resetKeys?.();if(keyboard)keyboard.enabled=false;
    this.scene?.player?.setVelocity?.(0,0);
  }

  restoreGameKeyboard(){
    const keyboard=this.scene?.input?.keyboard;keyboard?.resetKeys?.();if(keyboard)keyboard.enabled=this.keyboardWasEnabled!==false;
    this.documentRef.getElementById?.('game')?.focus?.({preventScroll:true});
  }

  placeBesideQuestion(){
    const anchor=this.mount.getBoundingClientRect(),panel=this.panel.getBoundingClientRect(),gap=12;
    const width=panel.width||244,height=panel.height||340;
    let left=anchor.right+gap;if(left+width>this.windowRef.innerWidth-gap)left=anchor.left-width-gap;
    this.setPosition(left,Math.max(gap,anchor.top),width,height);
  }

  clampToViewport(){
    const rect=this.panel.getBoundingClientRect();this.setPosition(rect.left,rect.top,rect.width,rect.height);
  }

  setPosition(left,top,width=this.panel.offsetWidth,height=this.panel.offsetHeight){
    const gap=8,maxLeft=Math.max(gap,this.windowRef.innerWidth-width-gap),maxTop=Math.max(gap,this.windowRef.innerHeight-height-gap);
    this.panel.style.left=`${Math.min(Math.max(gap,left),maxLeft)}px`;
    this.panel.style.top=`${Math.min(Math.max(gap,top),maxTop)}px`;
  }

  startDrag(event){
    if(event.button!==0||event.target.closest?.('button'))return;
    const rect=this.panel.getBoundingClientRect();this.dragState={pointerId:event.pointerId,dx:event.clientX-rect.left,dy:event.clientY-rect.top};
    this.header.setPointerCapture?.(event.pointerId);event.preventDefault();
  }

  drag(event){
    if(!this.dragState||event.pointerId!==this.dragState.pointerId)return;
    this.setPosition(event.clientX-this.dragState.dx,event.clientY-this.dragState.dy);event.preventDefault();
  }

  endDrag(event){
    if(!this.dragState||event.pointerId!==this.dragState.pointerId)return;
    this.header.releasePointerCapture?.(event.pointerId);this.dragState=null;
  }

  destroy(){
    this.close({reset:true});this.launcher.removeEventListener('click',this.onLauncher);this.panel.removeEventListener('click',this.onPanelClick);
    this.panel.removeEventListener('keydown',this.onKeyDown);this.header.removeEventListener('pointerdown',this.onPointerDown);
    this.windowRef.removeEventListener('pointermove',this.onPointerMove);this.windowRef.removeEventListener('pointerup',this.onPointerUp);
    this.windowRef.removeEventListener('resize',this.onResize);this.launcher.remove();this.panel.remove();
  }
}
