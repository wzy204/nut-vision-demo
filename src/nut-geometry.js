import { BufferGeometry, Float32BufferAttribute } from 'three';
import nut from './assets/cad-nut.json' with {type:'json'};
import { NUT_OUTER_RADIUS } from './nut.js';
import { bytes } from './cad-geometry.js';

// Actual CAD nut, yaw-aligned and uniformly enlarged for the pixel lesson.
export function createNutGeometry(){
 const positions=new Float32Array(bytes(nut.positions).buffer);
 const geometry=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(positions,3));
 geometry.rotateY(nut.angle);geometry.scale(...Array(3).fill(NUT_OUTER_RADIUS/nut.outerRadius));
 geometry.computeVertexNormals();return geometry;
}
