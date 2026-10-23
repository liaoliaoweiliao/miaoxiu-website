// Browser downloads remain unchanged; desktop saves require a native location choice.
export async function saveImage(dataUrlOrUrl, filename) {
  if (window.miaoxiuDesktop?.saveImage) {
    const response = await fetch(dataUrlOrUrl);
    if (!response.ok) throw new Error('图片尚未加载完成');
    const result = await window.miaoxiuDesktop.saveImage(new Uint8Array(await response.arrayBuffer()), filename);
    if (result.status === 'error') throw new Error(result.message);
    return result;
  }
  const link = document.createElement('a');
  link.download = filename; link.href = dataUrlOrUrl; link.click();
  return { status: 'downloaded' };
}
