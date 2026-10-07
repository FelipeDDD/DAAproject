import { characterById } from '../../src/characters.js';
import { characterVisual, idleFrame, walkFrames } from '../../src/characterVisuals.js';
import { createFelipeRecolorCanvas } from '../../src/art/felipeRecolor.js';

const character=characterById('felipe');
const directions=['down','left','right','up'];
const controls={play:document.querySelector('#play'),pose:document.querySelector('#pose'),
  fps:document.querySelector('#fps'),fpsValue:document.querySelector('#fps-value'),status:document.querySelector('#status')};
let playing=true,frame=0,lastFrame=0,ready=false;
const experiment=characterVisual(character,'level3Preview');
const previews=[['experiment',experiment],['previous',{...experiment,
  asset:'assets/characters/experimental/felipe-level3.png',frameWidth:64,frameHeight:72,scale:1,
}],['current',characterVisual(character,'new')],
  ['sarina',characterVisual(characterById('sarina'),'level3Preview')],
  ['sarina-current',characterVisual(characterById('sarina'),'new')],
  ['michael',characterVisual(characterById('michael'),'level3Preview')],
  ['yassin',characterVisual(characterById('jassine'),'level3Preview')]].map(([id,visual])=>{
  const image=new Image();
  const context=document.getElementById(id).getContext('2d');
  image.src=`${import.meta.env.BASE_URL}${visual.asset}`;
  return {visual,image,context};
});
let recolored;

function render(){
  if(!ready)return;
  for(const {visual,image,context}of previews){
    const source=visual===experiment&&document.getElementById('recolor').checked?recolored:image;
    // Two backing pixels per world pixel preserve the HD texture detail.
    context.clearRect(0,0,576,160);context.imageSmoothingEnabled=false;
    context.strokeStyle='#8095a5';context.lineWidth=1;
    context.beginPath();context.moveTo(0,152.5);context.lineTo(576,152.5);context.stroke();
    directions.forEach((direction,index)=>{
      const walk=walkFrames(direction,visual);
      const spriteFrame=controls.pose.value==='idle'?idleFrame(direction):walk[frame%walk.length];
      const {frameWidth,frameHeight}=visual;
      context.drawImage(source,(spriteFrame%6)*frameWidth,Math.floor(spriteFrame/6)*frameHeight,
        frameWidth,frameHeight,index*144+8,8,128,144);
    });
  }
  controls.status.textContent=`${controls.pose.value==='idle'?'Idle':`Walk frame ${frame%5+1} of 5`} · Same world size at both resolutions · Experimental speed: ${controls.fps.value} FPS`;
}
function setPlaying(value){playing=value;lastFrame=performance.now();controls.play.textContent=playing?'Pause':'Play';}
controls.play.addEventListener('click',()=>setPlaying(!playing));
controls.pose.addEventListener('change',()=>{frame=0;render();});
controls.fps.addEventListener('input',()=>{controls.fpsValue.value=controls.fps.value;render();});
document.querySelector('#step').addEventListener('click',()=>{setPlaying(false);frame++;render();});
document.querySelector('#recolor').addEventListener('change',render);

try{
  await Promise.all(previews.map(({image})=>image.decode()));
  const maskImage=new Image();maskImage.src=`${import.meta.env.BASE_URL}${experiment.recolorMaskAsset}`;
  await maskImage.decode();
  recolored=createFelipeRecolorCanvas(previews[0].image,undefined,maskImage);
  ready=true;
  render();
  const tick=now=>{
    if(playing&&now-lastFrame>=1000/Number(controls.fps.value)){frame++;lastFrame=now;render();}
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}catch{
  controls.status.textContent='Could not load the sprites. Open this page through the Vite development server.';
}
