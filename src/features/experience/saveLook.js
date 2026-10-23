import { assetUrl } from '../../utils/assets.js';
import { setById, themeById } from './gameModel.js';
import { saveImage } from '../../utils/saveImage.js';

function loadImage(path, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const cleanup = () => { image.onload = null; image.onerror = null; signal?.removeEventListener('abort', abort); };
    function abort() { cleanup(); image.src = ''; reject(new DOMException('保存已取消', 'AbortError')); }
    image.onload = () => { cleanup(); resolve(image); };
    image.onerror = () => { cleanup(); reject(new Error('image-load')); };
    if (signal?.aborted) { abort(); return; }
    signal?.addEventListener('abort', abort, { once: true });
    image.src = assetUrl(path);
  });
}

export async function paintLook(canvas, layers, gender, signal) {
  canvas.width = 900; canvas.height = 1400;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas unavailable');
  const background = context.createLinearGradient(0, 0, 0, 1400);
  background.addColorStop(0, '#0d3852'); background.addColorStop(1, '#041c30');
  context.fillStyle = background; context.fillRect(0, 0, 900, 1400);
  const unique = [...new Set(layers.map((layer) => layer.src))];
  const images = Object.fromEntries(await Promise.all(unique.map(async (path) => [path, await loadImage(path, signal)])));
  if (signal?.aborted) throw new DOMException('保存已取消', 'AbortError');
  for (const layer of layers) {
    const [sx, sy, sw, sh] = layer.source, [dx, dy, dw, dh] = layer.dest;
    context.drawImage(images[layer.src], sx, sy, sw, sh, 75 + dx / 768 * 750, 40 + dy / 1152 * 1125, dw / 768 * 750, dh / 1152 * 1125);
  }
  context.strokeStyle = '#d8b17d'; context.lineWidth = 2; context.strokeRect(28, 28, 844, 1344);
  context.textAlign = 'center'; context.fillStyle = '#f0ce9f'; context.font = 'bold 32px serif'; context.fillText('我的苗绣装扮', 450, 1220);
  context.font = '18px serif'; context.fillStyle = '#dae3e9';
  const names = [...new Set(layers.filter((layer) => layer.setId).map((layer) => themeById(setById(layer.setId).theme).name))];
  context.fillText(`${gender === 'girl' ? '苗绣女孩' : '苗绣少年'} · ${names.join(' / ')}`, 450, 1260);
  context.font = '16px serif'; context.fillText('穿在身上的民族历史', 450, 1310);
  return canvas;
}

export async function downloadLook({ layers, gender, signal }) {
  const canvas = await paintLook(document.createElement('canvas'), layers, gender, signal);
  if (signal?.aborted) return;
  return saveImage(canvas.toDataURL('image/png'), `我的苗绣装扮-${gender}.png`);
}
