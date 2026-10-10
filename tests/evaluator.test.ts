import {test} from 'node:test';
import assert from 'node:assert/strict';
import {baristaScript,personalizeStep} from '../data/baristaScript';
import {evaluate,normalizeSpeech} from '../lib/evaluator';
const step=(id:number)=>personalizeStep(baristaScript[id-1],{name:'김하늘',number:'3'});
const cases:Array<[number,string,string]>=[
 [4,'아라비카 팔십에 로부스타 이십 들어간 중배전 원두입니다.','excellent'],
 [4,'아라비카 80 로부스타 20입니다.','good'],
 [4,'아라비카 원두입니다.','retry'],
 [4,'아라비카 80퍼센트와 로부스타 20퍼센트를 섞었습니다.','excellent'],
 [4,'아라비카 20 로부스타 80입니다.','retry'],
 [4,'80% 아라비카와 20% 로부스타를 블렌딩했습니다.','excellent'],
 [4,'아라비카와 로부스타가 각각 80%, 20%로 중배전된 원두입니다.','excellent'],
 [4,'로부스타 20 아라비카 80입니다.','good'],
 [4,'아라비카 180 로부스타 120입니다.','retry'],
 [9,'카푸치노 2잔 만들어드리겠습니다.','good'],
 [9,'카푸치노 두잔 준비하겠습니다.','good'],
 [9,'카푸치노 두 잔, 우유 거품이 부드럽고 단맛이 좋아요.','excellent'],
 [9,'카푸치노 두 잔 우유 우유 거품입니다.','good'],
 [9,'에스프레소 두잔입니다.','retry'],
 [7,'에스프레소 두 잔 크레마가 풍부해요.','excellent'],
 [1,'안녕하세요 수험번호 삼 번 김하늘입니다.','excellent'],
 [1,'안녕하십니까 김하늘 수험번호 3번입니다.','excellent'],
 [2,'커피를 더 알고 싶어서 시작했어요.','excellent'],
 [2,'커피','good'],
 [2,'커피 한 잔을 만들어 사람들에게 행복을 주고 싶어요.','excellent'],
 [2,'아무 말이나 쓰겠습니다.','retry'],
 [3,'위로를 주는 바리스타가 되고 싶어요.','excellent'],
 [3,'기본에 충실하고 깔끔한 커피를 만들고 싶어요.','excellent'],
 [5,'물을 가져다드릴게요.','excellent'],
 [6,'실례하겠습니다 선생님.','excellent'],
 [8,'실례해요 에스프레소 두 잔 만들었어요 맛있게 드세요.','excellent'],
 [10,'카푸치노 2잔 준비했습니다.','good'],
 [11,'이상으로 시험을 마치겠습니다.','excellent'],
 [11,'','retry']
];
for(const [id,text,expected] of cases)test(`${id}단계: ${text||'(빈 입력)'}`,()=>assert.equal(evaluate(text,step(id)).result,expected));
test('숫자·단위·띄어쓰기 정규화',()=>{assert.equal(normalizeSpeech('아라비카 팔십 퍼센트 로부스타 이십 프로 두 잔'),normalizeSpeech('아라비카 80% 로부스타 20% 2잔'));});
test('11개 단계 모두 비어 있는 발화를 통과시키지 않음',()=>{for(const s of baristaScript)assert.equal(evaluate('',personalizeStep(s,{name:'김하늘',number:'3'})).result,'retry');});
test('피드백 JSON 구조와 짧은 비판 없는 문장',()=>{for(const s of baristaScript){const e=evaluate('연습 중입니다',s);assert.ok(e.feedback.length<150);assert.ok(!/오답|틀렸|실패/.test(e.feedback));assert.ok(Array.isArray(e.missingKeywords));}});
test('PDF 기준 순서와 원문 비율',()=>{assert.deepEqual(baristaScript.map(s=>s.part),[1,1,1,1,1,2,2,2,2,2,2]);assert.match(step(4).referenceText,/아라비카 80%, 로부스타 20%/);});

test('한글 수험번호를 조사와 혼동하지 않음',()=>{const s=personalizeStep(baristaScript[0],{name:'김하늘',number:'2'});const result=evaluate('안녕하세요 수험번호 김하늘입니다',s);assert.ok(result.missingKeywords.includes('번호'));});
