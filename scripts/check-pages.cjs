const {chromium,expect}=require('@playwright/test');
(async()=>{
 const base=process.env.PAGES_PREVIEW_URL||'http://127.0.0.1:3034/barista-practice-public/';
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),api=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).pathname.includes('/api/'))api.push(r.url());});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base);await expect(page.getByRole('textbox')).toHaveCount(0);await expect(page.getByRole('link',{name:'교사용 기록'})).toHaveCount(0);
  await page.getByRole('link',{name:'개인정보처리방침 보기'}).click();await expect(page.getByRole('heading',{name:'개인정보처리방침',exact:true})).toBeVisible();await expect(page.getByText('개인정보 보호책임자: 최세은',{exact:true})).toBeVisible();
  await page.getByRole('link',{name:'연습 화면으로'}).click();await page.getByRole('button',{name:/2. 3D 시험장 연습/}).click();await page.getByRole('button',{name:'연습 시작하기'}).click();await expect(page.locator('.exam-scene canvas')).toBeVisible({timeout:20000});
  await page.getByRole('button',{name:'직접 입력하기'}).click();await page.getByLabel('내가 말한 내용').fill('안녕하세요 수험번호 1번 연습생입니다');await page.getByRole('button',{name:'말한 내용 확인하기'}).click();await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();await page.getByRole('button',{name:'다음 단계',exact:true}).click();await expect(page.getByRole('heading',{name:/2단계/})).toBeVisible();
  expect(await page.evaluate(()=>Object.keys(localStorage))).toEqual([]);expect(await page.evaluate(()=>Object.keys(sessionStorage))).toEqual([]);
  await page.reload();await page.getByRole('button',{name:'연습 시작하기'}).click();await expect(page.getByRole('heading',{name:/1단계/})).toBeVisible();
  const response=await page.goto(new URL('admin/',base).href);expect(response.status()).toBe(404);
  await page.goto(base);await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(api).toEqual([]);expect(errors).toEqual([]);console.log('Static path: no identity fields or teacher route, 3D/feedback, reload reset, empty storage, privacy links and mobile: passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
