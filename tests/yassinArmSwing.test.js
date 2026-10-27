import test from 'node:test';
import assert from 'node:assert/strict';
import {readRgbaPng} from './helpers/readRgbaPng.js';
import {normalizeYassinUpStride} from '../src/art/yassinUpStride.js';
import {decodeFelipeMaterialMask} from '../src/art/felipeRecolor.js';
import {recolorCharacterPixels} from '../src/art/characterRecolor.js';

function handBottom(data,row,col,side){
  let bottom=-1;
  for(let y=75;y<=111;y++)for(let x=23;x<=43;x++){
    const px=side===0?x:127-x,i=((row*144+y)*768+col*128+px)*4;
    if(data[i+3]&&data[i]-data[i+1]>18&&data[i]>data[i+2]*1.25)bottom=y;
  }
  assert.ok(bottom>=0,'hand pixels remain present');
  return bottom;
}
for(const name of ['yassin-stubble-test-v3','yassin-felipe-walk-v1']){
  test(`${name}: both hands move subtly in opposition in the final registered texture`,()=>{
    let {data}=readRgbaPng(new URL(`../public/assets/characters/experimental/${name}.png`,import.meta.url));
    if(name==='yassin-felipe-walk-v1'){
      const labels=readRgbaPng(new URL(`../public/assets/characters/experimental/${name}-material-mask.png`,import.meta.url));
      const mask=decodeFelipeMaterialMask(labels.data,768,576);
      data=normalizeYassinUpStride(recolorCharacterPixels(data,mask,{shirt:'#ff00dd',trousers:'#235584',shoes:'#37393d'}));
    }
    for(const row of [0,3]){
      const left=[1,2,3,4,5].map(c=>handBottom(data,row,c,0));
      const right=[1,2,3,4,5].map(c=>handBottom(data,row,c,1));
      assert.equal(Math.max(...left)-Math.min(...left),2,'left hand moves two pixels');
      assert.equal(Math.max(...right)-Math.min(...right),2,'right hand moves two pixels');
      assert.equal(left[0]-left[1],-(right[0]-right[1]),'hands move in opposite phases');
      assert.equal(left[2]-left[3],-(right[2]-right[3]),'opposition survives back-leg correction');
      assert.equal(left[4],right[4],'neutral recovery uses equal heights');
    }
  });
}
