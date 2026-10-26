import { test, expect } from '@playwright/test';

const primaryName = '轻拂银铃，唤起微风';
const echoName = '轻拂小银铃，唤起微风';

async function installAudioProbe(page, { suspended = false } = {}) {
  // Keep the real UI and audio lifecycle, while avoiding audible output in CI.
  await page.addInitScript(({ suspended }) => {
    const probe = { contexts: [], starts: 0, pending: 0, peakPending: 0, resumeResolvers: [] };
    window.__silverAudioProbe = probe;
    class Parameter {
      value = 0;
      setValueAtTime(value) { this.value = value; return this; }
      linearRampToValueAtTime(value) { this.value = value; return this; }
      exponentialRampToValueAtTime(value) { this.value = value; return this; }
      cancelScheduledValues() { return this; }
    }
    class AudioNode {
      gain = new Parameter();
      frequency = new Parameter();
      detune = new Parameter();
      connect(target) { return target; }
      disconnect() {}
    }
    class Context {
      state = suspended ? 'suspended' : 'running';
      destination = new AudioNode();
      origin = performance.now();
      sources = new Set();
      constructor() { probe.contexts.push(this); }
      get currentTime() { return (performance.now() - this.origin) / 1000; }
      createGain() { return new AudioNode(); }
      createOscillator() {
        const node = new AudioNode();
        let timer;
        let started = false;
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          if (started) probe.pending -= 1;
          this.sources.delete(node);
          node.onended?.();
        };
        node.start = () => {
          started = true;
          probe.starts += 1;
          probe.pending += 1;
          probe.peakPending = Math.max(probe.peakPending, probe.pending);
          this.sources.add(node);
        };
        node.stop = (when = this.currentTime) => {
          clearTimeout(timer);
          const delay = Math.max(0, (when - this.currentTime) * 1000);
          if (delay === 0) finish();
          else timer = setTimeout(finish, delay);
        };
        return node;
      }
      async resume() {
        if (suspended) await new Promise((resolve) => probe.resumeResolvers.push(resolve));
        this.state = 'running';
      }
      async close() {
        this.state = 'closed';
        for (const source of [...this.sources]) source.stop();
      }
    }
    window.AudioContext = Context;
    window.webkitAudioContext = Context;
  }, { suspended });
}

async function audioState(page) {
  return page.evaluate(() => {
    const probe = window.__silverAudioProbe;
    return { starts: probe.starts, pending: probe.pending, peakPending: probe.peakPending, states: probe.contexts.map((context) => context.state) };
  });
}

async function openClockedGallery(page, reducedMotion = 'no-preference', audioOptions) {
  await page.emulateMedia({ reducedMotion });
  await page.clock.install();
  await installAudioProbe(page, audioOptions);
  await page.goto('/#gallery');
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await expect(page.locator('.jing-heading .silver-chimes')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  page.chimeErrors = [];
  page.on('pageerror', (error) => page.chimeErrors.push(error.message));
});

test.afterEach(async ({ page }) => {
  expect(page.chimeErrors).toEqual([]);
});

test('hover and keyboard share a bounded gust, then petals clear without further generation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openClockedGallery(page);
  const chimes = page.locator('.silver-chimes');
  const primary = page.getByRole('button', { name: primaryName, exact: true });
  await expect(chimes).toHaveAttribute('data-wind-sequence', '0');
  await expect(page.locator('.silver-petal')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '听银铃', exact: true })).toHaveAttribute('aria-pressed', 'false');

  await primary.hover();
  await expect(chimes).toHaveAttribute('data-wind-sequence', '1');
  expect(await page.locator('.silver-petal').count()).toBeGreaterThanOrEqual(2);
  expect(await page.locator('.silver-petal').count()).toBeLessThanOrEqual(3);
  await primary.click();
  await primary.press('Enter');
  await primary.press('Space');
  await expect(chimes).toHaveAttribute('data-wind-sequence', '1');

  for (const [index, key] of ['Enter', 'Space', 'Enter'].entries()) {
    await page.clock.runFor(1500);
    await primary.press(key);
    await expect(chimes).toHaveAttribute('data-wind-sequence', String(index + 2));
    expect(await page.locator('.silver-petal').count()).toBeLessThanOrEqual(6);
  }
  expect(await audioState(page)).toMatchObject({ starts: 0, states: [] });
  await page.clock.runFor(7000);
  await expect(page.locator('.silver-petal')).toHaveCount(0);
  await expect(chimes).toHaveAttribute('data-wind-sequence', '4');
});

