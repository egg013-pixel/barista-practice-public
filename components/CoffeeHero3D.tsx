'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import styles from './WelcomeExperience.module.css';

/** A self-contained still-life: real geometry, soft light and locally drawn textures. */
export default function CoffeeHero3D() {
 const container = useRef<HTMLDivElement>(null);
 const [unsupported, setUnsupported] = useState(false);
 useEffect(() => {
  const host = container.current;
  if (!host) return;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch { setUnsupported(true); return; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 30);
  camera.position.set(3.35, 3.9, 4.9);
  camera.lookAt(0, .35, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .94;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);
  const geometries: THREE.BufferGeometry[] = [], materials: THREE.Material[] = [], textures: THREE.Texture[] = [];
  const ownGeometry = <T extends THREE.BufferGeometry>(geometry: T): T => { geometries.push(geometry); return geometry; };
  const material = (parameters: THREE.MeshStandardMaterialParameters) => { const m = new THREE.MeshStandardMaterial(parameters); materials.push(m); return m; };
  const makeMesh = (geometry: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D = scene) => {
   const mesh = new THREE.Mesh(ownGeometry(geometry), m);
   mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const texture = (canvas: HTMLCanvasElement, repeat?: [number, number]) => {
   const result = new THREE.CanvasTexture(canvas); result.colorSpace = THREE.SRGBColorSpace;
   if (repeat) { result.wrapS = result.wrapT = THREE.RepeatWrapping; result.repeat.set(...repeat); }
   textures.push(result); return result;
  };
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04, .1, 100, {size:128});
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff8e9, 0x9c7755, 1.25));
  const sunlight = new THREE.DirectionalLight(0xfff5db, 2.35);
  sunlight.position.set(-3, 6, 3); sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(1536, 1536); sunlight.shadow.camera.left = -4; sunlight.shadow.camera.right = 4;
  sunlight.shadow.camera.top = 4; sunlight.shadow.camera.bottom = -4; sunlight.shadow.camera.near = .1; sunlight.shadow.camera.far = 15;
  sunlight.shadow.normalBias = .025; sunlight.shadow.bias = -.0001; sunlight.shadow.radius = 4;
  scene.add(sunlight);
  const glow = new THREE.PointLight(0xf9bd75, 3.2, 8, 2); glow.position.set(2, 2, -3); scene.add(glow);

  // Restrained oak grain, woven linen and crema keep the scene detailed without downloads.
  const woodCanvas = document.createElement('canvas'); woodCanvas.width = woodCanvas.height = 512;
  const woodContext = woodCanvas.getContext('2d')!;
  woodContext.fillStyle = '#cdb087'; woodContext.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 360; i++) {
   const y = (i * 41.73) % 512;
   woodContext.strokeStyle = i % 3 ? 'rgba(110,71,36,.055)' : 'rgba(255,236,197,.17)';
   woodContext.lineWidth = i % 4 ? .7 : 1.8; woodContext.beginPath(); woodContext.moveTo(0, y);
   woodContext.bezierCurveTo(110, y + Math.sin(i) * 5, 330, y - Math.cos(i * .4) * 7, 512, y); woodContext.stroke();
  }
  const tabletop = makeMesh(new THREE.PlaneGeometry(10, 10), material({ map: texture(woodCanvas, [2, 2]), roughness: .8, color: 0xfff0da }));
  tabletop.rotation.x = -Math.PI / 2; tabletop.position.y = -.018;

  const linenCanvas = document.createElement('canvas'); linenCanvas.width = linenCanvas.height = 128;
  const linenContext = linenCanvas.getContext('2d')!; linenContext.fillStyle = '#dfcdae'; linenContext.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 128; i += 3) {
   linenContext.strokeStyle = i % 2 ? '#efdfc56b' : '#ac97763c'; linenContext.lineWidth = 1; linenContext.beginPath();
   linenContext.moveTo(i, 0); linenContext.lineTo(i, 128); linenContext.moveTo(0, i); linenContext.lineTo(128, i); linenContext.stroke();
  }
  const linen = material({ map: texture(linenCanvas, [3, 3]), roughness: 1 });
  const napkin = makeMesh(new THREE.BoxGeometry(1.7, .027, 1.22, 1, 1, 1), linen); napkin.position.set(.72, .015, -.8); napkin.rotation.y = -.29;
  const hem = material({ color: 0xbfab8f, roughness: 1 });
  for (let i = 0; i < 32; i++) {
   const stitch = makeMesh(new THREE.BoxGeometry(.014, .005, .028), hem, napkin); stitch.position.set(-.78 + i * .05, .017, .55);
  }

  const pottery = material({ color: 0xeee0c5, roughness: .28, metalness: .025, envMapIntensity: .55 });
  const potteryEdge = material({ color: 0xf4e2be, roughness: .25 });
  const cup = new THREE.Group(); scene.add(cup); cup.rotation.y = -.25;
  const saucerPoints = [[0,.042],[.48,.043],[.63,.048],[.88,.08],[1.12,.145],[1.27,.164],[1.31,.15],[1.30,.119],[1.1,.099],[.86,.035],[.5,.007],[0,.007]].map(p => new THREE.Vector2(p[0], p[1]));
  makeMesh(new THREE.LatheGeometry(saucerPoints, 96), pottery, cup);
  const saucerRing = makeMesh(new THREE.TorusGeometry(.64, .012, 8, 96), potteryEdge, cup); saucerRing.rotation.x = Math.PI / 2; saucerRing.position.y = .06;
  const cupPoints = [[.0,.11],[.41,.11],[.48,.16],[.57,.28],[.69,.51],[.77,.79],[.80,.97],[.79,1.005],[.764,1.008],[.74,.985],[.72,.80],[.635,.51],[.52,.30],[.43,.235],[0,.235]].map(p => new THREE.Vector2(p[0], p[1]));
  makeMesh(new THREE.LatheGeometry(cupPoints, 96), pottery, cup);
  const foot = makeMesh(new THREE.TorusGeometry(.415, .035, 12, 72), potteryEdge, cup); foot.rotation.x = Math.PI / 2; foot.position.y = .12;
  const rim = makeMesh(new THREE.TorusGeometry(.777, .024, 14, 96), pottery, cup); rim.rotation.x = Math.PI / 2; rim.position.y = .991;
  const handlePath = new THREE.CatmullRomCurve3([new THREE.Vector3(.74,.86,0),new THREE.Vector3(.97,.87,0),new THREE.Vector3(1.15,.77,0),new THREE.Vector3(1.18,.59,0),new THREE.Vector3(1.02,.40,0),new THREE.Vector3(.63,.35,0)]);
  makeMesh(new THREE.TubeGeometry(handlePath, 48, .074, 14, false), pottery, cup);

  const latteCanvas = document.createElement('canvas'); latteCanvas.width = latteCanvas.height = 1024;
  const latte = latteCanvas.getContext('2d')!;
  const crema = latte.createRadialGradient(420, 375, 5, 512, 512, 530); crema.addColorStop(0, '#bd854d'); crema.addColorStop(.55, '#b27940'); crema.addColorStop(.9, '#965b2c'); crema.addColorStop(1, '#e9bf82');
  latte.fillStyle = crema; latte.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 1700; i++) {
   const x = (i * 131.27) % 1024, y = (i * 283.31) % 1024;
   latte.fillStyle = i % 4 ? 'rgba(249,223,172,.15)' : 'rgba(83,44,19,.11)';
   latte.beginPath(); latte.arc(x, y, i % 5 ? 1.4 : 3, 0, Math.PI * 2); latte.fill();
  }
  latte.save(); latte.translate(512, 525); latte.rotate(-.23);
  latte.fillStyle = '#f9ecd2';
  // A poured rosetta, with alternating leaves and one continuous draw-through.
  for (let i = 0; i < 10; i++) {
   const y = 196 - i * 39, width = 287 - i * 21;
   latte.beginPath(); latte.moveTo(-3,y + 4);
   latte.bezierCurveTo(-width*.38,y - 3,-width*.93,y - 19,-width,y - 2);
   latte.bezierCurveTo(-width*1.04,y + 18,-width*.42,y + 26,-3,y + 21);latte.closePath();latte.fill();
   latte.beginPath(); latte.moveTo(3,y + 4);
   latte.bezierCurveTo(width*.38,y - 3,width*.93,y - 19,width,y - 2);
   latte.bezierCurveTo(width*1.04,y + 18,width*.42,y + 26,3,y + 21);latte.closePath();latte.fill();
  }
  latte.beginPath(); latte.moveTo(0,-228); latte.bezierCurveTo(-7,-278,-76,-295,-84,-252); latte.bezierCurveTo(-92,-215,-28,-181,0,-165); latte.bezierCurveTo(28,-181,92,-215,84,-252); latte.bezierCurveTo(76,-295,7,-278,0,-228); latte.fill();
  latte.strokeStyle = '#f9ecd2'; latte.lineWidth = 8; latte.lineCap = 'round'; latte.beginPath(); latte.moveTo(0,-185); latte.bezierCurveTo(-3,-5,3,176,0,273); latte.stroke();
  latte.restore();
  const coffeeTop = makeMesh(new THREE.CircleGeometry(.723, 96), material({ map: texture(latteCanvas), color: 0xd9c9b4, roughness: .45, metalness: .01, envMapIntensity: .2 }), cup);
  coffeeTop.rotation.x = -Math.PI / 2; coffeeTop.rotation.z = .22; coffeeTop.position.y = .966; coffeeTop.castShadow = false;

  const copper = material({ color: 0xa76536, metalness: .87, roughness: .23 });
  const spoon = new THREE.Group(); scene.add(spoon); spoon.position.set(1.16,.19,-.7); spoon.rotation.y = -.35;
  const stem = makeMesh(new THREE.CapsuleGeometry(.026,.66,5,14), copper, spoon); stem.rotation.z = Math.PI / 2;
  const bowl = makeMesh(new THREE.SphereGeometry(1, 32, 16), copper, spoon); bowl.scale.set(.18,.024,.10); bowl.position.x = -.46;
  const beanMaterial = material({ color: 0x593920, roughness: .49 });
  const seamMaterial = material({ color: 0x29190f, roughness: .7 });
  const beanGeometry = ownGeometry(new THREE.SphereGeometry(1, 22, 14));
  const seamGeometry = ownGeometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.065,.072,0),new THREE.Vector3(-.026,.087,.012),new THREE.Vector3(.026,.087,-.01),new THREE.Vector3(.065,.072,0)]),12,.007,5,false));
  const beanPositions = [[-1.43,.09,.55,.35],[-1.7,.075,.38,-.7],[-1.48,.075,.25,1.1],[-1.23,.085,.39,-.3],[-1.83,.08,.67,.5],[-1.69,.075,.85,1.2],[-1.21,.073,.73,-1.1]];
  for (const [x,y,z,angle] of beanPositions) {
   const group = new THREE.Group(); group.position.set(x,y,z); group.rotation.y = angle; scene.add(group);
   const bean = new THREE.Mesh(beanGeometry,beanMaterial); bean.scale.set(.128,.078,.091); bean.castShadow = true; group.add(bean);
   const seam = new THREE.Mesh(seamGeometry,seamMaterial); group.add(seam);
  }
  // A very soft steam ribbon, drawn with transparent geometry rather than a busy particle system.
  const steamCanvas = document.createElement('canvas'); steamCanvas.width = 64; steamCanvas.height = 256;
  const steamContext = steamCanvas.getContext('2d')!;
  const steamGradient = steamContext.createLinearGradient(0,0,0,256); steamGradient.addColorStop(0,'rgba(255,250,239,0)');steamGradient.addColorStop(.4,'rgba(255,250,239,.22)');steamGradient.addColorStop(1,'rgba(255,250,239,0)');
  steamContext.strokeStyle = steamGradient; steamContext.lineWidth = 8; steamContext.filter='blur(4px)';
  steamContext.beginPath(); steamContext.moveTo(35,256);steamContext.bezierCurveTo(-5,174,60,110,27,0);steamContext.stroke();
  const steamMaterial = new THREE.MeshBasicMaterial({ map:texture(steamCanvas), transparent:true, depthWrite:false, opacity:.6, side:THREE.DoubleSide }); materials.push(steamMaterial);
  for (let i=0;i<3;i++) { const steam=makeMesh(new THREE.PlaneGeometry(.25,.8),steamMaterial,cup);steam.position.set(-.22+i*.2,1.45,i*.09);steam.rotation.y=.5;steam.castShadow=false;steam.receiveShadow=false; }

  // Render only when sized: this decorative still-life consumes no idle animation loop.
  const render = () => {
   const width = host.clientWidth, height = host.clientHeight;
   if (!width || !height) return;
   camera.aspect = width/height; camera.fov = camera.aspect < .8 ? 42 : 35; camera.updateProjectionMatrix();
   renderer.setSize(width,height,false); renderer.render(scene,camera);
  };
  const observer = new ResizeObserver(render); observer.observe(host); render();
  const lost = (event: Event) => { event.preventDefault();setUnsupported(true); };
  renderer.domElement.addEventListener('webglcontextlost',lost);
  return () => {
   observer.disconnect(); renderer.domElement.removeEventListener('webglcontextlost',lost);
   geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment.dispose();
   sunlight.shadow.dispose();renderer.dispose();renderer.domElement.remove();
  };
 },[]);
 return <div ref={container} data-testid="coffee-hero" aria-hidden="true">
  {unsupported && <div className={styles.coffeeStill} data-testid="coffee-hero-fallback"><svg viewBox="0 0 440 300"><ellipse cx="220" cy="250" rx="125" ry="22" fill="#bea27a" opacity=".35"/><ellipse cx="217" cy="238" rx="120" ry="22" fill="#eedfc4"/><path d="M301 127C352 116 358 186 308 193" fill="none" stroke="#e4cfaa" strokeWidth="18"/><path d="M132 122H310L294 205Q284 243 224 243Q162 244 148 204Z" fill="#f6e7c9"/><ellipse cx="222" cy="123" rx="90" ry="33" fill="#fff3d8"/><ellipse cx="222" cy="123" rx="79" ry="25" fill="#a57243"/><path d="M199 116Q211 101 222 117Q237 101 248 118Q257 130 222 147Q187 128 199 116Z" fill="#f6e8ca"/></svg></div>}
 </div>;
}
