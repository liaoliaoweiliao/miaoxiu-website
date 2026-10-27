import { test, expect } from '@playwright/test';
import { levels, setById } from '../../src/features/experience/gameModel.js';

test.use({ reducedMotion: 'reduce' });

async function discover(page, index) {
  const region = levels[index].regions[0];
  const x = region.shape === 'rect' ? region.x + region.w / 2 : region.cx;
  const y = region.shape === 'rect' ? region.y + region.h / 2 : region.cy;
  const board = page.locator('.decode-board');
  await board.locator('img').evaluate((image) => image.decode());
  const bounds = await board.boundingBox();
  await board.click({ position: { x: bounds.width * x / 100, y: bounds.height * y / 100 } });
  await page.getByRole('button', { name: '进入对应苗绣衣橱 →', exact: true }).click();
}

for (const width of [1440, 390]) {
  test(`three complete journeys preserve collections, change photos and clear old filters at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => { Math.random = () => 0; });
    await page.goto('/#experience');
    for (let index = 0; index < 3; index += 1) {
      const gender = index === 1 ? 'boy' : 'girl';
      await expect(page.locator('.level-label')).toContainText(`第 ${index + 1} 轮`);
      await discover(page, index);
      await page.locator(`[data-action="drawGender"][data-id="${gender}"]`).click();
      await page.locator('.draw-btn').click();
      await expect(page.locator('.costume-draw-stage')).toHaveClass(/has-result/);
      await expect(page.locator('.costume-draw-stage')).not.toHaveClass(/is-revealing/);
      await expect(page.locator('.draw-btn')).toBeDisabled();
      await page.locator('[data-action="openDressup"]').click();
      const outfit = page.locator(`.owned-card:has([data-id^="${levels[index].id}-${gender}"])`).first();
      await outfit.locator('.wear-full').click();
      await expect(outfit.locator('.wear-full')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-action="finishLoop"]')).toBeEnabled();
      await page.locator(`[data-action="collectionFilter"][data-id="${levels[index].id}"]`).click();
      const photograph = await page.locator('.decode-board img').getAttribute('src');
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')));
      expect(saved.owned).toHaveLength(index + 1);
      expect(saved.unlocked).toEqual(levels.slice(0, index + 1).map((level) => level.id));
      await page.evaluate((sample) => { Math.random = () => sample; }, index === 1 ? 0.99 : 0);
      await page.locator('[data-action="finishLoop"]').click();
      await expect(page.locator('.decode-board')).toBeFocused();
      await expect(page.locator('.level-label')).toContainText(`第 ${index + 2} 轮`);
      await expect(page.locator('.decode-board img')).not.toHaveAttribute('src', photograph);
      await expect(page.locator('.decode-counter')).toHaveText('寻找 1 处');
      await expect(page.locator('[data-action="collectionFilter"][data-id="all"]')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-action="finishLoop"]')).toHaveCount(0);
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')))).toEqual(saved);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await expect(page.locator('.level-label')).toContainText('第 4 轮');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')));
    await page.reload();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')))).toEqual(saved);
    expect(errors).toEqual([]);
  });
}

for (const width of [1440, 820, 320]) {
  test(`wardrobe uses its sidebar and keeps card actions close at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(() => { Math.random = () => 0; });
    await page.goto('/#experience');
    await discover(page, 0);
    for (const gender of ['girl', 'boy']) {
      const choice = page.locator(`[data-action="drawGender"][data-id="${gender}"]`);
      await choice.click();
      expect(await choice.evaluate((element) => Boolean(element.closest('.side-heading')))).toBe(true);
      const card = await page.locator('.draw-card').boundingBox();
      const button = await page.locator('.draw-btn').boundingBox();
      expect(button.y - card.y - card.height).toBeGreaterThan(0);
      expect(button.y - card.y - card.height).toBeLessThan(65);
      const note = await page.locator('.draw-note').boundingBox();
      expect(note.y - button.y - button.height).toBeLessThan(20);
      if (width > 900) {
        const choices = await page.locator('.character-choice').boundingBox();
        const main = await page.locator('.wardrobe-main').boundingBox();
        expect(choices.x + choices.width).toBeLessThan(main.x);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.locator('.draw-btn').click();
    await expect(page.locator('.costume-draw-stage')).toHaveClass(/has-result/);
    await expect(page.locator('.reveal-front')).toBeVisible();
    await expect(page.locator('.draw-btn')).toBeDisabled();
    const card = await page.locator('.draw-card').boundingBox();
    const caption = await page.locator('.prize-footer').boundingBox();
    const drawButton = await page.locator('.draw-btn').boundingBox();
    expect(caption.y).toBeGreaterThan(card.y + card.height + 10);
    expect(caption.y + caption.height).toBeLessThan(drawButton.y);
  });
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 820, height: 600 }, { width: 390, height: 844 }, { width: 320, height: 700 }, { width: 640, height: 500 }]) {
  test(`selecting either role fits the complete card and draw button at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    if (viewport.width === 1366 || viewport.width === 390) await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addInitScript(() => { Math.random = () => 0; });
    await page.goto('/#experience');
    await discover(page, 0);
    for (const gender of ['girl', 'boy']) {
      await page.locator(`[data-action="drawGender"][data-id="${gender}"]`).click();
      await expect(page.locator('.wardrobe-draw')).toBeFocused();
      for (const selector of ['.draw-card', '.draw-btn']) {
        const box = await page.locator(selector).boundingBox();
        const header = await page.locator('header').boundingBox();
        expect(box.y).toBeGreaterThanOrEqual(header.y + header.height);
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      }
    }
    await page.locator('.draw-btn').click();
    await expect(page.locator('.costume-draw-stage')).toHaveClass(/has-result/);
    await expect(page.locator('.costume-draw-stage')).not.toHaveClass(/is-revealing/);
    for (const selector of ['.draw-card', '.reveal-front>img', '.draw-btn']) {
      const box = await page.locator(selector).boundingBox();
      expect(box.y).toBeGreaterThanOrEqual(62);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }
    await expect(page.locator('[data-action="drawGender"]:enabled')).toHaveCount(0);
    await expect(page.locator('.draw-btn')).toHaveText('本轮已抽取一套');
  });
}

for (const width of [1440, 390]) {
  test(`the four far-left star fragments accept clicks at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(() => { Math.random = () => 0; });
    for (const y of [0.17, 0.394, 0.621, 0.847]) {
      await page.goto('/#experience');
      const board = page.locator('.decode-board');
      await board.locator('img').evaluate((image) => image.decode());
      const box = await board.boundingBox();
      await board.click({ position: { x: box.width * 0.025, y: box.height * y } });
      await expect(page.getByRole('dialog')).toContainText('八角星纹');
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')).unlocked)).toEqual(['star']);
      await page.reload();
    }
  });
}

