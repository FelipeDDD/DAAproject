export const COMPUTER_STATUS_LIGHT=Object.freeze({
  radius:5,depthOffset:1,pulseMs:700,
});

export function drawComputerStatusLight(scene,x,y,{
  radius=COMPUTER_STATUS_LIGHT.radius,
  depth=y+COMPUTER_STATUS_LIGHT.depthOffset,
  pulseMs=COMPUTER_STATUS_LIGHT.pulseMs,
}={}){
  if(!Number.isFinite(x)||!Number.isFinite(y))return null;
  const light=scene.add.graphics().setDepth(depth);
  light.fillStyle(0x42ff58,.2).fillCircle(x,y,radius)
    .fillStyle(0x164b20,1).fillCircle(x,y,radius*.48)
    .fillStyle(0x7dff82,1).fillCircle(x,y,radius*.3)
    .fillStyle(0xd7ffca,1).fillCircle(x-radius*.1,y-radius*.1,radius*.11);
  const tween=scene.tweens.add({
    targets:light,alpha:{from:.72,to:1},duration:pulseMs,yoyo:true,repeat:-1,ease:'Sine.InOut',
  });
  return {light,tween,destroy(){tween.stop();light.destroy();}};
}
