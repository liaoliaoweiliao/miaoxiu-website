import { useEffect, useId, useMemo, useReducer, useRef } from 'react';
import { ATLAS_RECORDS } from '../data/atlas.js';
import { BRANCHES, DISTRIBUTION_POINTS, DISTRIBUTION_SOURCES, INITIAL_DISTRIBUTION, PROVINCE_LABELS } from '../data/distribution.js';
import { PROVINCE_PATHS } from '../data/atlasGeography.js';
import { distributionPoints, distributionReducer, distributionStats, heatCells, projectPoint } from '../features/home/distributionModel.js';
import '../styles/distribution.css';

let sessionState = INITIAL_DISTRIBUTION;
const format = (number) => String(number).padStart(2, '0');
const branchFor = (point) => BRANCHES.find((branch) => branch.id === point?.branch);
const sourceFor = (id) => DISTRIBUTION_SOURCES.find((source) => source.id === id);
const heatColors = ['#b09165', '#e8b872', '#e68557', '#d54b3b'];

function Motif({ kind = 'butterfly', className = '' }) {
  return <svg className={`thread-motif ${className}`} viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 3 97 50 50 97 3 50Z M50 10 90 50 50 90 10 50Z" strokeDasharray="2 4" opacity=".55" />
      {kind === 'butterfly' ? <>
        <path d="M49 49C34 14 10 18 20 40c4 10 18 14 29 12-28 0-28 31-10 23 8-3 9-13 11-22M51 49c15-35 39-31 29-9-4 10-18 14-29 12 28 0 28 31 10 23-8-3-9-13-11-22M50 39v37M49 40l-8-9m10 9 8-9" />
        <path d="M43 47C29 29 23 30 29 39l14 8Zm14 0c14-18 20-17 14-8l-14 8Z" strokeDasharray="2 3" />
      </> : kind === 'flower' ? <>
        <path d="M50 48C27 25 49 10 50 42c1-32 23-17 0 6 23-23 38-1 6 2 32 1 17 23-6 2 23 23 1 38 0 6-1 32-23 17 0-6-23 23-38 1-6-2-32-1-17-23 6-2Z" />
        <circle cx="50" cy="50" r="7" /><circle cx="50" cy="50" r="3" />
      </> : <>
        <path d="M50 20 80 50 50 80 20 50ZM50 32 68 50 50 68 32 50ZM50 43 57 50 50 57 43 50Z M19 30l12-11m38 0 12 11m0 40L69 81m-38 0L19 70" />
        <path d="M35 27v9H26m47 0h-9v-9m0 46v-9h9m-47 0h9v9" />
      </>}
      <path d="m47 12 3 3 3-3m32 35-3 3 3 3M53 85l-3-3-3 3M15 53l3-3-3-3" />
    </g>
  </svg>;
}

