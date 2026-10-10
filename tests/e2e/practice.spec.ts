import {test,expect} from '@playwright/test';
const speeches=['안녕하세요 수험번호 3번 김하늘입니다','커피를 배우고 싶었어요','위로를 주는 커피를 만들고 싶어요','아라비카 팔십 로부스타 이십 중배전입니다','먼저 물을 서빙해 드릴게요','실례하겠습니다','에스프레소 두 잔 크레마가 풍부하고 고소한 향이 좋아요','실례합니다 에스프레소 두 잔 준비했습니다 맛있게 드세요','카푸치노 두 잔 우유 거품이 부드럽고 단맛이 좋아요','실례합니다 카푸치노 두 잔 준비했습니다 맛있게 드세요','네 마치겠습니다'];
test('11단계, 재시도 보존, 힌트, 완료, 교사 기록',async({page})=>{
 await page.goto('/');await page.getByLabel('학생 이름').fill('김하늘');await page.getByLabel('수험번호',{exact:true}).fill('3');await page.getByRole('button',{name:'연습 시작하기'}).click();
 for(let i=0;i<11;i++){
   await expect(page.getByRole('heading',{name:new RegExp(`^${i+1}단계`)})).toBeVisible();
   if(i===3){await expect(page.getByText('기준 대본',{exact:true})).toHaveCount(0);await page.getByRole('button',{name:/힌트 보기/}).click();await expect(page.getByText('기억할 핵심 단어')).toBeVisible();await page.getByRole('button',{name:/대본 보기/}).click();await expect(page.getByText('기준 대본',{exact:true})).toBeVisible();
     await page.getByRole('button',{name:'직접 입력하기'}).click();await page.getByLabel('내가 말한 내용').fill('아라비카 원두입니다');await page.getByRole('button',{name:'말한 내용 확인하기'}).click();await expect(page.getByRole('heading',{name:'한 번 더 연습해볼까요?'})).toBeVisible();await page.getByRole('button',{name:'다시 말하기',exact:true}).click();}
   await page.getByRole('button',{name:'직접 입력하기'}).click();await page.getByLabel('내가 말한 내용').fill(speeches[i]);await page.getByRole('button',{name:'말한 내용 확인하기'}).click();await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();
   await page.getByRole('button',{name:i===10?'연습 마치기':'다음 단계',exact:true}).click();
 }
 await expect(page.getByRole('heading',{name:'바리스타 실기 연습 완료!'})).toBeVisible();
 const rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('barista-public-records-v1')||'[]'));
 expect(rows).toHaveLength(12);expect(rows.filter((r:{step:number})=>r.step===4)).toHaveLength(2);expect(rows[3].hintUsed).toBe(true);expect(rows[3].scriptViewed).toBe(true);
 await page.getByRole('button',{name:'내 결과 보기'}).click();await expect(page.getByRole('heading',{name:'내 연습 기록'})).toBeVisible();
 await page.goto('/admin');await expect(page.getByRole('cell',{name:'김하늘 3번',exact:true})).toBeVisible();await expect(page.getByRole('cell',{name:'✅ 완료',exact:true})).toBeVisible();
});
test('새로고침 후 진행 이어하기',async({page})=>{
 await page.goto('/');await page.getByLabel('학생 이름').fill('박민준');await page.getByLabel('수험번호',{exact:true}).fill('12');await page.getByRole('button',{name:'연습 시작하기'}).click();await page.getByRole('button',{name:'직접 입력하기'}).click();await page.getByLabel('내가 말한 내용').fill('안녕하세요 박민준 수험번호 12번입니다');await page.getByRole('button',{name:'말한 내용 확인하기'}).click();await page.getByRole('button',{name:'다음 단계',exact:true}).click();await page.reload();await page.getByRole('button',{name:/2단계 이어하기/}).click();await expect(page.getByRole('heading',{name:'2단계. 바리스타 시작 계기'})).toBeVisible();
});
test('마이크를 지원하지 않아도 직접 입력 안내',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined});Object.defineProperty(window,'SpeechRecognition',{value:undefined});});
 await page.goto('/');await page.getByLabel('학생 이름').fill('김학생');await page.getByLabel('수험번호',{exact:true}).fill('1');await page.getByRole('button',{name:'연습 시작하기'}).click();await page.getByRole('button',{name:'말하기',exact:true}).click();await expect(page.getByLabel('내가 말한 내용')).toBeVisible();await expect(page.getByText(/이 브라우저에서는 직접 입력/)).toBeVisible();
});
test('모바일 시작 화면에 가로 넘침 없음',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await expect(page.getByRole('button',{name:'연습 시작하기'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('네트워크가 없어도 평가와 기록이 유지됨',async({page})=>{
 await page.route('**/api/evaluate',r=>r.abort());await page.goto('/');await page.getByLabel('학생 이름').fill('김하늘');await page.getByLabel('수험번호',{exact:true}).fill('3');await page.getByRole('button',{name:'연습 시작하기'}).click();await page.getByRole('button',{name:'직접 입력하기'}).click();await page.getByLabel('내가 말한 내용').fill('안녕하세요 수험번호 3번 김하늘입니다');await page.getByRole('button',{name:'말한 내용 확인하기'}).click();await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('barista-public-records-v1')||'[]')[0].syncStatus)).toBe('pending');
});
test('음성 인식 결과 표시, 종료와 재시도 (인식기 모의)',async({page})=>{
 await page.addInitScript(()=>{
  class MockRecognition {
   lang='';continuous=false;interimResults=false;onresult:((e:unknown)=>void)|null=null;onerror:((e:unknown)=>void)|null=null;onend:(()=>void)|null=null;
   start(){setTimeout(()=>this.onresult?.({resultIndex:0,results:[{isFinal:true,0:{transcript:'안녕하세요 수험번호 3번 김하늘입니다'}}]}),30);}
   stop(){this.onend?.();}abort(){this.onend?.();}
  }
  Object.defineProperty(window,'SpeechRecognition',{value:MockRecognition});
 });
 await page.goto('/');await page.getByLabel('학생 이름').fill('김하늘');await page.getByLabel('수험번호',{exact:true}).fill('3');await page.getByRole('button',{name:'연습 시작하기'}).click();await page.getByRole('button',{name:'말하기',exact:true}).click();await expect(page.getByText('안녕하세요 수험번호 3번 김하늘입니다',{exact:true})).toBeVisible();await page.getByRole('button',{name:'말하기 마치기'}).click();await page.getByRole('button',{name:'말한 내용 확인하기'}).click();await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();await page.getByRole('button',{name:'다시 말하기',exact:true}).click();await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toHaveCount(0);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('barista-public-records-v1')||'[]').length)).toBe(1);
});
test('연습·온라인 복구·교사용 화면은 서버 API에 기록을 보내지 않는다',async({page})=>{
 const apiRequests:string[]=[];
 page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))apiRequests.push(r.url());});
 await page.goto('/');await page.getByLabel('학생 이름').fill('공유 테스트');await page.getByLabel('수험번호',{exact:true}).fill('3');await page.getByRole('button',{name:'연습 시작하기'}).click();
 await page.getByRole('button',{name:'직접 입력하기'}).click();await page.getByLabel('내가 말한 내용').fill('안녕하세요 수험번호 3번 공유 테스트입니다');await page.getByRole('button',{name:'말한 내용 확인하기'}).click();
 await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();
 await page.evaluate(()=>window.dispatchEvent(new Event('online')));
 await page.goto('/admin');await expect(page.getByRole('cell',{name:'공유 테스트 3번',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'대기 기록 다시 전송'})).toHaveCount(0);
 expect(apiRequests).toEqual([]);
});
