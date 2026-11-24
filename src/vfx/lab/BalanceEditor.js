import current from '../../combat/balance.json' with {type:'json'};
import { BALANCE_ROUTE, BALANCE_FORMAT, original, balanceChanges, balanceFields, balanceValue, validateBalance } from '../../combat/balanceSchema.js';
import { SKILLS } from './combatSkills.js';
import { applyCombatBalance } from './combatBalancePreview.js';

const labelIfKnown={
  cast:'Cast preparation',critical:'Critical damage',heal:'Max healing',rayPadding:'Ray padding',
  criticalChance:'Critical chance',castSpeed:'Movement during cast',percent:'Slow strength',
  feintChance:'Feint chance',engageRange:'Engage range',maxRange:'Maximum cast range',ms:'Duration',
  trackingMs:'Initial tracking time',turnRate:'Initial turn rate',lateTurnRate:'Late turn rate',maxTurn:'Total turn limit',
  longLeap:'Long Leap',leap:'Leaping Slam',bite:'Venom Bite',slime:'Poison Slime',frost:'Frost Slime',
  big:'Big Slime',swift:'Swift Slime',
};
const label=key=>labelIfKnown[key]??key.replace(/Ms$/,'').replace(/([a-z])([A-Z])/g,'$1 $2')
  .replace(/^./,first=>first.toUpperCase());
const display=(value,field)=>Number.isFinite(value)?String(Number((value*(field.factor??1)).toFixed(6))):'';
const displayValue=(value,field)=>display(value,field)+(field.unit?' '+field.unit:'');
const groupLabel=path=>path[0]==='bands'?'Band '+(Number(path[1])+1):path.map(label).join(' / ');

function element(tag,text){
  const node=document.createElement(tag);
  if(text)node.textContent=text;
  return node;
}

export class BalanceEditor {
  constructor(scene,mount,signal){
    Object.assign(this,{scene,mount,signal});
    this.saved=structuredClone(current);
    this.draft=structuredClone(current);
    this.applied=structuredClone(current);
    this.rows=[];
    this.groups=[
      ...Object.entries(SKILLS).map(([id,skill])=>['Michael · '+skill.name,['michael',id]]),
      ['Slimes · special attacks',['slimes','special']],['Slimes · variant damage and recoil',['slimes','variants']],
      ['Snake · Venom Bite',['snake','bite']],['Snake · movement and tactics',['snake']],
      ['Frog · Leaping Slam',['frog','leap']],['Frog · Long Leap',['frog','longLeap']],['Frog · movement',['frog']],
    ].map(([name,prefix])=>({name,prefix}));

    this.details=element('details');
    this.details.className='balance-editor';
    this.details.append(element('summary','Balance Editor'));
    this.picker=element('select');
    this.picker.setAttribute('aria-label','Combatant or skill');
    this.groups.forEach(({name},index)=>this.picker.add(new Option(name,String(index))));
    this.picker.addEventListener('change',()=>this.render(),{signal});
    this.table=element('table');
    this.table.className='balance-fields';
    this.table.setAttribute('aria-label','Balance parameters');
    this.state=element('output');
    this.state.setAttribute('aria-live','polite');
    this.notice=element('p');
    this.notice.setAttribute('role','status');
    this.file=element('input');
    this.file.hidden=true;
    this.file.type='file';
    this.file.accept='.json,application/json';
    this.file.addEventListener('change',()=>void this.importFile(),{signal});
    const actions=element('div');
    actions.className='balance-actions';
    this.previewButton=this.button('Reset fight and test',()=>this.scene.controls.start.click());
    this.restoreButton=this.button('Restore Saved',()=>void this.restoreSaved());
    this.originalButton=this.button('Reset Original',()=>{
      if(!this.canDiscard())return;
      this.draft=structuredClone(original);
      this.report('Original values loaded as a draft.');
      this.render();
    });
    this.saveButton=this.button('Save to Source',()=>this.confirmSave());
    actions.append(this.previewButton,this.restoreButton,this.originalButton,this.saveButton,
      this.button('Export JSON',()=>this.exportFile()),this.button('Import JSON',()=>this.file.click()),this.file);
    this.dialog=element('dialog');
    this.dialog.className='balance-confirm';
    this.dialog.setAttribute('aria-label','Confirm balance save');
    this.review=element('ul');
    this.confirmButton=this.button('Confirm save',()=>void this.writeSource());
    this.dialog.append(element('h2','Save balance to source?'),
      element('p','These values will become the defaults for the Sandbox and Swamp V3.'),this.review,
      this.confirmButton,this.button('Cancel',()=>this.dialog.close()));
    this.details.append(this.picker,this.state,this.table,actions,this.notice,this.dialog);
    mount.append(this.details);
    this.render();
    window.addEventListener('beforeunload',event=>{
      if(this.dirty){event.preventDefault();event.returnValue=true;}
    },{signal});
    signal.addEventListener('abort',()=>{
      this.details.remove();
      applyCombatBalance(this.saved);
    },{once:true});
    void this.restoreSaved(false);
  }

