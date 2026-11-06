import {test,expect} from '@playwright/test';
import {appPath} from './paths';
test('심사위원 파일을 읽지 못해도 직접 입력 연습은 계속할 수 있음',async({page})=>{
 test.setTimeout(60000);await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/models/examiner/*.glb*',route=>route.abort('failed'));
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(appPath('/'));await page.getByRole('button',{name:/2. 3D 시험장 연습/}).click();await page.getByRole('button',{name:'연습 시작하기'}).click();
 await expect(page.locator('.exam-scene')).toHaveAttribute('data-character-status','error',{timeout:45000});
 await expect(page.getByText('심사위원을 불러오지 못했어요. 새로고침해 주세요.')).toBeVisible();
 await page.getByRole('button',{name:'직접 입력하기',exact:true}).click();await page.getByLabel('내가 말한 내용').fill('안녕하세요 수험번호 3번 김하늘입니다');await page.getByRole('button',{name:'말한 내용 확인하기',exact:true}).click();
 await expect(page.getByRole('heading',{name:'아주 좋아요!',exact:true})).toBeVisible();expect(errors).toEqual([]);
});
