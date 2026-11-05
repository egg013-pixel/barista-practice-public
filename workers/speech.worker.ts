import {env,pipeline,type AutomaticSpeechRecognitionPipeline} from '@huggingface/transformers';
import {speechModels} from '../lib/speechModels';
env.allowLocalModels=false;
// Optional operator-controlled mirror; the default only downloads public model assets.
env.remoteHost=process.env.NEXT_PUBLIC_SPEECH_MODEL_HOST||'https://huggingface.co/';
env.useBrowserCache=false;
env.useFSCache=false;
type ASRLoader=(task:'automatic-speech-recognition',model:string,options:{revision:string;device:'webgpu'|'wasm';dtype:'q4'|'q8';progress_callback:(progress:{status:string;progress?:number})=>void})=>Promise<AutomaticSpeechRecognitionPipeline>;
// Narrow the SDK's all-task generic union at this typed boundary.
const loadASR=pipeline as unknown as ASRLoader;
let engine:AutomaticSpeechRecognitionPipeline|null=null;
let modelLabel='';
let loading:Promise<void>|null=null;
async function prepare(id:number,assets:string){
 if(engine)return;
 if(loading)return loading;
 loading=(async()=>{
  env.backends.onnx.wasm!.numThreads=1;
  env.backends.onnx.wasm!.proxy=false;
  env.backends.onnx.wasm!.wasmPaths=assets;
  const gpu=(navigator as unknown as {gpu?:{requestAdapter:()=>Promise<unknown>}}).gpu;
  const hasGPU=!!(gpu&&await Promise.race([gpu.requestAdapter().catch(()=>null),new Promise<null>(resolve=>setTimeout(()=>resolve(null),1500))]));
  const config=hasGPU?speechModels.turbo:speechModels.compact;
  // Pin discovery/HEAD requests too: the SDK's file discovery does not forward revision.
  env.remotePathTemplate='{model}/resolve/'+config.revision+'/';
  modelLabel=config.label;
  self.postMessage({id,type:'progress',message:`${modelLabel} 준비 중 · 처음 약 ${config.megabytes}MB를 내려받아요. 취소하고 직접 입력할 수도 있어요.`});
  try{
   engine=await loadASR('automatic-speech-recognition',config.id,{
    revision:config.revision,device:hasGPU?'webgpu':'wasm',dtype:hasGPU?'q4':'q8',
    progress_callback:(progress)=>{if(progress.status==='progress')self.postMessage({id,type:'progress',message:`${modelLabel} 준비 중 · ${Math.round(progress.progress||0)}%`});}
   });
  }catch(error){loading=null;throw error;}
 })();
 await loading;
}
self.onmessage=async(event:MessageEvent<{id:number;type:'prepare'|'transcribe';assets:string;audio?:Float32Array}>)=>{
 const {id,type,assets,audio}=event.data;
 try{
  await prepare(id,assets);
  if(type==='prepare'){self.postMessage({id,type:'ready',message:modelLabel});return;}
  if(!audio||!engine)throw Error('음성을 읽을 수 없어요.');
  const output=await engine(audio,{language:'korean',task:'transcribe',chunk_length_s:25,stride_length_s:5,return_timestamps:false,max_new_tokens:256});
  const text=(Array.isArray(output)?output.map(row=>row.text).join(' '):output.text).trim();
  self.postMessage({id,type:'result',text});
 }catch(error){console.warn('Local speech engine:',error instanceof Error?error.message:'runtime error');self.postMessage({id,type:'error',message:'기기에서 음성 모델을 실행하지 못했어요. 인터넷과 기기 메모리를 확인하거나 직접 입력해 주세요.'});}
};
