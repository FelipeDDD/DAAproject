export const BOSS_FIXED_SPEECH=Object.freeze({
  activation:'Es ist bereits 08:01 Uhr, du bist zu spät!',
  followup:'Unterschreib sofort die Anwesenheitsliste!',
  phase2:'JETZT wird die Anwesenheitsliste kontrolliert!',
  phase3:'Dann zwinge ich dich eben zu unterschreiben!',
  death:'„Ich kann nicht mehr... ich kündige!“',
});

export const BOSS_RANDOM_SPEECH=Object.freeze({
  1:Object.freeze([
    'Wo ist deine Anwesenheitsliste?',
    'Sofort unterschreiben!',
    'Pünktlichkeit ist Pflicht!',
  ]),
  2:Object.freeze([
    'Du kommst schon wieder zu spät!',
    'Das wird sofort dokumentiert!',
    'Ich kontrolliere jetzt alles persönlich!',
    'Heute entkommst du der Liste nicht!',
  ]),
  3:Object.freeze([
    'Unterschreib. Sofort!',
    'Die Liste wartet nicht!',
    'Jetzt reicht es!',
  ]),
});

export function speechForPhase(phase,random=Math.random){
  const pool=BOSS_RANDOM_SPEECH[phase]??BOSS_RANDOM_SPEECH[1];
  return pool[Math.min(pool.length-1,Math.floor(Math.max(0,random())*pool.length))];
}
