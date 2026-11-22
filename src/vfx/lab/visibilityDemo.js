function insideSmoke(actor,center,radius){
  const dx=(actor.x-center.x)/radius,dy=(actor.y-center.y)/(radius*0.7);
  return dx*dx+dy*dy<=1;
}

export const ALLY_SMOKE_OPACITY=0.8;

export function smokeAlpha(actor,center,radius,team,{mode='teams',observer='blue',opacity=ALLY_SMOKE_OPACITY}={}){
  if(!insideSmoke(actor,center,radius))return 1;
  return mode==='teams'&&team!==observer?0:opacity;
}

// Only the sandbox actors participate. Restore their initial alpha on every exit path.
export function camouflageView(scene,center,radius,settings){
  const target=scene.target;
  const actors=[[scene.player,'blue','You'],[scene.allyDummy,'blue','Felipe'],[target,'red','Sarina']];
  const rows=actors.map(([sprite,team,name])=>{
    const badge=scene.add.text(0,0,name+' · '+(team==='blue'?'A':'B'),{
      fontFamily:'sans-serif',fontSize:'11px',color:team==='blue'?'#a4dfff':'#ffb5aa',stroke:'#171c24',strokeThickness:2,
    }).setOrigin(0.5,1);
    const hp=scene.add.graphics().fillStyle(0x1b252c).fillRect(-9,0,18,3)
      .fillStyle(team==='blue'?0x6ccff0:0xf48c81).fillRect(-8,1,15,1);
    const colors=[sprite.tintTopLeft,sprite.tintTopRight,sprite.tintBottomLeft,sprite.tintBottomRight];
    const originalMode=sprite.tintMode;
    const restoreTint=()=>sprite.setTint(...colors).setTintMode(originalMode);
    return {sprite,team,badge,hp,alpha:sprite.alpha,restoreTint,silhouette:false};
  });
  return {draw(){
    const options=settings();
    for(const row of rows){
      const {sprite,team,badge,hp,alpha}=row;
      const silhouette=(options.mode??'teams')==='teams'&&team===(options.observer??'blue')&&insideSmoke(sprite,center,radius);
      if(row.silhouette!==silhouette){
        if(silhouette)sprite.setTint(team==='blue'?0x9ed9ed:0xe6b5a8).setTintMode(scene.silhouetteTintMode);
        else row.restoreTint();
        row.silhouette=silhouette;
      }
      const value=smokeAlpha(sprite,center,radius,team,options);
      sprite.setAlpha(alpha*value);
      badge.setPosition(sprite.x,sprite.y-sprite.displayHeight+1).setDepth(sprite.y+6).setAlpha(value);
      hp.setPosition(sprite.x,sprite.y+1).setDepth(sprite.y+6).setAlpha(value);
    }
  },object:{destroy(){
    for(const {sprite,alpha,restoreTint,badge,hp} of rows){
      sprite.setAlpha(alpha);restoreTint();badge.destroy();hp.destroy();
    }

  }}};
}
