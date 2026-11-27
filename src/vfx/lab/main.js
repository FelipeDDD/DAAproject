import './lab.css';

// The DEV page is not a production build entry or part of the main game's scene list.
export let game;

if(import.meta.env.DEV){
  const [{default:Phaser},{VFX_LAB_SIZE},{CombatSandboxScene},{VfxLabScene}]=await Promise.all([
    import('phaser'),import('./layout.js'),import('./CombatSandboxScene.js'),import('./VfxLabScene.js'),
  ]);
  const byId=id=>document.getElementById(id);
  const params=new URLSearchParams(location.search);
  const fromGame=params.get('from')==='game';
  let mode=(params.get('mode')??(fromGame?'vfx':'combat'))==='vfx'?'vfx':'combat';
  const buttons={combat:byId('mode-combat'),vfx:byId('mode-vfx')};
  const panels={
    combat:['combat-controls','fight-actions','combat-loadout','combat-bar','combat-help','combat-balance'],
    vfx:['vfx-controls','vfx-targets','vfx-footer','vfx-help'],
  };
  const loading=byId('arena-loading');
  const showMode=(ready)=>{
    loading.hidden=ready;
    for(const [id,button] of Object.entries(buttons)){
      button.disabled=!ready;
      button.setAttribute('aria-pressed',String(id===mode));
      for(const panel of panels[id])byId(panel).hidden=!ready||id!==mode;
    }
  };
  const ready=()=>{
    showMode(true);
    scenes[mode].focusArena();
  };
  const scenes={
    combat:new CombatSandboxScene({ready,start:byId('fight-start'),reset:byId('fight-reset'),pause:byId('fight-pause'),
      boxes:byId('fight-boxes'),status:byId('fight-status'),monster:byId('fight-monster'),
      composition:byId('fight-composition'),cloud:byId('fight-cloud'),cloudOption:byId('fight-cloud-option'),
      bossDebug:byId('fight-boss-debug'),bossPhase:byId('fight-boss-phase'),bossInfo:byId('fight-boss-info'),
      randomized:byId('fight-randomized'),retreat:byId('fight-retreat'),special:byId('fight-special'),
      parryVisual:byId('fight-parry-visual')}),
    vfx:new VfxLabScene({
      ready,select:byId('effect'),play:byId('play'),reset:byId('reset'),loop:byId('loop'),
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
    }),
  };
  for(const [id,button] of Object.entries(buttons)){
    button.addEventListener('click',()=>{
      if(id===mode)return;
      const previous=scenes[mode],next=scenes[id];
      const sleeping=next.sys.isSleeping();
      game.canvas.blur();
      game.scene.sleep(previous);
      mode=id;
      if(!sleeping)showMode(false);
      // Sleeping preserves both the combat draft and the preview's local timing settings.
      game.scene.run(next);
      if(sleeping)ready();
    });
  }
  byId('lab').hidden=false;
  byId('unavailable').hidden=true;
  const leave=byId('leave');
  leave.href=import.meta.env.BASE_URL;
  if(fromGame){
    leave.addEventListener('click',event=>{
      event.preventDefault();
      window.close();
      if(!window.closed)location.replace(leave.href);
    });
  }
  showMode(false);
  game=new Phaser.Game({
    type:Phaser.AUTO,parent:'vfx-canvas',...VFX_LAB_SIZE,
    backgroundColor:'#15191f',pixelArt:true,roundPixels:true,
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,autoRound:true},
    physics:{default:'arcade',arcade:{gravity:{x:0,y:0}}},
    scene:[scenes[mode],scenes[mode==='combat'?'vfx':'combat']],
  });
  window.addEventListener('pagehide',event=>{
    if(!event.persisted)game.destroy(true);
  });
}
