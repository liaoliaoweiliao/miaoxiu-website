import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { readdirSync, readFileSync } from 'node:fs';

// file:// image origins can taint a canvas. Embed only the portraits needed for
// outfit export; the remaining source images keep their normal relative URLs.
const catalog = new URL('./public/assets/experience/catalog/', import.meta.url);
const portraits = Object.fromEntries(readdirSync(catalog)
  .filter((name) => /(?:-portrait|-base)\.webp$/.test(name))
  .map((name) => [`experience/catalog/${name}`, `data:image/webp;base64,${readFileSync(new URL(name, catalog)).toString('base64')}`]));

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'offline-export-portraits',
      enforce: 'pre',
      transform(source, id) {
        if (!id.split('?')[0].replaceAll('\\', '/').endsWith('/src/utils/assets.js')) return null;
        return `const portraits = ${JSON.stringify(portraits)};\nexport function assetUrl(path) { return portraits[path] || './assets/' + path.split('/').map(encodeURIComponent).join('/'); }`;
      },
    },
    react(),
    viteSingleFile(),
  ],
  build: { outDir: 'standalone', emptyOutDir: true },
});
