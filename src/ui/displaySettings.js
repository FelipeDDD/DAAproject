export const GAME_LOGICAL_SIZE=Object.freeze({width:960,height:540});
export const VIEWPORT_PRESET_STORAGE_KEY='daa-viewport-size';
export const DEFAULT_VIEWPORT_PRESET='normal';
export const VIEWPORT_PRESETS=Object.freeze({
  compact:Object.freeze({id:'compact',label:'Compact',width:960,height:540}),
  normal:Object.freeze({id:'normal',label:'Normal',width:1152,height:648}),
  large:Object.freeze({id:'large',label:'Large',width:1280,height:720}),
});

export function normalizeViewportPreset(value){
  return VIEWPORT_PRESETS[value]?.id??DEFAULT_VIEWPORT_PRESET;
}

export function loadViewportPreset(storage=globalThis.localStorage){
  try{return normalizeViewportPreset(storage?.getItem(VIEWPORT_PRESET_STORAGE_KEY));}
  catch{return DEFAULT_VIEWPORT_PRESET;}
}

export function saveViewportPreset(value,storage=globalThis.localStorage){
  const preset=normalizeViewportPreset(value);storage?.setItem(VIEWPORT_PRESET_STORAGE_KEY,preset);return preset;
}

export function viewportAspectRatio(value){
  const preset=VIEWPORT_PRESETS[normalizeViewportPreset(value)];return preset.width/preset.height;
}

export class DisplaySettingsController {
  constructor(select,onResize=()=>{}){
    this.select=select;this.onResize=onResize;
    this.handleChange=()=>this.apply(this.select.value,true);
    this.select.addEventListener('change',this.handleChange);
    this.apply(loadViewportPreset(),false);
  }
  apply(value,persist=true){
    const id=normalizeViewportPreset(value),preset=VIEWPORT_PRESETS[id];
    if(persist)saveViewportPreset(id);
    this.select.value=id;
    document.documentElement.style.setProperty('--game-viewport-width',`${preset.width}px`);
    document.documentElement.dataset.viewportSize=id;
    requestAnimationFrame(()=>{this.onResize();window.dispatchEvent(new Event('daa-viewport-resize'));});
    return preset;
  }
  destroy(){this.select.removeEventListener('change',this.handleChange);}
}
