import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce', launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] } });

async function installMedia(page, mode = 'normal') {
  await page.addInitScript((mode) => {
    const fixture = window.localMedia = { requests: [], tracks: [], contexts: [], pending: [], level: 0, moving: false, mode, uniforms: {} };
    const locations = new WeakMap();
    const getLocation = WebGLRenderingContext.prototype.getUniformLocation;
    WebGLRenderingContext.prototype.getUniformLocation = function (program, name) {
      const location = getLocation.call(this, program, name);
      if (location) locations.set(location, name);
      return location;
    };
    for (const method of ['uniform1f', 'uniform4f']) {
      const original = WebGLRenderingContext.prototype[method];
      WebGLRenderingContext.prototype[method] = function (location, ...values) {
        fixture.uniforms[locations.get(location)] = values;
        return original.call(this, location, ...values);
      };
    }
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: mode === 'unsupported' ? undefined : {
      async getUserMedia(constraints) {
        fixture.requests.push(constraints);
        if (fixture.mode === 'denied') throw new DOMException('Denied', 'NotAllowedError');
        if (fixture.mode === 'missing') throw new DOMException('Missing', 'NotFoundError');
        if (fixture.mode === 'delayed') await new Promise((resolve) => fixture.pending.push(resolve));
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 48;
        const context = canvas.getContext('2d');
        let offset = 0;
        function paint() {
          context.fillStyle = '#121212';
          context.fillRect(0, 0, 64, 48);
          if (fixture.moving) offset = (offset + 2) % 12;
          context.fillStyle = '#eeeeee';
          context.fillRect(14 + offset, 10, 22, 25);
          context.fillStyle = '#777777';
          context.fillRect(20 + offset, 15, 8, 12);
        }
        paint();
        const stream = canvas.captureStream(15);
        const timer = setInterval(paint, 80);
        for (const track of stream.getTracks()) {
          const stop = track.stop.bind(track);
          track.stop = () => { clearInterval(timer); stop(); };
          fixture.tracks.push(track);
        }
        return stream;
      },
    } });
    window.AudioContext = class {
      state = 'suspended';
      closed = 0;
      constructor() { fixture.contexts.push(this); }
      async resume() { this.state = 'running'; }
      async close() { this.state = 'closed'; this.closed += 1; }
      createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
      createAnalyser() { return { fftSize: 1024, disconnect() {}, getFloatTimeDomainData(samples) {
        if (fixture.mode === 'analysis-error') throw new Error('Device interrupted');
        samples.fill(fixture.level);
      } }; }
    };
  }, mode);
}

async function open(page) {
  await page.goto('/');
  const section = page.locator('[data-heritage-rebirth]');
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator('[data-rebirth-state]')).toHaveAttribute('data-rebirth-state', 'ready');
  return section;
}

async function expectReleased(page) {
  await expect.poll(() => page.evaluate(() => localMedia.tracks.every((track) => track.readyState === 'ended')
    && localMedia.contexts.every((context) => context.state === 'closed' && context.closed === 1))).toBe(true);
}

test('media is opt-in, independent and released by close, reset and navigation', async ({ page }) => {
  await installMedia(page);
  const section = await open(page);
  expect(await page.evaluate(() => localMedia.requests)).toEqual([]);
  await section.getByRole('button', { name: '开启摄像头', exact: true }).click();
  await expect(section.locator('[data-device="camera"]')).toHaveAttribute('data-status', 'active');
  expect(await page.evaluate(() => localMedia.requests)).toEqual([{ video: { width: { ideal: 160 }, height: { ideal: 120 }, frameRate: { ideal: 12, max: 15 }, facingMode: 'user' }, audio: false }]);
  await section.getByRole('button', { name: '开启麦克风', exact: true }).click();
  await expect(section.locator('[data-device="microphone"]')).toHaveAttribute('data-status', 'active');
  await section.getByRole('button', { name: '关闭摄像头', exact: true }).click();
  await expect(section.locator('[data-device="microphone"]')).toHaveAttribute('data-status', 'active');
  expect(await page.evaluate(() => localMedia.tracks[0].readyState)).toBe('ended');
  await section.getByRole('button', { name: '关闭交互', exact: true }).click();
  await expectReleased(page);
  await section.getByRole('button', { name: '开启麦克风', exact: true }).click();
  await expect(section.locator('[data-device="microphone"]')).toHaveAttribute('data-status', 'active');
  await section.getByRole('button', { name: '重置', exact: true }).click();
  await expectReleased(page);
  await section.getByRole('button', { name: '开启摄像头', exact: true }).click();
  await expect(section.locator('[data-device="camera"]')).toHaveAttribute('data-status', 'active');
  await page.evaluate(() => { location.hash = 'history'; });
  await expect(section).toHaveCount(0);
  await expectReleased(page);
});

