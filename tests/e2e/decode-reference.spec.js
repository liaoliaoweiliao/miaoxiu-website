import { test, expect } from '@playwright/test';
import { levels } from '../../src/features/experience/gameModel.js';

test.use({ reducedMotion: 'reduce' });

for (const viewport of [{ width: 1784, height: 1000 }, { width: 1366, height: 768 }, { width: 820, height: 600 }, { width: 390, height: 844 }, { width: 320, height: 700 }]) {
  test(`reference composition keeps the target, archive and full photo readable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => { Math.random = () => 0; });
    await page.goto('/#experience');
    for (const index of [0, 1, 2]) {
      const level = levels[index];
      await expect(page.locator('.target-brief strong')).toContainText(level.name);
      await expect(page.locator('.decode-archive')).toHaveCount(0);
      await expect(page.locator('.decode-task')).toHaveCount(0);
      await expect(page.locator('.decode-progress > strong')).toHaveText('0/1');
      const photo = page.locator('.decode-board img');
      await photo.evaluate(image => image.decode());
      expect(await photo.evaluate(image => Math.abs(image.clientWidth / image.clientHeight - image.naturalWidth / image.naturalHeight))).toBeLessThan(.02);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (index < 2) {
        await page.evaluate((sample) => { Math.random = () => sample; }, index === 0 ? 0 : .99);
        await page.locator('[data-action="randomImage"]').click();
      }
    }
    const region = levels[2].regions[0];
    const x = region.shape === 'rect' ? region.x + region.w / 2 : region.cx;
    const y = region.shape === 'rect' ? region.y + region.h / 2 : region.cy;
    const box = await page.locator('.decode-board').boundingBox();
    await page.locator('.decode-board').click({ position: { x: box.width * x / 100, y: box.height * y / 100 } });
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    await expect(page.locator('.decode-progress > strong')).toHaveText('1/1');
    await expect(page.locator('.decode-archive h2')).toContainText('水涡纹');
    await expect(page.locator('.decode-swatch')).toHaveAttribute('viewBox', '1448 0 724 724');
    const board = await page.locator('.decode-viewport').boundingBox();
    const archive = await page.locator('.decode-archive').boundingBox();
    if (viewport.width > 1100) {
      expect(archive.x).toBeGreaterThan(board.x + board.width);
      expect(Math.abs(archive.y - board.y)).toBeLessThan(2);
    } else expect(archive.y).toBeGreaterThan(board.y + board.height);
    await page.getByRole('button', { name: '前往对应苗绣衣橱 →', exact: true }).click();
    await expect(page.locator('.gender-prompt')).toBeInViewport();
    await page.locator('.decode-image-preview').click();
    await expect(page.locator('.image-lightbox')).toBeVisible();
  });
}

for (const [name, id] of [['苗绣工艺', 'history-stitches'], ['常见纹样', 'history-patterns']]) {
  test(`extension link ${name} opens the actual section`, async ({ page }) => {
    await page.goto('/#experience');
    await page.getByRole('navigation', { name: '延伸探索' }).getByRole('button', { name: new RegExp(name) }).click();
    await expect(page).toHaveURL(/#history$/);
    await expect(page.locator(`#${id}`)).toBeInViewport();
  });
}
