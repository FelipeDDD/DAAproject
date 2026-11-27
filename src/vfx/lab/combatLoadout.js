import { SKILLS,DEFAULT_SLOTS,SLOT_KEYS } from './combatSkills.js';
import { canEquip } from '../../combat/skillCatalogSchema.js';

export const LOADOUT_KEY='daa.combat-sandbox.loadout.v1';
const validSlots=slots=>DEFAULT_SLOTS.map((fallback,i)=>{
  const id=slots?.[i];
  return typeof id==='string'&&Object.hasOwn(SKILLS,id)?id:fallback;
});
const presetName=(value,i)=>(typeof value==='string'?value.trim().slice(0,28):'')||'Preset '+(i+1);

export function resolveLoadout(slots,catalog){
  return DEFAULT_SLOTS.map((fallback,i)=>{
    if(slots[i]&&canEquip(catalog,slots[i],i))return slots[i];
    if(canEquip(catalog,fallback,i))return fallback;
    return Object.keys(SKILLS).find(id=>canEquip(catalog,id,i))??null;
  });
}

export function readLoadout(storage){
  let data;
  try{
    const saved=JSON.parse(storage.getItem(LOADOUT_KEY));
    if(saved?.version===1)data=saved;
  }catch{/* A fresh loadout also works with storage disabled. */}
  const presets=Array.from({length:3},(_,i)=>{
    const p=data?.presets?.[i];
    return {name:presetName(p?.name,i),slots:validSlots(p?.slots)};
  });
  const selected=[0,1,2].includes(data?.selected)?data.selected:0;
  return {version:1,presets,selected,slots:validSlots(data?.slots??presets[selected].slots)};
}

export function savePreset(state,index,name,slots=state.slots){
  state.selected=index;
  state.presets[index]={name:presetName(name,index),slots:[...slots]};
}

export function loadPreset(state,index){
  state.selected=index;
  state.slots=[...state.presets[index].slots];
}

export function slotShortcut(event){
  if(event.repeat||event.defaultPrevented||event.ctrlKey||event.altKey||event.metaKey||event.isComposing||
    event.target?.isContentEditable||event.target?.closest?.('input, select, textarea, button, [role="textbox"]'))return -1;
  return SLOT_KEYS.indexOf(event.key.toUpperCase());
}
