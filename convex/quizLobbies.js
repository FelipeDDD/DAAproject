import { findSessionPlayer } from './playerSessions.js';
import { queryGeneric as query, mutationGeneric as mutation, internalMutationGeneric as internalMutation } from 'convex/server';
import { v } from 'convex/values';
import seatsByRoom from './quizSeatDefinitions.js';
import {
  QUESTIONS_PER_QUIZ,QUIZ_QUESTIONS,
  materializeQuizQuestions,quizConfigurationOptions,selectQuizQuestionIds,validateQuizSettings,
} from './quizQuestions.js';
import { recentHistoriesFor,rememberQuestions } from './quizHistory.js';
import { PLAYER_SCALE } from '../src/game/settings.js';
import { characterBaseIdFor } from '../src/characters.js';
import {
  QUIZ_QUESTION_DURATION_MS,quizQuestionComplete,quizQuestionExpired,shouldEndQuizForParticipants,
} from '../src/quizTimer.js';
import { isPlayerActive } from '../src/multiplayer/presencePolicy.js';
import { recordQuizAttempt } from './quizStatisticsStore.js';
import { ensureQuizCleanupWorker,stopQuizCleanupWorkerIfEmpty,runQuizCleanupWorker } from './quizCleanupWorker.js';

const DEFAULT_SETTINGS=Object.freeze({category:null,topic:null,difficulty:null,count:QUESTIONS_PER_QUIZ});
const questionContextArgs={lobbyId:v.id('quizLobbies'),questionId:v.string(),questionIndex:v.number()};

function requireQuestionContext(lobby,question,args){
  if(lobby._id!==args.lobbyId||question.id!==args.questionId||(lobby.questionIndex??0)!==args.questionIndex)
    throw new Error('QUIZ_QUESTION_CHANGED');
}

function settingsFor(lobby){return {...DEFAULT_SETTINGS,...(lobby.settings??{})};}

async function playerFor(ctx, playerId, sessionId, room) {
  const player = await findSessionPlayer(ctx,undefined,playerId);
  if (!player || player.playerId !== playerId || player.sessionId !== sessionId ||
      player.room !== room || !isPlayerActive(player)) throw new Error('Invalid session or room.');
  return player;
}

async function activePlayerRows(ctx,lobby) {
  const players=await ctx.db.query('players').withIndex('by_room',q=>q.eq('room',lobby.room)).collect();
  return players.filter(player=>isPlayerActive(player)&&lobby.participants.includes(player.playerId));
}

async function activeParticipants(ctx,lobby){
  const active=new Set((await activePlayerRows(ctx,lobby)).map(player=>player.playerId));
  return lobby.participants.filter(id=>active.has(id));
}

async function persistentParticipants(ctx,room,participantIds){
  const players=await ctx.db.query('players').withIndex('by_room',q=>q.eq('room',room)).collect();
  return [...new Set(players.filter(player=>player.profileId&&participantIds.includes(player.playerId))
    .map(player=>player.profileId))];
}

async function seatAssignmentsFor(ctx,lobby,participants,seats,playerRows){
  const validSeatIds=new Set(seats.map(seat=>seat.seatId));
  const used=new Set();
  const assignments=[];
  for(const assignment of lobby.seatAssignments??[]){
    if(participants.includes(assignment.playerId)&&validSeatIds.has(assignment.seatId)&&!used.has(assignment.seatId)){
      assignments.push(assignment);used.add(assignment.seatId);
    }
  }
  playerRows??=await ctx.db.query('players').withIndex('by_room',q=>q.eq('room',lobby.room)).collect();
  for(const playerId of participants){
    if(assignments.some(assignment=>assignment.playerId===playerId))continue;
    const player=playerRows.find(row=>row.playerId===playerId);
    const body=player?{x:player.x-10*PLAYER_SCALE,right:player.x+10*PLAYER_SCALE,y:player.y-12*PLAYER_SCALE,bottom:player.y}:null;
    const next=seats.filter(seat=>!used.has(seat.seatId)).map(seat=>({seat,distance:body
      ?Math.hypot(Math.max(seat.x-body.right,body.x-seat.x-seat.width,0),Math.max(seat.y-body.bottom,body.y-seat.y-seat.height,0))
      :0})).sort((left,right)=>left.distance-right.distance)[0]?.seat;
    if(next){assignments.push({playerId,seatId:next.seatId});used.add(next.seatId);}
  }
  return assignments;
}

