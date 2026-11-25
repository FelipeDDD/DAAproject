import { slotShortcut } from '../vfx/lab/combatLoadout.js';

const movementKeys=new Set(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright']);
const isMovement=event=>movementKeys.has(event.key?.toLowerCase());

export function bindSwampMovementFocus(scene,signal){
  const canvas=scene.game.canvas;
  const {ownerDocument}=canvas;
  const game=canvas.closest('#game');
  const active=()=>scene.sys.isActive();
  const clearMovement=()=>{
    if(!active())return;
    const {keyboard}=scene.input;
    // An earlier keydown can still be in Phaser's queue until the frame ends.
    keyboard.manager.queue=keyboard.manager.queue.filter(event=>event.type!=='keydown'||!isMovement(event));
    keyboard.resetKeys();
    scene.player.setVelocity(0,0);
  };
  const inEditor=target=>target?.closest?.('.swamp-editor');
  canvas.addEventListener('contextmenu',event=>{
    if(active())event.preventDefault();
  },{signal});
  ownerDocument.defaultView.addEventListener('blur',clearMovement,{signal});
  ownerDocument.addEventListener('visibilitychange',()=>{
    if(ownerDocument.hidden)clearMovement();
  },{signal});
  game?.addEventListener('focusout',event=>{
    if(!game.contains(event.relatedTarget))clearMovement();
  },{signal});
  ownerDocument.addEventListener('focusin',event=>{
    if(inEditor(event.target))clearMovement();
  },{signal});
  ownerDocument.addEventListener('keydown',event=>{
    if(!active()||!isMovement(event))return;
    // Phaser accepts an auto-repeat as a new press after resetKeys().
    // Keep the native control behavior and stop only the trip to Phaser.
    if(event.repeat||ownerDocument.hidden||inEditor(event.target))event.stopPropagation();
  },{signal});
}

export function bindSwampCastInput(canvas,use,signal){
  const {ownerDocument}=canvas;
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    if(ownerDocument.activeElement?.closest('.swamp-editor'))
      canvas.closest('#game')?.focus({preventScroll:true});
    use(0);
  },{signal});
  ownerDocument.defaultView.addEventListener('keydown',event=>{
    const slot=slotShortcut(event);
    if((slot===1||slot===3)&&use(slot))event.preventDefault();
  },{signal});
}
