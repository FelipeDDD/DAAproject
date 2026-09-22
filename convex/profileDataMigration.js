import { internalMutationGeneric as internalMutation } from 'convex/server';
import { v } from 'convex/values';

// Administrative, explicit migration for the original automatic profiles only.
// It is intentionally internal and never runs during login or normal gameplay.
export const attachLegacyCharacterData=internalMutation({
  args:{profileId:v.id('profiles'),characterId:v.string()},
  handler:async(ctx,{profileId,characterId})=>{
    const profile=await ctx.db.get(profileId);
    if(!profile)throw new Error('Profile not found.');
    if(profile.profileName!==characterId)throw new Error('Legacy owner cannot be proven.');

    const [ownedProgress,ownedItems,legacyProgress,legacyItems,receipts]=await Promise.all([
      ctx.db.query('bossProgress').withIndex('by_profile_boss',q=>q.eq('profileId',profileId)).collect(),
      ctx.db.query('characterItems').withIndex('by_profile',q=>q.eq('profileId',profileId)).collect(),
      ctx.db.query('bossProgress').withIndex('by_character_boss',q=>q.eq('characterId',characterId)).collect(),
      ctx.db.query('characterItems').withIndex('by_character',q=>q.eq('characterId',characterId)).collect(),
      ctx.db.query('bossVictoryReceipts').collect(),
    ]);
    const unownedProgress=legacyProgress.filter(row=>!row.profileId);
    const unownedItems=legacyItems.filter(row=>!row.profileId);
    if(ownedProgress.length&&unownedProgress.length)throw new Error('Profile already has boss progress; merge manually.');
    if(ownedItems.length&&unownedItems.length)throw new Error('Profile already has items; merge manually.');

    for(const row of unownedProgress)await ctx.db.patch(row._id,{profileId});
    for(const row of unownedItems)await ctx.db.patch(row._id,{profileId});
    let migratedReceipts=0;
    for(const row of receipts){
      if(!row.profileId&&row.characterId===characterId){await ctx.db.patch(row._id,{profileId});migratedReceipts+=1;}
    }
    return {bossProgress:unownedProgress.length,characterItems:unownedItems.length,bossVictoryReceipts:migratedReceipts};
  },
});
