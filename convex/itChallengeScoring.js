import { IT_CHALLENGE_POINTS } from '../src/quiz/itChallengeRules.js';

export function itChallengeAccuracy(correct,wrong){
  const answered=correct+wrong;
  return answered?Math.round(correct/answered*1000)/10:0;
}

export function scoreItChallengeOutcomes(questions,outcomes,lastViewedQuestionIndex){
  if(!Number.isInteger(lastViewedQuestionIndex)||lastViewedQuestionIndex<0
    ||lastViewedQuestionIndex>=questions.length)throw new Error('Invalid viewed question.');
  const seen=new Set(),records=[];
  const result={score:0,correct:0,wrong:0,skipped:0,manualSkip:0,timeoutSkip:0,mediumCorrect:0,hardCorrect:0};
  for(const outcome of outcomes){
    if(!Number.isInteger(outcome.questionIndex)||outcome.questionIndex<0
      ||outcome.questionIndex>lastViewedQuestionIndex||seen.has(outcome.questionIndex))
      throw new Error('Invalid IT Challenge outcome.');
    seen.add(outcome.questionIndex);
    const question=questions[outcome.questionIndex];
    if(outcome.type==='answer'){
      if(!Number.isInteger(outcome.answerIndex)||outcome.answerIndex<0||outcome.answerIndex>=question.answerCount)
        throw new Error('Invalid IT Challenge answer.');
      const correct=outcome.answerIndex===question.correctAnswer;
      if(correct){
        result.correct+=1;
        if(question.difficulty==='hard'){result.hardCorrect+=1;result.score+=IT_CHALLENGE_POINTS.hardCorrect;}
        else{result.mediumCorrect+=1;result.score+=IT_CHALLENGE_POINTS.mediumCorrect;}
      }else{result.wrong+=1;result.score+=IT_CHALLENGE_POINTS.wrong;}
      records.push({question,outcome,correct});
    }else if(outcome.type==='manualSkip'||outcome.type==='timeoutSkip'){
      if(outcome.answerIndex!==undefined)throw new Error('A skipped question cannot include an answer.');
      result.skipped+=1;result[outcome.type]+=1;result.score+=IT_CHALLENGE_POINTS.skip;
      records.push({question,outcome});
    }else throw new Error('Invalid IT Challenge outcome type.');
  }
  for(let index=0;index<lastViewedQuestionIndex;index+=1){
    if(!seen.has(index))throw new Error('A completed IT Challenge question is missing its outcome.');
  }
  result.totalAnswered=result.correct+result.wrong;
  result.accuracy=itChallengeAccuracy(result.correct,result.wrong);
  return {result,records};
}

export function isNewPersonalBest(previous,score){return !previous||score>previous.score;}
