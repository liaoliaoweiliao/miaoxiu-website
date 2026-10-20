import { assetUrl } from '../utils/assets.js';
import { galleryDisplayWorks, galleryFrameSlots, gallerySheetStep } from '../data/gallery.js';

function GalleryBackgrounds({ sheets }) {
  return Array.from({ length: sheets }, (_, index) => (
    <svg key={index} className={`jing-background${index === 0 ? ' is-first' : ''}${index === sheets - 1 ? ' is-last' : ''}`} style={{ '--sheet-y': (index * gallerySheetStep / 941).toFixed(6) }} viewBox="0 0 941 1672" aria-hidden="true">
      <defs><mask id={`gallery-landscape-${index}`} maskUnits="userSpaceOnUse">
        <rect width="941" height="1672" fill="white" />
        {index > 0 && <path d="M469 115C483 125 498 130 508 140" fill="none" stroke="black" strokeWidth="7" />}
        {index < sheets - 1 && <path d="M529 1450C548 1468 555 1490 549 1505" fill="none" stroke="black" strokeWidth="7" />}
      </mask></defs>
      <image href={assetUrl(index === sheets - 1 ? 'gallery/new/moonlit-scroll-ending.webp' : 'gallery/new/jing-exhibition-detail.webp')} width="941" height="1672" mask={`url(#gallery-landscape-${index})`} />
    </svg>
  ));
}

function GalleryThreadSeams({ sheets }) {
  const curve = 'M529 0C542 12 545 19 533 27S488 31 497 40C501 44 504 47 508 50';
  return Array.from({ length: Math.max(0, sheets - 1) }, (_, index) => (
    <svg key={index} className="jing-seam" style={{ '--seam-y': ((index * gallerySheetStep + 1450) / 941).toFixed(6) }} viewBox="0 0 941 50" preserveAspectRatio="none" aria-hidden="true">
      <path className="seam-thread-shadow" d={curve} /><path className="seam-thread-red" d={curve} /><path className="seam-thread-glint" d={curve} />
    </svg>
  ));
}

export default function GalleryPage({ onAction }) {
  const works = galleryDisplayWorks();
  const sheets = Math.ceil(works.length / 6);
  const lastSlot = galleryFrameSlots[(works.length - 1) % 6];
  const height = ((sheets - 1) * gallerySheetStep + (works.length % 6 === 0 ? 1672 : lastSlot.y + lastSlot.h + 20)) / 941;

  return (
    <main className="jing-gallery jing-long-gallery">
      <header className="jing-heading">
        <span className="eyebrow">MIAO EMBROIDERY EXHIBITION</span>
        <div className="jing-title-line"><h1 aria-label="作品展览"><span>作品</span><em>展览</em></h1></div>
        <p className="jing-heading-poem" aria-label="循一线锦绣，赏万千绣意。"><span>循一线锦绣</span><i aria-hidden="true">·</i><span>赏万千绣意</span></p>
        <span className="jing-title-stitches" aria-hidden="true" />
      </header>
      <div className="jing-sheets">
        <GalleryBackgrounds sheets={sheets} /><GalleryThreadSeams sheets={sheets} />
        <ol className="jing-artworks" style={{ '--scroll-height': height.toFixed(6) }}>
          {works.map((work, index) => {
            const slot = galleryFrameSlots[index % 6];
            const y = (Math.floor(index / 6) * gallerySheetStep + slot.y) / 941;
            return (
              <li key={work.src} className={`jing-slot ${work.catalogue ? 'has-catalogue' : ''}`} style={{ '--slot-x': (slot.x / 941).toFixed(6), '--slot-y': y.toFixed(6), '--slot-w': (slot.w / 941).toFixed(6), '--slot-h': (slot.h / 941).toFixed(6) }}>
                <button type="button" className="jing-work" onClick={() => onAction('modal', 0, { src: work.src, title: `${work.kind ? `${work.kind}｜` : ''}${work.title}`, description: work.catalogue ? work.desc : '' })} aria-label={`放大观赏${work.title}${work.kind ? `，${work.kind}` : ''}`}>
                  <div className={`jing-work-photo ${work.detailPosition ? 'is-detail' : ''}`}>
                    <img src={assetUrl(work.src)} style={work.detailPosition ? { objectPosition: work.detailPosition, transformOrigin: work.detailPosition } : undefined} alt={`${work.title}${work.kind ? `（${work.kind}）` : ''}`} loading="lazy" decoding="async" />
                  </div>
                  <div className="jing-work-copy">
                    {!work.catalogue && <span className="jing-work-type">{work.sub}</span>}
                    <h2>{work.title}</h2><p>{work.summary || work.desc}</p>
                    {work.kind && <small className="jing-work-kind">{work.kind}</small>}
                    <span className="jing-work-open">{work.catalogue ? '图赏与作品信息 ↗' : '观赏细节 ↗'}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="scroll-ending-mobile" role="img" aria-label="月下山水中，红绳盘结连接银饰与流苏，自然收束长卷" />
      </div>
    </main>
  );
}
