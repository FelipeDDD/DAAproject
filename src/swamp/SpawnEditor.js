import { worldPointAt } from '../vfx/lab/ArenaAim.js';
import { ENEMIES } from '../vfx/lab/combatEnemy.js';
import { SWAMP_AMBUSH, SWAMP_MOB_TERRAIN } from './mobConfig.js';
import { SpawnEdits } from './spawnEdits.js';

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
  constructor(mobs){
    this.mobs=mobs;
    this.edits=new SpawnEdits(mobs.baseSpawns(),mobs.terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH,mobs.ambushMode);
    this.listeners=new AbortController();
    const {signal}=this.listeners;
    this.selected='';
    this.mode='';
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
    this.panel.append(this.status,this.createSpawns(),this.createAmbushes(),this.createChanges(),this.advanced);
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

  createSpawns(){
    const root=section('Spawns');
    this.creature=select('Creature',[['Choose a creature',''],...this.creatures]);
    this.group=select('Encounter group');
    this.spawnList=select('Spawn to edit');
    this.spawnList.addEventListener('change',()=>this.choose(this.spawnList.value),{signal:this.listeners.signal});
    this.spawnInfo=element('p');
    this.spawnInfo.className='swamp-editor-info';
    this.addButton=this.button('Add mob',()=>{
      if(this.mode==='add'){this.setMode('','Operation cancelled.');return;}
      if(!this.creature.value){this.report('Choose a creature.');this.creature.focus();return;}
      this.setMode('add','Click on the map to place. Esc cancels.');
    });
    this.selectButton=this.button('Select on map',()=>{
      if(this.mode==='select'){this.setMode('','Operation cancelled.');return;}
      this.setMode('select','Click a creature or spawn marker. Esc cancels.');
    });
    this.move=this.button('Move',()=>this.startMove());
    this.remove=this.button('Remove experimental mob',()=>{
      const id=this.selected;
      const error=this.edits.remove(id);
      if(error){this.report(error);return;}
      if(!this.edits.get(id))this.selected='';
      this.save();
      this.setMode('','Change saved. Test changes to apply.');
    });
    const marker=this.checkbox('Show spawn markers',true,()=>this.refreshDebug());
    this.spawnMarkers=marker.input;
    const actions=element('div');
    actions.className='swamp-run-controls';
    actions.append(this.selectButton,this.move,this.remove);
    root.append(this.creature,this.group,this.addButton,marker.label,this.spawnList,this.spawnInfo,actions);
    return root;
  }

  createAmbushes(){
    const root=section('Ambushes');
    this.variant=select('Ambush variant',Object.entries(SWAMP_AMBUSH.variants).map(([id,variant])=>[variant.label,id]));
    this.variant.addEventListener('change',()=>{
      this.edits.ambushVariant=this.variant.value;
      this.save();
      this.setMode('','Ambush variant saved. Test changes to apply.');
    },{signal:this.listeners.signal});
    this.ambushList=select('Ambush point',[['Select an ambush point',''],...this.edits.originals
      .filter(spawn=>this.edits.isAmbush(spawn)).map(spawn=>[spawn.label??'Creature spawn',spawn.id])]);
    this.ambushList.addEventListener('change',()=>this.choose(this.ambushList.value),{signal:this.listeners.signal});
    this.ambushInfo=element('p');
    this.ambushInfo.className='swamp-editor-info';
    this.ambushMove=this.button('Move ambush point',()=>this.startMove());
    const marker=this.checkbox('Show ambush markers',false,()=>this.refreshDebug());
    this.ambushMarkers=marker.input;
    root.append(this.variant,marker.label,this.ambushList,this.ambushInfo,this.ambushMove);
    return root;
  }

  createChanges(){
    const root=section('Changes');
    const actions=element('div');
    actions.className='swamp-run-controls';
    actions.append(this.button('Test changes',()=>this.apply('Changes applied for testing.')),
      this.button('Restore original',()=>{
        this.edits.restore();
        this.selected='';
        this.save();
        this.apply('Original encounters restored.');
      }),this.button('Export JSON',()=>this.export()));
    root.append(actions);
    return root;
  }

  get open(){return !this.panel.hidden;}
  get showSpawns(){return this.open&&this.spawnMarkers.checked;}
  get showAmbush(){return this.open&&this.ambushMarkers.checked;}

  setOpen(open){
    this.panel.hidden=!open;
    this.toggle.setAttribute('aria-expanded',String(open));
    if(!open)this.setMode('','Choose a creature or select a spawn.');
    this.refreshDebug();
  }

  choose(id){
    this.selected=id;
    if(this.edits.isAmbush(this.edits.get(id)))this.ambushMarkers.checked=true;
    this.setMode('',id?'Spawn selected.':'Select a spawn to move.');
  }

  startMove(){
    if(this.mode==='move'){this.setMode('','Operation cancelled.');return;}
    this.setMode('move','Click on the map to move this spawn. Esc cancels.');
  }

  setMode(mode,message){
    this.mode=mode;
    this.render(message);
  }

  report(message){this.status.textContent=message;}

  render(message){
    const group=this.group.value;
    const groups=this.edits.groups();
    this.group.replaceChildren(new Option('New independent encounter',''),
      ...groups.map(id=>new Option(id,id)));
    this.group.value=groups.includes(group)?group:'';
    const entries=this.edits.entries().filter(spawn=>!this.edits.isAmbush(spawn));
    this.spawnList.replaceChildren(new Option('Select a spawn',''),
      ...entries.map(spawn=>new Option(spawn.id+(spawn.disabled?' (disabled)':''),spawn.id)));
    const spawn=this.edits.get(this.selected);
    const isAmbush=this.edits.isAmbush(spawn);
    this.spawnList.value=isAmbush?'':this.selected;
    this.ambushList.value=isAmbush?this.selected:'';
    this.variant.value=this.edits.ambushVariant;
    this.spawnInfo.textContent=spawn&&!isAmbush?
      ENEMIES[spawn.kind].label+' · '+(spawn.encounterId??'Independent')+' · '+spawn.x+', '+spawn.y+
      (this.edits.isProtected(spawn)?' · Protected spawn':''):'';
    this.ambushInfo.textContent=isAmbush?spawn.x+', '+spawn.y:'';
    this.move.disabled=!spawn||isAmbush||spawn.disabled||this.edits.isProtected(spawn);
    this.remove.disabled=!spawn||isAmbush||this.edits.isProtected(spawn);
    this.remove.textContent=this.edits.additions.has(this.selected)?'Remove experimental mob':
      spawn?.disabled?'Enable spawn':'Disable original spawn';
    this.ambushMove.disabled=!isAmbush;
    for(const [mode,button] of [['add',this.addButton],['select',this.selectButton],['move',this.move],['move',this.ambushMove]]){
      button.setAttribute('aria-pressed',String(this.mode===mode&&!button.disabled));
    }
    this.root.dataset.mode=this.mode;
    this.report(message);
    this.refreshDebug();
  }

  refreshDebug(){this.mobs.syncEditorDebug();}

  handleMapClick(event){
    if(!this.open||!this.mode||event.button!==0||this.mobs.scene.swampRun?.blocking)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const {game,cameras}=this.mobs.scene;
    const point=worldPointAt(game.canvas,cameras.main,event.clientX,event.clientY);
    if(!point)return;
    const tile={x:Math.round(point.x),y:Math.round(point.y)};
    if(this.mode==='select'){
      const id=this.findSpawn(tile);
      if(id)this.choose(id);
      else this.report('No spawn here. Click a creature or marker. Esc cancels.');
      return;
    }
    const result=this.mode==='add'?this.edits.add(this.creature.value,this.group.value,tile):
      {id:this.selected,error:this.edits.move(this.selected,tile)};
    if(result.error){this.report(result.error+' Choose another point or press Esc.');return;}
    this.selected=result.id;
    this.save();
    this.setMode('','Spawn saved. Test changes to apply.');
  }

  findSpawn(point){
    const entries=this.edits.entries().filter(spawn=>!this.edits.isAmbush(spawn));
    let closest=Infinity,selected='';
    for(const spawn of entries){
      const distance=Math.hypot(spawn.x-point.x,spawn.y-point.y);
      if(this.showSpawns&&distance<Math.min(14,closest)){
        closest=distance;
        selected=spawn.id;
      }
    }
    for(const {mob,sprite} of this.mobs.entries){
      if(mob.test||!mob.enemy.hp||!entries.some(spawn=>spawn.id===mob.spawnId)||
        !sprite.getBounds().contains(point.x,point.y))continue;
      const distance=Math.hypot(mob.enemy.x-point.x,mob.enemy.y-point.y);
      if(distance<closest){closest=distance;selected=mob.spawnId;}
    }
    return selected;
  }

  apply(message){
    this.applied=this.edits.snapshot();
    this.mobs.scene.swampRun?.respawn();
    this.setMode('',message);
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
