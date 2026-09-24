import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  OFFICE3_MONITOR, OFFICE3_STREAK_TARGET, chooseOffice3Question,
  OFFICE3_PASSWORD_DENIED_MS, nextStreak, passwordIsCorrect,
} from '../src/office3/office3Puzzle.js';
import { OFFICE3_MONITOR_STATUS, office3PaperPlacement } from '../src/art/office3PaperHighlight.js';
import { CHARACTER_ITEM_IDS, canCharacterOwnItem, normalizeCharacterItem } from '../src/inventory/characterItems.js';
import { inventoryItemUseBehavior, inventoryItemsFromSources, inventorySlots } from '../src/inventory/config.js';
import { isMapTransitionLocked, readMapTransitions } from '../src/maps/transitions.js';
import { objectsIn } from '../src/maps/tiledObjects.js';

test('monitor puzzle uses its existing green light and only accepts the negative subnet result', () => {
  assert.deepEqual([OFFICE3_MONITOR.x, OFFICE3_MONITOR.y],
    [OFFICE3_MONITOR_STATUS.x, OFFICE3_MONITOR_STATUS.y]);
  assert.equal(2 ** (32 - 28) + 2 ** (32 - 29) - 2 ** (32 - 23), -488);
  assert.equal(passwordIsCorrect('488'), true);
  assert.equal(passwordIsCorrect('-488'), false); // The minus sign is fixed in the UI.
  assert.equal(passwordIsCorrect('487'), false);
  assert.equal(passwordIsCorrect('48'), false);
  assert.equal(passwordIsCorrect(''), false);
  assert.ok(OFFICE3_PASSWORD_DENIED_MS > 1000);
});

test('small paper and inspection use the moved Notes marker', () => {
  const office = JSON.parse(readFileSync(new URL('../public/assets/maps/office3.tmj', import.meta.url), 'utf8'));
  const marker = objectsIn(office, 'Notes').find(object => object.name === 'pintar-papel');
  assert.ok(marker);
  assert.deepEqual(office3PaperPlacement(office), { x: marker.x, y: marker.y });
  assert.notDeepEqual(office3PaperPlacement(office), { x: 61, y: 127 });
  const moved = structuredClone(office);
  moved.layers.find(layer => layer.name === 'Notes').objects.find(object => object.name === 'pintar-papel').x += 16;
  assert.equal(office3PaperPlacement(moved).x, marker.x + 16);
  const image = readFileSync(new URL('../public/assets/items/yellow-paper-item.png', import.meta.url));
  assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
});

test('five correct answers in sequence unlock; any error resets to zero', () => {
  let count = 0;
  for (let index = 0; index < 4; index++) count = nextStreak(count, true);
  assert.equal(count, 4);
  count = nextStreak(count, false);
  assert.equal(count, 0);
  for (let index = 0; index < 5; index++) count = nextStreak(count, true);
  assert.equal(count, OFFICE3_STREAK_TARGET);
  assert.equal(nextStreak(count, true), OFFICE3_STREAK_TARGET);
});

test('quiz pulls four-answer questions from the existing bank without repeating the previous ID', () => {
  const first = chooseOffice3Question([], () => 0);
  const second = chooseOffice3Question([first.id], () => 0);
  assert.notEqual(second.id, first.id);
  assert.equal(first.answers.length, 4);
  assert.ok(first.correctAnswer >= 0 && first.correctAnswer < 4);
});

test('the persistent office key occupies one inventory slot and unlocks only office2', () => {
  const id = CHARACTER_ITEM_IDS.OFFICE2_KEY;
  assert.equal(canCharacterOwnItem('felipe', id), true);
  assert.equal(canCharacterOwnItem('sarina', id), true);
  const row = { characterId: 'felipe', itemId: id, active: false };
  const key = normalizeCharacterItem(row, 'felipe');
  assert.equal(key.type, 'key');
  assert.equal(inventoryItemUseBehavior(key), 'presentation');
  assert.equal(key.icon, 'assets/items/key-office.png');
  const keyImage = readFileSync(new URL('../public/' + key.icon, import.meta.url));
  assert.equal(keyImage.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(keyImage.readUInt32BE(16), keyImage.readUInt32BE(20) * 3);
  const items = inventoryItemsFromSources(null, [row, row], 'felipe');
  assert.equal(items.length, 1);
  assert.equal(inventorySlots(items).filter(Boolean).length, 1);
  assert.equal(isMapTransitionLocked({ locked: true, targetMap: 'office2' }, []), true);
  assert.equal(isMapTransitionLocked({ locked: true, targetMap: 'office2' }, items), false);
  assert.equal(isMapTransitionLocked({ locked: true, targetMap: 'arena' }, items), true);
  const classroom = JSON.parse(readFileSync(new URL('../public/assets/maps/classroom.tmj', import.meta.url), 'utf8'));
  const officeDoor = readMapTransitions(classroom).find(transition => transition.targetMap === 'office2');
  assert.ok(officeDoor);
  assert.equal(isMapTransitionLocked(officeDoor, []), true);
  assert.equal(isMapTransitionLocked(officeDoor, items), false);
});
