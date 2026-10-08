// Gameplay defaults and mode permissions. These are server configuration,
// independent of Match Settings, Team Overrides and presentation.
export const SKILL_DEFAULTS=Object.freeze({
  'fire-zone':Object.freeze({cooldownMs:25000,telegraphMs:500,durationMs:5000,
    radius:56,damagePerSecond:5,tickMs:250,placementDistance:80,maxRangeTiles:6,tileSize:32}),
});
export const PVP_MODE_SKILLS=Object.freeze({
  tdm:Object.freeze({skills:Object.freeze([]),skillOverrides:Object.freeze({})}),
  payload:Object.freeze({skills:Object.freeze(['fire-zone']),skillOverrides:Object.freeze({
    // Temporary Payload testing cooldown. Remove this override to restore 25s.
    'fire-zone':Object.freeze({cooldownMs:5000}),
  })}),
});
// Shared keyboard/hotbar mapping for all skills; slots are numbered from 1.
// Keep gameplay parameters above; the icon is presentation only.
export const SKILL_INPUTS=Object.freeze({'fire-zone':Object.freeze({
  slot:2,key:'TWO',label:'Fire Zone',targeting:'ground-point',
  iconPath:'M12 2c1 5-3 6-3 10 0 2 1 3 2 3-1-3 2-4 3-6 3 3 5 5 5 8a7 7 0 0 1-14 0c0-5 4-8 7-15Z',
})});

// Shared geometry for the local preview and the authoritative placement.
export function clampSkillAim(origin,aim,maxRange){
  if(!origin||!aim||![origin.x,origin.y,aim.x,aim.y,maxRange].every(Number.isFinite)||maxRange<0)return null;
  const dx=aim.x-origin.x,dy=aim.y-origin.y,distance=Math.hypot(dx,dy);
  const clamped=distance>maxRange,scale=clamped?maxRange/distance:1;
  return {x:origin.x+dx*scale,y:origin.y+dy*scale,clamped};
}
