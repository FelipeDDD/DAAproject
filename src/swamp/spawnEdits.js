import { AMBUSH_DEFAULT_COOLDOWN_SECONDS, AMBUSH_MAX_COOLDOWN_SECONDS, AMBUSH_MAX_QUANTITY, SWAMP_EMERGENCE } from './mobConfig.js';
import { gateLength } from './ReturnTrap.js';

const MAP = 'swamp-v3-large';
export const SPAWN_SOURCE_ROUTE = '/__swamp-spawns';
const EDITOR_ID = /^editor-mob-\d+$/;
const validPoint = point => Number.isFinite(point?.x) && Number.isFinite(point?.y);
const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
export const SPAWN_TYPES = {proximity:'Proximity',ambush:'Ambush','return-trap':'Return Trap'};
export const DEFAULT_DECOY = 'false-alarm';
export const WATER_RIPPLES_DECOY = 'water-ripples';
export const DECOY_TYPES = { [DEFAULT_DECOY]:'Leaves', [WATER_RIPPLES_DECOY]:'Water Ripples' };
export const RANGE_LIMIT = 800;
export const TRIGGER_RECTANGLE = {width:128,height:48};
const isRange = value => Number.isInteger(value)&&value>=1&&value<=RANGE_LIMIT;
const isEmergenceDistance = value => Number.isInteger(value)&&value>=1&&value<=SWAMP_EMERGENCE.distanceLimit;
const isCooldown = value => Number.isInteger(value)&&value>=1&&value<=AMBUSH_MAX_COOLDOWN_SECONDS;
const isQuantity = value => Number.isInteger(value)&&value>=1&&value<=AMBUSH_MAX_QUANTITY;
const isGateLength=value=>Number.isSafeInteger(value)&&value>=1;
const gateLengths=['gateALength','gateBLength'];
const position = ({x,y}) => ({x,y});

function readSettings(raw,geometry){
  const settings={};
  if(!raw||typeof raw!=='object')return settings;
  if(Object.hasOwn(geometry,raw.kind))settings.kind=raw.kind;
  if(Object.hasOwn(SPAWN_TYPES,raw.spawnType))settings.spawnType=raw.spawnType;
  if(raw.triggerShape==='circle'||raw.triggerShape==='rectangle')settings.triggerShape=raw.triggerShape;
  for(const field of ['detectionRange','triggerRange','triggerWidth','triggerHeight'])
    if(isRange(raw[field]))settings[field]=raw[field];
  if(isEmergenceDistance(raw.emergenceDistance))settings.emergenceDistance=raw.emergenceDistance;
  if(isCooldown(raw.cooldownSeconds))settings.cooldownSeconds=raw.cooldownSeconds;
  if(isQuantity(raw.quantity))settings.quantity=raw.quantity;
  for(const field of gateLengths)if(isGateLength(raw[field]))settings[field]=raw[field];
  if(raw.falseAlarm===true&&Object.hasOwn(DECOY_TYPES,raw.decoyType))settings.decoyType=raw.decoyType;
  for(const field of ['visualOrigin','triggerPoint','gateA','gateB']){
    if(validPoint(raw[field]))settings[field]={x:raw[field].x,y:raw[field].y};
  }
  for(const field of ['falseAlarm','vegetation','repeat','waterLeap','spawnInPlace'])if(typeof raw[field]==='boolean')settings[field]=raw[field];
  return settings;
}

export function validateSpawnPosition(spawn,point,spawns,terrain,geometry,ambush){
  const trap=ambush?.returnTrap;
  if(spawn.marker){
    if(!terrain.marker.clear(point))return 'Position blocked by collision.';
    const other=spawns.find(entry=>entry.marker&&entry.id!==spawn.id);
    if(other&&distance(point,other)<trap.minSeparation)return 'Keep gates A and B apart.';
    const source=spawns.find(entry=>entry.id===ambush.spawn.id);
    if(spawn.id===trap.a.id&&source&&!terrain.snake.sees(source,point))
      return 'Keep gate A in sight of the ambush spawn.';
    return '';
  }
  if(!terrain[spawn.kind].clear(point))return 'Position blocked by collision.';
  if(terrain.marker?.reachable&&!terrain.marker.reachable(point))return 'Position is outside the player-accessible area.';
  if(spawns.some(other=>!other.marker&&other.spawnType!=='ambush'&&other.id!==spawn.id&&distance(point,other)<
    geometry[spawn.kind].footRadius+geometry[other.kind].footRadius))return 'This position overlaps another spawn.';
  if(spawn.id===ambush?.id&&(!terrain[spawn.kind].sees(point,ambush.trigger)||
    distance(point,ambush.bush)>(spawn.emergenceDistance??SWAMP_EMERGENCE.maxDistance)))
    return 'Keep the ambush spawn near the bush and in sight of its trigger.';
  const gateA=spawns.find(entry=>entry.id===trap?.a.id);
  if(spawn.id===ambush?.id&&gateA&&!terrain[spawn.kind].sees(point,gateA))
    return 'Keep the ambush spawn in sight of gate A.';
  return '';
}

