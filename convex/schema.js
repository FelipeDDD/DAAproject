import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  quizLobbies: defineTable({
    room:v.string(), hostCharacterId:v.string(), status:v.union(v.literal('lobby'),v.literal('starting'),v.literal('finished')),
    participants:v.array(v.string()), createdAt:v.number(),
    questionIndex:v.optional(v.number()),
    questionIds:v.optional(v.array(v.string())),
    scores:v.optional(v.array(v.object({characterId:v.string(),points:v.number()}))),
    scoredQuestionIds:v.optional(v.array(v.string())),
  }).index('by_room',['room']),
  quizAnswers: defineTable({
    lobbyId:v.id('quizLobbies'), room:v.string(), questionId:v.string(),
    characterId:v.string(), answerIndex:v.number(), createdAt:v.number(),
  }).index('by_lobby',['lobbyId'])
    .index('by_lobby_character',['lobbyId','characterId'])
    .index('by_lobby_question',['lobbyId','questionId'])
    .index('by_lobby_question_character',['lobbyId','questionId','characterId']),
  messages: defineTable({room:v.string(),characterId:v.string(),characterName:v.string(),text:v.string(),createdAt:v.number()})
    .index('by_room_createdAt',['room','createdAt']),
  doors: defineTable({room:v.string(),doorId:v.string(),open:v.boolean(),locked:v.boolean()})
    .index('by_room_door',['room','doorId']),
  players: defineTable({
    playerId: v.string(), name: v.string(), room: v.string(),
    characterId: v.optional(v.string()), sessionId: v.optional(v.string()),
    x: v.number(), y: v.number(), direction: v.string(), lastSeen: v.number(),
  }).index('by_player', ['playerId']).index('by_room', ['room']).index('by_lastSeen', ['lastSeen']),
});
