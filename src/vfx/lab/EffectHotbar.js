export function mountEffectHotbar(root,slots,effects,activate,{signal}={}){
  const document=root.ownerDocument;
  const buttons=slots.map((id,index)=>{
    const effect=effects[id];
    const key=String(index+1);
    const button=document.createElement('button');
    button.type='button';
    button.className='effect-slot';
    const label=document.createElement('span');
    label.textContent=effect?.label??'Empty';
    const shortcut=document.createElement('kbd');
    shortcut.textContent=key;
    button.append(shortcut,label);
    button.disabled=!effect;
    if(effect){
      button.setAttribute('aria-keyshortcuts',key);
      button.addEventListener('click',()=>activate(id),{signal});
    }
    return button;
  });
  root.replaceChildren(...buttons);
  let active;
  return {
    onKey(event){
      if(event.repeat||event.isComposing||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey)return;
      const index=Number(event.key)-1;
      if(event.key!==String(index+1)||!effects[slots[index]])return;
      event.preventDefault();
      activate(slots[index]);
    },
    showActive(id){
      if(id===active)return;
      active=id;
      buttons.forEach((button,index)=>button.classList.toggle('is-active',id!=null&&slots[index]===id));
    },
    destroy(){root.replaceChildren();},
  };
}
