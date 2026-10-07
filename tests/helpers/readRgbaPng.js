import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';

// Read the actual RGBA PNG so protection tests cover the shipped 24-frame asset.
export function readRgbaPng(path){
  const png=readFileSync(path),width=png.readUInt32BE(16),height=png.readUInt32BE(20),chunks=[];
  assert.equal(png[24],8);assert.equal(png[25],6);assert.equal(png[28],0);
  for(let p=8;p<png.length;){
    const length=png.readUInt32BE(p),type=png.toString('ascii',p+4,p+8);
    if(type==='IDAT')chunks.push(png.subarray(p+8,p+8+length));
    p+=length+12;
  }
  const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,data=new Uint8Array(stride*height);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<height;y++){
    const filter=raw[y*(stride+1)];assert.ok(filter<=4);
    for(let x=0;x<stride;x++){
      const i=y*stride+x,left=x>=4?data[i-4]:0,up=y?data[i-stride]:0,corner=x>=4&&y?data[i-stride-4]:0;
      const prediction=[0,left,up,Math.floor((left+up)/2),paeth(left,up,corner)][filter];
      data[i]=(raw[y*(stride+1)+1+x]+prediction)&255;
    }
  }
  return {width,height,data};
}
