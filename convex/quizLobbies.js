import { queryGeneric as query, mutationGeneric as mutation, internalMutationGeneric as internalMutation } from 'convex/server';
import { v } from 'convex/values';
import seatsByRoom from './quizSeatDefinitions.js';
import {
  QUESTIONS_PER_QUIZ,QUIZ_QUESTIONS,
  materializeQuizQuestions,quizConfigurationOptions,selectQuizQuestionIds,validateQuizSettings,
} from './quizQuestions.js';
import { recentHistoriesFor,rememberQuestions } from './quizHistory.js';
import { PLAYER_SCALE } from '../src/game/settings.js';
import {
  QUIZ_QUESTION_DURATION_MS,quizQuestionComplete,quizQuestionExpired,shouldEndQuizForParticipants,
} from '../src/quizTimer.js';
import { isPresenceActive } from '../src/multiplayer/presencePolicy.js';

const DEFAULT_SETTINGS=Object.freeze({category:null,topic:null,difficulty:null,count:QUESTIONS_PER_QUIZ});

function settingsFor(lobby){return {...DEFAULT_SETTINGS,...(lobby.settings??{})};}

async function playerFor(ctx, characterId, sessionId, room) {
  const player = await ctx.db.query('players').withIndex('by_player', q => q.eq('playerId', characterId)).unique();
  if (!player || player.characterId !== characterId || player.sessionId !== sessionId ||
      player.room !== room || !isPresenceActive(player.lastSeen)) throw new Error('Invalid session or room.');
  return player;
}

async function activeParticipants(ctx, lobby) {
  const players = await ctx.db.query('players').withIndex('by_room', q => q.eq('room', lobby.room)).collect();
  const active = new Set(players.filter(p => isPresenceActive(p.lastSeen)).map(p => p.characterId));
  return lobby.participants.filter(id => active.has(id));
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
  const saved=new Map((lobby.scores??[]).map(score=>[score.characterId,score.points]));
  return participants.map(characterId=>({characterId,points:saved.get(characterId)??0}));
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
}

async function scoreIfComplete(ctx,lobby,participants) {
  const question=questionFor(lobby);
  const answers=await answersForQuestion(ctx,lobby,question);
  const byCharacter=new Map(answers.map(answer=>[answer.characterId,answer]));
  const allAnswered=Boolean(question&&quizQuestionComplete(
    participants,byCharacter.keys(),deadlineFor(lobby),lobby.timedOutCharacterIds??[],
  ));
  const scoredQuestionIds=lobby.scoredQuestionIds??[];
  let scores=scoresFor(lobby,participants);
  if(allAnswered&&!scoredQuestionIds.includes(question.id)){
    scores=scores.map(score=>({
      ...score,
      points:score.points+(byCharacter.get(score.characterId)?.answerIndex===question.correctAnswer?1:0),
    }));
    const patch={scores,scoredQuestionIds:[...scoredQuestionIds,question.id]};
    await ctx.db.patch(lobby._id,patch);lobby={...lobby,...patch};
  }
  return {lobby,question,answers,allAnswered,scores};
}

export const current = query({
  args: { room:v.string(), characterId:v.optional(v.string()) },
  handler: async (ctx,{room,characterId}) => {
    const lobby = await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',room)).unique();
    if (!lobby) return null;
    const participants=await activeParticipants(ctx,lobby);
    const question=lobby.status==='starting'?questionFor(lobby):null;
    const answers=await answersForQuestion(ctx,lobby,question);
    const activeAnswers=answers.filter(answer=>participants.includes(answer.characterId));
    const allAnswered=Boolean(question&&quizQuestionComplete(
      participants,activeAnswers.map(answer=>answer.characterId),deadlineFor(lobby),lobby.timedOutCharacterIds??[],
    ));
    const ownAnswer=activeAnswers.find(answer=>answer.characterId===characterId);
    return {
      room:lobby.room,hostCharacterId:lobby.hostCharacterId,status:lobby.status,
      participants,createdAt:lobby.createdAt,questionIndex:lobby.questionIndex??0,
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
      answeredCharacterIds:activeAnswers.map(answer=>answer.characterId),
      ownAnswerIndex:ownAnswer?.answerIndex,
      allAnswered,
      correctAnswerIndex:allAnswered?question.correctAnswer:null,
      scores:scoresFor(lobby,participants),
    };
  },
});

