// Gameplay defaults and mode permissions. These are server configuration,
// independent of Match Settings, Team Overrides and presentation.
export const SKILL_DEFAULTS=Object.freeze({
  'fire-zone':Object.freeze({cooldownMs:25000,telegraphMs:500,durationMs:5000,
    radius:56,damagePerSecond:5,tickMs:250,placementDistance:80}),
});
export const PVP_MODE_SKILLS=Object.freeze({
  tdm:Object.freeze({skills:Object.freeze([]),skillOverrides:Object.freeze({})}),
  payload:Object.freeze({skills:Object.freeze(['fire-zone']),skillOverrides:Object.freeze({})}),
});
// One input mapping, consumed only by SkillClient. No scene-specific hotkeys.
export const SKILL_INPUTS=Object.freeze({'fire-zone':Object.freeze({key:'Q',label:'Fire'})});
