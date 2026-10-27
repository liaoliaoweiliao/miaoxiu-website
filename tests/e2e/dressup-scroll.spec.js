import { test, expect } from '@playwright/test';
import { costumeSets } from '../../src/data/catalog.js';

test.use({ reducedMotion: 'reduce' });

async function prepareDressup(page) {
  await page.addInitScript((owned) => {
    Math.random = () => 0;
    localStorage.setItem('miao-wardrobe-v4', JSON.stringify({
      unlocked: ['star', 'peony', 'swirl'], owned, gender: 'girl', equipped: { girl: null, boy: null },
    }));
  }, costumeSets.map(({ id }) => id));
  await page.goto('/#experience');
  const board = page.locator('.decode-board');
  await board.locator('img').evaluate((image) => image.decode());
  const box = await board.boundingBox();
  await board.click({ position: { x: box.width * .025, y: box.height * .17 } });
  await page.getByRole('button', { name: '进入对应苗绣衣橱 →', exact: true }).click();
  await page.locator('[data-action="drawGender"][data-id="girl"]').click();
  await page.locator('.draw-btn').click();
  await expect(page.locator('[data-action="openDressup"]')).toBeEnabled();
  await page.locator('[data-action="openDressup"]').click();
  await page.locator('.wear-full').first().click();
  await page.locator('.avatar-panel').evaluate((panel) => {
    panel.scrollTop = 0;
    panel.scrollIntoView({ block: 'start' });
  });
}

for (const viewport of [{ width: 1366, height: 768 }, { width: 1024, height: 600 }]) {
  test(`reaching the collection bottom reveals the portrait controls at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await prepareDressup(page);
    const panel = page.locator('.avatar-panel');
    const collection = page.locator('.collection-panel');
    const needsScroll = await panel.evaluate((element) => element.scrollHeight > element.clientHeight + 1);
    expect(await panel.evaluate((element) => element.scrollTop)).toBe(0);
    const bounds = await collection.boundingBox();
    await page.mouse.move(bounds.x + bounds.width / 2, viewport.height / 2);
    for (let step = 0; step < 20; step += 1) {
      const box = await collection.boundingBox();
      if (box.y + box.height <= viewport.height) break;
      const previousY = await page.evaluate(() => window.scrollY);
      await page.mouse.wheel(0, viewport.height / 2);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(previousY);
    }
    const end = await collection.boundingBox();
    expect(end.y + end.height).toBeLessThanOrEqual(viewport.height);
    if (needsScroll) await expect.poll(() => panel.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    else expect(await panel.evaluate((element) => element.scrollTop)).toBe(0);
    const finish = page.locator('[data-action="finishLoop"]');
    const box = await finish.boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(75);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    // Reaching the right end must not lock later manual scrolling in the left pane.
    if (needsScroll) {
      const before = await panel.evaluate((element) => element.scrollTop);
      const panelBox = await panel.boundingBox();
      await page.mouse.move(panelBox.x + panelBox.width / 2, Math.max(100, panelBox.y + 30));
      await page.mouse.wheel(0, -120);
      await expect.poll(() => panel.evaluate((element) => element.scrollTop)).toBeLessThan(before);
    }
    await finish.click();
    await expect(page.locator('.level-label')).toContainText('第 2 轮');
  });

  test(`scrolling over the portrait reaches finish without traversing the collection at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await prepareDressup(page);
    const panel = page.locator('.avatar-panel');
    const needsScroll = await panel.evaluate((element) => element.scrollHeight > element.clientHeight + 1);
    const portrait = await page.locator('.viewer-viewport').boundingBox();
    const collection = await page.locator('.collection-panel').boundingBox();
    expect(collection.y + collection.height).toBeGreaterThan(viewport.height * 2);
    const scrollY = await page.evaluate(() => window.scrollY);
    await page.mouse.move(portrait.x + portrait.width / 2, portrait.y + 80);
    await page.mouse.wheel(0, 1400);
    if (needsScroll) {
      await expect.poll(() => panel.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
      expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    } else {
      expect(await panel.evaluate((element) => element.scrollTop)).toBe(0);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollY);
    }
    await expect(page.locator('.viewer-scale')).toHaveText('100%');
    const finish = page.locator('[data-action="finishLoop"]');
    const box = await finish.boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    await finish.click();
    await expect(page.locator('.level-label')).toContainText('第 2 轮');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')).owned.length)).toBe(36);
  });
}

for (const viewport of [{ width: 390, height: 844 }, { width: 800, height: 600 }]) {
  test(`the portrait passes ordinary wheel scrolling to the page in a single column at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await prepareDressup(page);
    await expect(page.locator('.avatar-panel')).toHaveCSS('overflow-y', 'visible');
    const box = await page.locator('.viewer-viewport').boundingBox();
    const scrollY = await page.evaluate(() => window.scrollY);
    await page.mouse.move(box.x + box.width / 2, box.y + 80);
    await page.mouse.wheel(0, 300);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollY);
    await expect(page.locator('.viewer-scale')).toHaveText('100%');
    expect(await page.locator('.avatar-panel').evaluate((element) => element.scrollTop)).toBe(0);
    await page.locator('[data-action="finishLoop"]').click();
    await expect(page.locator('.level-label')).toContainText('第 2 轮');
  });
}

test('fullscreen retains wheel zoom, browser zoom shortcuts and escape focus restoration', async ({ page }) => {
  await page.goto('/#experience');
  const expand = page.getByRole('button', { name: '全屏观赏', exact: true });
  await expand.click();
  const viewer = page.getByRole('dialog', { name: '人物服饰观看器' });
  const viewport = viewer.locator('.viewer-viewport');
  const box = await viewport.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -100);
  await expect(viewer.locator('.viewer-scale')).not.toHaveText('100%');
  expect(await viewport.evaluate((element) => {
    const event = new WheelEvent('wheel', { ctrlKey: true, deltaY: -100, bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    return event.defaultPrevented;
  })).toBe(false);
  await page.keyboard.press('Escape');
  await expect(viewer).toHaveCount(0);
  await expect(expand).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});
