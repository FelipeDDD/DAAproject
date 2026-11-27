import { button,describeBalanceChange,element } from './balanceFieldsView.js';
import { ruleText } from './CombatEditorState.js';
import { SKILLS } from './combatSkills.js';

export class CombatSaveDialog{
  constructor(state,signal){
    this.state=state;
    this.dialog=element('dialog');
    this.dialog.className='balance-confirm';
    this.dialog.setAttribute('aria-labelledby','combat-save-heading');
    const title=element('h2','Save to source?');
    title.id='combat-save-heading';
    this.review=element('ul');
    this.confirm=button('Confirm save',async()=>{
      this.dialog.close();
      this.report(await this.state.save(this.scope));
    },signal);
    this.dialog.append(title,this.review,this.confirm,button('Cancel',()=>this.dialog.close(),signal));
    document.getElementById('lab').append(this.dialog);
    signal.addEventListener('abort',()=>this.dialog.remove(),{once:true});
  }

  show(scope,report){
    const plans=this.state.plans(scope);
    if(!this.state.canSave(plans))return;
    Object.assign(this,{scope,report});
    this.review.replaceChildren(...plans.flatMap(({key,doc,changes})=>changes.map(change=>{
      const detail=key==='balance'?describeBalanceChange(change):
        SKILLS[change.path[0]].name+' · '+ruleText(change.before)+' → '+ruleText(change.after);
      return element('li',doc.name+' · '+detail);
    })));
    this.dialog.showModal();
  }
}