export class SpawnEdits {
  constructor(originals,terrain,geometry,ambush,variant=ambush.defaultVariant){
    Object.assign(this,{originals,terrain,geometry,ambush});
    this.protectedGroups=new Set(originals.filter(spawn=>spawn.encounterId&&(spawn.checkpoint||spawn.boss))
      .map(spawn=>spawn.encounterId));
    this.nextOrdinal=1;
    this.restore();
    this.ambushVariant=variant;
  }

  restore(){
    this.positions=new Map();
    this.additions=new Map();
    this.disabled=new Set();
    this.settings=new Map();
    this.ambushVariant=this.ambush.defaultVariant;
  }

  get(id){
    const base=this.additions.get(id)??this.originals.find(spawn=>spawn.id===id);
    if(!base)return;
    const originalEvent=id===this.ambush.id;
    const variant=this.ambush.variants[this.ambushVariant];
    const defaults=originalEvent?{
      spawnType:variant.type==='return-trap'?'return-trap':'ambush',
      kind:variant.kind??base.kind,visualOrigin:this.ambush.bush,triggerPoint:this.ambush.trigger,
      falseAlarm:variant.type==='false-alarm',
    }:{spawnType:'proximity'};
    return {...base,...this.positions.get(id),...defaults,...this.settings.get(id),disabled:this.disabled.has(id)};
  }

  entries(){
    return [...this.originals,...this.additions.values()].map(({id})=>this.get(id));
  }

  isAmbush(spawn){return Boolean(spawn?.marker||spawn?.id===this.ambush.id);}
  isProtected(spawn){return Boolean(spawn?.checkpoint||spawn?.boss||this.protectedGroups.has(spawn?.encounterId));}

  groups(){
    return [...new Set([...this.originals,...this.additions.values()]
      .filter(spawn=>!this.isProtected(spawn)&&!spawn.marker).map(spawn=>spawn.encounterId).filter(Boolean))];
  }

  event(spawn){
    const original=spawn.id===this.ambush.id;
    const trap=this.ambush.returnTrap;
    const spawnInPlace=spawn.spawnType==='return-trap'&&spawn.spawnInPlace;
    const {x,y}=spawn.triggerPoint??spawn;
    const trigger=spawn.triggerShape==='rectangle'
      ?{x,y,shape:'rectangle',width:spawn.triggerWidth??TRIGGER_RECTANGLE.width,
        height:spawn.triggerHeight??TRIGGER_RECTANGLE.height}
      :{x,y,shape:'circle',radius:spawn.triggerRange??this.ambush.trigger.radius};
    return {
      ...spawn,
      repeat:spawn.repeat??false,
      cooldownSeconds:spawn.cooldownSeconds??AMBUSH_DEFAULT_COOLDOWN_SECONDS,
      ...(spawn.falseAlarm?{}:{quantity:spawn.quantity??1}),
      visualOrigin:spawnInPlace?position(spawn):spawn.visualOrigin??position(spawn),
      emergenceDistance:spawn.emergenceDistance??SWAMP_EMERGENCE.maxDistance,
      trigger,
      a:spawn.gateA??(original?this.get(trap.a.id):spawn.triggerPoint??spawn),
      b:spawn.gateB??(original?this.get(trap.b.id):null),
      ...(spawn.spawnType==='return-trap'?{
        gateALength:spawn.gateALength??gateLength(trap,'A'),
        gateBLength:spawn.gateBLength??gateLength(trap,'B'),
      }:{}),
    };
  }

