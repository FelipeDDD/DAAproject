import { SoloSession } from './SoloSession.js';

export class SoloStudySession extends SoloSession {
  constructor(questions){super(questions,{mode:'study'});}
}
