import { test, expect } from '@playwright/test';
import { CULTURE, levels } from '../../src/features/experience/gameModel.js';

test.use({ reducedMotion: 'reduce' });

const viewports = [{width:1784,height:1000}, {width:1366,height:768}, {width:820,height:600}, {width:390,height:844}, {width:320,height:700}];
for (const [index, viewport] of viewports.entries()) {
  test(`wardrobe reference preserves the complete photo and unlock gate at ${viewport.width}px`, async ({ page }) => {
    const photo = levels[index % levels.length];
    await page.setViewportSize(viewport);
    await page.addInitScript(sample => { Math.random = () => sample; }, (index % 3 + .1) / 3);
    await page.goto('/#experience');
    for (const theme of levels) {
      await page.locator(`[data-action="pool"][data-id="${theme.id}"]`).click();
      await expect(page.locator('.pool-locked h3')).toHaveText(`${theme.name}卡池尚未解锁`);
      await expect(page.locator('.wardrobe-knowledge p')).toHaveText(CULTURE[theme.id].text);
      await expect(page.locator('[data-action="drawGender"]')).toHaveCount(0);
      await expect(page.locator('.motif-tab.selected')).toHaveAttribute('data-id', theme.id);
      const image = page.locator('.wardrobe-puzzle-photo > img');
      await image.evaluate(image => image.decode());
      await expect(image).toHaveAttribute('alt', `本轮寻纹图片：${photo.title}`);
      const ratio = await image.evaluate(image => Math.abs(image.clientWidth / image.clientHeight - image.naturalWidth / image.naturalHeight));
      expect(ratio).toBeLessThan(.02);
      const picture = await page.locator('.wardrobe-puzzle-photo').boundingBox();
      const panel = await page.locator('.pool-locked').boundingBox();
      if (viewport.width > 1050 || viewport.width > 600 && viewport.width <= 900) expect(panel.x).toBeGreaterThan(picture.x + picture.width);
      else expect(panel.y).toBeGreaterThan(picture.y + picture.height);
      expect(await page.locator('.pool-locked').evaluate(node => node.scrollWidth <= node.clientWidth + 1 && node.scrollHeight <= node.clientHeight + 1)).toBe(true);
      const tabs = await page.locator('.motif-tab').evaluateAll(nodes => nodes.map(node => { const r = node.getBoundingClientRect(); return { y: r.y, width: r.width }; }));
      expect(Math.max(...tabs.map(tab => tab.y)) - Math.min(...tabs.map(tab => tab.y))).toBeLessThan(1);
      expect(Math.max(...tabs.map(tab => tab.width)) - Math.min(...tabs.map(tab => tab.width))).toBeLessThan(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.locator('.wardrobe-puzzle-photo').click();
    await expect(page.locator('.image-lightbox')).toBeVisible();
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')).unlocked)).toEqual([]);
    await page.locator('[data-action="backToPuzzle"]').click();
    await expect(page.locator('.decode-board')).toBeFocused();
    await expect(page.locator('.level-label')).toContainText(photo.title);
    const region = photo.regions[0];
    const x = region.shape === 'rect' ? region.x + region.w / 2 : region.cx;
    const y = region.shape === 'rect' ? region.y + region.h / 2 : region.cy;
    const box = await page.locator('.decode-board').boundingBox();
    await page.locator('.decode-board').click({position:{x:box.width*x/100,y:box.height*y/100}});
    await page.getByRole('button',{name:'进入对应苗绣衣橱 →',exact:true}).click();
    await expect(page.locator('.wardrobe-locked-layout')).toHaveCount(0);
    await expect(page.locator('.gender-prompt')).toBeInViewport();
    await expect(page.locator('.motif-tab:not(.locked)')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
