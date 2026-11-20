import Phaser from 'phaser';
import { drawMapPlaceholders } from '../art/mapPlaceholders.js';
import { objectsIn, propertiesOf } from './tiledObjects.js';
import { isForegroundLayer, mapLayerDepth } from './layerDepth.js';
import { drawTiledTextObjects } from './tiledText.js';
import { tileObjectFrame } from './tiledTileObjects.js';
import { applySmoothDecorativeTextureFilters } from './decorativeTextureFilters.js';

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

export function preloadTiledMap(scene, baseUrl) {
  const mapUrl = new URL(`${baseUrl}assets/maps/${scene.filename}`, window.location.href);
  if(scene.mapLoadVersion!==undefined)mapUrl.searchParams.set('v',String(scene.mapLoadVersion));
  scene.load.once(`filecomplete-json-${scene.sourceKey}`, (_key, _type, data) => {
    data.tilesets.forEach((reference, index) => {
      const key = `${scene.mapKey}-tileset-${index}`;
      const tilesetUrl = reference.source ? new URL(reference.source, mapUrl) : mapUrl;
      const loadImage = (tileset) => {
        const url = new URL(tileset.image, tilesetUrl).href;
        if (/\.svg$/i.test(tileset.image)) scene.load.svg(key, url);
        else scene.load.image(key, url);
      };
      if (reference.source) {
        scene.load.once(`filecomplete-xml-${key}`, (_k, _t, xml) => loadImage(readTileset(xml, reference.firstgid)));
        scene.load.xml(key, tilesetUrl.href);
      } else loadImage(reference);
    });
    data.layers.filter(layer=>layer.type==='imagelayer'&&layer.image).forEach(layer=>{
      scene.load.image(`${scene.mapKey}-image-layer-${layer.id}`,new URL(layer.image,mapUrl).href);
    });
  });
  scene.load.json(scene.sourceKey, mapUrl.href);
}

// Build the same Tiled world in networked and standalone scenes.
export function createTiledWorld(scene, prepareScene) {
  scene.source = scene.cache.json.get(scene.sourceKey);
  const data = {
    ...scene.source,
    tilesets: scene.source.tilesets.map((reference, index) => reference.source
      ? readTileset(scene.cache.xml.get(`${scene.mapKey}-tileset-${index}`), reference.firstgid)
      : reference),
  };
  scene.cache.tilemap.add(scene.mapKey, { format: Phaser.Tilemaps.Formats.TILED_JSON, data });
  const map = scene.make.tilemap({ key: scene.mapKey });
  for(const layer of data.layers.filter(item=>item.type==='imagelayer'&&item.image)){
    scene.add.image((layer.offsetx??0)+(layer.x??0),(layer.offsety??0)+(layer.y??0),`${scene.mapKey}-image-layer-${layer.id}`)
      .setOrigin(0).setDepth(mapLayerDepth(layer,data))
      .setVisible(layer.visible!==false).setAlpha(layer.opacity??1);
  }
  const tilesets = data.tilesets.map((definition, index) => {
    const key = `${scene.mapKey}-tileset-${index}`;
    // Object tile sprites need explicit atlas frames, unlike tile layers.
    const texture = scene.textures.get(key);
    for (let i = 0; i < definition.tilecount; i++) {
      const x = (definition.margin ?? 0) + (i % definition.columns) * (definition.tilewidth + (definition.spacing ?? 0));
      const y = (definition.margin ?? 0) + Math.floor(i / definition.columns) * (definition.tileheight + (definition.spacing ?? 0));
      if (!texture.has(i)) texture.add(i, 0, x, y, definition.tilewidth, definition.tileheight);
    }
    return map.addTilesetImage(definition.name, key);
  });
  applySmoothDecorativeTextureFilters({
    tilesets: data.tilesets,
    textureManager: scene.textures,
    textureKeyPrefix: `${scene.mapKey}-tileset-`,
    linearFilter: Phaser.Textures.FilterMode.LINEAR,
  });
  for (const [name, depth] of [['Floor', -2], ['Decoration', -1.5], ['Walls', -0.5]]) {
    if (map.getLayer(name)) map.createLayer(name, tilesets).setDepth(depth);
  }
  for(const layer of data.layers.filter(item=>item.type==='tilelayer'&&isForegroundLayer(item))){
    map.createLayer(layer.name,tilesets).setDepth(mapLayerDepth(layer,data))
      .setVisible(layer.visible!==false).setAlpha(layer.opacity??1);
  }
  prepareScene?.();
  drawMapPlaceholders(scene, scene.source);
  scene.tiledTextObjects=drawTiledTextObjects(scene,scene.source);
  const floorDetails = scene.source.layers.find((layer) => layer.name === 'FloorDetails');
  if (floorDetails) {
    for (const object of objectsIn(scene.source, 'FloorDetails').filter((item) => item.gid)) {
      const tileFrame = tileObjectFrame(object.gid, data.tilesets);
      if (!tileFrame) throw new Error(`Unknown tile GID ${object.gid} on floor detail ${object.id}`);
      const [sprite] = map.createFromObjects('FloorDetails', {
        id: object.id,
        key: `${scene.mapKey}-tileset-${tileFrame.tilesetIndex}`,
        frame: tileFrame.frame,
      });
      sprite.setDepth(-1.9);
      sprite.setVisible(floorDetails.visible !== false && object.visible !== false);
      sprite.setAlpha(floorDetails.opacity ?? 1);
    }
  }
  for (const layerName of ['Entities', 'objectDecoration']) {
    const objectLayer = scene.source.layers.find((layer) => layer.name === layerName);
    if (!objectLayer) continue;
    for (const object of objectsIn(scene.source, layerName).filter((item) => item.gid)) {
      const tileFrame = tileObjectFrame(object.gid, data.tilesets);
      if (!tileFrame) throw new Error(`Unknown tile GID ${object.gid} on object ${object.id}`);
      // Resolve the texture BEFORE Phaser applies Tiled width/height. Replacing
      // it afterwards preserves a scale calculated from the missing texture.
      const [sprite] = map.createFromObjects(layerName, {
        id: object.id,
        key: `${scene.mapKey}-tileset-${tileFrame.tilesetIndex}`,
        frame: tileFrame.frame,
      });
      const props = propertiesOf(object);
      sprite.setDepth(props.depth ?? object.y);
      sprite.setVisible(objectLayer.visible !== false && object.visible !== false);
      sprite.setAlpha(objectLayer.opacity ?? 1);
      if (typeof props.flipX === 'boolean') sprite.setFlipX(props.flipX);
    }
  }
  scene.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  return map;
}
