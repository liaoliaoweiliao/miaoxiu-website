import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.historyErrors = [];
  page.on('pageerror', (error) => page.historyErrors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) page.historyErrors.push(`${response.status()} ${response.url()}`); });
});
test.afterEach(async ({ page }) => { expect(page.historyErrors).toEqual([]); });

test('three archive storybooks open, close and restore keyboard focus', async ({ page }) => {
  await page.goto('/#history');
  for (const [index, book] of ['stitch', 'lanjuan', 'butterfly'].entries()) {
    const trigger = page.locator('.story-more').nth(index);
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('.story-animation-shell')).toHaveAttribute('data-phase', 'cover');
    const spread = page.locator('.story-book-open img');
    await expect(spread).toHaveAttribute('src', new RegExp(`${book}-book.webp$`));
    await spread.evaluate((image) => image.decode());
    await expect(page.locator('.story-animation-shell')).toHaveAttribute('data-phase', 'open');
    const close = page.getByRole('button', { name: '合上故事', exact: true });
    await expect(close).toBeFocused();
    await expect(page.getByRole('button', { name: '阅读文字', exact: true })).toHaveCount(0);
    await expect(page.locator('.story-reader')).toHaveCount(0);
    await page.keyboard.press('Shift+Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    // Finish opening before checking the separate closing animation.
    await page.locator('.story-book-open').evaluate(async (element) => {
      await Promise.all(element.getAnimations().map((animation) => animation.finished));
    });
    await close.click();
    await expect(page.locator('.story-animation-shell')).toHaveAttribute('data-phase', 'closing');
    await expect(page.getByRole('dialog')).toBeVisible();
    // Sample the fold, supplied transparent cover, book fade and final overlay fade.
    const fold = await page.locator('.story-book-leaf').evaluate((leaf) => {
      const overlay = leaf.closest('.story-animation-overlay');
      const spread = overlay.querySelector('.story-book-spread');
      const animations = overlay.getAnimations({ subtree: true }).filter((animation) => animation.animationName?.startsWith('storyBook'));
      animations.forEach((animation) => animation.pause());
      const seek = (time) => animations.forEach((animation) => { animation.currentTime = Math.min(time, animation.effect.getTiming().duration); });
      seek(400);
      const matrix = new DOMMatrix(getComputedStyle(leaf).transform);
      const rightPage = overlay.querySelector('.story-book-right');
      const result = { yRotation: matrix.m13, origin: getComputedStyle(leaf).transformOrigin, width: leaf.offsetWidth, exposedPage: Number(getComputedStyle(rightPage).opacity) };
      // The stationary page must already be gone when the cover faces the reader,
      // including the nearly-closed frame where it used to protrude at the left edge.
      seek(700);
      result.nearlyClosedPage = Number(getComputedStyle(rightPage).opacity);
      seek(1000);
      const cover = getComputedStyle(leaf.querySelector('.story-book-leaf-back'));
      result.cover = { image: cover.backgroundImage, color: cover.backgroundColor, size: cover.backgroundSize };
      result.closed = { book: Number(getComputedStyle(spread).opacity), rightPage: Number(getComputedStyle(overlay.querySelector('.story-book-right')).opacity) };
      seek(1400);
      result.fading = { book: Number(getComputedStyle(spread).opacity), overlay: Number(getComputedStyle(overlay).opacity) };
      seek(1650);
      result.dismiss = { book: Number(getComputedStyle(spread).opacity), overlay: Number(getComputedStyle(overlay).opacity) };
      seek(400);
      animations.forEach((animation) => animation.play());
      return result;
    });
    expect(fold.yRotation).toBeLessThan(0);
    expect(parseFloat(fold.origin)).toBeCloseTo(fold.width, 0);
    expect(fold.exposedPage).toBe(0);
    expect(fold.nearlyClosedPage).toBe(0);
    expect(fold.cover.image).toMatch(/closed-book-user\.png/);
    expect(fold.cover.color).toBe('rgba(0, 0, 0, 0)');
    expect(fold.cover.size).toBe('contain');
    expect(fold.closed).toEqual({ book: 1, rightPage: 0 });
    expect(fold.fading.book).toBeGreaterThan(0);
    expect(fold.fading.book).toBeLessThan(1);
    expect(fold.fading.overlay).toBe(1);
    expect(fold.dismiss.book).toBe(0);
    expect(fold.dismiss.overlay).toBeGreaterThan(0);
    expect(fold.dismiss.overlay).toBeLessThan(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('.story-animation-shell')).toHaveAttribute('data-phase', 'closing');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
});

test('Escape and backdrop close through the fold, and closing during opening cancels its timer', async ({ page }) => {
  await page.goto('/#history');
  for (const method of ['escape', 'backdrop']) {
    await page.locator('.story-image').first().click();
    await expect(page.locator('.story-animation-shell')).toHaveAttribute('data-phase', 'open');
    if (method === 'escape') await page.keyboard.press('Escape');
    else await page.locator('.story-animation-overlay').click({ position: { x: 2, y: 2 } });
    await expect(page.locator('.story-animation-shell')).toHaveAttribute('data-phase', 'closing');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('.story-image').first()).toBeFocused();
  }
  await page.locator('.story-more').first().click();
  await expect(page.locator('.story-animation-shell')).toHaveAttribute('data-phase', 'cover');
  await page.getByRole('button', { name: '合上故事', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.waitForTimeout(1100);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.story-more').first()).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('dragon motif uses the supplied photo in both the display and magnifier', async ({ page }) => {
  await page.goto('/#history');
  await page.getByRole('button', { name: '查看龙纹', exact: true }).click();
  const photo = page.locator('.motif-base-image');
  await expect(photo).toHaveAttribute('src', /motif-dragon-user\.png$/);
  await photo.evaluate((image) => image.decode());
  expect(await photo.evaluate((image) => [image.naturalWidth, image.naturalHeight])).toEqual([1655, 950]);
  await page.locator('[data-magnifier]').hover();
  await expect(page.locator('.motif-magnifier')).toHaveClass(/is-visible/);
  await expect(page.locator('.motif-zoom-image')).toHaveAttribute('src', await photo.getAttribute('src'));
  await expect(page.locator('.motif-art-copy h3')).toHaveText('龙纹');
});

test('archive color masks follow selected order, enforce three colors and reset all motifs', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#history');
  await expect(page.locator('.color-example-row,.meaning-bottom-art,.color-challenge')).toHaveCount(0);
  await expect(page.locator('.color-lab-panel')).toHaveCount(3);
  await expect(page.locator('.color-motif-tab')).toHaveCount(3);
  const swatches = page.locator('.color-swatch');
  await swatches.nth(5).click();
  await expect(page.locator('.color-motif-paint')).toHaveCount(3);
  expect(await page.locator('.color-motif-paint').evaluateAll((layers) => layers.map((layer) => layer.dataset.color))).toEqual(['5', '5', '5']);
  await swatches.nth(3).click();
  expect(await page.locator('.color-motif-paint').evaluateAll((layers) => layers.map((layer) => layer.dataset.color))).toEqual(['5', '3', '5']);
  await swatches.nth(4).click();
  await expect(swatches.nth(0)).toBeDisabled();
  expect(await page.locator('.color-motif-paint').evaluateAll((layers) => layers.map((layer) => layer.dataset.color))).toEqual(['5', '3', '4']);
  await expect(page.locator('.meaning-main-image')).toHaveAttribute('src', /05-ivory-thread-closeup.png$/);
  for (const [index, motif] of ['butterfly', 'flower', 'bird'].entries()) {
    await page.locator('.color-motif-tab').nth(index).click();
    await expect(page.locator('.color-motif-line')).toHaveAttribute('src', new RegExp(`${motif}-line.webp$`));
    const masks = await page.locator('.color-motif-paint').evaluateAll((layers) => layers.map((layer) => getComputedStyle(layer).maskImage.match(/url\("(.*)"\)/)[1]));
    for (const url of masks) {
      const response = await page.request.get(url);
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toMatch(/^image\/png/);
    }
    expect(masks.every((url) => url.includes(`${motif}-paint-`))).toBe(true);
  }
  await swatches.nth(3).click();
  await expect(swatches.nth(0)).toBeEnabled();
  await page.getByRole('button', { name: '清空选择', exact: true }).click();
  await expect(page.locator('.color-motif-paint')).toHaveCount(0);
  await expect(page.locator('.palette-readout > b')).toHaveCount(0);
  await expect(page.locator('.palette-empty')).toHaveText('先选一种颜色上色，可继续添加到三种颜色');
});

test('circular swatches use complete thread textures without baked-in gaps', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#history');
  const previews = page.locator('.color-swatch span img');
  // A complete circular frame cannot repair transparency or a dark crescent
  // already baked into the old thumbnail. Check the texture itself as well.
  const textures = await previews.evaluateAll(async (images) => Promise.all(images.map(async (image) => {
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 40;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, 40, 40);
    const pixels = context.getImageData(0, 0, 40, 40).data;
    const top = [...context.getImageData(20, 3, 1, 1).data];
    return { opaque: pixels.every((value, index) => index % 4 !== 3 || value === 255), top };
  })));
  expect(textures).toHaveLength(6);
  expect(textures.every((texture) => texture.opaque)).toBe(true);
  // The ivory thread must extend into the upper part of the disc, where the
  // previous source contained an off-centre navy crescent.
  expect(Math.min(...textures[4].top.slice(0, 3))).toBeGreaterThan(140);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('button', { name: '清空选择', exact: true }).click();
    for (const name of ['米白', '靛蓝', '翠绿']) {
      await page.getByRole('button', { name: `选择${name}`, exact: true }).click();
    }
    await expect(page.locator('.color-swatch.is-active')).toHaveCount(3);
    await expect(page.getByRole('button', { name: '选择米白', exact: true })).toContainText('第 1 色');
    await expect(page.getByRole('button', { name: '选择靛蓝', exact: true })).toContainText('第 2 色');
    const frames = await previews.evaluateAll((images) => images.map((image) => {
      const box = image.getBoundingClientRect();
      const style = getComputedStyle(image);
      return { width: box.width, height: box.height, fit: style.objectFit, radius: style.borderRadius };
    }));
    expect(frames.every((frame) => frame.width === frame.height && frame.fit === 'cover' && frame.radius === '50%')).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('six color meanings provide detailed descriptions while the empty palette keeps its hint', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#history');
  await expect(page.getByText('未上色线稿', { exact: true })).toHaveCount(0);
  await expect(page.locator('.palette-empty')).toBeVisible();
  await expect(page.locator('.color-motif-art > span')).toHaveText('生命、自由与繁衍的象征');
  const descriptions = new Set();
  for (const name of ['藏青', '朱砂红', '暖金', '靛蓝', '米白', '翠绿']) {
    const choice = page.getByRole('button', { name: `选择${name}`, exact: true });
    await choice.click();
    await expect(page.locator('.meaning-copy strong')).toHaveText(name);
    const description = await page.locator('.meaning-copy p').textContent();
    expect(description.length).toBeGreaterThan(80);
    descriptions.add(description);
    await choice.click();
  }
  expect(descriptions.size).toBe(6);
  await expect(page.locator('.palette-empty')).toBeVisible();
});

