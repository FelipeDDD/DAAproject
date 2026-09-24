export const BOSS_MAX_HP=100;
export const BOSS_PHASE_THRESHOLDS=Object.freeze({2:0.67,3:0.34});
// Compatibility alias for code that only needs the first phase threshold.
export const BOSS_PHASE_THRESHOLD=BOSS_PHASE_THRESHOLDS[2];
export const BOSS_PHASE_TRANSITION_MS=2500;
export const BOSS_ACTIVATION_RANGE=380;
export const BOSS_FIGHT_START_DELAY_MS=1000;
export const BOSS_INTRO_FOLLOWUP_DELAY_MS=2300;
export const BOSS_INTRO_COMBAT_DELAY_MS=1000;
export const BOSS_SPEECH_DURATION_MS=4000;
export const BOSS_IMPORTANT_SPEECH_DURATION_MS=5500;
export const BOSS_RANDOM_SPEECH_MIN_MS=7000;
export const BOSS_RANDOM_SPEECH_MAX_MS=12000;
export const BOSS_PHASES=Object.freeze({
  1:Object.freeze({
    singleCooldownMs:2200,
    fanCooldownMs:3200,
    fanTelegraphMs:700,
    fanProjectiles:7,
    fanSpreadDegrees:80,
    projectileSpeed:270,
    areaCooldownMs:3000,
    areaTelegraphMs:900,
    homingCooldownMs:3200,
    homingSpeed:145,
    homingTurnRateDegrees:110,
    moveDurationMs:420,
    movePauseMs:200,
  }),
  2:Object.freeze({
    singleCooldownMs:1870,
    fanCooldownMs:2720,
    fanTelegraphMs:650,
    fanProjectiles:9,
    fanSpreadDegrees:86,
    projectileSpeed:270,
    areaCooldownMs:2550,
    areaTelegraphMs:800,
    homingCooldownMs:2720,
    homingSpeed:158,
    homingTurnRateDegrees:110,
    moveDurationMs:390,
    movePauseMs:170,
  }),
  3:Object.freeze({
    singleCooldownMs:1530,
    fanCooldownMs:2230,
    fanTelegraphMs:600,
    fanProjectiles:11,
    fanSpreadDegrees:92,
    projectileSpeed:270,
    areaCooldownMs:2090,
    areaTelegraphMs:675,
    homingCooldownMs:2230,
    homingSpeed:170,
    homingTurnRateDegrees:110,
    moveDurationMs:350,
    movePauseMs:130,
  }),
});
// Phase 1 aliases preserve the public configuration used by existing tests and tools.
export const BOSS_SINGLE_COOLDOWN=BOSS_PHASES[1].singleCooldownMs;
export const BOSS_FAN_COOLDOWN=BOSS_PHASES[1].fanCooldownMs;
export const BOSS_FAN_TELEGRAPH_MS=BOSS_PHASES[1].fanTelegraphMs;
export const BOSS_FAN_PROJECTILES=BOSS_PHASES[1].fanProjectiles;
export const BOSS_FAN_SPREAD=BOSS_PHASES[1].fanSpreadDegrees;
export const BOSS_AREA_COOLDOWN=BOSS_PHASES[1].areaCooldownMs;
export const BOSS_AREA_RADIUS=64;
export const BOSS_AREA_TELEGRAPH_MS=BOSS_PHASES[1].areaTelegraphMs;
export const BOSS_AREA_IMPACT_MS=200;
export const BOSS_AREA_DAMAGE=31;
export const BOSS_AREA_VISUAL_SCALE=0.34;
export const BOSS_AREA_TELEGRAPH_FRAME_RATE=6;
export const BOSS_AREA_IMPACT_FRAME_RATE=15;
export const BOSS_HOMING_COOLDOWN=BOSS_PHASES[1].homingCooldownMs;
export const BOSS_HOMING_SPEED=BOSS_PHASES[1].homingSpeed;
export const BOSS_HOMING_TURN_RATE_DEGREES=BOSS_PHASES[1].homingTurnRateDegrees;
export const BOSS_HOMING_LIFETIME_MS=6000;
export const BOSS_HOMING_DAMAGE=19;
export const BOSS_MOVE_DURATION_MS=BOSS_PHASES[1].moveDurationMs;
export const BOSS_MOVE_PAUSE_MS=BOSS_PHASES[1].movePauseMs;
// Kept as an alias for the combat-state default and existing tests.
export const BOSS_ATTACK_COOLDOWN_MS=BOSS_SINGLE_COOLDOWN;
export const BOSS_ATTACK_STATE_MS=180;
export const BOSS_HURT_STATE_MS=180;
export const BOSS_PROJECTILE_SPEED=BOSS_PHASES[1].projectileSpeed;
export const BOSS_PROJECTILE_LIFETIME_MS=5000;
export const BOSS_SINGLE_PROJECTILE_FRAME_SIZE=48;
export const BOSS_SINGLE_PROJECTILE_FRAME_RATE=10;
export const BOSS_SPRITE_FRAME_WIDTH=128;
export const BOSS_SPRITE_FRAME_HEIGHT=160;
export const BOSS_SPRITE_SCALE=0.65;
export const BOSS_PHASE3_FRAME_WIDTH=192;
export const BOSS_PHASE3_FRAME_HEIGHT=176;
export const BOSS_DEATH_COLLAPSE_MS=2400;
export const BOSS_DEATH_FADE_MS=650;
export const BOSS_DEFEAT_SPRITE_SCALE=0.18;
export const BOSS_LOOT_INTERACTION_RADIUS=74;
export const BOSS_ATTACK_TUTORIAL_MS=3800;
export const BOSS_ATTACK_TUTORIAL_DELAY_MS=3000;
export const BOSS_RETRY_DELAY_MS=5000;
export const BOSS_SPRITE_BODY_WIDTH=54;
export const BOSS_SPRITE_BODY_HEIGHT=82;
export const BOSS_SPRITE_BODY_OFFSET_X=37;
export const BOSS_SPRITE_BODY_OFFSET_Y=73;
export const BOSS_FAN_PROJECTILE_BODY_WIDTH=22;
export const BOSS_FAN_PROJECTILE_BODY_HEIGHT=26;
export const BOSS_FAN_PROJECTILE_BODY_OFFSET_X=(BOSS_SINGLE_PROJECTILE_FRAME_SIZE-BOSS_FAN_PROJECTILE_BODY_WIDTH)/2;
export const BOSS_FAN_PROJECTILE_BODY_OFFSET_Y=(BOSS_SINGLE_PROJECTILE_FRAME_SIZE-BOSS_FAN_PROJECTILE_BODY_HEIGHT)/2;
export const PLAYER_MAX_HP=100;
export const PLAYER_HIT_DAMAGE=16;
export const PLAYER_INVULNERABILITY_MS=650;
export const PLAYER_ATTACK_DAMAGE=4;
export const PLAYER_ATTACK_COOLDOWN_MS=1000;
export const PLAYER_PROJECTILE_SPEED=420;
export const PLAYER_PROJECTILE_LIFETIME_MS=700;
