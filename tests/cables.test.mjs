import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCadAssembly} from '../src/cad-model.js';
import {cableRoutes,createCableHarness} from '../src/cable-routes.js';

test('外部线束在装配、剖视及过渡位置均避开 CAD 实体（含线径与光点间隙）',()=>{
 const root=new THREE.Group(),cad=buildCadAssembly(root),solids=[];
 const doubleSide=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
 root.traverse(o=>{if(o.isMesh&&o.userData.cadSource)solids.push(o);});
 const ray=new THREE.Raycaster(),a=new THREE.Vector3(),b=new THREE.Vector3(),direction=new THREE.Vector3(),normal=new THREE.Vector3(),binormal=new THREE.Vector3();
 const failures=[];
 for(const t of [0,.25,.5,.75,1]){
  const offsets={camera:2*t,light:t,board:0};
  cad.lifts.camera.position.y=offsets.camera;cad.groups.light.position.y=offsets.light;cad.groups.board.position.y=offsets.board;root.updateMatrixWorld(true);
  const obstacles=solids.map(o=>{const m=new THREE.Mesh(o.geometry,doubleSide);m.matrixWorld.copy(o.matrixWorld);return m;});
  for(const line of cableRoutes(offsets))for(let i=1;i<line.points.length;i++){
   a.fromArray(line.points[i-1]);b.fromArray(line.points[i]);direction.subVectors(b,a).normalize();
   normal.crossVectors(direction,Math.abs(direction.y)<.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0)).normalize();binormal.crossVectors(direction,normal);
   for(let k=-1;k<8;k++){
    const origin=a.clone();if(k>=0)origin.addScaledVector(normal,Math.cos(k*Math.PI/4)*line.radius*2).addScaledVector(binormal,Math.sin(k*Math.PI/4)*line.radius*2);
    ray.set(origin,direction);ray.near=.0001;ray.far=a.distanceTo(b)-.0001;
    for(let j=0;j<obstacles.length;j++)if(ray.intersectObject(obstacles[j],false).length){failures.push(`${line.id} segment ${i}, transition ${t}: ${solids[j].name}`);break;}
   }
  }
 }
 assert.deepEqual([...new Set(failures)],[]);
});

test('线束端点、光点路径随剖视位移更新，直段不会产生样条外摆',()=>{
 const harness=createCableHarness(new THREE.Group()),offsets={camera:2,light:1,board:0};harness.update(offsets,1);
 for(const [i,line]of harness.lines.entries()){
  const route=cableRoutes(offsets)[i];assert.deepEqual(line.vectors.map(v=>v.toArray()),route.points);
  for(const segment of line.segments)assert.ok(segment.scale.y>0);
  for(const dot of line.dots)assert.ok(dot.position.toArray().every(Number.isFinite));
  const midpoint=line.curve.curves[0].getPoint(.5),expected=line.vectors[0].clone().lerp(line.vectors[1],.5);assert.ok(midpoint.distanceTo(expected)<1e-10);
 }
});
