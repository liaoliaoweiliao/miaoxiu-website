import { test, expect } from '@playwright/test';
import { levels } from '../../src/features/experience/gameModel.js';

test.use({ reducedMotion: 'reduce' });

async function discover(page, index) {
  const region = levels[index].regions[0];
  const x = region.shape === 'rect' ? region.x + region.w / 2 : region.cx;
  const y = region.shape === 'rect' ? region.y + region.h / 2 : region.cy;
  const board = page.locator('.decode-board');
  await board.locator('img').evaluate((image) => image.decode());
  const bounds = await board.boundingBox();
  await board.click({ position: { x: bounds.width * x / 100, y: bounds.height * y / 100 } });
  await page.getByRole('button', { name: '进入对应苗绣衣橱 →', exact: true }).click();
}

for (const width of [1440, 390]) {
  test(`three complete journeys preserve collections, change photos and clear old filters at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => { Math.random = () => 0; });
    await page.goto('/#experience');
    for (let index = 0; index < 3; index += 1) {
      const gender = index === 1 ? 'boy' : 'girl';
      await expect(page.locator('.journey-round')).toContainText(`已完成 ${index} 轮`);
      await discover(page, index);
      await page.locator(`[data-action="drawGender"][data-id="${gender}"]`).click();
      await page.locator('.draw-btn').click();
      await expect(page.locator('.draw-btn')).toBeEnabled();
      await expect(page.locator('.pool-collection-count')).toContainText('1 / 6 套');
      await page.locator('[data-action="openDressup"]').click();
      const outfit = page.locator(`.owned-card:has([data-id^="${levels[index].id}-${gender}"])`).first();
      await outfit.locator('.wear-full').click();
      await expect(outfit.locator('.wear-full')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-action="finishLoop"]')).toBeEnabled();
      await page.locator(`[data-action="collectionFilter"][data-id="${levels[index].id}"]`).click();
      const photograph = await page.locator('.decode-board img').getAttribute('src');
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')));
      expect(saved.owned).toHaveLength(index + 1);
      await page.evaluate((sample) => { Math.random = () => sample; }, index === 1 ? 0.99 : 0);
      await page.locator('[data-action="finishLoop"]').click();
      await expect(page.locator('.decode-board')).toBeFocused();
      await expect(page.locator('.level-label')).toContainText(`第 ${index + 2} 轮`);
      await expect(page.locator('.decode-board img')).not.toHaveAttribute('src', photograph);
      await expect(page.locator('.decode-counter')).toHaveText('寻找 1 处');
      await expect(page.locator('[data-action="collectionFilter"][data-id="all"]')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-action="finishLoop"]')).toBeDisabled();
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')))).toEqual(saved);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await expect(page.locator('.journey-round')).toContainText('已完成 3 轮');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')));
    await page.reload();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')))).toEqual(saved);
    expect(errors).toEqual([]);
  });
}

for (const width of [1440, 820, 320]) {
  test(`wardrobe uses its sidebar and keeps card actions close at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(() => { Math.random = () => 0; });
    await page.goto('/#experience');
    await discover(page, 0);
    for (const gender of ['girl', 'boy']) {
      const choice = page.locator(`[data-action="drawGender"][data-id="${gender}"]`);
      await choice.click();
      expect(await choice.evaluate((element) => Boolean(element.closest('.side-heading')))).toBe(true);
      const card = await page.locator('.draw-card').boundingBox();
      const button = await page.locator('.draw-btn').boundingBox();
      expect(button.y - card.y - card.height).toBeGreaterThan(0);
      expect(button.y - card.y - card.height).toBeLessThan(65);
      const note = await page.locator('.draw-note').boundingBox();
      expect(note.y - button.y - button.height).toBeLessThan(20);
      if (width > 900) {
        const choices = await page.locator('.character-choice').boundingBox();
        const main = await page.locator('.wardrobe-main').boundingBox();
        expect(choices.x + choices.width).toBeLessThan(main.x);
      }
      await page.locator('.draw-btn').click();
      await expect(page.locator('.draw-btn')).toBeEnabled();
      await expect(page.locator('.reveal-front')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
