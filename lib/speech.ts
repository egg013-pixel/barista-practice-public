import {speechAsset,type SpeechWorkerReply} from './speechModels';
let worker:Worker|null=null;
let sequence=0;
let pending:{id:number;resolve:(text:string)=>void;reject:(error:Error)=>void;progress?:(message:string)=>void}|null=null;
function getWorker(){
 if(worker)return worker;
 worker=new Worker(new URL('../workers/speech.worker.ts',import.meta.url),{type:'module'});
 worker.onmessage=(event:MessageEvent<SpeechWorkerReply>)=>{
  const reply=event.data,current=pending;if(!current||reply.id!==current.id)return;
  if(reply.type==='progress'){current.progress?.(reply.message||'음성 모델을 준비하고 있어요…');return;}
  pending=null;
  if(reply.type==='error')current.reject(new Error(reply.message));else current.resolve(reply.text||'');
 };
 worker.onerror=()=>{const current=pending;pending=null;worker?.terminate();worker=null;current?.reject(new Error('음성 인식 엔진을 시작할 수 없어요. 직접 입력해 주세요.'));};
 return worker;
}
function request(type:'prepare'|'transcribe',audio?:Float32Array,progress?:(message:string)=>void){
 if(pending)return Promise.reject(new Error('앞선 음성 처리를 먼저 마쳐주세요.'));
 return new Promise<string>((resolve,reject)=>{
  const id=++sequence;
  pending={id,resolve,reject,progress};
  try{getWorker().postMessage({id,type,audio,assets:new URL(speechAsset('/onnx/'),location.origin).href},audio?[audio.buffer]:[]);}catch(error){pending=null;reject(error);}
 });
}
export const prepareRecognition=(progress:(message:string)=>void)=>request('prepare',undefined,progress);
export const transcribeAudio=(audio:Float32Array)=>request('transcribe',audio);
export function cancelRecognition(){
 const current=pending;if(!current)return;
 pending=null;worker?.terminate();worker=null;current.reject(new DOMException('취소됨','AbortError'));
}
export function supportsLocalRecognition(){return typeof window!=='undefined'&&typeof Worker!=='undefined'&&!!navigator.mediaDevices?.getUserMedia&&typeof MediaRecorder!=='undefined'&&typeof AudioContext!=='undefined';}
export async function decodeMicrophoneAudio(blob:Blob){
 const context=new AudioContext();
 try{
  const buffer=await context.decodeAudioData(await blob.arrayBuffer());
  const offline=new OfflineAudioContext(1,Math.max(1,Math.ceil(buffer.duration*16000)),16000);
  const source=offline.createBufferSource();source.buffer=buffer;source.connect(offline.destination);source.start();
  return (await offline.startRendering()).getChannelData(0).slice();
 }finally{await context.close();}
}
