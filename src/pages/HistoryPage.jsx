import Frame from '../components/Frame.jsx';
import { motifs } from '../data/site.js';
import { assetUrl } from '../utils/assets.js';

const techniques = [
  ['平绣', '针脚平整，色彩鲜明'],
  ['挑花', '经纬交织，几何有序'],
  ['锁绣', '线条连绵，肌理丰富'],
  ['打籽绣', '绣粒如珠，层次分明'],
  ['贴布绣', '色块相叠，装饰强烈'],
  ['辫绣', '纹理立体，灵动精致'],
];

export default function HistoryPage({ onNavigate }) {
  return (
    <main className="container page-main">
      <div className="section-intro">
        <span className="eyebrow">MIAO EMBROIDERY · CULTURAL HERITAGE</span>
        <h1>苗绣 <em>探源</em></h1>
        <p>一针一线里，藏着民族的记忆；一花一纹间，绣出千年的故事。</p>
      </div>
      <Frame className="history-panel">
        <div className="history-split">
          <div>
            <span className="eyebrow">千年传承</span>
            <h2>以针为笔，<br />以线为墨</h2>
            <p>苗绣是苗族人民世代相传的传统刺绣技艺。花鸟虫鱼、山川河流与古老传说，在一针一线中变成可触摸的文化记忆。</p>
            <p>从节庆盛装到日常服饰，苗绣既是审美表达，也是民族历史与生活哲学的载体。</p>
            <button type="button" className="primary-btn" onClick={() => onNavigate('experience')}>
              亲自体验纹样 →
            </button>
          </div>
          <img src={assetUrl('history/pattern-butterfly.webp')} alt="苗绣花鸟纹样细节" />
        </div>
      </Frame>
      <section className="history-content">
        <h2 className="section-heading">六大经典纹样 <span aria-hidden="true">❧</span></h2>
        <div className="pattern-grid">
          {motifs.map((motif, index) => (
            <button
              type="button"
              key={motif.name}
              className="pattern-tile"
              onClick={() => onNavigate('experience', { motif: index })}
            >
              <span>{motif.icon}</span>
              <strong>{motif.name}</strong>
              <small>{motif.tag}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="history-content">
        <h2 className="section-heading">针线之间的技艺</h2>
        <div className="technique-grid">
          {techniques.map(([name, description], index) => (
            <div key={name}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{name}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
