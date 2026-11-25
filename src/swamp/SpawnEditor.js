import { worldPointAt } from '../vfx/lab/ArenaAim.js';
import { ENEMIES } from '../vfx/lab/combatEnemy.js';
import { AMBUSH_DEFAULT_COOLDOWN_SECONDS, AMBUSH_MAX_COOLDOWN_SECONDS, AMBUSH_MAX_QUANTITY, SWAMP_AMBUSH, SWAMP_EMERGENCE, SWAMP_MOB_TERRAIN } from './mobConfig.js';
import { DECOY_TYPES, DEFAULT_DECOY, RANGE_LIMIT, SPAWN_SOURCE_ROUTE, SPAWN_TYPES, SpawnEdits, TRIGGER_RECTANGLE } from './spawnEdits.js';
import { gateLength } from './ReturnTrap.js';
import sourceSpawns from './spawns.json' with {type:'json'};

// Decoys use the existing event format so older drafts and source files stay valid.
const decoyType = spawn => spawn.decoyType??DEFAULT_DECOY;
const decoySettings = type => ({spawnType:'ambush',falseAlarm:true,decoyType:type});

const STORAGE_KEY='daa.swamp-v3.spawns.v1';
const signature=data=>JSON.stringify(data);
const coords=point=>point.x+', '+point.y;
const CREATURE_COLORS={slime:'#a5cb77',frost:'#abe6ff',big:'#d2a9e6',swift:'#ecce75',snake:'#d0b180',frog:'#91b8a0'};

function element(tag,text){
  const node=document.createElement(tag);
  if(text)node.textContent=text;
  return node;
}

function select(label,choices=[]){
  const input=element('select');
  input.setAttribute('aria-label',label);
  for(const [name,value] of choices)input.add(new Option(name,value));
  return input;
}

function section(title){
  const root=element('section');
  root.append(element('h3',title));
  return root;
}

function creaturePicker(choices,onSelect,signal){
  const root=element('div');
  root.className='swamp-editor-field swamp-creature-picker';
  const list=element('div');
  list.id='swamp-creature-options';
  list.className='swamp-creature-options';
  list.setAttribute('role','listbox');
  list.setAttribute('aria-label','Creature');
  list.hidden=true;

  function row(role){
    const button=element('button');
    button.className='swamp-creature-choice';
    button.type='button';
    if(role)button.setAttribute('role',role);
    const swatch=element('span');
    swatch.className='swamp-creature-swatch';
    swatch.setAttribute('aria-hidden','true');
    const label=element('span');
    button.append(swatch,label);
    return {button,label};
  }
  const trigger=row();
  trigger.button.setAttribute('aria-haspopup','listbox');
  trigger.button.setAttribute('aria-controls',list.id);
  trigger.button.setAttribute('aria-expanded','false');
  const options=choices.map(([name,kind])=>{
    const {button,label}=row('option');
    label.textContent=name;
    button.style.setProperty('--creature-color',CREATURE_COLORS[kind]);
    button.tabIndex=-1;
    button.addEventListener('click',()=>{
      close(true);
      if(kind!==selected)onSelect(kind);
    },{signal});
    list.append(button);
    return button;
  });
  let selected=choices[0][1];
  function close(returnFocus=false){
    list.hidden=true;
    trigger.button.setAttribute('aria-expanded','false');
    if(returnFocus)trigger.button.focus();
  }
  function open(){
    list.hidden=false;
    trigger.button.setAttribute('aria-expanded','true');
    options[choices.findIndex(([,kind])=>kind===selected)].focus();
  }
  trigger.button.addEventListener('click',()=>list.hidden?open():close(),{signal});
  root.addEventListener('focusout',event=>{
    if(!root.contains(event.relatedTarget))close();
  },{signal});
  document.addEventListener('pointerdown',event=>{
    if(!list.hidden&&!root.contains(event.target))close();
  },{capture:true,signal});
  root.addEventListener('keydown',event=>{
    const {key}=event;
    if(key==='Tab'&&!list.hidden){close(true);return;}
    const current=options.indexOf(event.target);
    if(current!==-1&&(key==='Enter'||key===' ')){
      event.preventDefault();
      options[current].click();
      return;
    }
    if(!['ArrowDown','ArrowUp','Home','End'].includes(key))return;
    if(list.hidden&&key!=='ArrowDown'&&key!=='ArrowUp')return;
    event.preventDefault();
    if(list.hidden){open();return;}
    const next=key==='Home'?0:key==='End'?options.length-1:
      Math.max(0,Math.min(options.length-1,Math.max(0,current)+(key==='ArrowDown'?1:-1)));
    options[next].focus();
  },{signal});
  root.append(element('span','Creature'),trigger.button,list);
  return {
    root,close,
    get open(){return !list.hidden;},
    set(kind,disabled){
      selected=kind;
      trigger.button.disabled=disabled;
      if(disabled)close();
      const name=choices.find(([,id])=>id===kind)[0];
      trigger.label.textContent=name;
      trigger.button.setAttribute('aria-label','Creature: '+name);
      trigger.button.style.setProperty('--creature-color',CREATURE_COLORS[kind]);
      options.forEach((button,i)=>button.setAttribute('aria-selected',String(choices[i][1]===kind)));
    },
  };
}

