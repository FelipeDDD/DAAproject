import {
  PLAYER_ATTACK_DEPTH,PLAYER_ATTACK_INITIAL_FRAME,playerAttackVisual,playerAttackVisualOffset,
} from '../boss/PlayerAttackVisuals.js';

// Presentation only: these values never enter a projectile packet or hit test.
export const PVP_PROJECTILE_VISUAL=Object.freeze({
  scale:1,rotation:0,rotateWithVelocity:false,offsetX:0,offsetY:0,depth:10_000,circleRadius:4,
  colors:Object.freeze({A:0x80d2fa,B:0xf4a290}),
});

export function pvpAttackVisual(characterBaseId){
  return playerAttackVisual(characterBaseId,()=>0);
}

export function pvpAttackVisualOffset(visual,facing,vx,vy){
  if(!visual)return {x:0,y:0};
  const length=Math.hypot(vx,vy)||1;
  return playerAttackVisualOffset(visual,facing,{x:vx/length,y:vy/length},'old');
}

export function inspectPvpAttackVisual(scene,attackVisual){
  const texture=attackVisual?.texture??null,animationKey=attackVisual?.animation??null;
  let textureExists=false,framesPrepared=[],animationExists=false;
  try{
    textureExists=Boolean(texture&&scene.textures?.exists(texture));
    if(textureExists){
      const source=scene.textures.get(texture);
      framesPrepared=Array.from({length:attackVisual.frames??1},(_,index)=>`attack-${index}`)
        .filter(frame=>source.has(frame));
    }
    animationExists=Boolean(animationKey&&scene.anims?.exists(animationKey));
  }catch{}
  const expectedFrameCount=attackVisual?.frames??1;
  const frameReady=textureExists&&framesPrepared.length===expectedFrameCount
    &&framesPrepared.includes(PLAYER_ATTACK_INITIAL_FRAME);
  return {texture,textureExists,frameCount:framesPrepared.length,expectedFrameCount,frameReady,
    animationKey,animationExists,spriteReady:Boolean(frameReady&&animationExists)};
}

export function createPvpProjectileVisual(scene,projectile,attackVisual,config=PVP_PROJECTILE_VISUAL,offset={x:0,y:0},onResult=()=>{}){
  const x=projectile.x+offset.x+config.offsetX,y=projectile.y+offset.y+config.offsetY;
  const readiness=inspectPvpAttackVisual(scene,attackVisual);
  let sprite;
  try{
    // Character attack definitions are animated. A partial setup (texture/frame
    // loaded but animation missing) must still produce a visible fallback.
    if(readiness.spriteReady){
      sprite=scene.add.sprite(x,y,attackVisual.texture,PLAYER_ATTACK_INITIAL_FRAME);
      const angle=Math.atan2(projectile.vy,projectile.vx);
      sprite.setDepth(PLAYER_ATTACK_DEPTH).setScale(attackVisual.scale).setRotation(angle);
      if(attackVisual.tint)sprite.setTint(attackVisual.tint);
      sprite.play(attackVisual.animation);
      report(onResult,{...readiness,visualCreated:Boolean(sprite),fallbackUsed:false,
        active:sprite.active!==false,visible:sprite.visible!==false});
      return sprite;
    }
  }catch(error){
    // Phaser can reject an invalid texture frame/animation during scene startup.
    // Keep the authoritative projectile visible even when its art is unavailable.
    sprite?.destroy();
    readiness.spriteReady=false;readiness.spriteError=String(error);
  }
  const visual=scene.add.circle(x,y,config.circleRadius,config.colors[projectile.team]??config.colors.A);
  try{
    const angle=Math.atan2(projectile.vy,projectile.vx);
    visual.setDepth(config.depth).setScale(config.scale)
      .setRotation(config.rotation+(config.rotateWithVelocity?angle:0));
  }catch(error){readiness.fallbackError=String(error);}
  report(onResult,{...readiness,visualCreated:Boolean(visual),fallbackUsed:true,
    active:visual.active!==false,visible:visual.visible!==false});
  return visual;
}

function report(callback,result){try{callback(result);}catch{}}

export function positionPvpProjectileVisual(visual,x,y,config=PVP_PROJECTILE_VISUAL,offset={x:0,y:0}){
  visual.setPosition(x+offset.x+config.offsetX,y+offset.y+config.offsetY);
}
