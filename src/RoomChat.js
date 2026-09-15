import { appendChatMessageText } from './chat/renderMessageText.js';

// DOM chat; scene lifecycle owns the subscription and keyboard handlers.
export class RoomChat {
  constructor(scene,presence) {
    Object.assign(this,{scene,presence,room:scene.mapKey});
    this.root=document.getElementById('room-chat');
    this.list=document.getElementById('chat-messages');
    this.input=document.getElementById('chat-input');
    this.status=document.getElementById('chat-status');
    this.root.hidden=false;this.list.replaceChildren();this.input.value='';
    this.status.textContent='Loading messages…';
    this.focus=()=>{
      this.focused=true;scene.input.keyboard.resetKeys();scene.input.keyboard.enabled=false;
      scene.player.setVelocity(0,0);
    };
    this.blur=()=>{this.focused=false;scene.input.keyboard.resetKeys();scene.input.keyboard.enabled=true;};
    this.key=event=>{
      if(this.closed)return;
      if(this.focused){
        // Capture before Phaser's global keyboard handler, including arrows and E/F.
        event.stopImmediatePropagation();
        if(event.isComposing)return;
        if(event.key==='Enter'){event.preventDefault();if(!event.repeat)this.send();}
        else if(event.key==='Escape'){
          event.preventDefault();this.unfocus();
          if(this.scene.quiz?.seated)this.scene.quiz.leave();
        }
      }else if(event.type==='keydown'&&event.key==='Enter'&&!event.repeat&&
        !event.target.closest?.('button,input,textarea,select,[contenteditable],[data-calculator-widget]')){
        event.preventDefault();event.stopImmediatePropagation();this.input.focus();
      }
    };
    this.keyUp=event=>{if(this.focused)event.stopImmediatePropagation();};
    this.input.addEventListener('focus',this.focus);this.input.addEventListener('blur',this.blur);
    window.addEventListener('keydown',this.key,true);window.addEventListener('keyup',this.keyUp,true);
    this.unsubscribe=presence.client.onUpdate(presence.api.messages.inRoom,{room:this.room},rows=>{
      if(this.closed)return;
      const nearBottom=this.list.scrollHeight-this.list.scrollTop-this.list.clientHeight<24;
      this.list.replaceChildren(...rows.map(row=>{
        const line=document.createElement('li'),name=document.createElement('strong');
        name.textContent=`${row.characterName}: `;
        line.append(name);appendChatMessageText(line,row.text);return line;
      }));
      if(nearBottom)this.list.scrollTop=this.list.scrollHeight;
      this.status.textContent=rows.length?'Enter: chat · Esc: return to game':'No messages in this room.';
    },()=>{if(!this.closed)this.status.textContent='Chat unavailable. Check your connection.';});
  }

  unfocus(){this.input.blur();document.getElementById('game').focus({preventScroll:true});}

  async send(){
    const text=this.input.value.trim();
    if(!text){this.input.value='';this.unfocus();return;}
    if(text.length>200||this.pending)return;
    this.pending=true;
    const {characterId,sessionId}=this.presence.identity;
    this.input.value='';this.unfocus();
    try{
      await this.presence.client.mutation(this.presence.api.messages.send,{room:this.room,characterId,sessionId,text});
    }catch{
      if(!this.closed){if(!this.input.value)this.input.value=text;this.status.textContent='Message not sent. Press Enter to try again.';}
    }finally{this.pending=false;}
  }

  close(){
    this.closed=true;this.unsubscribe?.();
    this.input.removeEventListener('focus',this.focus);this.input.removeEventListener('blur',this.blur);
    window.removeEventListener('keydown',this.key,true);window.removeEventListener('keyup',this.keyUp,true);
    this.input.blur();this.blur();this.list.replaceChildren();this.input.value='';this.root.hidden=true;
  }
}
