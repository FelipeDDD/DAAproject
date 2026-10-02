import {
  BOSS_AREA_DAMAGE,BOSS_HOMING_DAMAGE,BOSS_MAX_HP,PLAYER_ATTACK_DAMAGE,PLAYER_HIT_DAMAGE,
} from './config.js';

export const BOSS_PARTICIPANT_SCALING=Object.freeze({
  1:Object.freeze({hp:1,damage:1}),
  2:Object.freeze({hp:1.75,damage:1.10}),
  3:Object.freeze({hp:2.40,damage:1.20}),
  4:Object.freeze({hp:3.00,damage:1.30}),
});

export function directorBossConfig(participantCount=1){
  if(!Number.isInteger(participantCount)||!BOSS_PARTICIPANT_SCALING[participantCount])
    throw new RangeError('Boss participant count must be between 1 and 4.');
  const scale=BOSS_PARTICIPANT_SCALING[participantCount];
  return Object.freeze({
    maxHp:Math.round(BOSS_MAX_HP*scale.hp),
    playerAttackDamage:PLAYER_ATTACK_DAMAGE,
    damage:Object.freeze({
      single:Math.round(PLAYER_HIT_DAMAGE*scale.damage),
      fan:Math.round(PLAYER_HIT_DAMAGE*scale.damage),
      homing:Math.round(BOSS_HOMING_DAMAGE*scale.damage),
      area:Math.round(BOSS_AREA_DAMAGE*scale.damage),
    }),
  });
}
