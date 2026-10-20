import { useEffect, useReducer, useRef, useState } from 'react';
import { assetUrl } from '../utils/assets.js';
import { stories, motifGroups, stitches, colorChoices, colorMotifs, colorExamples } from '../data/history.js';
import StoryReader from '../features/history/StoryReader.jsx';
import { appliedColors, historyReducer, initialHistoryState, motifColorImage, stitchMotionPath } from '../features/history/historyModel.js';

// Keep choices while moving between pages, matching the original single-page state.
let sessionHistoryState = initialHistoryState;

function Heading({ title, children, first = false }) {
  const Tag = first ? 'h1' : 'h2';
  return <header className={`history-heading ${first ? '' : 'compact'}`}><div><span className="history-mark" aria-hidden="true">{first ? '✦' : '✧'}</span><div><Tag>{title}</Tag><p>{children}</p></div></div><span className="heading-line" aria-hidden="true" /></header>;
}

function StoryCard({ item, index, onOpen }) {
  const [glow, setGlow] = useState({});
  const card = useRef(null);
  function move(event) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = card.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width, y = (event.clientY - rect.top) / rect.height;
    setGlow({ '--story-tilt-x': `${(-(y - 0.5) * 5).toFixed(2)}deg`, '--story-tilt-y': `${((x - 0.5) * 6).toFixed(2)}deg`, '--story-glow-x': `${x * 100}%`, '--story-glow-y': `${y * 100}%` });
  }
  return <article ref={card} className={`story-card story-card-${index + 1}`} data-story-card={index} style={glow}>
    <button type="button" className="story-image" onPointerMove={move} onPointerLeave={() => setGlow({})} onClick={onOpen} aria-label={`阅读故事《${item.title}》`}><img src={assetUrl(item.image)} alt={item.title} /><span className="story-play" aria-hidden="true">▷</span><span className="story-glint" aria-hidden="true" /></button>
    <div className="story-copy"><h3>{item.title}</h3><p>{item.description}</p><button type="button" className="story-more" onClick={onOpen}>{item.label}<span className="story-more-count">共 {item.pages.length} 节</span></button></div>
  </article>;
}

function MotifArt({ item }) {
  const [lens, setLens] = useState(null);
  function move(event) {
    if (event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left)), y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    setLens({ left: x, top: y, backgroundImage: `url("${assetUrl(item.image)}")`, backgroundSize: '280% 280%', backgroundPosition: `${x / rect.width * 100}% ${y / rect.height * 100}%` });
  }
  return <div className="motif-art" data-magnifier onPointerEnter={move} onPointerMove={move} onPointerLeave={() => setLens(null)}>
    <img className="motif-base-image" src={assetUrl(item.image)} alt={item.alt} /><div className="motif-art-shade" /><div className="motif-art-copy"><h3>{item.name}</h3><p style={{ whiteSpace: 'pre-line' }}>{item.desc}</p></div><span className={`motif-magnifier ${lens ? 'is-visible' : ''}`} style={lens || undefined} aria-hidden="true" />
  </div>;
}

function StitchMotion({ item }) {
  const path = stitchMotionPath([[8, 76], item.hotspots[0], ...item.knots, item.hotspots[1], [88, 55]]);
  return <svg className="stitch-motion" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <path className="stitch-action-thread" d={path} />
    <g className="stitch-needle-group"><path className="stitch-needle-shaft" d="M-3-5L3 5" /><path className="stitch-needle-eye" d="M-1.4-2.4L1.4 2.4" /><circle className="stitch-needle-tip" cx="3" cy="5" r="1.15" /><animateMotion dur="4.6s" begin="0s" fill="freeze" rotate="auto" path={path} /></g>
    <g className="stitch-knot-layer">{item.knots.map(([x, y], index) => <g key={index} transform={`translate(${x} ${y})`}><g className="stitch-knot" style={{ '--knot-delay': `${index * 180}ms` }}><circle className="stitch-knot-loop" r="3.5" /><circle r="2.2" /><path d="M-2.4-1.2C-.8-3.6 2.2-3.2 2.7-.7C3.2 1.7.1 3.2-2 1.6C-3.2.7-3.1-.2-2.4-1.2Z" /></g></g>)}</g>
    <circle className="stitch-needle-anchor" cx="88" cy="55" r="1.9" />
  </svg>;
}

