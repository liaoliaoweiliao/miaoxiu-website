import { test, expect } from '@playwright/test';
import { levels } from '../../src/features/experience/gameModel.js';

test.use({ reducedMotion: 'reduce' });

async function expectComplete(element) {
  expect(await element.evaluate((node) => node.scrollWidth <= node.clientWidth + 1 && node.scrollHeight <= node.clientHeight + 1)).toBe(true);
}

async function expectInside(element, parent) {
  const inner = await element.boundingBox();
  const outer = await parent.boundingBox();
  expect(inner.x).toBeGreaterThanOrEqual(outer.x - 1);
  expect(inner.y).toBeGreaterThanOrEqual(outer.y - 1);
  expect(inner.x + inner.width).toBeLessThanOrEqual(outer.x + outer.width + 1);
  expect(inner.y + inner.height).toBeLessThanOrEqual(outer.y + outer.height + 1);
}

const viewports = [
  { width: 1440, height: 900 }, { width: 1366, height: 768 },
  { width: 820, height: 600 }, { width: 390, height: 844 },
  { width: 320, height: 700 }, { width: 640, height: 500 },
];

for (const viewport of viewports) {
  test(`three activities show complete pictures, outfit and controls at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => { Math.random = () => 0; });
    await page.goto('/#experience');
    const frames = page.locator('.pattern-image-frame,.wardrobe-frame,.dressup-frame');
    const initial = await frames.evaluateAll((elements) => elements.map((element) => ({ width: element.clientWidth, height: element.clientHeight })));
    expect(initial).toHaveLength(3);
    expect(Math.max(...initial.map(({ width }) => width)) - Math.min(...initial.map(({ width }) => width))).toBeLessThanOrEqual(1);
    // The enlarged portrait may make the third frame taller; the first two keep their rhythm.
    if (viewport.width > 900) {
      const firstTwo = initial.slice(0, 2).map(({ height }) => height);
      expect(Math.max(...firstTwo) / Math.min(...firstTwo)).toBeLessThan(1.3);
    }

    const board = page.locator('.decode-board');
    const photo = board.locator('img');
    await photo.evaluate((image) => image.decode());
    const ratios = await photo.evaluate((image) => ({ actual: image.clientWidth / image.clientHeight, original: image.naturalWidth / image.naturalHeight }));
    expect(ratios.actual).toBeCloseTo(ratios.original, 2);
    await expectComplete(page.locator('.decode-viewport'));
    const bounds = await board.boundingBox();
    await board.click({ position: { x: bounds.width * .2535, y: bounds.height * .0925 } });
    await page.getByRole('button', { name: '进入对应苗绣衣橱 →', exact: true }).click();
    await page.locator('[data-action="drawGender"][data-id="girl"]').click();
    await page.locator('.draw-btn').click();
    await expect(page.locator('.costume-draw-stage')).toHaveClass(/has-result/);
    await page.locator('.reveal-front>img').evaluate((image) => image.decode());
    await expectComplete(page.locator('.reveal-front'));
    await expectInside(page.locator('.prize-name'), page.locator('.draw-card'));
    await expectInside(page.locator('.reveal-front>img'), page.locator('.draw-card'));
    await expectInside(page.locator('.draw-next-step'), page.locator('.wardrobe-frame'));
    await page.locator('[data-action="openDressup"]').click();
    await page.locator('.wear-full').first().click();
    await page.locator('.whole-avatar').evaluate((image) => image.decode());
    await expect(page.locator('.viewer-scale')).toHaveText('100%');
    const portraitView = await page.locator('.viewer-viewport').boundingBox();
    expect(portraitView.height / portraitView.width).toBeGreaterThan(.75);
    await expectInside(page.locator('.whole-avatar'), page.locator('.viewer-viewport'));
    await expectComplete(page.locator('.look-viewer'));
    await expect(page.locator('[data-action="finishLoop"]')).toBeEnabled();
    await page.locator('[data-action="finishLoop"]').click();
    await expect(page.locator('.level-label')).toContainText('第 2 轮');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const index of [1, 2]) {
  test(`${levels[index].name} retains the full photo and its hit coordinates after resizing`, async ({ page }) => {
    await page.addInitScript((sample) => { Math.random = () => sample; }, (index + .1) / 3);
    await page.goto('/#experience');
    for (const width of [1440, 820, 320]) {
      await page.setViewportSize({ width, height: 768 });
      const photo = page.locator('.decode-board img');
      await photo.evaluate((image) => image.decode());
      const ratios = await photo.evaluate((image) => ({ actual: image.clientWidth / image.clientHeight, original: image.naturalWidth / image.naturalHeight }));
      expect(ratios.actual).toBeCloseTo(ratios.original, 2);
      await expectComplete(page.locator('.decode-viewport'));
    }
    const region = levels[index].regions[0];
    const x = region.shape === 'rect' ? region.x + region.w / 2 : region.cx;
    const y = region.shape === 'rect' ? region.y + region.h / 2 : region.cy;
    const box = await page.locator('.decode-board').boundingBox();
    await page.locator('.decode-board').click({ position: { x: box.width * x / 100, y: box.height * y / 100 } });
    await expect(page.getByRole('dialog')).toContainText(levels[index].name);
  });
}
