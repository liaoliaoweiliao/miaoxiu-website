import { assetUrl } from '../../utils/assets.js';
import { levels } from './gameModel.js';

export default function DecodeGame({ game, dispatch }) {
  const level = levels[game.level];
  const progress = game.progress[game.level];
  const target = level.target;

  function find(event) {
    if (event.detail === 0) {
      dispatch({ type: 'find', ...(game.cursor || { x: 50, y: 50 }) });
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width && rect.height) dispatch({ type: 'find', x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 });
  }

  function observe(event) {
    if (progress.found) return;
    const cursor = game.cursor || { x: 50, y: 50 };
    const moves = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] };
    if (moves[event.key]) {
      event.preventDefault();
      const [dx, dy] = moves[event.key];
      dispatch({ type: 'cursor', x: cursor.x + dx, y: cursor.y + dy });
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dispatch({ type: 'find', ...cursor });
    }
  }

  return <div className="decode-game">
    <div className="decode-toolbar"><span className="level-label">第 0{game.level + 1} 关 · {level.title}</span><span className="decode-counter">已完成 {game.progress.filter(({ found }) => found).length} / {levels.length}</span></div>
    <div className="level-tabs" aria-label="选择关卡">{levels.map((item, index) => <button key={item.id} type="button" onClick={() => dispatch({ type: 'level', index })} className={index === game.level ? 'active' : ''} aria-pressed={index === game.level}><small>0{index + 1}</small>{item.title}<span>{game.progress[index].found ? '✓' : '○'}</span></button>)}</div>
    <div className="target-brief"><span>本关寻找</span><strong>{level.icon} {level.name}</strong><small>单图 · 单目标</small></div>
    <div className={`decode-viewport ${game.zoom ? 'zoomed' : ''}`}>
      <div className={`decode-board ${progress.found ? 'solved' : ''}`} onClick={find} onKeyDown={observe} tabIndex={0} role="button" aria-disabled={progress.found} aria-label={`${level.title}，寻找${level.name}。方向键移动观察点，回车或空格确认位置。`} aria-describedby="decode-feedback">
        <img src={assetUrl(`experience/${level.image}`)} alt={level.title} draggable={false} />
        {(game.hint || progress.found) && <span className={`target-outline ${progress.found ? 'found' : ''}`} style={{ left: `${target.x}%`, top: `${target.y}%`, width: `${target.w}%`, height: `${target.h}%` }}>{progress.found && <b>✓ 已找到</b>}</span>}
        {game.feedback && <span className={`click-ripple ${game.feedback.hit ? 'hit' : 'miss'}`} style={{ left: `${game.feedback.x}%`, top: `${game.feedback.y}%` }}>{game.feedback.hit ? '✦' : '×'}</span>}
        {game.cursor && <span className="observation-cursor" style={{ left: `${game.cursor.x}%`, top: `${game.cursor.y}%` }}>＋</span>}
      </div>
    </div>
    <div className="decode-actions">
      <button type="button" onClick={() => dispatch({ type: 'hint' })} aria-pressed={game.hint} disabled={progress.found}>⌕ {game.hint ? '收起提示' : '查看线索'}</button>
      <button type="button" onClick={() => dispatch({ type: 'zoom' })} aria-pressed={game.zoom}>{game.zoom ? '－ 还原画面' : '＋ 放大观察'}</button>
      <button type="button" onClick={() => dispatch({ type: 'level', index: game.level + 1 })} disabled={game.level === levels.length - 1}>下一张 →</button>
    </div>
    <p id="decode-feedback" className={`decode-feedback ${game.feedback?.hit ? 'success' : ''}`} role="status" aria-live="polite">{game.notice}</p>
    {game.hint && !progress.found && <p className="hint-copy">{level.hint}</p>}
    {game.progress.every(({ found }) => found) && <div className="all-complete">✦ 三关寻纹已完成，三个主题衣橱全部解锁。</div>}
  </div>;
}
