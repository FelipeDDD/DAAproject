import { characterBaseIdFor } from '../src/characters.js';
import { isValidClassPosition } from '../src/maps/classState.js';

export function findProfileCharacterState(ctx,profileId,characterBaseId){
  return ctx.db.query('profileCharacterState').withIndex('by_profile_base',q=>q
    .eq('profileId',profileId).eq('characterBaseId',characterBaseId)).unique();
}

export async function savePlayerClassState(ctx,player,now=Date.now()){
  if(!player?.profileId||!isValidClassPosition(player.room,player.x,player.y))return false;
  const characterBaseId=characterBaseIdFor(player);
  if(!characterBaseId)return false;
  const previous=await findProfileCharacterState(ctx,player.profileId,characterBaseId);
  const state={room:player.room,x:player.x,y:player.y,version:1,updatedAt:now};
  if(previous)await ctx.db.patch(previous._id,state);
  else await ctx.db.insert('profileCharacterState',{profileId:player.profileId,characterBaseId,...state});
  return true;
}

export function publicClassState(row){
  return row?{room:row.room,x:row.x,y:row.y,version:row.version,updatedAt:row.updatedAt}:null;
}