test('only discoveries unlock themes, removed fill content stays absent and the single hint hugs its image', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.goto('/#experience');
  await expect(page.locator('.journey-progress,.search-fieldnote,.pool-notebook,.round-completion,.decode-help')).toHaveCount(0);
  await expect(page.locator('#decode-feedback')).toHaveText('找到任意一处对应纹样，即可解锁该主题衣橱。');
  const image = await page.locator('.decode-viewport').boundingBox();
  const hint = await page.locator('#decode-feedback').boundingBox();
  expect(hint.y - image.y - image.height).toBeLessThanOrEqual(10);
  await page.locator('[data-action="pool"][data-id="peony"]').click();
  await expect(page.locator('.pool-locked h3')).toHaveText('牡丹花纹卡池尚未解锁');
  await expect(page.locator('.pool-locked>span')).toHaveText('♙');
  await expect(page.locator('.pool-locked>small')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')).unlocked)).toEqual([]);
  await discover(page, 0);
  await expect(page.locator('.motif-tab:not(.locked)')).toHaveCount(1);
  await expect(page.locator('.motif-tab:not(.locked)')).toContainText('八角星纹');
  await page.locator('[data-action="pool"][data-id="peony"]').click();
  await expect(page.locator('.pool-locked h3')).toHaveText('牡丹花纹卡池尚未解锁');
  await expect(page.locator('[data-action="drawGender"]')).toHaveCount(0);
});

