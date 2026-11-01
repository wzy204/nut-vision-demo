// Browser teaching model. No board data, no claimed hardware performance.
import { createBatchLayout, NUT_OUTER_RADIUS, NUT_HOLE_RADIUS } from './nut.js';
export const W = 640, H = 400;
export const COUNT_X=W/2, WORLD_UNITS_PER_METRE=24;
export const FOV_WIDTH=3.6, FOV_HEIGHT=FOV_WIDTH*H/W;
export function threshold(gray, level) {
  const out=new Uint8Array(gray.length);
  for(let i=0;i<gray.length;i++)out[i]=gray[i]>=level?255:0;
  return out;
}
export function morphology(input, mode, width = W, height = H) {
  if (mode === 'bypass') return input.slice();
  const out = new Uint8Array(input.length), erode = mode === 'erode';
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let v = erode ? 255 : 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      const p = xx < 0 || xx >= width || yy < 0 || yy >= height ? 0 : input[yy * width + xx];
      v = erode ? v & p : v | p;
    }
    out[y * width + x] = v;
  }
  return out;
}
export function components(mask, width = W, height = H, foreground = true, diagonal = true, retainPixels = true) {
  const seen = new Uint8Array(mask.length), queue=new Uint32Array(mask.length), regions = [];
  const neighbors = diagonal ? [-width-1,-width,-width+1,-1,1,width-1,width,width+1] : [-width,-1,1,width];
  for (let i = 0; i < mask.length; i++) {
    if (seen[i] || Boolean(mask[i]) !== foreground) continue;
    let tail=1;queue[0]=i; seen[i] = 1;
    let minX = width, minY = height, maxX = 0, maxY = 0, sx = 0, sy = 0;
    for (let h = 0; h < tail; h++) {
      const p = queue[h], x = p % width, y = Math.floor(p / width);
      sx += x; sy += y; minX = Math.min(minX,x); maxX = Math.max(maxX,x); minY = Math.min(minY,y); maxY = Math.max(maxY,y);
      for (const d of neighbors) {
        const n = p + d;
        if (n < 0 || n >= mask.length || Math.abs(n % width - x) > 1 || seen[n] || Boolean(mask[n]) !== foreground) continue;
        seen[n] = 1; queue[tail++]=n;
      }
    }
    regions.push({pixels:retainPixels?Array.from(queue.subarray(0,tail)):[], area:tail, x:sx/tail, y:sy/tail, minX,maxX,minY,maxY});
  }
  return regions;
}
export function detect(mask, split = true) {
  const regions = components(mask).filter(r => r.area >= 120 && r.area < 20000);
  const holes = split ? components(mask, W, H, false, false, false).filter(r => r.area >= 36 && r.minX > 0 && r.minY > 0 && r.maxX < W-1 && r.maxY < H-1) : [];
  const detections = [];
  for (const r of regions) {
    const seeds = holes.filter(h => h.x > r.minX && h.x < r.maxX && h.y > r.minY && h.y < r.maxY);
    if (seeds.length >= 2 && seeds.length <= 3) {
      const bins = seeds.map(() => []);
      for (const p of r.pixels) {
        let best = 0, distance = Infinity;
        seeds.forEach((h,j) => { const d = (p%W-h.x)**2 + (Math.floor(p/W)-h.y)**2; if (d < distance) {best=j;distance=d;} });
        bins[best].push(p);
      }
      bins.forEach((pixels,j) => {
        if (pixels.length < 120) return;
        const xs = pixels.map(p => p%W), ys = pixels.map(p => Math.floor(p/W));
        detections.push({x:seeds[j].x,y:seeds[j].y,minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys),area:pixels.length,split:true});
      });
    } else detections.push(r);
  }
  return {detections, regionCount:regions.length};
}
export class Tracker {
  constructor() { this.reset(); }
  reset() { this.tracks=[];this.nextId=1;this.total=0;this.events=[]; }
  update(detections, frame) {
    const assigned = new Set(), paired = new Set(), pairs=[];
    this.events=[];
    for (const t of this.tracks) for (let j=0;j<detections.length;j++) {
      const d=detections[j], gap=frame-t.frame;
      const distance=Math.hypot(d.x-(t.x+t.vx*gap),d.y-t.y);
      if (distance<Math.min(96,40+gap*8)) pairs.push({t,j,distance});
    }
    pairs.sort((a,b)=>a.distance-b.distance);
    for(const {t,j} of pairs) {
      if (paired.has(t.id)||assigned.has(j)) continue;
      const d=detections[j], gap=frame-t.frame, oldX=t.x;
      if(gap>0)t.vx=(d.x-oldX)/gap;
      t.x=d.x;t.y=d.y;t.box=d;t.frame=frame;if(gap>0)t.path.push([d.x,d.y]);t.path=t.path.slice(-20);
      if (gap>0 && !t.counted && oldX<COUNT_X && d.x>=COUNT_X && t.vx>0) { t.counted=true;this.total++;this.events.push({id:t.id,frame,total:this.total}); }
      paired.add(t.id);assigned.add(j);
    }
    detections.forEach((d,j)=>{if(!assigned.has(j))this.tracks.push({id:this.nextId++,x:d.x,y:d.y,vx:0,box:d,frame,counted:false,path:[[d.x,d.y]]});});
    this.tracks=this.tracks.filter(t=>frame-t.frame<=8);
    return this.tracks.filter(t=>t.frame===frame);
  }
}
export class Simulation {
  constructor(config) { this.config=config;this.tracker=new Tracker();this.reset(); }
  reset() {this.distance=0;this.time=0;this.frame=0;this.tracker.reset();this.layout=createBatchLayout(this.config);this.nuts=this.layout.map(p=>({...p,x:-7,stage:'bowl'}));this.gray=new Uint8Array(W*H);this.binary=this.gray.slice();this.current=[];this.regions=0;this.advance(0);}
  advance(dt=1/30) {
    this.time+=dt;if(dt>0)this.frame++;
    const c=this.config;this.distance+=dt*c.speed*WORLD_UNITS_PER_METRE;
    for(const n of this.nuts){
      const placement=this.layout[n.index];
      const travel=this.distance-placement.offset;
      n.x=-6+travel;n.y=placement.y;n.rotation=placement.rotation;
      n.stage=n.x< -5.3?'bowl':n.x< -4.1?'chute':n.x>7.2?'out':'belt';
    }
    this.raster();
    this.binary=morphology(threshold(this.gray,c.threshold),c.morph);
    const result=detect(this.binary,c.split);this.regions=result.regionCount;
    this.current=this.tracker.update(result.detections,this.frame);
  }
  raster(){
    // Orthographic top-down synthetic image: 3.6 x 2.25 world units, square pixels.
    // Background is identical in each row: compute it once, then bulk-copy.
    const row=new Uint8Array(W);
    for(let x=0;x<W;x++)row[x]=24+(x*13%7)+Math.floor(4*Math.sin((x-this.time*50)*.16));
    for(let y=0;y<H;y++)this.gray.set(row,y*W);
    for(const n of this.nuts){
      if(n.stage!=='belt'||n.x< -2.1||n.x>2.1)continue;
      const cx=(n.x+FOV_WIDTH/2)/FOV_WIDTH*W,cy=(n.y+FOV_HEIGHT/2)/FOV_HEIGHT*H,r=NUT_OUTER_RADIUS*W/3.6;
      for(let y=Math.max(0,Math.floor(cy-r));y<=Math.min(H-1,Math.ceil(cy+r));y++)for(let x=Math.max(0,Math.floor(cx-r));x<=Math.min(W-1,Math.ceil(cx+r));x++){
        const dx=x-cx,dy=y-cy,ang=Math.atan2(dy,dx),dist=Math.hypot(dx,dy),edge=r*Math.cos(Math.PI/6)/Math.cos(((ang+n.rotation+Math.PI*4)%(Math.PI/3))-Math.PI/6);
        if(dist<=edge&&dist>NUT_HOLE_RADIUS*W/3.6)this.gray[y*W+x]=Math.round(170+55*(1-dist/r)+12*Math.sin(ang*3)+((x+y)%5));
      }
    }
  }
}
