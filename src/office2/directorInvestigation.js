import { objectsIn } from '../maps/tiledObjects.js';
import { readNamedMapMarker } from '../maps/namedMapMarkers.js';
import { pointInsideInteractionArea } from '../maps/namedInteractionAreas.js';

export const DIRECTOR_HIDDEN_KEY_ITEM_ID='director_hidden_key';
export const DIRECTOR_INVESTIGATION_FILE='Lost key.txt';
export const DIRECTOR_INVESTIGATION_EVENT='director-hidden-key';
export const DIRECTOR_CLUE_IDS=Object.freeze(['clue1','clue2','clue3','clue4','clue5','clue6']);
export const DIRECTOR_CLUE_HITBOX=Object.freeze({width:32,height:24,offsetX:0,offsetY:32,collisionGap:4,
  maxHorizontalShift:48,maxVerticalOffset:128});
export const DIRECTOR_CLUE_FAILURES=Object.freeze([
  'Nothing here. Just an impressive amount of dust.',
  'You found nothing useful. The dust declined to comment.',
  'Something suspicious about this painting. Unfortunately, it is only the painting.',
  'You found three paper clips. Somehow this feels worse than finding nothing.',
  'Something was moved here recently... but the key is not here.',
]);

// Keep the small feet zone on the accessible side of the marked object. A
// slight sideways shift can avoid a wall edge without pushing it far away.
export function readDirectorClues(source,room){
  const collisions=objectsIn(source,'Collision').filter(o=>o.width>0&&o.height>0);
  return DIRECTOR_CLUE_IDS.flatMap(id=>{
    const marker=readNamedMapMarker(source,id);
    if(!marker||marker.layer!=='Notes')return [];
    const props=marker.properties,defaults=DIRECTOR_CLUE_HITBOX;
    const width=props.interactionWidth??defaults.width,height=props.interactionHeight??defaults.height;
    let centerX=marker.x+(props.interactionOffsetX??defaults.offsetX);
    let centerY=marker.y+(props.interactionOffsetY??defaults.offsetY);
    if(![width,height,centerX,centerY].every(Number.isFinite)||width<=0||height<=0)
      throw new Error(`Invalid investigation hitbox: ${id}`);
    if(props.interactionOffsetY===undefined){
      const free=(x,y)=>!collisions.some(o=>x+width/2>o.x&&x-width/2<o.x+o.width
        &&y+height/2>o.y&&y-height/2<o.y+o.height);
      const xs=props.interactionOffsetX!==undefined?[centerX]
        :[centerX,...collisions.flatMap(o=>[o.x-width/2-defaults.collisionGap,o.x+o.width+width/2+defaults.collisionGap])];
      const ys=[centerY,...collisions.map(o=>o.y+o.height+height/2+defaults.collisionGap)];
      const candidates=xs.flatMap(x=>ys.map(y=>({x,y}))).filter(p=>
        Math.abs(p.x-centerX)<=defaults.maxHorizontalShift&&p.y>=marker.y&&p.y-marker.y<=defaults.maxVerticalOffset&&free(p.x,p.y));
      candidates.sort((a,b)=>(a.x-centerX)**2+(a.y-centerY)**2-((b.x-centerX)**2+(b.y-centerY)**2));
      if(!candidates.length)throw new Error(`No close accessible hitbox for ${id}; set interactionOffsetX/Y in Tiled.`);
      ({x:centerX,y:centerY}=candidates[0]);
    }
    return [{id,room,markerX:marker.x,markerY:marker.y,
      area:{x:centerX-width/2,y:centerY-height/2,width,height}}];
  });
}

export function availableDirectorClue(clues,state,x,y){
  if(!state?.active||state.keyFound)return null;
  return clues.find(clue=>!state.investigatedClueIds.includes(clue.id)
    &&pointInsideInteractionArea(clue.area,x,y))??null;
}
