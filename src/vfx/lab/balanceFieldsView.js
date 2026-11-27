import { balanceFields,balanceValue } from '../../combat/balanceSchema.js';
import { scaleDamage } from '../../combat/damageScaling.js';
import { BURN_TICK_MS,SKILLS } from './combatSkills.js';

const labels={
  cast:'Cast time',critical:'Critical damage',heal:'Max healing',rayPadding:'Ray padding',
  criticalChance:'Critical chance',castSpeed:'Movement during cast',percent:'Slow strength',
  feintChance:'Feint chance',engageRange:'Engage range',maxRange:'Maximum cast range',ms:'Duration',
  trackingMs:'Initial tracking time',turnRate:'Initial turn rate',lateTurnRate:'Late turn rate',maxTurn:'Total turn limit',
  longLeap:'Long Leap',leap:'Leaping Slam',bite:'Venom Bite',slime:'Poison Slime',frost:'Frost Slime',
  big:'Big Slime',swift:'Swift Slime',damagePercent:'Overall Damage',
};
const slimeDamageLabels={jumpDamage:'Jump Damage',projectileDamage:'Projectile Damage',
  contactDamage:'Contact Damage',damage:'Special Damage'};
const skillLabels={
  tesla:{damage:'Damage per discharge',radius:'Detection radius',targetCooldownMs:'Interval per target',
    durationMs:'Sentry duration',range:'Placement range',cooldown:'Skill cooldown'},
  'healing-parry':{activeMs:'Guard duration',blockFraction:'Damage blocked',healFraction:'Heal from blocked damage',
    maxHeal:'Maximum healing',recoveryMs:'Vulnerability duration',recoveryDamageMultiplier:'Incoming damage during vulnerability'},
  'fire-ring':{'burning.damage':'Burning damage per tick','burning.ms':'Burning duration',damage:'Initial damage',
    castSpeed:'Movement at end of cast'},
};
const label=key=>labels[key]??key.replace(/Ms$/,'').replace(/([a-z])([A-Z])/g,'$1 $2')
  .replace(/^./,first=>first.toUpperCase());
const isSlimeVariant=path=>path[0]==='slimes'&&path[1]==='variants';
const fieldLabel=path=>{
  const key=path.at(-1),specific=path[0]==='michael'?skillLabels[path[1]]:null;
  return specific?.[path.slice(2).join('.')]??specific?.[key]??
    (isSlimeVariant(path)?slimeDamageLabels[key]:undefined)??label(key);
};
const display=(value,field)=>Number.isFinite(value)?String(Number((value*(field.factor??1)).toFixed(6))):'';
const displayValue=(value,field)=>display(value,field)+(field.unit?' '+field.unit:'');
const groupLabel=path=>path[0]==='bands'?'Band '+(Number(path[1])+1):path.map(label).join(' / ');

export function element(tag,text){
  const node=document.createElement(tag);
  if(text)node.textContent=text;
  return node;
}

export function button(text,action,signal){
  const node=element('button',text);
  node.type='button';
  node.addEventListener('click',action,{signal});
  return node;
}

export function describeBalanceChange(field){
  const [owner,skill]=field.path;
  const parents=owner==='michael'?['Player Skills',SKILLS[skill].name]:field.path.slice(0,-1).map(label);
  if(owner==='michael'&&field.path[2]==='bands')parents.push(groupLabel(field.path.slice(2,4)));
  return [...parents,fieldLabel(field.path)].join(' / ')+' · '+
    displayValue(field.before,field)+' → '+displayValue(field.after,field);
}

export class BalanceFieldsView{
  constructor(state,{compact=false}={}){
    Object.assign(this,{state,compact,rows:[]});
    this.table=element('table');
    this.table.className='balance-fields'+(compact?' skill-fields':'');
    this.table.setAttribute('aria-label','Balance parameters');
  }

  render(prefix){
    this.rows=[];
    const fields=balanceFields.filter(({path})=>prefix.every((key,index)=>path[index]===key)&&
      !(prefix.length===1&&['bite','leap','longLeap'].includes(path[1])));
    const head=element('thead'),heading=element('tr');
    for(const column of ['Parameter','Saved','Experimental'])heading.append(element('th',column));
    head.append(heading);
    const body=element('tbody');
    let lastGroup;
    for(const field of fields){
      const relative=field.path.slice(prefix.length);
      const group=this.compact&&relative[0]!=='bands'?'':groupLabel(relative.slice(0,-1));
      if(group&&group!==lastGroup){
        const swift=isSlimeVariant(field.path)&&relative[0]==='swift';
        const header=element('tr'),title=element('th',swift?group+' (no standard projectile)':group);
        title.colSpan=3;
        title.scope='colgroup';
        header.className='balance-stage';
        header.append(title);
        body.append(header);
      }
      lastGroup=group;
      const row=element('tr'),name=element('th',fieldLabel(field.path)),saved=element('td'),experimental=element('td');
      name.scope='row';
      const input=element('input');
      input.type='number';
      input.step=String(field.step??(field.integer?1:'any'));
      input.min=String(field.min*(field.factor??1));
      input.max=String(field.max*(field.factor??1));
      input.setAttribute('aria-label',[group,name.textContent,field.unit].filter(Boolean).join(' · '));
      input.addEventListener('input',()=>this.state.setDraftField(field.path,input.valueAsNumber/(field.factor??1)));
      experimental.append(input,element('span',field.unit));
      const slime=isSlimeVariant(field.path)&&Object.hasOwn(slimeDamageLabels,relative.at(-1));
      const burn=field.path.join('.')==='michael.fire-ring.burning.ms';
      const detail=slime||burn?element('small'):null;
      if(detail){
        detail.className='balance-effective';
        experimental.append(detail);
      }
      row.append(name,saved,experimental);
      body.append(row);
      this.rows.push({row,saved,input,field,detail,slime,burn});
    }
    this.table.replaceChildren(head,body);
    this.update(true);
  }

  update(replaceInputs=false){
    const {saved,draft}=this.state.docs.balance;
    for(const {row,saved:cell,input,field,detail,slime,burn} of this.rows){
      const value=balanceValue(saved,field.path),draftValue=balanceValue(draft,field.path);
      cell.textContent=(this.compact?'Saved ':'')+displayValue(value,field);
      row.classList.toggle('changed',value!==draftValue);
      if(replaceInputs)input.value=display(draftValue,field);
      if(slime){
        const {damagePercent}=balanceValue(draft,field.path.slice(0,-1));
        const damage=scaleDamage(draftValue,damagePercent);
        detail.textContent=Number.isFinite(damage)?'Effective '+damage+' HP':'Effective —';
      }
      if(burn)detail.textContent=Number.isFinite(draftValue)?Math.floor(draftValue/BURN_TICK_MS)+' ticks':'';
      if(input.validity.valid&&input.value!=='')input.removeAttribute('aria-invalid');
      else input.setAttribute('aria-invalid','true');
      input.disabled=Boolean(this.state.busy);
    }
  }
}
