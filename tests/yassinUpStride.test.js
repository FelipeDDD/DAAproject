import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeYassinUpStride} from '../src/art/yassinUpStride.js';
import {YASSIN_BALD_TEST_VISUAL as visual} from '../src/experimental/yassinBaldSkin.js';
import {readRgbaPng} from './helpers/readRgbaPng.js';

test('Yassin back-facing stride alternates legs without changing other directions, torso or source',()=>{
  assert.equal(visual.normalizeUpStride,true);
  const {data}=readRgbaPng(new URL('../public/'+visual.asset,import.meta.url));
  const original=Buffer.from(data),result=normalizeYassinUpStride(data);
  assert.deepEqual(Buffer.from(data),original);
  for(let row=0;row<4;row++)for(let col=0;col<6;col++)for(let y=0;y<144;y++)for(let x=0;x<128;x++){
    const i=((row*144+y)*768+col*128+x)*4;
    const mirrored=row===3&&(col===3||col===4)&&y>=102;
    const source=mirrored?((row*144+y)*768+(col-2)*128+127-x)*4:i;
    for(let c=0;c<4;c++)assert.equal(result[i+c],data[source+c]);
  }
  assert.notDeepEqual(Buffer.from(result),original);
  // The same operation can register material labels without changing alpha alignment.
  const labels=readRgbaPng(new URL('../public/'+visual.recolorMaskAsset,import.meta.url));
  const mask=normalizeYassinUpStride(labels.data);
  for(let i=3;i<mask.length;i+=4)if(mask[i])assert.ok(result[i]);
});
