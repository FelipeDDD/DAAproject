export const DEV_PUZZLE_ONE_ANSWER_KEY='daa-dev-puzzle-one-answer';

let oneAnswerMode=false;

export function initializeDevPuzzleSettings(storage=globalThis.localStorage){
  try{oneAnswerMode=storage?.getItem(DEV_PUZZLE_ONE_ANSWER_KEY)==='true';}
  catch{oneAnswerMode=false;}
  return oneAnswerMode;
}

export function devPuzzleOneAnswerEnabled(){return oneAnswerMode;}

export function setDevPuzzleOneAnswerEnabled(enabled,storage=globalThis.localStorage){
  oneAnswerMode=Boolean(enabled);
  try{storage?.setItem(DEV_PUZZLE_ONE_ANSWER_KEY,String(oneAnswerMode));}catch{}
  return oneAnswerMode;
}
