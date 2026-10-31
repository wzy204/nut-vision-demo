import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Matrix4, Vector3, Box3, BufferGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial, Raycaster, DoubleSide } from 'three';

const directory='cad-work/assembly';
const input=JSON.parse(await fs.readFile(path.join(directory,'assembly.json'),'utf8'));
const unit=24;
const normalization=new Matrix4().set(0,0,unit,-.15*unit, 0,unit,0,.1042*unit, -unit,0,0,.12925*unit, 0,0,0,1);
function matrix(a){const s=a[12];return normalization.clone().multiply(new Matrix4().set(a[0]*s,a[3]*s,a[6]*s,a[9],a[1]*s,a[4]*s,a[7]*s,a[10],a[2]*s,a[5]*s,a[8]*s,a[11],0,0,0,1));}
function role(name){
 if(name.includes('PYNQ_'))return 'board';
 if(name.includes('摄像头'))return 'camera';
 if(name.includes('灯')||/支架-伸缩/.test(name))return 'light';
 if(name.includes('振动盘完整模型'))return 'feeder';
 if(name.includes('尾端装料盒'))return 'collector';
 if(name.includes('电机+直臂'))return 'motor';
 return 'belt';
}
const geometries=[],raw=[];
for(const m of input.meshes){
 const binary=await fs.readFile(path.join(directory,m.file));
 const positions=new Float32Array(binary.buffer,binary.byteOffset,binary.byteLength/4).slice();raw.push(positions);
 const position=[],normal=[],index=[],seen=new Map();
 const a=new Vector3(),b=new Vector3(),c=new Vector3(),n=new Vector3();
 for(let i=0;i<positions.length;i+=9){
  a.fromArray(positions,i);b.fromArray(positions,i+3);c.fromArray(positions,i+6);n.subVectors(b,a).cross(c.clone().sub(a)).normalize();
  for(let j=0;j<3;j++){
   const p=Array.from(positions.slice(i+j*3,i+j*3+3));
   const q=p.map((v,k)=>Math.round((v-m.min[k])/(m.max[k]-m.min[k]||1)*65535));
   const nn=[n.x,n.y,n.z].map(v=>Math.round(v*127));const key=q.join(',')+':'+nn.join(',');
   let vertex=seen.get(key);if(vertex===undefined){vertex=position.length/3;seen.set(key,vertex);position.push(...q);normal.push(...nn);}index.push(vertex);
  }
 }
 const indices=position.length/3<65536?new Uint16Array(index):new Uint32Array(index);
 geometries.push({name:m.name,min:m.min,max:m.max,position:Buffer.from(new Uint16Array(position).buffer).toString('base64'),normal:Buffer.from(new Int8Array(normal).buffer).toString('base64'),index:Buffer.from(indices.buffer).toString('base64'),indexBytes:indices.BYTES_PER_ELEMENT,vertices:position.length/3,triangles:index.length/3});
}
const bounds=new Box3(),groupBounds={},instances=[];let maxBoxEscape=0;
for(const instance of input.instances){
 const transform=matrix(instance.transform),box=new Box3(),data=raw[instance.mesh];
 for(let i=0;i<data.length;i+=3)box.expandByPoint(new Vector3().fromArray(data,i).applyMatrix4(transform));
 const id=role(instance.name),isReferenceNut=/螺母/.test(instance.name);
 if(!isReferenceNut){bounds.union(box);(groupBounds[id]??=new Box3()).union(box);}
 // Official component bounding boxes are approximate; transformed mesh must fit them.
 const sourceMatrix=normalization.clone().invert().multiply(transform);
 if(instance.box)for(let i=0;i<data.length;i+=3){const p=new Vector3().fromArray(data,i).applyMatrix4(sourceMatrix);for(let k=0;k<3;k++)maxBoxEscape=Math.max(maxBoxEscape,instance.box[k]-p.getComponent(k),p.getComponent(k)-instance.box[k+3]);}
 instances.push({name:instance.name,mesh:instance.mesh,role:id,matrix:transform.toArray(),color:instance.color?.slice(0,3),referenceNut:isReferenceNut,rotor:/滚轴.*(?:滚轴1|圆柱齿轮)/.test(instance.name),bounds:[box.min.toArray(),box.max.toArray()]});
}
const beltInstance=instances.find(i=>i.name==='传送带-1');
const beltGeometry=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(raw[beltInstance.mesh],3));
const beltMesh=new Mesh(beltGeometry,new MeshBasicMaterial({side:DoubleSide}));beltMesh.applyMatrix4(new Matrix4().fromArray(beltInstance.matrix));beltMesh.updateMatrixWorld(true);
const ray=new Raycaster();
function surface(x,z=0){ray.set(new Vector3(x,30,z),new Vector3(0,-1,0));return ray.intersectObject(beltMesh)[0]?.point.y;}
const surface0=surface(0),surface1=surface(1);if(surface0===undefined||surface1===undefined)throw new Error('Could not locate real belt upper surface');
const trayInstance=instances.find(i=>i.mesh===35);
const trayMesh=new Mesh(new BufferGeometry().setAttribute('position',new Float32BufferAttribute(raw[35],3)),new MeshBasicMaterial({side:DoubleSide}));trayMesh.applyMatrix4(new Matrix4().fromArray(trayInstance.matrix));trayMesh.updateMatrixWorld(true);
const trayProfile=[];for(let i=0;i<=12;i++){const x=-10+i*.4;ray.set(new Vector3(x,30,0),new Vector3(0,-1,0));const hit=ray.intersectObject(trayMesh)[0];if(hit)trayProfile.push([x,hit.point.y]);}
const sourceFiles=[...new Set(input.meshes.map(m=>m.path).filter(p=>!p.includes('\\Temp\\'))),input.source];
const sourceHashes=[];for(const file of sourceFiles){const bytes=await fs.readFile(file);sourceHashes.push({file:path.win32.basename(file),sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
const output={version:1,source:'传送带完整模型.SLDASM',exported:'2026-10-30',sdk:input.revision,unitScale:unit,sourceUnits:'metres',geometries,instances,bounds:[bounds.min.toArray(),bounds.max.toArray()],groups:Object.fromEntries(Object.entries(groupBounds).map(([k,b])=>[k,[b.min.toArray(),b.max.toArray()]])),beltSurface:{y:surface0,slopeX:surface1-surface0},trayProfile,sourceHashes,exportErrors:input.errors,exportWarnings:input.warnings,omissions:input.failures,maxBoxEscape};
if(maxBoxEscape>.002)throw new Error('Assembly transform validation failed: '+maxBoxEscape);
await fs.mkdir('src/assets',{recursive:true});await fs.writeFile('src/assets/cad-assembly.json',JSON.stringify(output));
const nutPositions=raw[42];let outerRadius=0,holeRadius=Infinity,angle=0;
for(let i=0;i<nutPositions.length;i+=3){const r=Math.hypot(nutPositions[i],nutPositions[i+2]);if(r>outerRadius){outerRadius=r;angle=Math.atan2(nutPositions[i+2],nutPositions[i]);}holeRadius=Math.min(holeRadius,r);}
angle=((angle+Math.PI*4+Math.PI/6)%(Math.PI/3))-Math.PI/6;
await fs.writeFile('src/assets/cad-nut.json',JSON.stringify({source:'螺母.SLDPRT',outerRadius,holeRadius,angle,positions:Buffer.from(nutPositions.buffer).toString('base64')}));
console.log(JSON.stringify({uniqueMeshes:geometries.length,instances:instances.length,triangles:geometries.reduce((a,g)=>a+g.triangles,0),bounds:output.bounds,groups:output.groups,beltSurface:output.beltSurface,trayProfile,maxBoxEscape,assetBytes:(await fs.stat('src/assets/cad-assembly.json')).size},null,2));
