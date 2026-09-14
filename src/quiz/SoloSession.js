export class SoloSession {
  constructor(questions,{mode='solo'}={}) {
    if(!Array.isArray(questions)||!questions.length)throw new Error('A solo session needs at least one question.');
    this.mode=mode;this.questions=questions;this.index=0;this.correctCount=0;
    this.selectedAnswer=null;this.confirmedAnswer=null;this.complete=false;
  }

  get question(){return this.complete?null:this.questions[this.index];}
  get progress(){return {current:Math.min(this.index+1,this.questions.length),total:this.questions.length};}
  get explanationVisible(){return this.confirmedAnswer!==null&&Boolean(this.question?.explanation);}

  select(answerIndex) {
    if(this.confirmedAnswer!==null||!Number.isInteger(answerIndex)||answerIndex<0||answerIndex>=this.question.answers.length)return false;
    this.selectedAnswer=answerIndex;return true;
  }

  confirm() {
    if(this.selectedAnswer===null||this.confirmedAnswer!==null)return null;
    this.confirmedAnswer=this.selectedAnswer;
    const correct=this.confirmedAnswer===this.question.correctAnswer;
    if(correct)this.correctCount+=1;
    return {correct,answerIndex:this.confirmedAnswer,correctAnswer:this.question.correctAnswer};
  }

  next() {
    if(this.confirmedAnswer===null)return false;
    if(this.index+1>=this.questions.length){this.complete=true;return true;}
    this.index+=1;this.selectedAnswer=null;this.confirmedAnswer=null;return true;
  }

  result() {
    const total=this.questions.length;
    return {correct:this.correctCount,total,accuracy:total?Math.round(this.correctCount/total*100):0};
  }
}
