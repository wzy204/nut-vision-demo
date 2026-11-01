import {test} from 'node:test';
import assert from 'node:assert/strict';
import {threshold,morphology,components,Tracker,Simulation,W,H,COUNT_X,WORLD_UNITS_PER_METRE,FOV_WIDTH,FOV_HEIGHT} from '../src/vision.js';
import {nutPlacement,createBatchLayout,NUT_CONTACT_PITCH,NUT_CONTACT_ROTATION,MAX_QUANTITY} from '../src/nut.js';
import {createNutGeometry} from '../src/nut-geometry.js';

test('连通域优化保持外部背景、孔洞和像素统计一致',()=>{
 const mask=new Uint8Array(49);
 for(let y=1;y<=5;y++)for(let x=1;x<=5;x++)if(x===1||x===5||y===1||y===5)mask[y*7+x]=255;
 assert.deepEqual(components(mask,7,7).map(r=>r.area),[16]);
 const full=components(mask,7,7,false,false),light=components(mask,7,7,false,false,false);
 assert.deepEqual(full.map(r=>r.area),[24,9]);
 assert.deepEqual(full.map(({pixels,...r})=>r),light.map(({pixels,...r})=>r));
 assert.ok(light.every(r=>r.pixels.length===0));
});

test('快速背景生成与原逐像素公式一致',()=>{
 const s=new Simulation({speed:.2,threshold:128,quantity:1,spacing:.55,morph:'bypass',touching:false,split:true});
 s.time=.123;s.raster();
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)assert.equal(s.gray[y*W+x],24+((x*13+y*7)%7)+Math.floor(4*Math.sin((x-s.time*50)*.16)));
});

test('最高 0.2 m/s、最小 2 mm 间距的百颗独立与粘连批次全部计数',()=>{
 for(const touching of [false,true]){
  const c={speed:.2,threshold:128,quantity:100,spacing:2/1000*24,morph:'bypass',touching,split:true},s=new Simulation(c);
  const frames=Math.ceil((14+Math.max(...s.layout.map(p=>p.offset)))/(c.speed*24)*30);
  for(let i=0;i<frames;i++)s.advance();
  assert.ok(s.nuts.every(n=>n.stage==='out'));assert.equal(s.tracker.total,100,`touching=${touching}`);
 }
});

