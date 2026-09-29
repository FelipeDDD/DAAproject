import assert from 'node:assert/strict';
import test from 'node:test';
import { CharacterItemClient } from '../src/inventory/CharacterItemClient.js';

test('inventory read and equip send the live session; guests have no persistent token', async () => {
  const calls=[];
  const presence={identity:{kind:'profile',playerId:'live-1',sessionId:'session-123456',characterBaseId:'michael'},
    profileSessionToken:'profile-token',api:{characterItems:{forProfile:'read',setActive:'equip',devClearPotions:'clear'}},
    client:{query:async(...args)=>{calls.push(args);return [];},mutation:async(...args)=>{calls.push(args);return {active:true};}}};
  const client=new CharacterItemClient(presence);
  await client.getItems();
  await client.setActive('lung_crusher_3000',true);
  await client.devClearPotions();
  assert.deepEqual(calls,[
    ['read',{token:'profile-token',playerId:'live-1',sessionId:'session-123456'}],
    ['equip',{token:'profile-token',playerId:'live-1',sessionId:'session-123456',itemId:'lung_crusher_3000',active:true}],
    ['clear',{token:'profile-token',playerId:'live-1',sessionId:'session-123456'}],
  ]);
  presence.identity.kind='guest';
  await assert.rejects(client.getItems(),/Profile session is unavailable/);
  assert.equal(calls.length,3);
});