export class SpawnEditor {
  constructor(mobs,variant){
    this.mobs=mobs;
    this.edits=new SpawnEdits(mobs.baseSpawns(),mobs.terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH,variant);
    this.saved=sourceSpawns;
    this.listeners=new AbortController();
    const {signal}=this.listeners;
    this.selected='';
    this.mode='';
    this.companionGroup='';
    this.draft={spawnType:'proximity'};
    this.decoyDraft=decoySettings(DEFAULT_DECOY);
    this.creatures=Object.keys(SWAMP_MOB_TERRAIN).map(kind=>[ENEMIES[kind].label,kind]);

    this.root=element('aside');
    this.root.className='swamp-editor';
    this.root.setAttribute('aria-label','Swamp Editor');
    this.toggle=this.button('Swamp Editor',()=>this.setOpen(this.panel.hidden));
    this.toggle.setAttribute('aria-controls','swamp-editor-panel');
    this.toggle.setAttribute('aria-expanded','false');
    this.panel=element('div');
    this.panel.className='swamp-editor-panel';
    this.panel.id='swamp-editor-panel';
    this.panel.hidden=true;
    this.status=element('p');
    this.status.className='swamp-editor-status';
    this.status.setAttribute('role','status');
    this.draftStatus=element('output');
    this.draftStatus.className='swamp-editor-draft-status';

    this.advanced=element('details');
    this.advanced.append(element('summary','Advanced'));
    this.panel.append(this.status,this.draftStatus,this.createSpawns(),this.createChanges(),this.advanced);
    this.root.append(this.toggle,this.panel);
    document.body.append(this.root);

    this.load();
    this.render('Choose a creature or select a spawn.');
    void this.connectSource();
    const {game}=mobs.scene;
    game.canvas.addEventListener('pointerdown',event=>this.handleMapClick(event),{capture:true,signal});
    window.addEventListener('keydown',event=>this.handleEscape(event),{capture:true,signal});
  }

  button(label,action){
    const node=element('button',label);
    node.type='button';
    node.addEventListener('click',action,{signal:this.listeners.signal});
    return node;
  }

  checkbox(text,checked,action){
    const label=element('label');
    const input=element('input');
    input.type='checkbox';
    input.checked=checked;
    input.addEventListener('change',()=>action(input.checked),{signal:this.listeners.signal});
    label.append(input,' '+text);
    return {label,input};
  }

  field(label,input){
    const wrapper=element('label',label);
    wrapper.className='swamp-editor-field';
    wrapper.append(input);
    return wrapper;
  }

  range(label,field,restore){
    const root=element('div');
    root.className='swamp-editor-range';
    const inputs=['number','range'].map(type=>{
      const input=element('input');
      Object.assign(input,{type,min:'1',max:String(RANGE_LIMIT),step:'1'});
      input.setAttribute('aria-label',type==='range'?label+' slider':label+' px');
      input.addEventListener(type==='range'?'input':'change',()=>{
        if(!input.value||!input.checkValidity()){this.render('Enter a range from 1 to '+RANGE_LIMIT+' px.');return;}
        this.change({[field]:Number(input.value)});
      },{signal:this.listeners.signal});
      return input;
    });
    root.append(this.field(label+' (px)',inputs[0]),inputs[1]);
    if(restore)root.append(this.button('Use species default',()=>this.change({[field]:undefined})));
    return {root,inputs};
  }

