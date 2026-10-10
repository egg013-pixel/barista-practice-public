'use client';
import Link from 'next/link';
import { useEffect,useRef,useState } from 'react';
import { Coffee,BookOpen,Check,RotateCcw,Clock,Lightbulb,Download,ChevronLeft,Box } from 'lucide-react';
import { baristaScript,personalizeStep } from '@/data/baristaScript';
import { evaluate } from '@/lib/evaluator';
import { getActive,getRecords,getSessions,saveRecord,saveSession,downloadRecords } from '@/lib/storage';
import type { PracticeSession,PracticeRecord,Evaluation,PracticeMode } from '@/types/practice';
import { ProgressBar } from './ProgressBar';
import { PracticeCard } from './PracticeCard';
import { SimulatorPractice } from './SimulatorPractice';
import { actionsComplete } from '@/data/simulator';
import { resultLabels } from './FeedbackCard';
import { WelcomeExperience } from './WelcomeExperience';
const symbols={excellent:'✅',good:'🟡',retry:'🔄'};
function duration(seconds:number) {return `${Math.floor(seconds/60)}분 ${seconds%60}초`;}
export default function PracticeApp() {
 const [mode,setMode]=useState<PracticeMode>('script');
 const [view,setView]=useState<'welcome'|'practice'|'complete'|'history'>('welcome');
 const [name,setName]=useState(''),[number,setNumber]=useState(''),[session,setSession]=useState<PracticeSession|null>(null);
 const [records,setRecords]=useState<PracticeRecord[]>([]),[resume,setResume]=useState<PracticeSession|null>(null);
 const [text,setText]=useState(''),[source,setSource]=useState<'voice'|'text'>('voice'),[feedback,setFeedback]=useState<Evaluation|null>(null);
 const [hintLevel,setHintLevel]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const started=useRef(Date.now()),lock=useRef(false),heading=useRef<HTMLDivElement>(null);
 useEffect(()=>{
   try{setRecords(getRecords());const active=getActive();setResume(getSessions().find(s=>s.id===active&&!s.completedAt)||null);}catch(e){setError((e as Error).message);}
 },[]);
 useEffect(()=>{heading.current?.focus();},[view,session?.stepIndex]);
 const step=session?personalizeStep(baristaScript[session.stepIndex],session.student):null;
 function persist(s:PracticeSession){saveSession(s);setSession(s);}
 function begin() {
   if(!name.trim()||name.trim().length>50||!/^\d{1,4}$/.test(number.trim())){setError('이름과 수험번호(숫자 1~4자리)를 적어주세요.');return;}
   const s:PracticeSession={mode,simulatorActions:[],id:crypto.randomUUID(),student:{name:name.trim(),number:number.trim()},startedAt:new Date().toISOString(),stepIndex:0,completedSteps:[],hintSteps:[],scriptSteps:[]};
   try{persist(s);setFeedback(null);setText('');setHintLevel(0);started.current=Date.now();setError('');setView('practice');setResume(null);}catch{setError('기기에 기록을 저장할 수 없어요. 저장 공간과 브라우저 설정을 확인해 주세요.');}
 }
 function continuePractice() {
   if(!resume)return;setMode(resume.mode||'script');setSession(resume);setName(resume.student.name);setNumber(resume.student.number);setView('practice');
   const latest=records.filter(r=>r.sessionId===resume.id&&r.step===resume.stepIndex+1).at(-1);
   setFeedback(latest?{result:latest.evaluation,matchedKeywords:latest.matchedKeywords,missingKeywords:latest.missingKeywords,feedback:latest.feedback,source:latest.evaluationSource}:null);setText(latest?.recognizedText||'');
   setHintLevel(resume.scriptSteps.includes(resume.stepIndex+1)?2:resume.hintSteps.includes(resume.stepIndex+1)?1:0);started.current=Date.now();setError('');
 }
 async function submit() {
   if(!session||!step||!text.trim()||lock.current||feedback)return;
   lock.current=true;setBusy(true);setError('');
   let evaluation=evaluate(text,step);
   const record:PracticeRecord={mode:session.mode||'script',recordId:crypto.randomUUID(),timestamp:new Date().toISOString(),studentName:session.student.name,studentNumber:session.student.number,sessionId:session.id,part:`PART${step.part}`,step:step.id,stepTitle:step.title,attempt:records.filter(r=>r.sessionId===session.id&&r.step===step.id).length+1,recognizedText:text,evaluation:evaluation.result,matchedKeywords:evaluation.matchedKeywords,missingKeywords:evaluation.missingKeywords,feedback:evaluation.feedback,hintUsed:hintLevel>=1,scriptViewed:hintLevel>=2,durationSeconds:Math.round((Date.now()-started.current)/1000),source,evaluationSource:evaluation.source,syncStatus:'pending'};
   try{saveRecord(record);setRecords(getRecords());setFeedback(evaluation);}
   catch{setError('연습 기록을 저장할 공간이 부족해요. 기록을 내려받고 교사에게 알려주세요.');}
   finally{lock.current=false;setBusy(false);}
 }
 function hint() {
   if(!session||!step)return;
   const level=Math.min(2,hintLevel+1);
   try{persist({...session,hintSteps:[...new Set([...session.hintSteps,step.id])],scriptSteps:level===2?[...new Set([...session.scriptSteps,step.id])]:session.scriptSteps});setHintLevel(level);}catch{setError('도움 사용 기록을 저장할 수 없어요. 기기 저장 공간을 확인해 주세요.');}
 }
 function next() {
   if(!session||!step||!feedback)return;
   if(session.mode==='simulator'&&!actionsComplete(step.id,session.simulatorActions||[]))return;
   const final=step.id===11;
   const updated={...session,completedSteps:[...new Set([...session.completedSteps,step.id])],stepIndex:final?10:session.stepIndex+1,...(final?{completedAt:new Date().toISOString()}:{})};
   try{persist(updated);setFeedback(null);setText('');setHintLevel(0);started.current=Date.now();setView(final?'complete':'practice');setError('');}
   catch{setError('진행 상황을 저장할 수 없어요. 기기 저장 공간을 확인해 주세요.');}
 }
 function retry(){setFeedback(null);setText('');started.current=Date.now();setError('');}
 const own=records.filter(r=>r.sessionId===session?.id);
 const retries=own.length-new Set(own.map(r=>r.step)).size;
 const elapsed=session?Math.round((new Date(session.completedAt||new Date()).getTime()-new Date(session.startedAt).getTime())/1000):0;
 const visibleRecords=session?records.filter(r=>r.studentName===session.student.name&&r.studentNumber===session.student.number):records;
 return <div className="app-shell">
   <header className="site-header"><Link href="/" className="brand"><span className="brand-mark"><Coffee size={26}/></span><span>차근차근 <strong>바리스타</strong><small>한마디씩, 자신 있게</small></span></Link><Link href="/admin" className="teacher-link"><BookOpen size={17}/>교사용 기록</Link></header>
   <main ref={heading} tabIndex={-1} className={`main-content ${view==='welcome'?'welcome-main':view==='practice'&&session?.mode==='simulator'?'simulator-main':''}`}>
   {error&&<div className="notice" role="alert">{error}</div>}
   {view==='welcome'&&<WelcomeExperience mode={mode} onModeChange={setMode} name={name} onNameChange={setName} number={number} onNumberChange={setNumber} onBegin={begin} resume={resume} onResume={continuePractice}/>}
   {view==='practice'&&session&&step&&<><div className="practice-top"><div><span className="eyebrow">PART {step.part}</span><p>{step.part===1?'자기소개 및 원두 소개':'시연 및 음료 서빙'}</p></div><span className="student-badge">{session.student.name}<span>수험번호 {session.student.number}번</span></span></div><ProgressBar step={step.id}/>{session.mode==='simulator'&&<div className="simulator-mode-label"><Box size={17}/>3D 시험장 연습 · 같은 11단계 대본</div>}
   {session.mode==='simulator'?<SimulatorPractice step={step} text={text} evaluation={feedback} hintLevel={hintLevel} busy={busy} onText={(t:string,s:'voice'|'text')=>{setText(t);setSource(s);}} onSubmit={()=>void submit()} onRetry={retry} onHint={hint} onNext={next} completed={session.simulatorActions||[]} onAction={ids=>{try{persist({...session,simulatorActions:ids});}catch{setError('동작 진행을 저장할 수 없어요. 기기 저장 공간을 확인해 주세요.');}}}/>:<PracticeCard key={`${session.id}-${step.id}`} step={step} text={text} evaluation={feedback} hintLevel={hintLevel} busy={busy} onText={(t:string,s:'voice'|'text')=>{setText(t);setSource(s);}} onSubmit={()=>void submit()} onRetry={retry} onHint={hint} onNext={next}/>}
   <div className="practice-lower"><button className="text-button" disabled={busy} onClick={()=>{setResume(session);setView('welcome');}}><ChevronLeft size={16}/>잠시 쉬기 · 진행은 저장돼요</button><span>기기에 연습 기록을 저장해요</span></div></>}
   {view==='complete'&&session&&<section className="completion"><div className="completion-icon"><Coffee size={42}/><Check size={22}/></div><span className="eyebrow">PRACTICE COMPLETE</span><h1>바리스타 실기 연습 완료!</h1><p>오늘도 끝까지 연습했어요.<br/>한마디씩 쌓은 연습이 자신감이 될 거예요.</p><div className="summary-name">{session.student.name} <span>수험번호 {session.student.number}번</span></div>
     <div className="summary-grid"><div><Check/><strong>{session.completedSteps.length} / 11</strong><span>완료 단계</span></div><div><RotateCcw/><strong>{retries}회</strong><span>다시 연습</span></div><div><Lightbulb/><strong>{session.hintSteps.length}회</strong><span>힌트 사용</span></div><div><Clock/><strong>{duration(elapsed)}</strong><span>전체 연습 시간</span></div></div><p className="small">대본을 본 단계: {session.scriptSteps.length}개</p>
     <div className="step-results">{baristaScript.map(s=>{const r=own.filter(r=>r.step===s.id).at(-1);return <div key={s.id}><span>{s.id}. {s.title}</span><strong>{r?symbols[r.evaluation]:''} {r?resultLabels[r.evaluation]:'기록 없음'}</strong></div>;})}</div>
     <button className="button primary" onClick={begin}><RotateCcw size={18}/>처음부터 다시 연습하기</button><button className="button secondary" onClick={()=>setView('history')}>내 결과 보기</button>
   </section>}
   {view==='history'&&<section className="history"><span className="eyebrow">MY PRACTICE</span><h1>내 연습 기록</h1><p>다시 말한 내용도 모두 남아 있어요.</p><button className="button secondary" onClick={()=>downloadRecords(visibleRecords)}><Download size={18}/>기록 내려받기</button>
   <div className="history-list">{visibleRecords.slice().reverse().map(r=><article key={r.recordId}><div><strong>{r.step}단계 · {r.stepTitle}</strong><span>{symbols[r.evaluation]} {resultLabels[r.evaluation]}</span></div><p>{r.recognizedText}</p><small>{r.attempt}번째 말하기 · {new Date(r.timestamp).toLocaleString('ko-KR')} · 기기에 저장됨</small></article>)}</div>
   <button className="button primary" onClick={()=>setView(session?.completedAt?'complete':'welcome')}>돌아가기</button></section>}
   </main>
   <footer className="site-footer"><span><Coffee size={15}/>작은 연습이 만드는 큰 자신감</span><span>바리스타 2급 실기 연습</span></footer>
 </div>;
}