for (const width of [1440, 390]) {
  test(`unchosen outfits show original figures and a worn suit advances only on finish at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(() => {
      Math.random = () => 0;
      if (!localStorage.getItem('miao-wardrobe-v4')) localStorage.setItem('miao-wardrobe-v4', JSON.stringify({
        unlocked: ['star'], owned: ['star-girl-1', 'star-boy-1'], gender: 'girl', equipped: { girl: 'star-girl-1', boy: 'star-boy-1' },
      }));
    });
    await page.goto('/#experience');
    const portrait = page.locator('.look-viewer .whole-avatar');
    for (const gender of ['girl', 'boy', 'girl']) {
      await page.locator(`[data-action="gender"][data-id="${gender}"]`).click();
      await expect(portrait).toHaveAttribute('src', new RegExp(`${gender}-base\\.webp$`));
      await expect(page.locator('.outfit-summary strong')).toHaveText('原始形象');
      await expect(page.locator('.wear-full[aria-pressed="true"]')).toHaveCount(0);
      await expect(page.locator('[data-action="save"]')).toBeDisabled();
    }
    await discover(page, 0);
    await page.locator('[data-action="drawGender"][data-id="girl"]').click();
    await page.locator('.draw-btn').click();
    await expect(page.locator('.costume-draw-stage')).toHaveClass(/has-result/);
    await expect(page.locator('.costume-draw-stage')).not.toHaveClass(/is-revealing/);
    await page.locator('[data-action="openDressup"]').click();
    await expect(portrait).toHaveAttribute('src', /girl-base\.webp$/);
    await expect(page.locator('[data-action="finishLoop"]')).toBeDisabled();
    const drawnId = await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')).owned.find((id) => !['star-girl-1', 'star-boy-1'].includes(id)));
    const suit = page.locator(`.owned-card:has([data-id="${drawnId}"]) .wear-full`);
    await suit.click();
    await expect(portrait).toHaveAttribute('src', new RegExp(`${setById(drawnId).portrait.split('/').pop()}$`));
    await expect(page.locator('[data-action="finishLoop"]')).toBeEnabled();
    await expect(page.locator('[data-action="save"]')).toBeEnabled();
    await expect(page.locator('.level-label')).toContainText('第 1 轮');
    await page.locator('[data-action="resetOutfit"]').click();
    await expect(portrait).toHaveAttribute('src', /girl-base\.webp$/);
    await expect(page.locator('[data-action="finishLoop"]')).toBeDisabled();
    // Earlier full outfits remain eligible, including a role different from the draw.
    await page.locator('[data-action="gender"][data-id="boy"]').click();
    await expect(page.locator('[data-action="finishLoop"]')).toBeDisabled();
    await page.locator('.owned-card:has([data-id="star-boy-1"]) .wear-full').click();
    await expect(page.locator('[data-action="finishLoop"]')).toBeEnabled();
    await page.locator('[data-action="gender"][data-id="girl"]').click();
    await expect(page.locator('[data-action="finishLoop"]')).toBeDisabled();
    await page.locator('.owned-card:has([data-id="star-girl-1"]) .wear-full').click();
    await expect(portrait).toHaveAttribute('src', new RegExp(`${setById('star-girl-1').portrait.split('/').pop()}$`));
    await expect(page.locator('[data-action="finishLoop"]')).toBeEnabled();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')));
    await page.locator('[data-action="finishLoop"]').click();
    await expect(page.locator('.level-label')).toContainText('第 2 轮');
    await expect(page.locator('.decode-board')).toBeFocused();
    await expect(portrait).toHaveAttribute('src', /girl-base\.webp$/);
    await expect(page.locator('.outfit-summary strong')).toHaveText('原始形象');
    await expect(page.locator('[data-action="save"]')).toBeDisabled();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')))).toEqual(saved);
    await page.reload();
    await expect(portrait).toHaveAttribute('src', /girl-base\.webp$/);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')))).toEqual(saved);
  });
}
