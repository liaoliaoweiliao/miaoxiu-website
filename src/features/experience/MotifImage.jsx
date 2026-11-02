import { assetUrl } from '../../utils/assets.js';

const columns = { peony: 0, star: 1, swirl: 2 };

// Display one square from the supplied three-part image without altering its pixels.
export default function MotifImage({ theme, className = '', decorative = false }) {
  return <svg className={`theme-motif-image ${className}`} viewBox={`${columns[theme.id] * 724} 0 724 724`} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : `${theme.name}纹样`} aria-hidden={decorative || undefined}>
    <image href={assetUrl('experience/motifs/embroidery-motifs.png')} width="2172" height="724" />
  </svg>;
}
