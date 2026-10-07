export class PuzzleQuizClient {
  constructor(presence,source){this.presence=presence;this.source=source;this.index=-1;}
  async start(){
    const result=await this.mutate('start',{source:this.source});this.runId=result.runId;
    return this;
  }
  prepare(question){
    const questionIndex=++this.index;
    const ready=this.mutate('prepare',{runId:this.runId,questionIndex,questionId:question.id});
    // Handle early rejections without losing the rejected promise for answer().
    ready.catch(()=>{});
    this.presentation={question,questionIndex,ready};
  }
  async answer(index){
    const {question,questionIndex,ready}=this.presentation;
    await ready.catch(()=>this.mutate('prepare',{runId:this.runId,questionIndex,questionId:question.id}));
    return this.mutate('answer',{runId:this.runId,questionIndex,answer:question.answers[index]});
  }
  mutate(method,args){
    const {playerId,sessionId}=this.presence.identity;
    return this.presence.client.mutation(this.presence.api.puzzleQuiz[method],{playerId,sessionId,...args});
  }
}
