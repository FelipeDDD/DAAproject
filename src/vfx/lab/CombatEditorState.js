import balance from '../../combat/balance.json' with {type:'json'};
import catalog from '../../combat/skillCatalog.json' with {type:'json'};
import { BALANCE_ROUTE,original,balanceChanges,balanceValue,normalizeBalance,validateBalance } from '../../combat/balanceSchema.js';
import { SKILL_CATALOG_ROUTE,SKILL_CATEGORIES,validateSkillCatalog } from '../../combat/skillCatalogSchema.js';
import { applyCombatBalance } from './combatBalancePreview.js';

const ruleText=entry=>SKILL_CATEGORIES[entry.category]+' · '+entry.slots.join(', ');
const catalogChanges=(saved,draft)=>Object.keys(saved).flatMap(id=>{
  const before=saved[id],after=draft[id];
  return before.category!==after.category||before.slots.length!==after.slots.length||
    before.slots.some(slot=>!after.slots.includes(slot))?[{path:[id],before,after}]:[];
});
const inScope=(doc,scope,{path})=>scope===null||(doc==='catalog'?path[0]===scope:path[0]==='michael'&&path[1]===scope);

function overlay(base,changes){
  const copy=structuredClone(base);
  for(const {path,after} of changes)balanceValue(copy,path.slice(0,-1))[path.at(-1)]=structuredClone(after);
  return copy;
}

function documentState(name,route,tokenHeader,data,validate,changes,normalize=value=>value){
  const saved=normalize(data);
  return {name,route,tokenHeader,saved,validate,changes,normalize,draft:structuredClone(saved),applied:saved};
}

export class CombatEditorState extends EventTarget{
  constructor(loadout,signal){
    super();
    Object.assign(this,{loadout,signal});
    this.local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
    this.docs={
      balance:documentState('balance.json',BALANCE_ROUTE,'X-Combat-Balance-Token',
        balance,validateBalance,balanceChanges,normalizeBalance),
      catalog:documentState('skillCatalog.json',SKILL_CATALOG_ROUTE,'X-Combat-Skill-Catalog-Token',
        catalog,validateSkillCatalog,catalogChanges),
    };
    window.addEventListener('beforeunload',event=>{
      if(Object.values(this.docs).some(doc=>doc.changes(doc.saved,doc.draft).length)){
        event.preventDefault();event.returnValue=true;
      }
    },{signal});
    signal.addEventListener('abort',()=>applyCombatBalance(this.docs.balance.saved),{once:true});
  }

  notify(replaceInputs=false){
    if(!this.signal.aborted)this.dispatchEvent(new CustomEvent('change',{detail:{replaceInputs}}));
  }

  entries(scope){
    return scope===null?[['balance',this.docs.balance]]:Object.entries(this.docs);
  }

  plans(scope,baseline='saved'){
    return this.entries(scope).flatMap(([key,doc])=>{
      const changes=doc.changes(doc[baseline],doc.draft).filter(change=>inScope(key,scope,change));
      return changes.length?[{key,doc,changes,data:overlay(doc[baseline],changes)}]:[];
    });
  }

  error(plans){
    for(const {doc,data} of plans){
      const error=doc.validate(data);
      if(error)return error;
    }
    return '';
  }

  canSave(plans){
    return !this.busy&&plans.length>0&&!this.error(plans)&&plans.every(({doc})=>doc.source);
  }

  setDraftField(path,value){
    balanceValue(this.docs.balance.draft,path.slice(0,-1))[path.at(-1)]=value;
    this.notify();
  }

  setDraftRule(id,rule){
    this.docs.catalog.draft[id]=rule;
    this.notify();
  }

  apply(scope){
    const plans=this.plans(scope,'applied'),error=this.error(plans);
    if(error)return error;
    for(const {doc,data} of plans)doc.applied=data;
    this.syncRuntime(plans.map(plan=>plan.key));
    this.notify();
    return '';
  }

  syncRuntime(keys){
    const updatedBalance=keys.includes('balance');
    if(updatedBalance)applyCombatBalance(this.docs.balance.applied);
    if(keys.includes('catalog'))this.loadout.applyCatalog(this.docs.catalog.applied);
    else if(updatedBalance)this.loadout.refreshBalance();
  }

  resetOriginal(scope){
    const doc=this.docs.balance;
    const changes=balanceChanges(doc.draft,original).filter(change=>inScope('balance',scope,change));
    doc.draft=overlay(doc.draft,changes);
    this.notify(true);
  }

  importBalance(data){
    this.docs.balance.draft=structuredClone(normalizeBalance(data));
    this.notify(true);
  }

  async request(doc,data){
    const response=await fetch(doc.route,{
      method:data?'PUT':'GET',cache:'no-store',signal:this.signal,
      headers:data?{'Content-Type':'application/json',[doc.tokenHeader]:doc.source.token}:undefined,
      body:data&&JSON.stringify({data,revision:doc.source.revision}),
    });
    const source=await response.json();
    if(!response.ok)throw new Error(source.error??'HTTP '+response.status);
    const error=doc.validate(source.data);
    if(error)throw new Error(error);
    return source;
  }

  async restore(scope,{initial=false}={}){
    if(this.busy)return '';
    const entries=initial?Object.entries(this.docs):this.entries(scope);
    this.busy=true;
    this.notify();
    const updated=[];
    const results=await Promise.all(entries.map(async ([key,doc])=>{
      try{
        if(this.local)doc.source=await this.request(doc);
        const saved=doc.source?doc.normalize(doc.source.data):doc.saved;
        const keep=doc.changes(doc.saved,doc.draft).filter(change=>initial||!inScope(key,scope,change));
        doc.draft=overlay(saved,keep);
        doc.applied=initial?saved:overlay(doc.applied,doc.changes(doc.applied,saved).filter(change=>inScope(key,scope,change)));
        doc.saved=saved;
        updated.push(key);
        return initial?'':'Restored '+doc.name+'.';
      }catch(error){return 'Could not read '+doc.name+'. '+error.message;}
    }));
    this.busy=false;
    if(!this.signal.aborted){
      this.syncRuntime(updated);
      this.notify(true);
    }
    return results.filter(Boolean).join(' ');
  }

  async save(scope){
    const plans=this.plans(scope);
    if(!this.canSave(plans))return 'No valid changes are ready to save.';
    this.busy=true;
    this.notify();
    const results=await Promise.all(plans.map(async ({doc,data})=>{
      try{
        doc.source=await this.request(doc,data);
        doc.saved=doc.normalize(doc.source.data);
        return 'Saved '+doc.name+'.';
      }catch(error){return 'Could not save '+doc.name+'. '+error.message;}
    }));
    this.busy=false;
    this.notify();
    return results.join(' ');
  }
}

export { ruleText };
