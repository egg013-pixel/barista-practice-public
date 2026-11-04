import {test,expect} from '@playwright/test';
const speeches=['안녕하세요 수험번호 1번 연습생입니다','커피를 배우고 싶었어요','위로를 주는 커피를 만들고 싶어요','아라비카 팔십 로부스타 이십 중배전입니다','먼저 물을 서빙해 드릴게요','실례하겠습니다','에스프레소 두 잔 크레마가 풍부하고 고소한 향이 좋아요','실례합니다 에스프레소 두 잔 준비했습니다 맛있게 드세요','카푸치노 두 잔 우유 거품이 부드럽고 단맛이 좋아요','실례합니다 카푸치노 두 잔 준비했습니다 맛있게 드세요','네 마치겠습니다'];
test('개인정보 입력·저장 없이 11단계, 재시도, 힌트와 완료 요약',async({page})=>{
 const errors:string[]=[],api:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))api.push(r.url());});
 await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw Error('must not persist');};Storage.prototype.getItem=()=>{throw Error('must not read');};});
 await page.goto('/');await expect(page.getByRole('textbox')).toHaveCount(0);await expect(page.getByRole('link',{name:'교사용 기록'})).toHaveCount(0);await page.getByRole('button',{name:'연습 시작하기'}).click();
 for(let i=0;i<11;i++){
  await expect(page.getByRole('heading',{name:new RegExp(`^${i+1}단계`)})).toBeVisible();
  if(i===3){await page.getByRole('button',{name:/힌트 보기/}).click();await page.getByRole('button',{name:/대본 보기/}).click();await expect(page.getByText('기준 대본',{exact:true})).toBeVisible();await page.getByRole('button',{name:'직접 입력하기'}).click();await page.getByLabel('내가 말한 내용').fill('아라비카 원두입니다');await page.getByRole('button',{name:'말한 내용 확인하기'}).click();await expect(page.getByRole('heading',{name:'한 번 더 연습해볼까요?'})).toBeVisible();await page.getByRole('button',{name:'다시 말하기',exact:true}).click();}
  await page.getByRole('button',{name:'직접 입력하기'}).click();await page.getByLabel('내가 말한 내용').fill(speeches[i]);await page.getByRole('button',{name:'말한 내용 확인하기'}).click();await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();await page.getByRole('button',{name:i===10?'연습 마치기':'다음 단계',exact:true}).click();
 }
 await expect(page.getByRole('heading',{name:'바리스타 실기 연습 완료!'})).toBeVisible();await expect(page.getByText('이 결과는 현재 화면에서만 볼 수 있으며 저장되지 않아요.')).toBeVisible();expect(errors).toEqual([]);expect(api).toEqual([]);expect(await page.evaluate(()=>Object.keys(localStorage))).toEqual([]);
});
test('새로고침하면 대사·결과·진행이 사라지고 처음부터 시작',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'연습 시작하기'}).click();await page.getByRole('button',{name:'직접 입력하기'}).click();await page.getByLabel('내가 말한 내용').fill(speeches[0]);await page.getByRole('button',{name:'말한 내용 확인하기'}).click();await page.getByRole('button',{name:'다음 단계',exact:true}).click();await page.reload();await expect(page.getByRole('button',{name:/이어하기/})).toHaveCount(0);await page.getByRole('button',{name:'연습 시작하기'}).click();await expect(page.getByRole('heading',{name:/1단계/})).toBeVisible();await expect(page.getByText(speeches[0],{exact:true})).toHaveCount(0);
});
test('이전 공유용 기록만 삭제하고 다른 앱 데이터는 보존',async({page})=>{
 await page.addInitScript(()=>{if(sessionStorage.getItem('seeded'))return;for(const key of ['barista-public-records-v1','barista-public-sessions-v1','barista-public-active-v1'])localStorage.setItem(key,'legacy data');localStorage.setItem('other-app','keep');sessionStorage.setItem('seeded','yes');});
 await page.goto('/');await page.getByRole('button',{name:'연습 시작하기'}).click();expect(await page.evaluate(()=>Object.keys(localStorage))).toEqual(['other-app']);expect(await page.evaluate(()=>localStorage.getItem('other-app'))).toBe('keep');
});
test('브라우저 저장 공간이 차단되어도 연습과 평가 가능',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}});Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('blocked','SecurityError');}});});
 await page.goto('/');await page.getByRole('button',{name:'연습 시작하기'}).click();await page.getByRole('button',{name:'직접 입력하기'}).click();await page.getByLabel('내가 말한 내용').fill(speeches[0]);await page.getByRole('button',{name:'말한 내용 확인하기'}).click();await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();
});
test('마이크 미지원 시 직접 입력, 예전 교사용 경로는 제거',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'SpeechRecognition',{value:undefined});Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined});});
 await page.goto('/');await page.getByRole('button',{name:'연습 시작하기'}).click();await page.getByRole('button',{name:'말하기',exact:true}).click();await expect(page.getByLabel('내가 말한 내용')).toBeVisible();const response=await page.goto('/admin/');expect(response?.status()).toBe(404);
});
