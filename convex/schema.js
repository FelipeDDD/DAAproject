import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { pvpModeValidator,payloadStateValidator } from './pvpModeValidators.js';

export default defineSchema({
  pvpMatches:defineTable({
    round:v.optional(v.number()),damageRevision:v.optional(v.number()),combatAuthorityId:v.optional(v.string()),
    retryDeadline:v.optional(v.number()),retryFromAuthorityId:v.optional(v.string()),
    code:v.string(),mode:pvpModeValidator,payload:v.optional(payloadStateValidator),state:v.union(v.literal('waiting'),v.literal('countdown'),v.literal('active'),v.literal('ended')),
    hostPlayerId:v.string(),participants:v.array(v.object({
      playerId:v.string(),sessionId:v.string(),displayName:v.string(),characterBaseId:v.string(),team:v.union(v.literal('A'),v.literal('B')),
      hp:v.number(),kills:v.number(),deaths:v.number(),life:v.number(),respawnAt:v.union(v.null(),v.number()),lastShot:v.number(),lastHitAt:v.number(),
    })),scores:v.object({A:v.number(),B:v.number()}),scoreLimit:v.number(),timeLimitMs:v.number(),respawnMs:v.number(),
    startedAt:v.union(v.null(),v.number()),endsAt:v.union(v.null(),v.number()),endedAt:v.union(v.null(),v.number()),
    winner:v.union(v.null(),v.literal('A'),v.literal('B'),v.literal('draw')),reason:v.union(v.null(),v.string()),
    createdAt:v.number(),expiresAt:v.number(),
  }).index('by_code',['code']).index('by_state',['state']),
  directorInvestigations:defineTable({
    profileId:v.id('profiles'),discoveredAt:v.number(),investigatedClueIds:v.array(v.string()),
    discoveryCount:v.union(v.literal(5),v.literal(6)),keyFoundAt:v.optional(v.number()),doorUnlockedAt:v.optional(v.number()),updatedAt:v.number(),
  }).index('by_profile',['profileId']),
  arenaLobbies:defineTable({
    code:v.optional(v.string()),closedReason:v.optional(v.string()),
    hostPlayerId:v.string(),status:v.union(v.literal('waiting'),v.literal('started'),v.literal('closed')),
    participants:v.array(v.object({playerId:v.string(),sessionId:v.string()})),
    maxParticipants:v.number(),createdAt:v.number(),expiresAt:v.number(),
  }).index('by_host',['hostPlayerId']).index('by_status',['status']).index('by_code',['code']),
  npcCollectibleQuests: defineTable({
    profileId:v.id('profiles'),questId:v.string(),deliveredPackIds:v.array(v.string()),
    currentPackId:v.optional(v.string()),activeSpawnId:v.optional(v.string()),
    devFreeCollect:v.optional(v.boolean()),
    completed:v.boolean(),rewardClaimed:v.boolean(),updatedAt:v.number(),
  }).index('by_profile_quest',['profileId','questId']),
  office3Safes: defineTable({
    profileId:v.id('profiles'),code:v.string(),createdAt:v.number(),openedAt:v.optional(v.number()),
    failures:v.optional(v.number()),blockedUntil:v.optional(v.number()),computerBlockedUntil:v.optional(v.number()),
  }).index('by_profile',['profileId']).index('by_code',['code']),
  directorWorkstations: defineTable({
    profileId:v.id('profiles'),failedAttempts:v.number(),updatedAt:v.number(),
    attemptedChoices:v.optional(v.array(v.union(v.literal('left'),v.literal('right')))),
    compromisedAt:v.optional(v.number()),remoteApprovedAt:v.optional(v.number()),
    portClueRevealedAt:v.optional(v.number()),
    physicalKeyVerifiedAt:v.optional(v.number()),recoveryCompletedAt:v.optional(v.number()),
  }).index('by_profile',['profileId']),
  quizCleanupWorker: defineTable({
    key:v.string(),generation:v.number(),jobId:v.optional(v.id('_scheduled_functions')),
  }).index('by_key',['key']),
  quizLobbies: defineTable({
    room:v.string(), hostPlayerId:v.optional(v.string()), hostCharacterId:v.optional(v.string()),
    status:v.union(v.literal('lobby'),v.literal('starting'),v.literal('finished')),
    participants:v.array(v.string()),seatAssignments:v.optional(v.array(v.object({playerId:v.string(),seatId:v.string()}))),createdAt:v.number(),
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
    scores:v.optional(v.array(v.object({playerId:v.optional(v.string()),characterId:v.optional(v.string()),points:v.number()}))),
    scoredQuestionIds:v.optional(v.array(v.string())),
    timedOutPlayerIds:v.optional(v.array(v.string())),
    timedOutCharacterIds:v.optional(v.array(v.string())),
    finishedReason:v.optional(v.literal('insufficient-participants')),
  }).index('by_room',['room']),
  quizAnswers: defineTable({
    lobbyId:v.id('quizLobbies'), room:v.string(), questionId:v.string(),
    playerId:v.optional(v.string()), characterId:v.optional(v.string()), answerIndex:v.number(), createdAt:v.number(),
  }).index('by_lobby',['lobbyId'])
    .index('by_lobby_player',['lobbyId','playerId'])
    .index('by_lobby_question',['lobbyId','questionId'])
    .index('by_lobby_question_player',['lobbyId','questionId','playerId']),
  quizQuestionHistory: defineTable({
    profileId:v.optional(v.id('profiles')),characterId:v.optional(v.string()),
    recentQuestions:v.array(v.object({questionId:v.string(),seenAt:v.number()})),
    updatedAt:v.number(),
  }).index('by_profile',['profileId']),
  soloQuizRuns: defineTable({
    profileId:v.optional(v.id('profiles')),playerId:v.optional(v.string()),sessionId:v.string(),mode:v.union(v.literal('study'),v.literal('challenge')),
    characterId:v.optional(v.string()),characterBaseId:v.optional(v.string()),
    settings:v.object({
      category:v.union(v.string(),v.null()),topic:v.optional(v.union(v.string(),v.null())),
      difficulty:v.union(v.literal('medium'),v.literal('hard'),v.null()),count:v.union(v.number(),v.null()),
    }),
    questions:v.array(v.object({
      id:v.string(),category:v.string(),topic:v.union(v.string(),v.null()),difficulty:v.string(),
      correctAnswer:v.number(),answerCount:v.number(),
    })),
    createdAt:v.number(),
  }).index('by_profile',['profileId']),
  itChallengeRuns: defineTable({
    profileId:v.optional(v.id('profiles')),playerId:v.optional(v.string()),sessionId:v.string(),rulesKey:v.string(),rulesVersion:v.number(),
    characterId:v.optional(v.string()),characterBaseId:v.optional(v.string()),
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
  }).index('by_profile',['profileId']),
  itChallengeHighScores: defineTable({
    profileId:v.optional(v.id('profiles')),characterId:v.optional(v.string()),characterBaseId:v.optional(v.string()),rulesKey:v.string(),rulesVersion:v.number(),variant:v.string(),durationMs:v.number(),
    score:v.number(),correct:v.number(),wrong:v.number(),skipped:v.number(),
    manualSkip:v.number(),timeoutSkip:v.number(),mediumCorrect:v.number(),hardCorrect:v.number(),
    achievedAt:v.number(),
  }).index('by_profile_rules',['profileId','rulesKey'])
    .index('by_rules_score',['rulesKey','score']),
  quizAttempts: defineTable({
    attemptKey:v.string(),profileId:v.optional(v.id('profiles')),characterId:v.optional(v.string()),characterBaseId:v.optional(v.string()),questionId:v.string(),category:v.string(),
    topic:v.union(v.string(),v.null()),difficulty:v.string(),
    mode:v.union(v.literal('study'),v.literal('challenge'),v.literal('multiplayer')),
    correct:v.optional(v.boolean()),
    outcome:v.optional(v.union(v.literal('correct'),v.literal('wrong'),v.literal('manualSkip'),v.literal('timeoutSkip'))),
    answeredAt:v.number(),
  }).index('by_attempt_key',['attemptKey'])
    .index('by_profile_time',['profileId','answeredAt'])
    .index('by_profile_question',['profileId','questionId']),
  quizPerformance: defineTable({
    profileId:v.optional(v.id('profiles')),characterId:v.optional(v.string()),category:v.string(),topic:v.union(v.string(),v.null()),difficulty:v.string(),
    mode:v.union(v.literal('study'),v.literal('challenge'),v.literal('multiplayer')),
    correct:v.number(),wrong:v.number(),answered:v.number(),
    skipped:v.optional(v.number()),manualSkip:v.optional(v.number()),timeoutSkip:v.optional(v.number()),
    updatedAt:v.number(),
  }).index('by_profile',['profileId'])
    .index('by_profile_bucket',['profileId','category','topic','difficulty','mode']),
  emoteEvents: defineTable({
    characterId:v.optional(v.string()),characterBaseId:v.optional(v.string()),playerId:v.string(),room:v.string(),emote:v.string(),createdAt:v.number(),
  }).index('by_room',['room']).index('by_player',['playerId']).index('by_createdAt',['createdAt']),
  messages: defineTable({room:v.string(),characterId:v.string(),characterName:v.string(),
    authorPlayerId:v.optional(v.string()),displayName:v.optional(v.string()),characterBaseId:v.optional(v.string()),
    profileId:v.optional(v.id('profiles')),text:v.string(),createdAt:v.number()})
    .index('by_room_createdAt',['room','createdAt']),
  doors: defineTable({room:v.string(),doorId:v.string(),open:v.boolean(),locked:v.boolean()})
    .index('by_room_door',['room','doorId']),
  profiles: defineTable({
    profileName:v.string(),displayName:v.optional(v.string()),selectedCharacterId:v.string(),
    passwordHash:v.optional(v.string()),passwordVersion:v.optional(v.number()),
    createdAt:v.number(),updatedAt:v.number(),
  }).index('by_profile_name',['profileName']),
  profileSessions: defineTable({
    profileId:v.id('profiles'),tokenHash:v.string(),createdAt:v.number(),expiresAt:v.number(),
  }).index('by_token_hash',['tokenHash'])
    .index('by_profile',['profileId'])
    .index('by_expires_at',['expiresAt']),
  profileLoginAttempts: defineTable({
    loginKey:v.string(),failures:v.number(),windowStartedAt:v.number(),
    blockedUntil:v.number(),updatedAt:v.number(),
  }).index('by_login_key',['loginKey']).index('by_updated_at',['updatedAt']),
  players: defineTable({
    presenceMode:v.optional(v.union(v.literal('playing'),v.literal('stationary'),v.literal('terminal'))),
    stationaryLeaseExpiresAt:v.optional(v.number()),
    terminalLeaseExpiresAt:v.optional(v.number()),
    playerId: v.string(), name: v.string(), displayName:v.optional(v.string()), room: v.string(),
    profileId:v.optional(v.id('profiles')),
    guestId:v.optional(v.string()),
    identityKind:v.optional(v.union(v.literal('profile'),v.literal('guest'))),
    characterId: v.optional(v.string()), characterBaseId:v.optional(v.string()), sessionId: v.optional(v.string()),
    x: v.number(), y: v.number(), direction: v.string(),
    moving:v.optional(v.boolean()),velocityX:v.optional(v.number()),velocityY:v.optional(v.number()),
    equippedSkin:v.optional(v.union(v.literal('classic'),v.literal('remastered'))),
    activeCharacterItem:v.optional(v.union(v.string(),v.null())),lastSeen: v.number(),
    lastItemUseId:v.optional(v.string()),lastItemUseAt:v.optional(v.number()),
  }).index('by_player', ['playerId']).index('by_character', ['characterId']).index('by_room', ['room']).index('by_lastSeen', ['lastSeen'])
    .index('by_presenceMode_lease',['presenceMode','terminalLeaseExpiresAt'])
    .index('by_presenceMode_stationaryLease',['presenceMode','stationaryLeaseExpiresAt']),
  bossProgress: defineTable({
    profileId:v.optional(v.id('profiles')),characterId:v.optional(v.string()),bossId:v.string(),wins:v.number(),defeated:v.boolean(),
    rewards:v.array(v.string()),equippedSkin:v.optional(v.union(v.literal('classic'),v.literal('remastered'))),updatedAt:v.number(),
  }).index('by_profile_boss',['profileId','bossId']).index('by_character_boss',['characterId','bossId']),
  characterItems: defineTable({
    profileId:v.optional(v.id('profiles')),characterId:v.optional(v.string()),characterBaseId:v.optional(v.string()),itemId:v.string(),quantity:v.optional(v.number()),active:v.optional(v.boolean()),cooldownUntil:v.number(),updatedAt:v.number(),
  }).index('by_profile_item',['profileId','itemId']).index('by_profile',['profileId'])
    .index('by_character_item',['characterId','itemId']).index('by_character',['characterId']),
  characterLoadouts: defineTable({
    profileId:v.id('profiles'),characterBaseId:v.string(),activeItemId:v.optional(v.string()),updatedAt:v.number(),
  }).index('by_profile_base',['profileId','characterBaseId']),
  profileCharacterState: defineTable({
    profileId:v.id('profiles'),characterBaseId:v.string(),room:v.string(),x:v.number(),y:v.number(),
    version:v.number(),updatedAt:v.number(),
  }).index('by_profile_base',['profileId','characterBaseId']),
  bossVictoryReceipts: defineTable({
    victoryId:v.string(),profileId:v.optional(v.id('profiles')),characterId:v.optional(v.string()),bossId:v.string(),wins:v.number(),
    outcome:v.union(v.literal('choice'),v.literal('automatic'),v.literal('none')),
    rewardId:v.optional(v.string()),createdAt:v.number(),
  }).index('by_victory_id',['victoryId']),
});
