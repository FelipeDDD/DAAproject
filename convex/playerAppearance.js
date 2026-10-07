import { DIRECTOR_BOSS_ID,normalizeBossProgress } from '../src/boss/BossRewards.js';

export async function profileEquippedSkin(ctx,profileId){
  const progress=await ctx.db.query('bossProgress').withIndex('by_profile_boss',q=>q
    .eq('profileId',profileId).eq('bossId',DIRECTOR_BOSS_ID)).unique();
  return normalizeBossProgress(progress).equippedSkin;
}
// Mirror the authoritative persisted choice in the same transaction that equips
// it. Scene/movement updates must never overwrite this mirror with a default.
export async function publishProfileSkin(ctx,profileId,progress){
  const skin=normalizeBossProgress(progress).equippedSkin;
  const players=(await ctx.db.query('players').collect()).filter(p=>p.profileId===profileId);
  for(const player of players)await ctx.db.patch(player._id,{equippedSkin:skin,previewSkin:undefined});
}