  button(text,action){
    const button=element('button',text);
    button.type='button';
    button.addEventListener('click',action,{signal:this.signal});
    return button;
  }

  get dirty(){return balanceChanges(this.saved,this.draft).length>0;}
  canDiscard(){return !this.dirty||window.confirm('Discard the unsaved balance changes?');}
  report(message){this.notice.textContent=message;}

  render(){
    this.rows=[];
    const {prefix}=this.groups[Number(this.picker.value)];
    const fields=balanceFields.filter(({path})=>prefix.every((key,index)=>path[index]===key)&&
      // Split common movement fields and attack stages into separate selections.
      !(prefix.length===1&&['bite','leap','longLeap'].includes(path[1])));
    const head=element('thead'),heading=element('tr');
    for(const column of ['Parameter','Saved','Experimental'])heading.append(element('th',column));
    head.append(heading);
    const body=element('tbody');
    let lastGroup;
    for(const field of fields){
      const relative=field.path.slice(prefix.length),group=groupLabel(relative.slice(0,-1));
      if(group&&group!==lastGroup){
        const header=element('tr'),title=element('th',group);
        title.colSpan=3;
        title.scope='colgroup';
        header.className='balance-stage';
        header.append(title);
        body.append(header);
      }
      lastGroup=group;
      const row=element('tr'),name=element('th',label(relative.at(-1))),saved=element('td'),experimental=element('td');
      name.scope='row';
      const input=element('input');
      input.type='number';
      input.step=field.integer?'1':'any';
      input.min=String(field.min*(field.factor??1));
      input.max=String(field.max*(field.factor??1));
      input.setAttribute('aria-label',[group,name.textContent,field.unit].filter(Boolean).join(' · '));
      const unit=element('span',field.unit);
      input.value=display(balanceValue(this.draft,field.path),field);
      input.addEventListener('input',()=>{
        const parent=balanceValue(this.draft,field.path.slice(0,-1));
        parent[field.path.at(-1)]=input.valueAsNumber/(field.factor??1);
        this.updateState();
      });
      experimental.append(input,unit);
      row.append(name,saved,experimental);
      body.append(row);
      this.rows.push({row,saved,input,field});
    }
    this.table.replaceChildren(head,body);
    this.updateState();
  }

  updateState(){
    const changes=balanceChanges(this.saved,this.draft);
    const error=validateBalance(this.draft);
    for(const {row,saved,input,field} of this.rows){
      const value=balanceValue(this.saved,field.path);
      saved.textContent=displayValue(value,field);
      row.classList.toggle('changed',value!==balanceValue(this.draft,field.path));
      input.disabled=Boolean(this.restoring);
      if(input.validity.valid&&input.value!=='')input.removeAttribute('aria-invalid');
      else input.setAttribute('aria-invalid','true');
    }
    this.previewButton.disabled=Boolean(error);
    this.saveButton.disabled=Boolean(error||!changes.length||!this.source||this.busy);
    this.restoreButton.disabled=Boolean(this.busy);
    this.state.textContent=error||(changes.length?changes.length+' unsaved field(s). ':'No unsaved changes. ')+
      (balanceChanges(this.applied,this.draft).length?'Reset the fight to test the draft.':'The fight uses these values.');
  }