function StitchExplorer({ state, dispatch }) {
  const item = stitches[state.stitch], complete = !state.playing && state.step === 3;
  useEffect(() => {
    if (!state.playing) return undefined;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 5600;
    const timer = window.setTimeout(() => dispatch({ type: 'stitchComplete', run: state.run }), duration);
    return () => window.clearTimeout(timer);
  }, [state.playing, state.run, dispatch]);
  return <div className="stitch-explorer">
    <div className={`stitch-board ${state.playing ? 'is-running' : ''}`} role="group" aria-label={`${item.name}绣制过程动画`}>
      <div className={`stitch-stage ${state.playing ? 'is-playing' : 'is-idle'} ${complete ? 'is-complete' : ''}`}>
        <span className="stitch-fabric" aria-hidden="true" /><img className="stitch-process-image" src={assetUrl(item.finish)} alt={`${item.name}绣制过程`} /><img className={`stitch-finish-image ${complete ? 'is-final' : 'is-idle'}`} src={assetUrl(item.finish)} alt={`${item.name}完成后的成品效果`} />
        {state.playing && <StitchMotion key={state.run} item={item} />}<span className="stitch-finish-flash" aria-hidden="true" />
      </div>
    </div>
    <div className="stitch-list">{stitches.map((stitch, index) => <button key={stitch.name} type="button" className={`stitch-item stitch-${index + 1} ${index === state.stitch ? 'is-selected' : ''}`} onClick={() => dispatch({ type: 'stitch', index })} aria-pressed={index === state.stitch}><span className="stitch-swatch"><img src={assetUrl(stitch.thumb)} alt={`${stitch.name}针法缩略图`} /></span><span><strong>{stitch.name}</strong><small>{stitch.desc}</small></span><b>›</b></button>)}</div>
  </div>;
}

function ColorLab({ state, dispatch }) {
  const motif = colorMotifs[state.colorMotif], picked = state.colors, applied = appliedColors(picked);
  const rightColor = colorChoices[state.color >= 0 ? state.color : (picked.at(-1) ?? 0)];
  return <>
    <div className="color-lab">
      <article className="color-lab-panel motif-picker-panel"><h3>✥　选择纹样</h3>
        <div className="color-motif-tabs">{colorMotifs.map((item, index) => <button key={item.key} type="button" className={`color-motif-tab ${index === state.colorMotif ? 'is-active' : ''}`} aria-pressed={index === state.colorMotif} onClick={() => dispatch({ type: 'colorMotif', index })}>{item.name}</button>)}</div>
        <button type="button" className={`color-motif-art ${applied.length ? 'has-color' : ''}`} onClick={() => dispatch({ type: 'colorMotif', index: (state.colorMotif + 1) % colorMotifs.length })} aria-label="切换纹样"><img src={assetUrl(motifColorImage(motif, applied))} alt={`${motif.name}${applied.length ? '三色配色效果' : '线稿'}`} /><span>{motif.desc}</span></button>
        <div className="palette-readout" aria-live="polite"><b>{picked.length ? `已选择 ${picked.length}/3 种颜色` : '未上色线稿'}</b><div>{applied.length ? applied.map((index) => <span key={index} className={`palette-chip ${picked.includes(index) ? 'is-picked' : 'is-auto'}`}><i style={{ background: colorChoices[index].color }} />{colorChoices[index].name}{!picked.includes(index) && <small>补色</small>}</span>) : <span className="palette-empty">请选择三种颜色，组合成一幅苗绣配色</span>}</div></div>
      </article>
      <article className="color-lab-panel color-picker-panel"><h3>✥　点击上色</h3><p className="color-action-hint">连续点击色卡选择三种颜色；再次点击可取消，左侧纹样会同步更新。</p>
        <div className="color-swatch-grid">{colorChoices.map((item, index) => <button key={item.name} type="button" className={`color-swatch ${picked.includes(index) ? 'is-active' : ''}`} style={{ '--swatch': item.color }} aria-label={`选择${item.name}`} aria-pressed={picked.includes(index)} onClick={() => dispatch({ type: 'color', index })}><span style={{ backgroundImage: `url("${assetUrl(item.swatch)}")` }} /><b>{item.name}</b><small>{picked.includes(index) ? `第 ${picked.indexOf(index) + 1} 色` : '点击选择'}</small></button>)}</div>
        <div className="color-selection-tools"><span>已选 {picked.length}/3</span><button type="button" onClick={() => dispatch({ type: 'colorReset' })}>清空选择</button></div>
        <div className="color-example-row">{colorExamples.map(([name, image], index) => <button key={name} type="button" className={`color-example ${index === state.colorExample ? 'is-active' : ''}`} aria-pressed={index === state.colorExample} onClick={() => dispatch({ type: 'example', index })}><img src={assetUrl(image)} alt={name} /><span>{name}</span></button>)}</div>
      </article>
      <article className="color-lab-panel color-meaning-panel"><h3>✥　色彩寓意</h3><div className="meaning-art"><img src={assetUrl(rightColor.image)} alt={`${rightColor.name}绣线肌理特写`} /></div><div className="meaning-copy"><span className="meaning-dot" style={{ background: rightColor.color }} /><strong>{rightColor.name}</strong><p>{rightColor.meaning}</p></div><img className="meaning-bottom-art" src={assetUrl(colorExamples[state.colorExample][1])} alt="配色纹样" /></article>
    </div>
    <button type="button" className={`color-challenge ${state.challenge ? 'is-active' : ''}`} aria-pressed={state.challenge} onClick={() => dispatch({ type: 'challenge' })}><span aria-hidden="true">🦋</span> 配色挑战：为纹样选择三种主色 <span aria-hidden="true">🦋</span>{state.challenge && <b> {picked.length === 3 ? '三色配色已完成' : '已开启'}</b>}</button>
  </>;
}

