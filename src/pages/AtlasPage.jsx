import { useEffect, useId, useReducer } from 'react';
import { ATLAS_RECORDS, initialAtlasState, TIMES, REGIONS } from '../data/atlas.js';
import { atlasAllowed, atlasReducer, filteredAtlas } from '../features/history/atlasModel.js';
import '../styles/atlas.css';

let sessionAtlasState = initialAtlasState;

function Flower() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M16 15C8 3 2 8 10 16 0 14 1 24 13 19 8 30 20 32 17 20 24 30 32 24 19 17 30 13 27 3 17 15Z" /><circle cx="16" cy="17" r="2.4" fill="currentColor" stroke="none" /></g></svg>;
}
function AbstractField() {
  const prefix = useId().replace(/:/g, '');
  return <svg className="atlas-field-svg" viewBox="0 0 680 390" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><radialGradient id={`${prefix}-cloth`}><stop stopColor="#174b58" stopOpacity=".58" /><stop offset="1" stopColor="#071d31" stopOpacity="0" /></radialGradient><pattern id={`${prefix}-weave`} width="17" height="17" patternUnits="userSpaceOnUse"><path d="M0 0L17 17M17 0L0 17" stroke="#ad9a79" strokeWidth=".3" opacity=".18" /></pattern></defs>
    <rect width="680" height="390" fill={`url(#${prefix}-weave)`} /><circle cx="316" cy="196" r="190" fill={`url(#${prefix}-cloth)`} /><circle cx="316" cy="196" r="168" fill="none" stroke="#b58b5d" strokeOpacity=".37" strokeWidth="1" /><circle cx="316" cy="196" r="176" fill="none" stroke="#b58b5d" strokeOpacity=".22" strokeDasharray="2 8" />
    <path d="M21 258Q112 186 174 227T322 213T510 146T691 168 M-25 300Q91 216 174 282T334 260T502 195T699 199 M-25 340Q90 260 169 320T337 309T509 253T703 246 M16 96Q91 62 151 107T282 91T455 67T668 104" fill="none" stroke="#77969c" strokeOpacity=".18" strokeWidth="1.1" /><path d="M74 25L74 365 M170 25L170 365 M266 25L266 365 M362 25L362 365 M458 25L458 365 M554 25L554 365 M24 83H660 M24 164H660 M24 245H660 M24 326H660" stroke="#9aa7a9" strokeOpacity=".12" strokeDasharray="3 7" /><g fill="#d4b084" opacity=".45"><path d="M54 45h9m-4.5-4.5v9 M610 336h9m-4.5-4.5v9" stroke="#d4b084" /></g>
  </svg>;
}

function RecordCard({ record }) {
  return <div className={`atlas-record ${record ? 'is-filled' : ''}`} aria-live="polite">{record ? <><div className="atlas-record-top"><span>所选地域 / {record.province} · {record.zone}</span><span>321 · Ⅶ-22</span></div><h3>{record.name} <small>{record.full}</small></h3><div className="atlas-record-rows"><span>申报地区或单位</span><b>{record.place}</b><span>公布批次</span><b>{record.year} · {record.batch}</b><span>项目类型</span><b>{record.type}</b></div><a className="atlas-official-link" href={record.source} target="_blank" rel="noopener noreferrer">核对该地官方项目档案 ↗</a></> : <div className="atlas-record-placeholder"><span className="atlas-record-emblem">✳</span><strong>选一处地域，读一份档案</strong><small>点击地图光点或统计条，查看所选地域及关联数据。</small></div>}</div>;
}

