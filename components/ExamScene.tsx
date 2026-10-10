'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createExamRoom} from '@/lib/exam-room';
import type {SimulatorAction} from '@/data/simulator';
interface Props {view:'judge'|'station';completed:string[];target?:SimulatorAction['target'];enabled:boolean;onActivate:()=>void;panelInset?:number;panelBottomInset?:number}
export default function ExamScene({view,completed,target,enabled,onActivate,panelInset=0,panelBottomInset=0}:Props){
 const host=useRef<HTMLDivElement>(null),live=useRef({view,completed,target,enabled,onActivate,panelInset,panelBottomInset});live.current={view,completed,target,enabled,onActivate,panelInset,panelBottomInset};
 const [unavailable,setUnavailable]=useState(false);
 useEffect(()=>{
  const container=host.current;if(!container)return;const viewport=container;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{setUnavailable(true);return;}
  const compact=window.innerWidth<768;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,compact?1.35:1.6));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  container.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#e9dfcf');
  const camera=new THREE.PerspectiveCamera(58,1,.05,35);camera.position.set(0,1.68,.5);
  const pmrem=new THREE.PMREMGenerator(renderer),studio=new RoomEnvironment();
  const environment=pmrem.fromScene(studio,.04,.1,100,{size:128});scene.environment=environment.texture;scene.environmentIntensity=.6;studio.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#fff6e7','#8b7967',.8));
  const sun=new THREE.DirectionalLight('#ffe9c8',2.4);sun.position.set(-3.8,3.85,-.8);sun.target.position.set(1,0,-1.5);sun.castShadow=true;
  sun.shadow.mapSize.set(compact?1024:2048,compact?1024:2048);sun.shadow.camera.left=-6;sun.shadow.camera.right=6;sun.shadow.camera.top=5;sun.shadow.camera.bottom=-5;sun.shadow.camera.near=.1;sun.shadow.camera.far=16;sun.shadow.normalBias=.035;sun.shadow.bias=-.0001;sun.shadow.blurSamples=8;scene.add(sun,sun.target);
  const fill=new THREE.DirectionalLight('#e5eef3',.55);fill.position.set(4,3.6,-3);scene.add(fill);
  const room=createExamRoom(scene,camera);
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const desiredPosition=new THREE.Vector3(),desiredLook=new THREE.Vector3(),look=new THREE.Vector3(0,1.52,-3.2);
  let yaw=0,drag=false,moved=false,startX=0,startY=0,lastX=0,frame=0,lastView='',lastTime=0;
  let dirty=true,inView=true,previousState='',projectionKey='';
  const down=(e:PointerEvent)=>{drag=true;moved=false;startX=lastX=e.clientX;startY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);};
  const move=(e:PointerEvent)=>{if(!drag)return;if(Math.hypot(e.clientX-startX,e.clientY-startY)>6)moved=true;yaw=THREE.MathUtils.clamp(yaw-(e.clientX-lastX)*.0025,-.8,.8);lastX=e.clientX;dirty=true;};
  const up=(e:PointerEvent)=>{
   if(drag&&!moved&&live.current.enabled){
    const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);
    // Only interactable equipment participates, so room signage and decorative meshes cannot intercept taps.
    const hit=ray.intersectObjects(room.targets,true)[0];let obj:THREE.Object3D|null=hit?.object||null;
    while(obj){if(obj.userData.target){if(obj.userData.target===live.current.target)live.current.onActivate();break;}obj=obj.parent;}
   }
   drag=false;
  };
  const cancel=()=>{drag=false;};
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',cancel);
  const resize=()=>{const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true;};
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  const visibility=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)dirty=true;},{rootMargin:'100px'});visibility.observe(container);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function render(time=0){
   frame=requestAnimationFrame(render);
   if(document.hidden||!inView||time-lastTime<32)return;
   // Slow GPUs should finish a camera move in real time rather than accumulate extra frames.
   const dt=Math.min((time-lastTime)/1000,.5);lastTime=time;
   const s=live.current,firstPose=!lastView;
   const sideInset=THREE.MathUtils.clamp(s.panelInset,0,.55),bottomInset=THREE.MathUtils.clamp(s.panelBottomInset,0,.65);
   const nextProjection=[viewport.clientWidth,viewport.clientHeight,sideInset,bottomInset].join(':');
   if(nextProjection!==projectionKey){
    projectionKey=nextProjection;const w=viewport.clientWidth,h=viewport.clientHeight;
    // Off-axis projection keeps the subject in the scene area beside/above the glass controls.
    if(w&&h){camera.setViewOffset(w,h,w*sideInset/2,h*bottomInset/2,w,h);dirty=true;}
   }
   const visibleAspect=camera.aspect*(1-sideInset);
   const state=[s.view,s.target,s.enabled,s.completed.join('|')].join(':');if(state!==previousState){dirty=true;previousState=state;}
   if(lastView!==s.view){yaw=0;lastView=s.view;}
   // Wide screens show the entire room/counter; small screens move back or focus on the current tool.
   if(s.view==='judge'){
    // Keep portrait cameras in front of the workbench partition.
    const fitDistance=3.35/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*visibleAspect);
    desiredPosition.set(visibleAspect>.9?-.62:-.18,1.68,Math.min(1.75,-3.2+Math.max(3.7,fitDistance)));desiredLook.set(0,1.52,-3.2);
   }else{
    const focus=s.enabled&&s.target&&s.target!=='table'?room.targetPositions[s.target][0]:2.55;
    const zoom=s.enabled&&s.target&&s.target!=='table';
    const overviewDistance=Math.max(2.91,4.8/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*visibleAspect));
    const overviewZ=Math.max(-4.95,1.26-overviewDistance);
    desiredPosition.set(zoom?THREE.MathUtils.clamp(focus+.16,.7,4.5):visibleAspect>.9?3.18:2.55,1.81,zoom?-.8-Math.max(0,(1.05-visibleAspect)*2.6):overviewZ);
    desiredLook.set(zoom?focus:2.55,zoom?(s.target==='water'?1.08:1.38):1.54,1.26);
   }
   const moving=camera.position.distanceToSquared(desiredPosition)>1e-4||look.distanceToSquared(desiredLook)>1e-4;
   if(!dirty&&!moving)return;
   const easing=reduced||firstPose||!moving?1:1-Math.exp(-dt*7);camera.position.lerp(desiredPosition,easing);look.lerp(desiredLook,easing);camera.lookAt(look);camera.rotateY(yaw);
   if(room.update(s.completed))renderer.shadowMap.needsUpdate=true;room.highlight(s.target,s.enabled,0);renderer.render(scene,camera);dirty=false;
  }
  render();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',cancel);room.dispose();environment.dispose();sun.shadow.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div className="exam-scene" ref={host} role="img" aria-label={`1인칭 시험장. ${view==='judge'?'앞의 책상에 심사위원 한 명이 앉아 있습니다.':'옆 작업대에 커피 머신, 그라인더, 물잔과 우유 피처가 있습니다.'}`}>
 {unavailable&&<div className="scene-unavailable">이 기기에서 3D 화면을 사용할 수 없어요.<br/>아래 동작 버튼으로 같은 순서의 연습을 계속할 수 있어요.</div>}
 <span className="scene-view-label">{view==='judge'?'심사위원 앞':'커피 작업대'} · 1인칭 시점</span><span className="scene-help">화면을 끌어 둘러보세요</span>
 </div>;
}
