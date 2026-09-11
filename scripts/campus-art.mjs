// Local asset geometry only. World placement belongs to the TMJ files.
// Run with Node to regenerate the replaceable SVG atlas; no extra dependencies.
import fs from 'node:fs';
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const poly = (points,c) => `<polygon points="${points}" fill="${c}"/>`;
const assets=[];
function asset(name,w,h,svg) { assets.push({name,w,h,svg}); }
const white='#f6f7ed', dark='#34424a', blue='#96c3ce', wood='#ac794e';
let s='';
s+=rect(0,0,32,32,'#a9725b');
for(let y=0;y<32;y+=8){s+=rect(0,y,32,1,'#c49a80');for(let x=(y%16?8:0);x<32;x+=16)s+=rect(x,y,1,8,'#c49a80');}
asset('brick',32,32,s);
asset('window',40,56,rect(0,0,40,56,'#765349')+rect(3,2,34,49,white)+rect(6,5,28,42,'#607b83')+rect(8,7,24,16,blue)+rect(8,28,24,17,'#7eabb8')+rect(19,5,3,43,white)+rect(5,24,30,3,white)+rect(0,51,40,5,'#ddd8c5'));
asset('bench',96,32,rect(5,5,86,26,'#4b5050')+rect(0,0,96,23,'#785c45')+[0,7,14].map(y=>rect(2,y,92,5,'#ba925c')).join('')+rect(8,25,7,7,dark)+rect(81,25,7,7,dark));
asset('office-chair',28,32,rect(3,26,23,3,dark)+rect(13,18,3,12,dark)+rect(5,6,20,18,'#202b33')+rect(8,8,15,12,'#445663')+rect(2,0,6,23,'#28343e')+rect(1,3,3,16,'#62717b'));
asset('luxury-chair',32,36,rect(5,30,24,4,dark)+rect(15,20,3,13,dark)+rect(5,7,22,19,'#662e37')+rect(9,9,17,13,'#9a4a53')+rect(2,0,7,27,'#302b30'));
// Right-facing keyboard: spacebar on the seating side. Mirror for left-facing desks.
asset('keyboard',12,28,rect(0,0,12,28,'#788891')+rect(1,1,10,26,'#d0d9d9')+[2,5].map(x=>[3,8,13,18,23].map(y=>rect(x,y,2,3,'#627782')).join('')).join('')+rect(9,7,2,14,'#627782'));
s=rect(0,0,64,96,'#9ba7aa')+rect(2,2,60,90,white)+rect(4,92,56,4,'#bec8c8');
s+=rect(27,8,26,29,dark)+rect(30,11,20,23,blue)+rect(35,38,10,5,'#71828b')+rect(9,11,11,33,'#687b86')+rect(11,15,2,2,'#7fdca2')+rect(25,49,31,10,'#8b9ba0');
s+=rect(8,66,25,20,'#729bb6')+rect(10,67,20,17,'#f4edd8')+rect(39,69,3,15,'#354f69');
asset('office-table',64,96,s);
s=rect(0,0,64,96,'#7d5f43')+rect(2,2,60,92,'#cba56a')+rect(7,5,27,32,'#293a41')+rect(10,8,21,12,'#556c77')+rect(14,23,11,10,white)+rect(40,10,15,15,'#e0e4db');
for(let y=44;y<=64;y+=20)for(let x=9;x<=43;x+=17)s+=rect(x,y,11,10,white)+rect(x+2,y+1,6,3,'#765544');
s+=rect(9,82,18,8,'#d49d42')+rect(35,81,20,9,'#916442');
asset('coffee-table',64,96,s);
s=rect(0,0,48,128,'#705334')+rect(2,2,30,124,'#ccb071')+rect(33,3,13,122,'#9e7b3d')+rect(34,62,11,3,'#624c2d')+rect(42,48,2,10,dark)+rect(42,71,2,10,dark)+rect(2,2,44,5,'#e0c58c');
asset('cabinet',48,128,s);
asset('sink',32,34,rect(0,0,32,34,'#c4cece')+rect(2,3,28,27,white)+rect(7,9,20,17,'#889eaa')+rect(10,11,15,12,'#b6d1d6')+rect(3,6,5,5,'#6f7f87')+rect(5,8,9,3,'#dce3e2'));
asset('dryer',18,22,rect(1,1,16,20,'#a9b8bf')+rect(2,1,14,16,white)+rect(4,14,10,4,dark)+rect(4,4,9,2,'#d0dddd'));
asset('toilet',40,40,rect(4,0,32,12,'#d4ddda')+rect(6,2,28,8,white)+rect(10,10,22,27,'#c5d1d0')+rect(13,11,16,23,white)+rect(15,15,12,14,'#8bafb8')+rect(18,17,6,10,'#bed8db'));
asset('partition',64,8,rect(0,0,64,8,'#7d979f')+rect(2,1,60,6,'#e6eeee')+rect(56,2,3,4,dark));
asset('stairs',128,64,[0,16,32,48].map(y=>rect(0,y,128,16,'#d5d6cc')+rect(0,y,128,3,'#eef0e3')+rect(0,y+13,128,3,'#898f8c')).join(''));
asset('planter',128,96,poly('16,0 112,0 112,8 128,8 128,80 112,80 112,96 16,96 16,88 0,88 0,16 16,16','#646b60')+poly('18,4 108,4 108,12 124,12 124,76 108,76 108,88 20,88 20,80 4,80 4,20 18,20','#a9aa8e')+poly('24,10 104,10 104,20 116,20 116,70 102,70 102,80 24,80 24,72 12,72 12,26 24,26','#695b45')+[12,27,42,57,72,87,102].map(x=>rect(x,83,10,4,'#555f53')).join(''));
asset('shrub',56,40,poly('8,4 20,4 20,0 42,0 42,8 52,8 52,16 56,16 56,28 48,28 48,36 12,36 12,32 0,32 0,16 8,16','#365840')+rect(12,9,31,18,'#527b49')+rect(20,3,16,16,'#729456')+rect(7,18,17,11,'#658749')+rect(40,14,9,10,'#82a25d'));
s=rect(40,74,12,49,'#6c5540')+rect(44,75,4,47,'#96774f');
s+=poly('24,4 66,4 66,12 80,12 80,24 92,24 92,66 82,66 82,82 60,82 60,90 26,90 26,82 10,82 10,66 0,66 0,28 14,28 14,12 24,12','#355e43');
s+=poly('26,8 64,8 64,19 77,19 77,34 86,34 86,57 69,57 69,74 43,74 43,80 18,80 18,61 8,61 8,33 26,33','#64824c')+rect(31,15,23,18,'#8b9d5b')+rect(17,34,18,12,'#9eaa60')+rect(57,36,21,15,'#7d9754');
asset('tree',96,128,s);
asset('gazebo',192,128,rect(8,36,7,90,'#ece7d3')+rect(176,36,7,90,'#ece7d3')+rect(12,42,168,6,'#9a9e8e')+poly('0,40 32,20 96,0 164,20 192,40 192,48 0,48','#4c5d59')+poly('4,38 96,4 184,38','#697872')+poly('96,4 126,38 184,38','#596a65')+rect(0,42,192,5,'#c7cdba'));
asset('canopy',144,22,rect(0,0,144,16,'#eeeade')+rect(0,16,144,6,'#83908a')+rect(3,0,138,3,'#fffbed'));
asset('sign',96,24,rect(0,0,96,24,'#dedbca')+'<text x="48" y="20" font-family="sans-serif" font-size="23" font-weight="bold" text-anchor="middle" fill="#315b9c">DAA</text>');
asset('street',32,32,rect(0,0,32,32,'#676d6d')+rect(4,7,2,2,'#737b79')+rect(23,21,2,2,'#555e5d'));
asset('trim',32,32,rect(0,0,32,32,'#b5866a')+rect(0,3,32,3,'#d4b191')+rect(0,24,32,5,'#825e4e'));
asset('entry',96,32,rect(0,0,96,32,'#424e4d')+rect(0,0,4,32,'#e1dfce')+rect(92,0,4,32,'#e1dfce')+rect(6,2,25,27,'#79958f')+rect(65,2,25,27,'#79958f')+rect(34,2,28,30,'#2b3939'));
asset('side-wall',32,32,rect(0,0,32,32,'#ead4b4')+rect(0,0,4,32,'#fff0d7')+rect(27,0,5,32,'#b69b77'));
const cols=8, cell=128, rows=Math.ceil(assets.length/cols);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${cols*cell}" height="${rows*cell}" shape-rendering="crispEdges">`+assets.map((a,i)=>`<g transform="translate(${i%cols*cell} ${Math.floor(i/cols)*cell}) scale(${cell/a.w} ${cell/a.h})">${a.svg}</g>`).join('')+'</svg>';
fs.mkdirSync('public/assets/campus',{recursive:true});
fs.writeFileSync('public/assets/campus/prototype.svg',svg);
fs.writeFileSync('public/assets/campus/catalog.json',JSON.stringify(Object.fromEntries(assets.map((a,i)=>[a.name,{frame:i,width:a.w,height:a.h}])),null,2)+'\n');
fs.writeFileSync('public/assets/campus/prototype.tsx',`<?xml version="1.0" encoding="UTF-8"?>\n<tileset version="1.10" tiledversion="1.12.2" name="campus-prototype" tilewidth="128" tileheight="128" tilecount="${assets.length}" columns="8"><image source="prototype.svg" width="1024" height="${rows*128}"/></tileset>\n`);
console.log(`Created ${assets.length} replaceable assets.`);
const materials=['brick','street','trim'].map(name=>assets.find(a=>a.name===name));
fs.writeFileSync('public/assets/campus/materials.svg','<svg xmlns="http://www.w3.org/2000/svg" width="96" height="32" shape-rendering="crispEdges">'+materials.map((a,i)=>`<g transform="translate(${i*32} 0)">${a.svg}</g>`).join('')+'</svg>');
fs.writeFileSync('public/assets/campus/materials.tsx','<?xml version="1.0" encoding="UTF-8"?>\n<tileset version="1.10" tiledversion="1.12.2" name="campus-materials" tilewidth="32" tileheight="32" tilecount="3" columns="3"><image source="materials.svg" width="96" height="32"/></tileset>\n');
