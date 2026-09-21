export const HOTBAR_SNAP_DISTANCE=10;

export function clampFloatingPosition(position,size,viewport){
  const width=Math.max(0,Number(size?.width)||0),height=Math.max(0,Number(size?.height)||0);
  const maxX=Math.max(0,(Number(viewport?.width)||0)-width),maxY=Math.max(0,(Number(viewport?.height)||0)-height);
  return {x:Math.min(maxX,Math.max(0,Number(position?.x)||0)),y:Math.min(maxY,Math.max(0,Number(position?.y)||0))};
}

const nearest=(value,candidates,threshold)=>{
  const matches=candidates.map(candidate=>({candidate,distance:Math.abs(candidate-value)}))
    .filter(item=>item.distance<=threshold).sort((a,b)=>a.distance-b.distance);
  return matches[0]?.candidate??value;
};

export function snapFloatingPosition(position,size,viewport,targets=[],threshold=HOTBAR_SNAP_DISTANCE){
  const width=Number(size?.width)||0,height=Number(size?.height)||0,gap=threshold;
  const xCandidates=[0,(Number(viewport?.width)||0)-width];
  const yCandidates=[0,(Number(viewport?.height)||0)-height];
  for(const rect of targets){
    if(!rect||rect.width<=0||rect.height<=0)continue;
    xCandidates.push(rect.left,rect.right-width,rect.left-width-gap,rect.right+gap);
    yCandidates.push(rect.top,rect.bottom-height,rect.top-height-gap,rect.bottom+gap);
  }
  return clampFloatingPosition({
    x:nearest(position.x,xCandidates,threshold),y:nearest(position.y,yCandidates,threshold),
  },size,viewport);
}

export function loadFloatingPosition(storageKey,storage=globalThis.localStorage){
  try{
    const value=JSON.parse(storage?.getItem(storageKey)??'null');
    return Number.isFinite(value?.x)&&Number.isFinite(value?.y)?{x:value.x,y:value.y}:null;
  }catch{return null;}
}

export function saveFloatingPosition(storageKey,position,storage=globalThis.localStorage){
  const normalized={x:Math.round(position.x),y:Math.round(position.y)};
  storage?.setItem(storageKey,JSON.stringify(normalized));return normalized;
}

export function resetFloatingPosition(storageKey,storage=globalThis.localStorage){storage?.removeItem(storageKey);}

export function defaultHotbarPosition(kind,element,{doc=globalThis.document,viewport=globalThis.window}={}){
  const size=element.getBoundingClientRect(),chatElement=doc?.getElementById('room-chat');
  const chat=chatElement?.dataset?.state==='active'?chatElement.getBoundingClientRect():null;
  const inventory=doc?.querySelector('.inventory-hotbar')?.getBoundingClientRect();
  let x=12,y=(viewport?.innerHeight??size.height+12)-size.height-12;
  if(kind==='inventory'&&chat?.width){x=chat.right+12;y=chat.top;}
  if(kind==='emotes'&&inventory?.width){x=inventory.right+12;y=inventory.top;}
  const dev=doc?.querySelector('.boss-dev-tools')?.getBoundingClientRect();
  const position=clampFloatingPosition({x,y},size,{width:viewport?.innerWidth,height:viewport?.innerHeight});
  if(dev&&position.x<dev.right&&position.x+size.width>dev.left&&position.y<dev.bottom&&position.y+size.height>dev.top)
    position.y=Math.max(0,dev.top-size.height-12);
  return position;
}

export class FloatingHotbar {
  constructor({root,handle,resetButton,storageKey,kind,getSnapTargets=()=>[]}){
    Object.assign(this,{root,handle,resetButton,storageKey,kind,getSnapTargets});
    this.onPointerDown=event=>this.begin(event);this.onPointerMove=event=>this.move(event);
    this.onPointerUp=event=>this.end(event);this.onResize=()=>this.constrain();
    this.onReset=event=>{event.stopPropagation();this.reset();};
    handle.addEventListener('pointerdown',this.onPointerDown);resetButton.addEventListener('click',this.onReset);
    window.addEventListener('pointermove',this.onPointerMove);window.addEventListener('pointerup',this.onPointerUp);
    window.addEventListener('resize',this.onResize);window.addEventListener('daa-viewport-resize',this.onResize);
    this.restore();
  }
  viewport(){return {width:window.innerWidth,height:window.innerHeight};}
  size(){return this.root.getBoundingClientRect();}
  clamp(position){return clampFloatingPosition(position,this.size(),this.viewport());}
  apply(position){this.root.style.left=`${position.x}px`;this.root.style.top=`${position.y}px`;this.root.style.right='auto';this.root.style.bottom='auto';this.root.style.transform='none';}
  fallback(){return defaultHotbarPosition(this.kind,this.root);}
  restore(){this.apply(this.clamp(loadFloatingPosition(this.storageKey)??this.fallback()));}
  constrain(){const rect=this.size();this.apply(this.clamp({x:rect.left,y:rect.top}));}
  begin(event){
    if(event.button!==0||event.target.closest('button'))return;
    const rect=this.size();this.dragging={pointerId:event.pointerId,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top};
    this.handle.setPointerCapture?.(event.pointerId);event.preventDefault();
  }
  move(event){if(this.dragging?.pointerId===event.pointerId)this.apply(this.clamp({x:event.clientX-this.dragging.offsetX,y:event.clientY-this.dragging.offsetY}));}
  end(event){
    if(this.dragging?.pointerId!==event.pointerId)return;
    const rect=this.size(),targets=this.getSnapTargets().map(element=>element?.getBoundingClientRect?.()).filter(Boolean);
    const position=snapFloatingPosition({x:rect.left,y:rect.top},rect,this.viewport(),targets);
    this.apply(position);saveFloatingPosition(this.storageKey,position);this.dragging=null;
  }
  reset(){resetFloatingPosition(this.storageKey);this.apply(this.clamp(this.fallback()));}
  destroy(){
    this.handle.removeEventListener('pointerdown',this.onPointerDown);this.resetButton.removeEventListener('click',this.onReset);
    window.removeEventListener('pointermove',this.onPointerMove);window.removeEventListener('pointerup',this.onPointerUp);
    window.removeEventListener('resize',this.onResize);window.removeEventListener('daa-viewport-resize',this.onResize);
  }
}
