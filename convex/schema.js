import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  quizLobbies: defineTable({
    room:v.string(), hostCharacterId:v.string(), status:v.union(v.literal('lobby'),v.literal('starting'),v.literal('finished')),
    participants:v.array(v.string()), createdAt:v.number(),
    questionIndex:v.optional(v.number()),
    questionDeadline:v.optional(v.number()),
    questionIds:v.optional(v.array(v.string())),
    settings:v.optional(v.object({
      category:v.union(v.string(),v.null()),
      topic:v.optional(v.union(v.string(),v.null())),
      difficulty:v.union(v.literal('medium'),v.literal('hard'),v.null()),
      count:v.union(v.number(),v.null()),
    })),
    questions:v.optional(v.array(v.object({
      id:v.string(),category:v.string(),topic:v.optional(v.union(v.string(),v.null())),difficulty:v.string(),question:v.string(),
      answers:v.array(v.string()),correctAnswer:v.number(),
      explanation:v.optional(v.string()),media:v.optional(v.any()),
    }))),
    scores:v.optional(v.array(v.object({characterId:v.string(),points:v.number()}))),
    scoredQuestionIds:v.optional(v.array(v.string())),
    timedOutCharacterIds:v.optional(v.array(v.string())),
    finishedReason:v.optional(v.literal('insufficient-participants')),
  }).index('by_room',['room']),
  quizAnswers: defineTable({
    lobbyId:v.id('quizLobbies'), room:v.string(), questionId:v.string(),
    characterId:v.string(), answerIndex:v.number(), createdAt:v.number(),
  }).index('by_lobby',['lobbyId'])
    .index('by_lobby_character',['lobbyId','characterId'])
    .index('by_lobby_question',['lobbyId','questionId'])
    .index('by_lobby_question_character',['lobbyId','questionId','characterId']),
  quizQuestionHistory: defineTable({
    characterId:v.string(),
    recentQuestions:v.array(v.object({questionId:v.string(),seenAt:v.number()})),
    updatedAt:v.number(),
  }).index('by_character',['characterId']),
  soloQuizRuns: defineTable({
    characterId:v.string(),sessionId:v.string(),mode:v.union(v.literal('study'),v.literal('challenge')),
    settings:v.object({
      category:v.union(v.string(),v.null()),topic:v.optional(v.union(v.string(),v.null())),
      difficulty:v.union(v.literal('medium'),v.literal('hard'),v.null()),count:v.union(v.number(),v.null()),
    }),
    questions:v.array(v.object({
      id:v.string(),category:v.string(),topic:v.union(v.string(),v.null()),difficulty:v.string(),
      correctAnswer:v.number(),answerCount:v.number(),
    })),
    createdAt:v.number(),
  }).index('by_character',['characterId']),
  itChallengeRuns: defineTable({
    characterId:v.string(),sessionId:v.string(),rulesKey:v.string(),rulesVersion:v.number(),
    variant:v.string(),durationMs:v.number(),startedAt:v.number(),deadline:v.number(),
    questions:v.array(v.object({
      id:v.string(),category:v.string(),topic:v.union(v.string(),v.null()),difficulty:v.string(),
      correctAnswer:v.number(),answerCount:v.number(),
    })),
    finishedAt:v.optional(v.number()),
    result:v.optional(v.object({
      score:v.number(),correct:v.number(),wrong:v.number(),skipped:v.number(),
      manualSkip:v.number(),timeoutSkip:v.number(),mediumCorrect:v.number(),hardCorrect:v.number(),
      totalAnswered:v.number(),accuracy:v.number(),
    })),
    wasPersonalBest:v.optional(v.boolean()),
  }).index('by_character',['characterId']),
  itChallengeHighScores: defineTable({
    characterId:v.string(),rulesKey:v.string(),rulesVersion:v.number(),variant:v.string(),durationMs:v.number(),
    score:v.number(),correct:v.number(),wrong:v.number(),skipped:v.number(),
    manualSkip:v.number(),timeoutSkip:v.number(),mediumCorrect:v.number(),hardCorrect:v.number(),
    achievedAt:v.number(),
  }).index('by_character_rules',['characterId','rulesKey'])
    .index('by_rules_score',['rulesKey','score']),
  quizAttempts: defineTable({
    attemptKey:v.string(),characterId:v.string(),questionId:v.string(),category:v.string(),
    topic:v.union(v.string(),v.null()),difficulty:v.string(),
    mode:v.union(v.literal('study'),v.literal('challenge'),v.literal('multiplayer')),
    correct:v.optional(v.boolean()),
    outcome:v.optional(v.union(v.literal('correct'),v.literal('wrong'),v.literal('manualSkip'),v.literal('timeoutSkip'))),
    answeredAt:v.number(),
  }).index('by_attempt_key',['attemptKey'])
    .index('by_character_time',['characterId','answeredAt'])
    .index('by_character_question',['characterId','questionId']),
  quizPerformance: defineTable({
    characterId:v.string(),category:v.string(),topic:v.union(v.string(),v.null()),difficulty:v.string(),
    mode:v.union(v.literal('study'),v.literal('challenge'),v.literal('multiplayer')),
    correct:v.number(),wrong:v.number(),answered:v.number(),
    skipped:v.optional(v.number()),manualSkip:v.optional(v.number()),timeoutSkip:v.optional(v.number()),
    updatedAt:v.number(),
  }).index('by_character',['characterId'])
    .index('by_character_bucket',['characterId','category','topic','difficulty','mode']),
  emoteEvents: defineTable({
    characterId:v.string(),playerId:v.string(),room:v.string(),emote:v.string(),createdAt:v.number(),
  }).index('by_room',['room']).index('by_character',['characterId']).index('by_createdAt',['createdAt']),
  messages: defineTable({room:v.string(),characterId:v.string(),characterName:v.string(),text:v.string(),createdAt:v.number()})
    .index('by_room_createdAt',['room','createdAt']),
  doors: defineTable({room:v.string(),doorId:v.string(),open:v.boolean(),locked:v.boolean()})
    .index('by_room_door',['room','doorId']),
  players: defineTable({
    playerId: v.string(), name: v.string(), room: v.string(),
    characterId: v.optional(v.string()), sessionId: v.optional(v.string()),
    x: v.number(), y: v.number(), direction: v.string(),
    equippedSkin:v.optional(v.union(v.literal('classic'),v.literal('remastered'))),
    activeCharacterItem:v.union(v.literal('lung_crusher_3000'),v.null()),lastSeen: v.number(),
  }).index('by_player', ['playerId']).index('by_room', ['room']).index('by_lastSeen', ['lastSeen']),
  bossProgress: defineTable({
    characterId:v.string(),bossId:v.string(),wins:v.number(),defeated:v.boolean(),
    rewards:v.array(v.string()),equippedSkin:v.optional(v.union(v.literal('classic'),v.literal('remastered'))),updatedAt:v.number(),
  }).index('by_character_boss',['characterId','bossId']),
  characterItems: defineTable({
    characterId:v.string(),itemId:v.string(),active:v.boolean(),cooldownUntil:v.number(),updatedAt:v.number(),
  }).index('by_character_item',['characterId','itemId']).index('by_character',['characterId']),
  bossVictoryReceipts: defineTable({
    victoryId:v.string(),characterId:v.string(),bossId:v.string(),wins:v.number(),
    outcome:v.union(v.literal('choice'),v.literal('automatic'),v.literal('none')),
    rewardId:v.optional(v.string()),createdAt:v.number(),
  }).index('by_victory_id',['victoryId']),
});
