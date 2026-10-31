import * as THREE from 'three';

// External teaching harness: orthogonal runs, with no spline overshoot.
// High runs follow the outside of a stand; low runs stay outside its feet.
export function cableRoutes({camera=0,light=0,board=0}={}){
 const b=board,c=camera,l=light;
 const routes=[
  {id:'usb',color:0x5baeff,radius:.025,points:[[-1.15,.82+b,-2.92],[-1.8,.82+b,-2.92],[-1.8,.12,-2.92],[-1.8,.12,-6.85],[.78,.12,-6.85],[.78,11.15+c,-6.85],[.78,11.15+c,-1.63],[.54,11.15+c,-1.63]]},
  {id:'hdmi',color:0xb091fa,radius:.03,points:[[-1.15,.85+b,-3.37],[-1.98,.85+b,-3.37],[-1.98,.16,-3.37],[-1.98,.16,-7.05],[10.3,.16,-7.05],[10.3,2.7,-7.05],[10.3,2.7,-5.1],[9.65,2.7,-5.1]]},
  {id:'board-power',color:0xd8aa65,radius:.02,points:[[-2.18,.5,-5.7],[-1.65,.5,-5.7],[-1.65,1.05+b,-5.7],[-1.65,1.05+b,-2.05],[.72,1.05+b,-2.05],[.72,.82+b,-2.05]]},
  {id:'motor-power',color:0xd8aa65,radius:.022,points:[[-3.8,.45,-5.7],[-3.85,.45,-5.7],[-3.85,.13,-5.7],[-3.85,.13,5.45],[-7.2,.13,5.45],[-7.2,2.5,5.45],[-7.2,2.5,5.12]]},
  {id:'feeder-power',color:0xd8aa65,radius:.022,points:[[-3.8,.5,-5.85],[-11.6,.5,-5.85],[-11.6,.5,-1],[-11.6,.85,-1],[-11.25,.85,-1]]},
  {id:'light-left',color:0xd8aa65,radius:.02,points:[[-3.3,.5,-6.3],[-3.3,.12,-6.3],[-3.05,.12,-6.3],[-3.05,.12,-3.65],[-3.05,8.3+l,-3.65],[-2.15,8.3+l,-3.65],[-2.15,8.3+l,0],[-2.15,8.13+l,0]]},
  {id:'light-right',color:0xd8aa65,radius:.02,points:[[-2.8,.5,-6.3],[-2.8,.12,-6.3],[-2.8,.12,-7.25],[3.05,.12,-7.25],[3.05,.12,-3.65],[3.05,8.45+l,-3.65],[2.15,8.45+l,-3.65],[2.15,8.45+l,0],[2.15,8.13+l,0]]},
  {id:'motor-control',color:0x5ee8cf,radius:.016,points:[[-1.15,.88+b,-4.45],[-2.05,.88+b,-4.45],[-2.05,.2,-4.45],[-3.65,.2,-4.45],[-3.65,.2,5.65],[-7.45,.2,5.65],[-7.45,2.5,5.65],[-7.45,2.5,5.12]]},
 ];
 // Captured image packets travel from the camera to PS, unlike power/control.
 routes.find(route=>route.id==='usb').points.reverse();
 return routes;
}

export function createCableHarness(parent){
 const harness=new THREE.Group();harness.name='external-cable-harness';parent.add(harness);
 const cylinder=new THREE.CylinderGeometry(1,1,1,8),sphere=new THREE.SphereGeometry(1,8,6);
 const lines=cableRoutes().map(route=>{
  const group=new THREE.Group();group.name=route.id;harness.add(group);
  const material=new THREE.MeshStandardMaterial({color:route.color,metalness:.25,roughness:.5});
  const vectors=route.points.map(p=>new THREE.Vector3(...p)),curve=new THREE.CurvePath();
  for(let i=1;i<vectors.length;i++)curve.add(new THREE.LineCurve3(vectors[i-1],vectors[i]));
  const segments=vectors.slice(1).map(()=>{const m=new THREE.Mesh(cylinder,material);group.add(m);return m;});
  const joints=vectors.map(()=>{const m=new THREE.Mesh(sphere,material);m.scale.setScalar(route.radius);group.add(m);return m;});
  // Small sockets make schematic cable endpoints clear without entering solids.
  for(const i of [0,joints.length-1])joints[i].scale.setScalar(route.radius*1.8);
  const dots=Array.from({length:3},()=>{const m=new THREE.Mesh(sphere,new THREE.MeshBasicMaterial({color:route.color}));m.scale.setScalar(route.radius*1.9);group.add(m);return m;});
  const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,1,0),new THREE.Vector3(),.27,route.color,.1,.065);group.add(arrow);
  return {...route,vectors,curve,segments,joints,dots,arrow};
 });
 let previous='';const axis=new THREE.Vector3(0,1,0),direction=new THREE.Vector3();
 function update(offsets,time){
  const key=JSON.stringify(offsets);
  if(key!==previous){
   const routes=cableRoutes(offsets);
   lines.forEach((line,k)=>{
    line.vectors.forEach((v,i)=>{v.fromArray(routes[k].points[i]);line.joints[i].position.copy(v);});
    line.segments.forEach((mesh,i)=>{const a=line.vectors[i],b=line.vectors[i+1];direction.subVectors(b,a);mesh.position.addVectors(a,b).multiplyScalar(.5);mesh.scale.set(line.radius,direction.length(),line.radius);mesh.quaternion.setFromUnitVectors(axis,direction.normalize());});
    line.curve.updateArcLengths();line.arrow.position.copy(line.curve.getPointAt(.58));line.arrow.setDirection(line.curve.getTangentAt(.58));
   });
   previous=key;
  }
  for(const line of lines)line.dots.forEach((dot,i)=>dot.position.copy(line.curve.getPointAt((time*.2+i/3)%1)));
 }
 update({camera:0,light:0,board:0},0);
 return {update,lines,group:harness};
}
