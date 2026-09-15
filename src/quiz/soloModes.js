import { SoloChallengeSession } from './SoloChallengeSession.js';
import { SoloStudySession } from './SoloStudySession.js';

export const SOLO_MODES=Object.freeze([
  {id:'study',label:'Study',description:'Learn with immediate feedback, without a competitive score.'},
  {id:'challenge',label:'IT Challenge',description:'Score as much as possible in five minutes of IT questions.'},
]);

export function createSoloSession(mode,questions) {
  if(mode==='study')return new SoloStudySession(questions);
  if(mode==='challenge')return new SoloChallengeSession(questions);
  throw new Error(`Unknown solo mode: ${mode}`);
}
