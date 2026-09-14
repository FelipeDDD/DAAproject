import { distanceToSeat } from './quizSeats.js';
import { objectsIn, propertiesOf } from './tiledObjects.js';

export const SOLO_STUDY_DISTANCE=48;

export function readSoloStudySeats(source) {
  return objectsIn(source,'Entities').filter(object=>
    (object.class||object.type)==='soloStudySeat'||/^chairLuxury(?:-|$)/i.test(object.name??''))
    .map(object=>{
      const props=propertiesOf(object);
      return {
        id:String(object.id),name:object.name,x:object.x,y:object.y-object.height,
        width:object.width,height:object.height,
        seatX:props.seatX??object.x+object.width/2,seatY:props.seatY??object.y,
        direction:props.direction??'left',
      };
    });
}

export function nearbySoloStudySeat(seats,body) {
  return seats.filter(seat=>distanceToSeat(seat,body)<=SOLO_STUDY_DISTANCE)
    .sort((left,right)=>distanceToSeat(left,body)-distanceToSeat(right,body))[0]??null;
}