  createSpawns(){
    const root=section('Encounter setup');
    const actions=element('div');
    actions.className='swamp-run-controls';
    this.choices=element('div');
    this.choices.className='swamp-run-controls';
    this.newSpawn=this.button('New Spawn',()=>this.startDraft());
    this.newDecoy=this.button('New Decoy',()=>this.startDecoy());
    this.creature=creaturePicker(this.creatures,kind=>this.change({kind,detectionRange:undefined}),this.listeners.signal);
    this.kindField=this.creature.root;
    this.draft.kind=this.creatures[0][1];
    this.spawnType=select('Spawn Type',Object.entries(SPAWN_TYPES).map(([id,label])=>[label,id]));
    this.spawnType.addEventListener('change',()=>this.change({spawnType:this.spawnType.value}),{signal:this.listeners.signal});
    this.spawnTypeField=this.field('Spawn Type',this.spawnType);
    this.decoySelect=select('Decoy Type',Object.entries(DECOY_TYPES).map(([id,label])=>[label,id]));
    this.decoySelect.addEventListener('change',()=>this.change({decoyType:this.decoySelect.value}),
      {signal:this.listeners.signal});
    this.decoyTypeField=this.field('Decoy Type',this.decoySelect);
    this.spawnInfo=element('p');
    this.spawnInfo.className='swamp-editor-info';
    this.detection=this.range('Aggro Range','detectionRange',true);
    this.triggerShape=select('Trigger Zone',[['Circle','circle'],['Rectangle','rectangle']]);
    this.triggerShape.addEventListener('change',()=>this.change({triggerShape:this.triggerShape.value}),
      {signal:this.listeners.signal});
    this.triggerShapeField=this.field('Trigger Zone',this.triggerShape);
    this.triggerRange=this.range('Radius','triggerRange',false);
    this.triggerDimensions=element('div');
    this.triggerDimensions.className='swamp-editor-range';
    this.triggerSize=['Width','Height'].map(dimension=>{
      const input=element('input');
      Object.assign(input,{type:'number',min:'1',max:String(RANGE_LIMIT),step:'1',required:true});
      input.addEventListener('change',()=>{
        if(!input.checkValidity()){this.render('Enter a size from 1 to '+RANGE_LIMIT+' px.');return;}
        this.change({['trigger'+dimension]:Number(input.value)});
      },{signal:this.listeners.signal});
      this.triggerDimensions.append(this.field(dimension+' (px)',input));
      return input;
    });
    this.vegetation=this.checkbox('Emerge from vegetation',false,checked=>this.change({vegetation:checked}));
    this.waterLeap=this.checkbox('Water Leap',false,checked=>this.change({waterLeap:checked}));
    this.emergenceLimit=element('input');
    Object.assign(this.emergenceLimit,{type:'number',min:'1',max:String(SWAMP_EMERGENCE.distanceLimit),step:'1',required:true});
    this.emergenceLimit.addEventListener('change',()=>{
      if(!this.emergenceLimit.checkValidity()){
        this.render('Choose an emergence limit from 1 to '+SWAMP_EMERGENCE.distanceLimit+' px.');
        return;
      }
      this.change({emergenceDistance:this.emergenceLimit.valueAsNumber});
    },{signal:this.listeners.signal});
    this.emergenceField=this.field('Emergence limit (px)',this.emergenceLimit);
    this.emergenceLength=element('output');
    this.landingWarning=element('p','Landing Point is blocked. The creature will only spawn if it can stand there.');
    this.landingWarning.className='swamp-editor-landing-warning';
    this.landingWarning.setAttribute('role','status');
    this.repeat=this.checkbox('Repeat',false,checked=>this.change({repeat:checked}));
    this.repeatMode=element('span');
    this.repeat.label.append(' · ',this.repeatMode);
    this.repeatCooldown=element('input');
    Object.assign(this.repeatCooldown,{type:'number',min:'1',max:String(AMBUSH_MAX_COOLDOWN_SECONDS),step:'1',required:true});
    this.repeatCooldown.addEventListener('change',()=>{
      if(!this.repeatCooldown.checkValidity()){this.render('Enter a cooldown from 1 to '+AMBUSH_MAX_COOLDOWN_SECONDS+' seconds.');return;}
      this.change({cooldownSeconds:this.repeatCooldown.valueAsNumber});
    },{signal:this.listeners.signal});
    this.repeatCooldownField=this.field('Cooldown (seconds)',this.repeatCooldown);
    this.quantity=element('input');
    Object.assign(this.quantity,{type:'number',min:'1',max:String(AMBUSH_MAX_QUANTITY),step:'1',required:true});
    this.quantity.addEventListener('change',()=>{
      if(!this.quantity.checkValidity()){this.render('Choose a quantity from 1 to '+AMBUSH_MAX_QUANTITY+'.');return;}
      this.change({quantity:this.quantity.valueAsNumber});
    },{signal:this.listeners.signal});
    this.quantityField=this.field('Quantity',this.quantity);
    this.trigger=this.button('Position Trigger Zone',()=>this.arm('triggerPoint','Click the center of the trigger zone.'));
    this.preview=this.button('Preview Ambush',()=>{
      const spawn=this.edits.get(this.selected);
      this.setMode('','Playing the ambush preview.');
      this.mobs.previewAmbush(this.edits.event(spawn));
    });
    this.finish=this.button('Finish',()=>this.finishEditing());
    this.gates=['A','B'].map(letter=>this.button('Move gate '+letter,()=>this.arm('gate'+letter,'Click gate '+letter+'.')));
    this.gateFields=element('div');
    this.gateFields.className='swamp-editor-range';
    this.gateLengths=['A','B'].map(letter=>{
      const input=element('input');
      Object.assign(input,{type:'number',min:'1',step:'1',required:true});
      const valid=()=>input.checkValidity()&&Number.isSafeInteger(input.valueAsNumber);
      input.addEventListener('input',()=>{
        if(valid())this.change({['gate'+letter+'Length']:input.valueAsNumber});
      },{signal:this.listeners.signal});
      input.addEventListener('change',()=>{
        if(!valid())this.render('Enter a positive gate length in pixels.');
      },{signal:this.listeners.signal});
      this.gateFields.append(this.field('Gate '+letter+' length (px)',input));
      return input;
    });
    this.returnAppearance=select('Emergence',[['Emerge to Landing','emerge'],['Spawn in Place','place']]);
    this.returnAppearance.addEventListener('change',()=>this.change({spawnInPlace:this.returnAppearance.value==='place'}),
      {signal:this.listeners.signal});
    this.returnAppearanceField=this.field('Emergence',this.returnAppearance);
    this.addButton=this.button('Add on map',()=>this.arm('add',this.draft.spawnType==='ambush'?'Click the Visual Origin.':
      this.draft.spawnType==='proximity'||this.draft.spawnInPlace?'Click walkable ground.':
        'Click the Visual Origin. A landing will be suggested.'));
    this.move=this.button('Move',()=>this.arm('move','Click walkable ground.'));
    this.companion=this.button('Add companion',()=>this.startDraft(this.edits.get(this.selected).encounterId));
    this.remove=this.button('Delete',()=>{
      const spawn=this.edits.get(this.selected);
      const grouped=!spawn.disabled&&this.edits.entries().some(entry=>
        entry.id!==spawn.id&&!entry.disabled&&entry.encounterId===spawn.encounterId&&spawn.encounterId);
      if(grouped&&!window.confirm('Remove this mob from its encounter?'))return;
      const error=this.edits.remove(this.selected);
      if(error){this.report(error);return;}
      this.save();
      const message='Change saved. Test changes to apply.';
      if(!this.edits.get(this.selected)){
        this.selected='';
        if(spawn.falseAlarm){this.startDecoy(message);return;}
      }
      this.setMode('',message);
    });
    const markers=this.checkbox('Show all spawn markers',true,()=>this.refreshDebug());
    this.spawnMarkers=markers.input;
    this.advanced.append(markers.label);
    const ranges=this.checkbox('Show ranges',true,()=>this.refreshDebug());
    this.ranges=ranges.input;
    const placement=element('div');
    placement.className='swamp-run-controls';
    placement.append(this.addButton,this.move,this.remove,this.companion,this.trigger,...this.gates,this.preview,this.finish);
    actions.append(this.newSpawn,this.newDecoy);
    root.append(actions,this.mobs.scene.swampCollisionControl,this.choices,this.spawnInfo,this.kindField,this.spawnTypeField,this.decoyTypeField,
      this.detection.root,this.triggerShapeField,this.triggerRange.root,this.triggerDimensions,
      this.quantityField,this.gateFields,this.returnAppearanceField,
      this.waterLeap.label,this.emergenceField,this.emergenceLength,this.landingWarning,this.repeat.label,this.repeatCooldownField,placement);
    this.advanced.append(this.vegetation.label,ranges.label);
    return root;
  }

