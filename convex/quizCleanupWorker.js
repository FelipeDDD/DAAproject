import { anyApi } from 'convex/server';

export const QUIZ_CLEANUP_INTERVAL_MS=30_000;
const workerKey='multiplayer-quiz';

async function workerFor(ctx){
  return ctx.db.query('quizCleanupWorker').withIndex('by_key',q=>q.eq('key',workerKey)).unique();
}

// All reads, scheduling and writes belong to the caller's Convex transaction.
// Concurrent first-lobby creations conflict on the singleton index read and retry.
export async function ensureQuizCleanupWorker(ctx){
  if(!await ctx.db.query('quizLobbies').first())return;
  let worker=await workerFor(ctx);
  if(worker?.jobId)return;
  if(!worker){
    const id=await ctx.db.insert('quizCleanupWorker',{key:workerKey,generation:0});
    worker={_id:id,generation:0};
  }
  const generation=worker.generation+1;
  const jobId=await ctx.scheduler.runAfter(QUIZ_CLEANUP_INTERVAL_MS,anyApi.quizLobbies.cleanup,{generation});
  await ctx.db.patch(worker._id,{generation,jobId});
}

export async function stopQuizCleanupWorkerIfEmpty(ctx){
  if(await ctx.db.query('quizLobbies').first())return;
  const worker=await workerFor(ctx);
  if(!worker?.jobId)return;
  await ctx.scheduler.cancel(worker.jobId);
  await ctx.db.patch(worker._id,{generation:worker.generation+1,jobId:undefined});
}

export async function runQuizCleanupWorker(ctx,generation,recover){
  if(generation===undefined){
    // One-shot bootstrap for pre-existing lobbies; also safe for an old cron invocation.
    await recover(ctx);
    await stopQuizCleanupWorkerIfEmpty(ctx);
    await ensureQuizCleanupWorker(ctx);
    return;
  }
  const worker=await workerFor(ctx);
  if(!worker?.jobId||worker.generation!==generation)return;
  await ctx.db.patch(worker._id,{generation:generation+1,jobId:undefined});
  await recover(ctx);
  await ensureQuizCleanupWorker(ctx);
}
