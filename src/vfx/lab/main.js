import './lab.css';

// The DEV page is not a production build entry or part of the main game's scene list.
export let game;

if(import.meta.env.DEV){
  const {default:Phaser}=await import('phaser');
  const {VfxLabScene}=await import('./VfxLabScene.js');
  const {LAB_EFFECTS}=await import('./effects.js');
  const {VFX_LAB_SIZE}=await import('./layout.js');
  const byId=id=>document.getElementById(id);
  const controls={
    select:byId('effect'),play:byId('play'),reset:byId('reset'),loop:byId('loop'),
    casting:byId('casting'),hotbar:byId('effect-hotbar'),fps:byId('fps'),
    showCastRange:byId('cast-range'),
    castDuration:byId('cast-duration'),castValue:byId('cast-value'),
    effectDuration:byId('effect-duration'),effectValue:byId('effect-value'),
    castRange:byId('cast-range-px'),rangeValue:byId('cast-range-value'),
    areaControl:byId('area-control'),areaRadius:byId('area-radius'),areaValue:byId('area-value'),
    projectileControl:byId('projectile-control'),projectile:byId('projectile'),
    timingHint:byId('timing-hint'),resetTiming:byId('reset-timing'),
  };
  for(const [id,effect] of Object.entries(LAB_EFFECTS)){
    controls.select.add(new Option(effect.label,id));
  }
  byId('lab').hidden=false;
  byId('unavailable').hidden=true;
  const leave=byId('leave');
  leave.href=import.meta.env.BASE_URL;
  if(new URLSearchParams(location.search).get('from')==='game'){
    leave.addEventListener('click',event=>{
      event.preventDefault();
      window.close();
      if(!window.closed)location.replace(leave.href);
    });
  }
  game=new Phaser.Game({
    type:Phaser.AUTO,parent:'vfx-canvas',...VFX_LAB_SIZE,
    backgroundColor:'#15191f',pixelArt:true,roundPixels:true,
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,autoRound:true},
    physics:{default:'arcade',arcade:{gravity:{x:0,y:0}}},
    scene:[new VfxLabScene(controls)],
  });
  window.addEventListener('pagehide',event=>{
    if(!event.persisted)game.destroy(true);
  });
}
