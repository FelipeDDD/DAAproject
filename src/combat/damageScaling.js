export const DAMAGE_PERCENT=Object.freeze({default:100,min:50,max:200,step:5});

export function scaleDamage(base,percent=DAMAGE_PERCENT.default){
  return Math.round(base*percent/100);
}
