import { BALANCE_FORMAT,validateBalance } from '../../combat/balanceSchema.js';
import { BalanceFieldsView,button,element } from './balanceFieldsView.js';

const groups=[
  ['Slimes · special attacks',['slimes','special']],['Slimes · variant damage and recoil',['slimes','variants']],
  ['Snake · Venom Bite',['snake','bite']],['Snake · movement and tactics',['snake']],
  ['Frog · Leaping Slam',['frog','leap']],['Frog · Long Leap',['frog','longLeap']],['Frog · movement',['frog']],
];

export class BalanceEditor{
  constructor(scene,mount,state,saveDialog,signal){
    Object.assign(this,{scene,state});
    this.details=element('details');
    this.details.className='balance-editor';
    const picker=element('select');
    picker.replaceChildren(...groups.map(([name],i)=>new Option(name,String(i))));
    const label=element('label','Enemies ');
    label.append(picker);
    const fields=new BalanceFieldsView(state);
    picker.addEventListener('change',()=>fields.render(groups[Number(picker.value)][1]),{signal});
    fields.render(groups[0][1]);
    const status=element('output');
    status.setAttribute('aria-live','polite');
    this.notice=element('p');
    this.notice.setAttribute('role','status');
    this.file=element('input');
    this.file.hidden=true;
    this.file.type='file';
    this.file.accept='.json,application/json';
    this.file.addEventListener('change',()=>void this.importFile(),{signal});
    const actions=element('div');
    actions.className='balance-actions';
    const action=(text,run)=>button(text,run,signal);
    const preview=action('Reset fight and test',()=>{
      const error=state.apply(null);
      if(error){this.report(error);return;}
      if(scene.startBout())scene.game.canvas.scrollIntoView({block:'nearest'});
      else this.report('Choose an enemy before testing.');
    });
    const restore=action('Restore Saved',async()=>{
      if(!this.canDiscard())return;
      this.report(await state.restore(null));
      if(scene.bout.started)scene.resetBout();
    });
    const reset=action('Reset Original',()=>{
      if(!this.canDiscard())return;
      state.resetOriginal(null);
      this.report('Original balance values loaded as a draft.');
    });
    const save=action('Save to Source',()=>saveDialog.show(null,message=>this.report(message)));
    const exportFile=action('Export JSON',()=>this.exportFile());
    const importFile=action('Import JSON',()=>this.file.click());
    actions.append(preview,restore,reset,save,exportFile,importFile,this.file);
    const scope=element('small','Advanced actions apply, restore and save the full gameplay balance, including skills.');
    this.details.append(element('summary','Balance Editor'),label,status,fields.table,actions,scope,this.notice);
    mount.append(this.details);
    const update=({detail}={})=>{
      fields.update(detail?.replaceInputs);
      const plans=state.plans(null),pending=state.plans(null,'applied');
      const changes=plans[0]?.changes.length??0;
      const error=state.error(plans)||state.error(pending);
      status.textContent=error||(changes?changes+' unsaved field(s). ':'No unsaved values. ')+
        (pending.length?'Reset the fight to test the draft.':'The fight uses these values.');
      preview.disabled=Boolean(state.busy||error);
      restore.disabled=reset.disabled=exportFile.disabled=importFile.disabled=Boolean(state.busy);
      save.disabled=!state.canSave(plans);
    };
    state.addEventListener('change',update,{signal});
    signal.addEventListener('abort',()=>this.details.remove(),{once:true});
    update();
  }

  report(message){this.notice.textContent=message;}

  canDiscard(){
    return !this.state.plans(null).length||window.confirm('Discard unsaved gameplay balance changes?');
  }

  exportFile(){
    const {draft}=this.state.docs.balance,error=validateBalance(draft);
    if(error){this.report(error);return;}
    const data=JSON.stringify({format:BALANCE_FORMAT,data:draft},null,2)+'\n';
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
      if(this.state.busy||!this.canDiscard())return;
      this.state.importBalance(data);
      this.report('Imported as a draft.');
    }catch(error){this.report('Import failed. '+error.message);}
  }
}