export const join = mutation({
  args: { room:v.string(), characterId:v.string(), sessionId:v.string() },
  handler: async (ctx,args) => {
    const player = await playerFor(ctx,args.characterId,args.sessionId,args.room);
    const seat = seatsByRoom[args.room]?.find(s => s.characterId === args.characterId);
    if (!seat) throw new Error('This character has no quiz chair in this room.');
    const body={x:player.x-10*PLAYER_SCALE,right:player.x+10*PLAYER_SCALE,y:player.y-12*PLAYER_SCALE,bottom:player.y};
    const dx=Math.max(seat.x-body.right,body.x-seat.x-seat.width,0);
    const dy=Math.max(seat.y-body.bottom,body.y-seat.y-seat.height,0);
    if (Math.hypot(dx,dy)>48) throw new Error('Move closer to your chair.');
    let lobby = await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    let participants=[];
    if (lobby) {
      participants=await activeParticipants(ctx,lobby);
      if (!participants.length) { await deleteLobby(ctx,lobby); lobby=null; }
      else if (lobby.status !== 'lobby') throw new Error('The lobby has already started.');
    }
    if (!lobby) {
      await ctx.db.insert('quizLobbies',{
        room:args.room,hostCharacterId:args.characterId,status:'lobby',participants:[args.characterId],
        questionIndex:0,questionIds:[],settings:DEFAULT_SETTINGS,scores:[],scoredQuestionIds:[],createdAt:Date.now(),
      });
    } else {
      if (!participants.includes(args.characterId)) participants.push(args.characterId);
      if (participants.length > 4) throw new Error('Lobby is full.');
      await ctx.db.patch(lobby._id,{participants,hostCharacterId:participants.includes(lobby.hostCharacterId)?lobby.hostCharacterId:participants[0]});
    }
    return {seatX:seat.seatX,seatY:seat.seatY,direction:seat.direction};
  },
});

