import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {SimulatorAction} from '@/data/simulator';

type Point = [number, number, number];
type Target = SimulatorAction['target'];

/** All room assets are local procedural models; no external model/texture downloads. */
export function createExamRoom(scene: THREE.Scene, camera: THREE.Camera) {
 const geometries = new Map<string, THREE.BufferGeometry>();
 const materials = new Set<THREE.Material>();
 const textures = new Set<THREE.Texture>();
 const targets: THREE.Object3D[] = [];
 const meshes: THREE.Mesh[] = [];
 function geometry(key: string, build: () => THREE.BufferGeometry) {
  if (!geometries.has(key)) geometries.set(key, build());
  return geometries.get(key)!;
 }
 function material(options: THREE.MeshStandardMaterialParameters) {
  const value = new THREE.MeshStandardMaterial(options); materials.add(value); return value;
 }
 function texture(width: number, height: number, draw: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d'); if (ctx) draw(ctx);
  const value = new THREE.CanvasTexture(canvas); value.colorSpace = THREE.SRGBColorSpace;
  value.anisotropy = 4; textures.add(value); return value;
 }
 function object(g: THREE.BufferGeometry, m: THREE.Material, p: Point, parent: THREE.Object3D = scene, shadow = true) {
  const value = new THREE.Mesh(g, m); value.position.set(...p); value.castShadow = shadow; value.receiveShadow = true; parent.add(value); meshes.push(value); return value;
 }
 function box(w: number, h: number, d: number, m: THREE.Material, p: Point, parent: THREE.Object3D = scene, radius = 0) {
  const r = Math.min(radius, Math.min(w, h, d) / 2);
  return object(geometry(`box:${w}:${h}:${d}:${r}`, () => r ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d)), m, p, parent);
 }
 function cylinder(top: number, bottom: number, height: number, m: THREE.Material, p: Point, parent: THREE.Object3D = scene, open = false) {
  return object(geometry(`cyl:${top}:${bottom}:${height}:${open}`, () => new THREE.CylinderGeometry(top, bottom, height, 32, 1, open)), m, p, parent);
 }
 function sphere(radius: number, m: THREE.Material, p: Point, parent: THREE.Object3D = scene, scale: Point = [1, 1, 1]) {
  const value = object(geometry(`sphere:${radius}`, () => new THREE.SphereGeometry(radius, 24, 16)), m, p, parent); value.scale.set(...scale); return value;
 }
 function torus(radius: number, tube: number, m: THREE.Material, p: Point, parent: THREE.Object3D = scene, arc = Math.PI * 2) {
  return object(geometry(`torus:${radius}:${tube}:${arc}`, () => new THREE.TorusGeometry(radius, tube, 10, 40, arc)), m, p, parent);
 }
 function group(p: Point, parent: THREE.Object3D = scene, target?: Target) {
  const value = new THREE.Group(); value.position.set(...p); parent.add(value);
  if (target) {value.userData.target = target; targets.push(value);} return value;
 }
 function tube(points: Point[], radius: number, m: THREE.Material, parent: THREE.Object3D = scene) {
  const key = `tube:${JSON.stringify(points)}:${radius}`;
  return object(geometry(key, () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 20, radius, 8, false)), m, [0, 0, 0], parent);
 }
 function limb(from: Point, to: Point, radius: number, m: THREE.Material, parent: THREE.Object3D) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const value = object(geometry(`capsule:${radius}:${a.distanceTo(b)}`, () => new THREE.CapsuleGeometry(radius, a.distanceTo(b), 6, 12)), m, [0,0,0], parent);
  value.position.copy(a.add(b).multiplyScalar(.5)); value.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(...to).sub(new THREE.Vector3(...from)).normalize()); return value;
 }
 let seed = 178;
 function random() {seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296;}
 const woodTexture = texture(1024, 512, ctx => {
  ctx.fillStyle = '#b88e60'; ctx.fillRect(0,0,1024,512);
  for (let i=0;i<700;i++) {const y=random()*512;ctx.strokeStyle=`rgba(${random()>.5?'72,42,18':'238,204,159'},${.025+random()*.08})`;ctx.lineWidth=.5+random()*2;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(300,y+random()*10,650,y-6,1024,y+2);ctx.stroke();}
 });
 woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping; woodTexture.repeat.set(2,1);
 const floorTexture = texture(512,512,ctx => {
  ctx.fillStyle='#d3c9b8';ctx.fillRect(0,0,512,512);
  for(let i=0;i<8000;i++){ctx.fillStyle=random()>.5?'rgba(255,255,255,.16)':'rgba(74,85,80,.055)';ctx.fillRect(random()*512,random()*512,1.5,1.5);}
  ctx.strokeStyle='#b9ae9d';ctx.lineWidth=3;ctx.strokeRect(1,1,510,510);
 });
 floorTexture.wrapS=floorTexture.wrapT=THREE.RepeatWrapping;floorTexture.repeat.set(12,12);
 const clothTexture = texture(128,128,ctx=>{ctx.fillStyle='#eee8da';ctx.fillRect(0,0,128,128);ctx.strokeStyle='#d2c7b3';ctx.lineWidth=1;for(let i=0;i<128;i+=4){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,128);ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke();}});
 const wood=material({map:woodTexture,roughness:.58}), wall=material({color:'#eee7dc',roughness:.95}), teal=material({color:'#596f62',roughness:.8}), dark=material({color:'#28332d',roughness:.58});
 const steel=material({color:'#dce1df',metalness:.92,roughness:.2}), steelBrushed=material({color:'#b9bdb5',metalness:.8,roughness:.34}), ceramic=material({color:'#fff8e9',roughness:.2}), black=material({color:'#181f21',roughness:.37});
 const skin=material({color:'#d6ac90',roughness:.7}), jacket=material({color:'#414b49',roughness:.87}), shirt=material({color:'#e9ede8',roughness:.8}), hair=material({color:'#383027',roughness:.88});
 const coffee=material({color:'#552612',roughness:.22}), crema=material({color:'#c79550',roughness:.35}), milkFoam=material({color:'#f8e9c9',roughness:.55});
 const glass=material({color:'#e9f5f3',transparent:true,opacity:.24,roughness:.12,metalness:.12,depthWrite:false,side:THREE.DoubleSide});
 const waterMat=material({color:'#bddddc',transparent:true,opacity:.5,roughness:.13,depthWrite:false});
 const white=material({color:'#faf7ef',roughness:.75}), brass=material({color:'#bd9555',metalness:.65,roughness:.32});
 const contactMap=texture(128,128,ctx=>{const gradient=ctx.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'rgba(34,26,19,.31)');gradient.addColorStop(.45,'rgba(34,26,19,.19)');gradient.addColorStop(1,'rgba(34,26,19,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);});
 const contactMat=new THREE.MeshBasicMaterial({map:contactMap,transparent:true,depthWrite:false,toneMapped:false});materials.add(contactMat);
 function contact(p:Point,w:number,d:number,parent:THREE.Object3D=scene){const value=object(geometry('contact-plane',()=>new THREE.PlaneGeometry(1,1)),contactMat,p,parent,false);value.rotation.x=-Math.PI/2;value.scale.set(w,d,1);value.renderOrder=1;return value;}
 // A little surface grain catches raking light without turning every panel into a shiny box.
 const brushedMap=texture(256,256,ctx=>{ctx.fillStyle='#a8a8a8';ctx.fillRect(0,0,256,256);for(let i=0;i<256;i++){const shade=148+Math.round(random()*25);ctx.fillStyle=`rgb(${shade},${shade},${shade})`;ctx.fillRect(0,i,256,1);}});
 steelBrushed.roughnessMap=brushedMap;

 function placard(lines: string[], w: number, h: number, p: Point, parent: THREE.Object3D = scene, options: {background?: string; color?: string; heading?: string} = {}) {
  const map=texture(1024,Math.round(1024*h/w),ctx=>{
   const ch=ctx.canvas.height;ctx.fillStyle=options.background||'#f6f5ee';ctx.fillRect(0,0,1024,ch);
   ctx.strokeStyle=options.color||'#436158';ctx.lineWidth=5;ctx.strokeRect(16,16,992,ch-32);
   ctx.fillStyle=options.color||'#334b43';ctx.textAlign='center';ctx.textBaseline='middle';
   let start=ch*.5, gap=ch/(lines.length+1);
   if(options.heading){ctx.font=`600 ${Math.min(34,ch*.13)}px sans-serif`;ctx.fillText(options.heading,512,ch*.18);start=ch*.58;gap=ch*.5/Math.max(lines.length,1);}
   lines.forEach((line,i)=>{ctx.font=`${i===0?'700':'500'} ${lines.length===1?78:i===0?67:38}px sans-serif`;ctx.fillText(line,512,start+(i-(lines.length-1)/2)*gap,950);});
  });
  const m=material({map,roughness:.8});const panel=object(geometry(`plane:${w}:${h}`,()=>new THREE.PlaneGeometry(w,h)),m,p,parent,false);return panel;
 }
 // A clean, numbered practical examination room, with a clear candidate work zone.
 box(12,.14,12,material({map:floorTexture,roughness:.87}),[0,-.07,0]).castShadow=false;
 box(12,4.2,.16,wall,[0,2.1,-5.3]).castShadow=false;box(.16,4.2,12,wall,[-5.9,2.1,0]).castShadow=false;box(.16,4.2,12,wall,[5.9,2.1,0]).castShadow=false;
 box(12,1.05,.03,teal,[0,.53,-5.2]);box(.03,1.05,12,teal,[-5.8,.53,0]);box(.03,1.05,12,teal,[5.8,.53,0]);
 for(const y of [.08,1.07]){box(12,.045,.065,wood,[0,y,-5.17]);box(.065,.045,12,wood,[-5.77,y,0]);box(.065,.045,12,wood,[5.77,y,0]);}
 box(12,.08,12,white,[0,4.15,0]).castShadow=false;
 const ceilingTile=material({color:'#e8e1d5',roughness:1});
 const lightPanel=material({color:'#fff9e7',emissive:'#fff8df',emissiveIntensity:1.3,roughness:.8});
 for(const x of [-3,0,3])for(const z of [-3,0,3]){box(2.4,.025,1.7,ceilingTile,[x,4.095,z]).castShadow=false;box(1.3,.045,.45,steelBrushed,[x,4.065,z]).castShadow=false;box(1.2,.018,.36,lightPanel,[x,4.038,z]).castShadow=false;}
 for(const x of [-4.45,-1.5,1.5,4.45])box(.045,.025,11.8,wood,[x,4.035,0]).castShadow=false;
 for(const z of [-4.5,-1.5,1.5,4.5])box(11.8,.025,.045,wood,[0,4.035,z]).castShadow=false;
 box(1.25,.035,.4,white,[-1.9,4.05,-3.7]).castShadow=false;for(let i=0;i<10;i++)box(1.1,.011,.012,steelBrushed,[-1.9,4.025,-3.87+i*.034]).castShadow=false;
 // Deep wooden window reveals and a layered courtyard silhouette, rather than a flat blue pane.
 const windowGroup=group([-5.78,2.35,-1.9]);windowGroup.rotation.y=Math.PI/2;
 const skyMap=texture(768,512,ctx=>{const gradient=ctx.createLinearGradient(0,0,0,512);gradient.addColorStop(0,'#acd0d7');gradient.addColorStop(.6,'#e4e8d7');gradient.addColorStop(1,'#c0cba9');ctx.fillStyle=gradient;ctx.fillRect(0,0,768,512);ctx.fillStyle='#f3efda';ctx.beginPath();ctx.arc(140,105,45,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a8b69b';ctx.beginPath();ctx.moveTo(0,330);for(let x=0;x<=768;x+=24)ctx.lineTo(x,290+Math.sin(x*.012)*40);ctx.lineTo(768,512);ctx.lineTo(0,512);ctx.fill();});
 const sky=material({map:skyMap,roughness:1,emissive:'#f2eee0',emissiveIntensity:.15});
 box(3.72,2.3,.12,wood,[0,0,0],windowGroup,.018).castShadow=false;
 object(geometry('courtyard',()=>new THREE.PlaneGeometry(3.45,2.01)),sky,[0,0,.071],windowGroup,false);
 const landscape=group([0,0,.082],windowGroup);
 const building=material({color:'#c7c6b4',roughness:1}),outsideWindow=material({color:'#8da5a2',roughness:.8}),leaf=material({color:'#7d9670',roughness:1}),leafLight=material({color:'#9cad82',roughness:1}),trunk=material({color:'#83765e',roughness:1});
 box(2.4,.75,.018,building,[.45,-.52,0],landscape).castShadow=false;box(2.5,.05,.024,white,[.45,-.12,.007],landscape).castShadow=false;
 for(const x of [-.45,0,.45,.9,1.35])box(.23,.31,.025,outsideWindow,[x,-.48,.018],landscape).castShadow=false;
 box(.045,.85,.026,trunk,[-1.22,-.55,.042],landscape).castShadow=false;
 for(const p of [[-1.22,-.11,.03],[-1.5,-.22,.04],[-.98,-.2,.048]] as Point[])sphere(.32,p[0]<-1.3?leaf:leafLight,p,landscape,[1,.85,.1]).castShadow=false;
 box(3.44,.15,.022,material({color:'#9da98d',roughness:1}),[0,-.93,.05],landscape).castShadow=false;
 for(const x of [-1.73,-.58,.58,1.73])box(.065,2.07,.14,white,[x,0,.16],windowGroup,.008).castShadow=false;
 box(3.51,.055,.14,white,[0,0,.16],windowGroup).castShadow=false;
 for(const y of [-1.04,1.04])box(3.58,.06,.14,white,[0,y,.16],windowGroup).castShadow=false;
 box(3.86,.08,.3,wood,[0,-1.19,.12],windowGroup,.015);
 // Four tilted slats make the opening read as a real window and cast gentle narrow shadows.
 for(let i=0;i<4;i++){const slat=box(3.55,.045,.10,white,[0,.84-i*.12,.24],windowGroup,.008);slat.rotation.x=.28;}
 // Door and wall fixtures around the assessor's area.
 box(1.02,2.35,.07,wood,[-3.65,1.18,-5.16],scene,.025);box(.92,2.2,.04,material({color:'#758c84',roughness:.7}),[-3.65,1.2,-5.11]);box(.43,.45,.04,glass,[-3.65,1.85,-5.075]);
 for(const x of [-4.2,-3.1])box(.06,2.42,.06,white,[x,1.21,-5.08]);box(1.15,.06,.06,white,[-3.65,2.42,-5.08]);box(.18,.045,.04,steel,[-3.3,1.13,-5.01],scene,.015);
 placard(['시험 진행 중'],.78,.17,[-3.65,2.75,-5.1]);
 // Timber acoustic wall adds a warm second layer behind the assessment position.
 const acoustic=material({color:'#8c7154',roughness:.9});
 box(3.85,2.39,.045,acoustic,[0,2.34,-5.19]);
 for(let i=0;i<27;i++)box(.055,2.36,.025,wood,[-1.82+i*.14,2.34,-5.155],scene,.008);
 box(3.42,1.07,.11,teal,[0,2.93,-5.09],scene,.025);
 placard(['바리스타 실기 평가장','제 1 시험실   ·   응시자 01'],3.26,.91,[0,2.93,-5.027],scene,{heading:'BARISTA  /  PRACTICAL EXAMINATION'});
 const clock=group([3.85,2.85,-5.15]);const clockRim=cylinder(.32,.32,.05,dark,[0,0,0],clock);clockRim.rotation.x=Math.PI/2;
 const clockFace=cylinder(.294,.294,.012,white,[0,0,.031],clock);clockFace.rotation.x=Math.PI/2;
 for(let i=0;i<12;i++){const angle=i*Math.PI/6;const tick=box(.012,.045,.006,dark,[Math.sin(angle)*.258,Math.cos(angle)*.258,.045],clock);tick.rotation.z=-angle;}
 box(.015,.22,.008,dark,[0,.095,.052],clock);const minute=box(.014,.27,.008,dark,[.095,.075,.054],clock);minute.rotation.z=-.88;
 sphere(.018,brass,[0,0,.06],clock);
 placard(['실기 평가 안내','준비  →  음료 제조  →  서빙','작업 후 주변을 정리해 주세요'],1.5,.82,[3.85,2.02,-5.15]);
 // A rear preparation bench and properly stocked shelves place the assessor inside a real training lab.
 const rear=group([0,0,-4.72]);
 box(4.9,.09,.7,wood,[0,.84,0],rear,.025);box(4.75,.76,.6,white,[0,.42,0],rear,.02);box(4.72,.065,.035,dark,[0,.06,.307],rear);
 for(const x of [-1.78,-.59,.59,1.78]){box(1.1,.61,.024,teal,[x,.43,.315],rear,.018);box(.17,.019,.035,brass,[x,.68,.338],rear,.008);}
 contact([0,.013,-4.62],5.0,1.2);
 const canisterLid=material({color:'#675443',roughness:.45});
 for(const x of [-2.08,-1.72,1.70,2.06]){cylinder(.11,.11,.26,ceramic,[x,.999,.09],rear);cylinder(.115,.115,.025,canisterLid,[x,1.139,.09],rear);cylinder(.023,.023,.025,brass,[x,1.161,.09],rear);}
 // A stack of cups and a small timer are useful exam-room details rather than random decoration.
 for(let i=0;i<3;i++)cup(rear,[.98,.89+i*.115,.06],'empty',.64);
 box(.3,.17,.085,dark,[-.99,.969,.07],rear,.02);
 placard(['15 : 00'],.235,.085,[-.99,.985,.116],rear,{background:'#22382e',color:'#dbe7cf'});
 const rearShelf=group([0,1.86,-5.05]);box(2.7,.065,.33,wood,[0,0,.13],rearShelf,.014);
 for(const x of [-1.2,1.2]){box(.035,.29,.035,brass,[x,-.145,.01],rearShelf);box(.035,.035,.25,brass,[x,-.27,.11],rearShelf);}
 for(let i=0;i<5;i++)cup(rearShelf,[-.88+i*.43,.038,.13],'empty',.64);
 const tall=group([4.85,0,-4.91]);box(1.22,1.66,.63,white,[0,.89,0],tall,.02);box(1.13,1.53,.023,wood,[0,.9,.334],tall,.01);box(.04,1.55,.04,dark,[0,.9,.348],tall);for(const x of [-.1,.1])box(.021,.23,.038,brass,[x,1.02,.36],tall,.008);contact([4.85,.012,-4.79],1.6,.9);
 function plant(p:Point,scale=1){const g=group(p);g.scale.setScalar(scale);cylinder(.16,.12,.28,ceramic,[0,.14,0],g);cylinder(.143,.143,.018,coffee,[0,.285,0],g);const foliage=material({color:'#577253',roughness:.94});tube([[0,.28,0],[.03,.67,.04],[0,.95,.02]],.011,canisterLid,g);for(let i=0;i<7;i++){const angle=i*2.399;const leaf=sphere(.11,foliage,[Math.cos(angle)*.13,.45+i*.055,Math.sin(angle)*.12],g,[.6,.23,1.5]);leaf.rotation.y=-angle;leaf.rotation.z=i%2?.37:-.27;}return g;}
 plant([-2.4,.89,-4.63],.85);plant([4.78,1.72,-4.91],.78);
 // Identifiable candidate zone tape is narrow enough to stay out of the serving path.

 const floorZone=material({color:'#d8b66e',roughness:.85});
 for(const x of [-1.8,1.8])box(.025,.005,2.5,floorZone,[x,.009,-.65]);box(3.6,.005,.025,floorZone,[0,.009,.6]);
 // Assessor's desk, real chair, clipboard, pen and a physical desk sign.
 const desk=group([0,0,-2.4],scene,'table');
 box(3.05,.105,1.18,wood,[0,.95,0],desk,.035);box(2.87,.17,.045,teal,[0,.77,-.4],desk,.012);
 box(2.82,.29,.035,wood,[0,.7,.30],desk,.015);box(2.78,.024,.016,brass,[0,.551,.33],desk);
 contact([0,.012,-2.4],3.85,1.72);
 for(const x of [-1.38,1.38]){box(.07,.88,.075,steelBrushed,[x,.45,-.4],desk,.02);box(.07,.88,.075,steelBrushed,[x,.45,.4],desk,.02);box(.08,.065,.92,dark,[x,.035,0],desk,.02);}
 box(2.8,.045,.035,steelBrushed,[0,.23,-.4],desk);
 const chair=group([0,0,-3.6]);const upholstery=material({color:'#6f6659',roughness:.94});
 box(.66,.13,.6,upholstery,[0,.56,0],chair,.064);const backrest=box(.67,.61,.15,upholstery,[0,1.02,-.25],chair,.065);backrest.rotation.x=-.08;
 for(const x of [-.35,.35]){box(.049,.29,.046,dark,[x,.72,-.02],chair,.014);box(.065,.07,.47,wood,[x,.86,-.015],chair,.027);}
 contact([0,.013,-3.5],1.2,1.24);
 for(const x of [-.27,.27])for(const z of [-.23,.23])limb([x,.05,z],[x,.51,z],.025,steelBrushed,chair);
 const assessor=group([0,0,-3.38]);
 // A calm, attentive examiner: human proportions, soft tailoring and a swept hairstyle.
 sphere(.31,jacket,[0,1.05,0],assessor,[1.12,1.4,.72]);cylinder(.072,.083,.14,skin,[0,1.445,.015],assessor);
 const headGeometry=geometry('assessor-face',()=>{const g=new THREE.SphereGeometry(.21,32,24);const positions=g.attributes.position;for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);const jaw=y<-.04?1+Math.max(-.21,y+.04)*1.1:1;positions.setXYZ(i,x*.95*jaw,y*1.14,z*.87*(y<-.12?.93:1));}g.computeVertexNormals();return g;});
 object(headGeometry,skin,[0,1.688,.028],assessor);
 const sweptHair=geometry('assessor-swept-hair',()=>{
  const segments=40,rings=16,positions:number[]=[],uvs:number[]=[],indices:number[]=[];
  for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const phi=i/segments*Math.PI*2;const front=Math.max(0,Math.sin(phi));const edge=Math.PI*(.66-front*.19)+Math.cos(phi)*front*.055;const theta=j/rings*edge;const r=.216;const part=.004*Math.sin(phi*3)*Math.sin(theta);positions.push(-r*Math.cos(phi)*Math.sin(theta)*.99,r*Math.cos(theta)*1.12+part,r*Math.sin(phi)*Math.sin(theta)*.88);uvs.push(i/segments,j/rings);}
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
 });
 object(sweptHair,hair,[0,1.725,.006],assessor);
 // A parted forelock replaces the old perfectly round helmet silhouette.
 const lock=sphere(.122,hair,[-.055,1.826,.143],assessor,[1.21,.45,.46]);lock.rotation.z=-.28;
 const hairLine=material({color:'#514135',roughness:.93});tube([[-.13,1.795,.12],[-.07,1.854,.145],[.025,1.87,.113]],.004,hairLine,assessor);
 for(const x of [-.197,.197]){sphere(.039,skin,[x,1.671,.015],assessor,[.55,1,.65]);sphere(.023,material({color:'#bc8f78',roughness:.85}),[x*.994,1.67,.035],assessor,[.45,.78,.4]);}
 const iris=material({color:'#4b4132',roughness:.48});
 for(const x of [-.069,.069]){sphere(.032,white,[x,1.709,.199],assessor,[1,.4,.18]);sphere(.018,iris,[x,1.705,.207],assessor,[.56,.85,.17]);sphere(.009,dark,[x,1.705,.211],assessor,[.62,1,.15]);const brow=box(.068,.012,.012,hair,[x,1.756,.189],assessor,.005);brow.rotation.z=x<0?.10:-.10;}
 sphere(.032,skin,[0,1.662,.217],assessor,[.75,1.2,1]);
 tube([[-.034,1.608,.182],[0,1.602,.194],[.034,1.608,.182]],.006,material({color:'#875d4e',roughness:.8}),assessor);
 const glasses=material({color:'#645648',metalness:.3,roughness:.38});
 for(const x of [-.072,.072]){const ring=torus(.046,.004,glasses,[x,1.709,.217],assessor);ring.scale.y=.76;}
 box(.041,.007,.008,glasses,[0,1.71,.217],assessor);tube([[-.118,1.708,.212],[-.155,1.718,.13],[-.19,1.71,.02]],.003,glasses,assessor);tube([[.118,1.708,.212],[.155,1.718,.13],[.19,1.71,.02]],.003,glasses,assessor);
 box(.15,.41,.03,shirt,[0,1.15,.218],assessor,.012);const tie=box(.041,.29,.018,material({color:'#9c7454',roughness:.84}),[0,1.145,.243],assessor,.008);tie.rotation.z=.018;
 for(const side of [-1,1]){
  const collar=box(.084,.08,.022,shirt,[side*.051,1.34,.23],assessor,.006);collar.rotation.z=side*-.37;
  const lapel=box(.12,.36,.043,jacket,[side*.143,1.21,.213],assessor,.014);lapel.rotation.z=side*-.23;
  limb([side*.285,1.31,.035],[side*.405,1.015,.18],.09,jacket,assessor);limb([side*.405,1.015,.18],[side*.30,1.055,.62],.074,jacket,assessor);
  limb([side*.30,1.055,.565],[side*.30,1.055,.609],.057,shirt,assessor);
  sphere(.069,skin,[side*.294,1.045,.68],assessor,[.86,.4,1.25]);
  // Knuckle lines are subtle; oversized spherical hands look toy-like at a full-screen scale.
  for(let i=0;i<3;i++)tube([[side*.294-.035+i*.025,1.067,.70],[side*.294-.035+i*.025,1.061,.747]],.002,skin,assessor);
  limb([side*.13,.70,.03],[side*.22,.57,.44],.103,jacket,assessor);limb([side*.22,.57,.44],[side*.22,.15,.4],.078,jacket,assessor);
  sphere(.09,black,[side*.22,.09,.5],assessor,[.84,.62,1.7]);
 }
 for(const y of [1.17,1.07,.98])sphere(.009,brass,[.045,y,.235],assessor,[1,1,.4]);
 const clipboard=group([.5,1.01,-2.55]);clipboard.rotation.y=-.13;
 box(.54,.02,.4,dark,[0,0,0],clipboard,.018);box(.48,.007,.34,white,[0,.014,0],clipboard);box(.12,.014,.035,steel,[0,.025,-.16],clipboard,.009);
 const rubric=placard(['실기 평가표','대사 · 제조 · 서비스 · 정리'],.45,.3,[0,.019,0],clipboard);rubric.rotation.x=-Math.PI/2;
 const pen=cylinder(.007,.007,.31,dark,[.83,1.017,-2.55]);pen.rotation.x=Math.PI/2;pen.rotation.z=.15;
 const deskSign=group([-.93,1.005,-2.27]);box(.53,.14,.07,teal,[0,.075,0],deskSign,.012);box(.55,.014,.09,brass,[0,.009,0],deskSign,.004);placard(['심사위원'],.49,.11,[0,.078,.037],deskSign);
 const candidateCard=group([1.02,1.005,-2.18]);const numbered=placard(['01'],.22,.18,[0,.085,.01],candidateCard,{background:'#eee6d3',color:'#495e50'});numbered.rotation.x=-.10;box(.23,.018,.12,brass,[0,.01,-.022],candidateCard,.007);
 // Additional assessment papers have ruled rows and a quiet coffee-colored spine.
 const paperMap=texture(256,256,ctx=>{ctx.fillStyle='#fbf7eb';ctx.fillRect(0,0,256,256);ctx.fillStyle='#786346';ctx.font='bold 17px sans-serif';ctx.fillText('ASSESSMENT',22,33);ctx.strokeStyle='#d5cbb8';ctx.lineWidth=1;for(let y=59;y<238;y+=21){ctx.beginPath();ctx.moveTo(22,y);ctx.lineTo(235,y);ctx.stroke();}ctx.strokeStyle='#b1a58f';ctx.strokeRect(22,52,211,184);});
 const papers=object(geometry('paper-page',()=>new THREE.PlaneGeometry(.29,.4)),material({map:paperMap,roughness:1}),[-.31,1.011,-2.62],scene,false);papers.rotation.x=-Math.PI/2;papers.rotation.z=.1;
 box(.22,.055,.31,teal,[-1.11,1.031,-2.61],scene,.012);box(.21,.025,.3,white,[-1.1,1.035,-2.60]);
 // Candidate counter and a tiled backsplash, cabinets, sink and organised tools.
 const counter=group([2.5,0,1.2]);box(4.95,.105,1.5,wood,[0,1.017,0],counter,.025);box(4.87,.015,1.4,steelBrushed,[0,1.075,0],counter,.01);contact([2.5,.014,1.14],5.4,2.0);box(4.88,.88,1.35,material({color:'#e1e4dc',roughness:.85}),[0,.5,0],counter,.015);
 box(4.8,.11,.07,dark,[0,.08,-.65],counter);for(const x of [-1.78,-.6,.6,1.78]){box(1.12,.68,.025,teal,[x,.55,-.69],counter,.02);box(.23,.025,.035,steel,[x,.78,-.725],counter,.01);}
 box(5.35,3.05,.12,wall,[2.55,1.53,2.1]).castShadow=false;
 const tileTexture=texture(512,256,ctx=>{ctx.fillStyle='#e7dfcd';ctx.fillRect(0,0,512,256);ctx.strokeStyle='#c0b69f';ctx.lineWidth=3;for(let y=0;y<=256;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke();for(let x=(y/64%2)*64;x<=512;x+=128)ctx.strokeRect(x,y,128,64);}});
 tileTexture.wrapS=tileTexture.wrapT=THREE.RepeatWrapping;tileTexture.repeat.set(4,2);
 box(5.1,.8,.018,material({map:tileTexture,roughness:.5}),[2.55,1.47,2.027]);
 // Face the candidate who is looking toward +z.
 const stationSign=placard(['응시자 01 · 음료 제조 작업대'],2.8,.43,[2.75,2.62,2.006],scene,{heading:'BARISTA  /  STATION 01'});stationSign.rotation.y=Math.PI;
 // Counter names are physical badges, not floating labels over the user's view.
 function badge(text:string,x:number){const value=placard([text],.54,.115,[x,.9,.488]);value.rotation.y=Math.PI;}
 // Detailed two-group stainless machine.
 const machine=group([3.25,1.075,1.23],scene,'machine');
 box(1.72,.9,.78,steel,[0,.48,0],machine,.095);contact([0,.003,-.05],2.05,1.10,machine);
 for(const x of [-.851,.851]){box(.018,.64,.50,wood,[x,.50,.04],machine,.008);for(let i=0;i<5;i++)box(.006,.22,.009,dark,[x+(x>0?.012:-.012),.51,-.1+i*.065],machine);}
box(1.6,.06,.83,black,[0,.035,-.06],machine,.025);
 box(1.52,.16,.035,black,[0,.71,-.401],machine,.014);box(1.48,.29,.07,steelBrushed,[0,.49,-.407],machine,.018);
 box(1.62,.07,.59,steel,[0,.09,-.32],machine,.019);box(1.46,.017,.43,black,[0,.134,-.34],machine,.005);
 for(let x=-.68;x<=.69;x+=.06)box(.018,.013,.41,steelBrushed,[x,.149,-.34],machine,.004);
 box(1.48,.026,.63,black,[0,.945,.02],machine,.008);
 for(const x of [-.77,.77])box(.018,.055,.72,steel,[x,.97,.025],machine,.006);box(1.54,.055,.018,steel,[0,.97,.375],machine,.005);
 for(const x of [-.4,.4]){
  cylinder(.116,.116,.12,steel,[x,.393,-.46],machine);cylinder(.093,.093,.035,black,[x,.32,-.47],machine);
  box(.066,.049,.33,black,[x+.01,.306,-.635],machine,.023).rotation.y=-.1;
  cylinder(.092,.092,.017,steel,[x,.294,-.47],machine);tube([[x-.04,.294,-.47],[x-.04,.263,-.47],[x-.025,.246,-.52]],.013,steel,machine);tube([[x+.04,.294,-.47],[x+.04,.263,-.47],[x+.025,.246,-.52]],.013,steel,machine);
  for(let i=0;i<4;i++){const button=cylinder(.028,.028,.011,i===0?brass:steelBrushed,[x-.105+i*.07,.712,-.425],machine);button.rotation.x=Math.PI/2;}
 }
 const displayMap=texture(256,96,ctx=>{ctx.fillStyle='#172e2d';ctx.fillRect(0,0,256,96);ctx.fillStyle='#b2e0c6';ctx.font='28px monospace';ctx.fillText('93°C  |  READY',17,58);});
 const screen=material({map:displayMap,emissive:'#8bceb0',emissiveMap:displayMap,emissiveIntensity:.32,roughness:.2});
 object(geometry('machine-screen',()=>new THREE.PlaneGeometry(.3,.11)),screen,[0,.715,-.423],machine,false).rotation.y=Math.PI;
 const gauge=group([0,.508,-.456],machine);const rim=cylinder(.061,.061,.017,steel,[0,0,0],gauge);rim.rotation.x=Math.PI/2;
 const face=cylinder(.052,.052,.019,white,[0,0,-.012],gauge);face.rotation.x=Math.PI/2;
 const needle=box(.005,.069,.004,dark,[.013,.013,-.024],gauge);needle.rotation.z=-.6;
 for(const x of [-.74,.74]){const knob=cylinder(.064,.064,.05,black,[x,.64,-.415],machine);knob.rotation.x=Math.PI/2;torus(.044,.008,steel,[x,.64,-.445],machine);for(let i=0;i<8;i++){const a=i*Math.PI/4;box(.007,.019,.009,steelBrushed,[x+Math.sin(a)*.048,.64+Math.cos(a)*.048,-.445],machine,.002);}}
 const brand=placard(['CAFFÈ  /  01'],.28,.049,[0,.49,-.497],machine,{background:'#deded1',color:'#3b443b'});brand.rotation.y=Math.PI;
 tube([[.75,.6,-.4],[.85,.53,-.48],[.82,.25,-.56],[.78,.205,-.61]],.017,steel,machine);
 tube([[-.75,.6,-.4],[-.82,.42,-.5],[-.77,.28,-.56]],.014,steel,machine);
 // Cups warming on the top rail.
 let latteMaterial:THREE.MeshStandardMaterial|undefined;
 function cup(parent:THREE.Object3D,p:Point,kind:'coffee'|'milk'|'empty',scale=1){
  const c=group(p,parent);c.scale.setScalar(scale);contact([0,.001,0],.41,.41,c);
  const profile=[new THREE.Vector2(.061,0),new THREE.Vector2(.078,.015),new THREE.Vector2(.11,.13),new THREE.Vector2(.115,.174),new THREE.Vector2(.105,.178),new THREE.Vector2(.098,.143),new THREE.Vector2(.067,.027),new THREE.Vector2(0,.027)];
  object(geometry('cup-bowl',()=>new THREE.LatheGeometry(profile,40)),ceramic,[0,.02,0],c);const lip=torus(.108,.005,ceramic,[0,.197,0],c);lip.rotation.x=Math.PI/2;
  const handle=torus(.05,.013,ceramic,[.114,.12,0],c,Math.PI*1.55);handle.rotation.z=-Math.PI*.77;
  cylinder(.173,.145,.017,ceramic,[0,.012,0],c);const saucerRing=torus(.143,.007,ceramic,[0,.023,0],c);saucerRing.rotation.x=Math.PI/2;
  if(kind!=='empty'){cylinder(.097,.084,.004,kind==='milk'?crema:coffee,[0,.176,0],c);const edge=torus(.092,.004,crema,[0,.179,0],c);edge.rotation.x=Math.PI/2;
   if(kind==='milk'){
    // A heart in the milk surface, drawn once and reused by every cappuccino.
    if(!latteMaterial){const latte=texture(256,256,ctx=>{ctx.clearRect(0,0,256,256);ctx.fillStyle='#fff2d2';ctx.beginPath();ctx.moveTo(128,185);ctx.bezierCurveTo(40,125,58,65,102,83);ctx.bezierCurveTo(120,88,123,99,128,105);ctx.bezierCurveTo(136,76,181,65,190,107);ctx.bezierCurveTo(199,133,161,165,128,185);ctx.fill();});
    latteMaterial=material({map:latte,transparent:true,roughness:.6,depthWrite:false});}
    const art=object(geometry('latte-surface',()=>new THREE.PlaneGeometry(.17,.17)),latteMaterial,[0,.181,0],c,false);art.rotation.x=-Math.PI/2;
   }
  }return c;
 }
 for(const x of [-.46,0,.46])cup(machine,[x,.95,.05],'empty',.75);
 const grinder=group([1.7,1.075,1.25],scene,'grinder');box(.4,.065,.44,black,[0,.04,0],grinder,.035);cylinder(.155,.19,.4,steelBrushed,[0,.265,0],grinder);box(.22,.26,.11,black,[0,.28,-.16],grinder,.03);
 cylinder(.13,.17,.095,black,[0,.505,0],grinder);cylinder(.235,.12,.35,glass,[0,.715,0],grinder,true);cylinder(.25,.25,.037,black,[0,.906,0],grinder);cylinder(.04,.04,.035,black,[0,.94,0],grinder);
 // Beans fill the hopper all the way down to its throat, with a visible uneven top layer.
 cylinder(.19,.10,.235,coffee,[0,.668,0],grinder);
 const beanGeometry=geometry('coffee-bean',()=>new THREE.SphereGeometry(.025,10,8));
 const beanInstances=new THREE.InstancedMesh(beanGeometry,coffee,76);grinder.add(beanInstances);
 const beanTransform=new THREE.Object3D();
 for(let i=0;i<76;i++){const angle=random()*Math.PI*2,r=Math.sqrt(random())*.171;beanTransform.position.set(Math.cos(angle)*r,.786+random()*.034,Math.sin(angle)*r);beanTransform.rotation.set(random()*.5,random()*Math.PI,random()*.5);beanTransform.scale.set(1,.61,.80);beanTransform.updateMatrix();beanInstances.setMatrixAt(i,beanTransform.matrix);}beanInstances.instanceMatrix.needsUpdate=true;
 contact([0,.003,-.05],.57,.61,grinder);
 box(.16,.07,.15,steel,[0,.37,-.24],grinder,.015);box(.14,.025,.18,steelBrushed,[0,.21,-.26],grinder,.012);badge('그라인더',1.7);
 const grindDisplay=placard(['2.8'],.115,.058,[0,.305,-.223],grinder,{background:'#1c312b',color:'#dee6cc'});grindDisplay.rotation.y=Math.PI;
 const grindDial=cylinder(.035,.035,.025,black,[0,.413,-.221],grinder);grindDial.rotation.x=Math.PI/2;

 const water=group([.46,1.085,1.19],scene,'water');contact([0,.002,0],.47,.43,water);
 cylinder(.135,.105,.39,glass,[0,.205,0],water,true);cylinder(.108,.093,.29,waterMat,[0,.16,0],water);const jugRim=torus(.132,.011,steel,[0,.405,0],water);jugRim.rotation.x=Math.PI/2;
 const jugHandle=torus(.098,.017,steel,[.155,.22,0],water,Math.PI*1.4);jugHandle.rotation.z=-Math.PI*.7;badge('물 · 물잔',.48);
 const milk=group([4.37,1.085,.9],scene,'milk');contact([0,.002,0],.40,.40,milk);
 const pitcherProfile=[new THREE.Vector2(.083,0),new THREE.Vector2(.12,.03),new THREE.Vector2(.127,.24),new THREE.Vector2(.119,.25),new THREE.Vector2(.11,.235),new THREE.Vector2(.108,.027),new THREE.Vector2(0,.027)];
 object(geometry('pitcher',()=>new THREE.LatheGeometry(pitcherProfile,40)),steel,[0,0,0],milk);const milkLip=torus(.122,.006,steel,[0,.25,0],milk);milkLip.rotation.x=Math.PI/2;
 const pitcherHandle=torus(.092,.014,steel,[.148,.145,0],milk,Math.PI*1.45);pitcherHandle.rotation.z=-Math.PI*.73;
 box(.08,.035,.11,steel,[0,.245,-.113],milk,.012).rotation.x=.28;cylinder(.103,.103,.007,milkFoam,[0,.12,0],milk);badge('우유 피처',4.4);
 const milkCarton=group([4.5,1.075,1.58]);box(.19,.33,.16,white,[0,.17,0],milkCarton,.009);box(.19,.075,.16,teal,[0,.31,0],milkCarton,.007);const milkName=placard(['MILK'],.15,.08,[0,.18,-.086],milkCarton);milkName.rotation.y=Math.PI;
 const tray=group([2.3,1.085,.68],scene,'tray');contact([0,.002,0],.90,.6,tray);box(.67,.027,.43,dark,[0,.016,0],tray,.025);for(const x of [-.335,.335])box(.018,.035,.43,steelBrushed,[x,.037,0],tray,.006);for(const z of [-.213,.213])box(.66,.035,.018,steelBrushed,[0,.037,z],tray,.006);
 const tamper=group([2.25,1.085,1.3],scene,'tray');cylinder(.075,.075,.035,steel,[0,.022,0],tamper);cylinder(.027,.038,.085,wood,[0,.08,0],tamper);sphere(.045,wood,[0,.126,0],tamper,[1,.75,1]);
 box(.42,.027,.3,black,[2.18,1.089,1.32],scene,.015);
 const cloth=group([4.55,1.085,.61],scene,'cloth');box(.36,.034,.24,material({map:clothTexture,roughness:1}),[0,.019,0],cloth,.01);
 box(.43,.19,.45,black,[1.12,1.17,1.3],scene,.02);cylinder(.02,.02,.39,wood,[1.12,1.275,1.3]).rotation.z=Math.PI/2;
 // Sink to the left of the main work area, with a bent chrome tap and drying rack.
 const sink=group([.63,1.085,1.67]);
 box(.59,.016,.58,steel,[0,.012,0],sink,.045);box(.49,.006,.47,black,[0,.022,0],sink,.025);box(.39,.005,.35,steelBrushed,[0,.028,0],sink,.04);
 for(const x of [-.243,.243]){const side=box(.033,.034,.42,steel,[x,.037,0],sink,.013);side.rotation.z=x>0?.45:-.45;}
 for(const z of [-.22,.22]){const side=box(.45,.034,.032,steel,[0,.037,z],sink,.012);side.rotation.x=z>0?-.45:.45;}
 cylinder(.032,.032,.003,dark,[0,.032,.05],sink);cylinder(.025,.025,.005,steelBrushed,[0,.034,.05],sink);

 tube([[.64,1.08,1.91],[.64,1.46,1.91],[.64,1.49,1.71],[.64,1.38,1.66]],.022,steel);
 box(.2,.055,.06,steel,[.84,1.095,1.86],scene,.013);cylinder(.035,.035,.08,steel,[.65,1.125,1.91]);
 const drainRack=group([.28,1.092,1.73]);box(.33,.019,.33,steelBrushed,[0,0,0],drainRack,.011);for(let i=0;i<7;i++)box(.012,.022,.29,steel,[-.13+i*.043,.02,0],drainRack,.003);

 const shelf=group([1.7,2.06,1.99]);box(2.5,.065,.31,wood,[0,0,-.13],shelf,.015);for(const x of [-1.1,1.1])box(.035,.25,.035,steelBrushed,[x,-.12,0],shelf);
 for(let i=0;i<6;i++)cup(shelf,[-1+i*.4,.045,-.14],'empty',.66);
 const bin=group([5.18,0,.95]);contact([5.18,.014,.95],.82,.81);cylinder(.26,.21,.62,steelBrushed,[0,.32,0],bin);cylinder(.27,.27,.065,black,[0,.64,0],bin);box(.24,.025,.07,black,[0,.035,-.21],bin,.015);
 const warning=placard(['깨끗한 작업대 · 안전한 실습'],1.45,.18,[4.42,2.32,2.01]);warning.rotation.y=Math.PI;
 // Reusable service objects: only visibility and positions change on action updates.
 const dynamic=group([0,0,0]), carry=group([0,-.34,-1.02],camera);scene.add(camera);
 function waterGlass(parent:THREE.Object3D,p:Point){const g=group(p,parent);contact([0,.002,0],.25,.25,g);cylinder(.072,.061,.205,glass,[0,.11,0],g,true);cylinder(.062,.055,.15,waterMat,[0,.085,0],g);const lip=torus(.07,.005,glass,[0,.211,0],g);lip.rotation.x=Math.PI/2;return g;}
 const preparedWater=waterGlass(dynamic,[.76,1.083,.86]);const servedWater=waterGlass(dynamic,[-.6,1.002,-2.21]);
 const espresso=[cup(dynamic,[3,1.227,.84],'coffee'),cup(dynamic,[3.5,1.227,.84],'coffee')];
 const cappuccino=[cup(dynamic,[3,1.227,.84],'coffee',1.08),cup(dynamic,[3.5,1.227,.84],'coffee',1.08)];
 const cappuccinoMilk=[cup(dynamic,[3,1.227,.84],'milk',1.08),cup(dynamic,[3.5,1.227,.84],'milk',1.08)];
 preparedWater.userData.target='water';servedWater.userData.target='table';targets.push(preparedWater,servedWater);
 for(const c of [...espresso,...cappuccino,...cappuccinoMilk]){c.userData.target='tray';targets.push(c);}
 box(.8,.027,.43,dark,[0,0,0],carry,.025);for(const x of [-.4,.4])sphere(.065,skin,[x,-.02,.16],carry,[.8,.5,1.35]);
 const heldWater=waterGlass(carry,[0,.017,0]);const heldEspresso=[cup(carry,[-.2,.017,0],'coffee'),cup(carry,[.2,.017,0],'coffee')];const heldCappuccino=[cup(carry,[-.2,.017,0],'milk'),cup(carry,[.2,.017,0],'milk')];
 let previous='';
 function update(ids:string[]){
  // Only these actions change cup geometry/visibility and require rebuilding room shadows.
  const stamp=ids.filter(id=>id==='water-fill'||id==='milk-pour'||/-(extract|take|serve)$/.test(id)).join('|');if(stamp===previous)return false;previous=stamp;
  const has=(id:string)=>ids.includes(id),holdingWater=has('water-take')&&!has('water-serve'),holdingEspresso=has('espresso-take')&&!has('espresso-serve'),holdingCappuccino=has('cappuccino-take')&&!has('cappuccino-serve');
  carry.visible=holdingWater||holdingEspresso||holdingCappuccino;heldWater.visible=holdingWater;heldEspresso.forEach(c=>c.visible=holdingEspresso);heldCappuccino.forEach(c=>c.visible=holdingCappuccino);
  preparedWater.visible=has('water-fill')&&!has('water-take');servedWater.visible=has('water-serve');
  espresso.forEach((c,i)=>{c.visible=has('espresso-extract')&&!holdingEspresso;c.userData.target=has('espresso-serve')?'table':'tray';c.position.set(has('espresso-serve')?-.24+i*.42:3+i*.5,has('espresso-serve')?1.003:1.227,has('espresso-serve')?-2.21:.84);});
  for(const cups of [cappuccino,cappuccinoMilk])cups.forEach((c,i)=>{c.visible=has('cappuccino-extract')&&!holdingCappuccino&&(cups===cappuccinoMilk?has('milk-pour'):!has('milk-pour'));c.userData.target=has('cappuccino-serve')?'table':'tray';c.position.set(has('cappuccino-serve')?.62+i*.43:3+i*.5,has('cappuccino-serve')?1.003:1.227,has('cappuccino-serve')?-2.21:.84);});
  return true;
 }
 carry.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=false;o.receiveShadow=false;}});
 // Initialize even the empty state, without allocating on every action.
 previous='initial';update([]);
 const targetPositions:Record<Target,Point>={table:[0,1.01,-1.98],water:[.46,1.084,1.19],machine:[3.25,1.23,.81],grinder:[1.7,1.084,1.25],milk:[4.37,1.084,.9],tray:[2.3,1.084,.68],cloth:[4.55,1.084,.61]};
 const markerMaterial=material({color:'#efc56f',emissive:'#b48331',emissiveIntensity:.4,roughness:.45});
 const marker=torus(.22,.012,markerMaterial,[0,0,0]);marker.rotation.x=-Math.PI/2;marker.castShadow=false;marker.visible=false;
 // Many small static details can share a draw call. Keep interactable and movable models intact:
 // the raycaster still reaches the original target groups, and action updates still move their cups.
 scene.updateMatrixWorld(true);
 const batches=new Map<string,{material:THREE.Material;castShadow:boolean;receiveShadow:boolean;meshes:THREE.Mesh[]}>();
 for(const item of meshes){
  if(item===marker||!item.visible||item instanceof THREE.InstancedMesh||Array.isArray(item.material)||item.material.transparent)continue;
  let parent:THREE.Object3D|null=item,excluded=false;
  while(parent){if(parent===dynamic||parent===carry||parent===camera||parent.userData.target||!parent.visible){excluded=true;break;}parent=parent.parent;}
  if(excluded)continue;
  const key=`${item.material.uuid}:${item.castShadow}:${item.receiveShadow}`;
  let batch=batches.get(key);if(!batch){batch={material:item.material,castShadow:item.castShadow,receiveShadow:item.receiveShadow,meshes:[]};batches.set(key,batch);}batch.meshes.push(item);
 }
 for(const [key,batch] of batches){
  if(batch.meshes.length<2)continue;
  const parts=batch.meshes.map(item=>{const source=item.geometry.index?item.geometry.toNonIndexed():item.geometry.clone();return source.applyMatrix4(item.matrixWorld);});
  const merged=mergeGeometries(parts,false);parts.forEach(part=>part.dispose());if(!merged)continue;
  // Geometry disposal is shared with all original room resources during the renderer cleanup.
  geometries.set(`static-batch:${key}`,merged);
  const combined=new THREE.Mesh(merged,batch.material);combined.castShadow=batch.castShadow;combined.receiveShadow=batch.receiveShadow;combined.name='exam-room-static-batch';scene.add(combined);
  batch.meshes.forEach(item=>item.removeFromParent());
 }
 return {
  // Raycaster does not exclude invisible groups; hidden service objects must be filtered here.
  get targets(){return targets.filter(o=>o.visible);}, targetPositions, update,
  highlight(target:Target|undefined,enabled:boolean,time:number){marker.visible=!!target&&enabled;if(target){marker.position.set(...targetPositions[target]);marker.scale.setScalar(1+Math.sin(time*2)*.045);marker.userData.target=target;}},
  dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}
 };
}
