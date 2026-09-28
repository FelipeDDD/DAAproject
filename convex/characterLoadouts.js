import { canCharacterOwnItem, characterItemDefinition } from '../src/inventory/characterItems.js';

export function findLoadout(ctx, profileId, characterBaseId) {
  return ctx.db.query('characterLoadouts').withIndex('by_profile_base', q => q
    .eq('profileId', profileId).eq('characterBaseId', characterBaseId)).unique();
}

export async function equippedItemId(ctx, profileId, characterBaseId) {
  const loadout = await findLoadout(ctx, profileId, characterBaseId);
  const itemId = loadout?.activeItemId;
  if (!itemId || !characterItemDefinition(itemId)?.activatable || !canCharacterOwnItem(characterBaseId, itemId)) return null;
  const owned = await ctx.db.query('characterItems').withIndex('by_profile_item', q => q
    .eq('profileId', profileId).eq('itemId', itemId)).unique();
  return owned ? itemId : null;
}
