export const QUIZ_CORRECT_REWARD = 1;
export const ROULETTE_COST = 5;

// Only implemented reward types are enabled initially.
export const ROULETTE_REWARDS = Object.freeze([
  {id:'nothing',weight:50,name:'Nothing',icon:'?',reward:{type:'none'}},
  {id:'coins_2',weight:30,name:'Coins ×2',icon:'◉',reward:{type:'coins',amount:2}},
  {id:'coins_5',weight:19,name:'Coins ×5',icon:'◉',reward:{type:'coins',amount:5}},
  {id:'coins_20',weight:1,name:'Coins ×20',icon:'★',reward:{type:'coins',amount:20}},
]);
