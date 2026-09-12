// Replaceable placeholder sprites. All keep the existing 32x56 feet alignment.
import fs from 'node:fs';
const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
fs.mkdirSync('public/assets/characters',{recursive:true});
for(const id of ['michael','jassine','sarina','felipe']){
  const skin=id==='michael'?'#efd2b8':'#d8b18c',shirt={michael:'#202126',jassine:'#a4d4ec',sarina:'#9657b0',felipe:'#16191d'}[id];
  const slim=id==='michael';let s='';
  if(id==='felipe')s+=rect(5,4,23,31,'#121419');
  s+=rect(9,38,6,14,id==='felipe'?'#25272b':'#3b5c83')+rect(18,38,6,14,id==='felipe'?'#25272b':'#3b5c83');
  s+=rect(8,51,8,4,'#22282e')+rect(18,51,8,4,'#22282e');
  s+=rect(slim?9:6,slim?21:24,slim?15:21,18,shirt)+rect(slim?5:3,27,4,13,skin)+rect(slim?24:27,27,4,13,skin);
  s+=rect(8,slim?2:8,18,slim?20:17,skin);
  if(id==='jassine')s+=rect(9,6,16,3,'#60564c')+rect(8,9,2,4,'#827361')+rect(25,9,1,4,'#827361');
  if(id==='sarina')for(const [x,y]of [[5,4],[11,2],[18,2],[24,5],[3,10],[24,12],[4,17],[24,19]])s+=rect(x,y,7,7,'#613d2e')+rect(x+1,y+1,3,2,'#845638');
  if(id==='felipe')s+=rect(6,3,21,8,'#17191e')+rect(6,8,4,25,'#17191e')+rect(24,8,4,25,'#17191e')+rect(10,28,13,2,'#e3e6e7')+rect(12,31,2,5,'#e3e6e7')+rect(18,31,2,5,'#e3e6e7');
  s+=rect(12,15,2,3,'#30313a')+rect(22,15,2,3,'#30313a');
  if(id==='michael')s+=rect(24,20,6,2,'#f2efdf')+rect(29,20,2,2,'#d57947');
  if(id==='sarina')s+=rect(26,35,6,5,'#eee1ba')+rect(26,34,6,2,'#684233')+rect(25,40,7,2,'#e7edf0');
  if(id==='felipe')s+=rect(26,33,5,9,'#202528')+rect(27,32,3,1,'#a8b2b6')+rect(27,35,1,4,'#8aca49')+rect(29,35,1,4,'#8aca49');
  fs.writeFileSync(`public/assets/characters/${id}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="56" shape-rendering="crispEdges">${s}</svg>\n`);
}
