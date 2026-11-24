const MAP = 'swamp-v3-large';
const EDITOR_ID = /^editor-mob-\d+$/;
const validPoint = point => Number.isFinite(point?.x) && Number.isFinite(point?.y);
const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);

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
  if(spawns.some(other=>!other.marker&&other.id!==spawn.id&&distance(point,other)<
    geometry[spawn.kind].footRadius+geometry[other.kind].footRadius))return 'This position overlaps another spawn.';
  if(spawn.id===ambush?.id&&(!terrain[spawn.kind].sees(point,ambush.trigger)||distance(point,ambush.bush)>100))
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
    this.restore();
    this.ambushVariant=variant;
  }

  restore(){
    this.positions=new Map();
    this.additions=new Map();
    this.disabled=new Set();
    this.ambushVariant=this.ambush.defaultVariant;
  }

  get(id){
    const base=this.additions.get(id)??this.originals.find(spawn=>spawn.id===id);
    if(!base)return;
    return {...base,...this.positions.get(id),disabled:this.disabled.has(id)};
  }

  entries(){
    return [...this.originals,...this.additions.values()].map(({id})=>this.get(id));
  }

  isAmbush(spawn){return Boolean(spawn?.marker||spawn?.id===this.ambush.id);}
  isProtected(spawn){return Boolean(spawn?.checkpoint||spawn?.boss||this.protectedGroups.has(spawn?.encounterId));}

  groups(){
    return [...new Set([...this.originals,...this.additions.values()]
      .filter(spawn=>!this.isProtected(spawn)&&!this.isAmbush(spawn)).map(spawn=>spawn.encounterId).filter(Boolean))];
  }

  validate(spawn,point){
    if(!validPoint(point))return 'Choose a point on the map.';
    const occupied=this.entries().filter(entry=>!entry.disabled);
    if(this.isAmbush(spawn)&&!spawn.marker){
      // The same spawn can be used by a Frog as well as a Snake.
      for(const variant of Object.values(this.ambush.variants)){
        if(!variant.kind||variant.kind===spawn.kind)continue;
        const error=validateSpawnPosition({...spawn,kind:variant.kind},point,occupied,this.terrain,this.geometry,this.ambush);
        if(error)return error;
      }
    }
    return validateSpawnPosition(spawn,point,occupied,this.terrain,this.geometry,this.ambush);
  }

  move(id,point){
    const spawn=this.get(id);
    if(!spawn||this.isProtected(spawn))return 'Select an editable spawn.';
    if(spawn.disabled)return 'Enable this spawn before moving it.';
    const error=this.validate(spawn,point);
    if(error)return error;
    this.storePosition(id,point);
    return '';
  }

  storePosition(id,{x,y}){
    if(this.additions.has(id))Object.assign(this.additions.get(id),{x,y});
    else{
      const home=this.originals.find(spawn=>spawn.id===id);
      if(x===home.x&&y===home.y)this.positions.delete(id);
      else this.positions.set(id,{x,y});
    }
  }

  add(kind,encounterId,point){
    if(!Object.hasOwn(this.geometry,kind))return {error:'Choose a creature.'};
    if(!validPoint(point))return {error:'Choose a point on the map.'};
    const groups=this.groups();
    if(encounterId&&!groups.includes(encounterId))return {error:'Choose an encounter.'};
    let ordinal=1;
    while(this.get(`editor-mob-${ordinal}`)||groups.includes(`editor-mob-${ordinal}`))ordinal++;
    const id=`editor-mob-${ordinal}`;
    const spawn={id,kind,encounterId:encounterId||id,x:point.x,y:point.y};
    const error=this.validate(spawn,point);
    if(!error)this.additions.set(id,spawn);
    return {id,error};
  }

  remove(id){
    const spawn=this.get(id);
    if(!spawn||this.isProtected(spawn)||this.isAmbush(spawn))return 'This spawn is protected.';
    if(this.additions.delete(id))return '';
    if(this.disabled.has(id)){
      const error=this.validate(spawn,spawn);
      if(error)return error;
      this.disabled.delete(id);
    }else this.disabled.add(id);
    return '';
  }

  load(data){
    if(data?.map!==MAP||![1,2].includes(data.version))return;
    if(data.version===2&&Object.hasOwn(this.ambush.variants,data.ambushVariant))this.ambushVariant=data.ambushVariant;
    if(Array.isArray(data.disabled))for(const id of data.disabled){
      const spawn=this.get(id);
      if(spawn&&!this.isProtected(spawn)&&!this.isAmbush(spawn))this.disabled.add(id);
    }
    // Apply the candidate positions together so reload also supports a sequence of swaps.
    for(const [id,point] of Object.entries(data.positions??{})){
      if(this.get(id)&&validPoint(point))this.storePosition(id,point);
    }
    if(Array.isArray(data.additions))for(const {id,kind,encounterId,x,y} of data.additions.filter(Boolean)){
      if(EDITOR_ID.test(id)&&!this.get(id)&&Object.hasOwn(this.geometry,kind)&&validPoint({x,y})&&
        (this.groups().includes(encounterId)||EDITOR_ID.test(encounterId)))
        this.additions.set(id,{id,kind,encounterId,x,y});
    }
    // Restoring an invalid position may put its original under a later edit.
    let invalid;
    do{
      invalid=this.entries().filter(spawn=>!spawn.disabled&&
        (this.positions.has(spawn.id)||this.additions.has(spawn.id))&&this.validate(spawn,spawn));
      for(const {id} of invalid){
        this.positions.delete(id);
        this.additions.delete(id);
      }
    }while(invalid.length);
  }

  data(){
    return {map:MAP,version:2,positions:Object.fromEntries(this.positions),
      additions:[...this.additions.values()].map(spawn=>({...spawn})),disabled:[...this.disabled],ambushVariant:this.ambushVariant};
  }

  snapshot(){
    const {a,b}=this.ambush.returnTrap;
    return {spawns:this.entries().filter(spawn=>!spawn.disabled&&!this.isAmbush(spawn)),
      ambushSpawn:this.get(this.ambush.id),a:this.get(a.id),b:this.get(b.id),variant:this.ambushVariant};
  }
}
