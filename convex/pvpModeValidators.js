import { v } from 'convex/values';
export const pvpModeValidator=v.union(v.literal('tdm'),v.literal('payload'));
export const payloadStateValidator=v.object({x:v.number(),y:v.number(),distance:v.number(),routeLength:v.number(),radius:v.number(),
  control:v.union(v.null(),v.literal('A'),v.literal('B')),contested:v.boolean(),moving:v.boolean()});
