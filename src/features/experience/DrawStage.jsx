import { assetUrl } from '../../utils/assets.js';

const prizeStars = [
  [4, 12, 28], [92, 8, 22], [14, 34, 16], [98, 37, 32], [3, 65, 24],
  [91, 72, 18], [17, 92, 26], [82, 96, 30], [48, 3, 16], [52, 98, 18],
];

export function ThemeIcon({ theme }) { return theme.id === 'peony' ? <img className="wardrobe-peony-icon" src={assetUrl('experience/peony-emblem.svg')} alt="" aria-hidden="true" /> : theme.icon; }

export default function DrawStage({ game, pool, theme, last }) {
  // The concealed front reserves the same space before, during and after a draw.
  const preview = last || pool[0];
  const back = <div className="card-back"><span><ThemeIcon theme={theme} /></span><strong>{theme.name}</strong><small>一袭绣衣 · 静候揭晓</small></div>;
  const cards = (duplicate) => <div className="carousel-group" aria-hidden={duplicate || undefined}>{pool.map((costume) => <div className="pool-costume" key={costume.id}><img src={assetUrl(costume.card)} alt={duplicate ? '' : `${costume.name}整套服装`} decoding="async" /><span>{costume.name}</span></div>)}</div>;
  return <div className={`costume-draw-stage ${game.drawing ? 'is-drawing' : last ? 'has-result' : 'is-awaiting'} ${game.reveal ? 'is-revealing' : ''}`} aria-busy={game.drawing}>
    <span className="draw-reveal-label" aria-hidden={game.drawing || undefined}>{last ? '✧ 此刻，为你揭晓 ✧' : '开启属于你的苗绣奇遇'}</span>
    {game.drawing && <div className="wardrobe-carousel" role="img" aria-label="服装套装正在横向循环轮播"><div className="carousel-window"><div className="carousel-track">{cards(false)}{cards(true)}</div></div><div className="carousel-marker" aria-hidden="true">◆</div><p className="carousel-caption" role="status">绣影流转，静候你的专属套装…</p></div>}
    <span className="prize-radiance" aria-hidden="true" />
    {/* Keep the result mounted when reveal ends; a new draw alone restarts the entrance. */}
    <div key={game.drawRevision} className={`draw-card ${game.reveal ? 'just-revealed' : ''}`} aria-hidden={game.drawing || undefined}>
      <div className="reveal-turn">
        <div className="reveal-side reveal-back" aria-hidden={Boolean(last) || undefined}>{back}</div>
        <div className="reveal-side reveal-front" aria-hidden={!last || undefined}>
          <img src={assetUrl(preview.card)} alt={last ? `抽到的${last.name}整套服装` : ''} />
          <strong className="prize-name">{preview.name}</strong>
          <small>{theme.name} · {game.drawGender === 'girl' ? '苗绣姑娘' : '苗绣少年'}套装</small>
          <span className="reveal-sheen" aria-hidden="true" />
        </div>
      </div>
      {last && <><span className="reveal-glow" aria-hidden="true" />
      <span className="prize-sparks" aria-hidden="true">{prizeStars.map(([x, y, size], index) => <i key={index} style={{ '--star-x': `${x}%`, '--star-y': `${y}%`, '--star-size': `${size}px`, '--star-delay': `${500 + index * 14}ms` }}>✦</i>)}</span></>}
    </div>
    <span className="prize-footer" aria-hidden={!last || game.drawing || undefined}>一袭苗绣，与你相遇</span>
  </div>;
}