  startDraft(group='',message){
    const parent=group?this.edits.get(this.selected):null;
    this.draft={kind:parent?.kind??this.creatures[0][1],spawnType:'proximity'};
    this.selected='';
    this.companionGroup=group;
    this.setMode('',message??(group?'Configure the companion, then click Add on map.':'Configure the mob, then click Add on map.'));
  }

  rememberDecoy(spawn){
    const {triggerShape,triggerRange,triggerWidth,triggerHeight,repeat,cooldownSeconds}=spawn;
    this.decoyDraft={...decoySettings(decoyType(spawn)),triggerShape,triggerRange,triggerWidth,triggerHeight,repeat,cooldownSeconds};
  }

  startDecoy(message='Configure the decoy, then click Add Decoy on map.'){
    const spawn=this.edits.get(this.selected);
    if(spawn?.falseAlarm)this.rememberDecoy(spawn);
    this.draft=this.decoyDraft;
    this.selected='';
    this.companionGroup='';
    this.setMode('',message);
  }

  finishEditing(){
    const spawn=this.edits.get(this.selected);
    if(!spawn)return;
    const error=spawn.disabled?'':this.edits.validate(spawn,spawn);
    if(error){this.report(error);return;}
    this.save();
    this.mobs.stopAmbushPreview();
    this.finishMarker=spawn.falseAlarm?this.edits.event(spawn).visualOrigin:{x:spawn.x,y:spawn.y};
    this.finishTimer?.remove();
    this.finishTimer=this.mobs.scene.time.delayedCall(700,()=>{
      this.finishMarker=null;
      this.refreshDebug();
    });
    if(!spawn.falseAlarm){
      this.startDraft('','Editing finished.');
      return;
    }
    this.startDecoy('Editing finished. Click Add Decoy on map to place another.');
  }

  arm(mode,message){
    if(this.mode===mode)this.setMode('','Operation cancelled.');
    else this.setMode(mode,message+' Esc cancels.');
  }

  change(patch){
    this.pendingAmbushOrigin=null;
    if(this.mode==='ambushLanding')this.mode='';
    if(patch.spawnType){
      this.mode='';
      const current=this.edits.get(this.selected)??this.draft;
      if(patch.spawnType==='ambush'){
        patch.triggerShape=current.triggerShape??'circle';
      }
    }
    if((patch.kind&&patch.kind!=='frost')||(patch.spawnType&&patch.spawnType!=='ambush')||patch.falseAlarm)
      patch.waterLeap=false;
    if(!this.selected){
      Object.assign(this.draft,patch);
      this.render(this.draft.falseAlarm?'Click Add Decoy on map when ready.':'Click Add on map when ready.');
      return;
    }
    const error=this.edits.configure(this.selected,patch);
    if(!error){
      const spawn=this.edits.get(this.selected);
      if(spawn.falseAlarm)this.rememberDecoy(spawn);
      this.save();
    }
    this.render(error||'Change saved. Test changes to apply.');
  }

