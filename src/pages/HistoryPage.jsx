import { useEffect, useReducer, useRef, useState } from 'react';
import { assetUrl } from '../utils/assets.js';
import { stories, motifGroups } from '../data/history.js';
import StoryReader from '../features/history/StoryReader.jsx';
import StoryBook from '../features/history/StoryBook.jsx';
import StitchExplorer from '../features/history/StitchExplorer.jsx';
import ColorLab from '../features/history/ColorLab.jsx';
import { historyReducer, initialHistoryState } from '../features/history/historyModel.js';

// Keep choices while moving between pages, matching the original single-page state.
let sessionHistoryState = initialHistoryState;

function Heading({ title, children, first = false }) {
  const Tag = first ? 'h1' : 'h2';
  return <header className={`history-heading ${first ? '' : 'compact'}`}><div><span className="history-mark" aria-hidden="true">{first ? '✦' : '✧'}</span><div><Tag>{title}</Tag><p>{children}</p></div></div><span className="heading-line" aria-hidden="true" /></header>;
}

function StoryCard({ item, index, onOpen }) {
  return <article className={`story-card story-card-${index + 1}`}>
    <button type="button" className="story-image" onClick={onOpen} aria-label={`阅读故事《${item.title}》`}><img src={assetUrl(item.image)} alt={item.title} /></button>
    <div className="story-copy"><h3>{item.title}</h3><p>{item.description}</p><button type="button" className="story-more" onClick={onOpen}>{item.label}</button></div>
  </article>;
}

function MotifArt({ item }) {
  const [lens, setLens] = useState(null);
  const base = useRef(null);
  const detail = useRef(null);
  function move(event) {
    if (event.pointerType === 'touch' || !base.current.naturalWidth) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left)), y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    const padding = parseFloat(window.getComputedStyle(base.current).paddingLeft) || 0;
    const scale = Math.min((rect.width - padding * 2) / base.current.naturalWidth, (rect.height - padding * 2) / base.current.naturalHeight);
    const width = base.current.naturalWidth * scale, height = base.current.naturalHeight * scale;
    const lensStyle = window.getComputedStyle(detail.current);
    const halfWidth = parseFloat(lensStyle.width) / 2 - parseFloat(lensStyle.borderLeftWidth), halfHeight = parseFloat(lensStyle.height) / 2 - parseFloat(lensStyle.borderTopWidth);
    setLens({ left: x, top: y, '--zoom-detail-width': `${width * 3}px`, '--zoom-detail-height': `${height * 3}px`, '--zoom-detail-left': `${halfWidth - (x - (rect.width - width) / 2) * 3}px`, '--zoom-detail-top': `${halfHeight - (y - (rect.height - height) / 2) * 3}px` });
  }
  return <div className={`motif-art ${lens ? 'is-zooming' : ''}`} data-magnifier onPointerEnter={move} onPointerMove={move} onPointerLeave={() => setLens(null)}>
    <img ref={base} className="motif-base-image" src={assetUrl(item.image)} alt={item.alt} /><div className="motif-art-shade" /><div className="motif-art-copy"><h3>{item.name}</h3><p style={{ whiteSpace: 'pre-line' }}>{item.desc}</p></div><span ref={detail} className={`motif-magnifier ${lens ? 'is-visible' : ''}`} style={lens || undefined} aria-hidden="true"><img className="motif-zoom-image" src={assetUrl(item.image)} alt="" draggable={false} /></span>
  </div>;
}