function seatForPlayer(seats,assignments,playerId){
  const seatId=assignments.find(assignment=>assignment.playerId===playerId)?.seatId;
  return seats.find(seat=>seat.seatId===seatId);
}

function questionIdsFor(lobby) {
  return lobby.questionIds?.length?lobby.questionIds:QUIZ_QUESTIONS.map(question=>question.id);
}

function questionFor(lobby) {
  if(lobby.questions?.length)return lobby.questions[lobby.questionIndex??0]??null;
  const id=questionIdsFor(lobby)[lobby.questionIndex??0];
  const legacyQuestion=QUIZ_QUESTIONS.find(question=>question.id===id);
  return legacyQuestion?.type==='generated'?null:(legacyQuestion??null);
}

function deadlineFor(lobby) {
  return lobby.questionDeadline??(lobby.createdAt+QUIZ_QUESTION_DURATION_MS);
}

function scoresFor(lobby,participants) {
  const saved=new Map((lobby.scores??[]).map(score=>[score.playerId,score.points]));
  return participants.map(playerId=>({playerId,points:saved.get(playerId)??0}));
}

async function answersForQuestion(ctx,lobby,question) {
  if(!question)return [];
  return ctx.db.query('quizAnswers')
    .withIndex('by_lobby_question',q=>q.eq('lobbyId',lobby._id).eq('questionId',question.id)).collect();
}

async function deleteLobby(ctx,lobby) {
  for(const answer of await ctx.db.query('quizAnswers').withIndex('by_lobby',q=>q.eq('lobbyId',lobby._id)).collect())
    await ctx.db.delete(answer._id);
  await ctx.db.delete(lobby._id);
  await stopQuizCleanupWorkerIfEmpty(ctx);
}

async function scoreIfComplete(ctx,lobby,participants) {
  const question=questionFor(lobby);
  const answers=await answersForQuestion(ctx,lobby,question);
  const byPlayer=new Map(answers.map(answer=>[answer.playerId,answer]));
  const allAnswered=Boolean(question&&quizQuestionComplete(
    participants,byPlayer.keys(),deadlineFor(lobby),lobby.timedOutPlayerIds??[],
  ));
  const scoredQuestionIds=lobby.scoredQuestionIds??[];
  let scores=scoresFor(lobby,participants);
  if(allAnswered&&!scoredQuestionIds.includes(question.id)){
    scores=scores.map(score=>({
      ...score,
      points:score.points+(byPlayer.get(score.playerId)?.answerIndex===question.correctAnswer?1:0),
    }));
    const patch={scores,scoredQuestionIds:[...scoredQuestionIds,question.id]};
    await ctx.db.patch(lobby._id,patch);lobby={...lobby,...patch};
  }
  return {lobby,question,answers,allAnswered,scores};
}

