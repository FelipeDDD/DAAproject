import { objectsIn } from '../maps/tiledObjects.js';
import { BOSS_REWARDS } from '../boss/BossRewards.js';

// The Tiled point controls the door's location; offsetY places its bottom on
// the wall/floor seam. These values can be tuned without changing the map.
export const OFFICE2_LOCKED_DOOR = Object.freeze({
  width: 60,
  height: 128,
  offsetX: 0,
  offsetY: 20,
  interactionRadius: 40,
  depth: -0.25,
});

export function canUnlockOffice2Door(items) {
  return Boolean(items?.some(item => item?.itemId === BOSS_REWARDS.DIRECTOR_ACCESS_BADGE &&
    item.compatible !== false));
}

export function office2LockedDoorPlacement(source) {
  const marker = objectsIn(source, 'Notes').find(object => object.name === 'office2-door-locked');
  if (!marker) return null;
  return {
    x: marker.x + OFFICE2_LOCKED_DOOR.offsetX,
    bottom: marker.y + OFFICE2_LOCKED_DOOR.offsetY,
    width: OFFICE2_LOCKED_DOOR.width,
    height: OFFICE2_LOCKED_DOOR.height,
  };
}

function paintDoor(graphics, placement, open) {
  const { width, height } = placement;
  const left = Math.round(placement.x - width / 2);
  const top = Math.round(placement.bottom - height);
  // Stop one pixel above the wall/floor join so no outline crosses onto the floor.
  const bottom = Math.round(placement.bottom) - 1;
  graphics.clear();
  const rect = (x, y, w, h, color, alpha = 1) => {
    graphics.fillStyle(color, alpha).fillRect(x, y, w, h);
  };

  if (open) {
    rect(left + 1, top + 1, width - 2, height - 3, 0x101b28, .88);
    rect(left + 2, top + 2, 2, height - 5, 0x627182, .75);
    rect(left + width - 10, top + 2, 8, height - 5, 0x9aa6b3, .8);
    rect(left + width - 10, top + 2, 1, height - 5, 0xd0d6d9, .8);
    return;
  }
  rect(left, top, width, 1, 0x435364, .7);
  rect(left, top, 1, height, 0x435364, .7);
  rect(left + width - 1, top, 1, height, 0x435364, .7);
  rect(left, bottom - 1, width, 1, 0x435364, .45);
  const lockX = left + width - 17;
  const lockY = bottom - 57;
  rect(lockX, lockY, 12, 13, 0x263345);
  rect(lockX + 2, lockY + 2, 8, 6, 0x7d8b9b);
  rect(lockX + 3, lockY + 3, 5, 2, 0xc5ccd1);
  rect(lockX + 3, lockY + 10, 7, 10, 0x92641d);
  rect(lockX + 4, lockY + 11, 5, 7, 0xd1a03d);
  rect(lockX + 6, lockY + 13, 2, 3, 0x27303b);
}

// The room background provides the bricks and floor; only the door detail is drawn.
export function drawOffice2LockedDoor(scene, source) {
  const placement = office2LockedDoorPlacement(source);
  if (!placement) return null;
  const graphics = scene.add.graphics().setDepth(OFFICE2_LOCKED_DOOR.depth);
  paintDoor(graphics, placement, false);
  return {
    setOpen(open) { paintDoor(graphics, placement, Boolean(open)); },
    destroy() { graphics.destroy(); },
  };
}
