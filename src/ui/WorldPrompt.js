export function worldToViewport(scene,x,y){
  const camera=scene.cameras.main,matrix=camera.getViewMatrix(),point=matrix.transformPoint(x,y);
  const rect=scene.game.canvas.getBoundingClientRect(),gameSize=scene.scale.gameSize;
  return {x:rect.left+point.x*rect.width/gameSize.width,y:rect.top+point.y*rect.height/gameSize.height,canvas:rect};
}

export class WorldPrompt {
  constructor(scene,text,{className='',clamp=false}={}){
    this.scene=scene;this.requestedVisible=false;this.clampToCanvas=clamp;this.position={x:0,y:0};
    this.root=document.createElement('div');this.root.className=`world-prompt ${className}`.trim();
    this.root.textContent=text;this.root.hidden=true;this.root.setAttribute('role','status');document.body.append(this.root);
  }
  get visible(){return this.requestedVisible&&!this.root.hidden;}
  setText(text){this.root.textContent=text;return this;}
  setVisible(visible){this.requestedVisible=Boolean(visible);this.update();return this;}
  setPosition(x,y){this.position={x,y};this.update();return this;}
  update(){
    if(!this.requestedVisible||!this.scene?.game?.canvas){this.root.hidden=true;return this;}
    const screen=worldToViewport(this.scene,this.position.x,this.position.y),margin=10;
    const inside=screen.x>=screen.canvas.left&&screen.x<=screen.canvas.right
      &&screen.y>=screen.canvas.top&&screen.y<=screen.canvas.bottom;
    if(!inside&&!this.clampToCanvas){this.root.hidden=true;return this;}
    const width=this.root.offsetWidth||160,height=this.root.offsetHeight||32;
    const x=this.clampToCanvas?Math.min(screen.canvas.right-width/2-margin,Math.max(screen.canvas.left+width/2+margin,screen.x)):screen.x;
    const y=this.clampToCanvas?Math.min(screen.canvas.bottom-margin,Math.max(screen.canvas.top+height+margin,screen.y)):screen.y;
    this.root.hidden=false;this.root.style.left=`${Math.round(x)}px`;this.root.style.top=`${Math.round(y)}px`;
    this.root.classList.toggle('clamped',!inside);return this;
  }
  destroy(){this.root.remove();this.scene=null;}
}
