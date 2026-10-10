import { Check } from 'lucide-react';
export function ProgressBar({step}:{step:number}) {
 return <div className="progress-block"><div className="progress-label"><span>차근차근, 한 단계씩</span><strong>{step} <span>/ 11</span></strong></div>
 <div className="progress-track" role="progressbar" aria-label="연습 진행" aria-valuenow={step} aria-valuemin={0} aria-valuemax={11}><div style={{width:`${step/11*100}%`}}/></div>
 <div className="progress-dots" aria-hidden="true">{Array.from({length:11},(_,i)=><span key={i} className={i+1===step?'current':i+1<step?'done':''}>{i+1<step?<Check size={13}/>:i+1}</span>)}</div></div>;
}
