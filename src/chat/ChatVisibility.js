export const CHAT_PEEK_DURATION_MS=7000;
export const CHAT_PEEK_MESSAGE_COUNT=5;
export const CHAT_PIN_STORAGE_KEY='daa-chat-pinned';

export function loadChatPinned(storage=globalThis.localStorage){
  try{return storage?.getItem(CHAT_PIN_STORAGE_KEY)==='true';}catch{return false;}
}

export function saveChatPinned(pinned,storage=globalThis.localStorage){
  try{storage?.setItem(CHAT_PIN_STORAGE_KEY,String(Boolean(pinned)));}catch{/* Storage may be disabled. */}
  return Boolean(pinned);
}

export class ChatVisibility {
  constructor(onChange,{pinned=false,setTimer=(callback,delay)=>globalThis.setTimeout(callback,delay),clearTimer=id=>globalThis.clearTimeout(id),duration=CHAT_PEEK_DURATION_MS}={}){
    Object.assign(this,{onChange,pinned,setTimer,clearTimer,duration,state:pinned?'peek':'hidden',timer:null});
  }
  change(state){
    if(this.timer!==null){this.clearTimer(this.timer);this.timer=null;}
    this.state=state;this.onChange(state);
    if(state==='peek'&&!this.pinned)this.timer=this.setTimer(()=>{
      this.timer=null;this.change('hidden');
    },this.duration);
  }
  activity(){if(this.state!=='active')this.change('peek');}
  open(){this.change('active');}
  close(){this.change(this.pinned?'peek':'hidden');}
  pin(pinned){this.pinned=Boolean(pinned);this.change(this.pinned?(this.state==='active'?'active':'peek'):this.state);}
  destroy(){if(this.timer!==null)this.clearTimer(this.timer);this.timer=null;}
}
