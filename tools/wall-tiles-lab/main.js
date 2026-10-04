import Phaser from 'phaser';
import { drawMapPlaceholders } from '../../src/art/mapPlaceholders.js';
import { drawSchoolBackdrop } from '../../src/art/schoolBackdrop.js';
import { tileObjectFrame } from '../../src/maps/tiledTileObjects.js';

// Deliberately does not import MapScene: this viewer has no gameplay/network lifecycle.
const status = document.querySelector('#status');
const mapUrl = new URL('/assets/maps/classroom-wall-lab.tmj', location.href);
async function read(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
}
async function tileset(reference) {
  if (!reference.source) return { ...reference, url: new URL(reference.image, mapUrl).href };
  const url = new URL(reference.source, mapUrl);
  const xml = new DOMParser().parseFromString(await (await read(url)).text(), 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error(`TSX inválido: ${url}`);
  const root = xml.documentElement;
  const image = root.querySelector('image');
  const result = { firstgid: reference.firstgid, name: root.getAttribute('name'), image: image.getAttribute('source') };
  for (const key of ['tilewidth', 'tileheight', 'tilecount', 'columns', 'margin', 'spacing']) result[key] = Number(root.getAttribute(key));
  for (const key of ['width', 'height']) result[`image${key}`] = Number(image.getAttribute(key));
  result.url = new URL(result.image, url).href;
  return result;
}

async function start() {
  const source = await (await read(mapUrl)).json();
  const definitions = await Promise.all(source.tilesets.map(tileset));
  class WallLab extends Phaser.Scene {
    preload() {
      this.load.on('loaderror', file => { status.textContent = `Falha ao carregar ${file.src}`; this.failed = true; });
      definitions.forEach((definition, index) => {
        const key = `lab-${index}`;
        if (definition.url.endsWith('.svg')) this.load.svg(key, definition.url);
        else this.load.image(key, definition.url);
      });
    }
    create() {
      if (this.failed) return;
      this.cache.tilemap.add('lab', { format: Phaser.Tilemaps.Formats.TILED_JSON, data: { ...source, tilesets: definitions } });
      const map = this.make.tilemap({ key: 'lab' });
      const sets = definitions.map((definition, index) => {
        const texture = this.textures.get(`lab-${index}`);
        for (let frame = 0; frame < definition.tilecount; frame++) {
          texture.add(frame, 0,
            definition.margin + (frame % definition.columns) * (definition.tilewidth + definition.spacing),
            definition.margin + Math.floor(frame / definition.columns) * (definition.tileheight + definition.spacing),
            definition.tilewidth, definition.tileheight);
        }
        return map.addTilesetImage(definition.name, `lab-${index}`);
      });
      drawSchoolBackdrop(this, source);
      for (const [name, depth] of [['Floor', -2], ['Decoration', -1.5], ['Walls', -0.5]]) {
        if (map.getLayer(name)) map.createLayer(name, sets).setDepth(depth);
      }
      drawMapPlaceholders(this, source);
      for (const name of ['FloorDetails', 'Entities', 'objectDecoration']) {
        const layer = source.layers.find(item => item.name === name);
        for (const object of layer?.objects ?? []) {
          if (!object.gid) continue;
          const frame = tileObjectFrame(object.gid, definitions);
          if (!frame) throw new Error(`GID inválido: ${object.gid}`);
          const [sprite] = map.createFromObjects(name, { id: object.id, key: `lab-${frame.tilesetIndex}`, frame: frame.frame });
          const props = Object.fromEntries((object.properties ?? []).map(property => [property.name, property.value]));
          sprite.setDepth(name === 'FloorDetails' ? -1.9 : (props.depth ?? object.y));
          sprite.setVisible(layer.visible !== false && object.visible !== false).setAlpha(layer.opacity ?? 1);
          if (typeof props.flipX === 'boolean') sprite.setFlipX(props.flipX);
        }
      }
      const grid = this.add.graphics().setDepth(10000).lineStyle(1, 0xffffff, 0.18);
      for (let x = 0; x <= map.widthInPixels; x += 32) grid.lineBetween(x, 0, x, map.heightInPixels);
      for (let y = 0; y <= map.heightInPixels; y += 32) grid.lineBetween(0, y, map.widthInPixels, y);
      const collision = this.add.graphics().setDepth(10001).lineStyle(1, 0xff6677, 0.95).setVisible(false);
      for (const object of source.layers.find(layer => layer.name === 'Collision')?.objects ?? []) {
        if (object.polygon) collision.strokePoints(object.polygon.map(p => ({ x: p.x + object.x, y: p.y + object.y })), true);
        else if (object.ellipse) collision.strokeEllipse(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height);
        else collision.strokeRect(object.x, object.y, object.width, object.height);
      }
      const camera = this.cameras.main;
      const center = () => camera.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);
      document.querySelector('#center').onclick = center;
      document.querySelector('#grid').onchange = event => grid.setVisible(event.target.checked);
      document.querySelector('#collision').onchange = event => collision.setVisible(event.target.checked);
      document.querySelector('#zoom').onchange = event => camera.setZoom(Number(event.target.value));
      this.input.on('pointermove', pointer => {
        if (!pointer.isDown) return;
        camera.scrollX -= (pointer.x - pointer.prevPosition.x) / camera.zoom;
        camera.scrollY -= (pointer.y - pointer.prevPosition.y) / camera.zoom;
      });
      center();
      status.textContent = `Cópia carregada: ${map.widthInPixels}×${map.heightInPixels}px · nenhuma alteração no mapa principal.`;
    }
  }
  new Phaser.Game({ type: Phaser.AUTO, parent: 'map', pixelArt: true, backgroundColor: '#252a2d',
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' }, scene: WallLab });
}
const reference = document.querySelector('#reference');
const referenceImage = document.querySelector('#reference-image');
reference.onchange = () => { referenceImage.src = `/assets-drafts/tilesets/${encodeURIComponent(reference.value)}`; };
referenceImage.onerror = () => { referenceImage.alt = 'Referência ausente: copie as imagens para assets-drafts/tilesets nesta máquina.'; };
reference.onchange();
start().catch(error => { status.textContent = `Não foi possível abrir a bancada: ${error.message}`; });