test('stitch descriptions appear beside each name at matching size on hover and keyboard focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#history');
  const buttons = page.locator('.stitch-item');
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.mouse.move(0, 0);
    for (const button of await buttons.all()) await expect(button.locator('.stitch-desc')).toBeHidden();
    for (const button of await buttons.all()) {
      await button.hover();
      await expect(button.locator('.stitch-desc')).toBeVisible();
      const layout = await button.evaluate((element) => {
        const name = element.querySelector('strong'), description = element.querySelector('.stitch-desc');
        const a = name.getBoundingClientRect(), b = description.getBoundingClientRect();
        return { nameSize: getComputedStyle(name).fontSize, descriptionSize: getComputedStyle(description).fontSize, nameRight: a.right, descriptionLeft: b.left, nameTop: a.top, descriptionTop: b.top, fits: b.right <= element.getBoundingClientRect().right };
      });
      expect(layout.nameSize).toBe(layout.descriptionSize);
      expect(layout.descriptionLeft).toBeGreaterThan(layout.nameRight);
      expect(layout.descriptionTop).toBeCloseTo(layout.nameTop, 0);
      expect(layout.fits).toBe(true);
    }
    await page.mouse.move(0, 0);
    for (const button of await buttons.all()) await expect(button.locator('.stitch-desc')).toBeHidden();
  }
  await buttons.first().focus();
  await page.keyboard.press('Tab');
  await expect(buttons.nth(1).locator('.stitch-desc')).toBeVisible();
  await expect(page.locator('.stitch-stage')).toHaveClass(/is-idle/);
});

