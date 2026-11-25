import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { join } from 'node:path';
import { readFootObstacles } from '../src/maps/footCollision.js';
import { resolveSpawn } from '../src/maps/tiledObjects.js';
import { SWAMP_AMBUSH, SWAMP_MOB_TERRAIN, SWAMP_PLAYER_FOOT_RADIUS, swampEditorSpawns } from '../src/swamp/mobConfig.js';
import { createSwampSpawnTerrain } from '../src/swamp/mobMovement.js';
import { SPAWN_SOURCE_ROUTE, SpawnEdits } from '../src/swamp/spawnEdits.js';
import { localJsonPlugin } from './local-json-vite.mjs';

export async function validateSwampSource(data,root){
  if(data?.map!=='swamp-v3-large'||data.version!==3||!Array.isArray(data.additions)||!Array.isArray(data.disabled)||
    !data.positions||!data.settings)return 'Expected a complete Swamp V3 spawn document.';
  const map=JSON.parse(await readFile(join(root,'public','assets','maps','swamp-v3-large.tmj'),'utf8'));
  const {imagewidth:right,imageheight:bottom}=map.layers.find(layer=>layer.type==='imagelayer'&&layer.name==='Background');
  const terrain=createSwampSpawnTerrain(readFootObstacles(map),{left:0,top:0,right,bottom},
    SWAMP_PLAYER_FOOT_RADIUS,resolveSpawn(map));
  const edits=new SpawnEdits(swampEditorSpawns(),terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  edits.load(data);
  if(!isDeepStrictEqual(data,edits.data()))return 'The document contains invalid, protected or unreachable spawn edits.';
  for(const spawn of edits.snapshot().spawns){
    if(spawn.falseAlarm||!Object.hasOwn(SWAMP_MOB_TERRAIN,spawn.kind))return 'A regular spawn must have a creature.';
  }
  return '';
}

export function swampSpawnsPlugin(){
  return localJsonPlugin({name:'local-swamp-spawns',route:SPAWN_SOURCE_ROUTE,
    file:['src','swamp','spawns.json'],tokenHeader:'x-swamp-spawns-token',validate:validateSwampSource});
}
