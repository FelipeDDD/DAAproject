export const IT_CHALLENGE_DURATION_MS=5*60_000;
export const IT_CHALLENGE_QUESTION_TIMEOUT_MS=30_000;
export const IT_CHALLENGE_FEEDBACK_DELAY_MS=1_000;

export const IT_CHALLENGE_CATEGORIES=Object.freeze([
  'Hardware',
  'Betriebssysteme',
  'Netzwerk',
  'Programmierung',
  'Zahlensysteme',
]);

export const IT_CHALLENGE_POINTS=Object.freeze({
  mediumCorrect:10,
  hardCorrect:17,
  wrong:-6,
  skip:-3,
});

export const IT_CHALLENGE_RULES_VERSION=1;
export const IT_CHALLENGE_VARIANT='5m';

export function itChallengeRulesKey(){
  return `${IT_CHALLENGE_VARIANT}:v${IT_CHALLENGE_RULES_VERSION}`;
}
