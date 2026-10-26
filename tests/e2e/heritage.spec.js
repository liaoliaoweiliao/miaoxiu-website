import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.runtimeErrors = [];
  page.on('pageerror', error => page.runtimeErrors.push(error.message));
});
test.afterEach(async ({ page }) => { expect(page.runtimeErrors).toEqual([]); });

test('normal flight lights the existing flowers in order, then holds the original cover comparison', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const journey = page.locator('[data-heritage-journey]');
  const bird = page.locator('[data-heritage-bird]');
  const viewport = page.locator('.heritage-viewport');
  const lit = page.locator('.heritage-flower-light.is-lit');
  await bird.click();
  await expect(bird).toBeDisabled();
  await expect.poll(() => lit.count()).toBeGreaterThan(0);
  expect(await lit.count()).toBeLessThan(7);
  // Repeated input must not skip the cloth or enter the application stage mid-flight.
  await viewport.press('Enter');
  await page.setViewportSize({ width: 390, height: 700 });
  await expect(journey).toHaveAttribute('data-stage', '1');
  await expect(bird).toBeEnabled({ timeout: 10000 });
  await expect(lit).toHaveCount(7);
  await bird.click();
  await expect(journey).toHaveAttribute('data-stage', '2');
  await expect(bird).toBeEnabled();
  await expect(page.locator('.heritage-cover-light')).toHaveClass(/is-lit/);
  const comparison = page.getByRole('group', { name: /原图花卉边饰对照/ });
  await expect(comparison.getByRole('img')).toHaveCount(2);
  const hrefs = await comparison.locator('image').evaluateAll(images => images.map(image => image.getAttribute('href')));
  expect(new Set(hrefs).size).toBe(1);
  expect(hrefs[0]).toMatch(/heritage-long-panorama-wide\.webp$/);
  for (const width of [320, 800, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(journey).toHaveAttribute('data-stage', '2');
    const frame = await viewport.boundingBox();
    const detail = await comparison.boundingBox();
    const hint = await page.locator('.heritage-bird-hint').boundingBox();
    expect(detail.x).toBeGreaterThanOrEqual(frame.x);
    expect(detail.x + detail.width).toBeLessThanOrEqual(frame.x + frame.width);
    expect(hint.x + hint.width <= detail.x || hint.x >= detail.x + detail.width || hint.y >= detail.y + detail.height || hint.y + hint.height <= detail.y).toBe(true);
  }
  await bird.click();
  await expect(journey).toHaveAttribute('data-stage', '0');
  await expect(lit).toHaveCount(0);
});

test('reduced motion supports keyboard, horizontal touch, replay, and ignores vertical scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  const journey = page.locator('[data-heritage-journey]');
  const viewport = page.locator('.heritage-viewport');
  const bird = page.locator('[data-heritage-bird]');
  await viewport.press('Enter');
  await expect(journey).toHaveAttribute('data-stage', '1');
  await expect(bird).toBeEnabled();
  await viewport.dispatchEvent('touchstart', { changedTouches: [{ identifier: 0, clientX: 240, clientY: 250 }] });
  await viewport.dispatchEvent('touchend', { changedTouches: [{ identifier: 0, clientX: 230, clientY: 100 }] });
  await expect(journey).toHaveAttribute('data-stage', '1');
  await viewport.dispatchEvent('touchstart', { changedTouches: [{ identifier: 0, clientX: 240, clientY: 250 }] });
  await viewport.dispatchEvent('touchend', { changedTouches: [{ identifier: 0, clientX: 80, clientY: 260 }] });
  await expect(journey).toHaveAttribute('data-stage', '2');
  await viewport.press('Space');
  await expect(journey).toHaveAttribute('data-stage', '0');
  await expect(page.locator('.heritage-hand-light')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.heritage-whisper')).toHaveText('一针一线之间，技艺在指尖延续。');
});

test('leaving during flight cancels animation and a fresh visit starts at the fingertips', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-heritage-bird]').click();
  await expect(page.locator('[data-heritage-bird]')).toBeDisabled();
  await page.locator('.feature-link').first().click();
  await expect(page).toHaveURL(/#history$/);
  await page.goto('/#home');
  await expect(page.locator('.heritage-progress [aria-current]')).toContainText('指尖传承');
  await expect(page.locator('[data-heritage-bird]')).toBeEnabled();
});
