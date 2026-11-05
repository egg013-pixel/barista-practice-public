import {speechAsset} from './speechModels';
let pending:ReturnType<typeof setTimeout>|undefined;
let audio:HTMLAudioElement|null=null;
let generation=0;
let enabled=true;
export function examinerVoiceEnabled(){return enabled;}
export function stopExaminerSpeech(){
 generation++;clearTimeout(pending);pending=undefined;
 if(audio){audio.onerror=null;audio.onended=null;audio.pause();audio.removeAttribute('src');audio.load();}
}
export function setExaminerVoiceEnabled(value:boolean){enabled=value;if(!value)stopExaminerSpeech();}
/** Fixed synthetic Korean male prompts generated locally with Qwen3-TTS. */
export function speakExaminerInstruction(stepId:number,onError?:()=>void,userGesture=false){
 stopExaminerSpeech();
 if(!enabled||typeof window==='undefined')return;
 if(!Number.isInteger(stepId)||stepId<1||stepId>11){onError?.();return;}
 const token=generation;
 const play=()=>{
  if(token!==generation||!enabled)return;
  audio??=new Audio();const current=audio;
  current.src=speechAsset(`/audio/examiner/step-${String(stepId).padStart(2,'0')}.wav?voice=aiden-gentle-v1`);
  current.preload='auto';current.onerror=()=>{if(token===generation)onError?.();};
  void current.play().catch(error=>{if(token===generation&&error?.name!=='AbortError')onError?.();});
 };
 // Deferred automatic playback survives React Strict Mode's mount/cleanup cycle.
 // Explicit user retries play immediately to satisfy mobile autoplay rules.
 if(userGesture)play();else pending=setTimeout(play,0);
}
