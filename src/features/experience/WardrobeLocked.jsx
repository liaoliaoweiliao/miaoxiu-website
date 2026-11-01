import { assetUrl } from '../../utils/assets.js';
import { CULTURE } from './gameModel.js';
import { ThemeIcon } from './DrawStage.jsx';

export function WardrobeTabOutline() {
  return <svg className="wardrobe-tab-outline" viewBox="0 0 400 88" preserveAspectRatio="none" fill="none" stroke="currentColor" aria-hidden="true"><path d="M30 3h340l8 10h10l9 31-9 31h-10l-8 10H30l-8-10H12L3 44l9-31h10Z"/><path opacity=".45" d="M33 7h334l8 10h10l8 27-8 27h-10l-8 10H33l-8-10H15L7 44l8-27h10Z"/><path d="m194 85 6-5 6 5-6 5Z"/></svg>;
}

export function WardrobeLandscape() {
  return <svg className="wardrobe-landscape" viewBox="0 0 240 90" fill="none" stroke="currentColor" strokeWidth=".7" aria-hidden="true"><path d="m1 70 30-25 18 7 35-30 20 11 26-17 34 20 19-6 56 39M19 75l40-17 29 12 32-23 24 10 32-13 53 37M2 84h232M19 63v18m23-18v20M9 62h44L31 51ZM71 48v31m24-31v33M60 47h47L83 34ZM126 58v24m26-24v24m-38-25h51l-25-14Zm60 10v18m23-18v18m-32-19h42l-21-12Z"/><path d="M21 70h18m-18 6h18m35-18h18m-18 8h18m-18 8h18m36-10h20m-20 8h20m25-1h16M30 64v18m52-33v31m57-22v24m45-16v16M7 87l49-4 64 5 50-4 66 4"/></svg>;
}

export default function WardrobeLocked({ theme, photo, onBack, onPreview }) {
  return <div className="wardrobe-locked-layout">
    <button type="button" className="wardrobe-puzzle-photo" onClick={onPreview} aria-label={`欣赏本轮寻纹图片：${photo.title}`}>
      <img src={assetUrl(`experience/${photo.image}`)} alt={`本轮寻纹图片：${photo.title}`} />
      <span><small>本轮寻纹 · {photo.name}</small><strong>⤢ 欣赏图片</strong></span>
    </button>
    <div className="pool-locked">
      <span className="wardrobe-lock-symbol" aria-hidden="true"><ThemeIcon theme={theme} /></span>
      <h3>{theme.name}卡池尚未解锁</h3>
      <div className="wardrobe-gold-rule" aria-hidden="true">◇</div>
      <p>先找到对应图片中的纹样，<br />即可进入这个主题卡池。</p>
      {theme.id !== photo.id && <p className="wardrobe-round-clue">本轮正在寻找{photo.name}，返回寻纹继续体验。</p>}
      <section className="wardrobe-knowledge" aria-label={`${theme.name}纹样小知识`}><h4>纹样小知识</h4><div><span aria-hidden="true"><ThemeIcon theme={theme} /></span><p>{CULTURE[theme.id].text}</p></div></section>
      <button type="button" className="save-btn" data-action="backToPuzzle" onClick={onBack}>返回寻纹</button>
    </div>
  </div>;
}
