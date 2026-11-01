import './style.css';
import { Simulation, W, H, COUNT_X } from './vision.js';
import { parts, stages, evidenceHTML } from './content.js';
import { createWorld } from './scene.js';
import { MIN_MIXED_QUANTITY, MAX_QUANTITY } from './nut.js';

const $=id=>document.getElementById(id);
const labelToggle=document.createElement('button');
labelToggle.id='toggleLabels';labelToggle.type='button';
labelToggle.textContent='隐藏标签';labelToggle.setAttribute('aria-controls','labels');
labelToggle.setAttribute('aria-pressed','true');
const sceneActions=document.createElement('div');sceneActions.className='scene-actions';
$('home').before(sceneActions);sceneActions.append(labelToggle,$('home'));
labelToggle.onclick=()=>{
 const visible=$('labels').hidden;
 $('labels').hidden=!visible;
 labelToggle.textContent=visible?'隐藏标签':'显示标签';
 labelToggle.setAttribute('aria-pressed',String(visible));
};
const config={speed:.035,threshold:128,quantity:12,spacing:23/1000*24,morph:'bypass',touching:false,split:true};
const sim=new Simulation(config);
$('quantity').max=MAX_QUANTITY;
let playing=true,view='overview',stage=0,walkMode=false,world=null,accumulator=0,last=0,dirty=true,renderFrames=0,renderStart=0;
const grayCtx=$('gray').getContext('2d'),binaryCtx=$('binary').getContext('2d');
const monitor=document.createElement('canvas');monitor.width=640;monitor.height=460;const mc=monitor.getContext('2d');
const pixelInspector=document.createElement('div');pixelInspector.id='pixelInspector';pixelInspector.hidden=true;
pixelInspector.innerHTML='<div class="eyebrow">LIVE PIXEL WINDOW / PL</div><div class="pixel-body"><div id="pixelGrid"></div><div><strong>3 × 3 邻域</strong><p id="pixelLocation"></p><p id="pixelResult"></p></div></div><small>原始 Gray8 → 比较 → Binary8 窗口 → AND / OR<br>数值来自当前合成帧；模式切换仅为软件模型</small>';
$('world').appendChild(pixelInspector);for(let i=0;i<9;i++)$('pixelGrid').appendChild(document.createElement('span'));
const moduleButton=document.createElement('button');moduleButton.id='moduleButton';moduleButton.hidden=true;$('selection').appendChild(moduleButton);
const detailBody=document.createElement('div');detailBody.id='partDetailBody';detailBody.tabIndex=0;
detailBody.setAttribute('role','region');detailBody.setAttribute('aria-labelledby','partName');
for(const child of [...$('selection').children])if(child.id!=='closeDetail')detailBody.appendChild(child);
$('selection').appendChild(detailBody);
const image=grayCtx.createImageData(W,H);
const pipeline=$('pipeline');
stages.forEach((s,i)=>{const b=document.createElement('button');b.innerHTML=`${s[0]}<small>${s[1]}</small>`;b.onclick=()=>{setStage(i);selectPart(s[3]);};pipeline.appendChild(b);});
function setStage(i){stage=i;pipeline.querySelectorAll('button').forEach((b,j)=>b.classList.toggle('active',i===j));$('stageIndex').textContent=`0${i+1} / 07`;$('stageText').textContent=stages[i][2];}
setStage(0);
function selectPart(id){const p=parts[id];if(!p)return;for(const [key,value]of Object.entries({partCategory:p.category,partName:p.name,partDescription:p.description,partInside:p.inside,partConnection:p.connection,partEvidence:p.evidence}))$(key).textContent=value;$('selection').hidden=false;detailBody.scrollTop=0;world?.select(id);moduleButton.hidden=!['camera','board','monitor'].includes(id);moduleButton.textContent=id==='board'?'进入 PS / PL 内部 →':'打开视觉检测视角 →';moduleButton.onclick=()=>{changeView(id==='board'?'fpga':'camera');};}
$('closeDetail').onclick=()=>{$('selection').hidden=true;world?.select(null);};
const views={overview:['01','物料视觉计数 · 系统总览','连续送料 → 图像采集 → 硬件加速 → 跟踪计数'],camera:['02','摄像头视角 · 目标检测与越线','顶视观察检测区；下方灰度图和二值图与目标运动同步'],fpga:['03','进入 Zynq · PS / PL 协同处理','逻辑展开视图：内存搬运、像素窗口、特征回传与软件计数'],exploded:['04','分模块剖视 · 硬件连接','展开相机、灯架与接料盒，板卡保留原安装位置']};
function changeView(v){view=v;const [code,title,desc]=views[v];$('sceneCode').textContent=code;$('sceneTitle').textContent=title;$('sceneDescription').textContent=desc;$('chipLegend').hidden=v!=='fpga';pixelInspector.hidden=v!=='fpga';document.querySelectorAll('.view').forEach(b=>b.classList.toggle('active',b.dataset.view===v));$('selection').hidden=true;world?.setView(v);dirty=true;}
document.querySelectorAll('.view').forEach(b=>b.onclick=()=>changeView(b.dataset.view));$('home').onclick=()=>changeView(view);
function playState(){ $('play').textContent=playing?'Ⅱ 暂停':'▶ 继续';$('step').disabled=playing; }
function batchSummary(){const groups=new Map(sim.layout.map(p=>[p.groupId,p.kind]));const count=kind=>[...groups.values()].filter(k=>k===kind).length;$('batchSummary').textContent=config.touching?`本批：独立 ${count('single')} 颗 · 双颗 ${count('pair')} 组 · 三角三颗 ${count('triangle')} 组；并行 / 前后 / 三角错位过线。`:`本批：${config.quantity} 颗独立螺母。`;}
function reset(){sim.reset();accumulator=0;dirty=true;batchSummary();$('event').textContent='新批次已投料。计数以真实检测 ID 的左→右越线事件为准。';}
batchSummary();
for(const key of ['speed','threshold','quantity','spacing']){
 const el=$(key),refresh=()=>{$(`${key}Value`).textContent=key==='speed'?`${config[key].toFixed(3)} m/s`:key==='spacing'?`${(config[key]/24*1000).toFixed(1)} mm`:key==='quantity'?`${config[key]} 颗`:config[key];};refresh();
 el.addEventListener('input',()=>{config[key]=key==='spacing'?Number(el.value)/1000*24:Number(el.value);refresh();if(key==='quantity'||key==='spacing')reset();else if(key==='threshold'){sim.advance(0);dirty=true;}});
}
$('morph').onchange=e=>{config.morph=e.target.value;sim.advance(0);dirty=true;$('event').textContent='形态学模型已切换。此交互模拟重新配置，现有 RTL 的 MODE 是编译期参数。';};
for(const key of ['touching','split'])$(key).onclick=()=>{config[key]=!config[key];$(key).classList.toggle('on',config[key]);$(key).setAttribute('aria-checked',config[key]);if(key==='touching'){$('quantity').min=config.touching?MIN_MIXED_QUANTITY:1;const raised=config.touching&&config.quantity<MIN_MIXED_QUANTITY;if(raised){config.quantity=MIN_MIXED_QUANTITY;$('quantity').value=config.quantity;$('quantityValue').textContent=`${config.quantity} 颗`;}reset();if(raised)$('event').textContent='已补足为 12 颗，以同时展示独立、双颗及三角三颗，且保持独立数量最多。';}else{sim.advance(0);dirty=true;}};
$('play').onclick=()=>{playing=!playing;accumulator=0;playState();};
$('step').onclick=()=>{if(!playing){sim.advance();dirty=true;processEvents();}};
$('reset').onclick=reset;
$('walk').onclick=()=>{
 if(!walkMode){walkMode=true;playing=false;playState();setStage(0);changeView('fpga');$('walk').textContent='下一阶段 →';}
 else if(stage<6){setStage(stage+1);}else{walkMode=false;$('walk').textContent='重新讲解 →';}
 selectPart(stages[stage][3]);
};
function showModal(content){$('modalContent').innerHTML=content;$('modal').showModal();}
$('evidence').onclick=()=>showModal(evidenceHTML);
$('help').onclick=()=>showModal(`<div class="eyebrow">QUICK START</div><h2>让每一次计数，都有迹可循。</h2><ol><li>拖动旋转场景，滚轮缩放，右键拖动平移。点击零部件查看结构、连接和实现边界。</li><li>选择“视觉检测”观察俯视图；螺母进入相机视野后获得跟踪 ID，首次由左到右穿越金色虚拟线时才加一。</li><li>调节阈值到 0 或 255，比较背景连通与目标消失；选择腐蚀 / 膨胀，观察孔洞与边缘变化。</li><li>开启粘连工况，比较“孔洞辅助分离”的关闭与开启。建议先暂停并重置，以便重复对比同一批次。</li><li>暂停后用“单帧”每次推进 1/30 仿真秒。“逐阶段讲解”冻结时间，在芯片视图中依次解释数据路径。</li><li>投料批次为有限数量；全部输出后点击重置再次演示。数量 / 间距 / 粘连改变会重置批次与计数。</li></ol><p>空格：暂停 / 继续；N：暂停时前进一步；R：重置；Esc：关闭弹窗。全屏适合答辩展示。带速按 CAD 比例换算为 m/s，为模拟设定值。</p>`);
$('closeModal').onclick=()=>$('modal').close();$('modal').onclick=e=>{if(e.target===$('modal')){const r=$('modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('modal').close();}};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('event').textContent='当前浏览器不支持全屏，请使用浏览器全屏快捷键。';}};
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(document.activeElement.tagName)||$('modal').open)return;if(e.code==='Space'){e.preventDefault();$('play').click();}else if(e.code==='KeyN')$('step').click();else if(e.code==='KeyR')reset();});
function putPixels(ctx,data){for(let i=0;i<data.length;i++){image.data[i*4]=image.data[i*4+1]=image.data[i*4+2]=data[i];image.data[i*4+3]=255;}ctx.putImageData(image,0,0);}
function processEvents(){const events=sim.tracker.events;if(!events.length)return;const last=events.at(-1),ids=events.map(e=>String(e.id).padStart(3,'0')).join(' / ');$('event').textContent=events.length>1?`帧 ${last.frame} · ID ${ids} 同帧并行越线，累计 +${events.length} → ${last.total}。各 ID 分别标记已计数。`:`帧 ${last.frame} · ID ${ids} 首次左→右越线，累计 +1 → ${last.total}。已标记 counted，后续帧不会重复增加。`;}
function drawVision(){
 putPixels(grayCtx,sim.gray);putPixels(binaryCtx,sim.binary);
 const ctx=binaryCtx;ctx.save();ctx.strokeStyle='#d9ab68';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(COUNT_X,0);ctx.lineTo(COUNT_X,H);ctx.stroke();ctx.setLineDash([]);ctx.font='10px Consolas';ctx.fillStyle='#f1cb8d';ctx.fillText('COUNT x=320',COUNT_X+8,14);
 for(const t of sim.current){const b=t.box,color=t.counted?'#63e7ce':'#82baff';ctx.strokeStyle=color;ctx.lineWidth=1;ctx.strokeRect(b.minX-3,b.minY-3,b.maxX-b.minX+6,b.maxY-b.minY+6);ctx.beginPath();t.path.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.fillStyle=color;ctx.fillText(`ID ${String(t.id).padStart(3,'0')}${t.counted?' ✓':''}`,Math.max(2,b.minX-2),Math.max(28,b.minY-8));ctx.beginPath();ctx.arc(t.x,t.y,2,0,Math.PI*2);ctx.fill();}
 ctx.restore();
 $('total').textContent=String(sim.tracker.total).padStart(4,'0');$('targets').textContent=String(sim.current.length).padStart(2,'0');$('foreground').textContent=`前景 ${sim.binary.reduce((a,b)=>a+(b>0),0).toLocaleString()} px`;$('recognition').textContent=`${sim.regions} 连通域 → ${sim.current.length} 候选目标`;$('frameNumber').textContent=`FRAME ${String(sim.frame).padStart(6,'0')}`;$('simTime').textContent=`SIM ${String(Math.floor(sim.time/60)).padStart(2,'0')}:${(sim.time%60).toFixed(2).padStart(5,'0')}`;
 mc.fillStyle='#0c1722';mc.fillRect(0,0,640,460);mc.fillStyle='#6ae6cf';mc.font='bold 25px Segoe UI';mc.fillText('NUT VISION / PYNQ-Z2',24,37);mc.fillStyle='#748da5';mc.font='14px Segoe UI';mc.fillText('TEACHING SIMULATION • NO LIVE HARDWARE',24,61);mc.drawImage($('binary'),0,0,W,H,24,107.5,440,275);mc.fillStyle='#90a9bc';mc.font='16px Segoe UI';mc.fillText('COUNT',490,110);mc.fillStyle='#61ead2';mc.font='bold 49px Consolas';mc.fillText(String(sim.tracker.total).padStart(3,'0'),482,166);mc.fillStyle='#90a9bc';mc.font='16px Segoe UI';mc.fillText('TARGETS',482,218);mc.fillStyle='#deeaf5';mc.font='32px Consolas';mc.fillText(String(sim.current.length).padStart(2,'0'),490,260);mc.fillStyle='#90a9bc';mc.font='14px Segoe UI';mc.fillText('30 FPS',487,330);mc.fillText('SIM CLOCK',480,353);mc.fillStyle='#d9ac69';mc.font='15px Segoe UI';mc.fillText('TRACK ID → CROSS LINE → COUNT ONCE',24,439);
 const cx=Math.min(W-2,Math.max(1,Math.round(sim.current[0]?.x??COUNT_X)+9)),cy=Math.min(H-2,Math.max(1,Math.round(sim.current[0]?.y??H/2)));let all=255,any=0;
 $('pixelGrid').querySelectorAll('span').forEach((cell,i)=>{const x=cx+(i%3)-1,y=cy+Math.floor(i/3)-1,g=sim.gray[y*W+x],b=g>=config.threshold?255:0;cell.textContent=g;cell.style.background=b?'#a4e9dc':'#1a2938';cell.style.color=b?'#102b29':'#7c98b1';all&=b;any|=b;});
 $('pixelLocation').textContent=`x=${cx}, y=${cy} · T=${config.threshold}`;$('pixelResult').textContent=`AND = ${all} · OR = ${any}`;
 world?.invalidateScreen();dirty=false;
}
try{drawVision();world=createWorld($('world'),selectPart,monitor);changeView('overview');}
catch(error){$('error').hidden=false;$('error').textContent=`3D 初始化失败：${error.message}。请使用支持 WebGL2 的桌面浏览器并开启硬件加速；下方像素实验仍可运行。`;console.error(error);}
playState();
function animate(now){const delta=last?Math.min((now-last)/1000,.1):0;last=now;if(document.hidden){accumulator=0;requestAnimationFrame(animate);return;}
 if(playing){accumulator+=delta;while(accumulator>=1/30){sim.advance();processEvents();accumulator-=1/30;dirty=true;if(sim.nuts.every(n=>n.stage==='out')){playing=false;accumulator=0;playState();$('event').textContent=`本批次 ${config.quantity} 颗已全部输送完毕，检测累计 ${sim.tracker.total}。点击重置可重复比较同一工况。`;break;}}if(!walkMode&&sim.frame%75===0)setStage(Math.floor(sim.frame/75)%7);}
 if(dirty)drawVision();world?.update(sim,delta);renderFrames++;if(now-renderStart>1000){$('renderFps').textContent=`WEBGL ${Math.round(renderFrames*1000/(now-renderStart))} FPS`;renderFrames=0;renderStart=now;}requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
// Read-only diagnostics for local QA, no external connections.
window.__NUT_VISION__={getState:()=>({frame:sim.frame,time:sim.time,total:sim.tracker.total,targets:sim.current.length,regions:sim.regions,playing,view,config:{...config},webgl:!!world}),getSimulation:()=>sim};
