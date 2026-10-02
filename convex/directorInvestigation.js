import { queryGeneric as query,mutationGeneric as mutation } from 'convex/server';
import { v } from 'convex/values';
import { requireSessionToken } from './profileStore.js';
import { requireAuthenticatedLivePlayer } from './playerSessions.js';
import { directorFilesUnlocked } from './directorWorkstation.js';
import { DIRECTOR_CLUES,DIRECTOR_HIDDEN_WALL } from './directorInvestigationLocations.generated.js';
import { DIRECTOR_HIDDEN_KEY_ITEM_ID,DIRECTOR_CLUE_FAILURES } from '../src/office2/directorInvestigation.js';
import { pointInsideInteractionArea } from '../src/maps/namedInteractionAreas.js';

const authArgs={token:v.string(),playerId:v.string(),sessionId:v.string()};
const findState=(ctx,profileId)=>ctx.db.query('directorInvestigations')
  .withIndex('by_profile',q=>q.eq('profileId',profileId)).unique();
const findKey=(ctx,profileId)=>ctx.db.query('characterItems').withIndex('by_profile_item',q=>q
  .eq('profileId',profileId).eq('itemId',DIRECTOR_HIDDEN_KEY_ITEM_ID)).unique();
function publicState(row){
  return {active:Boolean(row),investigatedClueIds:row?.investigatedClueIds??[],
    investigationCount:row?.investigatedClueIds.length??0,keyFound:Boolean(row?.keyFoundAt),
    doorUnlocked:Boolean(row?.doorUnlockedAt)};
}
async function owner(ctx,args){
  const {profile}=await requireSessionToken(ctx,args.token);
  const player=await requireAuthenticatedLivePlayer(ctx,args.playerId,args.sessionId);
  if(player.profileId!==profile._id)throw new Error('CHARACTER_SESSION_LOST');
  return {profile,player};
}
export const status=query({args:authArgs,handler:async(ctx,args)=>{
  const {profile}=await owner(ctx,args);
  return publicState(await findState(ctx,profile._id));
}});
export const activate=mutation({args:authArgs,handler:async(ctx,args)=>{
  const {profile,player}=await owner(ctx,args);
  if(player.room!=='office2'||!await directorFilesUnlocked(ctx,profile._id))throw new Error('DIRECTOR_FILES_LOCKED');
  const existing=await findState(ctx,profile._id);
  if(existing)return publicState(existing);
  const now=Date.now(),row={profileId:profile._id,discoveredAt:now,investigatedClueIds:[],
    discoveryCount:Math.random()<.5?5:6,updatedAt:now};
  await ctx.db.insert('directorInvestigations',row);
  return publicState(row);
}});
export const investigate=mutation({args:{...authArgs,clueId:v.string()},handler:async(ctx,args)=>{
  const {profile,player}=await owner(ctx,args),row=await findState(ctx,profile._id);
  if(!row)throw new Error('INVESTIGATION_NOT_ACTIVE');
  const clue=DIRECTOR_CLUES.find(clue=>clue.id===args.clueId);
  if(!clue||clue.room!==player.room||!pointInsideInteractionArea(clue.area,player.x,player.y))
    throw new Error('INVESTIGATION_OUT_OF_RANGE');
  if(row.keyFoundAt||row.investigatedClueIds.includes(clue.id))return {state:publicState(row),duplicate:true};
  const ids=[...row.investigatedClueIds,clue.id],now=Date.now();
  const found=ids.length>=row.discoveryCount;
  const update={investigatedClueIds:ids,updatedAt:now,...(found?{keyFoundAt:now}:{})};
  await ctx.db.patch(row._id,update);
  let item;
  if(found){
    item=await findKey(ctx,profile._id);
    if(!item){
      item={profileId:profile._id,characterBaseId:player.characterBaseId??player.characterId,
        itemId:DIRECTOR_HIDDEN_KEY_ITEM_ID,quantity:1,cooldownUntil:0,updatedAt:now};
      await ctx.db.insert('characterItems',item);
    }
  }
  return {state:publicState({...row,...update}),...(item?{item:{itemId:item.itemId,quantity:item.quantity??1}}:{}),
    message:found?"Something metallic is hidden behind it. You found the Director's hidden key."
      :DIRECTOR_CLUE_FAILURES[(ids.length-1)%DIRECTOR_CLUE_FAILURES.length]};
}});
export const unlock=mutation({args:authArgs,handler:async(ctx,args)=>{
  const {profile,player}=await owner(ctx,args),wall=DIRECTOR_HIDDEN_WALL;
  const distance=Math.hypot(player.x-wall.x,player.y-wall.y);
  if(player.room!==wall.room||!Number.isFinite(distance)||distance>wall.radius)
    throw new Error('INVESTIGATION_OUT_OF_RANGE');
  const row=await findState(ctx,profile._id);
  if(row?.doorUnlockedAt)return publicState(row);
  const item=await findKey(ctx,profile._id);
  if(!row?.keyFoundAt||!item||(item.quantity??1)<1)throw new Error('HIDDEN_KEY_REQUIRED');
  // Keys in this game are retained; the persistent unlock marks this one as used.
  const update={doorUnlockedAt:Date.now(),updatedAt:Date.now()};
  await ctx.db.patch(row._id,update);
  return publicState({...row,...update});
}});