export default function HistoryPage({ state: appState = {} }) {
  const [state, dispatch] = useReducer(historyReducer, undefined, () => ({ ...sessionHistoryState, playing: false }));
  useEffect(() => { sessionHistoryState = state; }, [state]);
  const [story, setStory] = useState(null);
  const handledSearch = useRef(null);
  const positionedSearch = useRef(null);
  useEffect(() => {
    const target = appState.searchTarget;
    if (!target || target.page !== 'history' || handledSearch.current === target.revision) return;
    handledSearch.current = target.revision;
    const section = document.getElementById(target.section);
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    if (target.kind === 'story') {
      section?.querySelectorAll('.story-image')[target.index]?.focus({ preventScroll: true });
      section?.scrollIntoView({ block: 'start', behavior });
      setStory({ index: target.index, mode: 'book' });
      return undefined;
    }
    setStory(null);
    if (target.kind === 'stitch') dispatch({ type: 'stitch', index: target.index });
    if (target.kind === 'motif') {
      dispatch({ type: 'group', group: target.group });
      dispatch({ type: 'motif', index: target.index });
    }
  }, [appState.searchTarget]);
  useEffect(() => {
    const target = appState.searchTarget;
    if (!target || target.page !== 'history' || target.kind === 'story' || positionedSearch.current === target.revision) return undefined;
    // Focus after the chosen group/technique is rendered, including in StrictMode.
    if (target.kind === 'stitch' && state.stitch !== target.index
      || target.kind === 'motif' && (state.group !== target.group || state.motif !== target.index)) return undefined;
    const section = document.getElementById(target.section);
    const frame = window.requestAnimationFrame(() => {
      positionedSearch.current = target.revision;
      const focus = target.kind === 'stitch' ? section?.querySelectorAll('.stitch-item')[target.index]
        : target.kind === 'motif' ? section?.querySelectorAll('.motif-menu-item')[target.index] : section;
      focus?.focus({ preventScroll: true });
      section?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [appState.searchTarget, state.group, state.motif, state.stitch]);
  const group = motifGroups[state.group], item = group.items[state.motif];
  return <main className="history-page">
    <section id="history-stories" data-search-section tabIndex={-1} className="history-story container"><Heading title="苗族小故事" first>在绣线之间，听见代代相传的声音</Heading><div className="story-grid">{stories.map((entry, index) => <StoryCard key={entry.title} item={entry} index={index} onOpen={() => setStory({ index, mode: 'book' })} />)}</div></section>
    <section id="history-patterns" data-search-section tabIndex={-1} className="history-pattern container"><Heading title="纹样图案">一纹一世界，图案里的自然与信仰</Heading>
      <div className="motif-explorer"><aside className="motif-menu" aria-label="纹样分类">{Object.entries(motifGroups).map(([key, entry]) => <div key={key} className={`motif-menu-section ${state.group === key ? 'is-open' : ''}`}><button type="button" className={`motif-group-title ${state.group === key ? 'is-open' : ''}`} onClick={() => dispatch({ type: 'group', group: key })} aria-expanded={state.group === key}><span>{entry.icon}</span>{entry.title} <b>{state.group === key ? '⌃' : '›'}</b></button>{state.group === key && entry.items.map((motif, index) => <button key={motif.name} type="button" className={`motif-menu-item ${index === state.motif ? 'is-active' : ''}`} onClick={() => dispatch({ type: 'motif', index })} aria-label={`查看${motif.name}`} aria-pressed={index === state.motif}><span className="motif-glyph">{motif.icon}</span><strong>{motif.name}</strong><span className="motif-arrow">›</span></button>)}</div>)}</aside>
        <div className="motif-feature"><button type="button" className="motif-arrow-btn prev" onClick={() => dispatch({ type: 'motifMove', direction: -1 })} aria-label="上一个纹样"><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m13 3-6 7 6 7" /></svg></button><MotifArt key={item.name} item={item} /><button type="button" className="motif-arrow-btn next" onClick={() => dispatch({ type: 'motifMove', direction: 1 })} aria-label="下一个纹样"><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m7 3 6 7-6 7" /></svg></button></div>
      </div>
    </section>
    <section id="history-stitches" data-search-section tabIndex={-1} className="history-stitches container"><Heading title="六大针法">一针一线，传承千年的匠心</Heading><StitchExplorer state={state} dispatch={dispatch} /></section>
    <section id="history-colors" data-search-section tabIndex={-1} className="history-colors container"><Heading title="色彩解析">一色一山河，传统色里的民族审美</Heading><ColorLab state={state} dispatch={dispatch} /></section>
    {story !== null && (story.mode === 'book'
      ? <StoryBook key={story.index} item={stories[story.index]} onClose={() => setStory(null)} onRead={() => setStory({ ...story, mode: 'text' })} />
      : <StoryReader key={story.index} index={story.index} item={stories[story.index]} onClose={() => setStory(null)} />)}
  </main>;
}
