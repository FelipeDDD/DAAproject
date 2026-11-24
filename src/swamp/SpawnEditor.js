import { worldPointAt } from '../vfx/lab/ArenaAim.js';
import { ENEMIES } from '../vfx/lab/combatEnemy.js';
import { SWAMP_AMBUSH, SWAMP_MOB_TERRAIN } from './mobConfig.js';
import { RANGE_LIMIT, SPAWN_TYPES, SpawnEdits, TRIGGER_RECTANGLE } from './spawnEdits.js';

const STORAGE_KEY='daa.swamp-v3.spawns.v1';

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

export class SpawnEditor {
  constructor(mobs,variant){
    this.mobs=mobs;
    this.edits=new SpawnEdits(mobs.baseSpawns(),mobs.terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH,variant);
    this.listeners=new AbortController();
    const {signal}=this.listeners;
    this.selected='';
    this.mode='';
    this.companionGroup='';
    this.draft={spawnType:'proximity'};
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

    this.advanced=element('details');
    this.advanced.append(element('summary','Advanced'));
    this.panel.append(this.status,this.createSpawns(),this.createChanges(),this.advanced);
    this.root.append(this.toggle,this.panel);
    document.body.append(this.root);

    this.load();
    this.applied=this.edits.snapshot();
    this.render('Choose a creature or select a spawn.');
    const {game}=mobs.scene;
    game.canvas.addEventListener('pointerdown',event=>this.handleMapClick(event),{capture:true,signal});
    window.addEventListener('keydown',event=>{
      if(event.key!=='Escape'||!this.mode||mobs.scene.swampRun?.blocking)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.setMode('','Operation cancelled.');
      document.getElementById('game')?.focus({preventScroll:true});
    },{capture:true,signal});
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
    this.newMob=this.button('Add mob',()=>this.startDraft());
    this.creature=select('Creature',this.creatures);
    this.creature.addEventListener('change',()=>this.change({kind:this.creature.value,detectionRange:undefined}),{signal:this.listeners.signal});
    this.kindField=this.field('Creature',this.creature);
    this.draft.kind=this.creature.value;
    this.spawnType=select('Spawn Type',Object.entries(SPAWN_TYPES).map(([id,label])=>[label,id]));
    this.spawnType.addEventListener('change',()=>this.change({spawnType:this.spawnType.value}),{signal:this.listeners.signal});
    this.ambushEvent=select('Ambush Event',[...this.creatures,['False Alarm','false-alarm']]);
    this.ambushEvent.addEventListener('change',()=>{
      const event=this.ambushEvent.value;
      this.change(event==='false-alarm'?{falseAlarm:true}:{kind:event,falseAlarm:false});
    },{signal:this.listeners.signal});
    this.ambushEventField=this.field('Ambush Event',this.ambushEvent);
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
    this.trigger=this.button('Position Trigger Zone',()=>this.arm('triggerPoint','Click the center of the trigger zone.'));
    this.preview=this.button('Preview Ambush',()=>{
      const spawn=this.edits.get(this.selected);
      this.setMode('','Playing the ambush preview.');
      this.mobs.previewAmbush(this.edits.event(spawn));
    });
    this.gates=['A','B'].map(letter=>this.button('Move gate '+letter,()=>this.arm('gate'+letter,'Click gate '+letter+'.')));
    this.addButton=this.button('Add on map',()=>this.arm('add',this.draft.spawnType==='proximity'
      ?'Click walkable ground.':'Click the Visual Origin. A landing will be suggested.'));
    this.move=this.button('Move',()=>this.arm('move','Click walkable ground.'));
    this.companion=this.button('Add companion',()=>this.startDraft(this.edits.get(this.selected).encounterId));
    this.remove=this.button('Delete',()=>{
      const spawn=this.edits.get(this.selected);
      const grouped=!spawn.disabled&&this.edits.entries().some(entry=>
        entry.id!==spawn.id&&!entry.disabled&&entry.encounterId===spawn.encounterId&&spawn.encounterId);
      if(grouped&&!window.confirm('Remove this mob from its encounter?'))return;
      const error=this.edits.remove(this.selected);
      if(error){this.report(error);return;}
      if(!this.edits.get(this.selected))this.selected='';
      this.save();
      this.setMode('','Change saved. Test changes to apply.');
    });
    const markers=this.checkbox('Show all spawn markers',true,()=>this.refreshDebug());
    this.spawnMarkers=markers.input;
    this.advanced.append(markers.label);
    const ranges=this.checkbox('Show ranges',true,()=>this.refreshDebug());
    this.ranges=ranges.input;
    const placement=element('div');
    placement.className='swamp-run-controls';
    placement.append(this.addButton,this.move,this.remove,this.companion,this.trigger,...this.gates,this.preview);
    actions.append(this.newMob);
    root.append(actions,this.choices,this.spawnInfo,this.kindField,this.field('Spawn Type',this.spawnType),
      this.ambushEventField,this.detection.root,this.triggerShapeField,this.triggerRange.root,this.triggerDimensions,placement);
    this.advanced.append(this.vegetation.label,ranges.label);
    return root;
  }

