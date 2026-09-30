// Deterministic, local-only runner. Seconds/world pixels, no Phaser or backend.
export const RUNNER_WIDTH=720;
export const RUNNER_HEIGHT=250;
export const RUNNER_GROUND=190;
const TARGET_TIME=11,FINAL_DURATION=3.4,SPEED=230;
const OBSTACLES=[
  {at:3,label:'FLOPPY',kind:'floppy',width:30,height:37},
  {at:5.2,label:'PRINTER',kind:'printer',width:44,height:32},
  {at:7.4,label:'EXCEL',kind:'excel',width:30,height:42},
  {at:9.6,label:'BLUE SCREEN',kind:'bsod',width:38,height:40},
];

export function createExecutiveRunner(){return {phase:'running',elapsed:0,height:0,velocity:0,finalTime:0};}

export function jumpExecutiveRunner(state){
  if(state.phase!=='running'||state.height>0)return false;
  state.velocity=560;return true;
}

export function runnerObstacles(state){
  return OBSTACLES.map(obstacle=>({...obstacle,x:85+(obstacle.at-state.elapsed)*SPEED}))
    .filter(obstacle=>obstacle.x>-60&&obstacle.x<RUNNER_WIDTH+60);
}

export function stepExecutiveRunner(state,seconds){
  if(!Number.isFinite(seconds)||seconds<=0)return state;
  // Substeps keep collision reliable at low frame rates; UI caps hidden-tab dt.
  let remaining=seconds;
  while(remaining>0&&['running','final'].includes(state.phase)){
    const dt=Math.min(remaining,1/120);remaining-=dt;
    state.elapsed+=dt;
    state.height=Math.max(0,state.height+state.velocity*dt-700*dt*dt);
    state.velocity=state.height>0?state.velocity-1400*dt:0;
    if(state.phase==='final'){
      state.finalTime+=dt;
      if(state.finalTime>=FINAL_DURATION)state.phase='won';
      continue;
    }
    if(state.elapsed>=TARGET_TIME){state.phase='final';continue;}
    for(const obstacle of runnerObstacles(state)){
      if(obstacle.x<115&&obstacle.x+obstacle.width>92&&state.height<obstacle.height-5){
        state.phase='failed';break;
      }
    }
  }
  return state;
}

export function drawExecutiveRunner(ctx,state){
  ctx.fillStyle='#101c29';ctx.fillRect(0,0,RUNNER_WIDTH,RUNNER_HEIGHT);
  ctx.strokeStyle='#24374a';ctx.lineWidth=1;
  for(let x=0;x<720;x+=40){ctx.beginPath();ctx.moveTo(x,35);ctx.lineTo(x,190);ctx.stroke();}
  ctx.strokeStyle='#8db3a5';ctx.beginPath();ctx.moveTo(0,191);ctx.lineTo(720,191);ctx.stroke();
  ctx.font='12px monospace';ctx.textAlign='left';ctx.fillStyle='#bed8e3';
  ctx.fillText(state.phase==='final'||state.phase==='won'
    ?'FINAL AUTHENTICATION TARGET: GILL BATES':'LEGACY EXECUTIVE AUTHENTICATION PROTOCOL',18,25);
  for(let i=0;i<18;i++){
    ctx.fillStyle='#46616c';ctx.fillRect((i*46-state.elapsed*100%46),207+(i%3)*9,12,2);
  }
  if(state.phase==='running'||state.phase==='failed')for(const o of runnerObstacles(state)){
    const y=RUNNER_GROUND-o.height;
    ctx.fillStyle={floppy:'#8595ba',printer:'#c5ced3',excel:'#4fb37c',bsod:'#3971b9'}[o.kind];
    ctx.fillRect(o.x,y,o.width,o.height);ctx.fillStyle='#18293c';
    ctx.fillRect(o.x+5,y+5,o.width-10,9);ctx.fillStyle='#ebf2ee';
    ctx.fillRect(o.x+7,y+19,o.width-14,7);
    ctx.fillStyle='#bed8e3';ctx.font='10px monospace';ctx.fillText(o.label,o.x-4,237);
  }
  const final=['final','won'].includes(state.phase),t=state.finalTime;
  const dinoX=85+(final?Math.min(t/2,1)*70:0),y=RUNNER_GROUND-state.height;
  // Original code-drawn dinosaur: broad snout, tiny arms, running feet.
  ctx.fillStyle='#87d797';ctx.fillRect(dinoX,y-40,29,31);
  ctx.fillRect(dinoX+15,y-60,31,27);ctx.fillRect(dinoX+36,y-57,15,20);
  ctx.fillRect(dinoX-15,y-33,19,10);ctx.fillRect(dinoX-22,y-42,10,16);
  ctx.fillRect(dinoX+28,y-29,14,5);ctx.fillStyle='#10232b';ctx.fillRect(dinoX+36,y-54,5,5);
  const stride=state.height>0?0:Math.sin(state.elapsed*22)*5;
  ctx.fillStyle='#87d797';ctx.fillRect(dinoX+3,y-11,7,11+stride);
  ctx.fillRect(dinoX+21,y-11,7,11-stride);
  if(final){
    ctx.fillStyle='#101c29';ctx.fillRect(dinoX+31,y-38,t>=2?23:15,t>=2?15:4);
    const swallow=Math.max(0,Math.min(1,(t-2)/0.9));
    const targetX=620-Math.min(t/2,1)*430;
    if(swallow<1){
      ctx.save();ctx.translate(targetX,RUNNER_GROUND-27);ctx.scale(1-swallow,1-swallow);
      // Fictional 90s executive caricature: giant glasses, side part, tiny tie.
      ctx.fillStyle='#688bb6';ctx.fillRect(-12,-17,25,32);
      ctx.fillStyle='#243449';ctx.fillRect(-10,15,8,12);ctx.fillRect(4,15,8,12);
      ctx.fillStyle='#f2c79f';ctx.fillRect(-18,-52,37,34);
      ctx.fillStyle='#82684c';ctx.fillRect(-19,-56,38,10);ctx.fillRect(10,-48,10,9);
      ctx.strokeStyle='#162a40';ctx.lineWidth=3;ctx.strokeRect(-16,-42,14,10);ctx.strokeRect(3,-42,14,10);
      ctx.beginPath();ctx.moveTo(-2,-38);ctx.lineTo(3,-38);ctx.stroke();
      ctx.fillStyle='#c6474e';ctx.fillRect(-1,-15,5,21);
      ctx.fillStyle='#794e40';ctx.fillRect(-4,-26,14,3);ctx.restore();
    }
    ctx.fillStyle='#e7d49b';ctx.font='12px monospace';ctx.fillText(t<2?'GILL BATES':'* gulp *',targetX-24,108);
  }
}
