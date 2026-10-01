import {readFileSync,writeFileSync} from 'node:fs';
// Code-native variants of the existing pack silhouette, preserving its proportions.
const source=readFileSync(new URL('../public/assets/items/lung-crusher-pack-icon.svg',import.meta.url),'utf8');
for(const [color,accent,body,muted] of [
  ['red','#ee6b65','#451b20','#9a3c40'],
  ['green','#9bd267','#1b3827','#507b35'],
  ['blue','#69b6ee','#1b2b48','#386791'],
]){
  const svg=source.replaceAll('#15120e',body).replaceAll('#e6ad48',accent)
    .replaceAll('#bc812d',accent).replaceAll('#f4d37e',accent).replaceAll('#e2b766',accent)
    .replaceAll('#9a6228',muted).replaceAll('#b77d33',muted);
  writeFileSync(new URL(`../public/assets/items/lung-crusher-${color}-ground.svg`,import.meta.url),svg);
}