  validate(spawn,point){
    if(!validPoint(point))return 'Choose a point on the map.';
    if(spawn.waterLeap&&(spawn.kind!=='frost'||spawn.spawnType!=='ambush'||spawn.falseAlarm))
      return 'Water Leap is available for Frost Slime ambushes.';
    if(spawn.spawnType==='ambush'){
      // These are authoring markers. The live ambush checks the actual landing footprint.
      const terrain=this.terrain[spawn.kind]??this.terrain.marker??this.terrain.snake;
      const {visualOrigin,trigger}=this.event({...spawn,...point});
      if(!terrain.inBounds(visualOrigin))return 'Place the visual origin inside the map.';
      if(!spawn.falseAlarm&&!terrain.inBounds(point))return 'Place the landing point inside the map.';
      if(!terrain.inBounds(trigger))return 'Place the trigger center inside the map.';
      return '';
    }
    const occupied=this.entries().filter(entry=>!entry.disabled);
    if(spawn.marker)return validateSpawnPosition(spawn,point,occupied,this.terrain,this.geometry,this.ambush);
    const error=validateSpawnPosition(spawn,point,occupied,this.terrain,this.geometry);
    if(error||spawn.spawnType==='proximity')return error;
    const event=this.event({...spawn,...point});
    const ground=this.terrain.marker??this.terrain[spawn.kind];
    const terrain=this.terrain[spawn.kind];
    if(!terrain.inBounds(event.visualOrigin))return 'Place the visual origin inside the map.';
    if(!event.falseAlarm){
      const emergenceError=terrain.emergenceError(event.visualOrigin,point,event.vegetation,event.emergenceDistance);
      if(emergenceError)return emergenceError;
    }
    if(!event.a||!event.b||!ground.clear(event.a)||!ground.clear(event.b))
      return 'Place both return gates on walkable ground.';
    if(distance(event.a,event.b)<this.ambush.returnTrap.minSeparation)return 'Keep gates A and B apart.';
    if(!terrain.sees(point,event.a))return 'Keep gate A in sight of the landing.';
    return '';
  }

  suggestLanding(spawn,origin,validatePosition){
    const terrain=this.terrain[spawn.kind];
    if(!terrain.inBounds(origin))return;
    const limit=spawn.emergenceDistance??SWAMP_EMERGENCE.maxDistance;
    for(const radius of [0,12,24,36,44,52,68,84,100,120,140,160,limit].filter((value,i,values)=>value<=limit&&values.indexOf(value)===i)){
      for(let i=0;i<(radius?16:1);i++){
        const angle=i*Math.PI/8;
        const point={x:Math.round(origin.x+radius*Math.cos(angle)),y:Math.round(origin.y+radius*Math.sin(angle))};
        if(!terrain.canEmerge(origin,point,spawn.vegetation,limit))continue;
        if(!validatePosition(point))return point;
      }
    }
  }

  suggestGate(spawn,a){
    const ground=this.terrain.marker??this.terrain[spawn.kind];
    for(const radius of [80,108,144]){
      for(let i=0;i<12;i++){
        const angle=i*Math.PI/6;
        const point={x:Math.round(a.x+radius*Math.cos(angle)),y:Math.round(a.y+radius*Math.sin(angle))};
        if(ground.canReach(a,point))return point;
      }
    }
  }

  configure(id,patch){
    const current=this.get(id);
    if(!current||current.marker)return 'Select a spawn.';
    if('emergenceDistance' in patch&&!isEmergenceDistance(patch.emergenceDistance))
      return 'Choose an emergence limit from 1 to '+SWAMP_EMERGENCE.distanceLimit+' px.';
    if('cooldownSeconds' in patch&&!isCooldown(patch.cooldownSeconds))return 'Choose a valid cooldown in seconds.';
    if('quantity' in patch&&!isQuantity(patch.quantity))return 'Choose a quantity from 1 to '+AMBUSH_MAX_QUANTITY+'.';
    if(gateLengths.some(field=>field in patch&&!isGateLength(patch[field])))return 'Enter a positive gate length in pixels.';
    if(this.isProtected(current)&&Object.keys(patch).some(key=>key!=='detectionRange'))return 'This spawn is protected.';
    const raw={...this.settings.get(id),...patch};
    if((patch.spawnType??current.spawnType)!=='proximity')this.pinAmbushPoints(current,raw);
    if(patch.spawnType==='return-trap'&&!this.event({...current,...raw}).b){
      raw.gateA=raw.gateA??{x:current.x,y:current.y};
      raw.gateB=this.suggestGate(current,raw.gateA);
    }
    const next=readSettings(raw,this.geometry);
    const candidate={...current,...next};
    if('detectionRange' in patch&&patch.detectionRange===undefined)delete candidate.detectionRange;
    if(Object.keys(patch).some(key=>key!=='detectionRange')){
      const error=this.validate(candidate,candidate);
      if(error){
        const needsLanding=current.falseAlarm&&!candidate.falseAlarm;
        if(!needsLanding||candidate.spawnType==='proximity'||candidate.falseAlarm)return error;
        const landing=this.suggestLanding(candidate,candidate.visualOrigin,point=>this.validate(candidate,point));
        if(!landing)return error+' No valid landing was found near the new origin.';
        this.storePosition(id,landing);
      }
    }
    if(Object.keys(next).length)this.settings.set(id,next);
    else this.settings.delete(id);
    return '';
  }

