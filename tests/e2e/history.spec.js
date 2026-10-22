import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.historyErrors = [];
  page.on('pageerror', (error) => page.historyErrors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) page.historyErrors.push(`${response.status()} ${response.url()}`); });
});
test.afterEach(async ({ page }) => { expect(page.historyErrors).toEqual([]); });

test('three archive storybooks open, close and restore keyboard focus', async ({ page }) => {
  await page.goto('/#history');
  for (const [index, book] of ['stitch', 'lanjuan', 'butterfly'].entries()) {
    const trigger = page.locator('.story-image').nth(index);
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('.story-animation-shell')).toHaveAttribute('data-phase', 'cover');
    const spread = page.locator('.story-book-open img');
    await expect(spread).toHaveAttribute('src', new RegExp(`${book}-book.webp$`));
    await spread.evaluate((image) => image.decode());
    await expect(page.locator('.story-animation-shell')).toHaveAttribute('data-phase', 'open');
    await expect(page.getByRole('button', { name: '合上故事', exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: '阅读文字', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
});

test('archive color masks follow selected order, enforce three colors and reset all motifs', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#history');
  const swatches = page.locator('.color-swatch');
  await swatches.nth(5).click();
  await expect(page.locator('.color-motif-paint')).toHaveCount(3);
  expect(await page.locator('.color-motif-paint').evaluateAll((layers) => layers.map((layer) => layer.dataset.color))).toEqual(['5', '5', '5']);
  await swatches.nth(3).click();
  expect(await page.locator('.color-motif-paint').evaluateAll((layers) => layers.map((layer) => layer.dataset.color))).toEqual(['5', '3', '5']);
  await swatches.nth(4).click();
  await expect(swatches.nth(0)).toBeDisabled();
  expect(await page.locator('.color-motif-paint').evaluateAll((layers) => layers.map((layer) => layer.dataset.color))).toEqual(['5', '3', '4']);
  await expect(page.locator('.meaning-main-image')).toHaveAttribute('src', /05-ivory-thread-closeup.png$/);
  for (const [index, motif] of ['butterfly', 'flower', 'bird'].entries()) {
    await page.locator('.color-motif-tab').nth(index).click();
    await expect(page.locator('.color-motif-line')).toHaveAttribute('src', new RegExp(`${motif}-line.webp$`));
    const masks = await page.locator('.color-motif-paint').evaluateAll((layers) => layers.map((layer) => getComputedStyle(layer).maskImage.match(/url\("(.*)"\)/)[1]));
    for (const url of masks) {
      const response = await page.request.get(url);
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toMatch(/^image\/png/);
    }
    expect(masks.every((url) => url.includes(`${motif}-paint-`))).toBe(true);
  }
  await swatches.nth(3).click();
  await expect(swatches.nth(0)).toBeEnabled();
  await page.getByRole('button', { name: '清空选择', exact: true }).click();
  await expect(page.locator('.color-motif-paint')).toHaveCount(0);
  await expect(page.locator('.palette-readout > b')).toHaveText('未上色线稿');
});

test('six stitch techniques draw distinct paths with a moving needle and show their finished image', async ({ page }) => {
  await page.goto('/#history');
  const patterns = new Set();
  for (let index = 0; index < 6; index += 1) {
    await page.locator('.stitch-item').nth(index).click();
    await expect(page.locator('.stitch-stage')).toHaveClass(/is-playing/);
    const motion = page.locator('.stitch-crafted-svg animateMotion');
    patterns.add(await motion.getAttribute('path'));
    const position = () => page.locator('.stitch-moving-needle').evaluate((needle) => { const matrix = needle.getCTM(); return [matrix.e, matrix.f].map((value) => value.toFixed(2)).join(','); });
    const start = await position();
    await expect.poll(position).not.toBe(start);
  }
  expect(patterns.size).toBe(6);
  await expect(page.locator('.stitch-stage')).toHaveClass(/is-complete/, { timeout: 7000 });
  await expect(page.locator('.stitch-finish-image')).toHaveAttribute('src', /02-dazixiu.webp$/);
  await expect(page.locator('.stitch-finish-image')).toBeVisible();
});

test('mobile history keeps the book and all four sections within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#history');
  await expect(page.locator('.history-heading')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.locator('.story-image').nth(1).click();
  const book = page.locator('.story-book-open img');
  await book.evaluate((image) => image.decode());
  const rect = await book.boundingBox();
  expect(rect.x).toBeGreaterThanOrEqual(0);
  expect(rect.x + rect.width).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: '阅读文字', exact: true }).click();
  await expect(page.locator('.story-reader-text')).toContainText('南迁路途');
  await page.keyboard.press('Escape');
  await page.locator('.stitch-item').nth(4).click();
  await expect(page.locator('.stitch-stage')).toHaveClass(/is-complete/);
  await page.locator('.color-swatch').nth(3).click();
  await expect(page.locator('.meaning-copy strong')).toHaveText('靛蓝');
});
