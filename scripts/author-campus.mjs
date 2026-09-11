// One-time authoring helper. Existing Notes are resolved once; an existing outside map
// is never overwritten. After this script, edit world positions directly in Tiled.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const catalog=JSON.parse(fs.readFileSync('public/assets/campus/catalog.json','utf8'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const props=o=>Object.fromEntries((o.properties??[]).map(p=>[p.name,p.value]));
function set(o,name,value){o.properties??=[];const p={name,type:typeof value==='boolean'?'bool':typeof value==='number'?'float':'string',value};const i=o.properties.findIndex(p=>p.name===name);if(i<0)o.properties.push(p);else o.properties[i]=p;}
function save(path,map){
  const {layers,...meta}=map;
  const parts=layers.map(({data,objects,...rest})=>{let t=JSON.stringify(rest,null,2).slice(0,-2);if(data){const rows=[];for(let i=0;i<data.length;i+=map.width)rows.push('    '+data.slice(i,i+map.width).join(', '));t+=',\n  "data": [\n'+rows.join(',\n')+'\n  ]';}if(objects)t+=',\n  "objects": [\n'+objects.map(o=>'    '+JSON.stringify(o)).join(',\n')+'\n  ]';return t+'\n}';});
  fs.writeFileSync(path,JSON.stringify(meta,null,2).slice(0,-2)+',\n  "layers": [\n'+parts.map(t=>t.split('\n').map(s=>'    '+s).join('\n')).join(',\n')+'\n  ]\n}\n');
}
function editor(map,firstgid){
  const layer=name=>map.layers.find(l=>l.name===name);
  const obj=(name,x,y,width=0,height=0,type='')=>({id:map.nextobjectid++,name,type,x,y,width,height,rotation:0,visible:true});
  const rect=(name,x,y,w,h)=>{const o=obj(name,x,y,w,h);layer('Collision').objects.push(o);return o;};
  const sprite=(name,asset,x,y,w=catalog[asset].width,h=catalog[asset].height,options={})=>{
    const o={...obj(name,x,y+h,w,h,'prop'),gid:firstgid+catalog[asset].frame};
    if(options.flipX)o.gid=(o.gid|0x80000000)>>>0;
    for(const [k,v] of Object.entries(options))set(o,k,v);
    layer('Entities').objects.push(o);return o;
  };
  const spawn=(name,x,y)=>{const o={...obj(name,x,y),point:true};layer('Spawns').objects.push(o);return o;};
  const door=(name,x,y,w,h,p={})=>{const o=obj(name,x,y,w,h);for(const [k,v]of Object.entries({open:false,locked:false,...p}))set(o,k,v);layer('Doors').objects.push(o);return o;};
  return {layer,obj,rect,sprite,spawn,door};
}
const path='public/assets/maps/classroom.tmj', school=read(path);
fs.mkdirSync('.map-recovery',{recursive:true});
if(!fs.existsSync('.map-recovery/before-campus.tmj'))fs.copyFileSync(path,'.map-recovery/before-campus.tmj');
const originalTiles=school.layers.filter(l=>l.type==='tilelayer').map(l=>structuredClone(l));
if(!school.tilesets.some(t=>t.source==='../campus/prototype.tsx'))school.tilesets.push({firstgid:2000,source:'../campus/prototype.tsx'});
const inside=editor(school,2000);
set(school,'label','Sala de TI');
// Entities with no art are requests, just like Notes. Preserve their original geometry.
for(const o of [...inside.layer('Entities').objects])if(!o.gid&&!o.type&&o.name==='keyboard'){
  inside.layer('Entities').objects.splice(inside.layer('Entities').objects.indexOf(o),1);
  inside.layer('Notes').objects.push(o);
}
const kinds={Table_office:'office-table',OfficeChair:'office-chair',chairLuxury:'luxury-chair',TableCoffe:'coffee-table',Cabinet:'cabinet',sinkBathroom:'sink',handDryer:'dryer',toilet:'toilet',doorToilet:'partition',keyboard:'keyboard'};
for(const note of inside.layer('Notes').objects){
  const p=props(note);if(p.resolvedEntity)continue;
  const direction=p.direction??p['direction:']??'';
  if(note.name==='Door'){
    // Points have no size: apply the note's explicit one-tile extension.
    const south=direction.includes('south');
    const door=inside.door(`note-door-${note.id}`,south?note.x-32:note.x,note.y,south?64:32,south?32:64,{direction,openTexture:south?'door-open-south':'door-open-right',sourceNote:note.id});
    set(note,'resolvedEntity',door.id);continue;
  }
  const asset=kinds[note.name];if(!asset)continue;
  const hasSize=note.width>0&&note.height>0;
  const w=hasSize?note.width:catalog[asset].width,h=hasSize?note.height:catalog[asset].height;
  // A point marks the center; a rectangle specifies exact top-left and dimensions.
  const x=hasSize?note.x:note.x-w/2,y=hasSize?note.y:note.y-h/2;
  const entity=inside.sprite(`${note.name}-${note.id}`,asset,x,y,w,h,{sourceNote:note.id,direction,flipX:direction==='left'});
  set(note,'resolvedEntity',entity.id);
  if(['office-table','coffee-table','cabinet','sink','toilet'].includes(asset)){
    const blocker=inside.rect(`furniture-${note.id}`,x,y,w,h);set(blocker,'sourceEntity',entity.id);
  }
  if(asset==='keyboard'){
    const nearest=inside.layer('Entities').objects.filter(o=>o.type==='monitor').sort((a,b)=>Math.hypot(a.x-note.x,a.y-note.y)-Math.hypot(b.x-note.x,b.y-note.y))[0];
    if(nearest&&Math.hypot(nearest.x-note.x,nearest.y-note.y)<50)set(nearest,'hideKeyboard',true);
  }
}
for(const door of inside.layer('Doors').objects){
  for(const key of ['open','locked','transition','interactive']){const v=props(door)[key];if(v==='true'||v==='false')set(door,key,v==='true');}
  if(props(door).targetMap==='empty-area'){set(door,'targetMap','outside');set(door,'targetSpawn','schoolEntrance');}
  if(door.name==='exit_main_door'){set(door,'open',true);set(door,'locked',false);set(door,'openTexture','door-half-open');}
}
if(!inside.layer('Spawns').objects.some(o=>o.name==='mainEntrance'))inside.spawn('mainEntrance',384,336);
// Subtract only doorway footprints from permanent blockers. Do not move/snap doors.
for(const door of inside.layer('Doors').objects){
  const next=[];
  for(const r of inside.layer('Collision').objects){
    const l=Math.max(r.x,door.x),t=Math.max(r.y,door.y),right=Math.min(r.x+r.width,door.x+door.width),bottom=Math.min(r.y+r.height,door.y+door.height);
    if(l>=right||t>=bottom){next.push(r);continue;}
    const parts=[[r.x,r.y,r.width,t-r.y],[r.x,bottom,r.width,r.y+r.height-bottom],[r.x,t,l-r.x,bottom-t],[right,t,r.x+r.width-right,bottom-t]];
    for(const [x,y,w,h]of parts)if(w>0&&h>0)next.push({...r,id:school.nextobjectid++,x,y,width:w,height:h});
  }
  inside.layer('Collision').objects=next;
}
assert.deepEqual(school.layers.filter(l=>l.type==='tilelayer'),originalTiles,'Interior tile art must not change');
save(path,school);
console.log('Interior notes resolved; all existing tile art and fractional marker coordinates preserved.');