for (const mode of ['denied', 'missing', 'unsupported']) {
  test(`${mode} media leaves manual remix and scattering available`, async ({ page }) => {
    await installMedia(page, mode);
    const section = await open(page);
    await section.getByRole('button', { name: '开启摄像头', exact: true }).click();
    await expect(section.locator('[data-device="camera"]')).toHaveAttribute('data-status', 'error');
    await expect(section.locator('[data-device="camera"] [role="status"]')).toContainText('手动互动仍可使用');
    await section.getByRole('button', { name: '随机换纹样' }).click();
    await expect(section.locator('[data-pattern-version]')).toHaveAttribute('data-pattern-version', '1');
    await section.getByRole('button', { name: '散作星尘', exact: true }).click();
    await expect(section.locator('output')).toHaveText('100%');
    await expectReleased(page);
  });
}

test('cancelled and unmounted permission requests release late streams and pending audio contexts', async ({ page }) => {
  await installMedia(page, 'delayed');
  const section = await open(page);
  await section.getByRole('button', { name: '开启麦克风', exact: true }).click();
  await expect(section.getByRole('button', { name: '取消麦克风授权' })).toBeVisible();
  await section.getByRole('button', { name: '取消麦克风授权' }).click();
  await page.evaluate(() => localMedia.pending.shift()());
  await expect.poll(() => page.evaluate(() => localMedia.tracks.length)).toBe(1);
  await expectReleased(page);
  await section.getByRole('button', { name: '开启摄像头', exact: true }).click();
  await expect(section.getByRole('button', { name: '取消摄像头授权' })).toBeVisible();
  await page.evaluate(() => { location.hash = 'gallery'; });
  await expect(section).toHaveCount(0);
  await page.evaluate(() => localMedia.pending.shift()());
  await expect.poll(() => page.evaluate(() => localMedia.tracks.length)).toBe(2);
  await expectReleased(page);
});

test('device loss, analysis errors, hidden pages and WebGL loss release resources', async ({ page }) => {
  await installMedia(page);
  const section = await open(page);
  await section.getByRole('button', { name: '开启摄像头', exact: true }).click();
  await expect(section.locator('[data-device="camera"]')).toHaveAttribute('data-status', 'active');
  await page.evaluate(() => localMedia.tracks[0].dispatchEvent(new Event('ended')));
  await expect(section.locator('[data-device="camera"]')).toHaveAttribute('data-status', 'error');
  await expectReleased(page);
  await page.evaluate(() => { localMedia.mode = 'analysis-error'; });
  await section.getByRole('button', { name: '开启麦克风', exact: true }).click();
  await expect(section.locator('[data-device="microphone"]')).toHaveAttribute('data-status', 'error');
  await expectReleased(page);
  await page.evaluate(() => { localMedia.mode = 'normal'; });
  await section.getByRole('button', { name: '开启麦克风', exact: true }).click();
  await expect(section.locator('[data-device="microphone"]')).toHaveAttribute('data-status', 'active');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expectReleased(page);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  expect(await page.evaluate(() => localMedia.requests.length)).toBe(3);
  await section.getByRole('button', { name: '开启摄像头', exact: true }).click();
  await expect(section.locator('[data-device="camera"]')).toHaveAttribute('data-status', 'active');
  await section.locator('canvas').evaluate((canvas) => canvas.getContext('webgl').getExtension('WEBGL_lose_context').loseContext());
  await expectReleased(page);
  await expect(section.getByRole('button', { name: '开启摄像头', exact: true })).toBeDisabled();
});

