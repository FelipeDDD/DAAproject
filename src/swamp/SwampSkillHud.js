import { InventoryHotbar } from '../inventory/InventoryHotbar.js';
import { GameMenuModal, node } from '../ui/GameMenuModal.js';
import { SKILLS, skillTooltip } from '../vfx/lab/combatSkills.js';
import { thumbnail } from '../vfx/lab/EffectHotbar.js';
import { SLOT_KEYS } from './runConfig.js';

function skillIcon(doc,skill){
  const image=thumbnail(doc,skill.icon??'pfx-charge');
  image.setAttribute('aria-hidden','true');
  return image;
}

function lockIcon(doc){
  const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('aria-hidden','true');
  const path=doc.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d','M8 11V7a4 4 0 0 1 8 0v4M6 11h12v10H6zM12 14v4');
  svg.append(path);
  return svg;
}

export class SwampSkillHud {
  constructor(onUse){
    this.hotbar=new InventoryHotbar(null,{quickSlotActions:SLOT_KEYS.map((keyLabel,index)=>({
      id:keyLabel,slot:index+1,keyLabel,label:keyLabel,onUse:()=>onUse(index),
    }))});
    this.hotbar.root.classList.add('swamp-skill-hotbar');
    this.hotbar.root.setAttribute('aria-label','Swamp skills');
    this.hotbar.quickGroup.setAttribute('aria-label','LMB, Q, E and R abilities');
    this.presentations=new Map();
  }

  update(run,runner,playable){
    for(const [i,id] of run.skills.entries()){
      const skill=SKILLS[id],step=run.config.checkpoints[i];
      const key=id??step.id;
      if(!this.presentations.has(key))this.presentations.set(key,skill?{
        name:skill.name,icon:skillIcon(document,skill),tooltip:skillTooltip(skill),locked:false,
      }:{
        name:'Locked',icon:lockIcon(document),tooltip:'Unlock at '+step.label+'.',locked:true,
      });
      const remaining=runner.cooldowns.get(id)??0;
      this.hotbar.setQuickSlotActionState(SLOT_KEYS[i],{
        enabled:Boolean(skill&&playable&&!remaining),status:remaining?(Math.ceil(remaining/100)/10).toFixed(1)+'s':'',
        presentation:this.presentations.get(key),
      });
      const slot=this.hotbar.actionViews.get(SLOT_KEYS[i]).slot;
      const fraction=remaining?String(remaining/skill.cooldown):'0';
      if(slot.style.getPropertyValue('--swamp-cooldown')!==fraction)slot.style.setProperty('--swamp-cooldown',fraction);
    }
  }

  destroy(){this.hotbar.destroy();}
}

export class SwampChoices extends GameMenuModal {
  constructor(scene,run,onChoose,onRestart){
    super({scene,title:'Swamp abilities',eyebrow:'CHECKPOINT',footerText:'Abilities are equipped for this run.'});
    Object.assign(this,{run,onChoose,onRestart});
    this.root.classList.add('swamp-choices');
    const back=this.button('← Categories','collections-back',()=>{
      this.category=null;
      this.showOverview();
    });
    this.back.replaceWith(back);
    this.back=back;
  }

  show(step){
    if(this.active)return false;
    this.step=step;
    this.category=null;
    this.restart=false;
    return this.open();
  }

  confirmRestart(){
    if(this.active)return false;
    this.restart=true;
    return this.open();
  }

  open(){
    if(!super.open())return false;
    this.body.querySelector('button')?.focus();
    return true;
  }

  requestClose(){if(this.restart)this.close();}

  showOverview(focus=true){
    this.closeButton.hidden=!this.restart;
    this.footerHint.hidden=!this.restart;
    const title=this.header.querySelector('h2');
    this.back.hidden=true;
    this.body.replaceChildren();
    if(this.restart){
      title.textContent='Restart run?';
      this.body.append(node(this.doc,'p','','Your choices and checkpoints in this run will be cleared.'),
        this.button('Restart run','swamp-choice-button',()=>{this.close();this.onRestart();}),
        this.button('Cancel','swamp-choice-button',()=>this.close()));
      return;
    }

    const offers=this.run.offers(this.step);
    title.textContent=this.step.label+' · '+SLOT_KEYS[this.step.slot];
    const offer=offers.find(entry=>entry.id===this.category)??(offers.length===1?offers[0]:null);
    this.body.append(node(this.doc,'p','',offer?'Choose an ability from '+offer.label+'.':'Choose a category.'));
    const grid=node(this.doc,'div','swamp-choice-grid');
    this.body.append(grid);
    if(!offer){
      for(const entry of offers)grid.append(this.button(entry.label,'swamp-choice-button',()=>{
        this.category=entry.id;this.showOverview();
      }));
    }else{
      this.back.hidden=offers.length<2;
      for(const id of offer.skills){
        const skill=SKILLS[id];
        const card=node(this.doc,'article','swamp-choice-card');
        const heading=node(this.doc,'h3','',skill.name);
        const stats=skillTooltip(skill).split('\n').slice(2).join('\n');
        card.append(skillIcon(this.doc,skill),heading,node(this.doc,'p','',skill.description),
          node(this.doc,'small','swamp-choice-stats',stats),
          this.button('Choose '+skill.name,'swamp-choice-button',()=>this.onChoose(offer.id,id)));
        grid.append(card);
      }
    }
    if(focus)grid.querySelector('button')?.focus();
  }
}
