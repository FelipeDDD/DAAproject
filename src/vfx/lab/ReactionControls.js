import { updateCharacterVisual } from '../../characterVisuals.js';
import { REACTIONS } from './targetReactions.js';

export function mountReactionControls(scene,actors,c,signal){
  const targets=actors.map(({sprite,visual,label})=>({sprite,visual,label,x:sprite.x,y:sprite.y,phase:0,moving:false}));
  c.dummy.replaceChildren(...targets.map((t,i)=>new Option(t.label,String(i))));
  c.status.replaceChildren(...Object.keys(REACTIONS).map(name=>new Option(name,name)));
  const selected=()=>targets[c.dummy.selectedIndex];
  const sync=()=>{
    scene.selectedDummy=selected().sprite;
    c.motion.checked=selected().moving;
  };
  c.dummy.addEventListener('change',sync,{signal});
  c.motion.addEventListener('change',()=>{
    selected().moving=c.motion.checked;
    if(!c.motion.checked)updateCharacterVisual(selected().sprite,selected().visual,'down',false);
  },{signal});
  c.apply.addEventListener('click',()=>scene.reactions.apply(selected().sprite,c.status.value,Number(c.duration.value)),{signal});
  c.hit.addEventListener('click',()=>scene.previewHit(selected().sprite),{signal});
  sync();
  return {
    update(dt){
      for(const t of targets){
        if(!t.moving)continue;
        t.phase+=dt/950;
        t.sprite.setPosition(t.x+42*Math.sin(t.phase),t.y).setDepth(t.y);
        updateCharacterVisual(t.sprite,t.visual,Math.cos(t.phase)>=0?'right':'left',true);
      }
    },
    reset(){
      for(const t of targets){
        t.phase=0;t.moving=false;
        t.sprite.setPosition(t.x,t.y).setDepth(t.y);
        updateCharacterVisual(t.sprite,t.visual,'down',false);
      }
      sync();
    },
  };
}
