import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldShowStartButton } from '../src/QuizLobby.js';

test('start button follows the current host and lobby status',()=>{
  const lobby={status:'lobby',hostCharacterId:'michael'};
  assert.equal(shouldShowStartButton(lobby,'michael'),true);
  assert.equal(shouldShowStartButton(lobby,'felipe'),false);
  lobby.hostCharacterId='felipe';
  assert.equal(shouldShowStartButton(lobby,'michael'),false);
  assert.equal(shouldShowStartButton(lobby,'felipe'),true);
  lobby.status='starting';
  assert.equal(shouldShowStartButton(lobby,'felipe'),false);
});
