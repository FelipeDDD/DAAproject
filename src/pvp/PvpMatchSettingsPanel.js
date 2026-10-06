import { DEFAULT_MATCH_SETTINGS,DEFAULT_MATCH_TIME_LIMIT_MS,MATCH_DURATION_MINUTES_LIMITS,MATCH_SETTING_LIMITS,
  matchDurationMinutesToMs,matchSettingsFor,normalizeMatchSettings,effectiveMatchSettings } from './matchSettings.js';

const fields=[
  {key:'maxHp',label:'Max HP',step:1},
  {key:'damage',label:'Damage',step:1},
  {key:'attackCooldownMs',label:'Attack Speed (cooldown ms)',step:50},
  {key:'movementSpeedMultiplier',label:'Movement Speed (%)',step:5,scale:100},
];

// Reuses the lobby's existing modal/input lock; no extra transport or timers.
export class PvpMatchSettingsPanel {
  constructor({parent,documentRef,playerId,onSave}){
    Object.assign(this,{playerId,onSave});this.inputs=new Map();this.overrides=new Map();this.saving=false;
    const node=(tag,text='')=>{const n=documentRef.createElement(tag);n.textContent=text;return n;};
    this.root=node('section');this.root.className='pvp-match-settings';this.root.hidden=true;
    this.root.setAttribute('aria-label','Match Settings');parent.append(this.root);
    this.root.append(node('h3','Match Settings'));
    this.notice=node('p');this.root.append(this.notice);
    for(const field of fields){
      const label=node('label',field.label),input=node('input'),limits=MATCH_SETTING_LIMITS[field.key],scale=field.scale??1;
      input.type='number';input.min=String(limits.min*scale);input.max=String(limits.max*scale);input.step=String(field.step);
      input.setAttribute('aria-label',field.label);label.append(input);this.root.append(label);
      this.inputs.set(field.key,input);
    }
    const durationLabel=node('label','Match Duration (minutes)');this.durationInput=node('input');
    this.durationInput.type='number';this.durationInput.min=String(MATCH_DURATION_MINUTES_LIMITS.min);
    this.durationInput.max=String(MATCH_DURATION_MINUTES_LIMITS.max);this.durationInput.step='1';
    this.durationInput.setAttribute('aria-label','Match Duration (minutes)');durationLabel.append(this.durationInput);this.root.append(durationLabel);
    this.root.append(node('h3','Team Overrides'));
    const teams=node('div');teams.className='pvp-settings-teams';this.root.append(teams);
    for(const team of ['A','B']){
      const section=node('section');section.className='pvp-settings-team';section.setAttribute('data-team',team);
      section.append(node('h4',`Team ${team}`));teams.append(section);
      for(const field of fields){
        const label=node('label',field.label),controls=node('span');controls.className='pvp-override-controls';
        const mode=node('select'),inherit=node('option','Use Global'),custom=node('option','Custom');
        inherit.value='global';custom.value='custom';mode.append(inherit,custom);mode.value='global';
        mode.setAttribute('aria-label',`Team ${team} ${field.label} inheritance`);
        const input=node('input'),limits=MATCH_SETTING_LIMITS[field.key],scale=field.scale??1;
        input.type='number';input.min=String(limits.min*scale);input.max=String(limits.max*scale);input.step=String(field.step);
        input.setAttribute('aria-label',`Team ${team} ${field.label}`);
        mode.addEventListener('change',()=>{
          if(mode.value==='custom'&&!input.value){
            const global=Number(this.inputs.get(field.key).value);input.value=String(global);
          }
          this.update(this.match,this.busy);
        });
        controls.append(mode,input);label.append(controls);section.append(label);
        this.overrides.set(`${team}.${field.key}`,{team,field,mode,input});
      }
    }
    this.error=node('p');this.error.className='pvp-settings-error';this.error.setAttribute('role','status');this.root.append(this.error);
    const actions=node('div');actions.className='pvp-settings-actions';this.root.append(actions);
    const button=(text,action)=>{const n=node('button',text);n.type='button';n.className='arena-action arena-action-secondary';
      n.addEventListener('click',action);actions.append(n);return n;};
    this.resetButton=button('Reset Defaults',()=>{if(this.canEdit&&!this.busy&&!this.saving){
      this.fill(DEFAULT_MATCH_SETTINGS);this.durationInput.value=String(DEFAULT_MATCH_TIME_LIMIT_MS/60_000);
      this.error.textContent='';this.update(this.match,this.busy);
    }});
    this.saveButton=button('Save',()=>void this.save());
    this.closeButton=button('Close',()=>this.close());
    this.update(undefined);
  }
  fill(settings){
    for(const field of fields)this.inputs.get(field.key).value=String(settings[field.key]*(field.scale??1));
    for(const {team,field,mode,input} of this.overrides.values()){
      const value=settings.teamOverrides?.[team]?.[field.key];mode.value=value==null?'global':'custom';
      input.value=value==null?'':String(value*(field.scale??1));
    }
  }
  update(match,busy=false){
    this.match=match;this.busy=busy;this.canEdit=match?.state==='waiting'&&match.hostPlayerId===this.playerId;
    const settings=matchSettingsFor(match),signature=JSON.stringify(settings);
    if(signature!==this.signature){this.signature=signature;this.fill(settings);}
    const durationMs=match?.timeLimitMs??DEFAULT_MATCH_TIME_LIMIT_MS;
    if(durationMs!==this.durationSignature){this.durationSignature=durationMs;this.durationInput.value=String(durationMs/60_000);}
    this.notice.textContent=this.canEdit?'Global rules apply unless a team field is overridden. Rules are locked when the round starts.':'Only the host can change these settings.';
    for(const input of this.inputs.values())input.disabled=this.root.hidden||!this.canEdit||busy||this.saving;
    this.durationInput.disabled=this.root.hidden||!this.canEdit||busy||this.saving;
    for(const {field,mode,input} of this.overrides.values()){
      mode.disabled=this.root.hidden||!this.canEdit||busy||this.saving;
      input.hidden=mode.value!=='custom';input.disabled=mode.disabled||input.hidden;
      input.placeholder=String(effectiveMatchSettings(match)[field.key]*(field.scale??1));
    }
    for(const button of [this.resetButton,this.saveButton]){button.hidden=!this.canEdit;button.disabled=this.root.hidden||!this.canEdit||busy||this.saving;}
    this.closeButton.disabled=this.root.hidden||this.saving;
  }
  open(){
    this.error.textContent='';this.fill(matchSettingsFor(this.match));this.root.hidden=false;
    this.update(this.match,this.busy);
    (this.canEdit?this.inputs.get('maxHp'):this.closeButton).focus();
  }
  close(){this.root.hidden=true;this.update(this.match,this.busy);}
  async save(){
    if(!this.canEdit||this.busy||this.saving)return;
    let matchSettings,timeLimitMs;
    try{
      const teamOverrides={A:{},B:{}};
      for(const {team,field,mode,input} of this.overrides.values())if(mode.value==='custom')
        teamOverrides[team][field.key]=Number(input.value)/(field.scale??1);
      matchSettings=normalizeMatchSettings({...Object.fromEntries(fields.map(field=>
        [field.key,Number(this.inputs.get(field.key).value)/(field.scale??1)])),teamOverrides});
      timeLimitMs=matchDurationMinutesToMs(Number(this.durationInput.value));
    }
    catch(error){this.error.textContent=error.message;return;}
    this.saving=true;this.update(this.match,this.busy);
    try{if(await this.onSave(matchSettings,timeLimitMs))this.close();else this.error.textContent='Settings were not saved. Check the lobby status.';}
    finally{this.saving=false;this.update(this.match,this.busy);}
  }
  destroy(){this.root.remove();}
}
