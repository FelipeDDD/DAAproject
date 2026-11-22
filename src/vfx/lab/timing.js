export function defaultTiming(effect,variant=effect.defaultVariant){
  return {
    ...(effect.defaultVariant?{variant}:{}),
    castMs:effect.preparation?.durationMs??0,
    effectMs:effect.variantDurations?.[variant]??effect.timing?.defaultMs??(effect.durationMs-(effect.timing?.leadMs??0)),
    ...(effect.castRangePx!==undefined?{castRangePx:effect.castRangePx}:{}),
    ...(effect.areaRadius?{areaRadiusPx:effect.areaRadius.defaultPx}:{}),
    ...(effect.projectileEnabled!==undefined?{projectileEnabled:effect.projectileEnabled}:{}),
  };
}

function finiteClamped(value,fallback,min,max){
  return Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback;
}

export function resolveTiming(effect,settings={},casting=true){
  const defaults=defaultTiming(effect,settings.variant);
  const {timing}=effect;
  const castMs=effect.preparation&&(casting||effect.preparation.always)?
    finiteClamped(settings.castMs,defaults.castMs,0,1500):0;
  const effectMs=timing?finiteClamped(settings.effectMs,defaults.effectMs,timing.minMs,timing.maxMs):defaults.effectMs;
  const durationMs=effectMs+(timing?.leadMs??0);
  return {castMs,durationMs,speed:timing?.mode==='playback'?effect.durationMs/durationMs:1};
}
