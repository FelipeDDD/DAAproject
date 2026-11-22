import './lab.css';

// The DEV page is not a production build entry or part of the main game's scene list.
export let game;

if(import.meta.env.DEV){
  const {default:Phaser}=await import('phaser');
  const {VFX_LAB_SIZE}=await import('./layout.js');
  const byId=id=>document.getElementById(id);
  const params=new URLSearchParams(location.search);
  const combat=params.get('mode')==='combat';
  let scene;
  if(combat){
    const {CombatSandboxScene}=await import('./CombatSandboxScene.js');
    scene=new CombatSandboxScene({start:byId('fight-start'),pause:byId('fight-pause'),
      boxes:byId('fight-boxes'),status:byId('fight-status'),monster:byId('fight-monster'),
      composition:byId('fight-composition'),cloud:byId('fight-cloud'),cloudOption:byId('fight-cloud-option'),
      bossDebug:byId('fight-boss-debug'),bossPhase:byId('fight-boss-phase'),bossInfo:byId('fight-boss-info'),
      randomized:byId('fight-randomized'),retreat:byId('fight-retreat'),special:byId('fight-special')});
    byId('lab-title').textContent=document.title='Combat Sandbox';
    byId('vfx-controls').hidden=byId('vfx-footer').hidden=true;
    byId('combat-controls').hidden=byId('combat-help').hidden=false;
    byId('lab-mode').textContent='VFX Laboratory';
    params.delete('mode');
  }else{
    const {VfxLabScene}=await import('./VfxLabScene.js');
    const controls={
      select:byId('effect'),play:byId('play'),reset:byId('reset'),loop:byId('loop'),
      casting:byId('casting'),hotbar:byId('effect-hotbar'),fps:byId('fps'),
      banks:byId('effect-banks'),variant:byId('variant'),variantControl:byId('variant-control'),
      reactions:{dummy:byId('reaction-dummy'),status:byId('reaction-status'),duration:byId('reaction-duration'),
        motion:byId('reaction-motion'),critical:byId('reaction-crit'),apply:byId('reaction-apply'),hit:byId('reaction-hit')},
      showCastRange:byId('cast-range'),camoControls:byId('camo-controls'),mode:byId('camo-mode'),
      observer:byId('observer'),opacity:byId('opacity'),opacityValue:byId('opacity-value'),
      castDuration:byId('cast-duration'),castValue:byId('cast-value'),
      effectDuration:byId('effect-duration'),effectValue:byId('effect-value'),
      castRange:byId('cast-range-px'),rangeValue:byId('cast-range-value'),
      areaControl:byId('area-control'),areaRadius:byId('area-radius'),areaValue:byId('area-value'),
      projectileControl:byId('projectile-control'),projectile:byId('projectile'),
      timingHint:byId('timing-hint'),resetTiming:byId('reset-timing'),
    };
    scene=new VfxLabScene(controls);
    params.set('mode','combat');
  }
  byId('lab-mode').href=location.pathname+(params.size?'?'+params.toString():'');
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
    scene:[scene],
  });
  window.addEventListener('pagehide',event=>{
    if(!event.persisted)game.destroy(true);
  });
}
