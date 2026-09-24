import { objectsIn } from '../maps/tiledObjects.js';

const PAPER_DISPLAY_SIZE={width:31,height:29};
const PAPER_FRAME={x:328,y:382,width:624,height:548};
export const OFFICE3_MONITOR_STATUS=Object.freeze({x:122,y:107});

export function office3PaperPlacement(source){
  const marker=objectsIn(source,'Notes').find(object=>object.name==='pintar-papel');
  return marker?{x:marker.x,y:marker.y}:null;
}

// The note's point is the center of the paper in the office3 background image.
export function drawOffice3PaperHighlight(scene,source){
  const marker=office3PaperPlacement(source);
  if(!marker)return null;

  const texture=scene.textures.get('office3-yellow-paper-small');
  if(!texture.has('paper'))texture.add('paper',0,
    PAPER_FRAME.x,PAPER_FRAME.y,PAPER_FRAME.width,PAPER_FRAME.height);
  const paper=scene.add.image(marker.x,marker.y,'office3-yellow-paper-small','paper')
    .setOrigin(.5).setDisplaySize(PAPER_DISPLAY_SIZE.width,PAPER_DISPLAY_SIZE.height).setDepth(-1.8);
  const paperTween=scene.tweens.add({
    targets:paper,alpha:{from:.9,to:1},duration:850,yoyo:true,repeat:-1,ease:'Sine.InOut',
  });
  const monitorLed=scene.add.graphics().setDepth(-2.49);
  monitorLed.fillStyle(0x42ff58,.2).fillCircle(OFFICE3_MONITOR_STATUS.x,OFFICE3_MONITOR_STATUS.y,5)
    .fillStyle(0x164b20,1).fillCircle(OFFICE3_MONITOR_STATUS.x,OFFICE3_MONITOR_STATUS.y,2.4)
    .fillStyle(0x7dff82,1).fillCircle(OFFICE3_MONITOR_STATUS.x,OFFICE3_MONITOR_STATUS.y,1.5)
    .fillStyle(0xd7ffca,1).fillCircle(OFFICE3_MONITOR_STATUS.x-.5,OFFICE3_MONITOR_STATUS.y-.5,.55);
  const ledTween=scene.tweens.add({
    targets:monitorLed,alpha:{from:.72,to:1},duration:700,yoyo:true,repeat:-1,ease:'Sine.InOut',
  });
  return {destroy(){paperTween.stop();ledTween.stop();paper.destroy();monitorLed.destroy();}};
}
