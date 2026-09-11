import Phaser from 'phaser';
import { CAMERA_ZOOM } from '../game/settings.js';
import { Player } from '../entities/Player.js';
import { Door } from '../entities/Door.js';
import { createPlaceholderTextures } from '../art/placeholders.js';
import { createDoorTextures } from '../art/doors.js';
import { drawMapPlaceholders } from '../art/mapPlaceholders.js';
import { readDoors } from '../maps/doors.js';
import { addMapCollision } from '../maps/collision.js';
import { objectsIn, propertiesOf, resolveSpawn } from '../maps/tiledObjects.js';

function readTileset(xml, firstgid) {
  const root = xml.documentElement;
  const image = root.querySelector('image');
  const num = (key) => Number(root.getAttribute(key));
  return {
    firstgid, name: root.getAttribute('name'), image: image.getAttribute('source'),
    tilewidth: num('tilewidth'), tileheight: num('tileheight'), tilecount: num('tilecount'),
    columns: num('columns'), margin: num('margin'), spacing: num('spacing'),
    imagewidth: Number(image.getAttribute('width')), imageheight: Number(image.getAttribute('height')),
  };
}

// Interior and exterior use this single implementation of loading, collision and travel.
export class MapScene extends Phaser.Scene {
  constructor(key, filename) {
    super(key);
    this.mapKey = key;
    this.sourceKey = `${key}-source`;
    this.filename = filename;
  }

  preload() {
    const mapUrl = new URL(`${import.meta.env.BASE_URL}assets/maps/${this.filename}`, window.location.href);
    this.load.once(`filecomplete-json-${this.sourceKey}`, (_key, _type, data) => {
      data.tilesets.forEach((reference, index) => {
        const key = `${this.mapKey}-tileset-${index}`;
        const tilesetUrl = reference.source ? new URL(reference.source, mapUrl) : mapUrl;
        const loadImage = (tileset) => {
          const url = new URL(tileset.image, tilesetUrl).href;
          if (/\.svg$/i.test(tileset.image)) this.load.svg(key, url);
          else this.load.image(key, url);
        };
        if (reference.source) {
          this.load.once(`filecomplete-xml-${key}`, (_k, _t, xml) => loadImage(readTileset(xml, reference.firstgid)));
          this.load.xml(key, tilesetUrl.href);
        } else loadImage(reference);
      });
    });
    this.load.json(this.sourceKey, mapUrl.href);
  }

  create(destination = {}) {
    this.source = this.cache.json.get(this.sourceKey);
    const data = {
      ...this.source,
      tilesets: this.source.tilesets.map((reference, index) => reference.source
        ? readTileset(this.cache.xml.get(`${this.mapKey}-tileset-${index}`), reference.firstgid)
        : reference),
    };
    this.cache.tilemap.add(this.mapKey, { format: Phaser.Tilemaps.Formats.TILED_JSON, data });
    const map = this.make.tilemap({ key: this.mapKey });
    const tilesets = data.tilesets.map((definition, index) => {
      const key = `${this.mapKey}-tileset-${index}`;
      // Object tile sprites need explicit atlas frames, unlike tile layers.
      const texture = this.textures.get(key);
      for (let i = 0; i < definition.tilecount; i++) {
        const x = (definition.margin ?? 0) + (i % definition.columns) * (definition.tilewidth + (definition.spacing ?? 0));
        const y = (definition.margin ?? 0) + Math.floor(i / definition.columns) * (definition.tileheight + (definition.spacing ?? 0));
        if (!texture.has(i)) texture.add(i, 0, x, y, definition.tilewidth, definition.tileheight);
      }
      return map.addTilesetImage(definition.name, key);
    });
    for (const [name, depth] of [['Floor', -2], ['Decoration', -1.5], ['Walls', -0.5]]) {
      if (map.getLayer(name)) map.createLayer(name, tilesets).setDepth(depth);
    }
    createPlaceholderTextures(this);
    createDoorTextures(this);
    drawMapPlaceholders(this, this.source);
    const entitiesLayer = this.source.layers.find((layer) => layer.name === 'Entities');
    for (const object of objectsIn(this.source, 'Entities').filter((object) => object.gid)) {
      const [sprite] = map.createFromObjects('Entities', { id: object.id });
      const props = propertiesOf(object);
      sprite.setDepth(props.depth ?? object.y);
      sprite.setVisible(entitiesLayer.visible !== false && object.visible !== false);
      sprite.setAlpha(entitiesLayer.opacity ?? 1);
      if (typeof props.flipX === 'boolean') sprite.setFlipX(props.flipX);
    }
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player = new Player(this, 0, 0);
    this.collisionLayer = addMapCollision(this, map, this.player);
    this.doors = readDoors(this.source).map((definition) => new Door(this, definition));
    for (const door of this.doors) this.physics.add.collider(this.player, door.blocker);
    this.interactKey = this.input.keyboard.addKey('E');
    this.travelKey = this.input.keyboard.addKey('F');
    this.escapeKey = this.input.keyboard.addKey('ESC');
    this.hint = document.getElementById('interaction-hint');
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels).setZoom(CAMERA_ZOOM);
    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.enter(destination);

