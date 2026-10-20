import { test, expect } from '@playwright/test';
import { levels } from '../../src/features/experience/gameModel.js';

// Animation timing is tested in model contracts; browser flows use reduced motion.
test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
  page.runtimeErrors = [];
  page.on('pageerror', (error) => page.runtimeErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) page.runtimeErrors.push(`${response.status()} ${response.url()}`);
  });
});
test.afterEach(async ({ page }) => { expect(page.runtimeErrors).toEqual([]); });

async function expectImagesLoaded(page) {
  const broken = await page.locator('img').evaluateAll(async (images) => {
    await Promise.all(images.map(async (image) => {
      image.loading = 'eager';
      try { await image.decode(); } catch { /* Report the actual failed image below. */ }
    }));
    return images.filter((image) => !image.naturalWidth).map((image) => image.src);
  });
  expect(broken).toEqual([]);
}

async function discover(page, index = 0) {
  const region = levels[index].regions[0];
  const target = region.shape === 'rect' ? { x: region.x + region.w / 2, y: region.y + region.h / 2 } : { x: region.cx, y: region.cy };
  const board = page.locator('.decode-board');
  await board.locator('img').evaluate((image) => image.decode());
  const size = await board.boundingBox();
  await board.click({ position: { x: size.width * target.x / 100, y: size.height * target.y / 100 } });
  await expect(page.getByRole('dialog')).toContainText(`你找到了${levels[index].name}`);
}

async function draw(page, gender = 'girl') {
  await page.locator(`[data-action="drawGender"][data-id="${gender}"]`).click();
  await page.locator('.draw-btn').click();
  await expect(page.locator('.costume-draw-stage')).toHaveClass(/has-result/);
  await expect(page.locator('.draw-btn')).toBeEnabled();
}

test('five-page navigation, carousel, controlled search and hash history', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero')).toHaveAttribute('data-slide', '0');
  await expectImagesLoaded(page);
  const search = page.getByRole('searchbox', { name: '搜索苗绣内容' });
  await search.fill('苗绣');
  await page.getByRole('button', { name: '下一张图片', exact: true }).click();
  await expect(page.locator('.hero')).toHaveAttribute('data-slide', '1');
  await expect(search).toHaveValue('苗绣');
  await page.getByRole('button', { name: '查看第 4 张图片', exact: true }).click();
  await expect(page.locator('.hero-current')).toHaveText('04');
  await search.press('Enter');
  await expect(page).toHaveURL(/#history$/);
  await expect(page.locator('.story-card')).toHaveCount(3);
  await expect(page.locator('.stitch-item')).toHaveCount(6);
  await expectImagesLoaded(page);
  await search.fill('素材来源');
  await search.press('Enter');
  await expect(page).toHaveURL(/#sources$/);
  expect(await page.locator('.source-entry').count()).toBeGreaterThan(0);
  await page.goBack();
  await expect(page).toHaveURL(/#history$/);
  await page.goForward();
  await expect(page).toHaveURL(/#sources$/);
  await page.goto('/#unknown');
  await expect(page.locator('.hero')).toBeVisible();
  await expect(page).toHaveTitle('首页 · 穿在身上的民族历史');
});

test('atlas filters connect the map, timeline and statistics', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.atlas-number')).toContainText('07');
  await page.getByRole('button', { name: /查看贵州地域记录/ }).click();
  await expect(page.locator('.atlas-local-view')).toBeVisible();
  await expect(page.locator('.atlas-number')).toContainText('07');
  await page.locator('.atlas-node').first().click();
  await expect(page.locator('.atlas-record')).toHaveClass(/is-filled/);
  await page.locator('.atlas-clear').click();
  await page.locator('.atlas-year').filter({ hasText: '2006' }).click();
  await expect(page.locator('.atlas-number')).toContainText('03');
  await page.locator('.atlas-clear').click();
  await expect(page.locator('.atlas-number')).toContainText('07');
});

test('heritage bird completes its three-part story and returns to the start', async ({ page }) => {
  await page.goto('/');
  const bird = page.locator('[data-heritage-bird]');
  await bird.click();
  await expect(page.locator('[data-heritage-number]')).toHaveText('02');
  await bird.click();
  await expect(page.locator('[data-heritage-number]')).toHaveText('03');
  await bird.click();
  await expect(page.locator('[data-heritage-number]')).toHaveText('01');
  await expect(page.locator('.heritage-whisper')).toContainText('又回到了起点');
});

test('stories, motif navigation, stitch animation and three-color palette', async ({ page }) => {
  await page.goto('/#history');
  await page.locator('.story-image').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('.story-reader-count')).toContainText('01 /');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.story-reader-count')).toContainText('02 /');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.story-image').first()).toBeFocused();
  const original = await page.locator('.motif-base-image').getAttribute('src');
  await page.getByRole('button', { name: '下一个纹样', exact: true }).click();
  await expect(page.locator('.motif-base-image')).not.toHaveAttribute('src', original);
  await page.locator('.stitch-item').nth(2).click();
  await expect(page.locator('.stitch-stage')).toHaveClass(/is-complete/);
  await expect(page.locator('.stitch-item').nth(2)).toHaveAttribute('aria-pressed', 'true');
  for (let index = 0; index < 3; index++) await page.locator('.color-swatch').nth(index).click();
  await expect(page.locator('.palette-readout > b')).toContainText('3/3');
  await page.locator('.color-challenge').click();
  await expect(page.locator('.color-challenge')).toContainText('三色配色已完成');
  await page.getByRole('button', { name: '清空选择', exact: true }).click();
  await expect(page.locator('.palette-readout > b')).toHaveText('未上色线稿');
  await expectImagesLoaded(page);
});