export const current = query({
  args: { room:v.string(), playerId:v.optional(v.string()) },
  handler: async (ctx,{room,playerId}) => {
    const lobby = await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',room)).unique();
    if (!lobby || !lobby.hostPlayerId) return null; // Old development lobbies await a one-time reset.
    const activeRows=await activePlayerRows(ctx,lobby);
    const participants=lobby.participants.filter(id=>activeRows.some(player=>player.playerId===id));
    const seatAssignments=await seatAssignmentsFor(ctx,lobby,participants,seatsByRoom[room]??[],activeRows);
    const question=lobby.status==='starting'?questionFor(lobby):null;
    const answers=await answersForQuestion(ctx,lobby,question);
    const activeAnswers=answers.filter(answer=>participants.includes(answer.playerId));
    const allAnswered=Boolean(question&&quizQuestionComplete(
      participants,activeAnswers.map(answer=>answer.playerId),deadlineFor(lobby),lobby.timedOutPlayerIds??[],
    ));
    const ownAnswer=activeAnswers.find(answer=>answer.playerId===playerId);
    return {
      lobbyId:lobby._id,room:lobby.room,hostPlayerId:lobby.hostPlayerId,status:lobby.status,
      participants,seatAssignments,participantDetails:activeRows.map(p=>({playerId:p.playerId,characterBaseId:p.characterBaseId,displayName:p.displayName??p.name})),
      createdAt:lobby.createdAt,questionIndex:lobby.questionIndex??0,
      settings:settingsFor(lobby),
      configurationOptions:quizConfigurationOptions(),
      questionDeadline:question?deadlineFor(lobby):null,
      finishedReason:lobby.finishedReason??null,
      questionCount:lobby.questions?.length??questionIdsFor(lobby).length,
      question:question?{
        id:question.id,category:question.category,topic:question.topic??null,difficulty:question.difficulty,
        question:question.question,answers:question.answers,
        ...(question.media ? {media:question.media} : {}),
        explanation:allAnswered?(question.explanation??null):null,
      }:null,
      answeredPlayerIds:activeAnswers.map(answer=>answer.playerId),
      ownAnswerIndex:ownAnswer?.answerIndex,
      allAnswered,
      correctAnswerIndex:allAnswered?question.correctAnswer:null,
      scores:scoresFor(lobby,participants),
    };
  },
});

export const join = mutation({
  args: { room:v.string(), playerId:v.string(), sessionId:v.string() },
  handler: async (ctx,args) => {
    const player = await playerFor(ctx,args.playerId,args.sessionId,args.room);
    const seats=seatsByRoom[args.room]??[];
    if(!seats.length)throw new Error('No quiz seats are configured in this room.');
    const body={x:player.x-10*PLAYER_SCALE,right:player.x+10*PLAYER_SCALE,y:player.y-12*PLAYER_SCALE,bottom:player.y};
    let lobby = await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    let participants=[],seatAssignments=[];
    if (lobby) {
      if(!lobby.hostPlayerId)throw new Error('Legacy development quiz lobby requires a one-time reset.');
      participants=await activeParticipants(ctx,lobby);
      if (!participants.length) { await deleteLobby(ctx,lobby); lobby=null; }
      else if (lobby.status !== 'lobby') throw new Error('The lobby has already started.');
      if(lobby){
        seatAssignments=await seatAssignmentsFor(ctx,lobby,participants,seats);
        if(participants.includes(args.playerId)){
          const existingSeat=seatForPlayer(seats,seatAssignments,args.playerId);
          if(existingSeat)return {seatX:existingSeat.seatX,seatY:existingSeat.seatY,direction:existingSeat.direction};
        }
      }
    }
    const occupied=new Set(seatAssignments.map(assignment=>assignment.seatId));
    const seat=seats.filter(candidate=>!occupied.has(candidate.seatId)).map(candidate=>({seat:candidate,distance:(()=>{
      const dx=Math.max(candidate.x-body.right,body.x-candidate.x-candidate.width,0);
      const dy=Math.max(candidate.y-body.bottom,body.y-candidate.y-candidate.height,0);
      return Math.hypot(dx,dy);
    })()})).sort((left,right)=>left.distance-right.distance)[0];
    if(!seat||seat.distance>48)throw new Error('Move closer to a free quiz chair.');
    seatAssignments.push({playerId:args.playerId,seatId:seat.seat.seatId});
    if (!lobby) {
      await ctx.db.insert('quizLobbies',{
        room:args.room,hostPlayerId:args.playerId,status:'lobby',participants:[args.playerId],seatAssignments,
        questionIndex:0,questionIds:[],settings:DEFAULT_SETTINGS,scores:[],scoredQuestionIds:[],createdAt:Date.now(),
      });
    } else {
      if (!participants.includes(args.playerId)) participants.push(args.playerId);
      await ctx.db.patch(lobby._id,{participants,seatAssignments,hostPlayerId:participants.includes(lobby.hostPlayerId)?lobby.hostPlayerId:participants[0]});
    }
    await ensureQuizCleanupWorker(ctx);
    return {seatX:seat.seat.seatX,seatY:seat.seat.seatY,direction:seat.seat.direction};
  },
});

