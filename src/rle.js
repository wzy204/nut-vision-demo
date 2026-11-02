// Teaching run format; deliberately not a board DMA ABI.
export function encodeRLE(mask,width,height){
 const runs=[];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(mask[y*width+x]){
  const x0=x;while(x+1<width&&mask[y*width+x+1])x++;
  runs.push({y,x0,x1:x});
 }
 return runs;
}
export function rleComponents(mask,width,height){
 const runs=encodeRLE(mask,width,height),parent=runs.map((_,i)=>i);
 const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
 let previous=[],row=[],lastY=-2;
 for(let i=0;i<runs.length;i++){
  const r=runs[i];if(r.y!==lastY){previous=r.y===lastY+1?row:[];row=[];lastY=r.y;}
  for(const j of previous){const p=runs[j];if(p.x1<r.x0-1)continue;if(p.x0>r.x1+1)break;parent[find(i)]=find(j);}
  row.push(i);
 }
 const regions=new Map();
 runs.forEach((r,i)=>{
  const key=find(i),g=regions.get(key)??{pixels:[],area:0,sx:0,sy:0,minX:width,maxX:0,minY:height,maxY:0};
  const n=r.x1-r.x0+1;g.area+=n;g.sx+=(r.x0+r.x1)*n/2;g.sy+=r.y*n;
  g.minX=Math.min(g.minX,r.x0);g.maxX=Math.max(g.maxX,r.x1);g.minY=Math.min(g.minY,r.y);g.maxY=Math.max(g.maxY,r.y);
  for(let x=r.x0;x<=r.x1;x++)g.pixels.push(r.y*width+x);
  regions.set(key,g);
 });
 const result=[...regions.values()].map(({sx,sy,...g})=>({...g,x:sx/g.area,y:sy/g.area}));
 result.runCount=runs.length;return result;
}
