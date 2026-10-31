import * as THREE from 'three';
import data from './assets/cad-assembly.json' with {type:'json'};
import { decodeCadGeometry } from './cad-geometry.js';

export const cadMetadata={source:data.source,instances:data.instances.length,meshes:data.geometries.length,bounds:data.bounds,belt:data.beltSurface};
export const beltHeight=x=>data.beltSurface.y+data.beltSurface.slopeX*x;
export function trayHeight(x){
 const p=data.trayProfile;
 if(x<=p[0][0])return p[0][1];
 for(let i=1;i<p.length;i++)if(x<=p[i][0])return THREE.MathUtils.lerp(p[i-1][1],p[i][1],(x-p[i-1][0])/(p[i][0]-p[i-1][0]));
 return THREE.MathUtils.lerp(p.at(-1)[1],beltHeight(x),THREE.MathUtils.clamp((x-p.at(-1)[0])/.8,0,1));
}

export function buildCadAssembly(parent){
 const groups={},geometries=data.geometries.map(decodeCadGeometry),rotors=[],materials=new Map();
 const group=id=>groups[id]??=(()=>{const g=new THREE.Group();g.name=id;g.userData.part=id;parent.add(g);return g;})();
 const cameraLift=new THREE.Group();cameraLift.name='camera-upper-exploded';group('camera').add(cameraLift);
 function material(instance){
  const name=instance.name,role=instance.role;
  let color=new THREE.Color().fromArray(instance.color??[.8,.8,.8]);
  if(color.r>.97&&color.g>.97&&color.b>.97)color.setHex(0xb5c2cf);
  if(role==='belt'&&name==='传送带-1')color.setHex(0x172129);
  if(role==='board')color.setHex(/PCB/.test(name)?0xc43f59:/PinH/.test(name)?0x23333e:0x9eafbb);
  if(role==='camera'&&!/支架/.test(name))color.setHex(0x254f64);
  if(role==='motor'&&/电机-/.test(name))color.setHex(0x3d647c);
  if(role==='feeder'&&/零件4|电机/.test(name))color.setHex(0x38556c);
  const key=color.getHexString();
  if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,metalness:role==='belt'&&name==='传送带-1'?.05:.6,roughness:.42}));
  return materials.get(key);
 }
 for(const instance of data.instances){
  if(instance.referenceNut)continue;
  const geometry=geometries[instance.mesh],o=new THREE.Mesh(geometry,material(instance));
  o.name=instance.name;o.userData.part=instance.role;o.userData.cadSource=data.geometries[instance.mesh].name;
  o.castShadow=true;o.receiveShadow=true;o.matrix.fromArray(instance.matrix);o.matrixAutoUpdate=false;
  if(instance.rotor){
   const pivot=new THREE.Group(),center=new THREE.Box3(new THREE.Vector3(...instance.bounds[0]),new THREE.Vector3(...instance.bounds[1])).getCenter(new THREE.Vector3());
   pivot.position.copy(center);o.matrix.premultiply(new THREE.Matrix4().makeTranslation(-center.x,-center.y,-center.z));pivot.add(o);group(instance.role).add(pivot);rotors.push(pivot);
  }else if(instance.role==='camera'&&/摄像头-1$|摄像头支架上部-1$/.test(instance.name))cameraLift.add(o);
  else group(instance.role).add(o);
  // Thin edges retain CAD holes and slots without a heavy wireframe overlay.
  if(instance.role!=='board'){
   const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,35),new THREE.LineBasicMaterial({color:0x345068,transparent:true,opacity:.28}));o.add(edges);
  }
 }
 const bounds=Object.fromEntries(Object.entries(data.groups).map(([id,b])=>[id,new THREE.Box3(new THREE.Vector3(...b[0]),new THREE.Vector3(...b[1]))]));
 // The feed chute is integrated into the supplied tray; pick only its outlet.
 const chute=group('chute');const hit=new THREE.Mesh(new THREE.BoxGeometry(1,.16,2.6),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.set(-5.8,3.55,0);chute.add(hit);
 return {groups,bounds,rotors,geometries,lifts:{camera:cameraLift}};
}
