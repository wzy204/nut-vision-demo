import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { parts } from './content.js';
import { createNutGeometry } from './nut-geometry.js';
import { MAX_QUANTITY } from './nut.js';
import { createCableHarness } from './cable-routes.js';
import { FOV_HEIGHT } from './vision.js';
import { buildCadAssembly, beltHeight, trayHeight, cadMetadata } from './cad-model.js';

const C={steel:0x839bad,dark:0x17212b,cyan:0x5ee8cf,blue:0x5baeff,purple:0xb091fa,gold:0xd8aa65};
export function createWorld(host,onSelect,monitorCanvas){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;host.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x0d1723,.025);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();
 const camera=new THREE.PerspectiveCamera(40,1,.1,140);camera.position.set(13,12,17);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(-.4,1.1,0);controls.enableDamping=true;controls.minDistance=4;controls.maxDistance=36;controls.maxPolarAngle=Math.PI*.485;
 scene.add(new THREE.HemisphereLight(0xb6dbff,0x102035,2));
 const key=new THREE.DirectionalLight(0xd0e7ff,3.5);key.position.set(-3,20,9);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-16,right:16,top:14,bottom:-14,near:1,far:55});key.shadow.bias=-.0005;scene.add(key);
 const rim=new THREE.DirectionalLight(0x62dddf,2.5);rim.position.set(2,4,-7);scene.add(rim);
 const physical=new THREE.Group(),chip=new THREE.Group();scene.add(physical,chip);chip.visible=false;
 const materialCache=new Map();function mat(color,metalness=.6,roughness=.4){const k=`${color}-${metalness}-${roughness}`;if(!materialCache.has(k))materialCache.set(k,new THREE.MeshStandardMaterial({color,metalness,roughness}));return materialCache.get(k);}
 function mesh(geo,color,parent,x=0,y=0,z=0,metal=.6){const o=new THREE.Mesh(geo,mat(color,metal));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(parent,size,pos,color=C.steel,metal=.6){return mesh(new THREE.BoxGeometry(...size),color,parent,...pos,metal);}
 function cyl(parent,r,h,pos,color=C.steel,r2=r){return mesh(new THREE.CylinderGeometry(r,r2,h,48),color,parent,...pos);}
 function glowBox(parent,size,pos,color=C.cyan,opacity=1){const m=box(parent,size,pos,color,0);m.material=new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:opacity===1});return m;}
 const selectable=[],groups={},labels=[],paths=[];
 function group(id,parent=physical){const g=new THREE.Group();g.userData.part=id;parent.add(g);groups[id]=g;selectable.push(g);return g;}
 function label(id,text,p,parent=physical){const el=document.createElement('button');el.className='part-label';el.textContent=text;el.onclick=()=>onSelect(id);host.querySelector('#labels').appendChild(el);labels.push({id,el,p:new THREE.Vector3(...p),parent});}
 function text(parent,str,pos,size=.22,color='#bdd9eb',width=3.5){const c=document.createElement('canvas');c.width=768;c.height=128;const ctx=c.getContext('2d');ctx.font='500 53px Segoe UI, Microsoft YaHei';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(str,384,80);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false}));s.position.set(...pos);s.scale.set(width,size*2,1);parent.add(s);return s;}
 function wire(parent,points,color=C.cyan,radius=.025,packets=true){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'catmullrom',.2);const o=new THREE.Mesh(new THREE.TubeGeometry(curve,64,radius,7,false),mat(color,.25,.5));parent.add(o);if(packets){const dots=[];for(let j=0;j<3;j++){const dot=new THREE.Mesh(new THREE.SphereGeometry(radius*2.5,8,8),new THREE.MeshBasicMaterial({color}));parent.add(dot);dots.push(dot);}parent.add(new THREE.ArrowHelper(curve.getTangentAt(.58).normalize(),curve.getPointAt(.58),.4,color,.17,.12));paths.push({curve,dots,parent});}return o;}
 const floor=mesh(new THREE.PlaneGeometry(100,100),0x101d2b,scene,0,-.11,0,.15);floor.rotation.x=-Math.PI/2;
 const grid=new THREE.GridHelper(70,70,0x294052,0x1b2c3c);grid.position.y=-.09;grid.material.transparent=true;grid.material.opacity=.65;scene.add(grid);
 // Actual 2026-10-30 SolidWorks assembly; no procedural stand-in machinery.
 const cad=buildCadAssembly(physical);Object.assign(groups,cad.groups);selectable.push(...Object.values(cad.groups));
 const {belt,feeder,chute,motor,camera:cam,light:lights,board,collector}=cad.groups;
 label('belt','03  铝型材 / 滚轴输送带',[3.6,4,2.6]);
 label('feeder','01  直线振动送料槽',[-9,5,0]);label('chute','02  波纹导流出口',[-5.7,4.15,-1.1]);
 label('motor','减速电机 / 齿轮传动',[-6.6,3.5,4.7]);label('collector','尾端接料盒',[6.5,3.8,1.8]);
 label('camera','05  相机 / 独立升降支架',[0,11.9,-1.6]);label('light','06  双侧条灯 / 伸缩支架',[2.4,8.65,0]);
 label('board','07  PYNQ-Z2 / 原装配位置',[0,1.25,-4.1]);
 const surfaceY=beltHeight(0)+.025;
 const footprint=[[-1.8,surfaceY,-FOV_HEIGHT/2],[1.8,surfaceY,-FOV_HEIGHT/2],[1.8,surfaceY,FOV_HEIGHT/2],[-1.8,surfaceY,FOV_HEIGHT/2]];
 const tip=[0,11.015,-1.627],coneVertices=[];
 for(let i=0;i<4;i++)coneVertices.push(...tip,...footprint[i],...footprint[(i+1)%4]);
 const cone=new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(coneVertices,3)),new THREE.MeshBasicMaterial({color:C.cyan,transparent:true,opacity:.025,side:THREE.DoubleSide,depthWrite:false}));physical.add(cone);
 physical.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(footprint.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color:C.cyan})));
 glowBox(physical,[.025,.012,FOV_HEIGHT],[0,surfaceY,0],C.gold);text(physical,'COUNT LINE',[0,surfaceY+.25,1.7],.12,'#e8bd7e',1.8);
 // These display/power/data overlays are instructional additions, not CAD parts.
 const power=group('power');power.position.set(-3,.5,-5.7);box(power,[1.5,.65,1.1],[0,0,0],0x2d4356);for(let i=0;i<7;i++)box(power,[.9,.015,.035],[0,.34,-.4+i*.13],0x101c29);glowBox(power,[.07,.06,.07],[.5,.1,.56]);label('power','供电 / 控制 · 示意',[-3,1.4,-5.7]);
 const mon=group('monitor');mon.position.set(9.6,0,-4.8);box(mon,[.25,1.3,.25],[0,.8,0]);box(mon,[2,.12,1],[0,.08,.2]);box(mon,[3.6,2.65,.18],[0,2.7,0],0x121d29);const screenTexture=new THREE.CanvasTexture(monitorCanvas);screenTexture.colorSpace=THREE.SRGBColorSpace;const screen=new THREE.Mesh(new THREE.PlaneGeometry(3.3,2.38),new THREE.MeshBasicMaterial({map:screenTexture}));screen.position.set(0,2.7,.102);mon.add(screen);mon.rotation.y=-.35;label('monitor','HDMI 显示 · 示意',[9.6,4.3,-4.8]);
 const cableHarness=createCableHarness(physical);
 text(physical,'BASELINE USB / MJPEG',[1.15,7,-6.85],.14,'#80baff',2.5);text(physical,'HDMI · 示意',[6,.65,-7.05],.12,'#bba4f6',2.3);
 const nutGeo=createNutGeometry();
 const nutPool=[];for(let i=0;i<MAX_QUANTITY;i++){const n=new THREE.Mesh(nutGeo,mat(0xc8d2db,.9,.26));n.userData.part='nut';physical.add(n);nutPool.push(n);selectable.push(n);}
 // Expanded chip: logical topology, not physical silicon floorplan.
 box(chip,[14,.14,7],[0,.1,0],0x122638,.25);for(const z of [-3.5,3.5])glowBox(chip,[14,.035,.025],[0,.19,z],C.cyan,.5);
 const nodes=[['capture','ACQUIRE / DECODE',[-5,0,-2.5],[2.4,.6,1],C.gold],['gray','GRAY8',[-2,0,-2.5],[2,.6,1],C.purple],['roi','ROI',[.8,0,-2.5],[2,.6,1],C.purple],['threshold','THRESHOLD',[3.6,0,-2.5],[2.4,.6,1],C.purple],['morph','3x3 MORPH',[3.6,0,0],[2.4,.6,1],C.purple],['rle','RLE',[.8,0,0],[2,.6,1],C.purple],['tracking','PS RLE / TRACK',[-2.4,0,0],[2.7,.6,1],C.blue],['ps','PS CONTROL',[-5.3,0,0],[2,.6,1],C.blue],['overlay','PL OVERLAY',[2.7,0,2.6],[3,.6,1],C.gold],['web','WEB AUX',[-2.4,0,2.6],[2.5,.6,1],C.blue]];
 for(const [id,title,pos,size,color]of nodes){const g=group(id,chip);g.position.set(pos[0],.5,pos[2]);box(g,size,[0,0,0],0x234052);glowBox(g,[size[0]-.1,.035,.055],[0,size[1]/2+.02,size[2]/2-.04],color);text(g,title,[0,.65,0],.15,`#${color.toString(16)}`,size[0]+.3);label(id,parts[id].name,[pos[0],1.8,pos[2]],chip);for(let j=0;j<7;j++)box(g,[.07,.07,.14],[-size[0]/2+.2+j*.25,0,-size[2]/2-.06],C.gold);}
 for(let r=0;r<3;r++)for(let c=0;c<16;c++)glowBox(groups.morph,[.1,.025,.09],[-.97+c*.125,.34,-.35+r*.18],r===1?C.cyan:C.purple,.65);
 const route=[[-5,.96,-2.5],[-2,.96,-2.5],[.8,.96,-2.5],[3.6,.96,-2.5],[3.6,.96,0],[.8,.96,0],[-2.4,.96,0]];
 for(let i=0;i<route.length-1;i++)wire(chip,[route[i],route[i+1]],C.cyan,.035);
 wire(chip,[[-2,.96,-2.5],[-2,1.7,-1.2],[5.8,1.7,-1.2],[5.8,1.7,2.6],[2.7,.96,2.6]],C.purple,.035);
 wire(chip,[[-2.4,.96,0],[-2.4,1.2,1.3],[2.7,1.2,1.3],[2.7,.96,2.6]],C.blue,.025);
 wire(chip,[[-2.4,.96,0],[-2.4,.96,2.6]],C.blue,.025);
 text(chip,'GRAY VIDEO + PS METADATA → PL OVERLAY → VDMA / HDMI',[0,.3,4.2],.13,'#d9b97c',10);
 text(chip,'TARGET / INTEGRATION · NOT B2 ACCEPTANCE',[0,.3,-3.7],.13,'#d9b97c',9);
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null,focus=null,view='overview',highlight=null;
 renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
 renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(selectable,true).filter(h=>{let p=h.object;while(p){if(!p.visible)return false;p=p.parent;}return true;});if(hits.length){let o=hits[0].object;while(!o.userData.part&&o.parent)o=o.parent;const id=o.userData.part;if(id==='nut')onSelect('tracking');else onSelect(id);}});
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(host);resize();
 function setView(v){view=v;physical.visible=v!=='fpga';chip.visible=v==='fpga';for(const l of labels)l.el.hidden=(l.parent===chip)!==(v==='fpga');if(highlight){scene.remove(highlight);highlight.geometry.dispose();highlight.material.dispose();highlight=null;}
  const poses={overview:[[18,19,-25],[-1,4,0]],camera:[[.02,11,.01],[0,3.4,0]],fpga:[[10,12,14],[0,.3,.2]],exploded:[[20,22,-27],[-1,5,0]]};const [p,t]=poses[v];focus={p:new THREE.Vector3(...p),t:new THREE.Vector3(...t)};
  controls.maxDistance=v==='fpga'?36:65;
 }
 function select(id){if(highlight){scene.remove(highlight);highlight.geometry.dispose();highlight.material.dispose();}const obj=groups[id];highlight=obj&&((view==='fpga')===(obj.parent===chip))?new THREE.BoxHelper(obj,C.cyan):null;if(highlight)scene.add(highlight);}
 function update(sim,delta){
  if(focus){camera.position.lerp(focus.p,Math.min(1,delta*6));controls.target.lerp(focus.t,Math.min(1,delta*6));if(camera.position.distanceTo(focus.p)<.02)focus=null;}
  controls.update(delta);
  const expanded=view==='exploded';cad.lifts.camera.position.y=THREE.MathUtils.damp(cad.lifts.camera.position.y,expanded?2:0,6,delta);lights.position.y=THREE.MathUtils.damp(lights.position.y,expanded?1:0,6,delta);board.position.y=THREE.MathUtils.damp(board.position.y,0,6,delta);collector.position.x=THREE.MathUtils.damp(collector.position.x,expanded?1:0,6,delta);
  cableHarness.update({camera:cad.lifts.camera.position.y,light:lights.position.y,board:board.position.y},sim.time);
  cad.moving.feederTray.position.y=Math.sin(sim.time*40)*.014;
  const queued=sim.nuts.filter(n=>n.stage==='bowl'),shown=new Set(queued.slice(0,12).map(n=>n.index));
  for(const n of sim.nuts){const m=nutPool[n.index];m.visible=n.stage!=='out'&&(n.stage!=='bowl'||shown.has(n.index));
   if(n.stage==='bowl'){
    const progress=THREE.MathUtils.clamp((n.x+6)/.7,0,1),waiting=queued.indexOf(n),x=progress>0?THREE.MathUtils.lerp(-8.8,-5.3,progress):-9.9+Math.floor(waiting/4)*.5,z=progress>0?n.y:(waiting%4-1.5)*.52;
    m.position.set(x,trayHeight(x)+.025+cad.moving.feederTray.position.y,z);m.rotation.y=n.rotation;
   }else{const height=n.x< -5.3?trayHeight(n.x):n.x< -4.8?THREE.MathUtils.lerp(trayHeight(-5.3),beltHeight(n.x),(n.x+5.3)/.5):n.x>6.5?THREE.MathUtils.lerp(beltHeight(n.x),.35,THREE.MathUtils.clamp((n.x-6.5)/.7,0,1)):beltHeight(n.x);const trayWeight=THREE.MathUtils.clamp((-4.8-n.x)/.5,0,1);m.position.set(n.x,height+.025+cad.moving.feederTray.position.y*trayWeight,n.y);m.rotation.y=n.rotation;}}
  for(let i=sim.nuts.length;i<nutPool.length;i++)nutPool[i].visible=false;
  cad.rotors.forEach(r=>r.rotation.z=sim.distance/1.15);
  for(const p of paths)if(p.parent.visible)p.dots.forEach((d,i)=>d.position.copy(p.curve.getPointAt((sim.time*.32+i/3)%1)));
  if(highlight)highlight.update();
  for(const l of labels){const active=l.parent===chip?view==='fpga':view!=='fpga';if(!active){l.el.hidden=true;continue;}const v=l.p.clone();if(l.parent!==chip&&cad.groups[l.id])v.add(cad.groups[l.id].position);if(l.id==='camera')v.add(cad.lifts.camera.position);v.project(camera);l.el.hidden=v.z< -1||v.z>1||v.x< -1||v.x>1||v.y< -1||v.y>1;l.el.style.left=`${(v.x+1)*.5*host.clientWidth}px`;l.el.style.top=`${(1-v.y)*.5*host.clientHeight}px`;}
  renderer.render(scene,camera);
 }
 controls.addEventListener('start',()=>focus=null);
 return{update,setView,select,renderer,scene,camera,cadMetadata,invalidateScreen:()=>{screenTexture.needsUpdate=true;}};
}
