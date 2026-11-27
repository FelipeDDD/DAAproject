const movementKeys=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);

// Phaser listens on window. Let native controls keep their keys before events reach it.
export function bindArenaInput(scene,{label,onPointer,onKey},signal){
  const canvas=scene.game.canvas;
  const document=canvas.ownerDocument;
  const window=document.defaultView;
  const active=()=>scene.sys.isActive();
  const clear=()=>{
    scene.input.keyboard.resetKeys();
    scene.player.setVelocity(0,0);
  };
  const clearActive=()=>{if(active())clear();};
  const focus=()=>{
    if(!active())return;
    if(document.activeElement!==canvas)clear();
    canvas.focus({preventScroll:true});
  };
  const wake=()=>{
    canvas.setAttribute('aria-label',label);
    clear();
  };
  canvas.tabIndex=0;
  wake();
  scene.input.keyboard.disableGlobalCapture();
  scene.events.on('sleep',clear);
  scene.events.on('wake',wake);
  signal.addEventListener('abort',()=>{
    scene.events.off('sleep',clear);
    scene.events.off('wake',wake);
  },{once:true});
  canvas.addEventListener('blur',clearActive,{signal});
  window.addEventListener('blur',clearActive,{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearActive();},{signal});
  document.addEventListener('keydown',event=>{
    if(active()&&movementKeys.has(event.key?.toLowerCase())&&
      (event.target!==canvas||event.repeat||document.hidden))event.stopPropagation();
  },{signal});
  window.addEventListener('keydown',event=>{
    if(!active()||event.target!==canvas)return;
    // Phaser has already handled the arrow press. Keep it from scrolling the page.
    if(event.key?.startsWith('Arrow'))event.preventDefault();
    onKey?.(event);
  },{signal});
  canvas.addEventListener('contextmenu',event=>{if(active())event.preventDefault();},{signal});
  canvas.addEventListener('pointerdown',event=>{
    if(!active()||event.button!==0)return;
    event.preventDefault();
    focus();
    onPointer();
  },{signal});
  return focus;
}
