import { SoloSession } from './SoloSession.js';

export const CHALLENGE_POINTS_PER_CORRECT=10;
export const CHALLENGE_QUESTION_DURATION_MS=60_000;

export function challengeAssessment(accuracy) {
  if(accuracy>=90)return 'Excellent';
  if(accuracy>=75)return 'Good';
  if(accuracy>=50)return 'Keep practicing';
  return 'Needs practice';
}

export class SoloChallengeSession extends SoloSession {
  constructor(questions,{
    pointsPerCorrect=CHALLENGE_POINTS_PER_CORRECT,
    questionDurationMs=CHALLENGE_QUESTION_DURATION_MS,
    now=Date.now(),
  }={}) {
    super(questions,{mode:'challenge'});
    this.pointsPerCorrect=pointsPerCorrect;this.questionDurationMs=questionDurationMs;this.score=0;
    this.questionStartedAt=now;this.resolvedRemainingMs=null;this.timedOut=false;
  }

  remainingMs(now=Date.now()) {
    return this.resolvedRemainingMs??Math.max(0,this.questionDurationMs-(now-this.questionStartedAt));
  }

  timeRatio(now=Date.now()){return this.questionDurationMs?this.remainingMs(now)/this.questionDurationMs:0;}

  confirm(now=Date.now()) {
    const remaining=this.remainingMs(now);
    if(remaining<=0)return this.expire(now);
    const result=super.confirm();
    if(result){
      this.resolvedRemainingMs=remaining;
      if(result.correct)this.score+=this.pointsPerCorrect;
    }
    return result;
  }

  expire(now=Date.now()) {
    if(this.confirmedAnswer!==null||this.remainingMs(now)>0)return null;
    this.confirmedAnswer=-1;this.resolvedRemainingMs=0;this.timedOut=true;
    return {correct:false,answerIndex:null,correctAnswer:this.question.correctAnswer,timedOut:true};
  }

  next(now=Date.now()) {
    const advanced=super.next();
    if(advanced&&!this.complete){
      this.questionStartedAt=now;this.resolvedRemainingMs=null;this.timedOut=false;
    }
    return advanced;
  }

  result() {
    const result=super.result();
    return {...result,score:this.score,assessment:challengeAssessment(result.accuracy)};
  }

  completionRecord({characterId,category=null,difficulty=null,completedAt=Date.now()}={}) {
    const result=this.result();
    return {
      characterId,mode:this.mode,category,difficulty,questionCount:result.total,
      score:result.score,correctAnswers:result.correct,accuracy:result.accuracy,completedAt,
    };
  }
}
