import { SKILL_CATEGORIES,SLOT_KEYS } from '../../combat/skillCatalogSchema.js';
import { BalanceFieldsView,button,element } from './balanceFieldsView.js';
import { SKILLS } from './combatSkills.js';

export class SkillEditor{
  constructor(scene,mount,library,state,saveDialog,signal){
    Object.assign(this,{scene,mount,library,state});
    this.notices=new Map();
    const action=(text,run)=>button(text,run,signal);
    const back=action('Back to library',()=>this.close());
    this.heading=element('h2');
    this.heading.tabIndex=-1;
    this.category=element('select');
    this.category.replaceChildren(...Object.entries(SKILL_CATEGORIES).map(([id,label])=>new Option(label,id)));
    const categoryLabel=element('label','Category');
    categoryLabel.append(this.category);
    this.category.addEventListener('change',()=>this.editRules(),{signal});
    const slots=element('fieldset');
    slots.append(element('legend','Allowed slots'));
    this.slots=SLOT_KEYS.map(key=>{
      const input=element('input'),label=element('label',key);
      input.type='checkbox';
      label.prepend(input);
      slots.append(label);
      input.addEventListener('change',()=>this.editRules(),{signal});
      return input;
    });
    const fields=new BalanceFieldsView(state,{compact:true});
    this.fields=fields;
    this.status=element('output');
    this.status.setAttribute('aria-live','polite');
    this.notice=element('p');
    this.notice.setAttribute('role','status');
    const actions=element('div');
    actions.className='lab-button-row';
    this.apply=action('Apply / Test',()=>{
      const error=state.apply(this.id);
      if(error){this.report(error);return;}
      this.report(scene.startBout()?'Applied for this test.':'Applied. Choose an enemy before starting.');
    });
    this.restore=action('Restore Saved',async()=>{
      const id=this.id;
      if(state.plans(id).length&&!window.confirm('Discard unsaved changes for '+SKILLS[id].name+'?'))return;
      const before=JSON.stringify(state.docs.balance.applied.michael[id]);
      const message=await state.restore(id);
      this.report(message,id);
      if(scene.bout.started&&before!==JSON.stringify(state.docs.balance.applied.michael[id]))scene.resetBout();
    });
    this.save=action('Save to Source',()=>{
      const id=this.id;
      saveDialog.show(id,message=>this.report(message,id));
    });
    this.original=action('Reset Original values',()=>{
      const {id}=this;
      if(state.plans(id).some(plan=>plan.key==='balance')&&!window.confirm('Replace this skill’s gameplay draft with the original values?'))return;
      state.resetOriginal(id);
      this.report('Original gameplay values loaded as a draft.');
    });
    this.original.className='skill-reset-original';
    actions.append(this.apply,this.restore,this.save);
    mount.append(back,this.heading,categoryLabel,slots,fields.table,this.status,actions,this.original,this.notice);
    state.addEventListener('change',event=>this.update(event.detail.replaceInputs),{signal});
    signal.addEventListener('abort',()=>mount.replaceChildren(),{once:true});
  }

  open(id){
    this.id=id;
    this.heading.textContent=SKILLS[id].name;
    this.fields.render(['michael',id]);
    this.notice.textContent=this.notices.get(id)??'';
    this.library.hidden=true;
    this.mount.hidden=false;
    this.update(true);
    this.heading.focus();
  }

  close(){
    const id=this.id;
    this.id=null;
    this.mount.hidden=true;
    this.library.hidden=false;
    this.scene.loadout.focusSkill(id);
  }

  report(message,id=this.id){
    this.notices.set(id,message);
    if(this.id===id)this.notice.textContent=message;
  }

  editRules(){
    this.state.setDraftRule(this.id,{category:this.category.value,slots:SLOT_KEYS.filter((_,i)=>this.slots[i].checked)});
  }

  update(replaceInputs){
    if(!this.id)return;
    this.fields.update(replaceInputs);
    const {state,id}=this,rule=state.docs.catalog.draft[id];
    this.category.value=rule.category;
    this.category.disabled=Boolean(state.busy);
    for(const [i,input] of this.slots.entries()){
      input.checked=rule.slots.includes(SLOT_KEYS[i]);
      input.disabled=Boolean(state.busy);
    }
    const plans=state.plans(id),pending=state.plans(id,'applied');
    const error=state.error(plans)||state.error(pending);
    this.status.textContent=error||(plans.length?'Unsaved changes. ':'No unsaved changes. ')+
      (pending.length?'Apply to test the draft.':'The fight uses these values.')+
      (plans.some(({doc})=>!doc.source)&&!state.busy?' Source saving requires a direct local Vite connection.':'');
    this.apply.disabled=Boolean(state.busy||!pending.length||error);
    this.restore.disabled=this.original.disabled=Boolean(state.busy);
    this.save.disabled=!state.canSave(plans);
  }
}
