import { objectsIn,propertiesOf } from './tiledObjects.js';

export const CHALLENGE_LEADERBOARD_DISTANCE=40;

export function readChallengeLeaderboards(source){
  return objectsIn(source,'Entities').filter(object=>(object.class||object.type)==='challengeLeaderboard')
    .map(object=>{
      const props=propertiesOf(object);
      const top=object.gid?object.y-object.height:object.y;
      return {
        id:String(props.id??object.id),x:object.x,y:top,width:object.width,height:object.height,
        interactionDistance:props.interactionDistance??CHALLENGE_LEADERBOARD_DISTANCE,
      };
    });
}

function distanceToBoard(board,body){
  const x=Math.max(board.x,Math.min(body.center.x,board.x+board.width));
  const y=Math.max(board.y,Math.min(body.center.y,board.y+board.height));
  return Math.hypot(body.center.x-x,body.center.y-y);
}

export function nearbyChallengeLeaderboard(boards,body){
  return boards.filter(board=>distanceToBoard(board,body)<=board.interactionDistance)
    .sort((left,right)=>distanceToBoard(left,body)-distanceToBoard(right,body))[0]??null;
}
