import { characterById } from '../characters.js';
import { YASSIN_PROPORTION_TEST_VISUAL } from './yassinProportionTestSkin.js';

// Each page has its own module graph. Override only this test page's catalog
// before main initializes the menu and Phaser texture loader.
characterById('jassine').experimentalVisual=YASSIN_PROPORTION_TEST_VISUAL;

const comparison=document.createElement('aside');
comparison.className='yassin-proportions-comparison';
comparison.setAttribute('aria-label','Skin proportions comparison');
Object.assign(comparison.style,{position:'fixed',right:'8px',bottom:'8px',zIndex:'1500',
  display:'flex',gap:'8px',padding:'8px',background:'#152033ee',color:'#fff',
  border:'1px solid #ad9256',borderRadius:'6px',pointerEvents:'none',fontSize:'12px'});
for(const [label,asset] of [
  ['Michael','michael-level3-hd-idle.png'],
  ['Yassin V4','yassin-proportions-v4-idle.png'],
  ['Yassin V5','yassin-compact-head-v5-idle.png'],
]){
  const item=document.createElement('div');item.style.textAlign='center';
  const image=document.createElement('img');image.alt=label;
  image.src=`${import.meta.env.BASE_URL}assets/characters/experimental/${asset}`;
  // All three use the same 128x144 cells, displayed at the same comparison scale.
  Object.assign(image.style,{display:'block',width:'96px',height:'108px',imageRendering:'pixelated'});
  const caption=document.createElement('div');caption.textContent=label;
  item.append(image,caption);comparison.append(item);
}
document.body.append(comparison);
await import('../main.js');
