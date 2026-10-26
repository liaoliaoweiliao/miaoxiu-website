import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

async function changedPixels(page, first, second) {
  return page.evaluate(async ([a, b]) => {
    const load = async (encoded) => {
      const image = new Image();
      image.src = `data:image/png;base64,${encoded}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    };
    const [left, right] = await Promise.all([load(a), load(b)]);
    let changed = 0;
    for (let i = 0; i < left.length; i += 4) {
      // Ignore subpixel rounding in the browser compositor.
      if (Math.max(...[0, 1, 2].map((channel) => Math.abs(left[i + channel] - right[i + channel]))) > 12) changed += 1;
    }
    return changed;
  }, [first.toString('base64'), second.toString('base64')]);
}

test('digital embroidery renders, rotates, disperses and resets without losing the long scroll', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const section = page.locator('[data-heritage-rebirth]');
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator('[data-rebirth-state]')).toHaveAttribute('data-rebirth-state', 'ready');
  const canvas = section.locator('canvas');
  await canvas.focus();
  await canvas.press('ArrowRight');
  await expect(canvas).toHaveAttribute('data-rotation', '0.15');
  const before = await canvas.screenshot();
  await section.getByRole('button', { name: '散作星尘', exact: true }).click();
  await expect(section.locator('output')).toHaveText('100%');
  const dispersed = await canvas.screenshot();
  expect(before.equals(dispersed)).toBe(false);
  await section.getByRole('button', { name: '青碧', exact: true }).click();
  await expect(section.getByRole('button', { name: '青碧', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await section.getByRole('button', { name: '暂停绣衣动态' }).click();
  await expect(section.getByRole('button', { name: '继续绣衣动态' })).toHaveAttribute('aria-pressed', 'true');
  const slider = section.getByRole('slider', { name: '聚散程度' });
  await slider.focus();
  await slider.press('Home');
  await expect(section.locator('output')).toHaveText('0%');
  await section.getByRole('button', { name: '重置', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-rotation', '0.00');
  await expect(section.getByRole('button', { name: '紫霓', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await section.getByRole('button', { name: '绣线长卷', exact: true }).click();
  await page.locator('[data-heritage-bird]').click();
  await expect(page.locator('[data-heritage-number]')).toHaveText('02');
  await section.getByRole('button', { name: '数字绣境', exact: true }).click();
  await expect(section.locator('[data-rebirth-state]')).toHaveAttribute('data-rebirth-state', 'ready');
  await expect(section.locator('output')).toHaveText('0%');
  expect(errors).toEqual([]);
});

test('mobile controls fit and horizontal touch rotation leaves vertical scrolling available', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  const section = page.locator('[data-heritage-rebirth]');
  const canvas = section.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  expect(await canvas.evaluate((element) => getComputedStyle(element).touchAction)).toBe('pan-y');
  const bounds = await canvas.boundingBox();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bounds.x + 80, y: bounds.y + 170 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: bounds.x + 140, y: bounds.y + 175 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(canvas).toHaveAttribute('data-rotation', '0.54');
  for (const width of [320, 390, 640, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    const overflow = await section.evaluate((element) => [...element.querySelectorAll('button, input, canvas, .rebirth-controls')].filter((item) => { const rect = item.getBoundingClientRect(); return rect.left < -1 || rect.right > innerWidth + 1; }).map((item) => item.className));
    expect(overflow).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('devices without WebGL show a readable static garment and retain the bird experience', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...options) {
      return type === 'webgl' ? null : original.call(this, type, ...options);
    };
  });
  await page.goto('/');
  const section = page.locator('[data-heritage-rebirth]');
  await expect(section.locator('[data-rebirth-state]')).toHaveAttribute('data-rebirth-state', 'unavailable');
  await expect(section.getByRole('img', { name: '紫青色花纹交织的数字绣衣静态图' })).toBeVisible();
  await expect(section.getByRole('slider')).toBeDisabled();
  await section.getByRole('button', { name: '绣线长卷', exact: true }).click();
  await expect(page.locator('[data-heritage-bird]')).toBeVisible();
});

test('a lost graphics context falls back and restores without a broken control', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('[data-heritage-rebirth]');
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator('[data-rebirth-state]')).toHaveAttribute('data-rebirth-state', 'ready');
  await section.locator('canvas').evaluate((canvas) => {
    const extension = canvas.getContext('webgl').getExtension('WEBGL_lose_context');
    window.restoreEmbroideryContext = () => extension.restoreContext();
    extension.loseContext();
  });
  await expect(section.locator('[data-rebirth-state]')).toHaveAttribute('data-rebirth-state', 'unavailable');
  await page.evaluate(() => window.restoreEmbroideryContext());
  await expect(section.locator('[data-rebirth-state]')).toHaveAttribute('data-rebirth-state', 'ready');
  await expect(section.getByRole('slider')).toBeEnabled();
});

test('motion can be paused, resumed and disabled with the system preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  // Keep the global butterfly cursor and scrolling background out of the
  // visual comparison; this test measures the garment's own animation.
  await page.addStyleTag({ content: '.moon-cursor-layer,.site-background{visibility:hidden!important}' });
  const section = page.locator('[data-heritage-rebirth]');
  const canvas = section.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  await expect(section.locator('[data-rebirth-state]')).toHaveAttribute('data-rebirth-state', 'ready');
  await section.getByRole('button', { name: '暂停绣衣动态' }).click();
  const paused = await canvas.screenshot();
  await page.waitForTimeout(200);
  expect(await changedPixels(page, paused, await canvas.screenshot())).toBeLessThan(10);
  await section.getByRole('button', { name: '继续绣衣动态' }).click();
  await page.waitForTimeout(200);
  expect(await changedPixels(page, paused, await canvas.screenshot())).toBeGreaterThan(100);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reduced = await canvas.screenshot();
  await page.waitForTimeout(200);
  expect(await changedPixels(page, reduced, await canvas.screenshot())).toBeLessThan(10);
});
