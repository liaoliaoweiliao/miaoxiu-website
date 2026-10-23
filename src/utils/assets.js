// Keep public assets working both at / and under a static hosting subdirectory.
export function assetUrl(path) {
  // CSS custom-property url() values can resolve against the stylesheet directory.
  // An absolute URL also keeps shimmer masks and canvas export on the same app origin.
  return new URL(`${import.meta.env.BASE_URL}assets/${path.split('/').map(encodeURIComponent).join('/')}`, document.baseURI).href;
}
