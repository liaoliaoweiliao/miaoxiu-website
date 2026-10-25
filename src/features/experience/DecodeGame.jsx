import { forwardRef } from 'react';
import { assetUrl } from '../../utils/assets.js';
import { levels } from './gameModel.js';

const DecodeGame = forwardRef(function DecodeGame({ game, dispatch, onPreview, onWardrobe, onRound }, ref) {
  const level = levels[game.level];
  const region = level.regions[game.region];
  const preview = () => onPreview({ src: `experience/${level.image}`, title: level.title });

  function find(event) {
    if (game.found) { preview(); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const cursor = game.cursor || { x: 50, y: 50 };
    dispatch(event.detail === 0 ? { type: 'find', ...cursor } : { type: 'find', x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 });
  }

  function observe(event) {
    const moves = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] };
    const cursor = game.cursor || { x: 50, y: 50 };
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (game.found) preview(); else dispatch({ type: 'find', ...cursor });
    } else if (!game.found && moves[event.key]) {
      event.preventDefault();
      const [dx, dy] = moves[event.key];
      dispatch({ type: 'cursor', x: cursor.x + dx, y: cursor.y + dy });
    }
  }

  return <div className="decode-game">
    <div className="decode-toolbar"><span className="level-label">第 {game.round} 轮 · {level.title}</span><span className="decode-counter">{game.found ? '已找到' : '寻找 1 处'}</span></div>
    <div className="target-brief"><span>本图寻找</span><strong>{level.icon} {level.name}</strong><small>命中即可解锁</small></div>
    <div className="decode-viewport"><div ref={ref} className={`decode-board ${game.found ? 'solved' : ''} ${game.dealing ? 'is-dealing' : ''}`} onClick={find} onKeyDown={observe} role="button" tabIndex={0} aria-label={game.found ? `点击欣赏${level.title}` : `寻找${level.name}，可用方向键移动观察点，回车确认。`} aria-describedby="decode-feedback">
      <img src={assetUrl(`experience/${level.image}`)} alt={level.title} draggable={false} />
      {game.found && <svg className="found-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{region.shape === 'rect' ? <rect x={region.x} y={region.y} width={region.w} height={region.h} rx="1" /> : <ellipse cx={region.cx} cy={region.cy} rx={region.rx} ry={region.ry} />}</svg>}
      {game.feedback && <span key={`${game.round}-${game.feedback.x}-${game.feedback.y}-${game.feedback.hit}`} className={`click-ripple ${game.feedback.hit ? 'hit' : 'miss'}`} style={{ left: `${game.feedback.x}%`, top: `${game.feedback.y}%` }} aria-hidden="true">{game.feedback.hit ? '✦' : '×'}</span>}
      {game.cursor && <span className="observation-cursor" style={{ left: `${game.cursor.x}%`, top: `${game.cursor.y}%` }} aria-hidden="true">＋</span>}
    </div><button type="button" className="decode-image-preview" onClick={preview} aria-label={`放大欣赏${level.title}`}>⤢ 欣赏图片</button></div>
    <div className="decode-actions">{game.found ? <button type="button" onClick={onWardrobe}>前往对应苗绣衣橱 →</button> : <button type="button" data-action="randomImage" onClick={() => onRound(false)} disabled={game.drawing || game.reveal}>↻ 随机抽图</button>}</div>
    <p className="decode-help">{game.found ? '纹样已点亮。抽取绣衣并完成装扮后，即可随机换图再玩一轮。' : '可随时换一张图；每轮完成装扮后，还能继续新的寻纹之旅。'}</p>
    <p id="decode-feedback" className="decode-feedback" role="status">{game.notice}</p>
  </div>;
});
export default DecodeGame;
