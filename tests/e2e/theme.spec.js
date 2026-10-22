import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('ornament switch preserves the original artwork and map colors on every page', async ({ page }) => {
  const legacyWallpaper = [];
  page.on('request', (request) => {
    if (/\/(page-background|floral-corner)\.webp(?:\?|$)/.test(request.url())) legacyWallpaper.push(request.url());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of ['home', 'history', 'experience', 'gallery', 'sources']) {
    await page.goto(`/#${route}`);
    const decoration = page.getByRole('button', { name: '切换纹样装饰' });
    const appearance = () => page.evaluate(() => {
      const elements = [...document.querySelectorAll('body,#root,main,main img,main svg')];
      return elements.map((element) => {
        const style = getComputedStyle(element);
        return { filter: style.filter, opacity: style.opacity };
      });
    });
    const original = await appearance();
    await decoration.click();
    await expect(decoration).toHaveAttribute('aria-pressed', 'true');
    expect(await appearance()).toEqual(original);
    expect(await page.locator('body').evaluate((element) =>
      [element, document.querySelector('#root'), document.querySelector('main')]
        .every((node) => getComputedStyle(node).filter === 'none' && getComputedStyle(node).opacity === '1'),
    )).toBe(true);
    await decoration.click();
    await expect(decoration).toHaveAttribute('aria-pressed', 'false');
  }
  expect(legacyWallpaper).toEqual([]);
});

test('title, seal, navigation and search stay separate across header breakpoints', async ({ page }) => {
  await page.goto('/#history');
  for (const width of [320, 390, 760, 761, 800, 1024, 1100, 1101, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 800 });
    const bounds = await page.evaluate(() => {
      const box = (selector) => {
        const { x, y, right, bottom } = document.querySelector(selector).getBoundingClientRect();
        return { x, y, right, bottom };
      };
      return { title: box('.brand-title'), seal: box('.brand-seal'), tools: box('.nav-tools'), bar: box('.topbar'), nav: box('.nav') };
    });
    expect(bounds.seal.x).toBeGreaterThan(bounds.title.x);
    expect(bounds.seal.right).toBeLessThanOrEqual(bounds.tools.x - 8);
    expect(bounds.seal.bottom).toBeLessThanOrEqual(bounds.bar.bottom);
    expect(bounds.tools.right).toBeLessThanOrEqual(width);
    if (width > 760) {
      expect(bounds.title.right).toBeLessThanOrEqual(bounds.nav.x - 8);
      expect(bounds.nav.right).toBeLessThanOrEqual(bounds.tools.x - 8);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const target = page.locator('.nav-link').nth(2);
  await page.locator('.nav-link').nth(1).focus();
  await page.keyboard.press('Tab');
  await expect(target).toBeFocused();
  expect(await target.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#experience$/);
  await page.locator('.wardrobe-frame').scrollIntoViewIfNeeded();
  expect(await page.locator('.topbar').evaluate((element) => element.getBoundingClientRect().top)).toBe(0);
  await expect(target).toHaveAttribute('aria-current', 'page');
});
