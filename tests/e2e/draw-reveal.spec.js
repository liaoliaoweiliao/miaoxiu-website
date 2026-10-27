import { test, expect } from '@playwright/test';
import { costumeSets } from '../../src/data/catalog.js';

async function sampleReveal(stage, time) {
  await stage.evaluate((element, time) => {
    for (const animation of element.getAnimations({ subtree: true })) {
      animation.pause();
      animation.currentTime = time;
    }
  }, time);
}

async function openWardrobe(page, owned = costumeSets.filter((costume) => costume.theme === 'star').map((costume) => costume.id), gender = 'girl') {
  // A full collection covers an already-owned result; an empty one covers the first collection.
  await page.addInitScript((owned) => {
    Math.random = () => 0;
    localStorage.setItem('miao-wardrobe-v4', JSON.stringify({
      unlocked: ['star'], owned, gender: 'girl', equipped: { girl: null, boy: null },
    }));
  }, owned);
  await page.goto('/#experience');
  const board = page.locator('.decode-board');
  await board.locator('img').evaluate((image) => image.decode());
  const box = await board.boundingBox();
  await board.click({ position: { x: box.width * 0.2535, y: box.height * 0.0925 } });
  await page.getByRole('button', { name: '进入对应苗绣衣橱 →', exact: true }).click();
  await page.locator(`[data-action="drawGender"][data-id="${gender}"]`).click();
  await expect(page.locator('.wardrobe-draw')).toBeFocused();
}

async function wardrobePosition(page) {
  return page.evaluate(() => ({
    scrollY,
    boxes: ['.wardrobe', '.costume-draw-stage', '.draw-btn', '.draw-note'].map((selector) => {
      const { y, height } = document.querySelector(selector).getBoundingClientRect();
      return { y, height };
    }),
  }));
}

function expectSamePosition(actual, expected) {
  expect(Math.abs(actual.scrollY - expected.scrollY)).toBeLessThanOrEqual(1);
  actual.boxes.forEach((box, index) => {
    expect(Math.abs(box.y - expected.boxes[index].y)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.height - expected.boxes[index].height)).toBeLessThanOrEqual(1);
  });
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 320, height: 700 }]) {
 for (const gender of ['girl', 'boy']) {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    test(`wardrobe stays in place through its single ${gender} draw at ${viewport.width}px (${reducedMotion})`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion });
      if (reducedMotion === 'no-preference') await page.clock.install();
      await openWardrobe(page, [], gender);
      if (reducedMotion === 'no-preference') await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
      const stage = page.locator('.costume-draw-stage');

        await page.locator('.draw-btn').scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        const before = await wardrobePosition(page);
        await page.locator('.draw-btn').click();
        await page.mouse.move(0, 0);
        if (reducedMotion === 'no-preference') {
          await page.clock.runFor(300);
          expectSamePosition(await wardrobePosition(page), before);
          await expect(stage).toHaveClass(/is-drawing/);
          await expect(stage.getByRole('img', { name: '服装套装正在横向循环轮播' })).toBeVisible();
          await expect(stage.locator('.carousel-track')).toHaveCSS('animation-duration', '0.65s');
          await page.clock.runFor(1499);
          await expect(stage).toHaveClass(/is-drawing/);
          await page.clock.runFor(1);
          await expect(stage).toHaveClass(/is-revealing/);
          expectSamePosition(await wardrobePosition(page), before);
          await page.clock.runFor(1500);
        }
        await expect(stage).toHaveClass(/has-result/);
        await expect(stage).not.toHaveClass(/is-revealing/);
        await expect(page.locator('.draw-btn')).toBeDisabled();
        expectSamePosition(await wardrobePosition(page), before);
        await expect(stage.locator('.reveal-front')).toBeVisible();
    });
  }

  test(`${gender} outfit and name stay mounted after the golden reveal at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.clock.install();
    await openWardrobe(page, undefined, gender);
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    const stage = page.locator('.costume-draw-stage');

      await page.locator('.draw-btn').click();
      await page.clock.runFor(1800);
      await expect(stage).toHaveClass(/is-revealing/);
      const name = await stage.locator('.prize-name').elementHandle();
      const image = await stage.locator('.reveal-front>img').elementHandle();
      await image.evaluate((element) => element.decode());

      // The name enters once after the flip, then remains fully visible.
      await sampleReveal(stage, 200);
      await expect(stage.locator('.prize-name')).toHaveCSS('opacity', '0');
      await expect(stage.locator('.reveal-front>img')).toHaveCSS('opacity', '0');
      await sampleReveal(stage, 800);
      const enteringOpacity = await name.evaluate((element) => Number(getComputedStyle(element).opacity));
      expect(enteringOpacity).toBeGreaterThan(0);
      expect(enteringOpacity).toBeLessThan(1);
      expect(await stage.locator('.prize-sparks i').evaluateAll((stars) => stars.some((star) => Number(getComputedStyle(star).opacity) > 0))).toBe(true);
      // Finish the visual entrance while keeping the reducer's reveal timer paused.
      await sampleReveal(stage, 1400);
      await expect(stage.locator('.prize-name')).toHaveCSS('opacity', '1');
      const before = await stage.boundingBox();
      const nameBefore = await name.boundingBox();
      const card = await stage.locator('.draw-card').boundingBox();
      const picture = await image.boundingBox();
      expect(picture.height).toBeGreaterThanOrEqual(250);
      expect(nameBefore.y).toBeGreaterThanOrEqual(picture.y + picture.height);
      expect(nameBefore.y + nameBefore.height).toBeLessThan(card.y + card.height);

      await page.clock.runFor(1500);
      await expect(stage).not.toHaveClass(/is-revealing/);
      expect(await name.evaluate((element) => element.isConnected)).toBe(true);
      expect(await image.evaluate((element) => element.isConnected)).toBe(true);
      expect(await name.boundingBox()).toEqual(nameBefore);
      expect(await stage.boundingBox()).toEqual(before);
      await expect(stage.locator('.prize-name')).toHaveCSS('opacity', '1');
      await expect(page.locator('.draw-btn')).toBeDisabled();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
 }
}

test('reduced motion shows a stable outfit name immediately without reveal flashes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openWardrobe(page);
  await page.locator('.draw-btn').click();
  await expect(page.locator('.costume-draw-stage')).toHaveClass(/has-result/);
  await expect(page.locator('.costume-draw-stage')).not.toHaveClass(/is-revealing/);
  await expect(page.locator('.draw-btn')).toBeDisabled();
  await expect(page.locator('.prize-name')).toHaveText('星华 · 流光');
  await expect(page.locator('.prize-name')).toHaveCSS('opacity', '1');
  for (const selector of ['.prize-sparks', '.reveal-glow', '.reveal-sheen']) {
    await expect(page.locator(selector)).toBeHidden();
  }
});
