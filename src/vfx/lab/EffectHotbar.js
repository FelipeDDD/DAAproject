import { labSheets as sheets } from './sheetCatalog.js';

const icons={
  'fire-zone':'meteor','fire-ring':'blast','campfire-ground':'ember','spirit-ground':'venom',
  'healing-ground':'blessing','frost-ground':'frost',chain:'bolt',portal:'gate',
  cleaver:'pfx-cleave',flurry:'pfx-ice-daggers',lash:'pfx-whip',drain:'pfx-charge',
};

export function bankShortcut(event){
  if(event.defaultPrevented||event.repeat||event.isComposing||event.ctrlKey||event.altKey||
    event.metaKey||event.shiftKey||event.target?.isContentEditable||
    event.target?.closest?.('input,textarea,select,[role="textbox"]'))return null;
  if(event.key==='PageUp')return {step:-1};
  if(event.key==='PageDown')return {step:1};
  if(/^[0-9]$/.test(event.key))return {slot:(Number(event.key)+9)%10};
  return null;
}

export function thumbnail(document,name){
  const {width,height,frameMs,poster}=sheets[name];
  const [frame,x,y,w,h]=poster;
  const columns=Math.min(8,frameMs.length);
  const scale=Math.min(42/w,32/h,2);
  const icon=document.createElement('span');
  icon.className='slot-art';
  icon.style.width=w*scale+'px';
  icon.style.height=h*scale+'px';
  const url=import.meta.env.BASE_URL+'tools/vfx-lab/sheets/'+name+'.png';
  icon.style.backgroundImage='url("'+url+'")';
  icon.style.backgroundSize=columns*width*scale+'px auto';
  icon.style.backgroundPosition=-(frame%columns*width+x)*scale+'px '+(-(Math.floor(frame/columns)*height+y)*scale)+'px';
  return icon;
}

export function mountEffectHotbar(controls,banks,effects,{activate,selectEffect,signal}){
  const {hotbar,select}=controls;
  const document=hotbar.ownerDocument;
  let bank=0,active=null;
  const selections=banks.map(entry=>entry.slots[0]);
  const buttons=banks.map((entry,i)=>{
    const button=document.createElement('button');
    button.type='button';
    button.textContent=(i+1)+' · '+entry.label;
    button.addEventListener('click',()=>switchBank(i),{signal});
    return button;
  });
  controls.banks.replaceChildren(...buttons);
  function markSlots(){
    for(const button of hotbar.children){
      button.setAttribute('aria-pressed',String(button.dataset.id===select.value));
      button.classList.toggle('is-active',button.dataset.id===active);
    }
  }
  function render(){
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===bank)));
    const slots=banks[bank].slots;
    select.replaceChildren(...slots.map(id=>new Option(effects[id].label,id)));
    select.value=selections[bank];
    hotbar.replaceChildren(...slots.map((id,index)=>{
      const effect=effects[id];
      const button=document.createElement('button');
      button.type='button';
      button.className='effect-slot';
      button.dataset.id=id;
      button.style.setProperty('--accent',effect.color??'#e7bf88');
      const key=(banks[bank].keys??'1234567890')[index];
      button.setAttribute('aria-keyshortcuts',key);
      const shortcut=document.createElement('kbd');
      shortcut.textContent=key;
      const art=icons[id]??effect.variants?.Original.find(clip=>clip.sheet)?.sheet;
      const label=document.createElement('span');
      label.textContent=effect.label;
      button.append(shortcut,art?thumbnail(document,art):document.createElement('span'),label);
      return button;
    }));
    markSlots();
  }
  function switchBank(index){
    if(bank===index)return;
    bank=index;
    active=null;
    render();
    selectEffect();
  }
  function choose(id){
    selections[bank]=select.value=id;
    selectEffect();
    markSlots();
  }
  function cast(id){
    if(select.value!==id)choose(id);
    activate(id);
  }
  select.addEventListener('change',()=>choose(select.value),{signal});
  hotbar.addEventListener('click',event=>{
    const id=event.target.closest('button')?.dataset.id;
    if(id)cast(id);
  },{signal});
  render();
  return {
    onKey(event){
      const action=bankShortcut(event);
      if(!action)return;
      event.preventDefault();
      if(action.step)switchBank((bank+action.step+banks.length)%banks.length);
      else{
        const key=String((action.slot+1)%10);
        const index=(banks[bank].keys??'1234567890').indexOf(key);
        if(index>=0)cast(banks[bank].slots[index]);
      }
    },
    showActive(id){
      if(id===active)return;
      active=id;
      markSlots();
    },
    destroy(){hotbar.replaceChildren();controls.banks.replaceChildren();},
  };
}
