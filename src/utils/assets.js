// Keep public assets working both at / and under a static hosting subdirectory.
export function assetUrl(path) {
  return `${import.meta.env.BASE_URL}assets/${path.split('/').map(encodeURIComponent).join('/')}`;
}