test('camera and sound combine in the renderer, sound peaks cool down, pause and reduced motion suppress automation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await installMedia(page);
  const section = await open(page);
  await section.getByRole('button', { name: '开启摄像头', exact: true }).click();
  await expect(section.locator('[data-device="camera"]')).toHaveAttribute('data-status', 'active');
  await section.getByRole('button', { name: '开启麦克风', exact: true }).click();
  await expect(section.locator('[data-device="microphone"]')).toHaveAttribute('data-status', 'active');
  await page.evaluate(() => { localMedia.moving = true; localMedia.level = 0.03; });
  await expect.poll(() => page.evaluate(() => { const input = localMedia.uniforms.uInput; return input?.[2] > 0.05 && input[3] > 0.03; })).toBe(true);
  await page.waitForTimeout(1000);
  await page.evaluate(() => { localMedia.level = 0.5; });
  await expect(section.locator('[data-pattern-version]')).toHaveAttribute('data-pattern-version', '1');
  await page.evaluate(() => { localMedia.level = 0; });
  await page.waitForTimeout(150);
  await page.evaluate(() => { localMedia.level = 0.6; });
  await page.waitForTimeout(200);
  await expect(section.locator('[data-pattern-version]')).toHaveAttribute('data-pattern-version', '1');
  await section.getByRole('button', { name: '关闭摄像头', exact: true }).click();
  await expect.poll(() => page.evaluate(() => { const input = localMedia.uniforms.uInput; return input[2] === 0 && input[3] > 0.1; })).toBe(true);
  await section.getByRole('button', { name: '暂停蝶纹动态' }).click();
  await expect.poll(() => page.evaluate(() => localMedia.uniforms.uInput.every((value) => value === 0))).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await section.getByRole('button', { name: '继续蝶纹动态' }).click();
  await expect(section.locator('.rebirth-motion-note')).toContainText('画面静止');
  await section.getByRole('button', { name: '随机换纹样' }).click();
  await expect(section.locator('[data-pattern-version]')).toHaveAttribute('data-pattern-version', '2');
  await expect.poll(() => page.evaluate(() => localMedia.uniforms.uPatternMix[0])).toBe(1);
  await expect.poll(() => page.evaluate(() => localMedia.uniforms.uInput.every((value) => value === 0))).toBe(true);
  await section.getByRole('button', { name: '关闭交互', exact: true }).click();
  await expectReleased(page);
});

test('manual remixes change the rendered motifs and keyboard controls at narrow widths stay usable', async ({ page }) => {
  await installMedia(page);
  const section = await open(page);
  const canvas = section.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  const before = await canvas.screenshot();
  const remix = section.getByRole('button', { name: '随机换纹样' });
  await remix.focus();
  await remix.press('Enter');
  await expect(section.locator('[data-pattern-version]')).toHaveAttribute('data-pattern-version', '1');
  await canvas.scrollIntoViewIfNeeded();
  expect(before.equals(await canvas.screenshot())).toBe(false);
  for (const width of [320, 390, 580, 850, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    expect(await section.evaluate((element) => [...element.querySelectorAll('button, input')].every((item) => { const bounds = item.getBoundingClientRect(); return bounds.left >= 0 && bounds.right <= innerWidth; }))).toBe(true);
  }
  await section.getByRole('button', { name: '重置', exact: true }).click();
  await expect(section.locator('[data-pattern-version]')).toHaveAttribute('data-pattern-version', '0');
});

test('the butterfly renders real 200k, 400k and million-particle quality levels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const section = await open(page);
  const canvas = section.locator('canvas');
  await expect(canvas).toHaveAttribute('data-particle-count', '200000');
  for (const count of [400000, 1000000, 200000]) {
    await section.getByLabel('纤维精细度').selectOption(String(count));
    await canvas.scrollIntoViewIfNeeded();
    await expect(canvas).toHaveAttribute('data-particle-count', String(count));
  }
});

test.describe('native browser media plumbing with synthetic devices', () => {
  test('real MediaStream and AudioContext start together and close on pagehide', async ({ page }) => {
    await page.addInitScript(() => {
      window.nativeMedia = { streams: [], contexts: [] };
      const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = async (constraints) => {
        const stream = await getUserMedia(constraints);
        nativeMedia.streams.push(stream);
        return stream;
      };
      const AudioContext = window.AudioContext;
      window.AudioContext = class extends AudioContext {
        constructor(...args) { super(...args); nativeMedia.contexts.push(this); }
      };
    });
    const section = await open(page);
    expect(await page.evaluate(() => nativeMedia.streams.length)).toBe(0);
    await section.getByRole('button', { name: '开启摄像头', exact: true }).click();
    await expect(section.locator('[data-device="camera"]')).toHaveAttribute('data-status', 'active');
    await section.getByRole('button', { name: '开启麦克风', exact: true }).click();
    await expect(section.locator('[data-device="microphone"]')).toHaveAttribute('data-status', 'active');
    expect(await page.evaluate(() => nativeMedia.streams.flatMap((stream) => stream.getTracks().map((track) => track.kind)))).toEqual(['video', 'audio']);
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    await expect.poll(() => page.evaluate(() => nativeMedia.streams.every((stream) => stream.getTracks().every((track) => track.readyState === 'ended'))
      && nativeMedia.contexts.every((context) => context.state === 'closed'))).toBe(true);
    await expect(section.getByRole('button', { name: '开启摄像头', exact: true })).toBeVisible();
  });
});
