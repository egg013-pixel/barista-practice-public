import type { BaristaStep, Evaluation } from '@/types/practice';

export function normalizeSpeech(text: string): string {
  return text.toLowerCase().normalize('NFKC')
    .replace(/팔\s*십/g,'80').replace(/이\s*십/g,'20')
    .replace(/(80|20)\s*(퍼센트|프로|%)/g,'$1')
    .replace(/두\s*잔|둘\s*잔|2\s*잔/g,'2잔')
    .replace(/(\d)\s*[,，]\s*(?=\d)/g,'$1/').replace(/(\d)\s+(?=\d)/g,'$1/')
    .replace(/혼합|섞은|섞어서|섞었|섞/g,'블렌딩')
    .replace(/맛있게\s*(드세요|드셔요|드십시오)/g,'맛있게드십시오')
    .replace(/잠시만?\s*기다려\s*(주세요|주십시오)/g,'잠시기다려주십시오')
    .replace(/준비해\s*드리겠습니다/g,'준비하겠습니다')
    .replace(/부드럽/g,'부드러운').replace(/쌉싸름/g,'쌉싸름한')
    .replace(/고소한?\s*(향|향기)/g,'고소한향')
    .replace(/[\s.,!?。%"'“”]/g,'');
}
// 숫자가 180 등의 일부로 일치하는 것을 막습니다.
function includesKeyword(normalized: string, keyword: string): boolean {
  const k = normalizeSpeech(keyword);
  if (!k) return false;
  if (/^\d+$/.test(k)) return new RegExp(`(?<!\\d)${k}(?!\\d)`).test(normalized);
  return normalized.includes(k);
}
function spokenNumber(text: string, number: string) {
  if (includesKeyword(text,number)) return true;
  const digits=['영','일','이','삼','사','오','육','칠','팔','구'];
  const n=Number(number);
  if (!Number.isInteger(n)||n<0||n>99) return false;
  const korean=n<10?digits[n]:`${n>=20?digits[Math.floor(n/10)]:''}십${n%10?digits[n%10]:''}`;
  return text.includes(`${korean}번`) || text.includes(`수험번호${korean}`);
}
export interface LocalEvaluationResult {
  level: Evaluation['result']; matchedRequiredGroups: string[];
  missingRequiredGroups: string[]; matchedOptionalKeywords: string[];
}
export function evaluateLocally(spokenText: string, step: BaristaStep): LocalEvaluationResult {
  const normalized=normalizeSpeech(spokenText);
  const matchedRequiredGroups:string[]=[];
  const missingRequiredGroups:string[]=[];
  for (const g of step.requiredGroups.filter(g=>g.required)) {
    const match=g.anyOf.some(k=>step.id===1&&g.label==='번호'?spokenNumber(normalized,k):includesKeyword(normalized,k));
    (match?matchedRequiredGroups:missingRequiredGroups).push(g.label);
  }
  let matchedOptionalKeywords=step.optionalKeywords.filter(k=>includesKeyword(normalized,k));
  if (matchedOptionalKeywords.includes('우유 거품')) matchedOptionalKeywords=matchedOptionalKeywords.filter(k=>k!=='우유');
  const total=step.requiredGroups.filter(g=>g.required).length;
  let level:Evaluation['result']='retry';
  if (normalized.length && (step.id===2||step.id===3)) {
    // 자유 발화는 간단한 의미 단어 하나도 인정하되 무관한 발화는 자동 통과시키지 않습니다.
    if (matchedRequiredGroups.length) level=normalized.length>=8?'excellent':'good';
  } else if (normalized.length && matchedRequiredGroups.length===total) {
    level='excellent';
    if ((step.id===7||step.id===9)&&matchedOptionalKeywords.length<2) level='good';
    if (step.id===4&&!matchedOptionalKeywords.some(k=>['블렌딩','중배전'].includes(k))) level='good';
  } else if (total && matchedRequiredGroups.length/total>=0.5) {
    level='good';
  }
  // 이름 없이 잔 수만 맞거나 서로 다른 음료를 말했을 때 막연하게 통과시키지 않습니다.
  if ([7,9].includes(step.id)&&missingRequiredGroups.length) level='retry';
  if ([8,10].includes(step.id)&&missingRequiredGroups.includes(step.id===8?'에스프레소':'카푸치노')) level='retry';
  if (step.id===4) {
    if (matchedRequiredGroups.length<3) level='retry';
    const values=[...normalized.matchAll(/(아라비카|로부스타)[^\d아로]{0,15}(\d+)/g)];
    const beforeCorrect=/(?<!\d)80(?!\d)[^\d]{0,8}아라비카/.test(normalized)&&/(?<!\d)20(?!\d)[^\d]{0,8}로부스타/.test(normalized);
    const respectivelyCorrect=normalized.includes('각각')&&((/아라비카.*로부스타.*80.*20/.test(normalized))||(/로부스타.*아라비카.*20.*80/.test(normalized)));
    if (!beforeCorrect&&!respectivelyCorrect&&values.some(m=>Number(m[2])!==(m[1]==='아라비카'?80:20))) {
      level='retry';
      for (const label of ['80%','20%']) if (!missingRequiredGroups.includes(label)) missingRequiredGroups.push(label);
    }
  }
  if (!normalized) level='retry';
  return {level,matchedRequiredGroups,missingRequiredGroups,matchedOptionalKeywords};
}
export function evaluate(spokenText:string,step:BaristaStep): Evaluation {
  const local=evaluateLocally(spokenText,step);
  const missing=[...local.missingRequiredGroups];
  if ([7,9].includes(step.id)&&local.matchedOptionalKeywords.length<2) missing.push('맛과 특징 두 가지');
  if(step.id===4&&!local.matchedOptionalKeywords.includes('중배전')) missing.push('중배전');
  const praise=local.level==='excellent'?'아주 좋아요! 핵심 내용을 잘 말했어요.':local.matchedRequiredGroups.length?'잘 말했어요! 연습을 이어가 볼까요?':'잘 시작했어요!';
  return {result:local.level, matchedKeywords:[...local.matchedRequiredGroups,...local.matchedOptionalKeywords],missingKeywords:missing,
    feedback:`${praise}${local.level!=='excellent'&&missing.length?` 다음에는 ‘${missing[0]}’도 넣어보세요.`:''}`,source:'local'};
}
