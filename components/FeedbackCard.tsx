import { CircleCheck,RotateCcw,CircleDot } from 'lucide-react';
import type { Evaluation } from '@/types/practice';
export const resultLabels={excellent:'아주 좋아요!',good:'거의 다 왔어요!',retry:'한 번 더 연습해볼까요?'};
export function FeedbackCard({evaluation}:{evaluation:Evaluation}) {
 const Icon=evaluation.result==='excellent'?CircleCheck:evaluation.result==='good'?CircleDot:RotateCcw;
 return <div className={`feedback ${evaluation.result}`} role="status"><Icon size={28}/><div><h3>{resultLabels[evaluation.result]}</h3><p>{evaluation.feedback}</p><small>{evaluation.source==='ai'?'AI 의미 평가':'기본 의미·키워드 평가'}</small></div></div>;
}
