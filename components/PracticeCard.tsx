import { useState } from 'react';
import { MessageCircle,ArrowRight,Hand } from 'lucide-react';
import type { BaristaStep,Evaluation } from '@/types/practice';
import { VoiceRecorder } from './VoiceRecorder';
import { FeedbackCard } from './FeedbackCard';
import { HintPanel } from './HintPanel';
import { ExaminerVoice } from './ExaminerVoice';
export function PracticeCard({step,text,evaluation,hintLevel,busy,onText,onSubmit,onRetry,onHint,onNext,nextDisabled=false,nextNote,voiceLocked=false}:{step:BaristaStep;text:string;evaluation:Evaluation|null;hintLevel:number;busy:boolean;onText:(t:string,s:'voice'|'text')=>void;onSubmit:()=>void;onRetry:()=>void;onHint:()=>void;onNext:()=>void;nextDisabled?:boolean;nextNote?:string;voiceLocked?:boolean}) {
 const [listening,setListening]=useState(false);
 return <section className="practice-card" aria-labelledby="step-title"><div className="step-heading"><span className="eyebrow">STEP {String(step.id).padStart(2,'0')}</span><h1 id="step-title">{step.id}단계. {step.title}</h1></div>
 <div className="instruction"><MessageCircle size={24}/><div><div className="instruction-label"><span>지금 해야 할 말</span><ExaminerVoice key={step.id} instruction={step.instruction} disabled={listening}/></div><p>{step.instruction}</p></div></div>
 <details className="action-guide"><summary><Hand size={17}/>함께 할 행동 보기</summary><p>{step.action}</p></details>
 {voiceLocked?<p className="notice">먼저 위의 버튼으로 머신과 작업대를 정리해 주세요. 정리 후 마무리 대사를 말할 수 있어요.</p>:<VoiceRecorder text={text} onText={onText} onSubmit={onSubmit} onRetry={onRetry} disabled={busy} hasResult={!!evaluation} onListeningChange={setListening}/>}
 {evaluation&&<FeedbackCard evaluation={evaluation}/>}
 <HintPanel step={step} level={hintLevel} onHint={onHint}/>
 {evaluation&&nextNote&&<p className="notice">{nextNote}</p>}
 {evaluation&&<button className="button primary next-button" disabled={nextDisabled} onClick={onNext}>{evaluation.result==='retry'?'그래도 다음 단계':step.id===11?'연습 마치기':'다음 단계'}<ArrowRight size={20}/></button>}
 <div className="card-footnote">틀려도 괜찮아요. 나만의 속도로 연습해요.</div></section>;
}
