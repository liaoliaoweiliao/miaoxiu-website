import { defineConfig } from 'vite';
import { cpSync } from 'node:fs';

// 普通 vite build 会把 JS/CSS 打包到 dist，但不会自动拷贝以字符串形式引用的 ./assets/ 资源。
// 这里在打包完成后把整个 assets 目录复制到 dist/assets，使构建产物也能独立运行。
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: { input: 'index.html' }
  },
  plugins: [{
    name: 'copy-miao-assets',
    closeBundle() {
      try { cpSync('assets', 'dist/assets', { recursive: true }); }
      catch (e) { console.warn('[copy-miao-assets] 复制资源失败：', e.message); }
    }
  }]
});
