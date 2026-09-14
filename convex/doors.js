import { queryGeneric as query, mutationGeneric as mutation } from 'convex/server';
import { v } from 'convex/values';
import definitions from './doorDefinitions.js';
import { PLAYER_SCALE } from '../src/game/settings.js';

export const inRoom=query({
  args:{room:v.string()},
  handler:async(ctx,{room})=>{
    const saved=await ctx.db.query('doors').withIndex('by_room_door',q=>q.eq('room',room)).collect();
    return (definitions[room]??[]).map(d=>{
      const state=saved.find(s=>s.doorId===d.id);
      return {doorId:d.id,open:state?.open??d.open,locked:state?.locked??d.locked};
    });
  },
});

export const setOpen=mutation({
  args:{room:v.string(),doorId:v.string(),playerId:v.string(),open:v.boolean()},
  handler:async(ctx,args)=>{
    const d=definitions[args.room]?.find(d=>d.id===args.doorId);
    if(!d)throw new Error('Unknown door.');
    const saved=await ctx.db.query('doors').withIndex('by_room_door',q=>q.eq('room',args.room).eq('doorId',args.doorId)).unique();
    if((saved?.locked??d.locked)||!d.interactive)throw new Error('Door locked or passage is fixed.');
    const players=await ctx.db.query('players').withIndex('by_room',q=>q.eq('room',args.room)).collect();
    const active=players.filter(p=>Date.now()-p.lastSeen<15_000);
    const p=active.find(p=>p.playerId===args.playerId);
    const feet=p=>({x:p.x-10*PLAYER_SCALE,y:p.y-12*PLAYER_SCALE,right:p.x+10*PLAYER_SCALE,bottom:p.y});
    const body=p&&feet(p);
    if(!body||Math.hypot(Math.max(d.x-body.right,body.x-d.x-d.width,0),Math.max(d.y-body.bottom,body.y-d.y-d.height,0))>48)throw new Error('Move closer to the door.');
    if(!args.open&&active.some(p=>{const b=feet(p);return b.x<d.x+d.width&&b.right>d.x&&b.y<d.y+d.height&&b.bottom>d.y;}))throw new Error('Doorway occupied.');
    const state={room:args.room,doorId:d.id,open:args.open,locked:saved?.locked??d.locked};
    if(saved)await ctx.db.patch(saved._id,state);else await ctx.db.insert('doors',state);
    return null;
  },
});
