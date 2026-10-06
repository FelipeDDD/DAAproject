import { v } from 'convex/values';

const optionalNumber=()=>v.optional(v.union(v.number(),v.null()));
const fields=()=>({maxHp:optionalNumber(),damage:optionalNumber(),attackCooldownMs:optionalNumber(),movementSpeedMultiplier:optionalNumber()});
const override=v.union(v.object(fields()),v.null());
export const matchSettingsValidator=v.object({...fields(),teamOverrides:v.optional(v.union(
  v.object({A:v.optional(override),B:v.optional(override)}),v.null()))});
