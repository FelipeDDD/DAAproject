export const RECENT_EXCLUSION_PERCENT = 0.10;
export const RECENT_EXCLUSION_MINIMUM = 5;
export const RECENT_HISTORY_LIMIT = 200;

export function recentExclusionCount(filteredPoolSize) {
  return Math.max(RECENT_EXCLUSION_MINIMUM,Math.ceil(Math.max(0,filteredPoolSize)*RECENT_EXCLUSION_PERCENT));
}

export function questionTemplateId(questionId) {
  return String(questionId??'').replace(/#\d+$/,'');
}

function stableHash(value) {
  let hash=2166136261;
  for(const character of String(value)){
    hash^=character.charCodeAt(0);hash=Math.imul(hash,16777619);
  }
  return hash>>>0;
}

function normalizedHistory(history,poolIds,limit) {
  const entries=(Array.isArray(history)?history:history?.recentQuestions??[])
    .map((entry,index)=>typeof entry==='string'
      ?{questionId:questionTemplateId(entry),seenAt:-index}
      :{questionId:questionTemplateId(entry?.questionId),seenAt:Number(entry?.seenAt)})
    .filter(entry=>poolIds.has(entry.questionId))
    .sort((left,right)=>(Number.isFinite(right.seenAt)?right.seenAt:0)-(Number.isFinite(left.seenAt)?left.seenAt:0));
  const unique=[];const seen=new Set();
  for(const entry of entries){
    if(!entry.questionId||seen.has(entry.questionId))continue;
    seen.add(entry.questionId);unique.push(entry);
    if(unique.length===limit)break;
  }
  return unique;
}

export function buildQuizQuestionSelection({
  questionBank,category,difficulty,count=5,seed=Date.now(),recentHistories=[],
}={}) {
  const pool=(questionBank??[]).filter(question=>(!category||question.category===category)
    &&(!difficulty||question.difficulty===difficulty));
  const poolIds=new Set(pool.map(question=>question.id));
  const exclusionCount=recentExclusionCount(pool.length);
  const recentById=new Map();
  for(const history of recentHistories){
    for(const entry of normalizedHistory(history,poolIds,exclusionCount)){
      const aggregate=recentById.get(entry.questionId)??{seenAt:Number.NEGATIVE_INFINITY,participants:0};
      aggregate.seenAt=Math.max(aggregate.seenAt,Number.isFinite(entry.seenAt)?entry.seenAt:0);
      aggregate.participants+=1;recentById.set(entry.questionId,aggregate);
    }
  }
  const order=question=>stableHash(`${seed}:${question.id}`);
  const safe=pool.filter(question=>!recentById.has(question.id))
    .sort((left,right)=>order(left)-order(right)||left.id.localeCompare(right.id));
  const fallback=pool.filter(question=>recentById.has(question.id)).sort((left,right)=>{
    const leftRecent=recentById.get(left.id),rightRecent=recentById.get(right.id);
    return leftRecent.seenAt-rightRecent.seenAt
      ||leftRecent.participants-rightRecent.participants
      ||order(left)-order(right)
      ||left.id.localeCompare(right.id);
  });
  const ordered=[...safe,...fallback];
  const requested=count===null?pool.length:Math.max(0,Math.trunc(count));
  const questionIds=ordered.slice(0,Math.min(requested,ordered.length)).map(question=>question.id);
  if(count!==null&&questionIds.length<requested){
    const generated=ordered.filter(question=>question.type==='generated');
    for(let index=0;generated.length&&questionIds.length<requested;index+=1)
      questionIds.push(generated[index%generated.length].id);
  }
  return {questionIds,poolSize:pool.length,exclusionCount,recentCandidateCount:fallback.length};
}
