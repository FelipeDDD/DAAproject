import {
  AVAILABLE_EMOTES,emoteDefinition,loadEmoteSlots,saveEmoteSlots,shortcutSlot,
} from './config.js';
import { FloatingHotbar } from '../ui/FloatingHotbar.js';
import { fixedHudEnabled,HUD_LAYOUT } from '../hud/config.js';
let activeEmoteBar=null;

export class EmoteBar {
  constructor(characterId,trigger,{layout=HUD_LAYOUT}={}) {
    // The DOM bar is shared by scenes. A late shutdown of the old scene must
    // not hide the bar that the new scene has already opened.
    activeEmoteBar?.close();activeEmoteBar=this;this.closed=false;
    Object.assign(this,{characterId,trigger,slots:loadEmoteSlots(characterId),editingSlot:0});
    this.root=document.getElementById('emote-bar');this.slotsRoot=document.getElementById('emote-slots');
    this.settingsButton=document.getElementById('emote-settings');this.picker=document.getElementById('emote-picker');
    this.dragHandle=document.getElementById('emote-drag-handle');this.resetPositionButton=document.getElementById('emote-reset-position');
    this.pickerTitle=document.getElementById('emote-picker-title');this.choices=document.getElementById('emote-choices');
    this.onClick=event=>{const button=event.target.closest('button[data-emote-slot]');if(button)this.activate(Number(button.dataset.emoteSlot));};
    this.onContext=event=>{const button=event.target.closest('button[data-emote-slot]');if(button){event.preventDefault();this.openPicker(Number(button.dataset.emoteSlot));}};
    this.onOutsidePointer=event=>{
      if(this.picker.hidden||this.root.contains(event.target))return;
      event.preventDefault();event.stopImmediatePropagation();this.closePicker();
    };
    this.onSettings=()=>this.picker.hidden?this.openPicker(this.editingSlot):this.closePicker();
    this.onChoice=event=>{const button=event.target.closest('button[data-emote-choice]');if(button)this.choose(button.dataset.emoteChoice);};
    this.onKey=event=>{
      if(document.querySelector('[data-block-game-shortcuts]:not([hidden])'))return;
      if(event.target.closest?.('[data-calculator-widget]'))return;
      const slot=shortcutSlot(event);if(slot>=0){event.preventDefault();this.activate(slot);}
    };
    this.slotsRoot.addEventListener('click',this.onClick);this.slotsRoot.addEventListener('contextmenu',this.onContext);
    this.settingsButton.addEventListener('click',this.onSettings);this.choices.addEventListener('click',this.onChoice);
    window.addEventListener('pointerdown',this.onOutsidePointer,true);
    window.addEventListener('keydown',this.onKey,true);
    this.root.hidden=false;this.render();
    this.floating=fixedHudEnabled(layout)?null:new FloatingHotbar({root:this.root,handle:this.dragHandle,resetButton:this.resetPositionButton,
      storageKey:'daa-emote-bar-position',kind:'emotes',getSnapTargets:()=>[
        document.querySelector('.inventory-hotbar'),document.getElementById('game'),document.querySelector('.boss-dev-tools'),
      ]});
  }
  activate(index){if(this.picker.hidden)this.trigger(this.slots[index]);else this.openPicker(index);}
  openPicker(index){this.editingSlot=index;this.picker.hidden=false;this.render();}
  closePicker(){this.picker.hidden=true;document.getElementById('game').focus({preventScroll:true});}
  choose(emote){
    if(!AVAILABLE_EMOTES.includes(emote))return;
    this.slots[this.editingSlot]=emote;this.slots=saveEmoteSlots(this.characterId,this.slots);this.closePicker();this.render();
  }
  render(){
    this.slotsRoot.replaceChildren(...this.slots.map((emote,index)=>{
      const button=document.createElement('button');button.type='button';button.dataset.emoteSlot=String(index);
      const name=emoteDefinition(emote)?.name??emote;button.dataset.tooltip=name;
      button.title=name;button.setAttribute('aria-label',`Shift + ${index+1}, emote: ${name}`);
      const icon=document.createElement('span');icon.setAttribute('aria-hidden','true');icon.textContent=emote;
      const shortcut=document.createElement('kbd');shortcut.textContent=String(index+1);
      button.append(icon,shortcut);
      if(index===0){
        const prefix=document.createElement('span');prefix.className='emote-shortcut-prefix';
        prefix.setAttribute('aria-hidden','true');prefix.textContent='Shift +';button.append(prefix);
      }
      return button;
    }));
    this.pickerTitle.textContent=`Choose emote for slot ${this.editingSlot+1}`;
    this.choices.replaceChildren(...AVAILABLE_EMOTES.map(emote=>{
      const button=document.createElement('button');button.type='button';button.dataset.emoteChoice=emote;
      const name=emoteDefinition(emote)?.name??emote;button.textContent=emote;button.dataset.tooltip=name;
      button.setAttribute('aria-label',`Use ${name} in slot ${this.editingSlot+1}`);return button;
    }));
  }
  close(){
    if(this.closed)return;this.closed=true;
    window.removeEventListener('keydown',this.onKey,true);this.slotsRoot.removeEventListener('click',this.onClick);
    this.slotsRoot.removeEventListener('contextmenu',this.onContext);this.settingsButton.removeEventListener('click',this.onSettings);
    this.choices.removeEventListener('click',this.onChoice);window.removeEventListener('pointerdown',this.onOutsidePointer,true);
    if(activeEmoteBar===this){this.root.hidden=true;this.picker.hidden=true;activeEmoteBar=null;}
    this.floating?.destroy();this.floating=null;
  }
}
