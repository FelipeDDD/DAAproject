import { MapScene } from './MapScene.js';
import Phaser from 'phaser';
import { objectsIn,propertiesOf } from '../maps/tiledObjects.js';
import { createFootCollision,readFootObstacles } from '../maps/footCollision.js';
import placement from '../../public/assets/maps/swamp-occlusion/placement.json' with {type:'json'};

const FOOT_RADIUS = 8; // World pixels, centered on the Arcade foot body.
const COLLISION_COLORS = {rectangle:0xa9ef9a,polygon:0xffcc6b,polyline:0x61d9ff,ellipse:0xa9ef9a};

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
  constructor() { super('swamp-v3-large','swamp-v3-large.tmj'); }

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
    for(const name of Object.keys(placement)){
      this.load.image('swamp-cut-'+name,import.meta.env.BASE_URL+'assets/maps/swamp-occlusion/'+name+'.png');
    }
    this.load.image('swamp-cut-pillar-optimized',import.meta.env.BASE_URL+'assets/maps/swamp-occlusion/pillar-optimized.png');
  }

  create(destination){
    super.create(destination);
    if (import.meta.env.DEV) this.createCollisionDebug();
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
    const label=document.createElement('label'), select=document.createElement('select');
    label.append('Swamp occlusion ',select);
    for(const option of ['Off','On','Optimized','Debug'])select.add(new Option(option));
    select.onchange=()=>{
      for(const cut of cutouts){
        cut.setVisible(select.value!=='Off');
        if(cut.getData('occlusionName')==='pillar')
          cut.setTexture(select.value==='Optimized'?'swamp-cut-pillar-optimized':'swamp-cut-pillar');
        if(select.value==='Debug')cut.setTint(0xf1bdee).setTintMode(Phaser.TintModes.FILL);
        else cut.clearTint();
      }
      outlines.setVisible(select.value==='Debug');
      select.blur();
    };
    const show=()=>document.getElementById('play-toolbar')?.append(label);
    const hide=()=>label.remove();
    show();
    this.events.on('sleep',hide);
    this.events.on('wake',show);
    this.events.once('shutdown',()=>{
      this.events.off('sleep',hide);
      this.events.off('wake',show);
      hide();
    });
  }

  createCollisionDebug(){
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    label.append(checkbox,' Collision debug');
    label.title = 'Green: rectangle · Gold: polygon · Blue: polyline · Pink: feet';
    const outlines = this.add.graphics().setDepth(this.physics.world.bounds.height + 3).setVisible(false);
    const feet = this.add.graphics().setDepth(outlines.depth + 1).setVisible(false);
    for (const obstacle of this.collisionLayer) {
      outlines.lineStyle(2,COLLISION_COLORS[obstacle.kind],0.9);
      if (obstacle.points) outlines.strokePoints(obstacle.points,obstacle.solid);
      else outlines.strokeCircle(obstacle.center.x,obstacle.center.y,obstacle.radius);
    }
    const drawFeet = () => {
      if (!checkbox.checked) return;
      const {x,y} = this.player.body.center;
      feet.clear().lineStyle(2,0xff84c6).strokeCircle(x,y,FOOT_RADIUS);
    };
    checkbox.onchange = () => {
      outlines.setVisible(checkbox.checked);
      feet.setVisible(checkbox.checked);
      drawFeet();
      checkbox.blur();
    };
    const show = () => document.getElementById('play-toolbar')?.append(label);
    const hide = () => label.remove();
    show();
    this.events.on('postupdate',drawFeet);
    this.events.on('sleep',hide);
    this.events.on('wake',show);
    this.events.once('shutdown',()=>{
      this.events.off('postupdate',drawFeet);
      this.events.off('sleep',hide);
      this.events.off('wake',show);
      hide();
    });
  }
}