  createChanges(){
    const root=section('Changes');
    const actions=element('div');
    actions.className='swamp-run-controls';
    this.sourceButton=this.button('Save to Source',()=>this.reviewSource());
    this.sourceHint=element('small','Run Test changes before saving to source.');
    this.sourceHint.className='swamp-editor-info';
    actions.append(this.button('Test changes',()=>this.apply('Changes applied for testing.')),
      this.button('Discard changes',()=>{
        if(this.savingSource)return;
        const saved=signature(this.saved);
        if((signature(this.edits.data())!==saved||signature(this.appliedData)!==saved)&&
          !window.confirm('Discard changes and restore the saved spawns?'))return;
        this.edits.restore();
        this.edits.load(this.saved);
        this.selected='';
        this.companionGroup='';
        this.apply('Saved encounters restored.');
      }),this.button('Export JSON',()=>this.export()),this.sourceButton);
    this.sourceReview=element('dialog');
    this.sourceReview.className='swamp-source-review';
    this.sourceReview.setAttribute('aria-label','Review spawn changes');
    this.sourceSummary=element('ul');
    this.sourceReview.append(element('h3','Save changes to the project?'),this.sourceSummary,
      this.button('Confirm save',()=>void this.writeSource()),this.button('Cancel',()=>this.sourceReview.close()));
    root.append(actions,this.sourceHint,this.sourceReview);
    return root;
  }

  get open(){return !this.panel.hidden;}
  get showSpawns(){return this.open&&this.spawnMarkers.checked;}
  get showRanges(){return this.open&&this.ranges.checked;}

  setOpen(open){
    this.panel.hidden=!open;
    this.toggle.setAttribute('aria-expanded',String(open));
    if(!open){
      this.creature.close();
      this.mobs.stopAmbushPreview();
      this.finishMarker=null;
      this.finishTimer?.remove();
      this.setMode('','Choose a creature or select a spawn.');
      document.getElementById('game')?.focus({preventScroll:true});
    }
    this.refreshDebug();
  }

  choose(id){
    this.selected=id;
    this.companionGroup='';
    const spawn=this.edits.get(id);
    this.setMode('',spawn.spawnType==='proximity'?'Spawn selected.':spawn.falseAlarm?'Click the green origin ring to move it.':
      spawn.spawnType==='return-trap'&&spawn.spawnInPlace?'Click the spawn point to move it.':
      'Click the green origin ring or the landing cross to move it.');
  }

  setMode(mode,message){
    this.mode=mode;
    if(mode!=='ambushLanding')this.pendingAmbushOrigin=null;
    this.rejectedPoint=null;
    this.render(message);
  }

  handleEscape(event){
    const {scene}=this.mobs;
    if(event.key!=='Escape'||event.repeat||event.defaultPrevented||!this.open||scene.swampRun?.blocking)return;
    const canvas=scene.game.canvas;
    // Keep the browser's native Escape behavior for dialogs.
    if(canvas.ownerDocument.querySelector('dialog[open]'))return;
    if(this.creature?.open){
      event.preventDefault();
      event.stopImmediatePropagation();
      this.creature.close(true);
      return;
    }
    if(!this.mode&&!this.selected&&!this.companionGroup&&!this.choices.childElementCount)return;
    const editingField=event.target?.closest?.('input, select, textarea, [contenteditable]');
    if(editingField&&!this.root.contains(editingField))return;
    event.stopImmediatePropagation();
    this.mobs.stopAmbushPreview();
    if((this.edits.get(this.selected)??this.draft).falseAlarm)this.startDecoy('Selection cleared.');
    else this.startDraft('','Selection cleared.');
    if(!editingField){
      event.preventDefault();
      canvas.closest('#game')?.focus({preventScroll:true});
    }
  }

  report(message){this.status.textContent=message;}

