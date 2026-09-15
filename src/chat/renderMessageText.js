const CHAT_URL_PATTERN=/\b(?:https?:\/\/|www\.)[^\s]+/gi;

export function splitChatMessageText(text) {
  const value=String(text);const parts=[];let offset=0;
  for(const match of value.matchAll(CHAT_URL_PATTERN)){
    const index=match.index??0;
    if(index>offset)parts.push({type:'text',value:value.slice(offset,index)});
    parts.push({type:'link',value:match[0]});offset=index+match[0].length;
  }
  if(offset<value.length||parts.length===0)parts.push({type:'text',value:value.slice(offset)});
  return parts;
}

export function appendChatMessageText(parent,text,documentRef=document) {
  for(const part of splitChatMessageText(text)){
    if(part.type==='text'){
      parent.append(documentRef.createTextNode(part.value));continue;
    }
    const link=documentRef.createElement('a');
    link.href=/^www\./i.test(part.value)?`https://${part.value}`:part.value;
    link.textContent=part.value;
    link.target='_blank';link.rel='noopener noreferrer';parent.append(link);
  }
}
