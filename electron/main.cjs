const { app, BrowserWindow, dialog, ipcMain, protocol, session, shell, Menu } = require('electron');
const { readFile, writeFile } = require('node:fs/promises');
const path = require('node:path');

const APP_URL = 'miao://app/';
const TITLE = '穿在身上的民族历史——苗绣';
protocol.registerSchemesAsPrivileged([{ scheme: 'miao', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }]);
// A stable, writable profile shared by all copies/versions of the portable app.
app.setPath('userData', path.join(app.getPath('appData'), 'MiaoxiuDesktop'));
// Optional isolated profile for repeatable acceptance checks; never use the install/extraction directory.
const profile = app.commandLine.getSwitchValue('user-data-dir');
if (profile && path.isAbsolute(profile)) app.setPath('userData', profile);
app.setName(TITLE);
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-component-update');
app.commandLine.appendSwitch('disable-domain-reliability');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' data:; frame-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'";
function internal(url) {
  try { const parsed = new URL(url); return parsed.protocol === 'miao:' && parsed.host === 'app'; } catch { return false; }
}
function external(url) {
  try {
    const parsed = new URL(url);
    if (['https:', 'http:'].includes(parsed.protocol) && !parsed.username && !parsed.password) void shell.openExternal(parsed.href).catch(() => {});
  } catch { /* Ignore invalid or non-web links. */ }
}

let mainWindow;
let saving = false;
async function createWindow() {
  mainWindow = new BrowserWindow({
    title: TITLE, width: 1440, height: 960, minWidth: 640, minHeight: 480,
    backgroundColor: '#165981', show: false, icon: path.join(__dirname, 'icon.ico'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, webviewTag: false, spellcheck: false },
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { external(url); return { action: 'deny' }; });
  mainWindow.webContents.on('will-navigate', (event, url) => { if (!internal(url)) { event.preventDefault(); external(url); } });
  mainWindow.webContents.on('will-attach-webview', (event) => event.preventDefault());
  mainWindow.webContents.on('page-title-updated', (event, title) => { event.preventDefault(); mainWindow.setTitle(`${TITLE} · ${title.split(' · ')[0]}`); });
  mainWindow.once('ready-to-show', () => mainWindow.show());
  await mainWindow.loadURL(APP_URL);
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); } });
  app.whenReady().then(async () => {
    const root = path.join(app.getAppPath(), 'dist');
    protocol.handle('miao', async (request) => {
      try {
        if (!internal(request.url) || request.method !== 'GET') return new Response('', { status: 403 });
        const pathname = decodeURIComponent(new URL(request.url).pathname);
        const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
        if (!file.startsWith(root + path.sep)) return new Response('', { status: 403 });
        return new Response(await readFile(file), { headers: { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff' } });
      } catch { return new Response('资源不存在', { status: 404 }); }
    });
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    // All app content is bundled. Remote references are opened only by the system browser.
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => callback({ cancel: !internal(details.url) && !/^(data:|blob:|devtools:)/.test(details.url) }));
    ipcMain.handle('miao:save-image', async (event, payload) => {
      if (event.sender !== mainWindow?.webContents || event.senderFrame !== event.sender.mainFrame || !internal(event.senderFrame.url)) throw new Error('不允许的保存请求');
      if (saving) return { status: 'error', message: '请先完成当前保存。' };
      const bytes = payload?.bytes;
      if (!(bytes instanceof Uint8Array) || bytes.length > 32 * 1024 * 1024 || bytes.length < 12) throw new Error('图片数据无效');
      const buffer = Buffer.from(bytes);
      const png = buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
      const webp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
      const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      if (!png && !webp && !jpeg) throw new Error('仅允许保存 PNG、WebP 或 JPEG 图片');
      const extension = png ? 'png' : webp ? 'webp' : 'jpg';
      const name = typeof payload.filename === 'string' ? payload.filename.replace(/[\\/:*?"<>|\x00-\x1f]/g, '-').slice(0, 100).replace(/\.[^.]+$/, '') : '苗绣图片';
      saving = true;
      try {
        const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, { title: '保存苗绣图片', defaultPath: path.join(app.getPath('pictures'), `${name}.${extension}`), filters: [{ name: `${extension.toUpperCase()} 图片`, extensions: [extension] }], properties: ['showOverwriteConfirmation', 'createDirectory'] });
        if (canceled || !filePath) return { status: 'cancelled' };
        await writeFile(filePath, buffer);
        return { status: 'saved', path: filePath };
      } catch { return { status: 'error', message: '保存失败，请选择可写的位置后重试。' }; }
      finally { saving = false; }
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { label: '苗绣', submenu: [{ label: '关于苗绣', click: () => dialog.showMessageBox(mainWindow, { title: TITLE, message: TITLE, detail: `版本 ${app.getVersion()}\n离线便携版 · Windows x64\n收藏与穿戴数据：${app.getPath('userData')}\n效果图通过“保存效果图”选择保存位置。` }) }, { type: 'separator' }, { role: 'quit', label: '退出' }] },
      { label: '编辑', submenu: [{ role: 'undo', label: '撤销' }, { role: 'redo', label: '重做' }, { type: 'separator' }, { role: 'cut', label: '剪切' }, { role: 'copy', label: '复制' }, { role: 'paste', label: '粘贴' }, { role: 'selectAll', label: '全选' }] },
      { label: '视图', submenu: [{ role: 'resetZoom', label: '实际大小' }, { role: 'zoomIn', label: '放大' }, { role: 'zoomOut', label: '缩小' }, { type: 'separator' }, { role: 'togglefullscreen', label: '全屏' }] },
    ]));
    await createWindow();
  }).catch((error) => { dialog.showErrorBox('苗绣启动失败', error.message); app.quit(); });
  app.on('before-quit', () => session.defaultSession.flushStorageData());
  app.on('window-all-closed', () => app.quit());
}
