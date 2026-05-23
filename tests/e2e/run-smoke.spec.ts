import { expect, test } from '@playwright/test';

const installSeededRandom = async (page: import('@playwright/test').Page): Promise<void> => {
  await page.addInitScript(() => {
    let state = 1779503600;
    Math.random = () => {
      state += 0x6d2b79f5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  });
};

test('menu to first forge attack flow works without console errors', async ({ page }) => {
  const consoleIssues: string[] = [];
  page.on('console', message => {
    const text = message.text();
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleIssues.push(`${message.type()}: ${text}`);
    }
  });
  page.on('pageerror', error => consoleIssues.push(`pageerror: ${error.message}`));

  await installSeededRandom(page);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page).toHaveTitle('Forged in Chaos');
  await expect(page.getByRole('heading', { name: 'FORGED IN CHAOS' })).toBeVisible();
  await expect(page.getByText('v1.11.22')).toBeVisible();

  await page.getByRole('button', { name: '설정' }).click();
  await expect(page.getByRole('heading', { name: '설정' })).toBeVisible();
  await expect(page.getByText('사운드')).toBeVisible();
  await expect(page.getByText('접근성')).toBeVisible();
  await page.getByRole('button', { name: '설정 닫기' }).click();

  await page.getByRole('button', { name: '대장간 입장' }).click();
  await expect(page.getByRole('heading', { name: 'ACT 1 MAP' })).toBeVisible();

  await page.locator('button:not(:disabled)').filter({ hasText: '전투' }).click();
  await expect(page.getByRole('heading', { name: '무기는 두 조각부터' })).toBeVisible();
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await expect(page.getByRole('button', { name: 'END' })).toBeVisible();

  await page.getByRole('button', { name: '전투 사전 열기' }).click();
  await expect(page.getByRole('heading', { name: '전투 사전' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '상태이상' })).toBeVisible();
  await page.getByRole('button', { name: '전투 사전 닫기' }).click();

  const visibleHandle = page.locator('[data-card-type="Handle"]').first();
  const visibleHead = page.locator('[data-card-type="Head"]').first();
  await expect(visibleHandle).toBeVisible();
  await expect(visibleHead).toBeVisible();
  await visibleHandle.click();
  await visibleHead.click();
  await expect(page.getByRole('button', { name: '제작!' })).toBeEnabled();

  await page.getByRole('button', { name: '제작!' }).click();
  await expect(page.getByText(/(-\d+ 피해!|\+\d+ 방어도)/)).toBeVisible();
  expect(consoleIssues).toEqual([]);
});