export const leave = mutation({
  args: { room:v.string(), characterId:v.string(), sessionId:v.string() },
  handler: async (ctx,args) => {
    await playerFor(ctx,args.characterId,args.sessionId,args.room);
    const lobby = await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    if (!lobby || !lobby.participants.includes(args.characterId)) return;
    const participants = (await activeParticipants(ctx,lobby)).filter(id=>id!==args.characterId);
    for(const answer of await ctx.db.query('quizAnswers').withIndex('by_lobby_character',q=>q.eq('lobbyId',lobby._id).eq('characterId',args.characterId)).collect())
      await ctx.db.delete(answer._id);
    if (!participants.length) { await deleteLobby(ctx,lobby); return; }
    const patch={
      participants,
      hostCharacterId:lobby.hostCharacterId===args.characterId?participants[0]:lobby.hostCharacterId,
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
    room:v.string(),characterId:v.string(),sessionId:v.string(),
    category:v.union(v.string(),v.null()),
    topic:v.optional(v.union(v.string(),v.null())),
    difficulty:v.union(v.literal('medium'),v.literal('hard'),v.null()),
    count:v.union(v.number(),v.null()),
  },
  handler:async(ctx,args)=>{
    await playerFor(ctx,args.characterId,args.sessionId,args.room);
    const lobby=await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    if(!lobby||lobby.status!=='lobby'||lobby.hostCharacterId!==args.characterId)
      throw new Error('Only the current host can change quiz settings.');
    const settings=validateQuizSettings(args);
    await ctx.db.patch(lobby._id,{settings});
  },
});

export const start = mutation({
  args: { room:v.string(), characterId:v.string(), sessionId:v.string() },
  handler: async (ctx,args) => {
    await playerFor(ctx,args.characterId,args.sessionId,args.room);
    const lobby = await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    if (!lobby || lobby.status !== 'lobby' || lobby.hostCharacterId !== args.characterId) throw new Error('Only the host can start the quiz.');
    const participants = await activeParticipants(ctx,lobby);
    if (participants.length < 2) throw new Error('At least 2 players are required.');
    const settings=settingsFor(lobby);
    const startedAt=Date.now();
    const recentHistories=await recentHistoriesFor(ctx,participants);
    const selectedIds=selectQuizQuestionIds({
      ...settings,recentHistories,seed:`${lobby._id}:${startedAt}`,
    });
    if(!selectedIds.length)throw new Error('No questions match these settings.');
    const questions=materializeQuizQuestions(selectedIds);
    const questionIds=questions.map(question=>question.id);
    await rememberQuestions(ctx,participants,questionIds.slice(0,1),startedAt);
    await ctx.db.patch(lobby._id,{
      participants,status:'starting',questionIndex:0,questionIds,questions,
      questionDeadline:Date.now()+QUIZ_QUESTION_DURATION_MS,
      scores:participants.map(characterId=>({characterId,points:0})),scoredQuestionIds:[],
      timedOutCharacterIds:[],
    });
  },
});

export const answer = mutation({
  args: { room:v.string(), characterId:v.string(), sessionId:v.string(), answerIndex:v.number() },
  handler: async (ctx,args) => {
    await playerFor(ctx,args.characterId,args.sessionId,args.room);
    const lobby=await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    const question=lobby&&questionFor(lobby);
    if(!lobby||lobby.status!=='starting'||!question||!lobby.participants.includes(args.characterId))
      throw new Error('Quiz unavailable for this player.');
    if(!Number.isInteger(args.answerIndex)||args.answerIndex<0||args.answerIndex>=question.answers.length)
      throw new Error('Invalid answer.');
    if(quizQuestionExpired(deadlineFor(lobby)))throw new Error('The time for this question has expired.');
    const existing=await ctx.db.query('quizAnswers').withIndex('by_lobby_question_character',q=>
      q.eq('lobbyId',lobby._id).eq('questionId',question.id).eq('characterId',args.characterId)).unique();
    if(existing){
      if(existing.answerIndex!==args.answerIndex)throw new Error('This player has already answered.');
      return {answerIndex:existing.answerIndex};
    }
    await ctx.db.insert('quizAnswers',{
      lobbyId:lobby._id,room:args.room,questionId:question.id,
      characterId:args.characterId,answerIndex:args.answerIndex,createdAt:Date.now(),
    });
    const participants=await activeParticipants(ctx,lobby);
    await scoreIfComplete(ctx,lobby,participants);
    return {answerIndex:args.answerIndex};
  },
});

export const finishTimedQuestion = mutation({
  args: {
    room:v.string(),characterId:v.string(),sessionId:v.string(),
    answerIndex:v.optional(v.number()),
  },
  handler:async(ctx,args)=>{
    await playerFor(ctx,args.characterId,args.sessionId,args.room);
    const lobby=await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    const question=lobby&&questionFor(lobby);
    if(!lobby||lobby.status!=='starting'||!question||!lobby.participants.includes(args.characterId))
      throw new Error('Quiz unavailable for this player.');
    if(!quizQuestionExpired(deadlineFor(lobby)))throw new Error('The question is still active.');
    let existing=await ctx.db.query('quizAnswers').withIndex('by_lobby_question_character',q=>
      q.eq('lobbyId',lobby._id).eq('questionId',question.id).eq('characterId',args.characterId)).unique();
    if(!existing&&args.answerIndex!==undefined){
      if(!Number.isInteger(args.answerIndex)||args.answerIndex<0||args.answerIndex>=question.answers.length)
        throw new Error('Invalid answer.');
      const answerId=await ctx.db.insert('quizAnswers',{
        lobbyId:lobby._id,room:args.room,questionId:question.id,
        characterId:args.characterId,answerIndex:args.answerIndex,createdAt:Date.now(),
      });
      existing=await ctx.db.get(answerId);
    }
    const timedOutCharacterIds=Array.from(new Set([...(lobby.timedOutCharacterIds??[]),args.characterId]));
    await ctx.db.patch(lobby._id,{timedOutCharacterIds});
    const updatedLobby={...lobby,timedOutCharacterIds};
    const participants=await activeParticipants(ctx,updatedLobby);
    await scoreIfComplete(ctx,updatedLobby,participants);
    return {answerIndex:existing?.answerIndex??null};
  },
});

export const nextQuestion = mutation({
  args: { room:v.string(), characterId:v.string(), sessionId:v.string() },
  handler: async (ctx,args) => {
    await playerFor(ctx,args.characterId,args.sessionId,args.room);
    let lobby=await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    if(!lobby||lobby.status!=='starting'||lobby.hostCharacterId!==args.characterId)
      throw new Error('Only the host can advance.');
    const participants=await activeParticipants(ctx,lobby);
    const completion=await scoreIfComplete(ctx,lobby,participants);lobby=completion.lobby;
    if(!completion.allAnswered)throw new Error('Some players are still answering.');
    const nextIndex=(lobby.questionIndex??0)+1;
    const questionCount=lobby.questions?.length??questionIdsFor(lobby).length;
    if(nextIndex<questionCount){
      const nextQuestionId=lobby.questions?.[nextIndex]?.id??questionIdsFor(lobby)[nextIndex];
      await rememberQuestions(ctx,participants,[nextQuestionId]);
    }
    await ctx.db.patch(lobby._id,nextIndex>=questionCount
      ? {status:'finished',questionIndex:nextIndex}
      : {questionIndex:nextIndex,questionDeadline:Date.now()+QUIZ_QUESTION_DURATION_MS,timedOutCharacterIds:[]});
  },
});

export const cleanup = internalMutation({
  args:{},
  handler:async ctx=>{
    for(const lobby of await ctx.db.query('quizLobbies').collect()) {
      const participants=await activeParticipants(ctx,lobby);
      if(!participants.length){await deleteLobby(ctx,lobby);continue;}
      let currentLobby=lobby;
      if(participants.length!==lobby.participants.length||!participants.includes(lobby.hostCharacterId)){
        const patch={
          participants,
          hostCharacterId:participants.includes(lobby.hostCharacterId)?lobby.hostCharacterId:participants[0],
          scores:scoresFor(lobby,participants),
          ...(shouldEndQuizForParticipants(lobby.status,participants.length)
            ? {status:'finished',finishedReason:'insufficient-participants'} : {}),
        };
        await ctx.db.patch(lobby._id,patch);currentLobby={...lobby,...patch};
      }
      if(currentLobby.status==='starting')await scoreIfComplete(ctx,currentLobby,participants);
    }
  },
});