  startDraft(group=''){
    this.draft={kind:this.edits.get(this.selected)?.kind??this.creatures[0][1],spawnType:'proximity'};
    this.selected='';
    this.companionGroup=group;
    this.setMode('',group?'Configure the companion, then click Add on map.':'Configure the mob, then click Add on map.');
  }

  arm(mode,message){
    if(this.mode===mode)this.setMode('','Operation cancelled.');
    else this.setMode(mode,message+' Esc cancels.');
  }

  change(patch){
    if(patch.spawnType){
      this.mode='';
      if(patch.spawnType==='ambush'){
        const current=this.edits.get(this.selected)??this.draft;
        patch.triggerShape=current.triggerShape??'circle';
        patch.vegetation=current.vegetation??true;
      }else{
        const current=this.edits.get(this.selected)??this.draft;
        if(current.falseAlarm){
          patch.falseAlarm=false;
          patch.kind=current.kind??this.creatures[0][1];
        }
      }
    }
    if(!this.selected){
      Object.assign(this.draft,patch);
      this.render('Click Add on map when ready.');
      return;
    }
    const error=this.edits.configure(this.selected,patch);
    if(!error)this.save();
    this.render(error||'Change saved. Test changes to apply.');
  }

  createChanges(){
    const root=section('Changes');
    const actions=element('div');
    actions.className='swamp-run-controls';
    actions.append(this.button('Test changes',()=>this.apply('Changes applied for testing.')),
      this.button('Restore original',()=>{
        this.edits.restore();
        this.selected='';
        this.companionGroup='';
        this.save();
        this.apply('Original encounters restored.');
      }),this.button('Export JSON',()=>this.export()));
    root.append(actions);
    return root;
  }

  get open(){return !this.panel.hidden;}
  get showSpawns(){return this.open&&this.spawnMarkers.checked;}
  get showRanges(){return this.open&&this.ranges.checked;}

  setOpen(open){
    this.panel.hidden=!open;
    this.toggle.setAttribute('aria-expanded',String(open));
    if(!open){
      this.mobs.stopAmbushPreview();
      this.setMode('','Choose a creature or select a spawn.');
    }
    this.refreshDebug();
  }

  choose(id){
    this.selected=id;
    this.companionGroup='';
    const spawn=this.edits.get(id);
    this.setMode('',spawn.spawnType==='proximity'?'Spawn selected.':spawn.falseAlarm?'Click the green origin ring to move it.':
      'Click the green origin ring or the landing cross to move it.');
  }

  setMode(mode,message){
    this.mode=mode;
    this.render(message);
  }

  report(message){this.status.textContent=message;}

