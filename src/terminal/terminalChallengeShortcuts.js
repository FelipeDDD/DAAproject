export function terminalChallengeShortcut({
  key='',code='',repeat=false,modified=false,blocked=false,selectedAnswer=null,
  confirmBeforeSubmit=true,resolving=false,saving=false,
}={}){
  if(repeat||modified||blocked||resolving||saving)return null;
  if(key.toLowerCase()==='s')return 'skip';
  const space=key===' '||code==='Space';
  if(space&&confirmBeforeSubmit&&Number.isInteger(selectedAnswer))return 'confirm';
  return null;
}
