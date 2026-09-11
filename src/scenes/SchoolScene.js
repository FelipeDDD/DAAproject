import Phaser from 'phaser';
import { CAMERA_ZOOM } from '../game/settings.js';
import { Player } from '../entities/Player.js';
import { createPlaceholderTextures } from '../art/placeholders.js';
import { Door } from '../entities/Door.js';
import { classroomDoors } from '../maps/doors.js';
import { addMapCollision } from '../maps/collision.js';
import { createDoorTextures } from '../art/doors.js';

// CAMERA_ZOOM, PLAYER_SCALE and PLAYER_SPEED stay in ../game/settings.js.
const MAP_URL = `${import.meta.env.BASE_URL}assets/maps/classroom.tmj`;
const PLAYER_SPAWN_TILE = { x: 22, y: 24 };
const SHOW_TEMPORARY_WALLS = true;
const TEMPORARY_WALL_COLOR = 0xead4b4;
const MAIN_ROOM = { x: 21, y: 15, width: 18, height: 14 };
const SHOW_DESK_MONITORS = true;
// Six existing 2 x 4 tile desks in Objects; cabinets are not desks.
const DESKS = [
  { x: 26, y: 17 }, { x: 30, y: 17 }, { x: 34, y: 17 },
  { x: 26, y: 25 }, { x: 30, y: 25 }, { x: 34, y: 25 },
];

function isInMainRoom(x, y) {
  return x >= MAIN_ROOM.x && x < MAIN_ROOM.x + MAIN_ROOM.width &&
    y >= MAIN_ROOM.y && y < MAIN_ROOM.y + MAIN_ROOM.height;
}

// Adapt the current external TSX tilesets in memory; keep Tiled files untouched.
function readTileset(xml, firstgid) {
  const tileset = xml.documentElement;
  const image = tileset.querySelector('image');
  const number = (name) => Number(tileset.getAttribute(name));
  return {
    firstgid,
    name: tileset.getAttribute('name'),
    tilewidth: number('tilewidth'),
    tileheight: number('tileheight'),
    tilecount: number('tilecount'),
    columns: number('columns'),
    margin: number('margin'),
    spacing: number('spacing'),
    image: image.getAttribute('source'),
    imagewidth: Number(image.getAttribute('width')),
    imageheight: Number(image.getAttribute('height')),
  };
}

// Furniture occupies gaps in Floor: never outline desks/cabinets as walls.
// Keep the complete room interior open and the existing corridor connections.
function drawTemporaryWalls(scene, floor, objects, tiledWalls) {
  const walls = scene.add.graphics().setDepth(-1);
  walls.fillStyle(TEMPORARY_WALL_COLOR);
  const occupied = (x, y) => isInMainRoom(x, y) || floor.hasTileAt(x, y) ||
    objects?.hasTileAt(x, y) || tiledWalls?.hasTileAt(x, y);
  for (let y = 0; y < floor.layer.height; y++) {
    for (let x = 0; x < floor.layer.width; x++) {
      if (!occupied(x, y) && (
        occupied(x - 1, y) || occupied(x + 1, y) ||
        occupied(x, y - 1) || occupied(x, y + 1)
      )) {
        walls.fillRect(x * floor.tilemap.tileWidth, y * floor.tilemap.tileHeight,
          floor.tilemap.tileWidth, floor.tilemap.tileHeight);
      }
    }
  }
}

// Four temporary monitors per desk: two face down-left, two down-right.
// All coordinates are relative to the original 32 px tile size.
function drawDeskMonitors(scene, map) {
  for (const desk of DESKS) {
    const centerX = (desk.x + 1) * map.tileWidth;
    const centerY = (desk.y + 2) * map.tileHeight;
    for (const rowOffset of [-30, 30]) {
      for (const facing of [-1, 1]) {
        const g = scene.add.graphics({
          x: centerX + facing * 12 * map.tileWidth / 32,
          y: centerY + rowOffset * map.tileHeight / 32,
        })
          .setName(`desk-monitor-${desk.x}-${desk.y}-${rowOffset}-${facing}`)
          .setScale(map.tileWidth / 32, map.tileHeight / 32)
          .setDepth(centerY + (rowOffset + 16) * map.tileHeight / 32);
        // Mirror a three-quarter view so both screens face their seating side.
        const polygon = (color, points) => g.fillStyle(color).fillPoints(
          points.map(([x, y]) => ({ x: -facing * x, y })), true);
        polygon(0x859397, [[-7, 10], [3, 13], [8, 10], [-2, 7]]);
        g.fillStyle(0x52616a).fillRect(-2, 1, 4, 10);
        polygon(0x52616a, [[-7, -14], [10, -8], [10, 9], [7, 11], [-7, 5]]);
        polygon(0x283a45, [[-9, -12], [7, -6], [7, 11], [-9, 5]]);
        polygon(0x86d4e4, [[-7, -9], [5, -5], [5, 8], [-7, 4]]);
        polygon(0xd4f4f5, [[-6, -8], [4, -5], [4, -3], [-6, -6]]);
        // Keyboard follows the same diagonal on the outside of the screen.
        polygon(0xa7b4bc, [[-17, 9], [-6, 13], [-2, 19], [-13, 15]]);
        polygon(0xeaf0f2, [[-14, 11], [-7, 14], [-5, 16], [-12, 13]]);
      }
    }
  }
}

