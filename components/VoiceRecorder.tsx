'use client';
import {useEffect,useRef,useState} from 'react';
import {Mic,Square,Keyboard,RotateCcw} from 'lucide-react';
import {supportsLocalRecognition,prepareRecognition,transcribeAudio,cancelRecognition,decodeMicrophoneAudio} from '@/lib/speech';
import {stopExaminerSpeech} from '@/lib/examinerSpeech';
export function VoiceRecorder({text,onText,onSubmit,onRetry,disabled,hasResult,onListeningChange}:{text:string;onText:(text:string,source:'voice'|'text')=>void;onSubmit:()=>void;onRetry:()=>void;disabled:boolean;hasResult:boolean;onListeningChange?:(listening:boolean)=>void}){
 const [phase,setPhase]=useState<'idle'|'preparing'|'listening'|'transcribing'>('idle'),[manual,setManual]=useState(false),[message,setMessage]=useState('');
 const generation=useRef(0),recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const active=phase!=='idle';
 function release(){clearTimeout(timer.current);stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;recorder.current=null;}
 function cancel(){generation.current++;const r=recorder.current;if(r){r.ondataavailable=null;r.onstop=null;if(r.state!=='inactive')r.stop();}release();cancelRecognition();}
 useEffect(()=>{onListeningChange?.(active);},[active,onListeningChange]);
 useEffect(()=>()=>{cancel();},[]);
 async function start(){
  stopExaminerSpeech();cancel();const id=generation.current;
  if(!supportsLocalRecognition()){setMessage('이 브라우저에서는 직접 입력으로 연습해 주세요.');setManual(true);return;}
  setPhase('preparing');setManual(false);setMessage('한국어 음성 모델을 준비하고 있어요…');onText('','voice');
  try{
   await prepareRecognition(message=>{if(id===generation.current)setMessage(message);});
   if(id!==generation.current)return;
   setMessage('마이크 사용 권한을 확인해 주세요.');
   const media=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,channelCount:1}});
   if(id!==generation.current){media.getTracks().forEach(track=>track.stop());return;}
   stream.current=media;const r=new MediaRecorder(media),chunks:Blob[]=[];recorder.current=r;
   r.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
   r.onerror=()=>{if(id!==generation.current)return;cancel();setPhase('idle');setManual(true);setMessage('마이크를 읽지 못했어요. 다시 시도하거나 직접 입력해 주세요.');};
   r.onstop=async()=>{
    release();if(id!==generation.current)return;setPhase('transcribing');setMessage('내 기기에서 말한 내용을 글로 바꾸고 있어요…');
    try{
     const audio=await decodeMicrophoneAudio(new Blob(chunks,{type:r.mimeType}));chunks.length=0;
     if(id!==generation.current)return;
     const rms=Math.sqrt(audio.reduce((sum,value)=>sum+value*value,0)/Math.max(audio.length,1));
     if(rms<.002)throw Error('목소리를 듣지 못했어요. 조금 크게 다시 말해보세요.');
     const transcript=await transcribeAudio(audio);
     if(id!==generation.current)return;
     if(!transcript)throw Error('말한 내용을 찾지 못했어요. 다시 말하거나 직접 입력해 주세요.');
     onText(transcript,'voice');setMessage('음성 인식을 마쳤어요. 내용을 확인해 주세요.');setPhase('idle');
    }catch(error){if(id!==generation.current)return;setPhase('idle');setManual(true);setMessage(error instanceof Error?error.message:'음성 인식에 실패했어요. 직접 입력해 주세요.');}
   };
   r.start();setPhase('listening');setMessage('듣고 있어요… 30초까지 말하고 말하기 마치기를 눌러주세요.');
   timer.current=setTimeout(()=>{if(id===generation.current&&r.state==='recording')r.stop();},30000);
  }catch(error){if(id!==generation.current)return;release();setPhase('idle');setManual(true);setMessage(error instanceof DOMException&&error.name==='NotAllowedError'?'마이크 사용을 허용하거나 직접 입력해 주세요.':error instanceof Error?error.message:'음성 모델을 준비하지 못했어요. 직접 입력해 주세요.');}
 }
 function press(){if(phase==='listening'){recorder.current?.stop();setPhase('transcribing');}else if(active){cancel();setPhase('idle');setMessage('음성 처리를 취소했어요.');}else void start();}
 return <div className="voice-area">
  <button className={`mic-button ${phase==='listening'?'listening':''}`} disabled={disabled||hasResult} onClick={press} aria-pressed={active}>{active?<Square size={32}/>:<Mic size={34}/>}<span>{phase==='preparing'?'준비 취소':phase==='transcribing'?'인식 취소':phase==='listening'?'말하기 마치기':'말하기'}</span></button>
  <p className="mic-caption" aria-live="polite">{message||'마이크를 누르고, 편하게 말해보세요.'}</p>
  {(text||manual||phase==='listening')&&<div className="transcript"><label htmlFor="spoken">내가 말한 내용</label>{manual?<textarea id="spoken" value={text} maxLength={4000} disabled={disabled||hasResult} onChange={e=>onText(e.target.value,'text')} placeholder="말하고 싶은 내용을 적어주세요."/>:<p id="spoken" aria-live="polite">{text||'목소리를 기다리고 있어요…'}</p>}</div>}
  {!hasResult&&text.trim()&&!active&&<button className="button primary evaluate" onClick={onSubmit} disabled={disabled}>{disabled?'내용을 확인하고 있어요…':'말한 내용 확인하기'}</button>}
  <div className="voice-alternatives"><button className="button quiet" disabled={disabled||active} onClick={()=>{onRetry();setMessage('');setManual(false);}}><RotateCcw size={18}/>다시 말하기</button><button className="button quiet" disabled={disabled} onClick={()=>{cancel();setPhase('idle');if(hasResult)onRetry();setManual(true);setMessage('');}}><Keyboard size={18}/>직접 입력하기</button></div>
  <p className="privacy-note">처음에는 모델 약 250~770MB를 내려받아요. 음성과 대사는 기기 안에서 처리하며 저장·전송하지 않아요.</p>
 </div>;
}
