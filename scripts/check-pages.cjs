const {chromium,expect}=require('@playwright/test');
(async()=>{
 const base=process.env.PAGES_PREVIEW_URL||'http://127.0.0.1:3034/barista-practice-public/';
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--enable-unsafe-swiftshader']});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[],api=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',r=>{if(new URL(r.url()).pathname.includes('/api/'))api.push(r.url());});
  await page.addInitScript(()=>localStorage.setItem('barista-records-v1',JSON.stringify([{recordId:'original-sentinel'}])));
  const response=await page.goto(base);expect(response.status()).toBe(200);
  await expect(page.getByTestId('coffee-hero').locator('canvas')).toBeVisible();
  await page.getByRole('button',{name:/2. 3D 시험장 연습/}).click();
  await page.getByLabel('학생 이름').fill('공유 확인');await page.getByLabel('수험번호',{exact:true}).fill('3');
  await page.getByRole('button',{name:'연습 시작하기'}).click();
  await expect(page.locator('.exam-scene canvas')).toBeVisible();
  await page.getByRole('button',{name:'직접 입력하기'}).click();
  await page.getByLabel('내가 말한 내용').fill('안녕하세요 수험번호 3번 공유 확인입니다');
  await page.getByRole('button',{name:'말한 내용 확인하기'}).click();
  await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'다음 단계',exact:true}).click();
  await expect(page.getByRole('heading',{name:/2단계/})).toBeVisible();
  await page.getByRole('button',{name:/잠시 쉬기/}).click();
  await page.getByRole('link',{name:'교사용 기록'}).click();
  await expect(page).toHaveURL(new URL('admin/',base).href);
  await expect(page.getByRole('cell',{name:'공유 확인 3번',exact:true})).toBeVisible();
  await page.reload();await expect(page.getByRole('cell',{name:'공유 확인 3번',exact:true})).toBeVisible();
  const date=await page.evaluate(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
  await page.getByLabel('시작일',{exact:true}).fill(date);await page.getByLabel('종료일',{exact:true}).fill(date);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'현재 목록 CSV 내려받기'}).click();await download;
  await page.getByLabel('현재 목록 모두 선택').check();await page.getByRole('button',{name:'선택한 기록 삭제'}).click();await page.getByRole('button',{name:'삭제하기',exact:true}).click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('barista-public-records-v1')))).toEqual([]);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('barista-records-v1')))).toEqual([{recordId:'original-sentinel'}]);
  expect(api).toEqual([]);expect(errors).toEqual([]);
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  console.log('Static Pages path: 3D, built-in feedback, step transition, admin navigation/reload/date/CSV/deletion, original storage isolation, no API requests: passed');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
