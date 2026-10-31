import { BufferGeometry, BufferAttribute, Float32BufferAttribute } from 'three';

export function bytes(base64){return Uint8Array.from(atob(base64),c=>c.charCodeAt(0));}
export function decodeCadGeometry(data){
 const q=new Uint16Array(bytes(data.position).buffer),positions=new Float32Array(q.length);
 for(let i=0;i<q.length;i++){const axis=i%3;positions[i]=data.min[axis]+q[i]/65535*(data.max[axis]-data.min[axis]);}
 const indexBytes=bytes(data.index),indices=data.indexBytes===2?new Uint16Array(indexBytes.buffer):new Uint32Array(indexBytes.buffer);
 const geometry=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(positions,3));
 geometry.setAttribute('normal',new BufferAttribute(new Int8Array(bytes(data.normal).buffer),3,true));geometry.setIndex(new BufferAttribute(indices,1));
 geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}
