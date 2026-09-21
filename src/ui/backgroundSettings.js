export const BACKGROUND_STORAGE_KEY='daa-page-background';
export const DEFAULT_BACKGROUND_ID='slate-blueprint';
export const BACKGROUNDS=Object.freeze([
  {id:'warm-blueprint',label:'Warm Blueprint',file:'warm-blueprint.png',color:'#271810'},
  {id:'stone-atlas',label:'Stone Atlas',file:'stone-atlas.png',color:'#38302b'},
  {id:'sepia-library',label:'Sepia Library',file:'sepia-library.png',color:'#322018'},
  {id:'blurred-classroom',label:'Blurred Classroom',file:'blurred-classroom.png',color:'#1a2533'},
  {id:'slate-blueprint',label:'Slate Blueprint',file:'slate-blueprint.png',color:'#293849'},
  {id:'gothic-charcoal',label:'Gothic Charcoal',file:'gothic-charcoal.png',color:'#161617'},
  {id:'ivory-atlas',label:'Ivory Atlas',file:'ivory-atlas.png',color:'#f5eedf'},
  {id:'sky-blueprint',label:'Sky Blueprint',file:'sky-blueprint.png',color:'#eaf1f7'},
]);

export function normalizeBackgroundId(value){
  return BACKGROUNDS.some(background=>background.id===value)?value:DEFAULT_BACKGROUND_ID;
}

export function loadBackgroundId(storage=globalThis.localStorage){
  try{return normalizeBackgroundId(storage?.getItem(BACKGROUND_STORAGE_KEY));}
  catch{return DEFAULT_BACKGROUND_ID;}
}

export function saveBackgroundId(value,storage=globalThis.localStorage){
  const id=normalizeBackgroundId(value);
  try{storage?.setItem(BACKGROUND_STORAGE_KEY,id);}catch{}
  return id;
}

function backgroundUrl(background){
  return `${import.meta.env?.BASE_URL??'/'}assets/backgrounds/${background.file}`;
}

export class BackgroundSettingsController {
  constructor(toggle,options){
    this.toggle=toggle;this.options=options;this.buttons=new Map();
    for(const background of BACKGROUNDS){
      const button=document.createElement('button');button.type='button';button.className='background-option';
      button.dataset.background=background.id;button.setAttribute('aria-pressed','false');
      const preview=document.createElement('span');preview.className='background-option-preview';
      preview.style.backgroundImage=`url("${backgroundUrl(background)}")`;
      const label=document.createElement('span');label.textContent=background.label;
      button.append(preview,label);options.append(button);this.buttons.set(background.id,button);
    }
    this.onToggle=()=>this.setOpen(this.options.hidden);
    this.onChoice=event=>{
      const button=event.target.closest('button[data-background]');
      if(!button||!this.options.contains(button))return;
      this.apply(button.dataset.background);this.setOpen(false);
    };
    this.onOutsideClick=event=>{
      if(!this.options.hidden&&!this.toggle.parentElement.contains(event.target))this.setOpen(false);
    };
    this.onKeyDown=event=>{if(event.key==='Escape'&&!this.options.hidden){this.setOpen(false);this.toggle.focus();}};
    toggle.addEventListener('click',this.onToggle);
    options.addEventListener('click',this.onChoice);
    document.addEventListener('click',this.onOutsideClick);
    document.addEventListener('keydown',this.onKeyDown);
    this.apply(loadBackgroundId(),false);
  }

  apply(value,persist=true){
    const id=normalizeBackgroundId(value),background=BACKGROUNDS.find(item=>item.id===id);
    if(persist)saveBackgroundId(id);
    document.documentElement.dataset.pageBackground=id;
    document.documentElement.style.setProperty('--page-background-image',`url("${backgroundUrl(background)}")`);
    document.documentElement.style.setProperty('--page-background-color',background.color);
    for(const [buttonId,button] of this.buttons)button.setAttribute('aria-pressed',String(buttonId===id));
    return background;
  }

  setOpen(open){this.options.hidden=!open;this.toggle.setAttribute('aria-expanded',String(open));}

  destroy(){
    this.toggle.removeEventListener('click',this.onToggle);
    this.options.removeEventListener('click',this.onChoice);
    document.removeEventListener('click',this.onOutsideClick);
    document.removeEventListener('keydown',this.onKeyDown);
  }
}
