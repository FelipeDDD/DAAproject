// Both maps use the same native atlas poses, ground pivot and death fade.
export function drawCombatEnemySprite(sprite,atlas,actor){
  const {enemy,spec}=actor;
  const dying=!enemy.hp,fade=dying?Math.min(1,actor.elapsed/actor.deathMs):0;
  const pose=dying&&spec.deathPose!==undefined?spec.deathPose+fade*340:enemy.poseMs;
  const flip=enemy.facing<0,originX=atlas.anchor[0]/atlas.width;
  const widthFactor=(enemy.stretchX??1)*(1+0.24*fade);
  sprite.setPosition(enemy.x,enemy.y).setDepth(enemy.y).setVisible(fade<1)
    .setScale(spec.scale*widthFactor,spec.scale*(1-0.8*fade)).setAlpha(1-fade)
    .setFrame(Math.min(atlas.frameMs.length-1,Math.floor(pose/atlas.frameMs[0])));
  if(actor.phase==='emerging')sprite.setAlpha(0.25+0.75*actor.elapsed/actor.emergeMs);
  if(flip!==sprite.flipX)sprite.setFlipX(flip).setOrigin(flip?1-originX:originX,atlas.anchor[1]/atlas.height);
}
