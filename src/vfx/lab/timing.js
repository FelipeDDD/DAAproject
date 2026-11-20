export function defaultTiming(effect){
  return {
    castMs:effect.preparation?.durationMs??0,
    effectMs:effect.timing?.defaultMs??(effect.durationMs-(effect.timing?.leadMs??0)),
    ...(effect.castRangePx!==undefined?{castRangePx:effect.castRangePx}:{}),
    ...(effect.areaRadius?{areaRadiusPx:effect.areaRadius.defaultPx}:{}),
    ...(effect.projectileEnabled!==undefined?{projectileEnabled:effect.projectileEnabled}:{}),
  };
}

function finiteClamped(value,fallback,min,max){
  return Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback;
}

export function resolveTiming(effect,settings={},casting=true){
  const defaults=defaultTiming(effect);
  const {timing}=effect;
  const castMs=effect.preparation&&casting?finiteClamped(settings.castMs,defaults.castMs,0,1500):0;
  const effectMs=timing?finiteClamped(settings.effectMs,defaults.effectMs,timing.minMs,timing.maxMs):defaults.effectMs;
  const durationMs=effectMs+(timing?.leadMs??0);
  return {castMs,durationMs,speed:timing?.mode==='playback'?effect.durationMs/durationMs:1};
}