  render(message){
    this.choices.replaceChildren();
    const spawn=this.edits.get(this.selected);
    const config=spawn??this.draft;
    const ambush=config.spawnType!=='proximity';
    const hasZone=config.spawnType==='ambush';
    const rectangle=config.triggerShape==='rectangle';
    const protectedSpawn=spawn&&this.edits.isProtected(spawn);
    this.creature.value=config.kind??this.creatures[0][1];
    this.spawnType.value=config.spawnType;
    this.creature.disabled=this.spawnType.disabled=Boolean(protectedSpawn);
    this.kindField.hidden=hasZone;
    this.ambushEventField.hidden=!hasZone;
    this.ambushEvent.value=config.falseAlarm?'false-alarm':config.kind;
    this.ambushEvent.disabled=Boolean(protectedSpawn);
    this.newMob.hidden=!spawn&&!this.companionGroup;
    this.spawnInfo.textContent=spawn
      ?'Selected: '+(spawn.id===SWAMP_AMBUSH.id?'East bush':spawn.id)+(spawn.disabled?' (disabled)':'')
      :this.companionGroup?'Adding a companion to '+this.companionGroup:'';
    this.vegetation.label.hidden=!ambush||config.falseAlarm;
    this.vegetation.input.checked=Boolean(config.vegetation);
    this.detection.root.hidden=ambush;
    for(const input of this.detection.inputs)input.value=config.detectionRange??ENEMIES[this.creature.value].detectionRange;
    this.triggerShapeField.hidden=!hasZone;
    this.triggerShape.value=rectangle?'rectangle':'circle';
    this.triggerRange.root.hidden=!hasZone||rectangle;
    for(const input of this.triggerRange.inputs)input.value=config.triggerRange??SWAMP_AMBUSH.trigger.radius;
    this.triggerDimensions.hidden=!hasZone||!rectangle;
    this.triggerSize[0].value=config.triggerWidth??TRIGGER_RECTANGLE.width;
    this.triggerSize[1].value=config.triggerHeight??TRIGGER_RECTANGLE.height;
    this.addButton.hidden=Boolean(spawn);
    const canMove=Boolean(spawn&&!protectedSpawn&&!spawn.disabled);
    this.preview.hidden=!(spawn&&ambush);
    for(const [button,mode,visible] of [
      [this.move,'move',canMove&&!config.falseAlarm],
      [this.trigger,'triggerPoint',canMove&&hasZone],
      ...this.gates.map((button,i)=>[button,i?'gateB':'gateA',canMove&&config.spawnType==='return-trap']),
    ]){
      button.hidden=!visible;
      button.setAttribute('aria-pressed',String(visible&&this.mode===mode));
    }
    this.addButton.setAttribute('aria-pressed',String(this.mode==='add'));
    this.move.textContent=ambush?'Move landing':'Move';
    this.remove.hidden=!spawn||protectedSpawn||this.edits.isAmbush(spawn);
    this.remove.textContent=spawn?.disabled?'Enable':'Delete';
    this.companion.hidden=!canMove||spawn.falseAlarm||!spawn.encounterId;
    this.root.dataset.mode=this.mode;
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
    if(this.mode==='visualOrigin'&&previous.spawnType==='ambush'&&previous.vegetation===undefined)
      patch.vegetation=true;
    const result=this.mode==='add'?this.edits.add(this.draft.kind,this.draft.falseAlarm?'':this.companionGroup,tile,this.draft):
      {id:this.selected,error:this.mode==='move'?this.edits.move(this.selected,tile):this.edits.configure(this.selected,patch)};
    if(result.error){this.report(result.error+' Choose another point or press Esc.');return;}
    this.selected=result.id;
    this.companionGroup='';
    this.save();
    const updated=this.edits.get(this.selected);
    const relocated=this.mode==='visualOrigin'&&(previous.x!==updated.x||previous.y!==updated.y);
    this.setMode('',relocated?'Origin saved with a nearby walkable landing. Test changes to apply.':
      'Spawn saved. Test changes to apply.');
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
        if(near(origin))targets.push({label:'Visual Origin',action:()=>this.arm('visualOrigin','Click the hiding spot.')});
        if(!spawn.falseAlarm&&near(spawn))
          targets.push({label:'Landing Point',action:()=>this.arm('move','Click walkable ground for the landing.')});
      }else if(near(spawn.falseAlarm?origin:spawn)){
        const label=spawn.falseAlarm?'False Alarm':ENEMIES[spawn.kind].label;
        targets.push({label:label+' · '+spawn.id,action:()=>this.choose(spawn.id)});
      }
    }
    return targets;
  }

  apply(message){
    this.applied=this.edits.snapshot();
    this.mobs.scene.swampRun?.respawn({testing:true});
    this.setMode('',message);
    document.getElementById('game')?.focus({preventScroll:true});
  }

  load(){
    try{this.edits.load(JSON.parse(localStorage.getItem(STORAGE_KEY)));}
    catch{/* The editor still works in memory. */}
  }

  save(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(this.edits.data()));}
    catch{/* In-memory edit. */}
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
    this.root.remove();
  }
}
