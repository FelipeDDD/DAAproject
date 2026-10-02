import { readFileSync,writeFileSync } from 'node:fs';
import { readDirectorClues,DIRECTOR_CLUE_IDS } from '../src/office2/directorInvestigation.js';
import { office2LockedDoorPlacement,OFFICE2_LOCKED_DOOR } from '../src/art/office2LockedDoor.js';

const sources=Object.fromEntries(['office2','office3'].map(room=>[room,
  JSON.parse(readFileSync(new URL(`../public/assets/maps/${room}.tmj`,import.meta.url),'utf8'))]));
const clues=Object.entries(sources).flatMap(([room,source])=>readDirectorClues(source,room));
for(const id of DIRECTOR_CLUE_IDS)if(clues.filter(clue=>clue.id===id).length!==1)
  throw new Error(`Expected exactly one Notes/${id} in office2/office3.`);
const placement=office2LockedDoorPlacement(sources.office2);
if(!placement)throw new Error('Missing Notes/office2-door-locked.');
const wall={room:'office2',x:placement.x,y:placement.bottom,radius:OFFICE2_LOCKED_DOOR.interactionRadius};
writeFileSync(new URL('../convex/directorInvestigationLocations.generated.js',import.meta.url),
  '// Generated from Tiled by scripts/sync-director-investigation.mjs.\n'
  +`export const DIRECTOR_CLUES = ${JSON.stringify(clues,null,2)};\n`
  +`export const DIRECTOR_HIDDEN_WALL = ${JSON.stringify(wall,null,2)};\n`);
console.log(`${clues.length} Director investigation clues synchronized.`);