    const stop = () => { this.input.keyboard.resetKeys(); this.player.setVelocity(0, 0); };
    const wake = (_systems, arrival) => this.enter(arrival);
    this.events.on(Phaser.Scenes.Events.WAKE, wake);
    this.game.events.on(Phaser.Core.Events.BLUR, stop);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.BLUR, stop);
      this.events.off(Phaser.Scenes.Events.WAKE, wake);
    });
  }

  enter(destination = {}) {
    try {
      const spawn = resolveSpawn(this.source, destination);
      this.player.body.reset(spawn.x, spawn.y);
      this.returnDestination = destination.returnDestination;
      this.input.keyboard.resetKeys();
      this.doorMessage = '';
      this.nearbyDoor = null;
      document.querySelector('h1').textContent = propertiesOf(this.source).label ?? this.mapKey;
    } catch (error) {
      this.doorMessage = error.message;
      if (destination.returnDestination) this.travelTo(destination.returnDestination);
    }
  }

  travelTo(destination) {
    const target = this.scene.manager.keys[destination.targetMap];
    if (!target) { this.doorMessage = `Área não registrada: ${destination.targetMap}.`; return; }
    // Validate already-loaded destinations before leaving the current playable map.
    if (target.source) {
      try { resolveSpawn(target.source, destination); }
      catch (error) { this.doorMessage = error.message; return; }
    }
    const arrival = { ...destination, returnDestination: {
      targetMap: this.mapKey, targetX: this.player.x, targetY: this.player.y,
    } };
    this.player.setVelocity(0, 0);
    this.input.keyboard.resetKeys();
    if (destination.targetMap === this.mapKey) { this.enter(arrival); return; }
    // Sleep retains local door states; wake repositions using the destination's Spawns.
    this.scene.sleep();
    if (this.scene.isSleeping(destination.targetMap)) this.scene.wake(destination.targetMap, arrival);
    else this.scene.launch(destination.targetMap, arrival);
  }

  update() {
    this.player.update();
    const nearby = this.doors.filter((door) => door.isNear(this.player.body))
      .sort((a, b) => a.distanceTo(this.player.body) - b.distanceTo(this.player.body))[0];
    if (nearby !== this.nearbyDoor) this.doorMessage = '';
    this.nearbyDoor = nearby;
    const interact = Phaser.Input.Keyboard.JustDown(this.interactKey);
    const travel = Phaser.Input.Keyboard.JustDown(this.travelKey);
    const escape = Phaser.Input.Keyboard.JustDown(this.escapeKey);
    if (nearby && interact) this.doorMessage = nearby.toggle(this.player.body);
    const destination = nearby?.getDestination();
    const action = nearby?.interactive === false ? 'Passagem aberta' : `E: ${nearby?.open ? 'fechar' : 'abrir'}`;
    const hint = nearby
      ? `${nearby.label} · ${nearby.locked ? 'Trancada' : action}${destination ? ' · F: atravessar' : ''} ${this.doorMessage}`
      : `Aproxime-se de uma porta e pressione E. ${this.doorMessage}`;
    if (this.hint.textContent !== hint) this.hint.textContent = hint;
    if (travel && destination) this.travelTo(destination);
    else if (escape && propertiesOf(this.source).escapeReturn && this.returnDestination) this.travelTo(this.returnDestination);
  }
}
