import { SKILLS,SLOT_KEYS,skillTooltip } from './combatSkills.js';
import { LOADOUT_KEY,readLoadout,savePreset,loadPreset } from './combatLoadout.js';
import { thumbnail } from './EffectHotbar.js';

export class CombatLoadoutPanel{
  constructor(signal){
    const get=id=>document.getElementById('combat-'+id);
    this.bar=get('bar');
    this.panel=get('loadout');
    this.bar.hidden=this.panel.hidden=false;
    this.casting=get('casting');
    this.hud=get('hud');
    const slots=get('slots'),library=get('library'),preset=get('preset'),name=get('preset-name'),message=get('storage-status');
    let storage;
    try{storage=window.localStorage;}catch{/* Use in-memory editing. */}
    this.state=readLoadout(storage);
    this.selectedSlot=0;
    const persist=text=>{
      try{
        storage.setItem(LOADOUT_KEY,JSON.stringify(this.state));
        message.textContent=text;
      }catch{message.textContent='Browser storage unavailable. Changes last for this page only.';}
    };
    const showPresets=()=>{
      preset.replaceChildren(...this.state.presets.map((p,i)=>new Option((i+1)+' · '+p.name,String(i))));
      preset.value=String(this.state.selected);
      name.value=this.state.presets[this.state.selected].name;
    };
    const render=()=>{
      slots.replaceChildren(...this.state.slots.map((id,i)=>{
        const button=this.tile(id,SLOT_KEYS[i],true);
        button.dataset.slot=i;
        button.setAttribute('aria-pressed',String(i===this.selectedSlot));
        return button;
      }));
      for(const button of library.children)button.setAttribute('aria-pressed',String(button.dataset.id===this.state.slots[this.selectedSlot]));
      this.hud.replaceChildren(...this.state.slots.map((id,i)=>this.tile(id,SLOT_KEYS[i],false)));
    };
    this.refreshBalance=()=>{
      library.replaceChildren(...Object.keys(SKILLS).map(id=>this.tile(id,'',true)));
      render();
    };
    slots.addEventListener('click',event=>{
      const el=event.target.closest('[data-slot]');
      if(el){this.selectedSlot=Number(el.dataset.slot);render();slots.children[this.selectedSlot].focus();}
    },{signal});
    library.addEventListener('click',event=>{
      const el=event.target.closest('[data-id]');
      if(!el)return;
      this.state.slots[this.selectedSlot]=el.dataset.id;
      render();
      persist(SLOT_KEYS[this.selectedSlot]+' equipped.');
    },{signal});
    preset.addEventListener('change',()=>{
      name.value=this.state.presets[Number(preset.value)].name;
      message.textContent='';
    },{signal});
    get('save').addEventListener('click',()=>{
      savePreset(this.state,Number(preset.value),name.value);
      showPresets();persist('Preset saved.');
    },{signal});
    get('load').addEventListener('click',()=>{
      loadPreset(this.state,Number(preset.value));showPresets();render();persist('Preset loaded.');
    },{signal});
    showPresets();this.refreshBalance();
    signal.addEventListener('abort',()=>{
      this.bar.hidden=this.panel.hidden=true;
      slots.replaceChildren();library.replaceChildren();this.hud.replaceChildren();
    },{once:true});
  }

  tile(id,key,button){
    const skill=SKILLS[id],el=document.createElement(button?'button':'div');
    if(button)el.type='button';
    else el.tabIndex=0;
    el.className='combat-tile';
    el.dataset.id=id;
    el.style.setProperty('--accent',skill.effect.color);
    const label=document.createElement('span');
    label.textContent=skill.name;
    const shortcut=document.createElement('kbd');
    shortcut.textContent=key;
    const tip=document.createElement('span');
    tip.className='combat-tip';
    tip.textContent=skillTooltip(skill);
    el.setAttribute('aria-label',(key?key+' · ':'')+tip.textContent);
    tip.setAttribute('aria-hidden','true');
    let icon;
    if(skill.iconSymbol){
      icon=document.createElement('span');
      icon.className='combat-'+skill.iconSymbol;
      icon.setAttribute('aria-hidden','true');
    }else icon=thumbnail(document,skill.icon);
    el.append(shortcut,icon,label,tip);
    if(!button){
      const shade=document.createElement('i'),time=document.createElement('b');
      shade.className='cooldown-shade';
      el.append(shade,time);
    }
    return el;
  }

  update(runner){
    const casting=runner.casting;
    const castText=casting?'Casting '+casting.skill.name+' · '+((casting.skill.cast-casting.age)/1000).toFixed(1)+' s':'';
    if(this.casting.textContent!==castText)this.casting.textContent=castText;
    const bout=runner.bout;
    for(const tile of this.hud.children){
      const id=tile.dataset.id,skill=SKILLS[id],ms=runner.cooldowns.get(id)??0;
      const label=ms?(Math.ceil(ms/100)/10).toFixed(1)+'s':'';
      if(tile.lastChild.textContent!==label)tile.lastChild.textContent=label;
      tile.style.setProperty('--cooldown',String(ms/skill.cooldown));
      tile.classList.toggle('just-used',ms>skill.cooldown-200);
      tile.classList.toggle('unavailable',!bout.started||bout.finished||!bout.alive||Boolean(bout.stunMs||casting));
    }
  }
}
