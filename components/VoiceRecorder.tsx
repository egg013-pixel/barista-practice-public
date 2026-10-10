'use client';
import { useEffect,useRef,useState } from 'react';
import { Mic,Square,Keyboard,RotateCcw } from 'lucide-react';
import { createRecognition,speechErrors,type SpeechRecognizer } from '@/lib/speech';
import { stopExaminerSpeech } from '@/lib/examinerSpeech';
export function VoiceRecorder({text,onText,onSubmit,onRetry,disabled,hasResult,onListeningChange}:{text:string;onText:(text:string,source:'voice'|'text')=>void;onSubmit:()=>void;onRetry:()=>void;disabled:boolean;hasResult:boolean;onListeningChange?:(listening:boolean)=>void}) {
  const [listening,setListening]=useState(false),[manual,setManual]=useState(false),[message,setMessage]=useState('');
  const recognition=useRef<SpeechRecognizer|null>(null),textRef=useRef(text);
  textRef.current=text;
  useEffect(()=>{onListeningChange?.(listening);},[listening,onListeningChange]);
  useEffect(()=>()=>{const r=recognition.current;if(r){r.onend=null;r.onresult=null;r.onerror=null;r.abort();}},[]);
  function start() {
    stopExaminerSpeech();
    const r=createRecognition();
    if(!r){setMessage('이 브라우저에서는 직접 입력으로 연습해 주세요. 음성은 Chrome을 권장해요.');setManual(true);return;}
    recognition.current=r;setMessage('');setManual(false);onText('','voice');let final='';
    r.onresult=e=>{
      let interim='';
      for(let i=e.resultIndex;i<e.results.length;i++) {const result=e.results[i];if(result.isFinal)final+=result[0].transcript+' ';else interim+=result[0].transcript;}
      onText((final+interim).trim(),'voice');
    };
    r.onerror=e=>{setMessage(speechErrors[e.error]||'다시 말하거나 직접 입력해 주세요.');setListening(false);};
    r.onend=()=>{setListening(false);recognition.current=null;};
    try{r.start();setListening(true);}catch{setMessage('음성 인식을 시작할 수 없어요. 직접 입력해 주세요.');setListening(false);setManual(true);}
  }
  function stop(){recognition.current?.stop();setListening(false);}
  return <div className="voice-area">
    <button className={`mic-button ${listening?'listening':''}`} disabled={disabled||hasResult} onClick={()=>listening?stop():start()} aria-pressed={listening}>
      {listening?<Square size={32}/>:<Mic size={34}/>}<span>{listening?'말하기 마치기':'말하기'}</span>
    </button>
    <p className="mic-caption" aria-live="polite">{listening?'듣고 있어요… 천천히 말해도 괜찮아요.':'마이크를 누르고, 편하게 말해보세요.'}</p>
    {message&&<p className="notice" role="status">{message}</p>}
    {(text||manual||listening)&&<div className="transcript"><label htmlFor="spoken">내가 말한 내용</label>
      {manual?<textarea id="spoken" value={text} maxLength={4000} disabled={disabled||hasResult} onChange={e=>onText(e.target.value,'text')} placeholder="말하고 싶은 내용을 적어주세요."/>:<p id="spoken" aria-live="polite">{text||'목소리를 기다리고 있어요…'}</p>}
    </div>}
    {!hasResult&&text.trim()&&!listening&&<button className="button primary evaluate" onClick={onSubmit} disabled={disabled}>{disabled?'내용을 확인하고 있어요…':'말한 내용 확인하기'}</button>}
    <div className="voice-alternatives">
      <button className="button quiet" disabled={disabled||listening} onClick={()=>{onRetry();setMessage('');setManual(false);}}><RotateCcw size={18}/>다시 말하기</button>
      <button className="button quiet" disabled={disabled||listening} onClick={()=>{if(hasResult)onRetry();setManual(true);setMessage('');}}><Keyboard size={18}/>직접 입력하기</button>
    </div>
    <p className="privacy-note">음성 파일은 저장하지 않아요. 말한 내용만 연습 기록에 남아요.</p>
  </div>;
}
