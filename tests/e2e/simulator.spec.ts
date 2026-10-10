import {test,expect,type Page,type Locator} from '@playwright/test';
import {simulatorActions} from '../../data/simulator';
import type {PracticeSession} from '../../types/practice';
const speeches=['안녕하세요 수험번호 3번 김하늘입니다','커피를 배우고 싶었어요','위로를 주는 커피를 만들고 싶어요','아라비카 팔십 로부스타 이십 중배전입니다','먼저 물을 서빙해 드릴게요','실례하겠습니다','에스프레소 두 잔 크레마가 풍부하고 고소한 향이 좋아요','실례합니다 에스프레소 두 잔 준비했습니다 맛있게 드세요','카푸치노 두 잔 우유 거품이 부드럽고 단맛이 좋아요','실례합니다 카푸치노 두 잔 준비했습니다 맛있게 드세요','네 마치겠습니다'];
async function start(page:Page){await page.route('**/api/sheets',route=>route.fulfill({json:{configured:false,success:false}}));await page.goto('/');await page.getByRole('button',{name:/2. 3D 시험장 연습/}).click();await page.getByLabel('학생 이름').fill('김하늘');await page.getByLabel('수험번호',{exact:true}).fill('3');await page.getByRole('button',{name:'연습 시작하기'}).click();}
async function insideViewport(locator:Locator){
 await expect(locator).toBeVisible();
 await expect(locator).toBeInViewport({ratio:1});
}
async function withoutPageOverflow(page:Page){
 await expect.poll(()=>page.evaluate(()=>({horizontal:document.documentElement.scrollWidth>innerWidth+1,vertical:document.documentElement.scrollHeight>innerHeight+1,scrollY}))).toEqual({horizontal:false,vertical:false,scrollY:0});
}
test('3D에서 11단계 대사·제조·서빙·정리·기록 완료',async({page})=>{
 // Eleven lessons plus every equipment action run in one software-WebGL test; individual UI waits stay unchanged.
 test.setTimeout(60000);
 // This test covers the full learning workflow with the supported reduced-motion preference.
 // Normal camera transitions are exercised by the separate desktop and mobile layout tests.
 await page.emulateMedia({reducedMotion:'reduce'});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);await expect(page.locator('.exam-scene canvas')).toBeVisible();
 for(let i=0;i<11;i++){
  await expect(page.getByRole('heading',{name:new RegExp(`^${i+1}단계`)})).toBeVisible();
  if(i===10){await expect(page.getByRole('button',{name:'직접 입력하기'})).toHaveCount(0);for(const a of simulatorActions[11])await page.getByRole('button',{name:a.label,exact:true}).click();}
  else if(simulatorActions[i+1].length)await expect(page.getByRole('button',{name:simulatorActions[i+1][0].label,exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'직접 입력하기'}).click();await page.getByLabel('내가 말한 내용').fill(speeches[i]);await page.getByRole('button',{name:'말한 내용 확인하기'}).click();await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();
  if(i!==10&&simulatorActions[i+1].length){await expect(page.getByRole('button',{name:'다음 단계',exact:true})).toBeDisabled();for(const a of simulatorActions[i+1])await page.getByRole('button',{name:a.label,exact:true}).click();}
  await page.getByRole('button',{name:i===10?'연습 마치기':'다음 단계',exact:true}).click();
 }
 await expect(page.getByRole('heading',{name:'바리스타 실기 연습 완료!'})).toBeVisible();
 const result=await page.evaluate(()=>({records:JSON.parse(localStorage.getItem('barista-public-records-v1')||'[]'),sessions:JSON.parse(localStorage.getItem('barista-public-sessions-v1')||'[]')}));expect(result.records).toHaveLength(11);expect(result.records.every((r:{mode:string})=>r.mode==='simulator')).toBe(true);expect(result.sessions[0].simulatorActions).toContain('cappuccino-serve');expect(result.sessions[0].simulatorActions).toContain('clean-wipe');expect(errors).toEqual([]);
});
test('3D 모드와 동작 진행은 새로고침 후 복원',async({page})=>{
 await start(page);await page.getByRole('button',{name:'잠시 쉬기 · 진행은 저장돼요'}).click();
 await page.reload();await page.getByRole('button',{name:/1단계 이어하기/}).click();
 await expect(page.getByRole('region',{name:'3D 시험장 동작 연습'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'1단계. 인사 및 수험정보'})).toBeVisible();
 await expect(page.locator('.exam-scene canvas')).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('barista-public-sessions-v1')||'[]')[0].mode)).toBe('simulator');
});
test('데스크톱 한 화면에서 시험장과 오른쪽 대사 패널로 말하기·입력·피드백',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  class MockRecognition {
   lang='';continuous=false;interimResults=false;onresult:((e:unknown)=>void)|null=null;onerror:((e:unknown)=>void)|null=null;onend:(()=>void)|null=null;
   start(){setTimeout(()=>this.onresult?.({resultIndex:0,results:[{isFinal:true,0:{transcript:'안녕하세요 수험번호 3번 김하늘입니다'}}]}),30);}
   stop(){this.onend?.();}abort(){this.onend?.();}
  }
  Object.defineProperty(window,'SpeechRecognition',{value:MockRecognition});
 });
 await page.setViewportSize({width:1440,height:1000});await start(page);
 const scene=page.locator('.exam-scene'),canvas=scene.locator('canvas');
 const panel=page.getByRole('region',{name:'대사 연습과 마이크'});
 await insideViewport(canvas);await insideViewport(page.getByRole('button',{name:'말하기',exact:true}));
 const initial=(await scene.boundingBox())!,card=(await panel.boundingBox())!;
 expect(initial.width).toBeGreaterThan(1440*.85);expect(initial.height).toBeGreaterThan(1000*.75);
 // The speech panel sits over the right side of the same scene, rather than below it.
 expect(card.x).toBeGreaterThan(1440*.6);expect(card.x).toBeLessThan(initial.x+initial.width);
 expect(card.y).toBeLessThan(initial.y+initial.height);expect(card.y+card.height).toBeGreaterThan(initial.y);
 await withoutPageOverflow(page);
 await page.getByRole('button',{name:'말하기',exact:true}).click();
 await insideViewport(page.getByRole('button',{name:'말하기 마치기',exact:true}));
 await expect(page.getByText(speeches[0],{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'말하기 마치기',exact:true}).click();
 await page.getByRole('button',{name:'말한 내용 확인하기',exact:true}).click();
 await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();
 await insideViewport(page.getByRole('button',{name:'다음 단계',exact:true}));
 await withoutPageOverflow(page);
 await page.getByRole('button',{name:'직접 입력하기',exact:true}).click();
 await page.getByLabel('내가 말한 내용').fill(speeches[0]);
 await page.getByRole('button',{name:'말한 내용 확인하기',exact:true}).click();
 await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'다음 단계',exact:true}).click();
 await page.getByRole('button',{name:'화면 크게',exact:true}).click();
 await expect(page.getByRole('button',{name:'기본 크기',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect.poll(async()=> (await scene.boundingBox())!.height).toBeGreaterThan(1000*.9);
 await insideViewport(page.getByRole('button',{name:'말하기',exact:true}));
 await page.setViewportSize({width:1280,height:800});
 await expect.poll(async()=> (await scene.boundingBox())!.width).toBeLessThan(initial.width-100);
 await expect.poll(()=>canvas.evaluate(node=>{const c=node as HTMLCanvasElement,r=c.getBoundingClientRect();return Math.abs(c.width/c.height-r.width/r.height);})).toBeLessThan(.02);
 await insideViewport(page.getByRole('button',{name:'말하기',exact:true}));
 await page.getByRole('button',{name:'작업대 보기',exact:true}).click();
 await expect(page.getByRole('button',{name:'작업대 보기',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.keyboard.press('Escape');
 await expect(page.getByRole('button',{name:'화면 크게',exact:true})).toHaveAttribute('aria-pressed','false');
 await insideViewport(canvas);await insideViewport(page.getByRole('button',{name:'말하기',exact:true}));
 await withoutPageOverflow(page);expect(errors).toEqual([]);
});
test('모바일 한 화면에서 3D와 실제 마이크 버튼을 함께 보고 입력·피드백',async({page})=>{
 await page.setViewportSize({width:390,height:844});await start(page);
 const scene=page.locator('.exam-scene'),canvas=scene.locator('canvas');
 await insideViewport(canvas);await insideViewport(page.getByRole('button',{name:'말하기',exact:true}));
 const size=(await scene.boundingBox())!;expect(size.width).toBeGreaterThan(390*.85);expect(size.height).toBeGreaterThan(844*.5);
 await withoutPageOverflow(page);
 await page.getByRole('button',{name:'작업대 보기'}).click();await expect(page.getByRole('button',{name:'작업대 보기'})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'직접 입력하기',exact:true}).click();
 await page.getByLabel('내가 말한 내용').fill(speeches[0]);
 await page.getByRole('button',{name:'말한 내용 확인하기',exact:true}).click();
 await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'다음 단계',exact:true}).click();
 await insideViewport(canvas);await insideViewport(page.getByRole('button',{name:'말하기',exact:true}));
 await page.getByRole('button',{name:'화면 크게',exact:true}).click();
 await expect.poll(async()=> (await scene.boundingBox())!.height).toBeGreaterThan(844*.9);
 await insideViewport(page.getByRole('button',{name:'말하기',exact:true}));
 await page.getByRole('button',{name:'기본 크기',exact:true}).click();
 await withoutPageOverflow(page);
});
test('모바일의 긴 제조 대사와 정리 후 마무리 단계도 마이크와 시험장이 함께 표시',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.route('**/api/sheets',route=>route.fulfill({json:{configured:false,success:false}}));
 await page.goto('/');
 for(const step of [7,9,11]){
  const session:PracticeSession={
   id:`mobile-stage-${step}`,mode:'simulator',student:{name:'김하늘',number:'3'},startedAt:new Date().toISOString(),
   stepIndex:step-1,completedSteps:Array.from({length:step-1},(_,i)=>i+1),hintSteps:[],scriptSteps:[],
   simulatorActions:Object.entries(simulatorActions).filter(([id])=>Number(id)<step).flatMap(([,actions])=>actions.map(action=>action.id))
  };
  // Resume a real saved session at the late stage; the full sequence is covered above.
  await page.evaluate(saved=>{localStorage.setItem('barista-public-sessions-v1',JSON.stringify([saved]));localStorage.setItem('barista-public-active-v1',JSON.stringify(saved.id));localStorage.removeItem('barista-public-records-v1');},session);
  await page.reload();await page.getByRole('button',{name:new RegExp(`${step}단계 이어하기`)}).click();
  await expect(page.getByRole('heading',{name:new RegExp(`^${step}단계`)})).toBeVisible();
  await insideViewport(page.locator('.exam-scene canvas'));
  if(step===11){
   await expect(page.getByRole('button',{name:'말하기',exact:true})).toHaveCount(0);
   for(const action of simulatorActions[11])await page.getByRole('button',{name:action.label,exact:true}).click();
  }
  await insideViewport(page.getByRole('button',{name:'말하기',exact:true}));await withoutPageOverflow(page);
  await page.getByRole('button',{name:'직접 입력하기',exact:true}).click();
  await page.getByLabel('내가 말한 내용').fill(speeches[step-1]);await page.getByRole('button',{name:'말한 내용 확인하기',exact:true}).click();
  await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();
  await withoutPageOverflow(page);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('barista-public-records-v1')||'[]')[0].step)).toBe(step);
 }
});
