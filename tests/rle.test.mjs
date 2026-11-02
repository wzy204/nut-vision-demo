import {test} from 'node:test';
import assert from 'node:assert/strict';
import {encodeRLE,rleComponents} from '../src/rle.js';
import {components} from '../src/vision.js';
test('RLE 游程和相邻行合并与像素八连通域一致，覆盖断行、斜接和多区域',()=>{
 let seed=1729;
 for(let iteration=0;iteration<80;iteration++){
  const w=17,h=11,mask=Uint8Array.from({length:w*h},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%3===0?255:0;});
  const runs=encodeRLE(mask,w,h),decoded=new Uint8Array(mask.length);
  for(const r of runs)for(let x=r.x0;x<=r.x1;x++)decoded[r.y*w+x]=255;
  assert.deepEqual(decoded,mask);
  const normalize=regions=>regions.map(r=>({area:r.area,x:r.x,y:r.y,pixels:r.pixels.toSorted((a,b)=>a-b)})).sort((a,b)=>a.pixels[0]-b.pixels[0]);
  assert.deepEqual(normalize(rleComponents(mask,w,h)),normalize(components(mask,w,h)));
 }
});
