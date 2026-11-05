import {appPath} from './paths';
import {test,expect} from '@playwright/test';
test('고정 음성은 단계마다 한 번 재생되고 힌트·재시도에는 반복하지 않음',async({page})=>{
 await page.addInitScript(()=>{const calls:string[]=[];Object.assign(window,{examinerCalls:calls});HTMLMediaElement.prototype.play=function(){calls.push(this.src);return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){};HTMLMediaElement.prototype.load=function(){};});
 await page.goto(appPath('/'));await page.getByRole('button',{name:'연습 시작하기'}).click();
 const played=()=>page.evaluate(()=>(window as unknown as {examinerCalls:string[]}).examinerCalls);
 await expect.poll(async()=>(await played()).length).toBe(1);expect((await played())[0]).toContain('step-01.wav');
 await page.getByRole('button',{name:/힌트 보기/}).click();await page.getByRole('button',{name:'다시 말하기',exact:true}).click();expect(await played()).toHaveLength(1);
 await page.getByRole('button',{name:'직접 입력하기'}).click();await page.getByLabel('내가 말한 내용').fill('안녕하세요 수험번호 1번 연습생입니다');await page.getByRole('button',{name:'말한 내용 확인하기'}).click();await page.getByRole('button',{name:'다음 단계',exact:true}).click();
 await expect.poll(async()=>(await played()).length).toBe(2);expect((await played())[1]).toContain('step-02.wav');
});