export default function AtlasPage() {
  const [state, dispatch] = useReducer(atlasReducer, undefined, () => sessionAtlasState);
  useEffect(() => { sessionAtlasState = state; }, [state]);
  const items = filteredAtlas(state), local = state.view === 'guizhou';
  const focus = ATLAS_RECORDS.find((record) => record.id === state.selected && atlasAllowed(record, state));
  const added = items.filter((record) => record.type === '新增项目').length;
  const provinces = new Set(items.map((record) => record.province)).size;
  const gz = items.filter((record) => record.province === '贵州').length, hn = items.length - gz;
  const latest = state.year === 'all' ? 2021 : Number(state.year);
  const time = TIMES.find((entry) => entry.year === latest) || TIMES.at(-1);
  const newlyAdded = state.year === 'all' ? 2 : ATLAS_RECORDS.filter((record) => record.year === latest).length;
  const act = (type, value) => dispatch({ type, value });
  return <section className="atlas-section" id="miaoxiu-atlas" aria-label="苗绣文化地域分布和国家级非遗数据看板">
    <div className="atlas-heading"><div className="atlas-heading-left"><span className="atlas-chapter"><i /> DATA CHAPTER / 02 <i /></span><h2>苗绣经纬 <span>·</span> 一针一地</h2><p>让每一处落针，都有出处。循着地域坐标，看见国家级苗绣非遗的收录图景。</p></div><div className="atlas-heading-seal"><Flower /><span>国家级非遗<br />Ⅶ-22</span></div></div>
    <div className="atlas-topline"><div><span className="atlas-topline-label">本页数据范围</span><strong>1 个国家级项目编号 <i>／</i> 7 条申报地域记录</strong></div><div className="atlas-topline-side">官方名录整理　·　截至 2026.10 核验 <span>✧</span> 全部数据可溯源</div></div>
    <div className="atlas-workspace"><div className="atlas-visual">
      <div className="atlas-panel-header"><div><span className="atlas-panel-index">01 / SPATIAL EXPLORER</span><h3>把苗绣，绣在地域之间</h3></div><div className="atlas-visual-actions"><button type="button" onClick={() => act('view', 'all')} className={local ? '' : 'on'} aria-pressed={!local}>区域总览</button><button type="button" onClick={() => act('view', 'guizhou')} className={local ? 'on' : ''} aria-pressed={local}>贵州局部</button></div></div>
      <div className="atlas-field"><AbstractField /><span className="atlas-needle-decor" aria-hidden="true">✦</span>{local ? <div className="atlas-local-view"><div className="atlas-map-whisper">贵州省内六个申报地的相对方位示意 · 非行政区划底图</div>{ATLAS_RECORDS.filter((record) => record.province === '贵州').map((record) => <button key={record.id} className={`atlas-node ${atlasAllowed(record, state) ? '' : 'is-muted'} ${state.selected === record.id ? 'is-selected' : ''}`} style={{ left: `${record.x}%`, top: `${record.y}%` }} type="button" onClick={() => act('point', record.id)} aria-label={`查看${record.name}，${record.year}年，${atlasAllowed(record, state) ? '当前筛选内' : '当前筛选外'}`} disabled={!atlasAllowed(record, state)}><span className="atlas-node-dot" /><strong>{record.name}</strong><small>{record.year}</small></button>)}<span className="atlas-compass">N ↑</span></div> : <div className="atlas-overview"><div className="atlas-map-whisper">地理方位示意 · 节点光晕仅代表本页收录数量</div><button type="button" className={`atlas-cluster atlas-cluster-gz ${gz ? '' : 'is-muted'}`} onClick={() => act('province', '贵州')} aria-label={`查看贵州地域记录，共${gz}处`}><span className="atlas-radiate" /><span className="atlas-cluster-icon"><Flower /></span><strong>贵州</strong><small><b>{gz}</b> 处记录 · 查看局部</small></button><button type="button" className={`atlas-cluster atlas-cluster-hn ${hn ? '' : 'is-muted'}`} onClick={() => act('province', '湖南')} aria-label={`查看湖南湘西记录，共${hn}处`}><span className="atlas-radiate" /><span className="atlas-cluster-icon">✧</span><strong>湖南 · 湘西</strong><small><b>{hn}</b> 处记录</small></button><div className="atlas-spatial-cue">西 <span>─────────</span> 东</div></div>}</div>
      <div className="atlas-region-strip"><span className="atlas-strip-caption">地域筛选</span><button type="button" className={state.area === 'all' ? 'active' : ''} onClick={() => act('area', 'all')} aria-pressed={state.area === 'all'}>全部地域</button>{REGIONS.map(([zone]) => <button key={zone} type="button" className={state.area === zone ? 'active' : ''} aria-pressed={state.area === zone} onClick={() => act('area', zone)}>{zone}</button>)}</div>
      <RecordCard record={focus} /><div className="atlas-map-note"><span>◎</span> 光晕按已收录记录数量显示；相对方位为信息设计示意，并非审定地图或苗族支系边界。</div>
    </div>
    <div className="atlas-insights"><div className="atlas-panel-header"><div><span className="atlas-panel-index">02 / LIVE DATA</span><h3>随地图生长的数据</h3></div><button type="button" className="atlas-clear" onClick={() => act('reset')}>重置 ↺</button></div>
      <div className="atlas-key-stat"><div><span>当前筛选 · 地域记录</span><strong className="atlas-number">{String(items.length).padStart(2, '0')}<small> / 07</small></strong></div><div className="atlas-key-seal"><Flower /></div></div>
      <div className="atlas-minors"><div><span>涉及省级地区</span><b>{String(provinces).padStart(2, '0')}</b></div><div><span>新增项目记录</span><b>{String(added).padStart(2, '0')}</b></div><div><span>扩展项目记录</span><b>{String(items.length - added).padStart(2, '0')}</b></div></div>
      <div className="atlas-chart-heading"><strong>申报地域构成</strong><small>点击条形可联动筛选</small></div><div className="atlas-bar-list">{REGIONS.map(([zone]) => { const count = items.filter((record) => record.zone === zone).length; return <button key={zone} type="button" className={`atlas-bar-item ${state.area === zone ? 'on' : ''}`} onClick={() => act('area', zone)} aria-label={`${zone}：当前${count}处，点击筛选该地区`}><span className="atlas-bar-name">{zone}</span><span className="atlas-bar-track"><i style={{ width: `${count / 4 * 100}%` }} /></span><span className="atlas-bar-value">{count}<small>处</small></span></button>; })}</div>
      <div className="atlas-province-composition"><span>省级地域构成</span><div className="atlas-comp-track" aria-label={`贵州${gz}处，湖南${hn}处`}><i style={{ width: `${items.length ? gz / items.length * 100 : 0}%` }} /><b style={{ width: `${items.length ? hn / items.length * 100 : 0}%` }} /></div><div className="atlas-comp-labels"><span><i />贵州 {gz}</span><span><i />湖南 {hn}</span></div></div>
      <div className="atlas-info-foot">{state.area === 'all' && state.year === 'all' ? '已核实分布：黔东南 4 处、贵阳 1 处、铜仁 1 处、湘西 1 处。' : items.length ? `当前条件命中 ${items.length} 条官方地域记录；图表已同步。` : '当前条件未命中记录，可点击“重置”重新探索。'}</div>
    </div></div>
    <div className="atlas-timeline"><div className="atlas-timeline-title"><div><span className="atlas-panel-index">03 / THE ARCHIVE THREAD</span><strong>名录公布进程</strong></div><small>年份仅指国家级名录公布时间，不是技艺起源或传播年代</small></div>
      <div className="atlas-years"><button type="button" onClick={() => act('year', 'all')} aria-pressed={state.year === 'all'} className={`atlas-year-all ${state.year === 'all' ? 'on' : ''}`}>完整记录</button>{TIMES.map((entry) => <button key={entry.year} type="button" className={`atlas-year ${state.year === String(entry.year) ? 'on' : ''}`} onClick={() => act('year', String(entry.year))} aria-pressed={state.year === String(entry.year)}><span className="atlas-year-dot" /><b>{entry.year}</b><small>新增 {entry.num} 处</small></button>)}</div><div className="atlas-timeline-footer"><span>当前进度：截至 {latest} 年累计 <strong>{time.total}</strong> 处记录</span><span>该批次新增 <strong>{newlyAdded}</strong> 处 {latest === 2014 && '（第四批苗绣Ⅶ-22没有新增记录）'}</span></div>
    </div>
    <details className="atlas-sources"><summary><span>✧　查看数据依据与统计口径</span><span>官方来源 · 7 条地域档案　⌄</span></summary><div className="atlas-sources-body"><p>统计单位是国家级非遗项目“苗绣”（项目序号 321、编号 Ⅶ-22）中，官方清单列明的申报地区或单位记录；不是七个独立国家级项目，也不是苗族人口、民族支系或全部苗绣流布范围。名录年份数据：2006 年 3、2008 年 1、2011 年 1、2014 年 0、2021 年 2。</p><div className="atlas-source-list">{ATLAS_RECORDS.map((record) => <a key={record.id} href={record.source} target="_blank" rel="noopener noreferrer">{record.name} · {record.year} · {record.type} ↗</a>)}</div><a className="atlas-source-gov" href="https://www.mct.gov.cn/whzx/ggtz/200606/t20060609_694679.htm" target="_blank" rel="noopener noreferrer">国务院第一批国家级非遗名录（原始公告） ↗</a><p className="atlas-source-end">页面数据人工整理与计算，统计口径核对日期：2026年10月16日。视觉光晕为信息编码；正式公共发布涉及行政边界的地图请采用审定标准地图。</p></div></details>
  </section>;
}
