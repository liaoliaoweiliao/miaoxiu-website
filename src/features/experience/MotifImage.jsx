import { assetUrl } from '../../utils/assets.js';

// The user's separate originals retain their own aspect ratio and transparency.
export default function MotifImage({ theme, className = '', decorative = false }) {
  return <img className={`theme-motif-image ${className}`} src={assetUrl(`experience/motifs/${theme.id}.png`)} alt={decorative ? '' : `${theme.name}纹样`} aria-hidden={decorative || undefined} />;
}
