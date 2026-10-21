import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('inspiration invitations load their images and enter all three existing experiences', async ({ page }) => {
  for (const [sample, route, heading] of [
    [0, 'history', '衣襟上的蝴蝶'],
    [.5, 'experience', '下一套苗衣'],
    [.99, 'gallery', '如果针线会说话'],
  ]) {
    await page.goto('/');
    await page.evaluate((value) => { Math.random = () => value; }, sample);
    const trigger = page.getByRole('button', { name: '抽一枚灵感签' });
    await trigger.click();
    const panel = page.getByRole('dialog');
    await expect(panel).toContainText(heading);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: '收起灵感签' })).toBeFocused();
    await expect.poll(() => panel.locator('img').evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    await panel.locator('.inspiration-go').click();
    await expect(page).toHaveURL(new RegExp(`#${route}$`));
    await expect(panel).toHaveCount(0);
    await expect(page.locator(`#primary-navigation [aria-current="page"]`)).toHaveCount(1);
  }
});

test('inspiration redraw avoids the current page and last card, with keyboard and outside dismissal', async ({ page }) => {
  await page.goto('/#history');
  const trigger = page.getByRole('button', { name: '抽一枚灵感签' });
  await trigger.focus();
  await trigger.press('Enter');
  const title = page.locator('#inspiration-heading');
  const initial = await title.textContent();
  await expect(title).not.toContainText('衣襟上的蝴蝶');
  await page.getByRole('button', { name: '换一签' }).click();
  await expect(title).not.toHaveText(initial);
  await expect(title).not.toContainText('衣襟上的蝴蝶');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.press('Space');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.locator('main').first().click({ position: { x: 5, y: 5 } });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await page.getByRole('button', { name: '苗绣 · 穿在身上的民族历史，返回首页' }).focus();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('compact menu, inspiration and search stay exclusive and usable after a resize', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: '展开导航' });
  const trigger = page.getByRole('button', { name: '抽一枚灵感签' });
  await menu.click();
  await expect(page.locator('#primary-navigation')).toHaveClass(/open/);
  await trigger.click();
  await expect(page.locator('#primary-navigation')).not.toHaveClass(/open/);
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: '搜索', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('searchbox')).toBeFocused();
  await menu.click();
  await expect(page.getByRole('searchbox')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await page.setViewportSize({ width: 640, height: 240 });
  const panel = page.getByRole('dialog');
  const bounds = await panel.boundingBox();
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(240);
  await panel.locator('.inspiration-go').scrollIntoViewIfNeeded();
  await expect(panel.locator('.inspiration-go')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