test('sound starts only after opt-in and stopping or leaving cancels every bell tail', async ({ page }) => {
  await openClockedGallery(page, 'reduce');
  const primary = page.getByRole('button', { name: primaryName, exact: true });
  await primary.focus();
  await primary.press('Enter');
  expect(await audioState(page)).toMatchObject({ starts: 0, states: [] });

  await page.getByRole('button', { name: '听银铃', exact: true }).click();
  await expect(page.getByRole('button', { name: '关闭铃声', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(1800);
  await primary.press('Enter');
  await expect.poll(async () => (await audioState(page)).starts).toBeGreaterThan(0);
  const first = await audioState(page);
  expect(first.pending).toBeGreaterThan(0);
  expect(first.peakPending).toBeLessThanOrEqual(12);
  await primary.press('Enter');
  await primary.press('Space');
  expect((await audioState(page)).starts).toBe(first.starts);
  await page.getByRole('button', { name: '关闭铃声', exact: true }).click();
  await expect(page.getByRole('button', { name: '听银铃', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(async () => (await audioState(page)).pending).toBe(0);

  await page.getByRole('button', { name: '听银铃', exact: true }).click();
  await page.clock.runFor(1800);
  await primary.press('Enter');
  await expect.poll(async () => (await audioState(page)).starts).toBeGreaterThan(first.starts);
  await page.evaluate(() => { location.hash = '#history'; });
  await expect(page.locator('.silver-chimes')).toHaveCount(0);
  await expect.poll(async () => (await audioState(page)).pending).toBe(0);
  await expect.poll(async () => (await audioState(page)).states.every((state) => state === 'closed')).toBe(true);
  const stopped = (await audioState(page)).starts;
  await page.clock.runFor(7000);
  expect((await audioState(page)).starts).toBe(stopped);
  await expect(page.locator('.silver-petal')).toHaveCount(0);
});

test('putting the document in the background silences pending and active notes', async ({ page }) => {
  await openClockedGallery(page, 'reduce');
  await page.getByRole('button', { name: '听银铃', exact: true }).click();
  await page.getByRole('button', { name: primaryName, exact: true }).press('Enter');
  await expect.poll(async () => (await audioState(page)).starts).toBeGreaterThan(0);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(async () => (await audioState(page)).pending).toBe(0);
  const stopped = (await audioState(page)).starts;
  await page.clock.runFor(7000);
  await page.getByRole('button', { name: primaryName, exact: true }).press('Enter');
  expect((await audioState(page)).starts).toBe(stopped);
});

test('an older pending audio activation cannot cancel a later explicit opt-in', async ({ page }) => {
  await openClockedGallery(page, 'reduce', { suspended: true });
  const sound = page.getByRole('button', { name: '听银铃', exact: true });
  await sound.click();
  await expect.poll(() => page.evaluate(() => window.__silverAudioProbe.resumeResolvers.length)).toBe(1);
  await sound.click();
  await sound.click();
  await expect.poll(() => page.evaluate(() => window.__silverAudioProbe.resumeResolvers.length)).toBe(2);

  await page.evaluate(() => window.__silverAudioProbe.resumeResolvers.shift()());
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.silver-sound-notice')).toBeEmpty();
  await page.evaluate(() => window.__silverAudioProbe.resumeResolvers.shift()());
  await expect(page.getByRole('button', { name: '关闭铃声', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: primaryName, exact: true }).press('Enter');
  await expect.poll(async () => (await audioState(page)).starts).toBeGreaterThan(0);
});

test('reduced motion retains keyboard activation without petals or perpetual sway', async ({ page }) => {
  await openClockedGallery(page, 'reduce');
  const primary = page.getByRole('button', { name: primaryName, exact: true });
  await primary.focus();
  await expect(primary).toBeFocused();
  await primary.press('Space');
  await expect(page.locator('.silver-chimes')).toHaveAttribute('data-wind-sequence', '1');
  await expect(page.locator('.silver-petal')).toHaveCount(0);
  await page.clock.runFor(7000);
  expect(await page.locator('.silver-chimes').evaluate((element) => element.getAnimations({ subtree: true })
    .some((animation) => animation.playState === 'running' && animation.effect.getTiming().iterations === Infinity))).toBe(false);
  expect(await audioState(page)).toMatchObject({ starts: 0, states: [] });
});

test('chimes stay clear of the title, work and controls at each layout and scroll with the heading', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#gallery');
  const primary = page.getByRole('button', { name: primaryName, exact: true });
  const echo = page.getByRole('button', { name: echoName, exact: true, includeHidden: true });
  for (const width of [320, 390, 760, 761, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(primary).toBeVisible();
    if (width <= 760) await expect(echo).toBeHidden();
    else await expect(echo).toBeVisible();
    const layout = await page.locator('.silver-chimes').evaluate((element) => {
      const rect = (node) => {
        const { left, right, top, bottom, width, height } = node.getBoundingClientRect();
        return { left, right, top, bottom, width, height };
      };
      const chimes = [...element.querySelectorAll('.silver-chime')].filter((node) => node.getClientRects().length).map(rect);
      const protectedBoxes = [...document.querySelectorAll('.jing-heading h1, .jing-title-caption, .jing-scroll-prompt, .jing-work')]
        .concat([...element.querySelectorAll('button:not(.silver-chime)')]).map(rect);
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        outside: chimes.some((box) => box.left < 0 || box.right > innerWidth),
        overlaps: chimes.some((a) => protectedBoxes.some((b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
          && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1)),
      };
    });
    expect(layout, `clear heading and controls at ${width}px`).toEqual({ overflow: false, outside: false, overlaps: false });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const before = await primary.boundingBox();
  const offset = await page.evaluate(() => {
    window.scrollTo({ top: 240, behavior: 'instant' });
    return scrollY;
  });
  const after = await primary.boundingBox();
  expect(Math.abs(before.y - after.y - offset)).toBeLessThanOrEqual(1);
  await expect(page.locator('.jing-work')).toHaveCount(18);
});

test.describe('touch chime', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test('one small mobile chime accepts a tap without duplicated pointer and click gusts', async ({ page }) => {
    await openClockedGallery(page);
    await expect(page.getByRole('button', { name: echoName, exact: true })).toHaveCount(0);
    const primary = page.getByRole('button', { name: primaryName, exact: true });
    await primary.tap();
    await expect(page.locator('.silver-chimes')).toHaveAttribute('data-wind-sequence', '1');
    expect(await page.locator('.silver-petal').count()).toBeGreaterThanOrEqual(2);
    expect(await page.locator('.silver-petal').count()).toBeLessThanOrEqual(3);
    await primary.tap();
    await expect(page.locator('.silver-chimes')).toHaveAttribute('data-wind-sequence', '1');
    expect(await audioState(page)).toMatchObject({ starts: 0, states: [] });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
