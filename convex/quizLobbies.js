import { queryGeneric as query, mutationGeneric as mutation, internalMutationGeneric as internalMutation } from 'convex/server';
import { v } from 'convex/values';
import seatsByRoom from './quizSeatDefinitions.js';
import { QUIZ_QUESTIONS, selectQuizQuestionIds } from './quizQuestions.js';
import { PLAYER_SCALE } from '../src/game/settings.js';

const ACTIVE_MS = 15_000;

async function playerFor(ctx, characterId, sessionId, room) {
  const player = await ctx.db.query('players').withIndex('by_player', q => q.eq('playerId', characterId)).unique();
  if (!player || player.characterId !== characterId || player.sessionId !== sessionId ||
      player.room !== room || Date.now() - player.lastSeen >= ACTIVE_MS) throw new Error('Sessão ou sala inválida.');
  return player;
}

async function activeParticipants(ctx, lobby) {
  const players = await ctx.db.query('players').withIndex('by_room', q => q.eq('room', lobby.room)).collect();
  const active = new Set(players.filter(p => Date.now() - p.lastSeen < ACTIVE_MS).map(p => p.characterId));
  return lobby.participants.filter(id => active.has(id));
}

function questionIdsFor(lobby) {
  return lobby.questionIds?.length?lobby.questionIds:QUIZ_QUESTIONS.map(question=>question.id);
}

function questionFor(lobby) {
  const id=questionIdsFor(lobby)[lobby.questionIndex??0];
  return QUIZ_QUESTIONS.find(question=>question.id===id)??null;
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
  const allAnswered=Boolean(question&&participants.length&&participants.every(id=>byCharacter.has(id)));
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
    const allAnswered=Boolean(question&&participants.length&&activeAnswers.length===participants.length);
    const ownAnswer=activeAnswers.find(answer=>answer.characterId===characterId);
    return {
      room:lobby.room,hostCharacterId:lobby.hostCharacterId,status:lobby.status,
      participants,createdAt:lobby.createdAt,questionIndex:lobby.questionIndex??0,
      questionCount:questionIdsFor(lobby).length,
      question:question?{
        id:question.id,category:question.category,difficulty:question.difficulty,
        question:question.question,answers:question.answers,
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
    if (!seat) throw new Error('Este personagem não possui cadeira nesta sala.');
    const body={x:player.x-10*PLAYER_SCALE,right:player.x+10*PLAYER_SCALE,y:player.y-12*PLAYER_SCALE,bottom:player.y};
    const dx=Math.max(seat.x-body.right,body.x-seat.x-seat.width,0);
    const dy=Math.max(seat.y-body.bottom,body.y-seat.y-seat.height,0);
    if (Math.hypot(dx,dy)>48) throw new Error('Aproxime-se da sua cadeira.');
    let lobby = await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    let participants=[];
    if (lobby) {
      participants=await activeParticipants(ctx,lobby);
      if (!participants.length) { await deleteLobby(ctx,lobby); lobby=null; }
      else if (lobby.status !== 'lobby') throw new Error('O lobby já foi iniciado.');
    }
    if (!lobby) {
      await ctx.db.insert('quizLobbies',{
        room:args.room,hostCharacterId:args.characterId,status:'lobby',participants:[args.characterId],
        questionIndex:0,questionIds:[],scores:[],scoredQuestionIds:[],createdAt:Date.now(),
      });
    } else {
      if (!participants.includes(args.characterId)) participants.push(args.characterId);
      if (participants.length > 4) throw new Error('Lobby cheio.');
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
    };
    await ctx.db.patch(lobby._id,patch);
    if(lobby.status==='starting')await scoreIfComplete(ctx,{...lobby,...patch},participants);
  },
});

export const start = mutation({
  args: { room:v.string(), characterId:v.string(), sessionId:v.string() },
  handler: async (ctx,args) => {
    await playerFor(ctx,args.characterId,args.sessionId,args.room);
    const lobby = await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    if (!lobby || lobby.status !== 'lobby' || lobby.hostCharacterId !== args.characterId) throw new Error('Somente o host pode iniciar.');
    const participants = await activeParticipants(ctx,lobby);
    if (participants.length < 2) throw new Error('São necessários pelo menos 2 jogadores.');
    const questionIds=selectQuizQuestionIds({seed:`${lobby._id}:${Date.now()}`});
    if(!questionIds.length)throw new Error('Nenhuma pergunta disponível.');
    await ctx.db.patch(lobby._id,{
      participants,status:'starting',questionIndex:0,questionIds,
      scores:participants.map(characterId=>({characterId,points:0})),scoredQuestionIds:[],
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
      throw new Error('Quiz indisponível para este jogador.');
    if(!Number.isInteger(args.answerIndex)||args.answerIndex<0||args.answerIndex>=question.answers.length)
      throw new Error('Alternativa inválida.');
    const existing=await ctx.db.query('quizAnswers').withIndex('by_lobby_question_character',q=>
      q.eq('lobbyId',lobby._id).eq('questionId',question.id).eq('characterId',args.characterId)).unique();
    if(existing){
      if(existing.answerIndex!==args.answerIndex)throw new Error('Este jogador já respondeu.');
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

export const nextQuestion = mutation({
  args: { room:v.string(), characterId:v.string(), sessionId:v.string() },
  handler: async (ctx,args) => {
    await playerFor(ctx,args.characterId,args.sessionId,args.room);
    let lobby=await ctx.db.query('quizLobbies').withIndex('by_room',q=>q.eq('room',args.room)).unique();
    if(!lobby||lobby.status!=='starting'||lobby.hostCharacterId!==args.characterId)
      throw new Error('Somente o host pode avançar.');
    const participants=await activeParticipants(ctx,lobby);
    const completion=await scoreIfComplete(ctx,lobby,participants);lobby=completion.lobby;
    if(!completion.allAnswered)throw new Error('Ainda existem jogadores respondendo.');
    const nextIndex=(lobby.questionIndex??0)+1;
    const questionCount=questionIdsFor(lobby).length;
    await ctx.db.patch(lobby._id,nextIndex>=questionCount
      ? {status:'finished',questionIndex:nextIndex}
      : {questionIndex:nextIndex});
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
        const patch={participants,hostCharacterId:participants.includes(lobby.hostCharacterId)?lobby.hostCharacterId:participants[0],scores:scoresFor(lobby,participants)};
        await ctx.db.patch(lobby._id,patch);currentLobby={...lobby,...patch};
      }
      if(currentLobby.status==='starting')await scoreIfComplete(ctx,currentLobby,participants);
    }
  },
});