test('640×400 Gray8 缓冲与中央计数线；m/s 按 CAD 尺度转换且改速不跳位',()=>{
 assert.equal(W,640);assert.equal(H,400);assert.equal(COUNT_X,320);
 assert.equal(W/FOV_WIDTH,H/FOV_HEIGHT);
 const c={speed:.035,threshold:128,quantity:1,spacing:.55,morph:'bypass',touching:false,split:true},s=new Simulation(c);
 assert.equal(s.gray.length,256000);assert.equal(s.binary.length,256000);
 s.advance(1);assert.ok(Math.abs(s.distance-.035*WORLD_UNITS_PER_METRE)<1e-10);
 const before=s.nuts[0].x;c.speed=.08;s.advance(0);assert.equal(s.nuts[0].x,before);
 s.advance(1/30);assert.ok(Math.abs(s.nuts[0].x-before-.08*WORLD_UNITS_PER_METRE/30)<1e-10);
});
test('阈值包含等号；输出仅 0 / 255',()=>assert.deepEqual([...threshold([0,127,128,255],128)],[0,0,255,255]));
test('3×3 形态学边缘补零，尺寸保持',()=>{const v=new Uint8Array(9).fill(255);assert.deepEqual([...morphology(v,'erode',3,3)],[0,0,0,0,255,0,0,0,0]);assert.deepEqual([...morphology(Uint8Array.from([0,0,0,0,255,0,0,0,0]),'dilate',3,3)],Array(9).fill(255));});
test('跟踪只在同一 ID 左到右穿线加一；停留及新出现右侧目标不加一',()=>{const t=new Tracker(),d=x=>({x:x*2,y:100,minX:x-5,maxX:x+5,minY:95,maxY:105});t.update([d(150)],1);t.update([d(158)],2);t.update([d(163)],3);assert.equal(t.total,1);t.update([d(170)],4);t.update([d(175)],5);assert.equal(t.total,1);assert.equal(t.tracks[0].id,1);t.update([d(180),{...d(250),y:180}],6);assert.equal(t.total,1);t.reset();assert.equal(t.total,0);});
const config={speed:2/24,threshold:128,quantity:3,spacing:.55,morph:'bypass',touching:false,split:true};
test('真实栅格 → 阈值 → 连通域 → 跟踪，三颗独立目标计数三次',()=>{const s=new Simulation({...config});for(let i=0;i<190;i++)s.advance();assert.equal(s.tracker.total,3);});
test('极高阈值使前景消失，不凭机械位置直接计数',()=>{const s=new Simulation({...config,threshold:255});for(let i=0;i<160;i++)s.advance();assert.equal(s.tracker.total,0);});
function groupSimulation(kind,crossing,split=true){
 const batch=createBatchLayout({...config,quantity:24,touching:true});
 const id=batch.find(p=>p.kind===kind&&p.crossing===crossing).groupId;
 const group=batch.filter(p=>p.groupId===id),base=Math.min(...group.map(p=>p.offset));
 const s=new Simulation({...config,quantity:group.length,split});
 s.layout=group.map((p,index)=>({...p,index,offset:p.offset-base}));s.nuts=s.layout.map(p=>({...p,x:-7,stage:'bowl'}));
 return s;
}
test('双颗前后与并行过线：未分离为一，孔洞分离为二；并行同帧加二',()=>{
 for(const crossing of ['前后','并行'])for(const split of [false,true]){
  const s=groupSimulation('pair',crossing,split);let maxEvents=0;
  for(let i=0;i<150;i++){s.advance();maxEvents=Math.max(maxEvents,s.tracker.events.length);}
  assert.equal(s.tracker.total,split?2:1,`${crossing}, split=${split}`);
  if(crossing==='并行'&&split)assert.equal(maxEvents,2);
 }
});
test('暂停时重新处理当前帧保持有限速度与 ID，不产生越线事件',()=>{const t=new Tracker(),d=x=>({x:x*2,y:100});t.update([d(150)],1);t.update([d(158)],2);t.update([d(158)],2);assert.ok(Number.isFinite(t.tracks[0].vx));assert.equal(t.total,0);t.update([d(163)],3);assert.equal(t.total,1);assert.equal(t.tracks[0].id,1);});
test('默认十二颗完整批次全部计数，重置可重复演示',()=>{const s=new Simulation({...config,quantity:12,speed:2/24});for(let i=0;i<360;i++)s.advance();assert.equal(s.tracker.total,12);s.reset();assert.equal(s.tracker.total,0);assert.equal(s.frame,0);assert.equal(s.time,0);});
test('粘连间距匹配真实带倒角网格宽度：平面接触，没有实体穿插',()=>{
 const geometry=createNutGeometry();geometry.rotateY(NUT_CONTACT_ROTATION);geometry.computeBoundingBox();
 const width=geometry.boundingBox.max.x-geometry.boundingBox.min.x;
 assert.ok(Math.abs(width-NUT_CONTACT_PITCH)<1e-7,`actual mesh width ${width}, pitch ${NUT_CONTACT_PITCH}`);
 geometry.dispose();
});
test('12–100 颗均包含两类粘连，独立螺母数 > 双颗螺母数 > 三角螺母数',()=>{
 for(let quantity=12;quantity<=MAX_QUANTITY;quantity++){
  const batch=createBatchLayout({...config,quantity,touching:true});
  const count=kind=>batch.filter(p=>p.kind===kind).length;
  assert.equal(batch.length,quantity);assert.ok(count('single')>count('pair'));assert.ok(count('pair')>count('triangle'));assert.ok(count('triangle')>=3);
  assert.ok(batch.some(p=>p.crossing==='并行'));assert.ok(batch.some(p=>p.crossing==='前后'));
  assert.deepEqual(batch,createBatchLayout({...config,quantity,touching:true}),'reset repeats same batch');
 }
});
// Convex hull of the ACTUAL extruded/beveled mesh projected onto the belt.
function footprint(p){
 const g=createNutGeometry();g.rotateY(p.rotation);const a=g.attributes.position;
 const points=Array.from({length:a.count},(_,i)=>[a.getX(i)-p.offset,a.getZ(i)+p.y]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const half=pts=>{const h=[];for(const p of pts){while(h.length>1&&cross(h.at(-2),h.at(-1),p)<=1e-14)h.pop();h.push(p);}return h;};
 const lower=half(points),upper=half([...points].reverse());g.dispose();return lower.slice(0,-1).concat(upper.slice(0,-1));
}
function minimumOverlap(a,b){
 let overlap=Infinity;
 for(const polygon of [a,b])for(let i=0;i<polygon.length;i++){
  const p=polygon[i],q=polygon[(i+1)%polygon.length],dx=q[0]-p[0],dy=q[1]-p[1],length=Math.hypot(dx,dy);if(length<1e-12)continue;
  const project=v=>(v[0]*-dy+v[1]*dx)/length,aa=a.map(project),bb=b.map(project);
  overlap=Math.min(overlap,Math.min(Math.max(...aa),Math.max(...bb))-Math.max(Math.min(...aa),Math.min(...bb)));
 }return overlap;
}
test('真实网格分离轴检测：双颗 / 三角互相紧贴，所有组均不穿插且在带内',()=>{
 for(const spacing of [.05,.1,.55,1.2]){
  const batch=createBatchLayout({...config,quantity:MAX_QUANTITY,touching:true,spacing}),polygons=batch.map(footprint);
  for(let i=0;i<batch.length;i++){
   assert.ok(polygons[i].every(p=>Math.abs(p[1])<1.19),'inside belt');
   for(let j=0;j<i;j++){
    const overlap=minimumOverlap(polygons[i],polygons[j]);
    assert.ok(overlap<1e-7,`solid overlap ${i}/${j}, ${spacing}: ${overlap}`);
    if(batch[i].groupId===batch[j].groupId)assert.ok(Math.abs(overlap)<1e-7,'same group touches');
   }
  }
 }
});
test('三角三颗互相紧贴，孔洞分离后计三；覆盖并行与错位',()=>{
 for(const crossing of ['三角并行','三角错位']){
  const s=groupSimulation('triangle',crossing);let maxEvents=0;
  for(let i=0;i<160;i++){s.advance();maxEvents=Math.max(maxEvents,s.tracker.events.length);}
  assert.equal(s.tracker.total,3,crossing);if(crossing==='三角并行')assert.equal(maxEvents,2);
 }
});
test('混合批次像素检测完整计数，默认及截图小间距工况',()=>{
 for(const [quantity,spacing]of [[12,.55],[19,.1]]){
  const s=new Simulation({...config,quantity,spacing,touching:true});
  for(let i=0;i<430;i++)s.advance();assert.equal(s.tracker.total,quantity,`${quantity} nuts, spacing ${spacing}`);
 }
});
test('非粘连模式的随机朝向同样不能压缩带倒角网格',()=>{
 const c={...config,quantity:24,touching:false,spacing:.05};
 const bounds=Array.from({length:24},(_,i)=>{const p=nutPlacement(i,c),g=createNutGeometry();g.rotateY(p.rotation);g.computeBoundingBox();const b={min:g.boundingBox.min.x-p.offset,max:g.boundingBox.max.x-p.offset};g.dispose();return b;});
 for(let i=1;i<bounds.length;i++)assert.ok(bounds[i-1].min-bounds[i].max>=.05-1e-7);
});
test('100 颗独立 / 混合批次全程像素计数，全部输出后无遗漏',()=>{
 for(const touching of [false,true]){
  const s=new Simulation({...config,quantity:MAX_QUANTITY,spacing:.05,touching});
  const frames=Math.ceil((14+Math.max(...s.layout.map(p=>p.offset)))/(config.speed*24)*30);
  for(let i=0;i<frames;i++)s.advance();
  assert.equal(s.nuts.length,100);assert.ok(s.nuts.every(n=>n.stage==='out'));
  assert.equal(s.tracker.total,100,`touching=${touching}`);
 }
});

