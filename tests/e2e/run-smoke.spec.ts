import { expect, test } from '@playwright/test';

const completedSettings = {
  version: 3,
  settings: {
    animationsEnabled: true,
    screenShake: true,
    tutorialCompleted: true,
    soundEnabled: true,
    musicEnabled: true,
    masterVolume: 0.7,
    sfxVolume: 0.75,
    musicVolume: 0.35,
    reduceMotion: false,
    highContrast: false,
    largeText: false
  }
};

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

const expectInViewport = async (
  page: import('@playwright/test').Page,
  locator: import('@playwright/test').Locator,
  label: string
): Promise<void> => {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  expect(box, `${label} should have a bounding box`).not.toBeNull();
  expect(viewport, `${label} should have a viewport`).not.toBeNull();
  if (!box || !viewport) return;

  expect(box.x, `${label} should not overflow left`).toBeGreaterThanOrEqual(-1);
  expect(box.y, `${label} should not overflow top`).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width, `${label} should not overflow right`).toBeLessThanOrEqual(viewport.width + 1);
  expect(box.y + box.height, `${label} should not overflow bottom`).toBeLessThanOrEqual(viewport.height + 1);
};

const startFirstCombat = async (
  page: import('@playwright/test').Page,
  options: { tutorialCompleted?: boolean } = {}
): Promise<void> => {
  await page.goto('/');
  await page.evaluate((settings) => {
    localStorage.clear();
    if (settings) localStorage.setItem('fic.settings', JSON.stringify(settings));
  }, options.tutorialCompleted ? completedSettings : null);
  await page.reload();

  await page.getByRole('button', { name: '대장간 입장' }).click();
  await expect(page.getByRole('heading', { name: '제 1막 지도' })).toBeVisible();
  await page.locator('button:not(:disabled)').filter({ hasText: '전투' }).click();
  await expect(page.getByTestId('enemy-section')).toBeVisible();
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

  await expect(page).toHaveTitle('혼돈의 대장간 | Forged in Chaos');
  await expect(page.getByRole('heading', { name: '혼돈의 대장간' })).toBeVisible();
  await expect(page.getByText('v1.12.0')).toBeVisible();

  await page.getByRole('button', { name: '설정' }).click();
  await expect(page.getByRole('heading', { name: '설정' })).toBeVisible();
  await expect(page.getByText('사운드')).toBeVisible();
  await expect(page.getByText('접근성')).toBeVisible();
  await expect(page.getByRole('button', { name: /첫 전투 튜토리얼/ })).toContainText('다시 보기');
  await page.getByRole('button', { name: '설정 닫기' }).click();

  await page.getByRole('button', { name: '대장간 입장' }).click();
  await expect(page.getByRole('heading', { name: '제 1막 지도' })).toBeVisible();

  await page.locator('button:not(:disabled)').filter({ hasText: '전투' }).click();
  await expect(page.getByTestId('first-combat-tutorial')).toContainText('손잡이 선택');
  await expect(page.getByTestId('craft-button')).toContainText('손잡이+머리 필요');
  await expect(page.getByRole('button', { name: '턴 종료' })).toBeVisible();

  await page.getByRole('button', { name: '전투 사전 열기' }).click();
  await expect(page.getByRole('heading', { name: '전투 사전' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '상태이상' })).toBeVisible();
  await page.getByRole('button', { name: '전투 사전 닫기' }).click();

  const visibleHandle = page.locator('[data-card-type="Handle"]').first();
  const visibleHead = page.locator('[data-card-type="Head"]').first();
  await expect(visibleHandle).toBeVisible();
  await expect(visibleHead).toBeVisible();
  await visibleHandle.click();
  await expect(page.getByTestId('first-combat-tutorial')).toContainText('머리 선택');
  await visibleHead.click();
  await expect(page.getByTestId('first-combat-tutorial')).toContainText('제작 버튼');
  await expect(page.getByRole('button', { name: '제작' })).toBeEnabled();

  await page.getByRole('button', { name: '제작' }).click();
  await expect(page.getByText(/(-\d+ 피해!|\+\d+ 방어도)/)).toBeVisible();
  await expect(page.getByTestId('first-combat-tutorial')).toContainText('적 의도 확인');
  await page.getByRole('button', { name: '적 의도 자세히 보기' }).click();
  await expect(page.getByText('의도 상세')).toBeVisible();
  await page.getByRole('button', { name: '의도 상세 닫기' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: '이어하기' })).toBeVisible();
  expect(consoleIssues).toEqual([]);
});

test('combat layout keeps core controls visible on release viewports', async ({ page }) => {
  await installSeededRandom(page);

  for (const viewport of [
    { width: 1280, height: 720, label: 'desktop 720p' },
    { width: 390, height: 844, label: 'mobile 390px' }
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await startFirstCombat(page, { tutorialCompleted: true });

    const enemySection = page.getByTestId('enemy-section');
    const anvil = page.getByTestId('combat-anvil');
    const handZone = page.getByTestId('hand-zone');
    const craftButton = page.getByTestId('craft-button');
    const endTurnButton = page.getByTestId('end-turn-button');

    await expect(enemySection, `${viewport.label} enemy`).toBeVisible();
    await expect(anvil, `${viewport.label} anvil`).toBeVisible();
    await expect(handZone, `${viewport.label} hand`).toBeVisible();
    await expect(craftButton, `${viewport.label} craft button`).toBeVisible();
    await expect(endTurnButton, `${viewport.label} turn end`).toBeVisible();

    await expectInViewport(page, enemySection, `${viewport.label} enemy`);
    await expectInViewport(page, anvil, `${viewport.label} anvil`);
    await expectInViewport(page, handZone, `${viewport.label} hand`);
    await expectInViewport(page, craftButton, `${viewport.label} craft button`);
    await expectInViewport(page, endTurnButton, `${viewport.label} turn end`);

    await page.locator('[data-card-type="Handle"]').first().click();
    await page.locator('[data-card-type="Head"]').first().click();
    await expect(craftButton, `${viewport.label} craft enabled`).toBeEnabled();
  }
});
