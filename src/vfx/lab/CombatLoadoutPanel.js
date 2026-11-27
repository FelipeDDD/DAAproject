import { SKILLS,SLOT_KEYS,skillTooltip } from './combatSkills.js';
import catalog from '../../combat/skillCatalog.json' with {type:'json'};
import { SKILL_CATEGORIES,canEquip } from '../../combat/skillCatalogSchema.js';
import { LOADOUT_KEY,readLoadout,savePreset,loadPreset,resolveLoadout } from './combatLoadout.js';
import { thumbnail } from './EffectHotbar.js';

export class CombatLoadoutPanel{
  constructor(signal,editSkill){
    const get=id=>document.getElementById('combat-'+id);
    this.casting=get('casting');
    this.hud=get('hud');
    const slots=get('slots'),library=get('library'),preset=get('preset'),name=get('preset-name'),message=get('storage-status');
    const search=get('search'),categoryFilter=get('category');
    categoryFilter.append(...Object.entries(SKILL_CATEGORIES).map(([id,label])=>new Option(label,id)));
    const compatibility=get('compatibility');
    let storage;
    try{storage=window.localStorage;}catch{/* Use in-memory editing. */}
    this.state=readLoadout(storage);
    this.catalog=catalog;
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
      this.equipped=resolveLoadout(this.state.slots,this.catalog);
      const changed=SLOT_KEYS.filter((key,i)=>this.equipped[i]!==this.state.slots[i]);
      compatibility.textContent=changed.length?'Slot rules adjusted '+changed.join(', ')+' for this test. Stored choices are kept.':'';
      slots.replaceChildren(...this.equipped.map((id,i)=>{
        const button=this.tile(id,SLOT_KEYS[i],true);
        button.dataset.slot=i;
        button.setAttribute('aria-pressed',String(i===this.selectedSlot));
        return button;
      }));
      renderAvailability();
      this.hud.replaceChildren(...this.equipped.map((id,i)=>this.tile(id,SLOT_KEYS[i],false)));
    };
    const renderAvailability=()=>{
      for(const button of library.querySelectorAll('[data-equip]')){
        button.setAttribute('aria-pressed',String(button.dataset.id===this.equipped[this.selectedSlot]));
        const allowed=canEquip(this.catalog,button.dataset.id,this.selectedSlot);
        button.disabled=!allowed;
        button.parentElement.classList.toggle('is-incompatible',!allowed);
        button.title=allowed?'Equip in '+SLOT_KEYS[this.selectedSlot]:'Allowed slots: '+this.catalog[button.dataset.id].slots.join(', ');
      }
    };
    this.applyCatalog=data=>{this.catalog=data;this.refreshBalance();};
    const renderLibrary=()=>{
      const query=search.value.trim().toLowerCase(),filter=categoryFilter.value;
      const groups=Object.entries(SKILL_CATEGORIES).flatMap(([category,label])=>{
        if(filter&&filter!==category)return [];
        const ids=Object.keys(SKILLS).filter(id=>this.catalog[id]?.category===category&&SKILLS[id].name.toLowerCase().includes(query));
        if(!ids.length)return [];
        const group=document.createElement('section'),heading=document.createElement('h3'),tiles=document.createElement('div');
        heading.textContent=label;
        tiles.className='library-tiles';
        tiles.append(...ids.map(id=>{
          const card=document.createElement('div'),equip=this.tile(id,'',true),edit=document.createElement('button');
          card.className='skill-library-card';
          equip.dataset.equip='';
          equip.setAttribute('aria-label','Equip '+SKILLS[id].name+'\n'+skillTooltip(SKILLS[id]));
          edit.type='button';
          edit.className='skill-edit-button';
          edit.dataset.editSkill=id;
          edit.textContent='✎';
          edit.title='Edit skill';
          edit.setAttribute('aria-label','Edit '+SKILLS[id].name);
          card.append(equip,edit);
          return card;
        }));
        group.append(heading,tiles);
        return [group];
      });
      if(groups.length)library.replaceChildren(...groups);
      else library.textContent='No matching skills.';
    };
    this.refreshBalance=()=>{
      renderLibrary();
      render();
    };
    const refilter=()=>{renderLibrary();renderAvailability();};
    search.addEventListener('input',refilter,{signal});
    categoryFilter.addEventListener('change',refilter,{signal});
    this.focusSkill=id=>(library.querySelector('[data-edit-skill="'+id+'"]')??search).focus();
    slots.addEventListener('click',event=>{
      const el=event.target.closest('[data-slot]');
      if(el){this.selectedSlot=Number(el.dataset.slot);render();slots.children[this.selectedSlot].focus();}
    },{signal});
    library.addEventListener('click',event=>{
      const edit=event.target.closest('[data-edit-skill]');
      if(edit){editSkill(edit.dataset.editSkill);return;}
      const el=event.target.closest('[data-equip]');
      if(!el||!canEquip(this.catalog,el.dataset.id,this.selectedSlot))return;
      this.state.slots[this.selectedSlot]=el.dataset.id;
      render();
      persist(SLOT_KEYS[this.selectedSlot]+' equipped.');
    },{signal});
    preset.addEventListener('change',()=>{
      name.value=this.state.presets[Number(preset.value)].name;
      message.textContent='';
    },{signal});
    get('save').addEventListener('click',()=>{
      savePreset(this.state,Number(preset.value),name.value,this.equipped.map((id,i)=>id??this.state.slots[i]));
      showPresets();persist('Preset saved.');
    },{signal});
    get('load').addEventListener('click',()=>{
      loadPreset(this.state,Number(preset.value));showPresets();render();persist('Preset loaded.');
    },{signal});
    showPresets();this.refreshBalance();
    signal.addEventListener('abort',()=>{
      slots.replaceChildren();library.replaceChildren();this.hud.replaceChildren();
    },{once:true});
  }

  tile(id,key,button){
    const skill=SKILLS[id],el=document.createElement(button?'button':'div');
    if(button)el.type='button';
    else el.tabIndex=0;
    el.className='combat-tile';
    if(id)el.dataset.id=id;
    if(!skill){
      el.classList.add('unavailable');
      const shortcut=document.createElement('kbd');
      shortcut.textContent=key;
      el.append(shortcut,document.createTextNode('Empty slot'));
      return el;
    }
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
    let castText=casting?'Casting '+casting.skill.name+' · '+((casting.skill.cast-casting.age)/1000).toFixed(1)+' s':'';
    if(runner.bout.defending)castText=runner.bout.parry.blockedDamage?'Healing Parry · Blocked':'Healing Parry · Guarding';
    else if(runner.bout.parry)castText='Healing Parry · Vulnerable';
    if(this.casting.textContent!==castText)this.casting.textContent=castText;
    const bout=runner.bout;
    for(const tile of this.hud.children){
      const id=tile.dataset.id,skill=SKILLS[id],ms=runner.cooldowns.get(id)??0;
      if(!skill)continue;
      const label=ms?(Math.ceil(ms/100)/10).toFixed(1)+'s':'';
      if(tile.lastChild.textContent!==label)tile.lastChild.textContent=label;
      tile.style.setProperty('--cooldown',String(ms/skill.cooldown));
      tile.classList.toggle('just-used',ms>skill.cooldown-200);
      tile.classList.toggle('unavailable',!bout.started||bout.finished||!bout.alive||Boolean(bout.stunMs||casting||bout.defending));
    }
  }
}