  applyPreview(){
    if(validateBalance(this.draft)||!balanceChanges(this.applied,this.draft).length)return;
    applyCombatBalance(this.draft);
    this.applied=structuredClone(this.draft);
    this.scene.loadout.refreshBalance();
    this.updateState();
  }

  async request(method='GET',body){
    const response=await fetch(BALANCE_ROUTE,{
      method,cache:'no-store',signal:this.signal,
      headers:method==='PUT'?{'Content-Type':'application/json','X-Combat-Balance-Token':this.source.token}:undefined,
      body:body&&JSON.stringify(body),
    });
    const result=await response.json();
    if(!response.ok)throw new Error(result.error??'Vite returned HTTP '+response.status);
    return result;
  }

  async restoreSaved(confirmDiscard=true){
    if(this.busy||(confirmDiscard&&!this.canDiscard()))return;
    this.busy=true;
    this.restoring=confirmDiscard;
    this.updateState();
    try{
      const source=await this.request();
      const error=validateBalance(source.data);
      if(error)throw new Error(error);
      const keepDraft=!confirmDiscard&&this.dirty;
      this.source=source;
      this.saved=structuredClone(source.data);
      // Leave any edits made while the initial source request was loading intact.
      if(!keepDraft)this.draft=structuredClone(source.data);
      this.report(confirmDiscard?'Last saved values restored.':'');
    }catch(error){
      if(!this.signal.aborted)this.report('Source unavailable. '+error.message);
    }finally{
      this.busy=false;
      this.restoring=false;
      if(!this.signal.aborted)this.render();
    }
  }

  confirmSave(){
    if(this.saveButton.disabled)return;
    this.review.replaceChildren(...balanceChanges(this.saved,this.draft).map(field=>{
      const path=field.path.map(part=>/^\d+$/.test(part)?String(Number(part)+1):label(part)).join(' / ');
      return element('li',path+' · '+displayValue(field.before,field)+' → '+displayValue(field.after,field));
    }));
    this.dialog.showModal();
  }

  async writeSource(){
    if(this.busy||!this.source||validateBalance(this.draft))return;
    this.dialog.close();
    this.busy=true;
    const data=structuredClone(this.draft);
    this.updateState();
    try{
      this.source=await this.request('PUT',{data,revision:this.source.revision});
      this.saved=structuredClone(this.source.data);
      this.report('Saved to source. Reload the Lab or Swamp to load the new defaults.');
    }catch(error){
      if(!this.signal.aborted)this.report('Save failed. '+error.message);
    }finally{
      this.busy=false;
      if(!this.signal.aborted)this.updateState();
    }
  }

  exportFile(){
    const error=validateBalance(this.draft);
    if(error){this.report(error);return;}
    const data=JSON.stringify({format:BALANCE_FORMAT,data:this.draft},null,2)+'\n';
    const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
    const link=element('a');
    link.download='combat-balance.json';
    link.href=url;
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    this.report('Draft exported.');
  }

  async importFile(){
    const [file]=this.file.files;
    this.file.value='';
    if(!file)return;
    try{
      if(file.size>32768)throw new Error('Balance file is too large.');
      const imported=JSON.parse(await file.text());
      const data=imported?.format===BALANCE_FORMAT?imported.data:imported;
      const error=validateBalance(data);
      if(error)throw new Error(error);
      if(!this.canDiscard())return;
      this.draft=structuredClone(data);
      this.report('Imported as a draft.');
      this.render();
    }catch(error){this.report('Import failed. '+error.message);}
  }
}
