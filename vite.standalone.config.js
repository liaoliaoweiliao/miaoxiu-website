import { defineConfig } from 'vite';
import { cpSync } from 'node:fs';
import { viteSingleFile } from 'vite-plugin-singlefile';

// 单文件构建：把 JS/CSS 全部内联进 index.html，图片走相对路径 ./assets/。
// 产物可直接双击打开（file://），无需起服务器。
export default defineConfig({
  base: './',
  plugins: [
    viteSingleFile(),
    {
      name: 'copy-miao-assets-standalone',
      closeBundle() {
        try { cpSync('assets', 'standalone/assets', { recursive: true }); }
        catch (e) { console.warn('[copy-miao-assets] 复制资源失败：', e.message); }
      }
    }
  ],
  build: {
    outDir: 'standalone',
    emptyOutDir: true,
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      input: 'index.html'
    }
  }
});
