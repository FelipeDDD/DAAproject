import { SoloSession } from './SoloSession.js';
import {
  IT_CHALLENGE_DURATION_MS,
  IT_CHALLENGE_FEEDBACK_DELAY_MS,
  IT_CHALLENGE_POINTS,
  IT_CHALLENGE_QUESTION_TIMEOUT_MS,
} from './itChallengeRules.js';

export function challengeAssessment(accuracy) {
  if(accuracy>=90)return 'Excellent';
  if(accuracy>=75)return 'Good';
  if(accuracy>=50)return 'Keep practicing';
  return 'Needs practice';
}

export function challengeAccuracy(correct,wrong){
  const answered=correct+wrong;
  return answered?Math.round(correct/answered*1000)/10:0;
}

export class SoloChallengeSession extends SoloSession {
  constructor(questions,{
    durationMs=IT_CHALLENGE_DURATION_MS,
    questionTimeoutMs=IT_CHALLENGE_QUESTION_TIMEOUT_MS,
    feedbackDelayMs=IT_CHALLENGE_FEEDBACK_DELAY_MS,
    points=IT_CHALLENGE_POINTS,
    now=Date.now(),
  }={}) {
    super(questions,{mode:'challenge'});
    Object.assign(this,{
      durationMs,questionTimeoutMs,feedbackDelayMs,points,
      startedAt:now,deadline:now+durationMs,questionStartedAt:now,
      score:0,wrongCount:0,skippedCount:0,manualSkipCount:0,timeoutSkipCount:0,
      mediumCorrect:0,hardCorrect:0,outcomes:[],feedbackUntil:null,finishReason:null,
    });
  }

  get resolving(){return this.feedbackUntil!==null;}
  get explanationVisible(){return false;}

  remainingMs(now=Date.now()){return Math.max(0,this.deadline-now);}
  totalTimeRatio(now=Date.now()){return this.durationMs?this.remainingMs(now)/this.durationMs:0;}
  questionRemainingMs(now=Date.now()){
    return Math.min(this.remainingMs(now),Math.max(0,this.questionTimeoutMs-(now-this.questionStartedAt)));
  }
  questionTimeRatio(now=Date.now()){
    return this.questionTimeoutMs?this.questionRemainingMs(now)/this.questionTimeoutMs:0;
  }

  select(answerIndex){
    if(this.resolving||this.complete)return false;
    return super.select(answerIndex);
  }

  confirm(now=Date.now()) {
    if(this.complete||this.resolving)return null;
    if(this.remainingMs(now)<=0){this.finish('time');return {type:'complete'};}
    if(this.questionRemainingMs(now)<=0)return this.skip('timeoutSkip',now);
    const result=super.confirm();
    if(!result)return null;
    const points=result.correct
      ?(this.question.difficulty==='hard'?this.points.hardCorrect:this.points.mediumCorrect)
      :this.points.wrong;
    this.score+=points;
    if(result.correct){
      if(this.question.difficulty==='hard')this.hardCorrect+=1;
      else this.mediumCorrect+=1;
    }else this.wrongCount+=1;
    const outcome={
      questionIndex:this.index,type:'answer',answerIndex:result.answerIndex,
      correct:result.correct,points,
    };
    this.outcomes.push(outcome);this.feedbackUntil=now+this.feedbackDelayMs;
    return outcome;
  }

  skip(type='manualSkip',now=Date.now()) {
    if(!['manualSkip','timeoutSkip'].includes(type)||this.complete||this.resolving)return null;
    if(this.remainingMs(now)<=0){this.finish('time');return {type:'complete'};}
    this.score+=this.points.skip;this.skippedCount+=1;
    if(type==='manualSkip')this.manualSkipCount+=1;
    else this.timeoutSkipCount+=1;
    const outcome={questionIndex:this.index,type,points:this.points.skip};
    this.outcomes.push(outcome);
    this.advance(now);
    return outcome;
  }

  advance(now=Date.now()) {
    if(this.index+1>=this.questions.length){this.finish('questions');return false;}
    this.index+=1;this.selectedAnswer=null;this.confirmedAnswer=null;
    this.feedbackUntil=null;this.questionStartedAt=now;
    return true;
  }

  tick(now=Date.now()) {
    if(this.complete)return null;
    if(this.remainingMs(now)<=0){this.finish('time');return {type:'complete'};}
    if(this.resolving){
      if(now<this.feedbackUntil)return null;
      const advanced=this.advance(now);
      return {type:advanced?'advanced':'complete'};
    }
    if(this.questionRemainingMs(now)<=0)return this.skip('timeoutSkip',now);
    return null;
  }

  finish(reason='time'){
    if(this.complete)return false;
    this.complete=true;this.finishReason=reason;this.feedbackUntil=null;
    return true;
  }

  next(){return false;}

  result() {
    const totalAnswered=this.correctCount+this.wrongCount;
    const accuracy=challengeAccuracy(this.correctCount,this.wrongCount);
    return {
      score:this.score,correct:this.correctCount,wrong:this.wrongCount,skipped:this.skippedCount,
      manualSkip:this.manualSkipCount,timeoutSkip:this.timeoutSkipCount,
      mediumCorrect:this.mediumCorrect,hardCorrect:this.hardCorrect,totalAnswered,accuracy,
      assessment:challengeAssessment(accuracy),
    };
  }

  submission(){
    return this.outcomes.map(({questionIndex,type,answerIndex})=>({
      questionIndex,type,...(answerIndex===undefined?{}:{answerIndex}),
    }));
  }
}
