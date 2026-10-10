'use client';
import Link from 'next/link';
import { useEffect,useState } from 'react';
import { Coffee,Download,ArrowLeft,Trash2 } from 'lucide-react';
import { getRecords,getSessions,downloadRecords,deleteSessions } from '@/lib/storage';
import type { PracticeRecord,PracticeSession } from '@/types/practice';
import { resultLabels } from '@/components/FeedbackCard';
export default function Admin() {
 const [records,setRecords]=useState<PracticeRecord[]>([]),[sessions,setSessions]=useState<PracticeSession[]>([]),[query,setQuery]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>{try{setRecords(getRecords());setSessions(getSessions());}catch(e){setMessage((e as Error).message);}},[]);
 const [from,setFrom]=useState(''),[to,setTo]=useState(''),[selected,setSelected]=useState<string[]>([]),[deleting,setDeleting]=useState<string[]>([]);
 const invalidRange=!!(from&&to&&from>to);
 const localDate=(value:string)=>{const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
 const visible=sessions.filter(s=>`${s.student.name} ${s.student.number}`.includes(query)&&!invalidRange&&(!from||localDate(s.startedAt)>=from)&&(!to||localDate(s.startedAt)<=to));
 const visibleIds=new Set(visible.map(s=>s.id));
 const selectedVisible=selected.filter(id=>visibleIds.has(id));
 const filteredRecords=records.filter(r=>visibleIds.has(r.sessionId));
 function remove(){try{deleteSessions(deleting);setRecords(getRecords());setSessions(getSessions());setSelected(ids=>ids.filter(id=>!deleting.includes(id)));setMessage(`${deleting.length}개 연습과 해당 시도 기록을 이 브라우저에서 삭제했어요.`);setDeleting([]);}catch{setMessage('기록을 삭제하지 못했어요. 기기 저장 공간을 확인해 주세요.');}}

 return <div className="app-shell"><header className="site-header"><Link href="/" className="brand"><span className="brand-mark"><Coffee/></span><span>차근차근 <strong>바리스타</strong><small>교사용 연습 기록</small></span></Link><Link className="teacher-link" href="/"><ArrowLeft size={17}/>학생 화면</Link></header><main className="main-content admin-main"><div className="admin-top"><div><span className="eyebrow">TEACHER’S NOTE</span><h1>함께 살펴보는 연습 기록</h1><p>이 기기에서 연습한 과정을 확인하세요.</p></div></div>
 <div className="notice">이 화면은 이 브라우저의 기록만 보여줘요. 필요한 기록은 CSV로 내려받아 보관하세요. 공용 기기에서는 다른 학생의 기록을 볼 수 있으니 교사의 관리하에 사용해 주세요.</div>
 <div className="admin-stats"><div><strong>{new Set(visible.map(s=>s.student.name+'|'+s.student.number)).size}</strong><span>연습한 학생</span></div><div><strong>{visible.filter(s=>s.completedAt).length}</strong><span>완료한 연습</span></div><div><strong>{filteredRecords.length}</strong><span>저장된 시도 기록</span></div></div>
 <div className="admin-actions"><button className="button secondary" onClick={()=>downloadRecords(filteredRecords)}><Download size={17}/>현재 목록 CSV 내려받기</button></div>
 {message&&<p className="notice" role="status">{message}</p>}
 <div className="admin-period"><div><label htmlFor="period-from">시작일</label><input id="period-from" type="date" value={from} max={to||undefined} onChange={e=>{setFrom(e.target.value);setSelected([]);setDeleting([]);}}/></div><div><label htmlFor="period-to">종료일</label><input id="period-to" type="date" value={to} min={from||undefined} onChange={e=>{setTo(e.target.value);setSelected([]);setDeleting([]);}}/></div><button className="button secondary" onClick={()=>{setFrom('');setTo('');setQuery('');setSelected([]);setDeleting([]);}}>전체 기간 보기</button></div>
 {invalidRange&&<p role="alert" className="notice">종료일을 시작일 이후로 선택해 주세요.</p>}
 <p className="admin-note">연습 시작 날짜를 기준으로 기간을 선택해요. 종료일도 포함돼요.</p>
 <label className="filter-label" htmlFor="filter">학생 이름 또는 수험번호로 찾기</label><input id="filter" value={query} onChange={e=>{setQuery(e.target.value);setSelected([]);setDeleting([]);}} placeholder="학생 이름 또는 번호"/>
 <div className="admin-selection"><span>표시된 연습 {visible.length}개 · 선택 {selectedVisible.length}개</span><button className="button secondary" disabled={!selectedVisible.length} onClick={()=>setDeleting(selectedVisible)}><Trash2 size={17}/>선택한 기록 삭제</button></div>
 {deleting.length>0&&<div role="dialog" aria-modal="false" aria-labelledby="delete-title" className="admin-delete-confirm"><h2 id="delete-title">연습 {deleting.length}개를 삭제할까요?</h2><p>해당 연습의 모든 시도 기록과 이어하기 정보가 이 브라우저에서 삭제돼요.</p><div><button autoFocus className="button secondary" onClick={()=>setDeleting([])}>취소</button><button className="button primary" onClick={remove}>삭제하기</button></div></div>}
 <div className="table-wrap" style={{marginTop:20}}>{visible.length?<table><thead><tr><th><input className="record-check" type="checkbox" aria-label="현재 목록 모두 선택" checked={visible.length>0&&selectedVisible.length===visible.length} onChange={e=>setSelected(e.target.checked?visible.map(s=>s.id):[])}/></th><th>학생 / 수험번호</th><th>연습 날짜</th><th>완료 여부</th><th>평균 결과</th><th>힌트 / 대본</th><th>재시도</th><th>관리</th></tr></thead><tbody>{visible.slice().reverse().map(s=>{
 const rows=records.filter(r=>r.sessionId===s.id);const last=[...new Map(rows.map(r=>[r.step,r])).values()];const average=last.length?last.reduce((sum,r)=>sum+(r.evaluation==='excellent'?2:r.evaluation==='good'?1:0),0)/last.length:0;
 return <tr key={s.id}><td><input className="record-check" type="checkbox" aria-label={`${s.student.name} ${s.student.number}번 ${new Date(s.startedAt).toLocaleDateString('ko-KR')} 기록 선택`} checked={selectedVisible.includes(s.id)} onChange={e=>setSelected(ids=>e.target.checked?[...ids,s.id]:ids.filter(id=>id!==s.id))}/></td><td><strong>{s.student.name}</strong><br/><span>{s.student.number}번</span></td><td>{new Date(s.startedAt).toLocaleDateString('ko-KR')}</td><td>{s.completedAt?'✅ 완료':`${s.completedSteps.length}/11 진행 중`}</td><td>{last.length?resultLabels[average>=1.5?'excellent':average>=.5?'good':'retry']:'연습 전'}</td><td>{s.hintSteps.length} / {s.scriptSteps.length}회</td><td>{rows.length-last.length}회</td><td><button className="button quiet" aria-label={`${s.student.name} ${s.student.number}번 기록 삭제`} onClick={()=>setDeleting([s.id])}><Trash2 size={16}/>삭제</button></td></tr>;
 })}</tbody></table>:<div className="empty-state">아직 표시할 연습 기록이 없어요.</div>}</div><p className="admin-note">평균 결과는 각 단계의 마지막 평가를 참고한 연습 안내예요. 시험 점수가 아니에요. CSV에는 모든 시도와 힌트·대본 사용 여부가 포함돼요.</p></main></div>;
}