  move(id,point){
    const spawn=this.get(id);
    if(!spawn||this.isProtected(spawn))return 'Select an editable spawn.';
    if(spawn.disabled)return 'Enable this spawn before moving it.';
    const settings={...this.settings.get(id)};
    if(!spawn.marker&&spawn.spawnType!=='proximity')this.pinAmbushPoints(spawn,settings);
    const error=this.validate({...spawn,...settings},point);
    if(error)return error;
    this.storePosition(id,point);
    if(Object.keys(settings).length)this.settings.set(id,settings);
    return '';
  }

  pinAmbushPoints(spawn,settings){
    const event=this.event(spawn);
    if(!spawn.visualOrigin)settings.visualOrigin??=position(event.visualOrigin);
    const type=settings.spawnType??spawn.spawnType;
    if(type==='ambush'&&!spawn.triggerPoint)settings.triggerPoint??=position(event.trigger);
    if(type==='return-trap'&&spawn.id!==this.ambush.id&&!spawn.gateA)settings.gateA??=position(event.a);
  }

  storePosition(id,{x,y}){
    if(this.additions.has(id))Object.assign(this.additions.get(id),{x,y});
    else{
      const home=this.originals.find(spawn=>spawn.id===id);
      if(x===home.x&&y===home.y)this.positions.delete(id);
      else this.positions.set(id,{x,y});
    }
  }

  add(kind,encounterId,point,options={},reservedIds,landingPoint){
    const alarm=options.spawnType==='ambush'&&options.falseAlarm===true;
    if(!alarm&&!Object.hasOwn(this.geometry,kind))return {error:'Choose a creature.'};
    if(!validPoint(point))return {error:'Choose a point on the map.'};
    const groups=this.groups();
    if(encounterId&&!groups.includes(encounterId))return {error:'Choose an encounter.'};
    let ordinal=this.nextOrdinal;
    while(this.get(`editor-mob-${ordinal}`)||groups.includes(`editor-mob-${ordinal}`)||reservedIds?.has(`editor-mob-${ordinal}`))ordinal++;
    const id=`editor-mob-${ordinal}`;
    const spawn={id,kind:alarm?null:kind,encounterId:encounterId||id,x:point.x,y:point.y,spawnType:'proximity'};
    const settings=readSettings(options,this.geometry);
    if(alarm)delete settings.kind;
    Object.assign(spawn,settings);
    if(spawn.spawnType!=='proximity')settings.visualOrigin=point;
    if(spawn.spawnType==='ambush'&&!alarm){
      if(!this.terrain[spawn.kind].inBounds(point))return {error:'Place the visual origin inside the map.'};
      if(!landingPoint)return {needsLanding:true};
      Object.assign(spawn,position(landingPoint));
    }else if(spawn.spawnType==='return-trap'){
      const occupied=this.entries().filter(s=>!s.disabled);
      if(spawn.spawnInPlace){
        const error=validateSpawnPosition(spawn,point,occupied,this.terrain,this.geometry);
        if(error)return {error};
      }
      const landing=spawn.spawnInPlace?point:this.suggestLanding(spawn,point,landing=>
        validateSpawnPosition(spawn,landing,occupied,this.terrain,this.geometry));
      if(!landing)return {error:'No clear landing nearby. Choose another origin or enable Emerge from vegetation.'};
      Object.assign(spawn,landing);
      settings.gateA=landing;
      settings.gateB=this.suggestGate(spawn,landing);
    }
    if(spawn.spawnType==='ambush')settings.triggerPoint??=position(spawn);
    Object.assign(spawn,settings);
    const placementError=this.validate(spawn,spawn);
    if(!placementError){
      this.nextOrdinal=ordinal+1;
      this.additions.set(id,{id,kind:alarm?null:kind,encounterId:spawn.encounterId,x:spawn.x,y:spawn.y});
      if(Object.keys(settings).length)this.settings.set(id,settings);
    }
    return {id,error:placementError};
  }

