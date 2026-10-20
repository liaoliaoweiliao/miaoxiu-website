import { assetUrl } from '../utils/assets.js';

const filters = ['全部作品', '传统服饰', '现代应用', '纹样艺术'];
const works = [
  { title: '山野繁花', sub: '传统纹样 · 蝴蝶与花卉', src: 'gallery/pattern-butterfly.webp', group: 3 },
  { title: '绣韵新生', sub: '现代应用 · 服饰与手袋', src: 'gallery/fashion.webp', group: 2 },
  { title: '银饰华章', sub: '传统服饰 · 民族盛装', src: 'gallery/hero-woman.webp', group: 1 },
  { title: '童趣苗韵', sub: '传统服饰 · 苗绣人物', src: 'gallery/character.webp', group: 1 },
  { title: '锦绣衣裳', sub: '传统服饰 · 衣橱图鉴', src: 'gallery/fashion-card.webp', group: 1 },
  { title: '蝴蝶妈妈', sub: '纹样艺术 · 生命符号', src: 'gallery/pattern-detail.webp', group: 3 },
];

export default function GalleryPage({ state, onAction }) {
  const selectedFilter = state.galleryFilter || 0;

  return (
    <main className="container page-main">
      <div className="section-intro">
        <span className="eyebrow">EMBROIDERY ART GALLERY</span>
        <h1>作品 <em>展览</em></h1>
        <p>当传统纹样走进当代生活，古老针线便焕发崭新的生命力。</p>
      </div>
      <div className="gallery-filter" role="group" aria-label="作品分类">
        {filters.map((label, index) => (
          <button
            type="button"
            key={label}
            className={selectedFilter === index ? 'active' : ''}
            aria-pressed={selectedFilter === index}
            onClick={() => onAction('filter', index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="gallery-grid">
        {works.filter((work) => !selectedFilter || work.group === selectedFilter).map((work) => (
          <button
            type="button"
            key={work.title}
            className="gallery-card"
            onClick={() => onAction('modal', 0, { src: work.src, title: work.title })}
          >
            <div><img src={assetUrl(work.src)} alt={work.title} loading="lazy" /></div>
            <h3>{work.title}</h3>
            <p>{work.sub}</p>
            <span>查看作品　↗</span>
          </button>
        ))}
      </div>
    </main>
  );
}