  render(message){
    this.choices.replaceChildren();
    const spawn=this.edits.get(this.selected);
    const config=spawn??this.draft;
    const decoy=Boolean(config.falseAlarm);
    const ambush=config.spawnType!=='proximity';
    const hasZone=config.spawnType==='ambush';
    const returnTrap=config.spawnType==='return-trap';
    const rectangle=config.triggerShape==='rectangle';
    const protectedSpawn=spawn&&this.edits.isProtected(spawn);
    const kind=config.kind??this.creatures[0][1];
    const color=CREATURE_COLORS[kind];
    this.newSpawn.setAttribute('aria-pressed',String(!decoy));
    this.newDecoy.setAttribute('aria-pressed',String(decoy));
    this.spawnType.value=config.spawnType;
    this.creature.set(kind,Boolean(protectedSpawn));
    this.spawnType.disabled=Boolean(protectedSpawn);
    this.kindField.hidden=this.spawnTypeField.hidden=decoy;
    if(this.kindField.hidden)this.creature.close();
    this.decoyTypeField.hidden=!decoy;
    this.decoySelect.value=decoyType(config);
    this.decoySelect.disabled=Boolean(protectedSpawn);
    const creature=decoy?'Decoy · '+DECOY_TYPES[decoyType(config)]:ENEMIES[spawn?.kind]?.label;
    this.spawnInfo.textContent=spawn
      ?'Editing: '+creature+' · '+(spawn.id===SWAMP_AMBUSH.id?'East bush':spawn.id)+(spawn.disabled?' (disabled)':'')
      :decoy?'New Decoy':'New Spawn'+(this.companionGroup?' · Companion to '+this.companionGroup:'');
    this.spawnInfo.classList.toggle('swamp-creature-heading',Boolean(spawn&&!spawn.falseAlarm));
    this.spawnInfo.style.setProperty('--creature-color',color);
    const inPlace=returnTrap&&config.spawnInPlace;
    this.gateFields.hidden=this.returnAppearanceField.hidden=!returnTrap;
    this.returnAppearance.disabled=Boolean(protectedSpawn);
    this.returnAppearance.value=inPlace?'place':'emerge';
    for(const [i,letter] of ['A','B'].entries()){
      const input=this.gateLengths[i];
      input.disabled=Boolean(protectedSpawn);
      const length=config['gate'+letter+'Length']??gateLength(SWAMP_AMBUSH.returnTrap,letter);
      if(input.valueAsNumber!==length)input.value=length;
    }
    this.vegetation.label.hidden=!returnTrap||inPlace;
    this.waterLeap.label.hidden=kind!=='frost'||!hasZone||Boolean(config.falseAlarm);
    this.waterLeap.input.disabled=Boolean(protectedSpawn||spawn?.disabled);
    this.waterLeap.input.checked=Boolean(config.waterLeap);
    this.vegetation.input.checked=Boolean(config.vegetation);
    this.emergenceField.hidden=!returnTrap||inPlace;
    this.emergenceLimit.disabled=Boolean(protectedSpawn);
    this.emergenceLimit.value=config.emergenceDistance??SWAMP_EMERGENCE.maxDistance;
    this.repeat.label.hidden=!ambush;
    this.repeat.input.disabled=this.repeatCooldown.disabled=Boolean(protectedSpawn);
    this.repeat.input.checked=Boolean(config.repeat);
    this.repeatMode.textContent=config.repeat?'After cooldown':'Once per Run';
    this.repeatCooldownField.hidden=!ambush||!config.repeat;
    this.repeatCooldown.value=config.cooldownSeconds??AMBUSH_DEFAULT_COOLDOWN_SECONDS;
    this.quantityField.hidden=!ambush||decoy;
    this.quantity.disabled=Boolean(protectedSpawn);
    this.quantity.value=config.quantity??1;
    this.emergenceLength.hidden=!spawn||!ambush||config.falseAlarm||inPlace;
    if(!this.emergenceLength.hidden){
      const {visualOrigin}=this.edits.event(spawn);
      const length=Math.hypot(spawn.x-visualOrigin.x,spawn.y-visualOrigin.y);
      this.emergenceLength.textContent='Origin to landing: '+Number(length.toFixed(1))+' px';
    }
    this.landingWarning.hidden=!(spawn&&hasZone&&!spawn.falseAlarm&&!this.edits.terrain[kind].clear(spawn));
    this.detection.root.hidden=ambush;
    for(const input of this.detection.inputs)input.value=config.detectionRange??ENEMIES[kind].detectionRange;
    this.triggerShapeField.hidden=!hasZone;
    this.triggerShape.value=rectangle?'rectangle':'circle';
    this.triggerRange.root.hidden=!hasZone||rectangle;
    for(const input of this.triggerRange.inputs)input.value=config.triggerRange??SWAMP_AMBUSH.trigger.radius;
    this.triggerDimensions.hidden=!hasZone||!rectangle;
    this.triggerSize[0].value=config.triggerWidth??TRIGGER_RECTANGLE.width;
    this.triggerSize[1].value=config.triggerHeight??TRIGGER_RECTANGLE.height;
    this.addButton.hidden=Boolean(spawn);
    this.addButton.textContent=decoy?'Add Decoy on map':'Add on map';
    const canMove=Boolean(spawn&&!protectedSpawn&&!spawn.disabled);
    this.preview.hidden=!(spawn&&ambush);
    this.finish.hidden=!spawn;
    for(const [button,mode,visible] of [
      [this.move,'move',canMove&&!config.falseAlarm],
      [this.trigger,'triggerPoint',canMove&&hasZone],
      ...this.gates.map((button,i)=>[button,i?'gateB':'gateA',canMove&&config.spawnType==='return-trap']),
    ]){
      button.hidden=!visible;
      button.setAttribute('aria-pressed',String(visible&&this.mode===mode));
    }
    this.addButton.setAttribute('aria-pressed',String(this.mode==='add'));
    this.move.textContent=inPlace?'Move spawn point':ambush?'Move landing':'Move';
    this.remove.hidden=!spawn||protectedSpawn||this.edits.isAmbush(spawn);
    this.remove.textContent=spawn?.disabled?'Enable':'Delete';
    this.companion.hidden=!canMove||ambush||!spawn.encounterId;
    this.root.dataset.mode=this.mode;
    this.updateDraftStatus();
    this.report(message);
    this.refreshDebug();
  }

  refreshDebug(){this.mobs.syncEditorDebug();}

