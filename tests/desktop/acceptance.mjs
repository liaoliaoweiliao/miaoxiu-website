import { chromium, expect } from '@playwright/test';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readdir, mkdir, copyFile, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { levels } from '../../src/features/experience/gameModel.js';

if (process.platform !== 'win32') throw new Error('Packaged desktop acceptance requires Windows with an interactive desktop.');
const exec = promisify(execFile);
const root = process.cwd();
const source = path.resolve(process.env.MIAOXIU_EXE || 'release/Miaoxiu-1.0.0-win-x64-portable.exe');
const output = path.join(root, 'desktop-test-results');
const isolated = path.join(process.env.TEMP, `苗绣 离线验收 ${Date.now()}`);
const copied = path.join(isolated, '中文 与空格', '苗绣 便携版.exe');
const profile = path.join(isolated, '用户 数据');
await mkdir(path.dirname(copied), { recursive: true });
await mkdir(output, { recursive: true });
await copyFile(source, copied);
const records = [];
const errors = [];
let browser, page, child, cdp, port;
function record(name, detail) { records.push({ name, detail }); console.log(`PASS ${name}: ${detail}`); }
async function start() {
  port = await new Promise((resolve) => { const server = net.createServer(); server.listen(0, '127.0.0.1', () => { const value = server.address().port; server.close(() => resolve(value)); }); });
  // Chromium cannot reach the network even during initial startup. No project cwd or developer PATH.
  const env = { ...process.env, PATH: `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`, NODE_OPTIONS: '' };
  delete env.ELECTRON_RUN_AS_NODE;
  child = spawn(copied, [`--remote-debugging-port=${port}`, '--remote-debugging-address=127.0.0.1', `--user-data-dir=${profile}`, '--proxy-server=http://127.0.0.1:9', '--proxy-bypass-list=<-loopback>'], { cwd: path.dirname(copied), env, windowsHide: false, stdio: 'ignore' });
  let last;
  for (let index = 0; index < 120; index++) {
    try { browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { timeout: 1000 }); break; }
    catch (error) { last = error; await delay(500); }
  }
  if (!browser) throw last;
  const context = browser.contexts()[0];
  page = context.pages()[0] || await context.waitForEvent('page');
  await page.waitForURL('miao://app/**');
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('request', (request) => { if (/^https?:/.test(request.url())) errors.push(`Unexpected remote resource: ${request.url()}`); });
  cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await page.reload();
  await expect(page.locator('.hero')).toBeVisible();
}
async function stop() {
  if (page && !page.isClosed()) await page.close();
  if (browser) await browser.close().catch(() => {});
  browser = null;
  for (let index = 0; index < 60 && child.exitCode === null; index++) await delay(200);
  if (child.exitCode === null) throw new Error('Portable app did not exit cleanly');
}
async function images() {
  const broken = await page.locator('img').evaluateAll(async (items) => {
    await Promise.all(items.map(async (image) => { image.loading = 'eager'; try { await image.decode(); } catch {} }));
    return items.filter((image) => !image.naturalWidth).map((image) => image.src);
  });
  expect(broken).toEqual([]);
}
async function screenshot(name) { await page.screenshot({ path: path.join(output, `${name}.png`) }); }
async function nativeSave(destination, cancel = false) {
  await exec('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, 'tests/desktop/native-save.ps1'), ...(cancel ? ['-Cancel'] : ['-Destination', destination])], { timeout: 30000 });
}
async function windowSize(width, height, windowState = 'normal') {
  await exec('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, 'tests/desktop/native-window.ps1'), '-Port', String(port), ...(windowState === 'maximized' ? ['-Maximize'] : ['-Width', String(width), '-Height', String(height)])], { timeout: 15000 });
  await delay(250);
}

try {
  await start();
  record('最终单文件便携版启动', `${copied}; cwd outside project; PATH only Windows; blocked proxy + CDP offline`);
  expect((await readdir(path.dirname(copied)))).toEqual(['苗绣 便携版.exe']);
  const isolation = await page.evaluate(() => ({ node: typeof window.require, process: typeof window.process, bridge: Object.keys(window.miaoxiuDesktop) }));
  expect(isolation).toEqual({ node: 'undefined', process: 'undefined', bridge: ['saveImage'] });
  expect(await page.evaluate(async () => { try { await window.miaoxiuDesktop.saveImage(new Uint8Array(12), 'bad.exe'); return false; } catch { return true; } })).toBe(true);
  record('权限隔离', 'No renderer Node/process; one validated image-saving bridge; invalid data rejected');
  const allAssets = [];
  async function collect(dir, prefix = '') {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const relative = `${prefix}${entry.name}`;
      if (entry.isDirectory()) await collect(path.join(dir, entry.name), `${relative}/`);
      else allAssets.push(relative);
    }
  }
  await collect(path.join(root, 'public/assets'));
  const failures = await page.evaluate(async (files) => {
    const failed = [];
    for (let index = 0; index < files.length; index += 8) await Promise.all(files.slice(index, index + 8).map(async (file) => {
      const url = `miao://app/assets/${file.split('/').map(encodeURIComponent).join('/')}`;
      try {
        const result = await fetch(url);
        if (!result.ok || !(await result.arrayBuffer()).byteLength) failed.push(file);
        if (/\.(png|webp|jpe?g|gif|svg)$/i.test(file)) { const img = new Image(); img.src = url; await img.decode(); }
      } catch { failed.push(file); }
    }));
    return failed;
  }, allAssets);
  expect(failures).toEqual([]);
  record('全部本地资源', `${allAssets.length} bundled assets readable offline; every raster/SVG decodes, including Chinese and spaces`);
  await images();
  const embroidery = page.locator('[data-heritage-rebirth]');
  await embroidery.scrollIntoViewIfNeeded();
  await expect(embroidery.getByRole('button', { name: '绣线长卷', exact: true })).toHaveCount(0);
  await expect(embroidery.locator('[data-rebirth-state]')).toHaveAttribute('data-rebirth-state', /ready|unavailable/);
  if (await embroidery.locator('[data-rebirth-state]').getAttribute('data-rebirth-state') === 'ready') {
    await embroidery.getByRole('button', { name: '散作星尘', exact: true }).click();
    await expect(embroidery.locator('output')).toHaveText('100%');
    await embroidery.getByRole('button', { name: '聚拢成衣', exact: true }).click();
    await expect(embroidery.locator('output')).toHaveText('0%');
  } else {
    await expect(embroidery.getByRole('img', { name: '紫青色花纹交织的数字绣衣静态图' })).toBeVisible();
  }
  await page.getByRole('group', { name: '选择地域支系' }).getByRole('button', { name: /黔东南/ }).click();
  await page.getByLabel('选择苗乡地点').selectOption('taijiang');
  await expect(page.locator('.thread-place-card')).toContainText('施洞型服饰');
  await screenshot('01-home-offline');
  record('首页地图与数字绣境', 'Region filtering, selected place, particle garment or static fallback; long scroll removed');
  await page.goto('miao://app/#history');
  await images();
  for (let index = 0; index < 3; index++) {
    await page.locator('.story-image').nth(index).click();
    await expect(page.locator('.story-animation-shell')).toHaveAttribute('data-phase', 'open');
    await page.locator('.story-book-open img').evaluate((image) => image.decode());
    if (!index) await screenshot('02-storybook-offline');
    await page.getByRole('button', { name: '阅读文字', exact: true }).click();
    await expect(page.locator('.story-reader-count')).toContainText('01 /');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.story-reader-count')).toContainText('02 /');
    await page.keyboard.press('Escape');
  }
  const paths = new Set();
  for (let index = 0; index < 6; index++) {
    await page.locator('.stitch-item').nth(index).click();
    await expect(page.locator('.stitch-stage')).toHaveClass(/is-playing/);
    paths.add(await page.locator('.stitch-crafted-svg animateMotion').getAttribute('path'));
    const position = () => page.locator('.stitch-moving-needle').evaluate((needle) => { const m = needle.getCTM(); return `${m.e.toFixed(2)},${m.f.toFixed(2)}`; });
    const original = await position();
    await expect.poll(position).not.toBe(original);
  }
  expect(paths.size).toBe(6);
  await expect(page.locator('.stitch-stage')).toHaveClass(/is-complete/, { timeout: 8000 });
  for (const index of [5, 3, 4]) await page.locator('.color-swatch').nth(index).click();
  for (let index = 0; index < 3; index++) {
    await page.locator('.color-motif-tab').nth(index).click();
    await expect(page.locator('.color-motif-paint')).toHaveCount(3);
    const masks = await page.locator('.color-motif-paint').evaluateAll((layers) => layers.map((layer) => getComputedStyle(layer).maskImage));
    expect(masks.every((mask) => mask.includes('miao://app/assets/'))).toBe(true);
    await page.locator('.color-motif-line').scrollIntoViewIfNeeded();
    await screenshot(`03-color-mask-${index}`);
  }
  record('故事、六针法及配色', 'All 3 books + text paging; 6 distinct moving needle paths; all 3 motifs with 3 local CSS masks');
  await page.goto('miao://app/#experience');
  const text = await page.locator('.target-brief strong').textContent();
  const level = levels.find((entry) => text.includes(entry.name));
  const region = level.regions[0];
  const target = region.shape === 'rect' ? { x: region.x + region.w / 2, y: region.y + region.h / 2 } : { x: region.cx, y: region.cy };
  await page.locator('.decode-board img').evaluate((image) => image.decode());
  const board = page.locator('.decode-board');
  const bounds = await board.boundingBox();
  await board.click({ position: { x: bounds.width * target.x / 100, y: bounds.height * target.y / 100 } });
  await expect(page.getByRole('dialog')).toContainText(`你找到了${level.name}`);
  await page.getByRole('button', { name: '进入对应苗绣衣橱 →', exact: true }).click();
  for (const gender of ['girl', 'boy']) {
    await page.locator(`[data-action="drawGender"][data-id="${gender}"]`).click();
    await page.locator('.draw-btn').click();
    await expect(page.locator('.costume-draw-stage')).toHaveClass(/has-result/, { timeout: 10000 });
    await expect(page.locator('.draw-btn')).toBeEnabled();
    await expect(page.locator('.owned-card')).toHaveCount(1);
    await page.locator('.wear-full').first().click();
    await expect(page.locator('.wear-full').first()).toHaveAttribute('aria-pressed', 'true');
  }
  await images();
  await page.getByRole('button', { name: '全屏观赏', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '人物服饰观看器' })).toBeVisible();
  await screenshot('04-dressed-avatar');
  await page.keyboard.press('Escape');
  const pngPath = path.join(isolated, '我的 苗绣效果图.png');
  await page.locator('[data-action="save"]').click();
  await nativeSave(pngPath);
  await expect(page.locator('.save-status')).toContainText(pngPath);
  const png = await readFile(pngPath);
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.readUInt32BE(16)).toBe(900); expect(png.readUInt32BE(20)).toBe(1400);
  await copyFile(pngPath, path.join(output, 'saved-look.png'));
  await page.locator('[data-action="save"]').click();
  await nativeSave('', true);
  await expect(page.locator('.save-status')).toContainText('已取消保存');
  record('寻纹→解锁→抽取→收藏→穿戴→保存', `Both genders; native Save As creates valid 900×1400 PNG (${png.length} bytes); cancel reports correctly`);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')));
  expect(saved.owned).toHaveLength(2);
  expect(saved.equipped.girl).toBeTruthy(); expect(saved.equipped.boy).toBeTruthy();
  await page.goto('miao://app/#gallery');
  await expect(page.locator('.jing-work')).toHaveCount(18);
  await images();
  await page.locator('.jing-work').first().click();
  await page.locator('.image-viewer-zoom').click();
  await expect(page.locator('.image-viewer-stage')).toHaveClass(/is-zoomed/);
  const artPath = path.join(isolated, '展览 图片.webp');
  await page.locator('.image-viewer-save').click();
  await nativeSave(artPath);
  await expect(page.getByRole('status')).toContainText(artPath);
  expect((await stat(artPath)).size).toBeGreaterThan(1000);
  await page.keyboard.press('Escape');
  record('作品展览', '18 images load; zoom and native image saving work');
  for (const [width, height] of [[800, 600], [1024, 768], [1440, 960]]) {
    await windowSize(width, height);
    for (const route of ['home', 'history', 'experience', 'gallery', 'sources']) {
      await page.goto(`miao://app/#${route}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await screenshot(`05-window-${width}x${height}`);
  }
  await windowSize(0, 0, 'maximized');
  await screenshot('06-maximized');
  record('窗口尺寸', 'Native windows 800×600, 1024×768, 1440×960 + maximize; 5 pages have no horizontal page overflow');
  await stop();
  await start();
  await page.goto('miao://app/#experience');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('miao-wardrobe-v4')))).toEqual(saved);
  await expect(page.locator('.wear-full').first()).toHaveAttribute('aria-pressed', 'true');
  await images();
  await screenshot('07-restored-after-restart');
  record('关闭后重新启动', `Collections, unlocked pools, gender and both outfits restore from ${profile}`);
  expect(errors).toEqual([]);
  record('运行错误', 'No page exceptions, failed resource responses or remote content requests during checks');
  await stop();
  await writeFile(path.join(output, 'acceptance.json'), JSON.stringify({ success: true, testedAt: new Date().toISOString(), source, copied, profile, exeBytes: (await stat(source)).size, records, errors, unverified: ['Clean Windows without developer tools', 'Windows 10 physical/VM', 'System browser external destination while offline'] }, null, 2));
} catch (error) {
  if (page && !page.isClosed()) await screenshot('failure').catch(() => {});
  await writeFile(path.join(output, 'acceptance.json'), JSON.stringify({ success: false, copied, profile, records, errors, failure: error.stack }, null, 2));
  if (page && !page.isClosed()) await page.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
  console.error(error); process.exitCode = 1;
}
