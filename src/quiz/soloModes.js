import { SoloChallengeSession } from './SoloChallengeSession.js';
import { SoloStudySession } from './SoloStudySession.js';

export const SOLO_MODES=Object.freeze([
  {id:'study',label:'Study',description:'Learn with immediate feedback, without a competitive score.'},
  {id:'challenge',label:'Challenge',description:'Earn points and see a competitive result.'},
]);

export function createSoloSession(mode,questions) {
  if(mode==='study')return new SoloStudySession(questions);
  if(mode==='challenge')return new SoloChallengeSession(questions);
  throw new Error(`Unknown solo mode: ${mode}`);
}
