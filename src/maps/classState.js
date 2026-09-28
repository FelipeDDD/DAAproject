// Safe rooms where a profile can resume. Combat and selection are deliberately excluded.
export const PERSISTENT_CLASS_ROOMS=Object.freeze(['school','outside','office2','office3','secret-path']);
const POSITION_LIMIT=10_000;

export function isPersistentClassRoom(room){return PERSISTENT_CLASS_ROOMS.includes(room);}

export function isValidClassPosition(room,x,y){
  return isPersistentClassRoom(room)&&Number.isFinite(x)&&Number.isFinite(y)
    &&x>=0&&y>=0&&x<=POSITION_LIMIT&&y<=POSITION_LIMIT;
}

export function classRestoreRoom(state){
  return state?.version===1&&isValidClassPosition(state.room,state.x,state.y)?state.room:'school';
}

export function classRestoreDestination(state,room,source){
  if(state?.version!==1||state.room!==room||!isValidClassPosition(room,state.x,state.y))return {};
  if(!source||state.x>=source.width*source.tilewidth||state.y>=source.height*source.tileheight)return {};
  return {targetX:state.x,targetY:state.y};
}