export class SchoolScene extends Phaser.Scene {
  constructor() {
    super('school');
  }

  preload() {
    const mapUrl = new URL(MAP_URL, window.location.href);
    this.load.once('filecomplete-json-classroom-source', (_key, _type, data) => {
      data.tilesets.forEach((reference, index) => {
        const key = `classroom-tileset-${index}`;
        const tilesetUrl = new URL(reference.source, mapUrl);
        this.load.once(`filecomplete-xml-${key}`, (_xmlKey, _xmlType, xml) => {
          const tileset = readTileset(xml, reference.firstgid);
          this.load.image(key, new URL(tileset.image, tilesetUrl).href);
        });
        this.load.xml(key, tilesetUrl.href);
      });
    });
    this.load.json('classroom-source', mapUrl.href);
  }

  create() {
    const source = this.cache.json.get('classroom-source');
    const data = {
      ...source,
      layers: source.layers
        .filter((layer) => ['Floor', 'Objects', 'Walls', 'Collision'].includes(layer.name))
        .map((layer) => layer.name === 'Walls' ? {
          ...layer,
          // Keep the existing main-room walls and the authored bathroom entrance.
          data: layer.data.map((gid, index) =>
            (isInMainRoom(index % layer.width, Math.floor(index / layer.width)) ||
              (index % layer.width >= 8 && index % layer.width <= 14 &&
                Math.floor(index / layer.width) <= 7)) ? gid : 0),
        } : layer),
      tilesets: source.tilesets.map((reference, index) =>
        readTileset(this.cache.xml.get(`classroom-tileset-${index}`), reference.firstgid)),
    };
    this.cache.tilemap.add('classroom', { format: Phaser.Tilemaps.Formats.TILED_JSON, data });
    const map = this.make.tilemap({ key: 'classroom' });
    const tilesets = data.tilesets.map((tileset, index) =>
      map.addTilesetImage(tileset.name, `classroom-tileset-${index}`));
    const floor = map.createLayer('Floor', tilesets, 0, 0).setDepth(-2);
    const objects = map.getLayer('Objects')
      ? map.createLayer('Objects', tilesets, 0, 0).setDepth(-1.5) : null;
    const walls = map.getLayer('Walls')
      ? map.createLayer('Walls', tilesets, 0, 0).setDepth(-0.5) : null;
    const width = map.widthInPixels;
    const height = map.heightInPixels;
    createPlaceholderTextures(this);
    if (SHOW_TEMPORARY_WALLS) drawTemporaryWalls(this, floor, objects, walls);
    if (SHOW_DESK_MONITORS) drawDeskMonitors(this, map);
    this.physics.world.setBounds(0, 0, width, height);

    this.player = new Player(this,
      (PLAYER_SPAWN_TILE.x + 0.5) * map.tileWidth,
      (PLAYER_SPAWN_TILE.y + 0.5) * map.tileHeight);
    this.collisionLayer = addMapCollision(this, map, tilesets, this.player);
    createDoorTextures(this);
    this.doors = classroomDoors.map((definition) => new Door(this, definition));
    for (const door of this.doors) this.physics.add.collider(this.player, door.blocker);
    this.interactKey = this.input.keyboard.addKey('E');
    this.travelKey = this.input.keyboard.addKey('F');
    this.hint = document.getElementById('interaction-hint');
    this.doorMessage = '';

    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setZoom(CAMERA_ZOOM);
    this.cameras.main.startFollow(this.player, true, 1, 1);

    // Avoid held movement when the player switches browser tabs/windows.
    const stop = () => {
      this.input.keyboard.resetKeys();
      this.player.setVelocity(0, 0);
    };
    this.game.events.on(Phaser.Core.Events.BLUR, stop);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.BLUR, stop);
    });
  }

  update() {
    this.player.update();
    const nearby = this.doors.filter((door) => door.isNear(this.player.body))
      .sort((a, b) => a.distanceTo(this.player.body) - b.distanceTo(this.player.body))[0];
    if (nearby !== this.nearbyDoor) this.doorMessage = '';
    this.nearbyDoor = nearby;
    // Consume each press even when no door is nearby.
    const interact = Phaser.Input.Keyboard.JustDown(this.interactKey);
    const travel = Phaser.Input.Keyboard.JustDown(this.travelKey);
    if (nearby && interact) this.doorMessage = nearby.toggle(this.player.body);
    const destination = nearby?.getDestination();
    const hint = nearby
      ? `${nearby.label} · ${nearby.locked ? 'Trancada' : `E: ${nearby.open ? 'fechar' : 'abrir'}`}${destination ? ' · F: acessar outra área' : ''} ${this.doorMessage}`
      : 'Aproxime-se de uma porta e pressione E.';
    if (this.hint.textContent !== hint) this.hint.textContent = hint;
    if (travel && destination) {
      if (!this.scene.manager.keys[destination.targetMap]) {
        this.hint.textContent = `Área não registrada: ${destination.targetMap}.`;
        return;
      }
      this.player.setVelocity(0, 0);
      this.input.keyboard.resetKeys();
      this.scene.pause();
      this.scene.launch(destination.targetMap, destination);
    }
  }
}
