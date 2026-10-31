import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import data from '../src/assets/cad-assembly.json' with {type:'json'};
import {decodeCadGeometry} from '../src/cad-geometry.js';
import {buildCadAssembly,beltHeight,trayHeight} from '../src/cad-model.js';

test('CAD 转换完整：83 实例、52 网格，源装配无缺件且坐标变换通过原边界检查',()=>{
 assert.equal(data.instances.length,83);assert.equal(data.geometries.length,52);
 assert.equal(data.exportErrors,0);assert.equal(data.exportWarnings,0);assert.equal(data.omissions.length,0);
 assert.ok(data.maxBoxEscape<1e-6);assert.ok(data.sourceHashes.length>0);
 for(const g of data.geometries){
  const geo=decodeCadGeometry(g),p=geo.attributes.position,n=geo.attributes.normal,ix=geo.index;
  assert.equal(ix.count,g.triangles*3);assert.equal(p.count,g.vertices);assert.equal(n.count,p.count);
  for(let i=0;i<ix.count;i++)assert.ok(ix.getX(i)<p.count);
  for(let i=0;i<p.count;i++)for(let a=0;a<3;a++)assert.ok(Number.isFinite(p.array[i*3+a]));
  geo.dispose();
 }
});
test('运行时 CAD 位置与导出包一致，带面和料槽高度来自实际网格',()=>{
 const root=new THREE.Group(),cad=buildCadAssembly(root);root.updateMatrixWorld(true);
 for(const id of ['feeder','belt','motor','camera','light','board','collector','chute'])assert.ok(cad.groups[id]);
 const meshes=[];root.traverse(o=>{if(o.isMesh&&o.userData.cadSource)meshes.push(o);});
 assert.equal(meshes.length,data.instances.filter(i=>!i.referenceNut).length);
 for(const instance of data.instances.filter(i=>!i.referenceNut)){
  const mesh=meshes.find(m=>m.name===instance.name);assert.ok(mesh,instance.name);
  const box=new THREE.Box3(),p=mesh.geometry.attributes.position,v=new THREE.Vector3();
  for(let j=0;j<p.count;j++)box.expandByPoint(v.fromBufferAttribute(p,j).applyMatrix4(mesh.matrixWorld));
  for(let a=0;a<3;a++){
   assert.ok(Math.abs(box.min.getComponent(a)-instance.bounds[0][a])<.001,instance.name);
   assert.ok(Math.abs(box.max.getComponent(a)-instance.bounds[1][a])<.001,instance.name);
  }
 }
 const belt=meshes.find(o=>o.name==='传送带-1'),ray=new THREE.Raycaster();
 for(const x of [-4,0,4]){ray.set(new THREE.Vector3(x,30,0),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(belt)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-beltHeight(x))<.001);}
 assert.ok(trayHeight(-9)>beltHeight(0));assert.ok(cad.rotors.length>=2);
});
