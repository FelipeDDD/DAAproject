import { distanceToSeat } from './quizSeats.js';
import { objectsIn, propertiesOf } from './tiledObjects.js';

// Kept below one 32 px tile so the nearby door wins outside the chair area.
export const SOLO_STUDY_DISTANCE=24;

export function readSoloStudySeats(source) {
  return objectsIn(source,'Entities').filter(object=>{
    const declaredType=object.class||object.type;
    return declaredType==='soloStudySeat'||(!declaredType&&/^chairLuxury(?:-|$)/i.test(object.name??''));
  })
    .map(object=>{
      const props=propertiesOf(object);
      return {
        id:String(object.id),name:object.name,x:object.x,y:object.y-object.height,
        width:object.width,height:object.height,
        seatX:props.seatX??object.x+object.width/2,seatY:props.seatY??object.y,
        direction:props.direction??'left',
        interactionDistance:Math.min(32,props.interactionDistance??SOLO_STUDY_DISTANCE),
      };
    });
}

export function nearbySoloStudySeat(seats,body) {
  return seats.filter(seat=>distanceToSeat(seat,body)<=seat.interactionDistance)
    .sort((left,right)=>distanceToSeat(left,body)-distanceToSeat(right,body))[0]??null;
}
