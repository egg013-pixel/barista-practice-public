'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {Coffee,Check,RotateCcw,Clock,Lightbulb,ChevronLeft,Box} from 'lucide-react';
import {baristaScript} from '@/data/baristaScript';
import {evaluate} from '@/lib/evaluator';
import type {Evaluation,PracticeMode,Level} from '@/types/practice';
import {ProgressBar} from './ProgressBar';
import {PracticeCard} from './PracticeCard';
import {SimulatorPractice} from './SimulatorPractice';
import {actionsComplete} from '@/data/simulator';
import {resultLabels} from './FeedbackCard';
import {WelcomeExperience} from './WelcomeExperience';
interface LivePractice {mode:PracticeMode;startedAt:number;completedAt?:number;stepIndex:number;completedSteps:number[];hintSteps:number[];scriptSteps:number[];simulatorActions:string[]}
const symbols={excellent:'✅',good:'🟡',retry:'🔄'};
function duration(seconds:number){return `${Math.floor(seconds/60)}분 ${seconds%60}초`;}
export default function PracticeApp(){
 const [mode,setMode]=useState<PracticeMode>('script');
 const [view,setView]=useState<'welcome'|'practice'|'complete'>('welcome');
 const [session,setSession]=useState<LivePractice|null>(null);
 const [attempts,setAttempts]=useState<{step:number;result:Level}[]>([]);
 const [text,setText]=useState(''),[feedback,setFeedback]=useState<Evaluation|null>(null);
 const [hintLevel,setHintLevel]=useState(0),[busy,setBusy]=useState(false);
 const lock=useRef(false),heading=useRef<HTMLDivElement>(null);
 useEffect(()=>{heading.current?.focus();},[view,session?.stepIndex]);
 const step=session?baristaScript[session.stepIndex]:null;
 function begin(){setSession({mode,startedAt:Date.now(),stepIndex:0,completedSteps:[],hintSteps:[],scriptSteps:[],simulatorActions:[]});setAttempts([]);setFeedback(null);setText('');setHintLevel(0);setView('practice');}
 function submit(){
  if(!session||!step||!text.trim()||lock.current||feedback)return;
  lock.current=true;setBusy(true);
  try{const result=evaluate(text,step);setFeedback(result);setAttempts(rows=>[...rows,{step:step.id,result:result.result}]);}
  finally{lock.current=false;setBusy(false);}
 }
 function hint(){if(!session||!step)return;const level=Math.min(2,hintLevel+1);setSession({...session,hintSteps:[...new Set([...session.hintSteps,step.id])],scriptSteps:level===2?[...new Set([...session.scriptSteps,step.id])]:session.scriptSteps});setHintLevel(level);}
 function next(){
  if(!session||!step||!feedback)return;
  if(session.mode==='simulator'&&!actionsComplete(step.id,session.simulatorActions))return;
  const final=step.id===11;
  setSession({...session,completedSteps:[...new Set([...session.completedSteps,step.id])],stepIndex:final?10:session.stepIndex+1,...(final?{completedAt:Date.now()}:{})});setFeedback(null);setText('');setHintLevel(0);setView(final?'complete':'practice');
 }
 function retry(){setFeedback(null);setText('');}
 function home(){setSession(null);setAttempts([]);setFeedback(null);setText('');setHintLevel(0);setView('welcome');}
 const retries=attempts.length-new Set(attempts.map(row=>row.step)).size;
 const elapsed=session?Math.round(((session.completedAt||Date.now())-session.startedAt)/1000):0;
 return <div className="app-shell">
  <header className="site-header"><Link href="/" className="brand"><span className="brand-mark"><Coffee size={26}/></span><span>차근차근 <strong>바리스타</strong><small>한마디씩, 자신 있게</small>{view==='welcome'&&<small className="brand-credit">by 특수샘 혜윰</small>}</span></Link></header>
  <main ref={heading} tabIndex={-1} className={`main-content ${view==='welcome'?'welcome-main':view==='practice'&&session?.mode==='simulator'?'simulator-main':''}`}>
  {view==='welcome'&&<WelcomeExperience mode={mode} onModeChange={setMode} onBegin={begin}/>}
  {view==='practice'&&session&&step&&<><div className="practice-top"><div><span className="eyebrow">PART {step.part}</span><p>{step.part===1?'자기소개 및 원두 소개':'시연 및 음료 서빙'}</p></div></div><ProgressBar step={step.id}/>{session.mode==='simulator'&&<div className="simulator-mode-label"><Box size={17}/>3D 시험장 연습 · 같은 11단계 대본</div>}
  {session.mode==='simulator'?<SimulatorPractice step={step} text={text} evaluation={feedback} hintLevel={hintLevel} busy={busy} onText={setText} onSubmit={submit} onRetry={retry} onHint={hint} onNext={next} completed={session.simulatorActions} onAction={ids=>setSession(current=>current?{...current,simulatorActions:ids}:current)}/>:<PracticeCard key={step.id} step={step} text={text} evaluation={feedback} hintLevel={hintLevel} busy={busy} onText={setText} onSubmit={submit} onRetry={retry} onHint={hint} onNext={next}/>}
  <div className="practice-lower"><button className="text-button" disabled={busy} onClick={home}><ChevronLeft size={16}/>연습을 끝내고 처음 화면으로</button><span>저장하지 않아요 · 새로고침하면 연습이 초기화돼요</span></div></>}
  {view==='complete'&&session&&<section className="completion"><div className="completion-icon"><Coffee size={42}/><Check size={22}/></div><span className="eyebrow">PRACTICE COMPLETE</span><h1>바리스타 실기 연습 완료!</h1><p>오늘도 끝까지 연습했어요.<br/>한마디씩 쌓은 연습이 자신감이 될 거예요.</p>
  <div className="summary-grid"><div><Check/><strong>{session.completedSteps.length} / 11</strong><span>완료 단계</span></div><div><RotateCcw/><strong>{retries}회</strong><span>다시 연습</span></div><div><Lightbulb/><strong>{session.hintSteps.length}회</strong><span>힌트 사용</span></div><div><Clock/><strong>{duration(elapsed)}</strong><span>전체 연습 시간</span></div></div><p className="small">대본을 본 단계: {session.scriptSteps.length}개</p>
  <div className="step-results">{baristaScript.map(s=>{const r=attempts.filter(row=>row.step===s.id).at(-1);return <div key={s.id}><span>{s.id}. {s.title}</span><strong>{r?symbols[r.result]:''} {r?resultLabels[r.result]:'연습 전'}</strong></div>;})}</div>
  <p className="notice">이 결과는 현재 화면에서만 볼 수 있으며 저장되지 않아요.</p><button className="button primary" onClick={begin}><RotateCcw size={18}/>처음부터 다시 연습하기</button><button className="button secondary" onClick={home}>처음 화면으로</button></section>}
  </main><footer className="site-footer"><span><Coffee size={15}/>작은 연습이 만드는 큰 자신감</span><span><Link className="privacy-policy-link" href="/privacy/">개인정보처리방침</Link></span></footer>
 </div>;
}
