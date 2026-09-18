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
import { getPresence } from '../multiplayer/client.js';
import { RemotePlayers } from '../multiplayer/RemotePlayers.js';
import { DoorSync } from '../multiplayer/DoorSync.js';
import { CHARACTERS, characterById } from '../characters.js';
import { RoomChat } from '../RoomChat.js';
import { readQuizSeats } from '../maps/quizSeats.js';
import { QuizLobby } from '../QuizLobby.js';
import { readSoloStudySeats } from '../maps/soloStudySeats.js';
import { drawTiledTextObjects } from '../maps/tiledText.js';
import { tileObjectFrame } from '../maps/tiledTileObjects.js';
import { SoloStudyController } from '../SoloStudyController.js';
import { EmoteRenderer } from '../emotes/EmoteRenderer.js';
import { EmoteSync } from '../emotes/EmoteSync.js';
import { EmoteBar } from '../emotes/EmoteBar.js';
import { readChallengeLeaderboards,nearbyChallengeLeaderboard } from '../maps/challengeLeaderboards.js';
import {
  readTerminalComputers,nearbyTerminalComputer,terminalPromptPosition,TERMINAL_PROMPT,
} from '../maps/terminalComputers.js';
import { TerminalOverlayController } from '../terminal/TerminalOverlayController.js';
import '../terminal/terminal.css';

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
    for(const c of CHARACTERS)if(!this.textures.exists(c.sprite))this.load.svg(c.sprite,`${import.meta.env.BASE_URL}${c.asset}`);
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
    drawTiledTextObjects(this,this.source);
    const floorDetails = this.source.layers.find((layer) => layer.name === 'FloorDetails');
    if (floorDetails) {
      for (const object of objectsIn(this.source, 'FloorDetails').filter((item) => item.gid)) {
        const tileFrame = tileObjectFrame(object.gid, data.tilesets);
        if (!tileFrame) throw new Error(`Unknown tile GID ${object.gid} on floor detail ${object.id}`);
        const [sprite] = map.createFromObjects('FloorDetails', {
          id: object.id,
          key: `${this.mapKey}-tileset-${tileFrame.tilesetIndex}`,
          frame: tileFrame.frame,
        });
        sprite.setDepth(-1.9);
        sprite.setVisible(floorDetails.visible !== false && object.visible !== false);
        sprite.setAlpha(floorDetails.opacity ?? 1);
      }
    }
    for (const layerName of ['Entities', 'objectDecoration']) {
      const objectLayer = this.source.layers.find((layer) => layer.name === layerName);
      if (!objectLayer) continue;
      for (const object of objectsIn(this.source, layerName).filter((item) => item.gid)) {
        const tileFrame = tileObjectFrame(object.gid, data.tilesets);
        if (!tileFrame) throw new Error(`Unknown tile GID ${object.gid} on object ${object.id}`);
        // Resolve the texture BEFORE Phaser applies Tiled width/height. Replacing
        // it afterwards preserves a scale calculated from the missing texture.
        const [sprite] = map.createFromObjects(layerName, {
          id: object.id,
          key: `${this.mapKey}-tileset-${tileFrame.tilesetIndex}`,
          frame: tileFrame.frame,
        });
        const props = propertiesOf(object);
        sprite.setDepth(props.depth ?? object.y);
        sprite.setVisible(objectLayer.visible !== false && object.visible !== false);
        sprite.setAlpha(objectLayer.opacity ?? 1);
        if (typeof props.flipX === 'boolean') sprite.setFlipX(props.flipX);
      }
    }
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player = new Player(this, 0, 0);
    this.remotes = new RemotePlayers(this);
    this.collisionLayer = addMapCollision(this, map, this.player);
    this.doors = readDoors(this.source).map((definition) => new Door(this, definition));
    this.quizSeats = readQuizSeats(this.source);
    this.soloStudySeats=readSoloStudySeats(this.source);
    this.challengeLeaderboards=readChallengeLeaderboards(this.source);
    this.terminalComputers=readTerminalComputers(this.source);
    for (const door of this.doors) this.physics.add.collider(this.player, door.blocker);
    this.interactKey = this.input.keyboard.addKey('E');
    this.escapeKey = this.input.keyboard.addKey('ESC');
    this.hint = document.getElementById('interaction-hint');
    this.terminalPrompt=this.add.text(0,0,TERMINAL_PROMPT.text,{
      fontFamily:'system-ui, sans-serif',fontSize:'12px',fontStyle:'bold',color:'#ffffff',
      backgroundColor:'#53358a',padding:{x:6,y:3},
    }).setOrigin(.5,1).setDepth(100000).setVisible(false);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels).setZoom(CAMERA_ZOOM);
    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.enter(destination);

    const stop = () => { this.input.keyboard.resetKeys(); this.player.setVelocity(0, 0); };
    const wake = (_systems, arrival) => this.enter(arrival);
    const leave = () => {
      this.terminal?.destroy();this.terminal=null;
      this.emoteBar?.close();this.emoteBar=null;
      this.emoteSync?.close();this.emoteSync=null;
      this.emoteRenderer?.close();this.emoteRenderer=null;
      this.soloStudy?.close();this.soloStudy=null;
      this.quiz?.close();this.quiz=null;
      this.chat?.close();this.chat=null;
      this.doorSync?.close();
      this.doorSync = null;
      if (this.presence?.active?.room === this.mapKey) this.presence.leave();
    };
    this.events.on(Phaser.Scenes.Events.SLEEP, leave);
    this.events.on(Phaser.Scenes.Events.WAKE, wake);
    this.game.events.on(Phaser.Core.Events.BLUR, stop);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      leave();
      this.events.off(Phaser.Scenes.Events.SLEEP, leave);
      this.game.events.off(Phaser.Core.Events.BLUR, stop);
      this.events.off(Phaser.Scenes.Events.WAKE, wake);
    });
  }

  enter(destination = {}) {
    try {
      this.terminal?.destroy();
      this.terminal=new TerminalOverlayController(this);
      const spawn = resolveSpawn(this.source, destination);
      this.player.body.reset(spawn.x, spawn.y);
      this.presence = getPresence();
      const character=characterById(this.presence?.identity?.characterId);
      if(character)this.player.setTexture(character.sprite);
      this.presence?.enter(this.mapKey, () => ({
        x: this.player.x, y: this.player.y, direction: this.player.facing,
      }), rows => this.remotes.receive(rows));
      this.doorSync?.close();
      this.doorSync = this.presence ? new DoorSync(this.presence,this.mapKey,this.doors,()=>this.player.body) : null;
      this.chat?.close();
      this.chat=this.presence ? new RoomChat(this,this.presence) : null;
      this.quiz?.close();
      this.quiz=this.presence ? new QuizLobby(this,this.presence,this.quizSeats) : null;
      this.soloStudy?.close();
      this.soloStudy=this.presence ? new SoloStudyController(this,this.presence,this.soloStudySeats) : null;
      this.emoteBar?.close();this.emoteSync?.close();this.emoteRenderer?.close();
      this.emoteRenderer=this.presence ? new EmoteRenderer(this,this.mapKey,this.presence.identity.characterId,this.remotes) : null;
      this.emoteSync=this.presence ? new EmoteSync(this.presence,this.mapKey,this.emoteRenderer) : null;
      this.emoteBar=this.presence ? new EmoteBar(this.presence.identity.characterId,emote=>this.emoteSync.trigger(emote)) : null;
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
    if (!target) { this.doorMessage = `Unknown area: ${destination.targetMap}.`; return; }
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

  update(_time, delta) {
    if(this.terminal?.active||this.chat?.focused||this.quiz?.seated||this.soloStudy?.active)this.player.setVelocity(0,0);
    else this.player.update();
    this.remotes.update(delta);
    this.emoteRenderer?.update();
    if(this.doorSync)for(const door of this.doors)door.updateBlocker(this.player.body);
    if(this.terminal?.active){this.terminalPrompt.setVisible(false);this.hint.textContent='Terminal · Esc: back to classroom';return;}
    if(this.chat?.focused){this.terminalPrompt.setVisible(false);this.quiz?.updateSeatPrompt(false);this.soloStudy?.updateSeatPrompt(false);return;}
    const interact = Phaser.Input.Keyboard.JustDown(this.interactKey);
    const escape = Phaser.Input.Keyboard.JustDown(this.escapeKey);
    const quizSeat=this.quiz?.nearbySeat();
    const studySeat=this.soloStudy?.nearbySeat();
    const computer=nearbyTerminalComputer(this.terminalComputers,this.player.body);
    const challengeLeaderboard=nearbyChallengeLeaderboard(this.challengeLeaderboards,this.player.body);
    this.quiz?.updateSeatPrompt(!this.soloStudy?.active&&quizSeat);
    this.soloStudy?.updateSeatPrompt(!this.quiz?.seated&&studySeat);
    const showTerminalPrompt=Boolean(computer&&!this.quiz?.seated&&!this.soloStudy?.active);
    this.terminalPrompt.setVisible(showTerminalPrompt);
    if(showTerminalPrompt){const position=terminalPromptPosition(computer);this.terminalPrompt.setPosition(position.x,position.y);}
    if(this.soloStudy?.active){
      this.terminalPrompt.setVisible(false);
      if(escape)this.soloStudy.closePanel();
      const hint=this.soloStudy.leaderboardOpen?'IT Challenge leaderboard · Esc: close':'Solo Mode · Esc: close';
      if(this.hint.textContent!==hint)this.hint.textContent=hint;
      return;
    }
    if(this.quiz?.seated){
      this.terminalPrompt.setVisible(false);
      if(interact||escape)this.quiz.leave();
      const status=this.quiz.lobby?.status;
      const hint=this.quiz.confirmingLeave?'Confirm or cancel leaving in the panel':
        status==='finished'?'Quiz completed · Esc: leave':status==='starting'?'Quiz in progress · Esc: leave':'Seated in lobby · E/Esc: leave';
      if(this.hint.textContent!==hint)this.hint.textContent=hint;
      return;
    }
    if(interact&&quizSeat){
      this.quiz.interact();
      if(this.hint.textContent!=='Joining lobby…')this.hint.textContent='Joining lobby…';
      return;
    }
    if(interact&&studySeat){
      this.soloStudy.open(studySeat);
      this.hint.textContent='Opening Study Mode…';
      return;
    }
    if(interact&&challengeLeaderboard){
      this.soloStudy.openLeaderboardFromMap();
      this.hint.textContent='Opening IT Challenge leaderboard…';
      return;
    }
    if(interact&&computer){
      this.terminalPrompt.setVisible(false);
      void this.terminal.open(computer);
      return;
    }
    const nearby = this.doors.filter((door) => door.isNear(this.player.body))
      .sort((a, b) => a.distanceTo(this.player.body) - b.distanceTo(this.player.body))[0];
    if (nearby !== this.nearbyDoor) this.doorMessage = '';
    this.nearbyDoor = nearby;
    const destination = nearby?.getDestination();
    if (nearby && interact) {
      if(destination){
        this.travelTo(destination);
        return;
      }else if(this.doorSync){
        const sync=this.doorSync;
        sync.toggle(nearby).then(message=>{if(this.doorSync===sync)this.doorMessage=message;});
      }else this.doorMessage = nearby.toggle(this.player.body);
    }
    const action = nearby?.interactive === false ? 'Open passage' : `E to ${nearby?.open ? 'close' : 'open'} door`;
    const hint = quizSeat
      ? 'Your quiz chair · E: sit'
      : studySeat
      ? 'Study Mode · E: sit'
      : challengeLeaderboard
      ? '[E] View leaderboard'
      : computer
      ? '[E] Open Terminal'
      : nearby
      ? [nearby.locked ? 'Door locked' : destination ? 'Press E to exit' : action,this.doorMessage]
        .filter(Boolean).join(' · ')
      : `Press E to interact. ${this.doorMessage}`;
    if (this.hint.textContent !== hint) this.hint.textContent = hint;
    if (escape && propertiesOf(this.source).escapeReturn && this.returnDestination) this.travelTo(this.returnDestination);
  }
}