export const leave = mutation({
  args: { room:v.string(), playerId:v.string(), sessionId:v.string() },
  handler: async (ctx,args) => {
    await playerFor(ctx,args.playerId,args.sessionId,args.room);
    const lobby = await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    if (!lobby || !lobby.participants.includes(args.playerId)) return;
    const participants = (await activeParticipants(ctx,lobby)).filter(id=>id!==args.playerId);
    for(const answer of await ctx.db.query('quizAnswers').withIndex('by_lobby_player',q=>q.eq('lobbyId',lobby._id).eq('playerId',args.playerId)).collect())
      await ctx.db.delete(answer._id);
    if (!participants.length) { await deleteLobby(ctx,lobby); return; }
    const patch={
      participants,
      seatAssignments:(lobby.seatAssignments??[]).filter(assignment=>participants.includes(assignment.playerId)),
      hostPlayerId:lobby.hostPlayerId===args.playerId?participants[0]:lobby.hostPlayerId,
      scores:scoresFor(lobby,participants),
      ...(shouldEndQuizForParticipants(lobby.status,participants.length)
        ? {status:'finished',finishedReason:'insufficient-participants'} : {}),
    };
    await ctx.db.patch(lobby._id,patch);
    if(lobby.status==='starting'&&!shouldEndQuizForParticipants(lobby.status,participants.length))
      await scoreIfComplete(ctx,{...lobby,...patch},participants);
  },
});

export const configure = mutation({
  args:{
    room:v.string(),playerId:v.string(),sessionId:v.string(),
    category:v.union(v.string(),v.null()),
    topic:v.optional(v.union(v.string(),v.null())),
    difficulty:v.union(v.literal('medium'),v.literal('hard'),v.null()),
    count:v.union(v.number(),v.null()),
  },
  handler:async(ctx,args)=>{
    await playerFor(ctx,args.playerId,args.sessionId,args.room);
    const lobby=await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    if(!lobby||lobby.status!=='lobby'||lobby.hostPlayerId!==args.playerId)
      throw new Error('Only the current host can change quiz settings.');
    const settings=validateQuizSettings(args);
    await ctx.db.patch(lobby._id,{settings});
  },
});

export const start = mutation({
  args: { room:v.string(), playerId:v.string(), sessionId:v.string() },
  handler: async (ctx,args) => {
    await playerFor(ctx,args.playerId,args.sessionId,args.room);
    const lobby = await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    if (!lobby || lobby.status !== 'lobby' || lobby.hostPlayerId !== args.playerId) throw new Error('Only the host can start the quiz.');
    const participants = await activeParticipants(ctx,lobby);
    if (participants.length < 2) throw new Error('At least 2 players are required.');
    const settings=settingsFor(lobby);
    const startedAt=Date.now();
    const persistentIds=await persistentParticipants(ctx,lobby.room,participants);
    const recentHistories=await recentHistoriesFor(ctx,persistentIds);
    const selectedIds=selectQuizQuestionIds({
      ...settings,recentHistories,seed:`${lobby._id}:${startedAt}`,
    });
    if(!selectedIds.length)throw new Error('No questions match these settings.');
    const questions=materializeQuizQuestions(selectedIds);
    const questionIds=questions.map(question=>question.id);
    await rememberQuestions(ctx,persistentIds,questionIds.slice(0,1),startedAt);
    await ctx.db.patch(lobby._id,{
      participants,status:'starting',questionIndex:0,questionIds,questions,
      questionDeadline:Date.now()+QUIZ_QUESTION_DURATION_MS,
      scores:participants.map(playerId=>({playerId,points:0})),scoredQuestionIds:[],
      timedOutPlayerIds:[],
    });
  },
});

