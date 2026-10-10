import { test, expect } from '@playwright/test';

test('기간 양끝 포함, 검색·선택 삭제와 CSV, 다른 연습 및 이어하기 보존', async ({ page }) => {
 await page.addInitScript(() => {
  if(localStorage.getItem('admin-test-seeded'))return;
  const sessions=[
   {id:'older',name:'이전 학생',number:'1',date:'2026-10-01T12:00:00'},
   {id:'selected',name:'현재 학생',number:'2',date:'2026-10-10T12:00:00'},
   {id:'later',name:'다음 학생',number:'3',date:'2026-10-11T12:00:00'}
  ].map(s=>({id:s.id,student:{name:s.name,number:s.number},startedAt:s.date,stepIndex:0,completedSteps:[],hintSteps:[],scriptSteps:[]}));
  localStorage.setItem('barista-public-sessions-v1',JSON.stringify(sessions));
  localStorage.setItem('barista-public-records-v1',JSON.stringify(sessions.map(s=>({recordId:s.id+'-attempt',sessionId:s.id,timestamp:s.startedAt,studentName:s.student.name,studentNumber:s.student.number,step:1,evaluation:'good',syncStatus:'synced'}))));
  localStorage.setItem('barista-public-active-v1',JSON.stringify('selected'));
  localStorage.setItem('admin-test-seeded','yes');
 });
 await page.goto('/admin');
 await expect(page.getByRole('cell',{name:'이전 학생 1번',exact:true})).toBeVisible();
 await page.getByLabel('시작일',{exact:true}).fill('2026-10-10');
 await page.getByLabel('종료일',{exact:true}).fill('2026-10-10');
 await expect(page.getByRole('cell',{name:'현재 학생 2번',exact:true})).toBeVisible();
 await expect(page.getByRole('cell',{name:'이전 학생 1번',exact:true})).toHaveCount(0);
 await expect(page.getByRole('cell',{name:'다음 학생 3번',exact:true})).toHaveCount(0);
 const downloaded=page.waitForEvent('download');
 await page.getByRole('button',{name:'현재 목록 CSV 내려받기'}).click();
 const download=await downloaded;
 const stream=await download.createReadStream();
 const chunks:Buffer[]=[];for await(const chunk of stream!)chunks.push(chunk);
 const csv=Buffer.concat(chunks).toString('utf8');
 expect(csv).toContain('현재 학생');expect(csv).not.toContain('이전 학생');
 await page.getByLabel('현재 목록 모두 선택').check();
 await page.getByRole('button',{name:'선택한 기록 삭제'}).click();
 await expect(page.getByRole('dialog')).toContainText('이 브라우저에서 삭제돼요');
 await page.getByRole('button',{name:'취소',exact:true}).click();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('barista-public-records-v1')!).length)).toBe(3);
 await page.getByRole('button',{name:'선택한 기록 삭제'}).click();
 await page.getByRole('button',{name:'삭제하기',exact:true}).click();
 const remaining=await page.evaluate(()=>({records:JSON.parse(localStorage.getItem('barista-public-records-v1')!),sessions:JSON.parse(localStorage.getItem('barista-public-sessions-v1')!),active:JSON.parse(localStorage.getItem('barista-public-active-v1')!)}));
 expect(remaining.records.map((r:{sessionId:string})=>r.sessionId)).toEqual(['older','later']);
 expect(remaining.sessions.map((s:{id:string})=>s.id)).toEqual(['older','later']);expect(remaining.active).toBeNull();
 await page.getByRole('button',{name:'전체 기간 보기'}).click();
 await page.getByLabel('학생 이름 또는 수험번호로 찾기').fill('다음');
 await page.getByRole('button',{name:'다음 학생 3번 기록 삭제'}).click();
 await page.getByRole('button',{name:'삭제하기',exact:true}).click();
 await page.reload();await expect(page.getByRole('cell',{name:'이전 학생 1번',exact:true})).toBeVisible();
 await expect(page.getByRole('cell',{name:'다음 학생 3번',exact:true})).toHaveCount(0);
 await page.setViewportSize({width:390,height:844});
 await expect(page.getByLabel('시작일',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
