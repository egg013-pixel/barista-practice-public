import {appPath} from './paths';
import {test,expect} from '@playwright/test';
test('모델 준비는 취소 가능하며 외부 음성 서비스로 대사를 보내지 않음',async({page})=>{
 await page.addInitScript(()=>{
  class MockWorker{
   onmessage:((event:{data:unknown})=>void)|null=null;onerror=null;
   postMessage(data:{id:number;type:string}){setTimeout(()=>this.onmessage?.({data:{id:data.id,type:'progress',message:'로컬 음성 모델 준비 중'}}),0);}
   terminate(){this.onmessage=null;}
  }
  Object.defineProperty(window,'Worker',{value:MockWorker});
  Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async()=>{throw Error('must not request mic before ready');}}});
 });
 const posts:string[]=[];page.on('request',r=>{if(r.method()==='POST')posts.push(r.url());});
 await page.goto(appPath('/'));await page.getByRole('button',{name:'연습 시작하기'}).click();
 await page.getByRole('button',{name:'말하기',exact:true}).click();await expect(page.getByRole('button',{name:'준비 취소'})).toBeVisible();
 await expect(page.getByRole('button',{name:'심사위원 음성 끄기'})).toBeDisabled();
 await page.getByRole('button',{name:'직접 입력하기'}).click();await expect(page.getByLabel('내가 말한 내용')).toBeVisible();
 await page.getByLabel('내가 말한 내용').fill('안녕하세요 수험번호 1번 연습생입니다');await page.getByRole('button',{name:'말한 내용 확인하기'}).click();await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();expect(posts).toEqual([]);
});
