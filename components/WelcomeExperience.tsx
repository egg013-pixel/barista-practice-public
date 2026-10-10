'use client';
import dynamic from 'next/dynamic';
import { ArrowRight, BookOpen, Box, Check, Coffee, Lightbulb, Mic, RotateCcw, ShieldCheck } from 'lucide-react';
import type { PracticeMode, PracticeSession } from '@/types/practice';
import styles from './WelcomeExperience.module.css';

const CoffeeHero3D = dynamic(() => import('./CoffeeHero3D'), { ssr: false, loading: () => <CoffeeStill /> });
function CoffeeStill() {
 return <div className={styles.coffeeStill} aria-hidden="true"><svg viewBox="0 0 460 320" fill="none"><defs><linearGradient id="welcome-cup" x1="150" y1="100" x2="315" y2="260" gradientUnits="userSpaceOnUse"><stop stopColor="#fff9e9"/><stop offset="1" stopColor="#bd9d70"/></linearGradient><radialGradient id="welcome-coffee"><stop stopColor="#dba766"/><stop offset="1" stopColor="#70442a"/></radialGradient></defs><ellipse cx="231" cy="267" rx="154" ry="24" fill="#765139" opacity=".12"/><ellipse cx="229" cy="249" rx="137" ry="26" fill="#ebd8b6"/><path d="M313 133C369 119 373 190 320 196" stroke="#e8d4b1" strokeWidth="19"/><path d="M131 126H326L309 210Q285 265 213 244Q147 235 142 205Z" fill="url(#welcome-cup)"/><ellipse cx="230" cy="129" rx="98" ry="37" fill="#fff3d9"/><ellipse cx="230" cy="129" rx="86" ry="27" fill="url(#welcome-coffee)"/><path d="M205 120C208 108 229 111 230 122C234 109 252 110 256 120C260 131 237 145 230 151C215 140 199 131 205 120Z" fill="#f7e6c7"/><path d="M202 81C188 60 218 59 204 35M233 81C219 53 251 54 237 25M263 81C252 60 280 55 270 38" stroke="#fff8e9" strokeWidth="3" strokeLinecap="round" opacity=".6"/></svg></div>;
}
interface Props {
 mode: PracticeMode;
 onModeChange: (mode: PracticeMode) => void;
 name: string;
 onNameChange: (name: string) => void;
 number: string;
 onNumberChange: (number: string) => void;
 onBegin: () => void;
 resume: PracticeSession | null;
 onResume: () => void;
}
export function WelcomeExperience({ mode, onModeChange, name, onNameChange, number, onNumberChange, onBegin, resume, onResume }: Props) {
 return <div className={styles.experience}>
  <section className={styles.hero} aria-labelledby="welcome-title">
   <div className={styles.heroCopy}>
    <span className={styles.kicker}><span />A LITTLE PRACTICE, A BETTER CUP</span>
    <h1 id="welcome-title">커피 한 잔의 시작,<br /><em>자신 있는 한마디.</em></h1>
    <p>따뜻한 커피처럼, 연습도 천천히.<br />나만의 속도로 바리스타 실기 시험을 준비해요.</p>
   </div>
   <div className={styles.visual}><CoffeeHero3D /></div>
   <div className={styles.heroSeal} aria-hidden="true"><Coffee size={18}/><span>BREW YOUR<br/><strong>CONFIDENCE</strong></span></div>
   <div className={styles.heroBottom}><span className={styles.line}/><span>오늘의 작은 연습이, 내일의 자신감으로.</span></div>
  </section>
  <section className={styles.panel} aria-labelledby="start-title">
   <div className={styles.panelHeading}><span className={styles.eyebrow}>YOUR PRACTICE STARTS HERE</span><h2 id="start-title">반가워요, 예비 바리스타!</h2><p>연습할 방법을 고르고, 편하게 시작해요.</p></div>
   <fieldset className={styles.modes}><legend>연습 방법 선택</legend>
    <button type="button" aria-pressed={mode === 'script'} className={`${styles.mode} ${mode === 'script' ? styles.selected : ''}`} onClick={() => onModeChange('script')}><span className={styles.modeIcon}><BookOpen size={23}/></span><span><strong>1. 글 대본 연습</strong><small>한 단계씩 말하고 피드백받아요</small></span><span className={styles.modeCheck}>{mode === 'script' && <Check size={14}/>}</span></button>
    <button type="button" aria-pressed={mode === 'simulator'} className={`${styles.mode} ${mode === 'simulator' ? styles.selected : ''}`} onClick={() => onModeChange('simulator')}><span className={styles.modeIcon}><Box size={23}/></span><span><strong>2. 3D 시험장 연습</strong><small>1인칭으로 만들고 서빙해요</small></span><span className={styles.modeCheck}>{mode === 'simulator' && <Check size={14}/>}</span></button>
   </fieldset>
   <form className={styles.form} onSubmit={event => { event.preventDefault(); onBegin(); }}>
    <div className={styles.fields}><div><label htmlFor="student-name">학생 이름</label><input id="student-name" value={name} onChange={event => onNameChange(event.target.value)} placeholder="이름을 적어주세요" autoComplete="off" maxLength={50} required/></div><div><label htmlFor="student-number">수험번호</label><input id="student-number" value={number} onChange={event => onNumberChange(event.target.value)} placeholder="예: 3" inputMode="numeric" pattern="[0-9]{1,4}" maxLength={4} required/></div></div>
    <button className={styles.start} type="submit"><span>연습 시작하기</span><ArrowRight size={21}/></button>
   </form>
   {resume && <button className={styles.resume} type="button" onClick={onResume}><RotateCcw size={16}/><span>{resume.student.name} 학생 · {resume.stepIndex + 1}단계 이어하기{resume.mode === 'simulator' ? ' · 3D' : ''}</span><ArrowRight size={16}/></button>}
   <div className={styles.facts}><span><Mic size={16}/>말하거나 입력해요</span><span><Lightbulb size={16}/>힌트가 도와줘요</span><span><Check size={16}/>11단계, 차근차근</span></div>
   <div className={styles.privacy}><ShieldCheck size={16}/><p>이름과 말한 내용은 이 기기에 저장돼요.<br/>교사용 기록에서 CSV로 내려받을 수 있어요.<br/>브라우저 음성 서비스가 목소리를 처리할 수 있어요.</p></div>
  </section>
 </div>;
}
