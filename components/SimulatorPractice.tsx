'use client';
import dynamic from 'next/dynamic';
import {useEffect,useRef,useState} from 'react';
import {UserRound,Coffee,Hand,Check,ArrowRight,Maximize2,Minimize2,MessageCircle} from 'lucide-react';
import {currentAction,completeAction,actionsComplete,simulatorActions} from '@/data/simulator';
import type {BaristaStep,Evaluation} from '@/types/practice';
import {PracticeCard} from './PracticeCard';
const ExamScene=dynamic(()=>import('./ExamScene'),{ssr:false,loading:()=> <div className="exam-scene scene-loading">시험장을 준비하고 있어요…</div>});
export function SimulatorPractice(props:{step:BaristaStep;text:string;evaluation:Evaluation|null;hintLevel:number;busy:boolean;completed:string[];onAction:(ids:string[])=>void;onText:(t:string,s:'voice'|'text')=>void;onSubmit:()=>void;onRetry:()=>void;onHint:()=>void;onNext:()=>void}) {
 const {step,completed,evaluation,onAction,busy}=props;
 const action=currentAction(step.id,completed),done=actionsComplete(step.id,completed);
 const [view,setView]=useState<'judge'|'station'>('judge');
 const [expanded,setExpanded]=useState(false);
 const stage=useRef<HTMLDivElement>(null),speechPanel=useRef<HTMLDivElement>(null);
 const [panelInset,setPanelInset]=useState(.32);
 const [panelBottomInset,setPanelBottomInset]=useState(0);
 const [message,setMessage]=useState('');
 const canAct=!busy&&(step.id===11||!!evaluation);
 useEffect(()=>{setView(step.id===11?'station':'judge');setMessage('');speechPanel.current?.scrollTo({top:0});},[step.id]);
 useEffect(()=>{if(action&&canAct)setView(action.view);},[action?.id,canAct]);
 useEffect(()=>{
  const container=stage.current,panel=speechPanel.current;
  if(!container||!panel)return;
  const measure=()=>{const area=container.getBoundingClientRect(),card=panel.getBoundingClientRect();const portrait=window.matchMedia('(max-width:759px) and (orientation:portrait)').matches;setPanelInset(portrait?0:Math.min(.48,(area.right-card.left+18)/area.width));setPanelBottomInset(portrait?Math.min(.6,(area.bottom-card.top+14)/area.height):0);};
  const observer=new ResizeObserver(measure);observer.observe(container);observer.observe(panel);measure();
  return()=>observer.disconnect();
 },[]);
 useEffect(()=>{if(!expanded)return;const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setExpanded(false);};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[expanded]);
 function activate(){if(!action||!canAct)return;onAction(completeAction(step.id,completed,action.id));setMessage(action.description);}
 const tasks=simulatorActions[step.id]||[];
 return <div ref={stage} className={`simulator-practice ${expanded?'scene-expanded':''}`}><section className="exam-panel" aria-label="3D 시험장 동작 연습"><div className="exam-toolbar"><div className="exam-room-title"><span className="exam-room-mark"><Coffee size={23}/></span><span><span className="eyebrow">BARISTA EXAM · FIRST PERSON</span><strong>바리스타 실기 시험장</strong></span></div><div className="exam-toolbar-actions"><div className="exam-view-buttons" aria-label="바라볼 곳 선택"><button className="button secondary" aria-pressed={view==='judge'} onClick={()=>setView('judge')}><UserRound size={17}/>심사위원 보기</button><button className="button secondary" aria-pressed={view==='station'} onClick={()=>setView('station')}><Coffee size={17}/>작업대 보기</button></div><button className="button exam-expand-button" aria-label={expanded?'기본 크기':'화면 크게'} aria-pressed={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?<Minimize2 size={17}/>:<Maximize2 size={17}/>}<span>{expanded?'기본 크기':'화면 크게'}</span></button></div></div>
 <ExamScene view={view} completed={completed} target={action?.target} enabled={canAct&&view===action?.view} onActivate={activate} panelInset={panelInset} panelBottomInset={panelBottomInset}/>
 <div className="exam-stage-caption"><span className="exam-live-status"><i/>실기 연습 중</span><span>{view==='judge'?'정면 · 심사위원석':'측면 · 음료 제조 작업대'}</span><strong>STEP {String(step.id).padStart(2,'0')} <span>/ 11</span></strong></div></section>
 <div className="simulator-controls"><section className="exam-task" aria-label="이번 단계의 동작"><div className="exam-task-top"><span className="task-icon">{done&&tasks.length?<Check size={21}/>:tasks.length?<Hand size={21}/>:<MessageCircle size={21}/>}</span><div><span className="eyebrow">{tasks.length?'이번 단계의 동작':'지금은 말하는 단계'}</span><h2>{action?action.label:tasks.length?'이번 동작을 마쳤어요':'심사위원을 바라보고 말해보세요'}</h2></div>{tasks.length>0&&<span className="action-count">{tasks.filter(a=>completed.includes(a.id)).length} / {tasks.length}</span>}</div>
 {action&&<><p>{canAct?action.description:'먼저 대사 패널에서 말하거나 입력하고 확인해 주세요.'}</p><button className="button primary action-button" disabled={!canAct} onClick={activate}>{action.label}<ArrowRight size={19}/></button><small>버튼 또는 해당 물체를 눌러 동작해요.</small></>}
 {message&&<p className="action-message" role="status">✓ {message}</p>}
 {done&&tasks.length>0&&<p>동작을 잘 마쳤어요. {step.id===11?'이제 마무리 대사를 말해보세요.':'대사 피드백을 확인하고 다음 단계로 가요.'}</p>}
 {completed.some(id=>id.endsWith('-take'))&&action?.target==='table'&&<div className="carrying-badge">잔을 들고 있어요 · 심사위원에게 서빙해요</div>}
 <details className="simulator-note"><summary>연습 안내</summary><p>대본과 동작의 흐름을 익히는 연습이에요. 실제 머신 조작과 추출 시간·온도는 교사와 함께 연습해요.</p></details></section>
 <div ref={speechPanel} className="simulator-speech-panel" role="region" aria-label="대사 연습과 마이크"><PracticeCard {...props} voiceLocked={step.id===11&&!done} nextDisabled={!done} nextNote={!done?'이번 단계의 동작을 마치면 다음 단계로 갈 수 있어요.':undefined}/></div>
 </div></div>;
}
