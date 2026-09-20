export function shouldShowArenaCrosshair({arenaActive=true,pointerInside=false,interfaceBlocked=false}={}){
  return Boolean(arenaActive&&pointerInside&&!interfaceBlocked);
}

export class ArenaCrosshair {
  constructor(scene){
    this.scene=scene;this.canvas=scene.game.canvas;this.active=true;this.pointerInside=false;this.blocked=false;
    this.root=document.createElement('div');this.root.className='arena-crosshair';this.root.hidden=true;
    this.root.setAttribute('aria-hidden','true');document.body.append(this.root);
    this.onMove=event=>{const rect=this.canvas.getBoundingClientRect();this.pointerInside=event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom;this.root.style.left=`${event.clientX}px`;this.root.style.top=`${event.clientY}px`;this.render();};
    this.onLeave=()=>{this.pointerInside=false;this.render();};
    this.canvas.addEventListener('pointermove',this.onMove);this.canvas.addEventListener('pointerleave',this.onLeave);this.render();
  }
  setBlocked(blocked){this.blocked=Boolean(blocked);this.render();}
  suspend(){this.active=false;this.render();}
  resume(){this.active=true;this.render();}
  render(){
    const visible=shouldShowArenaCrosshair({arenaActive:this.active,pointerInside:this.pointerInside,interfaceBlocked:this.blocked});
    this.root.hidden=!visible;this.canvas.classList.toggle('arena-crosshair-active',this.active&&!this.blocked);
  }
  destroy(){
    this.canvas.removeEventListener('pointermove',this.onMove);this.canvas.removeEventListener('pointerleave',this.onLeave);
    this.canvas.classList.remove('arena-crosshair-active');this.root.remove();this.scene=null;
  }
}
