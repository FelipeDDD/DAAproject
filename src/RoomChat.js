import { appendChatMessageText } from './chat/renderMessageText.js';
import { CHAT_PEEK_MESSAGE_COUNT,ChatVisibility,loadChatPinned,saveChatPinned } from './chat/ChatVisibility.js';

function profileAuthOpen(){
  const panel=document.getElementById('profile-auth');
  return Boolean(panel&&!panel.hidden);
}

// DOM chat; scene lifecycle owns the subscription and keyboard handlers.
export class RoomChat {
  constructor(scene,presence) {
    Object.assign(this,{scene,presence,room:scene.mapKey});
    this.root=document.getElementById('room-chat');
    this.list=document.getElementById('chat-messages');
    this.input=document.getElementById('chat-input');
    this.status=document.getElementById('chat-status');
    this.pinButton=document.getElementById('chat-pin');
    this.rows=[];this.receivedInitialRows=false;
    this.root.hidden=false;this.list.replaceChildren();this.input.value='';
    this.status.textContent='Loading messages…';
    this.visibility=new ChatVisibility(state=>this.renderState(state),{pinned:loadChatPinned()});
    this.pinButton.addEventListener('click',this.onPin=()=>{
      const pinned=saveChatPinned(!this.visibility.pinned);
      this.visibility.pin(pinned);this.renderPin();
    });
    this.renderPin();this.renderState(this.visibility.state);
    this.focus=()=>{
      if(this.visibility.state!=='active')this.visibility.open();
      this.focused=true;scene.input.keyboard.resetKeys();scene.input.keyboard.enabled=false;
      scene.player.setVelocity(0,0);
    };
    this.blur=()=>{
      this.focused=false;
      if(this.visibility.state!=='active'){
        scene.input.keyboard.resetKeys();scene.input.keyboard.enabled=true;
      }
    };
    this.key=event=>{
      if(profileAuthOpen())return;
      if(this.scene.terminal?.active)return;
      if(this.scene.puzzleTerminal?.active)return;
      if(this.closed)return;
      if(this.visibility.state==='active'){
        // The panel stays in control even if the browser briefly moves focus away
        // from the input (for example when the pin button is clicked).
        event.stopImmediatePropagation();
        if(event.type!=='keydown')return;
        if(event.isComposing)return;
        if(event.key==='Enter'){event.preventDefault();if(!event.repeat)void this.send();}
        else if(event.key==='Escape'){
          event.preventDefault();this.finishInput('close');
        }else if(event.target!==this.input){
          event.preventDefault();this.input.focus({preventScroll:true});
        }
      }else if(event.type==='keydown'&&event.key==='Enter'&&!event.repeat&&
        !event.target.closest?.('button,input,textarea,select,[contenteditable],[data-calculator-widget]')){
        event.preventDefault();event.stopImmediatePropagation();this.openInput();
      }
    };
    this.keyUp=event=>{if(!profileAuthOpen()&&this.visibility.state==='active')event.stopImmediatePropagation();};
    this.input.addEventListener('focus',this.focus);this.input.addEventListener('blur',this.blur);
    window.addEventListener('keydown',this.key,true);window.addEventListener('keyup',this.keyUp,true);
    this.unsubscribe=presence.client.onUpdate(presence.api.messages.inRoom,{room:this.room},rows=>{
      if(this.closed)return;
      const nearBottom=this.list.scrollHeight-this.list.scrollTop-this.list.clientHeight<24;
      const lastId=rows.at(-1)?._id;
      const newMessage=this.receivedInitialRows&&lastId&&lastId!==this.lastMessageId;
      this.receivedInitialRows=true;this.lastMessageId=lastId;this.rows=rows;
      this.renderMessages();
      if(nearBottom)this.list.scrollTop=this.list.scrollHeight;
      if(!this.sendError)this.status.textContent=rows.length?'Enter: chat · Esc: return to game':'No messages in this room.';
      if(newMessage)this.visibility.activity();
    },()=>{if(!this.closed)this.status.textContent='Chat unavailable. Check your connection.';});
  }

  renderPin(){
    this.pinButton.setAttribute('aria-pressed',String(this.visibility.pinned));
    this.pinButton.setAttribute('aria-label',this.visibility.pinned?'Unpin chat':'Pin chat');
    this.pinButton.title=this.visibility.pinned?'Unpin chat':'Pin chat';
    this.root.classList.toggle('chat-pinned',this.visibility.pinned);
  }

  renderState(state){
    this.root.dataset.state=state;
    if(state==='hidden')this.root.setAttribute('aria-hidden','true');
    else this.root.removeAttribute('aria-hidden');
    this.input.tabIndex=state==='active'?0:-1;
    this.renderMessages();
  }

  renderMessages(){
    const rows=this.visibility?.state==='active'?this.rows:this.rows.slice(-CHAT_PEEK_MESSAGE_COUNT);
    this.list.replaceChildren(...rows.map(row=>{
      const line=document.createElement('li'),name=document.createElement('strong');
      name.textContent=`${row.characterName}: `;
      line.append(name);appendChatMessageText(line,row.text);return line;
    }));
  }

  get isInputActive(){return this.visibility.state==='active';}

  openInput(){
    this.visibility.open();
    this.list.scrollTop=this.list.scrollHeight;
    this.focus();
    this.input.focus({preventScroll:true});
    // A hidden-to-visible CSS transition may defer the browser's first focus.
    const afterLayout=globalThis.requestAnimationFrame??queueMicrotask;
    afterLayout(()=>{
      if(!this.closed&&this.isInputActive&&document.activeElement!==this.input)
        this.input.focus({preventScroll:true});
    });
  }

  finishInput(nextState){
    if(nextState==='peek')this.visibility.change('peek');
    else this.visibility.close();
    this.unfocus();this.blur();
    // Let the Enter/Esc event finish before returning focus to the game. Some
    // browsers move focus again when the chat input becomes display:none.
    const afterEvent=globalThis.requestAnimationFrame??queueMicrotask;
    afterEvent(()=>{
      if(this.closed||this.isInputActive||this.scene.terminal?.active||profileAuthOpen())return;
      const active=document.activeElement;
      if(active===document.body||active===this.input||active===this.pinButton||!active)
        document.getElementById('game')?.focus({preventScroll:true});
    });
  }

  unfocus(){this.input.blur();document.getElementById('game').focus({preventScroll:true});}

  async send(){
    const text=this.input.value.trim();
    if(!text){this.input.value='';this.finishInput('close');return;}
    if(text.length>200)return;
    this.sendError=false;
    const {characterId,sessionId}=this.presence.identity;
    this.input.value='';this.finishInput('peek');
    try{
      await this.presence.client.mutation(this.presence.api.messages.send,{room:this.room,characterId,sessionId,text});
    }catch(error){
      if(!this.closed){
        this.sendError=true;
        this.status.textContent='Message not sent. Check connection or room, then press Enter to retry.';
        console.warn('Room chat send failed:',error);
        if(!this.input.value&&!this.isInputActive){this.input.value=text;this.openInput();}
      }
    }
  }

  close(){
    this.closed=true;this.unsubscribe?.();
    this.visibility.change('hidden');this.visibility.destroy();this.pinButton.removeEventListener('click',this.onPin);
    this.input.removeEventListener('focus',this.focus);this.input.removeEventListener('blur',this.blur);
    window.removeEventListener('keydown',this.key,true);window.removeEventListener('keyup',this.keyUp,true);
    this.input.blur();this.blur();this.list.replaceChildren();this.input.value='';this.root.hidden=true;
    this.root.dataset.state='hidden';this.root.classList.remove('chat-pinned');
  }
}
