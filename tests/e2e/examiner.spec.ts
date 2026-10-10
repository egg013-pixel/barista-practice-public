import { test, expect } from '@playwright/test';

test('심사위원은 단계마다 한 번 안내하고 마이크 전에 멈춘다', async ({ page }) => {
  await page.addInitScript(() => {
    const calls: string[] = [];
    Object.assign(window, { examinerCalls: calls });
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices: () => [
        { name: 'Korean female', lang: 'ko-KR', default: true },
        { name: 'Microsoft InJoon', lang: 'ko-KR', default: false },
      ],
      addEventListener() {}, removeEventListener() {},
      cancel() { calls.push('cancel'); },
      speak(u: SpeechSynthesisUtterance) { calls.push(`speak:${u.text}:${u.voice?.name}`); },
    } });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class {
      text: string; constructor(text: string) { this.text = text; }
    } });
    Object.defineProperty(window, 'SpeechRecognition', { value: class {
      start() { calls.push('microphone'); }
      stop() {} abort() {}
    } });
  });
  await page.goto('/');
  await page.getByLabel('학생 이름').fill('음성 테스트');
  await page.getByLabel('수험번호', { exact: true }).fill('3');
  await page.getByRole('button', { name: '연습 시작하기' }).click();
  const spoken = () => page.evaluate(() => (window as unknown as { examinerCalls: string[] }).examinerCalls.filter(c => c.startsWith('speak:')));
  await expect.poll(spoken).toEqual(['speak:인사하고, 수험번호와 이름을 말해보세요.:Microsoft InJoon']);
  await page.getByRole('button', { name: /힌트 보기/ }).click();
  await page.getByRole('button', { name: '다시 말하기', exact: true }).click();
  expect(await spoken()).toHaveLength(1);
  await page.getByRole('button', { name: '직접 입력하기' }).click();
  await page.getByLabel('내가 말한 내용').fill('안녕하세요 수험번호 3번 음성 테스트입니다');
  await page.getByRole('button', { name: '말한 내용 확인하기' }).click();
  await page.getByRole('button', { name: '다음 단계', exact: true }).click();
  await expect.poll(async () => (await spoken()).length).toBe(2);
  await page.getByRole('button', { name: '말하기', exact: true }).click();
  await expect(page.getByRole('button', { name: '심사위원 음성 끄기' })).toBeDisabled();
  expect(await page.evaluate(() => (window as unknown as { examinerCalls: string[] }).examinerCalls.slice(-2))).toEqual(['cancel', 'microphone']);
  await page.getByRole('button', { name: /잠시 쉬기/ }).click();
  expect(await page.evaluate(() => (window as unknown as { examinerCalls: string[] }).examinerCalls.at(-1))).toBe('cancel');
});
