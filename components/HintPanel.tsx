import { Lightbulb,BookOpen } from 'lucide-react';
import type { BaristaStep } from '@/types/practice';
export function HintPanel({step,level,onHint}:{step:BaristaStep;level:number;onHint:()=>void}) {
 return <div className="hint-area">
 <button className="button hint-button" onClick={onHint}><Lightbulb size={19}/>{level===0?'힌트 보기':level===1?'대본 보기':'힌트와 대본을 보고 있어요'}<span>{level===0?'도움이 필요할 때':level===1?'한 번 더 도움받기':''}</span></button>
 {level>=1&&<div className="hint-panel"><h3><Lightbulb size={18}/>기억할 핵심 단어</h3><div className="keyword-list">{step.hint.map(k=><span key={k}>{k}</span>)}</div></div>}
 {level>=2&&<div className="script-panel"><h3><BookOpen size={18}/>기준 대본</h3><p>“{step.referenceText}”</p>{[2,3].includes(step.id)&&<small>○○○에는 나만의 이유나 목표를 넣어주세요.</small>}</div>}
 </div>;
}