export const answer = mutation({
  args: { room:v.string(), playerId:v.string(), sessionId:v.string(), answerIndex:v.number(),...questionContextArgs },
  handler: async (ctx,args) => {
    const player=await playerFor(ctx,args.playerId,args.sessionId,args.room);
    const lobby=await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    const question=lobby&&questionFor(lobby);
    if(!lobby||lobby.status!=='starting'||!question||!lobby.participants.includes(args.playerId))
      throw new Error('Quiz unavailable for this player.');
    requireQuestionContext(lobby,question,args);
    if(!Number.isInteger(args.answerIndex)||args.answerIndex<0||args.answerIndex>=question.answers.length)
      throw new Error('Invalid answer.');
    if(quizQuestionExpired(deadlineFor(lobby)))throw new Error('The time for this question has expired.');
    const existing=await ctx.db.query('quizAnswers').withIndex('by_lobby_question_player',q=>
      q.eq('lobbyId',lobby._id).eq('questionId',question.id).eq('playerId',args.playerId)).unique();
    if(existing){
      if(existing.answerIndex!==args.answerIndex)throw new Error('This player has already answered.');
      if(player.profileId)await recordQuizAttempt(ctx,{
        attemptKey:`multiplayer:${lobby._id}:${question.id}:${args.playerId}`,
        profileId:player.profileId,characterBaseId:characterBaseIdFor(player),questionId:question.id,category:question.category,
        topic:question.topic??null,difficulty:question.difficulty,mode:'multiplayer',
        correct:existing.answerIndex===question.correctAnswer,answeredAt:existing.createdAt,
      });
      return {answerIndex:existing.answerIndex};
    }
    const answeredAt=Date.now();
    await ctx.db.insert('quizAnswers',{
      lobbyId:lobby._id,room:args.room,questionId:question.id,
      playerId:args.playerId,answerIndex:args.answerIndex,createdAt:answeredAt,
    });
    if(player.profileId)await recordQuizAttempt(ctx,{
      attemptKey:`multiplayer:${lobby._id}:${question.id}:${args.playerId}`,
      profileId:player.profileId,characterBaseId:characterBaseIdFor(player),questionId:question.id,category:question.category,
      topic:question.topic??null,difficulty:question.difficulty,mode:'multiplayer',
      correct:args.answerIndex===question.correctAnswer,answeredAt,
    });
    const participants=await activeParticipants(ctx,lobby);
    await scoreIfComplete(ctx,lobby,participants);
    return {answerIndex:args.answerIndex};
  },
});

