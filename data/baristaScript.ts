import type { BaristaStep, KeywordGroup } from '@/types/practice';
const group = (label: string, anyOf: string[]): KeywordGroup => ({label, anyOf, required: true});
const pdf1 = '바리스타 대본 쓰기 학습지.pdf';
const pdf2 = '바리스타 행동 및 대사.pdf';
export const baristaScript: BaristaStep[] = [
  {
    id:1, part:1, title:'인사 및 수험정보', instruction:'인사하고, 수험번호와 이름을 말해보세요.',
    action:'미소를 지으며 심사위원을 바라보고 당당하고 명확한 목소리로 인사합니다.',
    referenceText:'안녕하십니까. 수험번호 ○번, ○○○입니다.',
    requiredGroups:[group('인사',['안녕','반갑습니다']),group('수험번호',['수험번호','수험 번호']),group('번호',['{{number}}']),group('이름',['{{name}}'])],
    optionalKeywords:[], hint:['인사','수험번호','내 번호','내 이름'], evaluationNote:'학생이 입력한 이름과 번호를 확인합니다. 자연스러운 인사를 인정합니다.', source:pdf1
  },
  {
    id:2, part:1, title:'바리스타 시작 계기', instruction:'바리스타 공부를 시작한 이유를 말해보세요.',
    action:'나만의 계기를 자연스럽게 말합니다.',
    referenceText:'제가 바리스타 공부를 시작하게 된 계기는 ○○○입니다.',
    requiredGroups:[group('나만의 시작 계기',['바리스타','커피','공부','시작','배우','배워','기술','만들','관심','음료','행복'])],
    optionalKeywords:[], hint:['커피','배우고 싶은 이유','나만의 계기'], evaluationNote:'자유 발화입니다. 자신의 이유를 자연스럽게 말했다면 인정합니다. 고정된 문장을 요구하지 않습니다.', source:pdf1
  },
  {
    id:3, part:1, title:'앞으로의 포부 및 목표', instruction:'앞으로 어떤 바리스타가 되고 싶은지 말해보세요.',
    action:'나만의 목표를 선택하거나 직접 말합니다.',
    referenceText:'앞으로 ○○○ 커피를 알려주고 싶습니다 (만들고 싶습니다).',
    requiredGroups:[group('나만의 포부',['앞으로','커피','만들','알려','바리스타','노력','되고','되고싶','목표','행복','위로'])],
    optionalKeywords:[], hint:['앞으로','커피','나의 목표'], evaluationNote:'자유 발화입니다. 표현이나 문장 길이보다 자신의 목표를 말하는 의미를 인정합니다.', source:pdf1
  },
  {
    id:4, part:1, title:'원두 특징 소개', instruction:'오늘 사용할 원두의 종류와 비율을 소개해보세요.',
    action:'원두의 특성을 정확하게 숙지하고 신뢰감 있는 톤으로 전달합니다.',
    referenceText:'오늘 시연하고자 하는 원두는 아라비카 80%, 로부스타 20%로 블렌딩되어 중배전된 원두입니다.',
    requiredGroups:[group('아라비카',['아라비카']),group('80%',['80','팔십']),group('로부스타',['로부스타']),group('20%',['20','이십'])],
    optionalKeywords:['블렌딩','중배전','원두'], hint:['아라비카','80%','로부스타','20%','중배전'], evaluationNote:'종류와 비율은 중요합니다. 숫자의 한글 표기와 퍼센트 표현을 동일하게 인정합니다. 종류별 비율을 바꾸면 보완이 필요합니다.', source:pdf1
  },
  {
    id:5, part:1, title:'물 서빙 연결 멘트', instruction:'물을 서빙하겠다는 말을 해보세요.',
    action:'멘트를 하며 자연스럽게 물 서빙 동작으로 연결합니다.',
    referenceText:'먼저 물을 서빙해 드리겠습니다. 잠시만 기다려 주십시오 (맛있게 드십시오).',
    requiredGroups:[group('물',['물']),group('서빙',['서빙','드리','드릴','가져다','갖다','드려','전달'])],
    optionalKeywords:['먼저','기다려','맛있게'], hint:['물','서빙해 드리겠습니다'], evaluationNote:'물을 가져다주거나 드린다는 의미를 인정합니다. 마무리 표현은 자유롭게 허용합니다.', source:pdf1
  },
  {
    id:6, part:2, title:'물 서빙', instruction:'물을 내려놓으며 정중하게 말해보세요.',
    action:'준비된 물(잔)을 심사위원 테이블에 내려놓으며 정중하게 인사합니다.',
    referenceText:'실례하겠습니다.', requiredGroups:[group('실례',['실례','실레'])], optionalKeywords:[],
    hint:['실례하겠습니다'], evaluationNote:'실례하겠습니다 뒤에 선생님 등의 호칭이 있어도 인정합니다.', source:pdf2, timestamp:'06:04'
  },
  {
    id:7, part:2, title:'에스프레소 소개', instruction:'첫 번째 음료의 이름, 잔 수, 맛과 특징을 소개해보세요.',
    action:'에스프레소의 맛과 특징을 설명한 후, 에스프레소 추출 및 서빙 준비 작업을 시작합니다.',
    referenceText:'제가 첫 번째 준비해 드릴 커피는 크레마가 풍부하며, 부드러운 쓴 맛과 신맛이 조화롭고, 고소한 향과 바디감이 좋은 에스프레소 두 잔을 준비해 드리겠습니다. 잠시만 기다려 주십시오.',
    requiredGroups:[group('에스프레소',['에스프레소']),group('두 잔',['두 잔','2잔'])],
    optionalKeywords:['크레마','쓴맛','신맛','고소한 향','바디감','풍부','부드러운'], hint:['에스프레소','두 잔','크레마','고소한 향','바디감'],
    evaluationNote:'음료 이름과 잔 수가 있으면 진행을 허용합니다. 서로 다른 특징이 두 개 이상이면 아주 좋아요입니다. 마무리 표현이나 문장 순서는 자유입니다.', source:pdf2, timestamp:'06:13'
  },
  {
    id:8, part:2, title:'에스프레소 서빙', instruction:'에스프레소 두 잔을 서빙하며 말해보세요.',
    action:'추출이 완료된 에스프레소 두 잔을 심사위원 테이블에 정중히 서비스합니다.',
    referenceText:'실례하겠습니다. 에스프레소 두 잔 준비해 드렸습니다. 맛있게 드십시오.',
    requiredGroups:[group('실례',['실례','실레']),group('에스프레소',['에스프레소']),group('두 잔',['2잔','두 잔']),group('준비',['준비','만들','나왔','드리','드렸','드려']),group('맛있게 드세요',['맛있게','즐겨','드세요','드십시오'])],
    optionalKeywords:[], hint:['실례','에스프레소','두 잔','준비','맛있게 드십시오'], evaluationNote:'핵심 내용 대부분을 말하면 인정합니다. 서빙 표현과 존댓말 차이를 허용합니다.', source:pdf2, timestamp:'08:17'
  },
  {
    id:9, part:2, title:'카푸치노 소개', instruction:'두 번째 음료의 이름, 잔 수, 맛과 특징을 소개해보세요.',
    action:'카푸치노의 메뉴 특성을 설명한 뒤, 우유 스팀 및 카푸치노 제조 프로세스에 들어갑니다.',
    referenceText:'제가 두 번째 준비해 드릴 커피는 쌉싸름한 에스프레소와 부드러운 우유 거품이 만나 고소한 향과 단맛이 풍부한 카푸치노 두 잔을 준비해 드리겠습니다. 잠시만 기다려 주십시오.',
    requiredGroups:[group('카푸치노',['카푸치노']),group('두 잔',['두 잔','2잔'])],
    optionalKeywords:['에스프레소','우유','우유 거품','고소한 향','단맛','부드러운','쌉싸름한'], hint:['카푸치노','두 잔','우유 거품','고소한 향','단맛'],
    evaluationNote:'음료 이름과 잔 수가 있으면 진행을 허용합니다. 특징 두 개 이상이면 아주 좋아요입니다. 우유와 우유 거품은 같은 특징으로 한 번만 셉니다.', source:pdf2, timestamp:'08:25'
  },
  {
    id:10, part:2, title:'카푸치노 서빙', instruction:'카푸치노 두 잔을 서빙하며 말해보세요.',
    action:'정성스럽게 완성한 카푸치노 두 잔을 심사위원에게 서빙합니다.',
    referenceText:'실례하겠습니다. 카푸치노 두 잔 준비해 드렸습니다. 맛있게 드십시오.',
    requiredGroups:[group('실례',['실례','실레']),group('카푸치노',['카푸치노']),group('두 잔',['2잔','두 잔']),group('준비',['준비','만들','나왔','드리','드렸','드려']),group('맛있게 드세요',['맛있게','즐겨','드세요','드십시오'])],
    optionalKeywords:[], hint:['실례','카푸치노','두 잔','준비','맛있게 드십시오'], evaluationNote:'핵심 내용 대부분을 말하면 인정합니다. 서빙 표현과 존댓말 차이를 허용합니다.', source:pdf2, timestamp:'12:21'
  },
  {
    id:11, part:2, title:'최종 마무리', instruction:'정리를 마치고 시험 종료를 말해보세요.',
    action:'작업대 주변 청소, 머신 마감 린싱, 밧드 및 린넨 정리 등 뒷정리를 마친 후 바른 자세로 서서 시험 종료를 선언합니다.',
    referenceText:'네, 마치겠습니다.', requiredGroups:[group('마치겠습니다',['마치','마칠','마쳤','마무리','끝내','끝났','종료'])], optionalKeywords:[],
    hint:['마치겠습니다'], evaluationNote:'네, 이상으로, 시험을 등의 앞말은 자유롭게 허용합니다.', source:pdf2, timestamp:'14:04'
  }
];
export function personalizeStep(step: BaristaStep, student: {name:string;number:string}): BaristaStep {
  return {...step, referenceText: step.id === 1 ? `안녕하십니까. 수험번호 ${student.number}번, ${student.name}입니다.` : step.referenceText,
    requiredGroups: step.requiredGroups.map(g => ({...g, anyOf:g.anyOf.map(k=>k.replace('{{name}}',student.name).replace('{{number}}',student.number))}))};
}
