// Fit scaling changes the DOM rectangle, while the camera consumes game pixels.
export function worldPointAt(canvas,camera,clientX,clientY){
  const rect=canvas.getBoundingClientRect();
  if(!rect.width||!rect.height)return null;
  const x=(clientX-rect.left)*canvas.width/rect.width;
  const y=(clientY-rect.top)*canvas.height/rect.height;
  if(x<0||x>canvas.width||y<0||y>canvas.height)return null;
  const point=camera.getWorldPoint(x,y);
  return {x:point.x,y:point.y};
}

export function trackArenaAim(canvas,camera,fallback,{signal}){
  let pointer=null;
  let last=fallback;
  const point=()=>pointer&&worldPointAt(canvas,camera,pointer.x,pointer.y);
  const track=({clientX,clientY})=>{
    pointer={x:clientX,y:clientY};
    last=point()??last;
  };
  canvas.addEventListener('pointermove',track,{signal});
  canvas.addEventListener('pointerdown',track,{signal});
  canvas.addEventListener('pointerleave',()=>{
    last=point()??last;
    pointer=null;
  },{signal});
  return {capture:()=>({...(point()??last)})};
}
