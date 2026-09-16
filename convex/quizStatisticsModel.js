import { questionTemplateId } from './quizSelection.js';

export const QUIZ_STATISTICS_MODES=Object.freeze(['study','challenge','multiplayer']);
export const WEAK_STATISTICS_MINIMUM_ANSWERS=5;

export function normalizeStatisticsQuestionId(questionId){return questionTemplateId(questionId);}

export function statisticAccuracy(correct,answered){
  return answered?Math.round(correct/answered*1000)/10:0;
}

export function applyAttemptToBucket(bucket,attempt){
  const correct=(bucket?.correct??0)+(attempt.correct?1:0);
  const wrong=(bucket?.wrong??0)+(attempt.correct?0:1);
  return {correct,wrong,answered:correct+wrong};
}

function summarize(rows){
  const totals=rows.reduce((result,row)=>({
    correct:result.correct+row.correct,
    wrong:result.wrong+row.wrong,
    answered:result.answered+row.answered,
  }),{correct:0,wrong:0,answered:0});
  return {...totals,accuracy:statisticAccuracy(totals.correct,totals.answered)};
}

function grouped(rows,key){
  const groups=new Map();
  for(const row of rows){
    const value=row[key];
    if(value===null||value===undefined||value==='')continue;
    const list=groups.get(value)??[];list.push(row);groups.set(value,list);
  }
  return [...groups].map(([name,items])=>({name,...summarize(items)}))
    .sort((left,right)=>left.name.localeCompare(right.name,'de'));
}

export function buildQuizStatisticsSummary(rows,{mode=null,weakMinimum=WEAK_STATISTICS_MINIMUM_ANSWERS}={}){
  const filtered=mode?rows.filter(row=>row.mode===mode):rows;
  const byCategory=grouped(filtered,'category').map(category=>({
    ...category,
    topics:grouped(filtered.filter(row=>row.category===category.name),'topic'),
  }));
  const byDifficulty=grouped(filtered,'difficulty');
  const byMode=grouped(filtered,'mode');
  const weakCategories=byCategory.filter(item=>item.answered>=weakMinimum)
    .sort((left,right)=>left.accuracy-right.accuracy||right.answered-left.answered);
  const weakTopics=byCategory.flatMap(category=>category.topics.map(topic=>({...topic,category:category.name})))
    .filter(item=>item.answered>=weakMinimum)
    .sort((left,right)=>left.accuracy-right.accuracy||right.answered-left.answered);
  return {
    overall:summarize(filtered),byCategory,byDifficulty,byMode,
    weakMinimum,weakCategories,weakTopics,
  };
}
