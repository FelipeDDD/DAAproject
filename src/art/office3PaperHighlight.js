import { objectsIn } from '../maps/tiledObjects.js';

const PAPER_SHIFT_X=2;
const PAPER_DISPLAY_SIZE={width:31,height:29};
const MONITOR_STATUS={x:122,y:107};

// The note's point is the center of the paper in the office3 background image.
export function drawOffice3PaperHighlight(scene,source){
  const marker=objectsIn(source,'Notes').find(object=>object.name==='pintar-papel');
  if(!marker)return null;

  const paper=scene.add.image(marker.x+PAPER_SHIFT_X,marker.y,'office3-yellow-paper')
    .setOrigin(.5).setDisplaySize(PAPER_DISPLAY_SIZE.width,PAPER_DISPLAY_SIZE.height).setDepth(-2.5);
  const paperTween=scene.tweens.add({
    targets:paper,alpha:{from:.9,to:1},duration:850,yoyo:true,repeat:-1,ease:'Sine.InOut',
  });
  const monitorLed=scene.add.graphics().setDepth(-2.49);
  monitorLed.fillStyle(0x42ff58,.2).fillCircle(MONITOR_STATUS.x,MONITOR_STATUS.y,5)
    .fillStyle(0x164b20,1).fillCircle(MONITOR_STATUS.x,MONITOR_STATUS.y,2.4)
    .fillStyle(0x7dff82,1).fillCircle(MONITOR_STATUS.x,MONITOR_STATUS.y,1.5)
    .fillStyle(0xd7ffca,1).fillCircle(MONITOR_STATUS.x-.5,MONITOR_STATUS.y-.5,.55);
  const ledTween=scene.tweens.add({
    targets:monitorLed,alpha:{from:.72,to:1},duration:700,yoyo:true,repeat:-1,ease:'Sine.InOut',
  });
  return {destroy(){paperTween.stop();ledTween.stop();paper.destroy();monitorLed.destroy();}};
}
