import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });
const input = (page) => page.getByRole('combobox', { name: '搜索苗绣内容' });

test('needle search lists six choices and opens the selected technique, including on the same page', async ({ page }) => {
  await page.goto('/');
  await input(page).fill('针法');
  await input(page).press('Enter');
  await expect(page).not.toHaveURL(/#history$/);
  await expect(page.getByRole('listbox', { name: '搜索结果' }).getByRole('option')).toHaveCount(6);
  await page.getByRole('listbox', { name: '搜索结果' }).getByRole('option', { name: /^锁绣/ }).click();
  await expect(page).toHaveURL(/#history$/);
  const selected = page.locator('.stitch-item[aria-pressed="true"]');
  await expect(selected.locator('strong')).toHaveText('锁绣');
  await expect(selected).toBeFocused();
  await expect(page.getByRole('group', { name: '锁绣针法动态演示', exact: true })).toBeVisible();
  const section = await page.locator('#history-stitches').boundingBox();
  expect(section.y).toBeGreaterThanOrEqual(75);
  expect(section.y).toBeLessThan(180);
  await input(page).fill('打籽绣');
  await input(page).press('Enter');
  await expect(selected.locator('strong')).toHaveText('打籽绣');
  const drawing = await page.locator('.stitch-crafted-svg').elementHandle();
  await input(page).press('Enter');
  await expect.poll(() => drawing.evaluate((element) => element.isConnected)).toBe(false);
  await expect(page.locator('.search-popover')).toHaveCount(0);
});

test('keyboard arrows choose a concrete result and escape dismisses the list', async ({ page }) => {
  await page.goto('/');
  await input(page).fill('针法');
  await input(page).press('ArrowUp');
  await expect(page.getByRole('listbox', { name: '搜索结果' }).getByRole('option', { selected: true })).toContainText('打籽绣');
  await input(page).press('ArrowDown');
  await expect(page.getByRole('listbox', { name: '搜索结果' }).getByRole('option', { selected: true })).toContainText('平绣');
  await input(page).press('Enter');
  await expect(page.locator('.stitch-item[aria-pressed="true"] strong')).toHaveText('平绣');
  await input(page).fill('针法');
  await input(page).press('Escape');
  await expect(page.locator('.search-popover')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '搜索', exact: true })).toBeFocused();
});

test('work names open the exact image and restore focus to that work when closed', async ({ page }) => {
  await page.goto('/');
  for (const title of ['儿童节日背心', '蝶舞 空间']) {
    const expected = title === '蝶舞 空间' ? '蝶舞·空间' : title;
    await input(page).fill(title);
    await page.getByRole('listbox', { name: '搜索结果' }).getByRole('option', { name: new RegExp(`^${expected}`) }).click();
    await expect(page).toHaveURL(/#gallery$/);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(expected);
    await page.getByRole('button', { name: '关闭图片欣赏' }).press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('button', { name: new RegExp(`^放大观赏${expected}`) })).toBeFocused();
  }
});

test('no results offer nearby recommendation buttons without a browser alert', async ({ page }) => {
  const dialogs = [];
  page.on('dialog', async (dialog) => { dialogs.push(dialog.message()); await dialog.dismiss(); });
  await page.goto('/#sources');
  await input(page).fill('不存在98765');
  await input(page).press('Enter');
  await expect(page.locator('.search-popover')).toContainText('没有找到相关内容');
  await expect(page).toHaveURL(/#sources$/);
  await page.getByRole('button', { name: '针法', exact: true }).click();
  await expect(input(page)).toHaveValue('针法');
  await expect(page.getByRole('listbox', { name: '搜索结果' }).getByRole('option')).toHaveCount(6);
  await page.locator('.source-overview').click();
  await expect(page.locator('.search-popover')).toHaveCount(0);
  expect(dialogs).toEqual([]);
});

for (const viewport of [{ width: 320, height: 700 }, { width: 640, height: 500 }, { width: 800, height: 600 }]) {
  test(`search input and results fit the viewport at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    if (viewport.width <= 760) {
      await page.getByRole('button', { name: '展开导航' }).click();
      await page.getByRole('button', { name: '搜索', exact: true }).click();
      await expect(input(page)).toBeFocused();
      await expect(page.locator('#primary-navigation')).not.toHaveClass(/open/);
    }
    await input(page).fill('针法');
    const box = await page.locator('.search-popover').boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    await page.getByRole('listbox', { name: '搜索结果' }).getByRole('option', { name: /^辫绣/ }).click();
    await expect(page.locator('.stitch-item[aria-pressed="true"] strong')).toHaveText('辫绣');
    await expect(page.locator('.search-popover')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('story and motif results display the matching content rather than only changing the page', async ({ page }) => {
  await page.goto('/');
  await input(page).fill('回纹');
  await input(page).press('Enter');
  await expect(page.locator('.motif-menu-item[aria-pressed="true"]')).toContainText('回纹');
  await expect(page.locator('.motif-menu-item[aria-pressed="true"]')).toBeFocused();
  await expect(page.locator('.motif-art-copy h3')).toHaveText('回纹');
  await input(page).fill('蝴蝶纹');
  await input(page).press('Enter');
  await expect(page.locator('.motif-menu-item[aria-pressed="true"]')).toHaveAccessibleName('查看蝴蝶纹');
  await expect(page.locator('.motif-menu-item[aria-pressed="true"]')).toBeFocused();
  await input(page).fill('兰娟记事');
  await input(page).press('Enter');
  await expect(page.getByRole('dialog', { name: '兰娟记事故事书' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '阅读故事《兰娟记事》' })).toBeFocused();
  await expect(page.getByRole('button', { name: '阅读文字', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: /开启互动体验/ }).click();
  await expect(page).toHaveURL(/#experience$/);
  await expect(page.locator('.decode-board')).toBeVisible();
});

test('IME composition does not trigger a search before the text is committed', async ({ page }) => {
  await page.goto('/');
  await input(page).fill('平绣');
  await input(page).evaluate((element) => element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true })));
  await expect(page).not.toHaveURL(/#history$/);
  await input(page).press('Enter');
  await expect(page.locator('.stitch-item[aria-pressed="true"] strong')).toHaveText('平绣');
});

test('normal motion finishes at the selected technique and keeps a searched work available after closing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#sources');
  await input(page).fill('辫绣');
  await input(page).press('Enter');
  await expect(page.locator('.stitch-item[aria-pressed="true"]')).toBeFocused();
  await expect.poll(async () => {
    const box = await page.locator('#history-stitches').boundingBox();
    return box.y >= 75 && box.y < 180;
  }).toBe(true);
  await input(page).fill('绣纹手账');
  await input(page).press('Enter');
  await expect(page.getByRole('dialog')).toContainText('绣纹手账');
  await page.keyboard.press('Escape');
  const work = page.getByRole('button', { name: /^放大观赏绣纹手账/ });
  await expect(work).toBeFocused();
  await expect(work).toBeInViewport();
});
