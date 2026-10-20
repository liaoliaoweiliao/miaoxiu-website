import { assetUrl } from '../../utils/assets.js';

export function lookScale(look) {
  return look === 1 ? 0.95 : look === 2 ? 1.07 : 1;
}

function loadCharacter(signal) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      signal?.removeEventListener('abort', abort);
    };
    function abort() {
      cleanup();
      image.src = '';
      reject(new DOMException('保存已取消', 'AbortError'));
    }
    image.onload = () => { cleanup(); resolve(image); };
    image.onerror = () => { cleanup(); reject(new Error('人物图片加载失败，请稍后重试。')); };
    if (signal?.aborted) { abort(); return; }
    signal?.addEventListener('abort', abort, { once: true });
    image.src = assetUrl('experience/character.webp');
  });
}

export async function downloadLook({ garment, look, signal }) {
  const image = await loadCharacter(signal);
  if (signal?.aborted) return;
  const canvas = document.createElement('canvas');
  canvas.width = 700;
  canvas.height = 900;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('当前浏览器暂不支持保存图片。');
  context.fillStyle = '#06253c';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const scale = lookScale(look);
  context.save();
  context.filter = garment.filter;
  context.drawImage(image, 350 - 235 * scale, 765 - 700 * scale, 470 * scale, 700 * scale);
  context.restore();
  context.fillStyle = '#ebbb82';
  context.textAlign = 'center';
  context.font = 'bold 36px serif';
  context.fillText('穿在身上的民族历史', 350, 805);
  context.font = '22px serif';
  context.fillText(`苗绣人物换装 · ${garment.text}`, 350, 849);
  const link = document.createElement('a');
  link.download = '我的苗绣形象.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