export default function HistoryPage({ onNavigate }) {
  const [state, dispatch] = useReducer(historyReducer, undefined, () => ({ ...sessionHistoryState, playing: false }));
  useEffect(() => { sessionHistoryState = state; }, [state]);
  const [story, setStory] = useState(null);
  const group = motifGroups[state.group], item = group.items[state.motif];
  return <main className="history-page">
    <section className="history-story container"><Heading title="苗族小故事" first>在绣线之间，听见代代相传的声音</Heading><div className="story-grid">{stories.map((entry, index) => <StoryCard key={entry.title} item={entry} index={index} onOpen={() => setStory(index)} />)}</div></section>
    <section className="history-pattern container"><Heading title="纹样图案">一纹一世界，图案里的自然与信仰</Heading>
      <div className="motif-explorer"><aside className="motif-menu" aria-label="纹样分类">{Object.entries(motifGroups).map(([key, entry]) => <div key={key} className={`motif-menu-section ${state.group === key ? 'is-open' : ''}`}><button type="button" className={`motif-group-title ${state.group === key ? 'is-open' : ''}`} onClick={() => dispatch({ type: 'group', group: key })} aria-expanded={state.group === key}><span>{entry.icon}</span>{entry.title} <b>{state.group === key ? '⌃' : '›'}</b></button>{state.group === key && entry.items.map((motif, index) => <button key={motif.name} type="button" className={`motif-menu-item ${index === state.motif ? 'is-active' : ''}`} onClick={() => dispatch({ type: 'motif', index })} aria-label={`查看${motif.name}`} aria-pressed={index === state.motif}><span className="motif-glyph">{motif.icon}</span><strong>{motif.name}</strong><span className="motif-arrow">›</span></button>)}</div>)}</aside>
        <div className="motif-feature"><button type="button" className="motif-arrow-btn prev" onClick={() => dispatch({ type: 'motifMove', direction: -1 })} aria-label="上一个纹样">‹</button><MotifArt key={item.name} item={item} /><button type="button" className="motif-arrow-btn next" onClick={() => dispatch({ type: 'motifMove', direction: 1 })} aria-label="下一个纹样">›</button></div>
      </div>
    </section>
    <section className="history-stitches container"><Heading title="六大针法">一针一线，传承千年的匠心</Heading><StitchExplorer state={state} dispatch={dispatch} /></section>
    <section className="history-colors container"><Heading title="色彩解析">一色一山河，传统色里的民族审美</Heading><ColorLab state={state} dispatch={dispatch} /></section>
    <section className="history-closing"><div className="closing-mountain" aria-hidden="true" /><div className="closing-copy"><h2>— 走进苗绣，遇见千年的文化之美 —</h2><p>每一针，都是时间的痕迹；每一色，都是民族的记忆。</p><button type="button" className="closing-button" onClick={() => onNavigate('experience')}>继续探索苗绣　→</button></div></section>
    {story !== null && <StoryReader key={story} index={story} item={stories[story]} onClose={() => setStory(null)} />}
  </main>;
}
