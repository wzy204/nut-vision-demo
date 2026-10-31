// One physical definition shared by the mesh, transport layout and camera raster.
import cadNut from './assets/cad-nut.json' with {type:'json'};
export const NUT_RADIUS = .22;
export const NUT_BEVEL = .012;
export const NUT_APOTHEM = NUT_RADIUS * Math.cos(Math.PI / 6) + NUT_BEVEL;
export const NUT_OUTER_RADIUS = NUT_APOTHEM / Math.cos(Math.PI / 6);
export const NUT_HOLE_RADIUS = NUT_OUTER_RADIUS * cadNut.holeRadius/cadNut.outerRadius;
export const NUT_CONTACT_PITCH = 2 * NUT_APOTHEM;
export const NUT_CONTACT_ROTATION = Math.PI / 6;

export const MIN_MIXED_QUANTITY = 12;
export const MAX_QUANTITY = 100;

export function createBatchLayout(config) {
  if (!config.touching) return Array.from({length:config.quantity},(_,index)=>({
    index, groupId:index, kind:'single', crossing:'独立',
    offset:index*(2*NUT_OUTER_RADIUS+config.spacing),
    rotation:index*.35, y:Math.sin(index*2.4)*.43,
  }));
  // Count by BOTH groups and nuts: singles > paired nuts > triangular nuts.
  // At 12: 5 singles + 2 pairs (4 nuts) + 1 triangle (3 nuts).
  const quantity=Math.max(MIN_MIXED_QUANTITY,config.quantity);
  const pairs=2+Math.floor((quantity-12)/6),triangles=1+Math.floor((quantity-12)/12);
  const remaining={single:quantity-2*pairs-3*triangles,pair:pairs,triangle:triangles};
  const pattern=['single','pair','single','triangle','single','pair','single','single'];
  const layout=[];let front=0,groupId=0,pairIndex=0,triangleIndex=0;
  while(layout.length<quantity)for(const kind of pattern){
    if(!remaining[kind])continue;
    remaining[kind]--;
    let centers=[[0,0]],rotation=groupId*.35,crossing='独立';
    if(kind==='pair'){
      const angle=[Math.PI/2,0,Math.PI/3][pairIndex++%3];
      rotation=Math.PI/6-angle;
      centers.push([NUT_CONTACT_PITCH*Math.cos(angle),NUT_CONTACT_PITCH*Math.sin(angle)]);
      crossing=Math.abs(Math.cos(angle))<1e-8?'并行':angle===0?'前后':'斜向';
    }else if(kind==='triangle'){
      const angle=triangleIndex++%2===0?Math.PI/2:0;
      rotation=Math.PI/6-angle;
      centers.push([NUT_CONTACT_PITCH*Math.cos(angle),NUT_CONTACT_PITCH*Math.sin(angle)],
        [NUT_CONTACT_PITCH*Math.cos(angle+Math.PI/3),NUT_CONTACT_PITCH*Math.sin(angle+Math.PI/3)]);
      crossing=angle===Math.PI/2?'三角并行':'三角错位';
    }
    const vertices=Array.from({length:6},(_,i)=>[NUT_OUTER_RADIUS*Math.cos(i*Math.PI/3-rotation),NUT_OUTER_RADIUS*Math.sin(i*Math.PI/3-rotation)]);
    const rx=Math.max(...vertices.map(v=>v[0])),ry=Math.max(...vertices.map(v=>v[1]));
    const minX=Math.min(...centers.map(p=>p[0]))-rx,maxX=Math.max(...centers.map(p=>p[0]))+rx;
    const midY=(Math.min(...centers.map(p=>p[1]))+Math.max(...centers.map(p=>p[1])))/2;
    const halfHeight=(Math.max(...centers.map(p=>p[1]))-Math.min(...centers.map(p=>p[1])))/2+ry;
    const lane=Math.sin(groupId*1.7)*Math.min(.38,1.12-halfHeight);
    centers.forEach(([x,y])=>layout.push({index:layout.length,groupId,kind,crossing,offset:front+maxX-x,y:y-midY+lane,rotation}));
    // Use the full projected solid footprint for clearance, including bevels.
    front+=maxX-minX+config.spacing;groupId++;
  }
  return layout;
}

export function nutPlacement(index,config){return createBatchLayout(config)[index];}
