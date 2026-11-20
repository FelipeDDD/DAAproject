import { defaultTiming } from './timing.js';

export function mountTimingControls(controls,effects,{signal}){
  const {
    select,castDuration,castValue,effectDuration,effectValue,castRange,rangeValue,timingHint,resetTiming,
    areaControl,areaRadius,areaValue,projectileControl,projectile,
  }=controls;
  const settings=new Map();
  const get=id=>settings.get(id)??defaultTiming(effects[id]);
  const render=()=>{
    const effect=effects[select.value];
    const current=get(select.value);
    castDuration.disabled=!effect.preparation;
    castDuration.value=current.castMs;
    castValue.textContent=effect.preparation?`${current.castMs} ms`:'Unavailable';
    effectDuration.disabled=!effect.timing;
    if(effect.timing){
      const {minMs,maxMs,stepMs}=effect.timing;
      effectDuration.min=minMs;
      effectDuration.max=maxMs;
      effectDuration.step=stepMs;
      effectDuration.value=current.effectMs;
    }
    effectValue.textContent=`${current.effectMs} ms`;
    castRange.disabled=effect.castRangePx===undefined;
    castRange.value=current.castRangePx??castRange.min;
    rangeValue.textContent=current.castRangePx===undefined?'Unavailable':`${current.castRangePx} px`;
    areaControl.hidden=!effect.areaRadius;
    areaRadius.disabled=areaControl.hidden;
    if(effect.areaRadius){
      const {minPx,maxPx,stepPx}=effect.areaRadius;
      areaRadius.min=minPx;
      areaRadius.max=maxPx;
      areaRadius.step=stepPx;
      areaRadius.value=current.areaRadiusPx;
      areaValue.textContent=`${current.areaRadiusPx} px`;
    }
    projectileControl.hidden=effect.projectileEnabled===undefined;
    projectile.disabled=projectileControl.hidden;
    projectile.checked=current.projectileEnabled??false;
    timingHint.textContent=effect.timing?.hint??'This effect has a fixed duration.';
    resetTiming.disabled=!effect.preparation&&!effect.timing&&effect.castRangePx===undefined
      &&areaControl.hidden&&projectileControl.hidden;
  };
  const set=(key,value)=>{
    settings.set(select.value,{...get(select.value),[key]:value});
    render();
  };
  castDuration.addEventListener('input',()=>set('castMs',castDuration.valueAsNumber),{signal});
  effectDuration.addEventListener('input',()=>set('effectMs',effectDuration.valueAsNumber),{signal});
  castRange.addEventListener('input',()=>set('castRangePx',castRange.valueAsNumber),{signal});
  areaRadius.addEventListener('input',()=>set('areaRadiusPx',areaRadius.valueAsNumber),{signal});
  projectile.addEventListener('change',()=>set('projectileEnabled',projectile.checked),{signal});
  resetTiming.addEventListener('click',()=>{
    settings.delete(select.value);
    render();
  },{signal});
  select.addEventListener('change',render,{signal});
  render();
  return {get};
}
