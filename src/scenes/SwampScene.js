import { MapScene } from './MapScene.js';
import Phaser from 'phaser';
import { objectsIn,propertiesOf } from '../maps/tiledObjects.js';
import { createFootCollision,readFootObstacles } from '../maps/footCollision.js';
import { isForegroundLayer, mapLayerDepth } from '../maps/layerDepth.js';
import { preloadSwampMobs, SwampMobs } from '../swamp/SwampMobs.js';
import { SwampRunController } from '../swamp/SwampRunController.js';
import { localSwampRun } from '../swamp/SwampRun.js';
import { preloadSwampSkills } from '../swamp/SwampCombatCasts.js';
import { SWAMP_PLAYER_COMBAT_GEOMETRY,SWAMP_PLAYER_FOOT_RADIUS as FOOT_RADIUS } from '../swamp/mobConfig.js';
import { bindSwampMovementFocus } from '../swamp/swampCastInput.js';
import placement from '../../public/assets/maps/swamp-occlusion/placement.json' with {type:'json'};

const COLLISION_COLORS = {rectangle:0xa9ef9a,polygon:0xffcc6b,polyline:0x61d9ff,ellipse:0xa9ef9a};
const SWAMP_OVERLAY_KEY = 'swamp-v3-large-manual-overlay';

export class SwampScene extends MapScene {
  constructor(key='swamp',filename='swamp.tmj') { super(key,filename); }

  create(destination) {
    super.create(destination);
    // The camera and player stop at the image edges, even on a partial tile.
    const background=this.source.layers.find(layer=>layer.type==='imagelayer'&&layer.name==='Background');
    const {width,height}=this.textures.get(`${this.mapKey}-image-layer-${background.id}`).getSourceImage();
    this.physics.world.setBounds(0,0,width,height);
    this.cameras.main.setBounds(0,0,width,height).setBackgroundColor('#151b19');

    const exit=this.mapTransitions.find(transition=>transition.id==='swamp-exit');
    if(exit){
      this.add.ellipse(exit.x,exit.y,36,16,0x9872e5,0.3)
        .setStrokeStyle(1,0xdfc4ff,0.85).setDepth(-1);
    }
  }
}

export class LargeSwampScene extends SwampScene {
  constructor() {
    super('swamp-v3-large','swamp-v3-large.tmj');
    this.showInventoryHotbar=false;
    this.playerFootRadius=FOOT_RADIUS;
  }

  createMapCollision(){
    const world = this.physics.world;
    const body = this.player.body;
    const obstacles = readFootObstacles(this.source);
    const resolve = createFootCollision(obstacles, world.bounds, FOOT_RADIUS);
    this.player.setCollideWorldBounds(false);
    const step = delta => {
      if (!body.enable || !body.moves) return;
      const start = {x:body.prev.x + body.halfWidth,y:body.prev.y + body.halfHeight};
      const end = body.center;
      const position = resolve(start,end);
      if (Math.abs(position.x - end.x) + Math.abs(position.y - end.y) < 1e-8) return;
      // Phaser places the sprite in postUpdate. Correct the current step only.
      body.position.set(position.x - body.halfWidth,position.y - body.halfHeight);
      body.updateCenter();
      body._dx = position.x - start.x;
      body._dy = position.y - start.y;
      if (delta > 0 && (body.velocity.x || body.velocity.y)) body.velocity.set(body._dx / delta,body._dy / delta);
    };
    world.on('worldstep',step);
    this.events.once('shutdown',()=>world.off('worldstep',step));
    return obstacles;
  }

  preload(){
    super.preload();
    if(import.meta.env.DEV){
      preloadSwampMobs(this);
      preloadSwampSkills(this);
    }
    this.load.image(SWAMP_OVERLAY_KEY,import.meta.env.BASE_URL+'assets/maps/swamp-v3-large-background-overlay.png');
    for(const name of Object.keys(placement)){
      this.load.image('swamp-cut-'+name,import.meta.env.BASE_URL+'assets/maps/swamp-occlusion/'+name+'.png');
    }
    this.load.image('swamp-cut-pillar-optimized',import.meta.env.BASE_URL+'assets/maps/swamp-occlusion/pillar-optimized.png');
  }

