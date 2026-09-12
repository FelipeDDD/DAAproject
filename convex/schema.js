import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
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
