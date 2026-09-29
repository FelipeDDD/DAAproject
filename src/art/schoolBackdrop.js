const TEXTURE_KEY='school-void-surface';
const TEXTURE_SIZE=128;

function ensureSurfaceTexture(scene){
  if(scene.textures.exists(TEXTURE_KEY))return;
  const texture=scene.textures.createCanvas(TEXTURE_KEY,TEXTURE_SIZE,TEXTURE_SIZE);
  const context=texture.getContext();
  context.fillStyle='#252a2d';
  context.fillRect(0,0,TEXTURE_SIZE,TEXTURE_SIZE);
  // Small deterministic variations read as worn stone without a downloaded asset.
  for(let y=0;y<TEXTURE_SIZE;y+=4){
    for(let x=0;x<TEXTURE_SIZE;x+=4){
      let seed=Math.imul(x+1,374761393)^Math.imul(y+1,668265263);
      seed=Math.imul(seed^(seed>>>13),1274126177);
      const noise=(seed>>>0)%11-5;
      const shade=39+noise;
      context.fillStyle=`rgb(${shade},${shade+4},${shade+7})`;
      context.fillRect(x,y,4,4);
    }
  }
  context.strokeStyle='rgba(180,175,158,.035)';
  context.lineWidth=1;
  for(let line=0;line<TEXTURE_SIZE;line+=32){
    context.beginPath();context.moveTo(line+.5,0);context.lineTo(line+.5,TEXTURE_SIZE);
    context.moveTo(0,line+.5);context.lineTo(TEXTURE_SIZE,line+.5);context.stroke();
  }
  texture.refresh();
}

function drawFloorEdgeShadow(scene,source){
  const floor=source.layers.find(layer=>layer.name==='Floor'&&layer.type==='tilelayer');
  if(!floor?.data?.length)return;
  const {width,height,tilewidth,tileheight}=source;
  const filled=(x,y)=>x>=0&&x<width&&y>=0&&y<height&&Boolean(floor.data[y*width+x]);
  const shadow=scene.add.graphics().setDepth(-2.7);
  const bands=[{offset:0,alpha:.16},{offset:3,alpha:.07}];
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    if(!filled(x,y))continue;
    const left=x*tilewidth,top=y*tileheight;
    for(const {offset,alpha} of bands){
      shadow.fillStyle(0x000000,alpha);
      if(!filled(x-1,y))shadow.fillRect(left-offset-3,top,3,tileheight);
      if(!filled(x+1,y))shadow.fillRect(left+tilewidth+offset,top,3,tileheight);
      if(!filled(x,y-1))shadow.fillRect(left,top-offset-3,tilewidth,3);
      if(!filled(x,y+1))shadow.fillRect(left,top+tileheight+offset,tilewidth,3);
    }
  }
}

export function drawSchoolBackdrop(scene,source){
  ensureSurfaceTexture(scene);
  scene.cameras.main.setBackgroundColor('#252a2d');
  scene.add.tileSprite(0,0,source.width*source.tilewidth,source.height*source.tileheight,TEXTURE_KEY)
    .setOrigin(0).setDepth(-4);
  drawFloorEdgeShadow(scene,source);
}
