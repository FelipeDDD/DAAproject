let staticQuestionsPromise;
let generatedQuestionsPromise;
let bankPromise;

export function loadOffice3Questions(){
  if(!staticQuestionsPromise){
    staticQuestionsPromise=import('../../convex/quizStaticQuestions.generated.js')
      .then(module=>module.default).catch(error=>{staticQuestionsPromise=null;throw error;});
  }
  return staticQuestionsPromise;
}

function loadGeneratedQuestions(){
  if(!generatedQuestionsPromise){
    generatedQuestionsPromise=import('../../convex/quizGeneratedQuestions.js')
      .then(module=>module.GENERATED_QUIZ_QUESTIONS).catch(error=>{generatedQuestionsPromise=null;throw error;});
  }
  return generatedQuestionsPromise;
}

export function loadQuizBank(){
  if(!bankPromise){
    bankPromise=Promise.all([loadOffice3Questions(),loadGeneratedQuestions()]).then(([
      staticQuestions,generatedQuestions,
    ])=>({
      staticQuestions,
      generatedQuestions,
    })).catch(error=>{
      bankPromise=null;
      throw error;
    });
  }
  return bankPromise;
}

export function materializeQuizBankQuestion(template,random=Math.random){
  const generated=template.type==='generated'?template.generate(random):template;
  const concrete={
    id:template.id,category:template.category,topic:generated.topic??template.topic??null,
    difficulty:template.difficulty,question:generated.question,answers:[...generated.answers],
    correctAnswer:generated.correctAnswer,
    ...(generated.explanation!==undefined?{explanation:generated.explanation}:{}),
    ...(generated.media!==undefined?{media:generated.media}:{}),
  };
  if(typeof concrete.question!=='string'||concrete.answers.length!==4
    ||new Set(concrete.answers).size!==4||!Number.isInteger(concrete.correctAnswer)
    ||concrete.correctAnswer<0||concrete.correctAnswer>=concrete.answers.length)
    throw new Error(`Invalid concrete quiz question: ${template.id}`);
  const tagged=concrete.answers.map((answer,index)=>({answer,isCorrect:index===concrete.correctAnswer}));
  for(let index=tagged.length-1;index>0;index--){
    const target=Math.floor(random()*(index+1));
    [tagged[index],tagged[target]]=[tagged[target],tagged[index]];
  }
  const correctAnswer=tagged.findIndex(answer=>answer.isCorrect);
  return {...concrete,answers:tagged.map(answer=>answer.answer),correctAnswer};
}
