import { assetUrl } from '../../utils/assets.js';
export function ThemeIcon({ theme }) { return theme.id === 'peony' ? <img className="wardrobe-peony-icon" src={assetUrl('experience/peony-emblem.svg')} alt="" aria-hidden="true" /> : theme.icon; }

export default function DrawStage({ game, pool, theme, last }) {
  const back = <div className="card-back"><span><ThemeIcon theme={theme} /></span><strong>{theme.name}</strong><small>一袭绣衣 · 静候揭晓</small></div>;
  const result = last ? <><img src={assetUrl(last.card)} alt={`抽到的${last.name}整套服装`} /><strong>{last.name}</strong><small>{theme.name} · {game.drawGender === 'girl' ? '苗绣姑娘' : '苗绣少年'}套装</small></> : back;
  const cards = (duplicate) => <div className="carousel-group" aria-hidden={duplicate || undefined}>{pool.map((costume) => <div className="pool-costume" key={costume.id}><img src={assetUrl(costume.card)} alt={duplicate ? '' : `${costume.name}整套服装`} decoding="async" /><span>{costume.name}</span></div>)}</div>;
  return <div className={`costume-draw-stage ${game.drawing ? 'is-drawing' : last ? 'has-result' : 'is-awaiting'} ${game.reveal ? 'is-revealing' : ''}`} aria-busy={game.drawing}>
    {game.drawing ? <div className="wardrobe-carousel" role="img" aria-label="服装套装正在横向循环轮播"><div className="carousel-window"><div className="carousel-track">{cards(false)}{cards(true)}</div></div><div className="carousel-marker" aria-hidden="true">◆</div><p className="carousel-caption" role="status">绣影流转，静候你的专属套装…</p></div> : <span className="draw-reveal-label">{last ? '✧ 此刻，为你揭晓 ✧' : '开启属于你的苗绣奇遇'}</span>}
    <span className="prize-radiance" aria-hidden="true" /><div className={`draw-card ${game.reveal ? 'just-revealed' : ''}`}>{game.reveal && last ? <><div className="reveal-turn"><div className="reveal-side reveal-back" aria-hidden="true">{back}</div><div className="reveal-side reveal-front">{result}</div></div><span className="reveal-glow" aria-hidden="true" /><span className="prize-sparks" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} style={{ '--prize-spark': index }}>✦</i>)}</span></> : result}</div>
    {last && !game.drawing && <span className="prize-footer">一袭苗绣，与你相遇</span>}
  </div>;
}
