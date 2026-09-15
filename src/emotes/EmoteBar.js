import {
  AVAILABLE_EMOTES,loadEmoteSlots,saveEmoteSlots,shortcutSlot,
} from './config.js';

export class EmoteBar {
  constructor(characterId,trigger) {
    Object.assign(this,{characterId,trigger,slots:loadEmoteSlots(characterId),editingSlot:0});
    this.root=document.getElementById('emote-bar');this.slotsRoot=document.getElementById('emote-slots');
    this.settingsButton=document.getElementById('emote-settings');this.picker=document.getElementById('emote-picker');
    this.pickerTitle=document.getElementById('emote-picker-title');this.choices=document.getElementById('emote-choices');
    this.onClick=event=>{const button=event.target.closest('button[data-emote-slot]');if(button)this.activate(Number(button.dataset.emoteSlot));};
    this.onContext=event=>{const button=event.target.closest('button[data-emote-slot]');if(button){event.preventDefault();this.openPicker(Number(button.dataset.emoteSlot));}};
    this.onSettings=()=>this.picker.hidden?this.openPicker(this.editingSlot):this.closePicker();
    this.onChoice=event=>{const button=event.target.closest('button[data-emote-choice]');if(button)this.choose(button.dataset.emoteChoice);};
    this.onKey=event=>{
      if(event.target.closest?.('[data-calculator-widget]'))return;
      const slot=shortcutSlot(event);if(slot>=0){event.preventDefault();this.activate(slot);}
    };
    this.slotsRoot.addEventListener('click',this.onClick);this.slotsRoot.addEventListener('contextmenu',this.onContext);
    this.settingsButton.addEventListener('click',this.onSettings);this.choices.addEventListener('click',this.onChoice);
    window.addEventListener('keydown',this.onKey,true);this.root.hidden=false;this.render();
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
      button.title=`Emote ${index+1}: ${emote}`;button.setAttribute('aria-label',button.title);
      button.innerHTML=`<span aria-hidden="true">${emote}</span><kbd>${index+1}</kbd>`;return button;
    }));
    this.pickerTitle.textContent=`Choose emote for slot ${this.editingSlot+1}`;
    this.choices.replaceChildren(...AVAILABLE_EMOTES.map(emote=>{
      const button=document.createElement('button');button.type='button';button.dataset.emoteChoice=emote;
      button.textContent=emote;button.setAttribute('aria-label',`Use ${emote} in slot ${this.editingSlot+1}`);return button;
    }));
  }
  close(){
    window.removeEventListener('keydown',this.onKey,true);this.slotsRoot.removeEventListener('click',this.onClick);
    this.slotsRoot.removeEventListener('contextmenu',this.onContext);this.settingsButton.removeEventListener('click',this.onSettings);
    this.choices.removeEventListener('click',this.onChoice);this.root.hidden=true;this.picker.hidden=true;
  }
}