function DistributionMap({ state, points, focus, dispatch }) {
  const prefix = useId().replace(/:/g, '');
  const scrollRef = useRef(null);
  const cells = useMemo(() => heatCells(points), [points]);
  const visibleIds = new Set(points.map((point) => point.id));
  const previous = DISTRIBUTION_POINTS.find((point) => point.id === state.visited.at(-2));
  const from = previous ? projectPoint(previous.coordinates) : null;
  const to = focus ? projectPoint(focus.coordinates) : null;
  const focusPosition = focus ? projectPoint(focus.coordinates) : null;

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || !focus) return;
    function centerSelection() {
      if (scroller.scrollWidth <= scroller.clientWidth) return;
      const position = projectPoint(focus.coordinates);
      const anchor = position.y < 105 ? .35 : .5;
      scroller.scrollTo({ left: position.x / 820 * scroller.scrollWidth - scroller.clientWidth * anchor, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
    centerSelection();
    const observer = new ResizeObserver(centerSelection);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [focus]);

  return <div className="thread-map-panel">
    <div className="thread-map-toolbar">
      <div><span className="thread-kicker">01 / 支系分布地图</span><h3>每一处苗乡，都值得细看</h3></div>
      <button type="button" className={`thread-heat-toggle ${state.heat ? 'on' : ''}`} aria-pressed={state.heat} onClick={() => dispatch({ type: 'heat' })}><span aria-hidden="true">◉</span> 热力显影</button>
    </div>
    <div className="thread-map-scroll" ref={scrollRef}>
      <div className="thread-map-canvas">
        <svg className="thread-map-svg" viewBox="0 0 820 460" role="img" aria-label="苗族地域支系代表分布点地图，热度表示本页收录点的集中程度">
          <defs>
            <pattern id={`${prefix}-weave`} width="12" height="12" patternUnits="userSpaceOnUse"><path d="m3 3 6 6m0-6L3 9" stroke="#b1bfd2" strokeWidth=".4" opacity=".14" /></pattern>
            <filter id={`${prefix}-soft`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" /></filter>
          </defs>
          <rect width="820" height="460" fill={`url(#${prefix}-weave)`} />
          <g className="thread-provinces">{PROVINCE_PATHS.map((province) => <path key={province.adcode} d={province.d} className={province.adcode === 520000 ? 'is-guizhou' : ''} />)}</g>
          <g className={`thread-heat-layer ${state.heat ? '' : 'is-hidden'}`} aria-hidden="true">
            <g filter={`url(#${prefix}-soft)`}>{cells.map((cell) => <rect key={`${cell.x}-${cell.y}`} x={cell.x - 6} y={cell.y - 6} width="13" height="13" fill={heatColors[cell.level]} opacity={Math.min(.66, .1 + cell.value * .17)} />)}</g>
            {cells.filter((cell) => cell.value >= .5).map((cell) => <path key={`stitch-${cell.x}-${cell.y}`} d={`M${cell.x - 2} ${cell.y - 2}l4 4m0-4-4 4`} stroke={heatColors[cell.level]} strokeWidth="1.1" opacity={Math.min(.8, cell.value * .27)} />)}
          </g>
          <g className="thread-province-labels">{PROVINCE_LABELS.map(([name, longitude, latitude]) => { const p = projectPoint([longitude, latitude]); return <text key={name} x={p.x} y={p.y}>{name}</text>; })}</g>
          <path d="M26 422h768M26 32h768" stroke="#a88b65" strokeDasharray="2 7" opacity=".32" />
          <g className="thread-compass" transform="translate(768 47)"><path d="M0 20V0m-5 7 5-7 5 7" /><text y="-10" textAnchor="middle">N</text></g>
          <g className="thread-inset-motif" transform="translate(40 300)"><path d="m32 0 32 32-32 32L0 32Zm0 12 20 20-20 20-20-20Z" /><path d="M32 20v24M20 32h24" /></g>
          {from && to && state.run > 0 && state.visited.at(-1) === focus?.id && <path key={state.run} className="thread-travel-line" d={`M${from.x} ${from.y}Q${(from.x + to.x) / 2} ${Math.min(from.y, to.y) - 55} ${to.x} ${to.y}`} pathLength="1" />}
        </svg>
        <div className="thread-map-nodes">{DISTRIBUTION_POINTS.map((point) => {
          const position = projectPoint(point.coordinates);
          const selected = point.id === state.selected;
          const visible = visibleIds.has(point.id);
          const visited = state.visited.includes(point.id);
          const near = !selected && focusPosition && Math.hypot(position.x - focusPosition.x, position.y - focusPosition.y) < 45;
          const label = selected || (!near && ['weining', 'junlian', 'malipo', 'huayuan', 'rongshui'].includes(point.id));
          return <button key={point.id} type="button" className={`thread-map-point ${selected ? 'is-selected' : ''} ${visited ? 'is-visited' : ''} ${visible ? '' : 'is-muted'} ${label ? 'has-label' : ''} ${position.y > 400 ? 'is-south' : ''} ${position.y < 105 ? 'is-north' : ''} ${near ? 'is-near-selection' : ''}`} style={{ left: `${position.x / 820 * 100}%`, top: `${position.y / 460 * 100}%` }} disabled={!visible} aria-label={`探访${point.name}，${point.province}，${branchFor(point).name}`} aria-pressed={selected} title={`${point.name} · ${point.province}`} onClick={() => dispatch({ type: 'point', value: point.id })}>
            {selected ? <svg className="thread-selected-pin" viewBox="0 0 36 46" aria-hidden="true"><path d="M18 2 32 11v14L18 44 4 25V11Z" fill="#aa362d" stroke="#ffe0a6" strokeWidth="2" /><path d="m18 10 9 9-9 9-9-9Z" fill="none" stroke="#f7d5a0" strokeWidth="1.3" /><path d="m18 15 4 4-4 4-4-4Z" fill="#ffe7be" /></svg> : <span className="thread-pin-core" />}
            <span className="thread-point-label">{selected && <small>已选中</small>}{point.name}</span>
          </button>;
        })}</div>
        <div className="thread-map-caption"><span>西南与武陵山区</span><small>省级轮廓作定位 · 县级中心作示意</small></div>
        {focus && <div className="thread-map-peek"><span>当前选择 · {branchFor(focus).name}</span><strong>{focus.name}<small>{focus.province} · {focus.zone}</small></strong></div>}
      </div>
    </div>
    <div className="thread-map-legend"><span><i className="thread-legend-dot" /> 已收录分布点</span><div className={state.heat ? '' : 'is-dim'}><span>收录点集中程度</span><i className="thread-heat-ramp" /><span>疏 → 密</span></div><small className="thread-pan-hint">左右滑动地图，或从下方选择地点</small></div>
    <div className="thread-map-controls">
      <label><span>选择地点</span><select aria-label="选择苗乡地点" value={state.selected || ''} onChange={(event) => dispatch({ type: 'point', value: event.target.value })}>{points.map((point) => <option key={point.id} value={point.id}>{point.province} · {point.name}</option>)}</select></label>
      <button type="button" className="thread-wander" onClick={() => dispatch({ type: 'wander', sample: Math.random() })}><span aria-hidden="true">✧</span> 随机探索一个地点 <span aria-hidden="true">↗</span></button>
    </div>
    <div className="thread-exploration"><div className="thread-progress" aria-hidden="true"><i style={{ width: `${state.visited.length / DISTRIBUTION_POINTS.length * 100}%` }} /></div><span aria-live="polite">{state.visited.length === DISTRIBUTION_POINTS.length ? '已探索全部20个地点，可切换支系继续查看。' : `已探索 ${format(state.visited.length)} / ${DISTRIBUTION_POINTS.length} 个地点`}</span></div>
  </div>;
}

function CoreDashboard({ state, points, stats, focus, dispatch }) {
  const metrics = [
    ['branches', stats.branches, '地域导览分区', '个'], ['points', stats.points, '已收录分布点', '处'],
    ['provinces', stats.provinces, '涉及省级地区', '个'], ['archives', stats.archives.length, '关联非遗档案', '条'],
  ];
  const provinceCounts = [...new Set(DISTRIBUTION_POINTS.filter((point) => state.branch === 'all' || point.branch === state.branch).map((point) => point.province))].map((name) => ({ name, count: DISTRIBUTION_POINTS.filter((point) => point.province === name && (state.branch === 'all' || point.branch === state.branch)).length })).sort((a, b) => b.count - a.count);
  const maximum = Math.max(...provinceCounts.map((province) => province.count), 1);
  const activeBranch = branchFor(focus);
  const related = ATLAS_RECORDS.find((record) => record.id === focus?.archive);
  const metric = state.metric;
  const list = metric === 'branches' ? BRANCHES.filter((branch) => points.some((point) => point.branch === branch.id)).map((branch) => branch.full) : metric === 'provinces' ? [...new Set(points.map((point) => point.province))] : metric === 'archives' ? stats.archives.map((record) => `${record.name} · ${record.year}`) : points.map((point) => `${point.province} · ${point.name}`);
  return <aside className="thread-dashboard" aria-label="核心数据看板">
    <div className="thread-dashboard-heading"><div><span className="thread-kicker">02 / 核心数据看板</span><h3>{state.province !== 'all' ? `${state.province} · 收录概览` : state.branch === 'all' ? '一眼看见苗乡' : `${BRANCHES.find((branch) => branch.id === state.branch).name} · 分布概览`}</h3></div><button type="button" className="thread-reset" onClick={() => dispatch({ type: 'reset' })}>看全部 ↺</button></div>
    <div className="thread-stat-grid" aria-live="polite">{metrics.map(([id, value, label, unit]) => <button type="button" key={id} className={`thread-stat ${metric === id ? 'is-active' : ''}`} data-stat={id} aria-label={`查看${label}清单，共${value}${unit}`} aria-expanded={metric === id} onClick={() => dispatch({ type: 'metric', value: id })}><span>{label}<i aria-hidden="true">↗</i></span><strong key={value}>{format(value)}<small>{unit}</small></strong></button>)}</div>
    {metric && <section className="thread-metric-list" aria-label="数据对应清单"><div><strong>{metrics.find(([id]) => id === metric)?.[2]}</strong><button type="button" aria-label="收起数据清单" onClick={() => dispatch({ type: 'metric', value: metric })}>×</button></div><p>{list.length ? list.join('　/　') : '当前筛选暂无关联国家级档案。'}</p></section>}
    <div className="thread-chart"><div className="thread-chart-title"><strong>分区内各省收录</strong><small>点击省份筛选</small></div>{provinceCounts.map((province) => <button type="button" key={province.name} className={`thread-province-bar ${state.province === province.name ? 'is-active' : ''}`} aria-label={`筛选${province.name}，${province.count}处分布点`} aria-pressed={state.province === province.name} onClick={() => dispatch({ type: 'province', value: province.name })}><span>{province.name}</span><i><b style={{ width: `${province.count / maximum * 100}%` }} /></i><small>{province.count} 处</small></button>)}</div>
    {focus && <article className="thread-place-card" key={focus.id} aria-live="polite" style={{ '--branch-color': activeBranch.color }}>
      <div className="thread-place-header"><Motif kind={activeBranch.motif} /><div><span>{activeBranch.full}</span><h4>{focus.name}<small>{focus.province} · {focus.zone}</small></h4></div><span className="thread-place-stamp">当前选择</span></div>
      <p>{focus.description}</p>
      <div className="thread-place-links"><a href={sourceFor(focus.source).url} target="_blank" rel="noopener noreferrer">阅读地域资料 ↗</a>{related && <a href={related.source} target="_blank" rel="noopener noreferrer">{related.year} · 非遗档案 ↗</a>}</div>
    </article>}
    <p className="thread-data-note">数字统计本页收录资料。热度反映收录点集中程度，不代表人口密度；未收录地区不表示没有苗族分布。</p>
  </aside>;
}

export default function AtlasPage() {
  const [state, dispatch] = useReducer(distributionReducer, undefined, () => sessionState);
  useEffect(() => { sessionState = state; }, [state]);
  const points = useMemo(() => distributionPoints(state), [state.branch, state.province]);
  const stats = distributionStats(points);
  const focus = points.find((point) => point.id === state.selected);

  return <section id="miaoxiu-atlas" className="thread-atlas" aria-labelledby="thread-atlas-title">
    <div className="thread-top-border" aria-hidden="true" />
    <header className="thread-section-heading"><div><span className="thread-kicker">一针一地 · 苗绣文化地图</span><h2 id="thread-atlas-title">苗绣支系分布<span>循山川，识绣色</span></h2><p>让山川成为绣布，循着一处处苗乡，认识不同支系的服饰与苗绣。</p></div><div className="thread-heading-art" aria-hidden="true"><Motif kind="diamond" /><Motif /><Motif kind="flower" /></div></header>
    <div className="thread-filter-row"><div className="thread-branch-tabs" role="group" aria-label="选择地域支系"><button type="button" className={state.branch === 'all' ? 'is-active' : ''} aria-pressed={state.branch === 'all'} onClick={() => dispatch({ type: 'branch', value: 'all' })}><span className="thread-all-icon" aria-hidden="true">✳</span><span>全部支系<small>一幅绣卷</small></span></button>{BRANCHES.map((branch) => <button type="button" key={branch.id} className={state.branch === branch.id ? 'is-active' : ''} style={{ '--branch-color': branch.color }} aria-pressed={state.branch === branch.id} onClick={() => dispatch({ type: 'branch', value: branch.id })}><Motif kind={branch.motif} /><span>{branch.name}<small>{branch.subtitle.split(' · ')[0]}</small></span></button>)}</div><span className="thread-filter-hint">切换支系，查看分布与数据 <i aria-hidden="true">↙</i></span></div>
    <div className="thread-workspace"><DistributionMap state={state} points={points} focus={focus} dispatch={dispatch} /><CoreDashboard state={state} points={points} stats={stats} focus={focus} dispatch={dispatch} /></div>
    <div className="thread-bottom-border" aria-hidden="true" />
  </section>;
}