  handleMapClick(event){
    if(!this.open||event.button!==0||this.mobs.scene.swampRun?.blocking)return;
    const {game,cameras}=this.mobs.scene;
    const point=worldPointAt(game.canvas,cameras.main,event.clientX,event.clientY);
    if(!point)return;
    const tile={x:Math.round(point.x),y:Math.round(point.y)};
    const targets=this.mode?[]:this.mapTargets(tile);
    if(!this.mode&&!targets.length)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(!this.mode){
      this.choices.replaceChildren();
      if(targets.length===1)targets[0].action();
      else{
        this.report('Choose a marker at this position.');
        this.choices.append(...targets.map(({label,action})=>this.button(label,action)));
      }
      return;
    }
    const patch=this.mode==='triggerPoint'?{triggerPoint:tile,triggerShape:this.triggerShape.value}:{[this.mode]:tile};
    const previous=this.edits.get(this.selected);
    const result=this.placeMarker(tile,patch);
    if(result.needsLanding)return;
    if(result.error){
      const origin=this.pendingAmbushOrigin??(previous&&previous.spawnType!=='proximity'&&!previous.falseAlarm&&this.mode==='move'
        ?this.edits.event(previous).visualOrigin:null);
      this.rejectedPoint={...tile,origin};
      this.report(result.error+' Choose another point or press Esc.');
      this.refreshDebug();
      return;
    }
    this.selected=result.id;
    this.companionGroup='';
    this.save();
    this.setMode('','Spawn saved. Test changes to apply.');
  }

  placeMarker(tile,patch){
    const {mode,edits,selected,draft}=this;
    const placingLanding=mode==='ambushLanding';
    if(mode==='add'||placingLanding){
      const origin=placingLanding?this.pendingAmbushOrigin:tile;
      const result=edits.add(draft.kind,draft.falseAlarm?'':this.companionGroup,origin,draft,
        new Set([...this.mobs.run.firedTraps,...this.mobs.run.ambushReadyAt.keys()]),placingLanding?tile:undefined);
      if(result.needsLanding){
        this.pendingAmbushOrigin=origin;
        this.setMode('ambushLanding','Click the Landing Point. Esc cancels.');
      }
      return result;
    }
    return {id:selected,error:mode==='move'?edits.move(selected,tile):edits.configure(selected,patch)};
  }

  mapTargets(point){
    const targets=[];
    const entries=this.edits.entries().filter(spawn=>!spawn.marker);
    const near=mark=>Math.hypot(mark.x-point.x,mark.y-point.y)<14;
    for(const spawn of entries){
      const selected=spawn.id===this.selected;
      if(!selected&&!this.showSpawns)continue;
      const ambush=spawn.spawnType!=='proximity';
      const origin=ambush&&this.edits.event(spawn).visualOrigin;
      if(selected&&ambush&&!spawn.disabled&&!this.edits.isProtected(spawn)){
        const inPlace=spawn.spawnType==='return-trap'&&spawn.spawnInPlace;
        if(!inPlace&&near(origin))targets.push({label:'Visual Origin',action:()=>this.arm('visualOrigin','Click the hiding spot.')});
        if(!spawn.falseAlarm&&near(spawn))
          targets.push({label:inPlace?'Spawn Point':'Landing Point',action:()=>this.arm('move','Click walkable ground.')});
      }else if(near(spawn.falseAlarm?origin:spawn)){
        const label=spawn.falseAlarm?'Decoy':ENEMIES[spawn.kind].label;
        targets.push({label:label+' · '+spawn.id,action:()=>this.choose(spawn.id)});
      }
    }
    return targets;
  }

  apply(message){
    this.applied=this.edits.snapshot();
    this.appliedData=structuredClone(this.edits.data());
    this.save();
    this.mobs.scene.swampRun?.respawn({testing:true});
    this.setMode('',message);
    document.getElementById('game')?.focus({preventScroll:true});
  }

  load(){
    this.edits.load(this.saved);
    this.appliedData=this.edits.data();
    this.applied=this.edits.snapshot();
    try{
      const local=JSON.parse(localStorage.getItem(STORAGE_KEY));
      const legacy=local?.map==='swamp-v3-large'&&signature(this.saved)===signature(sourceSpawns)&&
        !this.saved.additions.length&&!this.saved.disabled.length&&!Object.keys(this.saved.positions).length&&
        !Object.keys(this.saved.settings).length&&this.saved.ambushVariant===SWAMP_AMBUSH.defaultVariant;
      const sameBase=local?.base===signature(this.saved);
      if(sameBase&&local.applied){
        this.edits.restore();
        this.edits.load(local.applied);
        this.appliedData=this.edits.data();
        this.applied=this.edits.snapshot();
      }
      if(legacy||sameBase){
        this.edits.restore();
        this.edits.load(legacy?local:local.draft);
      }
    }
    catch{/* The editor still works in memory. */}
  }