  create(destination){
    super.create(destination);
    this.player.combatGeometry=SWAMP_PLAYER_COMBAT_GEOMETRY;
    const focusListeners=new AbortController();
    bindSwampMovementFocus(this,focusListeners.signal);
    this.events.once('shutdown',()=>focusListeners.abort());
    if (import.meta.env.DEV) this.swampCollisionControl=this.createCollisionDebug();
    const background=this.source.layers.find(layer=>layer.type==='imagelayer'&&layer.name==='Background');
    // Mirror the Tiled image layer transform without changing the authored map.
    const overlay=this.add.image((background.x??0)+(background.offsetx??0),
      (background.y??0)+(background.offsety??0),SWAMP_OVERLAY_KEY)
      .setOrigin(0).setDepth(mapLayerDepth({name:'Overlay'},this.source));
    const outlines=this.add.graphics().setDepth(this.physics.world.bounds.height+2).setVisible(false);
    const cutouts=[];
    const refs=objectsIn(this.source,'OcclusionReferences').map(ref=>[ref.name,ref]);
    for(const ref of objectsIn(this.source,'Collision')){
      const name=propertiesOf(ref).occlusionMask;
      if(name)refs.push([name,ref]);
    }
    for(const [name,ref] of refs){
      const origin=placement[name];
      if(!origin)continue;
      const depth=ref.y+ref.height;
      cutouts.push(this.add.image(origin.x,origin.y,'swamp-cut-'+name)
        .setOrigin(0).setDepth(depth).setVisible(false).setData('occlusionName',name));
      outlines.lineStyle(1,0x6cfff0).strokeRect(ref.x,ref.y,ref.width,ref.height);
    }
    this.ambushLeafDepth=Math.max(this.physics.world.bounds.height,overlay.depth,...cutouts.map(cut=>cut.depth),
      ...this.source.layers.filter(isForegroundLayer).map(layer=>mapLayerDepth(layer,this.source)))+1;
    const label=document.createElement('label'), select=document.createElement('select');
    label.append('Swamp occlusion ',select);
    select.add(new Option('Manual overlay','manual'));
    select.add(new Option('Off','off'));
    if(cutouts.length){
      select.add(new Option('Prototype','prototype'));
      select.add(new Option('Prototype optimized','optimized'));
      select.add(new Option('Prototype debug','debug'));
    }
    select.onchange=()=>{
      const mode=select.value;
      const prototype=mode==='prototype'||mode==='optimized'||mode==='debug';
      overlay.setVisible(mode==='manual');
      for(const cut of cutouts){
        cut.setVisible(prototype);
        if(cut.getData('occlusionName')==='pillar')
          cut.setTexture(mode==='optimized'?'swamp-cut-pillar-optimized':'swamp-cut-pillar');
        if(mode==='debug')cut.setTint(0xf1bdee).setTintMode(Phaser.TintModes.FILL);
        else cut.clearTint();
      }
      outlines.setVisible(mode==='debug');
      select.blur();
    };
    const show=()=>document.getElementById('play-toolbar')?.append(label);
    const hide=()=>label.remove();
    if(import.meta.env.DEV){
      this.swampOcclusionControl=label;
      this.createSwampRun();
    }else{
      show();
      this.events.on('sleep',hide);
      this.events.on('wake',show);
      this.events.once('shutdown',()=>{
        this.events.off('sleep',hide);
        this.events.off('wake',show);
        hide();
      });
    }
  }

  createSwampRun(){
    const start=()=>{
      this.swampMobs??=new SwampMobs(this,localSwampRun(this.game));
      this.swampRun??=new SwampRunController(this);
      this.swampMobs.editor.advanced.append(this.swampOcclusionControl);
    };
    const stop=()=>{
      this.swampRun?.destroy();
      this.swampRun=null;
      this.swampMobs?.destroy();
      this.swampMobs=null;
    };
    start();
    this.events.on('wake',start);
    this.events.on('sleep',stop);
    this.events.once('shutdown',()=>{
      stop();
      this.events.off('wake',start);
      this.events.off('sleep',stop);
    });
  }

  interactWithScenePickup(){
    const run=this.swampRun;
    return run?.acceptsInteractionKey(this.interactKey.originalEvent)&&run.collectNearby();
  }
  onUnhandledInteract(){
    const run=this.swampRun;
    if(run?.acceptsInteractionKey(this.interactKey.originalEvent))run.casts.use(2);
  }

  update(time,delta){
    if(!this.swampRun?.blocking){
      const speed=this.player.speed;
      this.player.speed*=this.swampRun?.movementFactor??1;
      try{super.update(time,delta);}
      finally{this.player.speed=speed;}
    }
    this.swampRun?.update(delta);
  }

  createCollisionDebug(){
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    label.append(checkbox,' Show Collision Boundaries');
    label.title = 'Green: rectangle · Gold: polygon · Blue: polyline · Pink: feet';
    const outlines = this.add.graphics().setDepth(this.physics.world.bounds.height + 3).setVisible(false);
    const feet = this.add.graphics().setDepth(outlines.depth + 1).setVisible(false);
    for (const obstacle of this.collisionLayer) {
      const color=COLLISION_COLORS[obstacle.kind];
      outlines.fillStyle(color,0.12).lineStyle(2,color,0.85);
      if (obstacle.points) {
        if(obstacle.solid)outlines.fillPoints(obstacle.points,true);
        outlines.strokePoints(obstacle.points,obstacle.solid);
      }else outlines.fillCircle(obstacle.center.x,obstacle.center.y,obstacle.radius)
        .strokeCircle(obstacle.center.x,obstacle.center.y,obstacle.radius);
    }
    const drawFeet = () => {
      const visible=checkbox.checked&&Boolean(this.swampMobs?.editor.open);
      if(outlines.visible!==visible){outlines.setVisible(visible);feet.setVisible(visible);}
      if(!visible)return;
      const {x,y} = this.player.body.center;
      feet.clear().lineStyle(2,0xff84c6).strokeCircle(x,y,FOOT_RADIUS);
    };
    checkbox.onchange = () => {
      drawFeet();
      checkbox.blur();
    };
    this.events.on('postupdate',drawFeet);
    this.events.once('shutdown',()=>this.events.off('postupdate',drawFeet));
    return label;
  }
}
