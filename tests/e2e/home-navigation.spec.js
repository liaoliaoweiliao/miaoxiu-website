import { test, expect } from '@playwright/test';
import { DISTRIBUTION_POINTS } from '../../src/data/distribution.js';
import { projectPoint } from '../../src/features/home/distributionModel.js';

test.use({ reducedMotion: 'reduce' });

const topics = [
  ['苗族小故事', 'history', 'history-stories'],
  ['纹样图案', 'history', 'history-patterns'],
  ['六大针法', 'history', 'history-stitches'],
  ['色彩解析', 'history', 'history-colors'],
  ['寻纹解密', 'experience', 'miao-decode'],
  ['苗绣衣橱', 'experience', 'miao-wardrobe'],
  ['人物换装', 'experience', 'miao-dressup'],
];

test.beforeEach(async ({ page }) => {
  page.runtimeErrors = [];
  page.on('pageerror', (error) => page.runtimeErrors.push(error.message));
});
test.afterEach(async ({ page }) => expect(page.runtimeErrors).toEqual([]));

for (const width of [390, 1440]) {
  test(`homepage cards and all topic links reach their content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#home');
    for (const [title, route, section] of topics) {
      const link = page.locator('.feature-grid').getByRole('link', { name: title, exact: true });
      if (title === '六大针法') {
        await link.focus();
        await page.keyboard.press('Enter');
      } else await link.click();
      await expect(page).toHaveURL(new RegExp(`#${route}/${section}$`));
      await expect(page.locator(`#${section}`)).toBeFocused();
      await expect.poll(async () => page.locator(`#${section}`).evaluate((element) => {
        const top = element.getBoundingClientRect().top;
        const header = document.querySelector('.site-header,.header,header');
        return top >= (header?.getBoundingClientRect().bottom || 0) - 1 && top < innerHeight / 2;
      })).toBe(true);
      if (section === 'miao-wardrobe') await expect(page.locator('.pool-locked')).toBeVisible();
      if (section === 'history-stories') await expect(page.getByRole('dialog')).toHaveCount(0);
      await page.goBack();
      await expect(page.locator('.feature-grid')).toBeVisible();
    }
    for (const [title, route] of [['苗绣探源', 'history'], ['互动体验', 'experience'], ['作品展览', 'gallery']]) {
      await page.locator('.feature-grid').getByRole('link', { name: title, exact: true }).click({ position: { x: 20, y: 20 } });
      await expect(page).toHaveURL(new RegExp(`#${route}$`));
      await expect(page.locator('main')).toBeVisible();
      await page.goBack();
    }
  });

  test(`all 20 selected places stay centered after selection, filtering and resize at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const selected = page.locator('.thread-map-point.is-selected');
    const geography = page.locator('.thread-map-geography');
    async function expectCentered() {
      await expect.poll(async () => {
        const marker = await selected.boundingBox();
        const map = await geography.boundingBox();
        return Math.max(Math.abs(marker.x + marker.width / 2 - map.x - map.width / 2), Math.abs(marker.y + marker.height / 2 - map.y - map.height / 2));
      }).toBeLessThan(1);
      const id = await page.getByLabel('选择苗乡地点').inputValue();
      const point = projectPoint(DISTRIBUTION_POINTS.find((entry) => entry.id === id).coordinates);
      const landscapePoint = await page.locator('.thread-map-landscape').evaluate((element, point) => {
        const projected = new DOMPoint(point.x, point.y).matrixTransform(element.getScreenCTM());
        const map = document.querySelector('.thread-map-geography').getBoundingClientRect();
        return Math.max(Math.abs(projected.x - map.x - map.width / 2), Math.abs(projected.y - map.y - map.height / 2));
      }, point);
      expect(landscapePoint).toBeLessThan(1);
    }
    await expectCentered();
    // Exercise direct marker clicks as well as the dropdown, including both map edges.
    await page.getByRole('button', { name: '探访花垣，湖南，湘西', exact: true }).click();
    await expect(page.getByLabel('选择苗乡地点')).toHaveValue('huayuan');
    await expectCentered();
    for (const point of DISTRIBUTION_POINTS) {
      await page.getByLabel('选择苗乡地点').selectOption(point.id);
      await expect(selected).toContainText(point.name);
      await expectCentered();
    }
    await page.getByRole('group', { name: '选择地域支系' }).getByRole('button', { name: /湘西/ }).click();
    await expectCentered();
    await page.getByRole('button', { name: '筛选重庆，3处分布点', exact: true }).click();
    await expectCentered();
    await page.getByRole('button', { name: '随机探索一个地点', exact: true }).click();
    await expectCentered();
    await page.getByRole('button', { name: '看全部 ↺', exact: true }).click();
    await expectCentered();
    await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 700 });
    await expectCentered();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('section links support refresh, direct entry, forward history and repeated navigation', async ({ page }) => {
  await page.goto('/#home');
  await page.getByRole('link', { name: '色彩解析', exact: true }).click();
  await expect(page.locator('#history-colors')).toBeFocused();
  await page.reload();
  await expect(page.locator('#history-colors')).toBeFocused();
  await page.goBack();
  await expect(page.locator('.feature-grid')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#history-colors')).toBeFocused();
  await page.locator('#primary-navigation').getByRole('button', { name: '首页', exact: true }).click();
  await page.getByRole('link', { name: '色彩解析', exact: true }).click();
  await expect(page.locator('#history-colors')).toBeFocused();
  await page.goto('/#experience/miao-dressup');
  await expect(page.locator('#miao-dressup')).toBeFocused();
});

test('map movement animates and converges on the selected place with full motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByLabel('选择苗乡地点').selectOption('malipo');
  await expect.poll(async () => page.locator('.thread-map-point.is-selected').evaluate((element) => {
    const marker = element.getBoundingClientRect();
    const map = document.querySelector('.thread-map-geography').getBoundingClientRect();
    return Math.max(Math.abs(marker.x + marker.width / 2 - map.x - map.width / 2), Math.abs(marker.y + marker.height / 2 - map.y - map.height / 2));
  })).toBeLessThan(1);
  expect(await page.locator('.thread-map-nodes').evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0.6s');
});
