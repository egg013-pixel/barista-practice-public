import type { PracticeRecord,PracticeSession } from '@/types/practice';
const RECORDS='barista-public-records-v1', SESSIONS='barista-public-sessions-v1', ACTIVE='barista-public-active-v1';
function read<T>(key:string,fallback:T):T {
  if(typeof window==='undefined') return fallback;
  const raw=localStorage.getItem(key);
  if(raw===null) return fallback;
  try {return JSON.parse(raw) as T;} catch {throw new Error('저장된 기록을 읽을 수 없어요. 교사에게 알려주세요. 기존 기록은 보관되어 있어요.');}
}
export function getRecords():PracticeRecord[] {return read(RECORDS,[]);}
export function getSessions():PracticeSession[] {return read(SESSIONS,[]);}
export function getActive():string|null {return read(ACTIVE,null);}
export function saveRecord(record:PracticeRecord) {
  const records=getRecords();
  if(!records.some(r=>r.recordId===record.recordId)) localStorage.setItem(RECORDS,JSON.stringify([...records,record]));
}
export function markSynced(id:string) {localStorage.setItem(RECORDS,JSON.stringify(getRecords().map(r=>r.recordId===id?{...r,syncStatus:'synced'}:r)));}
export function saveSession(session:PracticeSession) {
  const sessions=getSessions();
  localStorage.setItem(SESSIONS,JSON.stringify([...sessions.filter(s=>s.id!==session.id),session]));
  localStorage.setItem(ACTIVE,JSON.stringify(session.completedAt?null:session.id));
}
export function downloadRecords(records:PracticeRecord[]) {
  const columns=['timestamp','studentName','studentNumber','sessionId','part','step','stepTitle','attempt','recognizedText','evaluation','matchedKeywords','missingKeywords','feedback','hintUsed','scriptViewed','durationSeconds','recordId','syncStatus'];
  const cell=(value:unknown)=>{let s=Array.isArray(value)?value.join(', '):String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
  const csv='\uFEFF'+[columns.join(','),...records.map(r=>columns.map(c=>cell(r[c as keyof PracticeRecord])).join(','))].join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='바리스타-연습기록.csv';a.click();URL.revokeObjectURL(url);
}

/** Delete local sessions and their attempts together; keep unrelated practice. */
export function deleteSessions(ids:string[]) {
  const selected=new Set(ids);
  const previous=[RECORDS,SESSIONS,ACTIVE].map(key=>[key,localStorage.getItem(key)] as const);
  const records=getRecords().filter(r=>!selected.has(r.sessionId));
  const sessions=getSessions().filter(s=>!selected.has(s.id));
  const active=getActive();
  try {
    localStorage.setItem(RECORDS,JSON.stringify(records));
    localStorage.setItem(SESSIONS,JSON.stringify(sessions));
    if(active&&selected.has(active))localStorage.setItem(ACTIVE,JSON.stringify(null));
  } catch(error) {
    for(const [key,value] of previous){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}
    throw error;
  }
}
