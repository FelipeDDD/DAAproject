import { defaultTiming } from './timing.js';
import { ALLY_SMOKE_OPACITY } from './visibilityDemo.js';

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
    const variants=Object.keys(effect.variants??{});
    controls.variantControl.hidden=variants.length<2;
    controls.variant.replaceChildren(...variants.map(name=>new Option(name,name)));
    controls.variant.value=current.variant??variants[0]??'';
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
    rangeValue.textContent=effect.fixedReachPx?`Fixed · ${Math.round(effect.fixedReachPx)} px`:
      current.castRangePx===undefined?'Unavailable':`${current.castRangePx} px`;
    const area=effect.areaRadius??effect.variantRadius?.[current.variant];
    areaControl.hidden=!area;
    areaRadius.disabled=areaControl.hidden;
    if(area){
      const {minPx,maxPx,stepPx}=area;
      areaRadius.min=minPx;
      areaRadius.max=maxPx;
      areaRadius.step=stepPx;
      areaRadius.value=current.areaRadiusPx??area.defaultPx;
      areaValue.textContent=`${areaRadius.value} px`;
    }
    controls.camoControls.hidden=current.variant!=='Camouflage';
    controls.mode.value=current.mode??'teams';
    controls.observer.value=current.observer??'blue';
    controls.observer.disabled=controls.mode.value!=='teams';
    controls.opacity.value=current.opacity??ALLY_SMOKE_OPACITY;
    controls.opacityValue.textContent=Math.round(controls.opacity.valueAsNumber*100)+'%';
    projectileControl.hidden=effect.projectileEnabled===undefined;
    projectile.disabled=projectileControl.hidden;
    projectile.checked=current.projectileEnabled??false;
    timingHint.textContent=select.value==='lash'?'Click to lash. Match the tip to the selected dummy. Green confirms a hit.':
      select.value==='drain'?'Aim at the selected dummy. A hit returns four orbs to your hand.':
      select.value==='snare'?'Cast Preparation holds the ground circle before the roots emerge.':
      current.variant==='Camouflage'?'Cast over Sarina, then walk in or out. Observer and opacity change live.':
      current.variant==='Sentry'||current.variant==='Proximity mine'?'Blue is friendly. Red targets trigger the field.':
      effect.clickToCast?'Click in the arena to cast within range.':
      effect.timing?.hint??'This effect has a fixed duration.';
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
  for(const id of ['mode','observer'])controls[id].addEventListener('change',()=>set(id,controls[id].value),{signal});
  controls.opacity.addEventListener('input',()=>set('opacity',controls.opacity.valueAsNumber),{signal});
  projectile.addEventListener('change',()=>set('projectileEnabled',projectile.checked),{signal});
  controls.variant.addEventListener('change',()=>{
    const id=select.value,variant=controls.variant.value;
    const next={...get(id),variant,effectMs:defaultTiming(effects[id],variant).effectMs};
    if(effects[id].variantRadius&&variant!==get(id).variant)delete next.areaRadiusPx;
    settings.set(id,next);
    render();
  },{signal});
  resetTiming.addEventListener('click',()=>{
    settings.delete(select.value);
    render();
  },{signal});
  render();
  return {get,render};
}