test('six stitch techniques draw distinct paths with a moving needle and show their finished image', async ({ page }) => {
  await page.goto('/#history');
  const patterns = new Set();
  for (let index = 0; index < 6; index += 1) {
    await page.locator('.stitch-item').nth(index).click();
    await expect(page.locator('.stitch-stage')).toHaveClass(/is-playing/);
    const motion = page.locator('.stitch-crafted-svg animateMotion');
    patterns.add(await motion.getAttribute('path'));
    const position = () => page.locator('.stitch-moving-needle').evaluate((needle) => { const matrix = needle.getCTM(); return [matrix.e, matrix.f].map((value) => value.toFixed(2)).join(','); });
    const start = await position();
    await expect.poll(position).not.toBe(start);
  }
  expect(patterns.size).toBe(6);
  await expect(page.locator('.stitch-stage')).toHaveClass(/is-complete/, { timeout: 7000 });
  await expect(page.locator('.stitch-finish-image')).toHaveAttribute('src', /02-dazixiu.webp$/);
  await expect(page.locator('.stitch-finish-image')).toBeVisible();
});

test('mobile history keeps the book and all four sections within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#history');
  await expect(page.locator('.history-heading')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.locator('.story-image').nth(1).click();
  const book = page.locator('.story-book-open img');
  await book.evaluate((image) => image.decode());
  const rect = await book.boundingBox();
  expect(rect.x).toBeGreaterThanOrEqual(0);
  expect(rect.x + rect.width).toBeLessThanOrEqual(390);
  await expect(page.getByRole('button', { name: '阅读文字', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '合上故事', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.story-image').nth(1)).toBeFocused();
  await page.locator('.stitch-item').nth(4).click();
  await expect(page.locator('.stitch-stage')).toHaveClass(/is-complete/);
  await page.locator('.color-swatch').nth(3).click();
  await expect(page.locator('.meaning-copy strong')).toHaveText('靛蓝');
});