export const finishTimedQuestion = mutation({
  args: {
    room:v.string(),playerId:v.string(),sessionId:v.string(),
    answerIndex:v.optional(v.number()),
    ...questionContextArgs,
  },
  handler:async(ctx,args)=>{
    const player=await playerFor(ctx,args.playerId,args.sessionId,args.room);
    const lobby=await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    const question=lobby&&questionFor(lobby);
    if(!lobby||lobby.status!=='starting'||!question||!lobby.participants.includes(args.playerId))
      throw new Error('Quiz unavailable for this player.');
    requireQuestionContext(lobby,question,args);
    if(!quizQuestionExpired(deadlineFor(lobby)))throw new Error('The question is still active.');
    let existing=await ctx.db.query('quizAnswers').withIndex('by_lobby_question_player',q=>
      q.eq('lobbyId',lobby._id).eq('questionId',question.id).eq('playerId',args.playerId)).unique();
    if(!existing&&args.answerIndex!==undefined){
      if(!Number.isInteger(args.answerIndex)||args.answerIndex<0||args.answerIndex>=question.answers.length)
        throw new Error('Invalid answer.');
      const answerId=await ctx.db.insert('quizAnswers',{
        lobbyId:lobby._id,room:args.room,questionId:question.id,
        playerId:args.playerId,answerIndex:args.answerIndex,createdAt:Date.now(),
      });
      existing=await ctx.db.get(answerId);
    }
    if(player.profileId)await recordQuizAttempt(ctx,{
      attemptKey:`multiplayer:${lobby._id}:${question.id}:${args.playerId}`,
      profileId:player.profileId,characterBaseId:characterBaseIdFor(player),questionId:question.id,category:question.category,
      topic:question.topic??null,difficulty:question.difficulty,mode:'multiplayer',
      correct:Boolean(existing&&existing.answerIndex===question.correctAnswer),
      answeredAt:existing?.createdAt??Date.now(),
    });
    const timedOutPlayerIds=Array.from(new Set([...(lobby.timedOutPlayerIds??[]),args.playerId]));
    await ctx.db.patch(lobby._id,{timedOutPlayerIds});
    const updatedLobby={...lobby,timedOutPlayerIds};
    const participants=await activeParticipants(ctx,updatedLobby);
    await scoreIfComplete(ctx,updatedLobby,participants);
    return {answerIndex:existing?.answerIndex??null};
  },
});

export const nextQuestion = mutation({
  args: { room:v.string(), playerId:v.string(), sessionId:v.string() },
  handler: async (ctx,args) => {
    await playerFor(ctx,args.playerId,args.sessionId,args.room);
    let lobby=await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    if(!lobby||lobby.status!=='starting'||lobby.hostPlayerId!==args.playerId)
      throw new Error('Only the host can advance.');
    const participants=await activeParticipants(ctx,lobby);
    const completion=await scoreIfComplete(ctx,lobby,participants);lobby=completion.lobby;
    if(!completion.allAnswered)throw new Error('Some players are still answering.');
    const nextIndex=(lobby.questionIndex??0)+1;
    const questionCount=lobby.questions?.length??questionIdsFor(lobby).length;
    if(nextIndex<questionCount){
      const nextQuestionId=lobby.questions?.[nextIndex]?.id??questionIdsFor(lobby)[nextIndex];
      const persistentIds=await persistentParticipants(ctx,lobby.room,participants);
      await rememberQuestions(ctx,persistentIds,[nextQuestionId]);
    }
    await ctx.db.patch(lobby._id,nextIndex>=questionCount
      ? {status:'finished',questionIndex:nextIndex}
      : {questionIndex:nextIndex,questionDeadline:Date.now()+QUIZ_QUESTION_DURATION_MS,timedOutPlayerIds:[]});
  },
});

async function recoverQuizLobbies(ctx){
    for(const lobby of await ctx.db.query('quizLobbies').collect()) {
      if(!lobby.hostPlayerId)continue;
      const participants=await activeParticipants(ctx,lobby);
      if(!participants.length){await deleteLobby(ctx,lobby);continue;}
      let currentLobby=lobby;
      if(participants.length!==lobby.participants.length||!participants.includes(lobby.hostPlayerId)){
        const patch={
          participants,
          seatAssignments:(lobby.seatAssignments??[]).filter(assignment=>participants.includes(assignment.playerId)),
          hostPlayerId:participants.includes(lobby.hostPlayerId)?lobby.hostPlayerId:participants[0],
          scores:scoresFor(lobby,participants),
          ...(shouldEndQuizForParticipants(lobby.status,participants.length)
            ? {status:'finished',finishedReason:'insufficient-participants'} : {}),
        };
        await ctx.db.patch(lobby._id,patch);currentLobby={...lobby,...patch};
      }
      if(currentLobby.status==='starting')await scoreIfComplete(ctx,currentLobby,participants);
    }
}

export const cleanup = internalMutation({
  args:{generation:v.optional(v.number())},
  handler:async(ctx,{generation})=>runQuizCleanupWorker(ctx,generation,recoverQuizLobbies),
});