  remove(id){
    const spawn=this.get(id);
    if(!spawn||this.isProtected(spawn)||this.isAmbush(spawn))return 'This spawn is protected.';
    if(this.additions.delete(id)){this.settings.delete(id);return '';}
    if(this.disabled.has(id)){
      const error=this.validate(spawn,spawn);
      if(error)return error;
      this.disabled.delete(id);
    }else this.disabled.add(id);
    return '';
  }

  load(data){
    if(data?.map!==MAP||![1,2,3].includes(data.version))return;
    if(Number.isSafeInteger(data.nextOrdinal)&&data.nextOrdinal>0)this.nextOrdinal=data.nextOrdinal;
    if(Object.hasOwn(this.ambush.variants,data.ambushVariant))this.ambushVariant=data.ambushVariant;
    if(Array.isArray(data.disabled))for(const id of data.disabled){
      const spawn=this.get(id);
      if(spawn&&!this.isProtected(spawn)&&!this.isAmbush(spawn))this.disabled.add(id);
    }
    // Apply the candidate positions together so reload also supports a sequence of swaps.
    for(const [id,point] of Object.entries(data.positions??{})){
      if(this.get(id)&&!this.isProtected(this.get(id))&&validPoint(point))this.storePosition(id,point);
    }
    if(Array.isArray(data.additions))for(const {id,kind,encounterId,x,y} of data.additions.filter(Boolean)){
      const settings=data.version===3?data.settings?.[id]:null;
      const validKind=Object.hasOwn(this.geometry,kind)||(kind===null&&
        (Object.hasOwn(this.geometry,settings?.kind)||(settings?.spawnType==='ambush'&&settings.falseAlarm===true)));
      if(EDITOR_ID.test(id)&&!this.get(id)&&validKind&&validPoint({x,y})&&
        (this.groups().includes(encounterId)||EDITOR_ID.test(encounterId))){
        this.additions.set(id,{id,kind,encounterId,x,y});
        this.nextOrdinal=Math.max(this.nextOrdinal,Number(id.slice('editor-mob-'.length))+1);
      }
    }
    if(data.version===3)for(const [id,raw] of Object.entries(data.settings??{})){
      const spawn=this.get(id);
      if(!spawn||spawn.marker)continue;
      const fields=readSettings(raw,this.geometry);
      const accepted=this.isProtected(spawn)?readSettings({detectionRange:fields.detectionRange},this.geometry):fields;
      if(Object.keys(accepted).length)this.settings.set(id,accepted);
    }
    // Restoring an invalid position may put its original under a later edit.
    let invalid;
    do{
      invalid=this.entries().filter(spawn=>!spawn.disabled&&
        (this.positions.has(spawn.id)||this.additions.has(spawn.id)||this.settings.has(spawn.id))&&this.validate(spawn,spawn));
      for(const {id} of invalid){
        this.positions.delete(id);
        this.additions.delete(id);
        this.settings.delete(id);
      }
    }while(invalid.length);
  }

  data(){
    return {map:MAP,version:3,nextOrdinal:this.nextOrdinal,positions:Object.fromEntries(this.positions),
      additions:[...this.additions.values()].map(spawn=>({...spawn})),disabled:[...this.disabled],
      ambushVariant:this.ambushVariant,settings:Object.fromEntries(this.settings)};
  }

  snapshot(){
    const active=this.entries().filter(spawn=>!spawn.disabled&&!spawn.marker);
    return {spawns:active.filter(spawn=>spawn.spawnType==='proximity'),
      ambushes:active.filter(spawn=>spawn.spawnType!=='proximity').map(spawn=>this.event(spawn))};
  }
}
