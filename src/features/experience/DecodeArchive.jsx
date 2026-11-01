import { decodeArchives } from '../../data/decodeArchives.js';
import { assetUrl } from '../../utils/assets.js';
import { CULTURE } from './gameModel.js';

export default function DecodeArchive({ level }) {
  const archive = decodeArchives[level.id];
  const region = level.regions[0];
  const crop = region.shape === 'rect'
    ? [region.x, region.y, region.w, region.h]
    : [region.cx - region.rx, region.cy - region.ry, region.rx * 2, region.ry * 2];
  // All three source photographs are 3:2; keep the sample in those coordinates.
  const viewBox = [crop[0] * 1.5, crop[1], crop[2] * 1.5, crop[3]];
  return <aside className="decode-archive" aria-labelledby="decode-archive-title">
    <h2 id="decode-archive-title">纹样档案 <span>— {level.name}</span></h2>
    <div className="decode-archive-intro">
      <svg className="decode-swatch" viewBox={viewBox.join(' ')} role="img" aria-label={`${level.name}原图细节`}>
        <image href={assetUrl(`experience/${level.image}`)} width="150" height="100" preserveAspectRatio="none" />
      </svg>
      <p>{CULTURE[level.id].text}</p>
    </div>
    <section className="decode-archive-section"><h3>纹样特征</h3><div className="decode-features">
      {archive.features.map(([icon, title, text]) => <div key={title}><span aria-hidden="true">{icon}</span><strong>{title}</strong><small>{text}</small></div>)}
    </div></section>
    <section className="decode-archive-section decode-placement"><div><h3>常见位置</h3><p>{archive.placement}</p></div>
      <svg viewBox="0 0 90 110" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M30 9 13 19 3 60l14 6 9-28-4 64h46l-4-64 9 28 14-6-10-41L60 9l-15 9Z"/><path d="m30 9 15 19L60 9M45 28v74M26 34l6-13m32 13-6-13M23 88h44M8 49l12 5m50 0 12-5M33 32l6 6-6 6-6-6Zm24 0 6 6-6 6-6-6ZM33 56l6 6-6 6-6-6Zm24 0 6 6-6 6-6-6Z"/></svg>
    </section>
  </aside>;
}
