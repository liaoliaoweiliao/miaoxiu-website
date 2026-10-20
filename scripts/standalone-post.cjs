// 构建后处理（必须在 vite build 之后执行）：把资源同步到 standalone/assets。
// 注意：单文件版保留 type="module"（内联模块脚本），在 Chrome / Edge / Firefox 下
// 通过 file:// 双击即可运行；type="module" 是延迟执行，能确保 #app 已存在后再渲染。
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const htmlPath = path.join(root, 'standalone', 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.warn('[standalone-post] 未找到 standalone/index.html，请先执行 vite build');
  process.exit(0);
}

const src = path.join(root, 'assets');
const dest = path.join(root, 'standalone', 'assets');
try {
  fs.cpSync(src, dest, { recursive: true });
  console.log('[standalone-post] 已同步 assets 到 standalone/assets');
} catch (e) {
  console.warn('[standalone-post] 复制 assets 失败：', e.message);
}
