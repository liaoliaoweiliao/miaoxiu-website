import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { readdirSync, readFileSync } from 'node:fs';

// file:// image origins can taint a canvas or hide CSS masks. Embed portraits
// needed for outfit export and the nine history masks; other images stay separate.
const catalog = new URL('./public/assets/experience/catalog/', import.meta.url);
const portraits = Object.fromEntries(readdirSync(catalog)
  .filter((name) => /(?:-portrait|-base)\.webp$/.test(name))
  .map((name) => [`experience/catalog/${name}`, `data:image/webp;base64,${readFileSync(new URL(name, catalog)).toString('base64')}`]));
const historyMasks = new URL('./public/assets/history/color-motifs/', import.meta.url);
const offlineImages = { ...portraits, ...Object.fromEntries(readdirSync(historyMasks)
  .filter((name) => /-paint-[0-2]\.png$/.test(name))
  .map((name) => [`history/color-motifs/${name}`, `data:image/png;base64,${readFileSync(new URL(name, historyMasks)).toString('base64')}`])) };

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'offline-export-portraits',
      enforce: 'pre',
      transform(source, id) {
        if (!id.split('?')[0].replaceAll('\\', '/').endsWith('/src/utils/assets.js')) return null;
        return `const offlineImages = ${JSON.stringify(offlineImages)};\nexport function assetUrl(path) { return offlineImages[path] || './assets/' + path.split('/').map(encodeURIComponent).join('/'); }`;
      },
    },
    react(),
    viteSingleFile(),
  ],
  build: { outDir: 'standalone', emptyOutDir: true },
});
