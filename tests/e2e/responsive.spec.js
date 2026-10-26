import { test, expect, chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

test.use({ reducedMotion: 'reduce' });
const routes = ['home', 'history', 'experience', 'gallery', 'sources'];

async function expectLayout(page) {
  const overflow = await page.evaluate(() => {
    const selectors = 'main,.nav-inner,.thread-map-scroll,.thread-dashboard,.decode-content,.collection-panel,.story-grid,.color-lab,.jing-slot,.source-entry';
    return [...document.querySelectorAll(selectors)].filter((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.width && (bounds.left < -1 || bounds.right > innerWidth + 1 || (!element.matches('main') && element.scrollWidth > element.clientWidth + 1));
    }).map((element) => element.className);
  });
  expect(overflow).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function expectInside(inner, outer) {
  await expect.poll(async () => {
    const bounds = await inner.boundingBox();
    const container = await outer.boundingBox();
    return bounds && container && bounds.x >= container.x - 1 && bounds.y >= container.y - 1 && bounds.x + bounds.width <= container.x + container.width + 1 && bounds.y + bounds.height <= container.y + container.height + 1;
  }).toBe(true);
}

for (const viewport of [{ width: 320, height: 700 }, { width: 640, height: 500 }, { width: 800, height: 600 }, { width: 1024, height: 768 }, { width: 1920, height: 1080 }]) {
  test(`all five pages reflow at ${viewport.width} × ${viewport.height}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(`/#${route}`);
      await expect(page.locator('main').first()).toBeVisible();
      await expectLayout(page);
      if (route === 'gallery') {
        const photos = await page.locator('.jing-work-photo').evaluateAll((elements) => elements.map((element) => ({ width: element.clientWidth, height: element.clientHeight })));
        expect(photos).toHaveLength(18);
        expect(photos.every((photo) => photo.width === photos[0].width && photo.height === photo.width)).toBe(true);
        expect(await page.locator('.jing-work').first().getByRole('heading', { level: 2 }).evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
      }
    }
    expect(errors).toEqual([]);
  });
}

test('resizing keeps every selected map pin and the three bird stages reachable', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('.thread-map-canvas');
  const selected = page.locator('.thread-map-point.is-selected');
  for (const width of [320, 640, 1024, 1440]) {
    await page.setViewportSize({ width, height: 700 });
    for (const id of ['junlian', 'pengshui', 'huayuan', 'malipo', 'danzhai']) {
      await page.getByLabel('选择苗乡地点').selectOption(id);
      await expectInside(selected.locator('.thread-selected-pin'), canvas);
      await expectInside(selected.locator('.thread-point-label'), canvas);
      expect(await page.locator('.thread-map-scroll').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    }
  }
  await page.getByRole('button', { name: '绣线长卷', exact: true }).click();
  const bird = page.locator('[data-heritage-bird]');
  const journey = page.locator('.heritage-viewport');
  for (const [index, width] of [390, 640, 320].entries()) {
    await page.setViewportSize({ width, height: 700 });
    await expectInside(bird, journey);
    await expectInside(page.locator('.heritage-bird-hint'), journey);
    await bird.click();
    await expect(page.locator('[data-heritage-number]')).toHaveText(index === 2 ? '01' : `0${index + 2}`);
    await expectInside(bird, journey);
    await expectInside(page.locator('.heritage-bird-hint'), journey);
    if (index === 0) {
      const birdBounds = await bird.boundingBox();
      const hintBounds = await page.locator('.heritage-bird-hint').boundingBox();
      expect(hintBounds.y).toBeGreaterThanOrEqual(birdBounds.y + birdBounds.height);
    }
  }
});

test('compact search, menu and native browser zoom shortcuts remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto('/');
  await page.getByRole('button', { name: '展开导航' }).click();
  await page.getByRole('button', { name: '搜索', exact: true }).click();
  const search = page.getByRole('searchbox', { name: '搜索苗绣内容' });
  await expect(search).toBeFocused();
  await expect(page.locator('#primary-navigation')).not.toHaveClass(/open/);
  await search.fill('八角星纹');
  await search.press('Enter');
  await expect(page).toHaveURL(/#experience$/);
  await page.getByRole('button', { name: '搜索', exact: true }).click();
  await expect(search).toHaveValue('八角星纹');
  await search.press('Escape');
  await expect(search).toBeHidden();
  const viewport = page.locator('.viewer-viewport');
  const intercepted = await viewport.evaluate((element) => {
    const wheel = new WheelEvent('wheel', { ctrlKey: true, deltaY: -100, bubbles: true, cancelable: true });
    const key = new KeyboardEvent('keydown', { key: '+', ctrlKey: true, bubbles: true, cancelable: true });
    element.dispatchEvent(wheel);
    element.dispatchEvent(key);
    return wheel.defaultPrevented || key.defaultPrevented;
  });
  expect(intercepted).toBe(false);
  await expect(page.locator('.viewer-scale')).toHaveText('100%');
  await viewport.focus();
  await viewport.press('+');
  await expect(page.locator('.viewer-scale')).toHaveText('125%');
});

test('image, story and character dialogs fit a short viewport after resizing', async ({ page }) => {
  await page.goto('/#gallery');
  await page.locator('.jing-slot.has-catalogue .jing-work').first().click();
  await page.locator('.image-viewer-zoom').click();
  for (const viewport of [{ width: 640, height: 360 }, { width: 320, height: 240 }]) {
    await page.setViewportSize(viewport);
    const bounds = await page.getByRole('dialog').boundingBox();
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
    await expectInside(page.getByRole('button', { name: '关闭图片欣赏' }), page.getByRole('dialog'));
    await page.locator('.image-viewer-save').scrollIntoViewIfNeeded();
    await expectInside(page.getByRole('button', { name: '关闭图片欣赏' }), page.getByRole('dialog'));
  }
  await page.keyboard.press('Escape');
  await page.goto('/#history');
  await page.locator('.story-image').first().click();
  await expectInside(page.locator('.story-animation-shell'), page.locator('.story-animation-overlay'));
  await page.getByRole('button', { name: '阅读文字', exact: true }).click();
  await expectInside(page.locator('.story-reader-panel'), page.locator('.story-reader'));
  await page.locator('.story-reader-nav button').last().scrollIntoViewIfNeeded();
  await page.keyboard.press('Escape');
  await page.goto('/#experience');
  await page.getByRole('button', { name: '全屏观赏', exact: true }).click();
  const viewer = page.getByRole('dialog', { name: '人物服饰观看器' });
  await expectInside(page.getByRole('button', { name: '退出全屏观赏', exact: true }), viewer);
  await page.keyboard.press('Escape');
  await expect(viewer).toHaveCount(0);
});

// Seed a disposable profile using Chromium's native zoom preference. This tests
// browser page zoom and media-query reflow, rather than CSS zoom or pinch scale.
// Schema: chromium/src/chrome/browser/ui/zoom/chrome_zoom_level_prefs.cc.
for (const factor of [.5, .8, 1.25, 1.5, 2, 3, 4]) {
  test(`native browser page zoom ${Math.round(factor * 100)}% preserves all pages`, async ({}, testInfo) => {
    const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'miaoxiu-zoom-'));
    let context;
    try {
      await fs.mkdir(path.join(profile, 'Default'));
      await fs.writeFile(path.join(profile, 'Default', 'Preferences'), JSON.stringify({ partition: { default_zoom_level: { x: Math.log(factor) / Math.log(1.2) } } }));
      context = await chromium.launchPersistentContext(profile, { channel: testInfo.project.use.channel, headless: true, viewport: null, reducedMotion: 'reduce', args: ['--window-size=1280,800'] });
      const page = context.pages()[0];
      const cdp = await context.newCDPSession(page);
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      for (const route of routes) {
        await page.goto(`${testInfo.project.use.baseURL}/#${route}`);
        const metrics = await cdp.send('Page.getLayoutMetrics');
        expect(metrics.visualViewport.zoom).toBeCloseTo(factor, 2);
        await expectLayout(page);
      }
      // At large zoom, the same image dialog must still expose its close control.
      if (factor >= 2) {
        await page.goto(`${testInfo.project.use.baseURL}/#gallery`);
        await page.locator('.jing-work').first().click();
        await expectInside(page.getByRole('button', { name: '关闭图片欣赏' }), page.getByRole('dialog'));
        await page.keyboard.press('Escape');
      }
      expect(errors).toEqual([]);
    } finally {
      await context?.close();
      // Resolve and verify the generated target before any recursive removal.
      const target = path.resolve(profile);
      if (path.dirname(target) !== path.resolve(os.tmpdir()) || !path.basename(target).startsWith('miaoxiu-zoom-')) throw new Error('Unexpected temporary browser profile path');
      await fs.rm(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  });
}
