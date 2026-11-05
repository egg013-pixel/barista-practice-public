import {appPath} from './paths';
import {test,expect} from '@playwright/test';

test('커피 3D가 있는 시작 화면에서 키보드로 모드를 선택하고 정보 입력 없이 연습 시작',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/api/sheets',route=>route.fulfill({json:{configured:false,success:false}}));
 await page.setViewportSize({width:1440,height:1000});await page.goto(appPath('/'));
 // Software WebGL startup is separate from the individual interaction assertions.
 await expect(page.getByTestId('coffee-hero').locator('canvas')).toBeVisible({timeout:20000});
 const script=page.getByRole('button',{name:/1. 글 대본 연습/});
 const simulator=page.getByRole('button',{name:/2. 3D 시험장 연습/});
 await simulator.focus();await page.keyboard.press('Space');
 await expect(simulator).toHaveAttribute('aria-pressed','true');await expect(script).toHaveAttribute('aria-pressed','false');
 await script.focus();await page.keyboard.press('Enter');
 await expect(script).toHaveAttribute('aria-pressed','true');await expect(simulator).toHaveAttribute('aria-pressed','false');

 await page.getByRole('button',{name:'연습 시작하기'}).focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('heading',{name:'1단계. 인사 및 수험정보'})).toBeVisible();
 await expect(page.getByTestId('coffee-hero')).toHaveCount(0);expect(errors).toEqual([]);
});

test('WebGL을 사용할 수 없는 모바일에서도 커피 대체 화면과 시작 기능 유지',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  const original=HTMLCanvasElement.prototype.getContext;
  Object.defineProperty(HTMLCanvasElement.prototype,'getContext',{value:function(this:HTMLCanvasElement,type:string,...args:unknown[]){
   if(type==='webgl'||type==='webgl2'||type==='experimental-webgl')return null;
   return Reflect.apply(original,this,[type,...args]);
  }});
 });
 await page.route('**/api/sheets',route=>route.fulfill({json:{configured:false,success:false}}));
 await page.setViewportSize({width:390,height:844});await page.goto(appPath('/'));
 await expect(page.getByTestId('coffee-hero-fallback')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);

 await page.getByRole('button',{name:'연습 시작하기'}).click();
 await expect(page.getByRole('heading',{name:'1단계. 인사 및 수험정보'})).toBeVisible();
 await expect(page.getByRole('button',{name:'말하기',exact:true})).toBeVisible();expect(errors).toEqual([]);
});
