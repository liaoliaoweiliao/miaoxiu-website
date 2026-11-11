import { test, expect } from '@playwright/test';

test('减少动态时可主动播放图文入场，并在刷新后保留选择', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#gallery');
  await expect(page.locator('.jing-gallery')).not.toHaveClass(/is-entry-animated/);
  await expect(page.locator('.jing-work.is-visible')).toHaveCount(18);
  await page.getByRole('button', { name: '播放入场动效', exact: true }).click();
  await expect(page.locator('.jing-gallery')).toHaveClass(/is-entry-animated/);
  for (const index of [4, 5]) {
    const card = page.locator('.jing-work').nth(index);
    await expect(card).not.toHaveClass(/is-visible/);
    const before = await card.locator('.jing-work-photo').evaluate(e => new DOMMatrixReadOnly(getComputedStyle(e).transform).m41);
    expect(index % 2 ? before > 0 : before < 0).toBe(true);
    await expect(card.locator('.jing-work-copy')).toHaveCSS('transition-delay', '0.12s');
    await page.locator('.thread-stitch').nth(index).evaluate(marker => marker.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect(card).toHaveClass(/is-visible/);
    await expect(page.locator('.thread-stitch').nth(index)).toHaveClass(/is-stitched/);
    await expect(card.locator('.jing-work-photo')).toHaveCSS('transform', 'none');
    await expect(card.locator('.jing-work-copy')).toHaveCSS('transform', 'none');
  }
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await page.reload();
  await expect(page.getByRole('button', { name: '暂停入场动效', exact: true })).toBeVisible();
  await expect(page.locator('.jing-gallery')).toHaveClass(/is-entry-animated/);
});

test('正常动态下可暂停为静态阅读并记住暂停状态', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#gallery');
  await page.getByRole('button', { name: '暂停入场动效', exact: true }).click();
  await expect(page.locator('.jing-gallery')).not.toHaveClass(/is-entry-animated/);
  await expect(page.locator('.jing-work.is-visible')).toHaveCount(18);
  await expect(page.locator('.jing-work-photo').nth(12)).toHaveCSS('transform', 'none');
  await page.reload();
  await expect(page.getByRole('button', { name: '播放入场动效', exact: true })).toBeVisible();
  await page.locator('.jing-work').nth(12).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.jing-work').nth(12)).toBeFocused();
});

test('存储受限时仍可切换本次播放状态', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    for (const method of ['getItem', 'setItem']) Object.defineProperty(Storage.prototype, method, { value() { throw new Error('storage blocked'); } });
  });
  await page.goto('/#gallery');
  await page.getByRole('button', { name: '播放入场动效', exact: true }).click();
  await expect(page.locator('.jing-gallery')).toHaveClass(/is-entry-animated/);
  await page.getByRole('button', { name: '暂停入场动效', exact: true }).click();
  await expect(page.locator('.jing-work.is-visible')).toHaveCount(18);
});