const outsidePath='public/assets/maps/outside.tmj';
if(!fs.existsSync(outsidePath)){
  const map={compressionlevel:-1,width:30,height:24,tilewidth:32,tileheight:32,infinite:false,orientation:'orthogonal',renderorder:'right-down',type:'map',version:'1.10',tiledversion:'1.12.2',nextlayerid:9,nextobjectid:1,properties:[{name:'defaultSpawn',type:'string',value:'schoolEntrance'}],tilesets:[{firstgid:1,source:'../tilessets/school/floorsbase.tsx'},{firstgid:65,source:'../campus/materials.tsx'},{firstgid:100,source:'../campus/prototype.tsx'}],layers:['Floor','Walls','Decoration','Entities','Collision','Doors','Spawns','Notes'].map((name,i)=>i<3?{id:i+1,name,type:'tilelayer',width:30,height:24,x:0,y:0,visible:true,opacity:1,data:Array(720).fill(i===0?17:0)}:{id:i+1,name,type:'objectgroup',draworder:'topdown',x:0,y:0,visible:name!=='Collision',opacity:1,objects:[]})};
  const e=editor(map,100);
  set(map,'label','Pátio da escola');set(map,'escapeReturn',true);
  e.layer('Entities').draworder='index';
  const tiles=(layer,x,y,w,h,gid)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)e.layer(layer).data[j*30+i]=gid;};
  tiles('Walls',2,0,26,7,65);tiles('Walls',2,0,26,1,67);
  tiles('Floor',0,19,30,2,25);tiles('Floor',0,21,30,3,66);
  e.rect('facade',64,0,832,192);
  e.rect('facade-left-door',64,192,368,32);e.rect('facade-right-door',528,192,368,32);
  for(const y of [46,120])for(const x of [112,216,320,600,704,808])e.sprite(`window-${x}-${y}`,'window',x,y,40,56,{depth:-0.4});
  e.sprite('canopy','canopy',408,173,144,22,{depth:-0.3});
  e.sprite('DAA','sign',432,146,96,24,{depth:-0.2});
  e.sprite('four-steps','stairs',416,224,128,64,{depth:-1.4});
  e.sprite('entry-shadow','entry',432,192,96,32,{depth:-0.3});
  e.door('school-main-entry',432,192,96,32,{label:'Entrada da escola',open:true,transition:true,targetMap:'school',targetSpawn:'mainEntrance'});
  e.spawn('schoolEntrance',480,322);
  e.spawn('from-classroom',480,322);
  function planter(name,x,y,w,h){
    e.sprite(name,'planter',x,y,w,h,{depth:-1.3});
    e.rect(`${name}-middle`,x,y+h/6,w,h*2/3);
    e.rect(`${name}-ends`,x+w/8,y,w*3/4,h);
  }
  planter('left-garden',48,448,304,128);
  planter('right-garden',608,352,272,208);
  e.sprite('gazebo','gazebo',96,280,224,148,{depth:452});
  e.rect('gazebo-left-post',105.333,325,8.167,99.167);
  e.rect('gazebo-right-post',301.333,325,8.167,99.167);
  e.sprite('gazebo-bench','bench',128,378,144,32,{depth:420});e.rect('gazebo-bench',128,385,144,22);
  e.sprite('bench-left','bench',200,596,112,30);e.rect('bench-left',200,603,112,20);
  e.sprite('bench-right','bench',659,593,128,32);e.rect('bench-right',659,600,128,22);
  for(const [name,x,y,w,h]of [['tree-left',67,411,96,128],['tree-right',647,333,110,145],['tree-back',804,267,86,120]]){
    e.sprite(name,'tree',x,y,w,h);e.rect(`${name}-trunk`,x+w*.42,y+h*.72,w*.13,h*.23);
  }
  for(const [x,y]of [[168,477],[256,499],[642,473],[765,490],[784,388]])e.sprite(`shrub-${x}-${y}`,'shrub',x,y,56,40);
  e.rect('map-left',0,0,16,768);e.rect('map-right',944,0,16,768);e.rect('street-limit',0,744,960,24);
  const note={...e.obj('Referência exterior',32,640,250,48),text:{text:'Fachada DAA / pátio simplificado.\nPosições e colisões editáveis.',pixelsize:12,color:'#315b9c'}};e.layer('Notes').objects.push(note);
  save(outsidePath,map);
  console.log('Created compact 30 x 24 outside map with facade, stairs, planters, gazebo and reciprocal entrance.');
}
