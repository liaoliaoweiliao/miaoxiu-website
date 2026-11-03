import MotifImage from './MotifImage.jsx';
import { CULTURE } from './gameModel.js';
import { ThemeIcon } from './DrawStage.jsx';

export function WardrobeTabOutline() {
  return <svg className="wardrobe-tab-outline" viewBox="0 0 400 88" preserveAspectRatio="none" fill="none" stroke="currentColor" aria-hidden="true"><path d="M30 3h340l8 10h10l9 31-9 31h-10l-8 10H30l-8-10H12L3 44l9-31h10Z"/><path opacity=".45" d="M33 7h334l8 10h10l8 27-8 27h-10l-8 10H33l-8-10H15L7 44l8-27h10Z"/><path d="m194 85 6-5 6 5-6 5Z"/></svg>;
}

export default function WardrobeLocked({ theme, photo, onBack, onPreview }) {
  return <div className="wardrobe-locked-layout">
    <button type="button" className="wardrobe-puzzle-photo" onClick={onPreview} aria-label={`欣赏${theme.name}纹样原图`}>
      <MotifImage theme={theme} className="wardrobe-motif-picture" />
      <span><small>{theme.name}纹样</small><strong>⤢ 欣赏纹样原图</strong></span>
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
