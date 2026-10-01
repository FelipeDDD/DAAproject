import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireSessionToken } from './profileStore.js';
import { requireAuthenticatedLivePlayer } from './playerSessions.js';
import { characterBaseIdFor, baseCharacterId } from '../src/characters.js';
import { collectQuestPack, findQuest, grantQuestCollection, handInQuestPack, publicQuest, resetQuestCollection, setDevFreeCollect, startQuest } from './npcCollectibleQuestStore.js';

const sessionArgs = {token: v.string(), playerId: v.string(), sessionId: v.string()};
const devToolsEnabled = () => process.env.DEV_TOOLS_ENABLED === 'true'
  || /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(process.env.CONVEX_CLOUD_URL ?? '');
async function owner(ctx, args) {
  const {profile} = await requireSessionToken(ctx, args.token);
  const player = await requireAuthenticatedLivePlayer(ctx, args.playerId, args.sessionId);
  if (player.profileId !== profile._id || characterBaseIdFor(player) !== baseCharacterId(profile.selectedCharacterId))
    throw new Error('CHARACTER_SESSION_LOST');
  return {profileId: profile._id, player};
}
export const progress = query({args: {token: v.string()}, handler: async(ctx, args) => {
  const {profile} = await requireSessionToken(ctx, args.token);
  return publicQuest(ctx, profile._id, await findQuest(ctx, profile._id));
}});
export const start = mutation({args: sessionArgs, handler: async(ctx, args) => {
  const {profileId} = await owner(ctx, args);
  return startQuest(ctx, profileId);
}});
export const collect = mutation({args: {...sessionArgs, packId: v.string(), spawnId: v.string()},
  handler: async(ctx, args) => {
    const {profileId, player} = await owner(ctx, args);
    return collectQuestPack(ctx, profileId, player, args);
  }});
export const handIn = mutation({args: {...sessionArgs, packId: v.string()}, handler: async(ctx, args) => {
  const {profileId, player} = await owner(ctx, args);
  return handInQuestPack(ctx, profileId, player, args.packId);
}});

export const devResetCollection = mutation({args: sessionArgs, handler: async(ctx, args) => {
  if (!devToolsEnabled()) throw new Error('DEV collection tools are disabled on this deployment.');
  const {profileId} = await owner(ctx, args);
  return resetQuestCollection(ctx, profileId);
}});
export const devGrantCollection = mutation({args: sessionArgs, handler: async(ctx, args) => {
  if (!devToolsEnabled()) throw new Error('DEV collection tools are disabled on this deployment.');
  const {profileId} = await owner(ctx, args);
  return grantQuestCollection(ctx, profileId);
}});
export const devSetFreeCollect = mutation({args: {...sessionArgs,enabled:v.boolean()}, handler: async(ctx,args)=>{
  if(!devToolsEnabled())throw new Error('DEV collection tools are disabled on this deployment.');
  const {profileId}=await owner(ctx,args);
  return setDevFreeCollect(ctx,profileId,args.enabled);
}});
