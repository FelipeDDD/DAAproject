// Correct a one-sided generated gait during texture registration, not per tick.
// Keep the head/torso and all other directions byte-identical.
export function normalizeYassinUpStride(data,width=768,height=576){
  if(width!==768||height!==576||data.length!==width*height*4)
    throw new Error('Yassin stride requires the registered 128x144, 6x4 sheet.');
  const result=new Uint8ClampedArray(data);
  for(const [source,target] of [[1,3],[2,4]]){
    for(let y=102;y<144;y++)for(let x=0;x<128;x++){
      const from=((3*144+y)*width+source*128+(127-x))*4;
      const to=((3*144+y)*width+target*128+x)*4;
      result.set(data.subarray(from,from+4),to);
    }
  }
  return result;
}
