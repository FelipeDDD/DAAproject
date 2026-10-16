import { mutationGeneric as mutation } from 'convex/server';
import { v } from 'convex/values';
import { requireAuthenticatedLivePlayer,refreshTerminalLease } from './playerSessions.js';
import { questionTemplateId } from './quizSelection.js';
import { QUESTION_REPORT_REASONS,QUESTION_REPORT_COMMENT_LIMIT } from '../src/quiz/questionReportConfig.js';

// Called only on explicit submission; no queries, subscriptions or scheduled jobs.
export async function submitQuestionReport(ctx,args){
  const player=await requireAuthenticatedLivePlayer(ctx,args.playerId,args.sessionId);
  const run=await ctx.db.get(args.runId);
  const runTable=args.mode==='study'?'soloQuizRuns':'itChallengeRuns';
  if(!ctx.db.normalizeId(runTable,args.runId)||!run||run.profileId!==player.profileId
    ||run.playerId!==args.playerId||run.sessionId!==args.sessionId
    ||(args.mode==='study'&&run.mode!=='study'))throw new Error('This quiz session is no longer available.');
  const question=Number.isSafeInteger(args.questionIndex)&&run.questions[args.questionIndex];
  if(!question||question.id!==args.questionId)throw new Error('Question not found in this session.');
  if(!QUESTION_REPORT_REASONS.some(reason=>reason.id===args.reason))throw new Error('Choose a valid report reason.');
  const comment=args.comment.trim();
  if(comment.length>QUESTION_REPORT_COMMENT_LIMIT)throw new Error('Comment is too long.');
  const snapshot=args.snapshot;
  if(!snapshot.question.trim()||snapshot.question.length>12000||snapshot.answers.length!==question.answerCount
    ||snapshot.answers.some(answer=>!answer.trim()||answer.length>6000)
    ||(snapshot.explanation?.length??0)>12000||JSON.stringify(snapshot.media??null).length>50000)
    throw new Error('Invalid question snapshot.');
  const questionId=questionTemplateId(question.id);
  const previous=await ctx.db.query('questionReports')
    .withIndex('by_profile_question',q=>q.eq('profileId',player.profileId).eq('questionId',questionId)).collect();
  const existing=previous.find(report=>report.status==='pending'&&report.snapshot.question===snapshot.question);
  if(existing)return {reportId:existing._id,alreadyReported:true,
    terminalLease:await refreshTerminalLease(ctx,player,args.playerId,args.sessionId)};
  const recent=await ctx.db.query('questionReports')
    .withIndex('by_profile_createdAt',q=>q.eq('profileId',player.profileId)).order('desc').first();
  if(recent&&Date.now()-recent.createdAt<5000)throw new Error('Please wait a few seconds before sending another report.');
  const reportId=await ctx.db.insert('questionReports',{
    profileId:player.profileId,questionId,occurrenceId:question.id,
    category:question.category,topic:question.topic,difficulty:question.difficulty,
    mode:args.mode,reason:args.reason,comment,
    snapshot:{...snapshot,correctAnswer:question.correctAnswer},status:'pending',createdAt:Date.now(),
  });
  return {reportId,alreadyReported:false,terminalLease:await refreshTerminalLease(ctx,player,args.playerId,args.sessionId)};
}

export const submit=mutation({
  args:{playerId:v.string(),sessionId:v.string(),mode:v.union(v.literal('study'),v.literal('challenge')),
    runId:v.union(v.id('soloQuizRuns'),v.id('itChallengeRuns')),questionId:v.string(),questionIndex:v.number(),
    reason:v.string(),comment:v.string(),snapshot:v.object({question:v.string(),answers:v.array(v.string()),
      explanation:v.optional(v.string()),media:v.optional(v.any())})},
  handler:submitQuestionReport,
});