  save(){
    try{
      const draft=this.edits.data(),base=signature(this.saved);
      if(signature(draft)===base&&signature(this.appliedData)===base)localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY,JSON.stringify({base,draft,applied:this.appliedData}));
    }
    catch{/* In-memory edit. */}
  }

  updateDraftStatus(){
    const draft=signature(this.edits.data());
    this.sourceHint.hidden=draft===signature(this.appliedData);
    const entries=new Map(this.edits.entries().map(spawn=>[spawn.id,spawn]));
    const point=spawn=>spawn.falseAlarm?spawn.visualOrigin??spawn:spawn;
    this.appliedOnlyMarkers=[...this.applied.spawns,...this.applied.ambushes].flatMap(applied=>{
      const edited=entries.get(applied.id);
      const before=point(applied),after=edited&&point(edited);
      return !after||edited.disabled||before.x!==after.x||before.y!==after.y?[before]:[];
    });
    if(draft!==signature(this.appliedData)){
      const markers=this.appliedOnlyMarkers.length?' Amber rings mark previous applied positions.':'';
      this.draftStatus.textContent='Draft changed · Use Test changes to apply.'+markers;
    }
    else this.draftStatus.textContent=draft===signature(this.saved)?'Applied · Saved to source.':'Applied · Pending Save to Source.';
  }

  async sourceRequest(method='GET',body){
    const response=await fetch(SPAWN_SOURCE_ROUTE,{method,cache:'no-store',signal:this.listeners.signal,
      headers:method==='PUT'?{'Content-Type':'application/json','X-Swamp-Spawns-Token':this.source.token}:
        {Accept:'application/json'},body:body&&JSON.stringify(body)});
    if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('Use a direct local Vite connection.');
    const result=await response.json();
    if(!response.ok)throw new Error(result.error??'HTTP '+response.status);
    return result;
  }

  async connectSource(){
    if(!['localhost','127.0.0.1','[::1]'].includes(location.hostname))return;
    try{
      const source=await this.sourceRequest();
      if(signature(source.data)!==signature(this.saved))throw new Error('The source changed. Reload before saving.');
      this.source=source;
    }catch(error){this.sourceError=error.message;}
  }

  describeEdits(model,spawn){
    if(spawn.marker)return coords(spawn);
    const group=spawn.encounterId??'independent';
    const details=[...(spawn.falseAlarm?['Decoy',DECOY_TYPES[decoyType(spawn)]]:[ENEMIES[spawn.kind].label,SPAWN_TYPES[spawn.spawnType]]),
      group,spawn.disabled?'disabled':'enabled'];
    if(!spawn.falseAlarm)details.push((spawn.spawnType==='proximity'?'Position ':'Landing ')+coords(spawn));
    if(spawn.spawnType!=='proximity'){
      const event=model.event(spawn);
      details.push(event.repeat?`Repeat after ${event.cooldownSeconds} s`:'Once per Run');
      if(!spawn.falseAlarm)details.push('Quantity '+event.quantity);
      details.push('Origin '+coords(event.visualOrigin));
      if(event.waterLeap)details.push('Water Leap');
      else if(spawn.spawnType==='return-trap')details.push(event.spawnInPlace?'Spawn in Place':
        'Emerge to Landing ('+event.emergenceDistance+' px, '+(event.vegetation?'vegetation exit':'clear path')+')');
      if(spawn.spawnType==='return-trap')details.push('Gate A '+coords(event.a)+' · '+event.gateALength+' px',
        'Gate B '+coords(event.b)+' · '+event.gateBLength+' px');
      else{
        const {trigger}=event;
        details.push('Trigger '+coords(trigger)+' '+(trigger.shape==='rectangle'?trigger.width+' × '+trigger.height:
          'radius '+trigger.radius)+' px');
      }
    }else if(spawn.detectionRange!==undefined)details.push('Aggro '+spawn.detectionRange+' px');
    return details.join(' · ');
  }

  reviewSource(){
    if(this.savingSource)return;
    const data=this.edits.data(),draft=signature(data);
    if(draft!==signature(this.appliedData)){this.report('Run Test changes before saving to source.');return;}
    if(!this.source){this.report(this.sourceError??'Source saving requires a direct local Vite connection.');return;}
    if(draft===signature(this.saved)){this.report('No changes to save.');return;}
    const saved=new SpawnEdits(this.edits.originals,this.edits.terrain,this.edits.geometry,SWAMP_AMBUSH);
    saved.load(this.saved);
    const before=new Map(saved.entries().map(spawn=>[spawn.id,this.describeEdits(saved,spawn)]));
    const after=new Map(this.edits.entries().map(spawn=>[spawn.id,this.describeEdits(this.edits,spawn)]));
    this.sourceSummary.replaceChildren();
    for(const id of new Set([...before.keys(),...after.keys()])){
      const previous=before.get(id),next=after.get(id);
      if(previous!==next)this.sourceSummary.append(element('li',id+' · '+
        (!previous?'Added: '+next:!next?'Removed: '+previous:previous+' → '+next)));
    }
    if(!this.sourceSummary.childElementCount)this.sourceSummary.append(element('li','Save the current editor settings.'));
    this.pendingSource=data;
    this.sourceReview.showModal();
  }

  async writeSource(){
    if(!this.sourceReview.open||this.savingSource)return;
    this.sourceReview.close();
    this.savingSource=true;
    this.report('Writing the spawn file…');
    try{
      this.source=await this.sourceRequest('PUT',{revision:this.source.revision,data:this.pendingSource});
      this.saved=this.source.data;
      this.save();
      this.updateDraftStatus();
      this.report('Spawn changes saved to source.');
    }catch(error){this.report('Save failed. '+error.message);}
    finally{this.savingSource=false;}
  }

  export(){
    const url=URL.createObjectURL(new Blob([JSON.stringify(this.edits.data(),null,2)+'\n'],{type:'application/json'}));
    const link=element('a');
    link.href=url;
    link.download='swamp-v3-spawns.json';
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    this.report('Spawn changes exported.');
  }

  destroy(){
    this.listeners.abort();
    this.finishTimer?.remove();
    this.root.remove();
  }
}