test('long gallery and accessible image zoom, drag, details and download', async ({ page }) => {
  await page.goto('/#gallery');
  await expect(page.locator('.jing-work')).toHaveCount(18);
  await expectImagesLoaded(page);
  await page.locator('.jing-work').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: '关闭图片欣赏' })).toBeFocused();
  await page.locator('.image-viewer-zoom').click();
  await expect(page.locator('.image-viewer-stage')).toHaveClass(/is-zoomed/);
  await expect(page.locator('.image-viewer-save')).toHaveAttribute('download', /.+\.(jpg|png|webp)$/);
  await page.locator('.image-viewer-zoom').click();
  await expect(page.locator('.image-viewer-stage')).not.toHaveClass(/is-zoomed/);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.jing-work').first()).toBeFocused();
  await page.locator('.jing-slot.has-catalogue .jing-work').first().click();
  await expect(page.locator('.image-viewer-details')).toBeVisible();
});

test('puzzle, repeat draws, separate gender collections, dressing and PNG export', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.goto('/#experience');
  await expect(page.locator('.decode-counter')).toHaveText('寻找 1 处');
  await page.locator('.decode-board').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('#decode-feedback')).toContainText('还未找到');
  await discover(page);
  await page.getByRole('button', { name: '进入对应苗绣衣橱 →', exact: true }).click();
  await expect(page.locator('[data-action="drawGender"]').first()).toBeFocused();
  await draw(page);
  await expect(page.locator('.owned-card')).toHaveCount(1);
  await page.locator('.draw-btn').click();
  await expect(page.locator('.owned-card')).toHaveCount(2);
  await expect(page.locator('.draw-btn')).toBeEnabled();
  await draw(page, 'boy');
  await expect(page.locator('.owned-card')).toHaveCount(1);
  await page.locator('.wear-full').first().click();
  await expect(page.locator('.wear-full').first()).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '放大人物', exact: true }).click();
  await expect(page.locator('.viewer-scale')).toHaveText('125%');
  await page.getByRole('button', { name: '全屏观赏', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '人物服饰观看器' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('[data-action="finishLoop"]')).toBeEnabled();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-action="save"]').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('我的苗绣装扮-boy.png');
  const file = await download.createReadStream();
  const chunks = [];
  for await (const chunk of file) chunks.push(chunk);
  const png = Buffer.concat(chunks);
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.readUInt32BE(16)).toBe(900);
  expect(png.readUInt32BE(20)).toBe(1400);
  await page.locator('[data-action="finishLoop"]').click();
  await expect(page.locator('.level-label')).toContainText('第 2 轮');
  await expect(page.locator('.target-brief strong')).toContainText('牡丹花纹');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')));
  expect(saved.owned).toHaveLength(3);
  expect(saved.equipped.boy).toBeTruthy();
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')))).toEqual(saved);
  await expect(page.locator('.owned-card')).toHaveCount(1);
  await expectImagesLoaded(page);
});

for (const index of [1, 2]) {
  test(`region hit detection remains playable for ${levels[index].name}`, async ({ page }) => {
    await page.addInitScript((sample) => { Math.random = () => sample; }, (index + 0.1) / 3);
    await page.goto('/#experience');
    await discover(page, index);
    await page.keyboard.press('Escape');
    await expect(page.locator('.decode-counter')).toHaveText('已找到');
    await expectImagesLoaded(page);
  });
}

test('mobile menu and restricted storage stay usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage disabled', 'SecurityError'); } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: '展开导航' }).click();
  await expect(page.locator('#primary-navigation')).toHaveClass(/open/);
  await page.locator('#primary-navigation').getByRole('button', { name: '互动体验', exact: true }).click();
  await expect(page).toHaveURL(/#experience$/);
  await expect(page.getByRole('button', { name: '展开导航' })).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.decode-board')).toBeVisible();
  await expectImagesLoaded(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('decorative theme keeps scrolled image dialogs in the viewport', async ({ page }) => {
  await page.goto('/#gallery');
  await page.getByRole('button', { name: '切换纹样装饰' }).click();
  await expect(page.locator('body')).toHaveClass(/bloom/);
  await page.locator('.jing-work').last().click();
  const bounds = await page.locator('.modal').boundingBox();
  expect(Math.abs(bounds.y)).toBeLessThan(1);
  expect(bounds.height).toBe(page.viewportSize().height);
  await page.keyboard.press('Escape');
});

test('repeating the same theme search still selects its unlocked wardrobe', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('miao-wardrobe-v4', JSON.stringify({ unlocked: ['star', 'peony'], owned: [], gender: 'girl', equipped: { girl: null, boy: null } })));
  await page.goto('/#experience');
  const search = page.getByRole('searchbox', { name: '搜索苗绣内容' });
  await search.fill('八角星纹');
  await search.press('Enter');
  await expect(page.locator('.motif-tab.selected strong')).toHaveText('八角星纹');
  await page.locator('[data-action="pool"][data-id="peony"]').click();
  await expect(page.locator('.motif-tab.selected strong')).toHaveText('牡丹花纹');
  await search.press('Enter');
  await expect(page.locator('.motif-tab.selected strong')).toHaveText('八角星纹');
});
