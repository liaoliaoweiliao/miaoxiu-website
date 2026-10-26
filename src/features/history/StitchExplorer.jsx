import { useEffect, useId, useMemo } from 'react';
import { stitches } from '../../data/history.js';
import { assetUrl } from '../../utils/assets.js';
import { stitchGeometry, stitchNeedleMotion } from './stitchGeometry.js';

const hints = {
  平绣: '长短针平行铺排 · 绣面平整',
  破线绣: '丝线分成细缕 · 细密轻柔',
  锁绣: '线环互相套锁 · 连成链纹',
  缠绣: '先铺芯线 · 再斜绕包缠',
  辫绣: '双股左右交叉 · 形成辫纹',
  打籽绣: '绕针打结 · 绣籽逐颗隆起',
};
const threadColors = ['#f4c46e', '#e88167', '#a9d7d5'];
const timeSpan = 4.8;
const sewRatio = 0.84;

function StitchDrawing({ item, playing, run }) {
  const metalId = useId();
  const paths = useMemo(() => stitchGeometry(item.name), [item]);
  const motion = useMemo(() => stitchNeedleMotion(paths, sewRatio), [paths]);
  const segment = timeSpan / paths.length;
  return <svg key={run} className="stitch-crafted-svg" viewBox="1 8 98 84" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs><linearGradient id={metalId} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffffff" /><stop offset=".22" stopColor="#dae6ef" /><stop offset=".51" stopColor="#879aa9" /><stop offset=".78" stopColor="#f0f5f9" /><stop offset="1" stopColor="#a1afbc" /></linearGradient></defs>
    <g className="stitch-underlay">{paths.map((piece, index) => <path key={index} d={piece.d} fill="none" stroke="#92adc0" strokeOpacity=".16" strokeWidth=".65" />)}</g>
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">{paths.map((piece, index) => <path key={index} className="stitch-drawn-line" d={piece.d} pathLength="100" stroke={threadColors[piece.c]} strokeWidth={piece.w} style={{ '--draw-delay': `${index * segment}s`, '--draw-duration': `${segment * sewRatio}s` }} />)}</g>
    {playing && <g className="stitch-moving-needle" style={{ '--needle-delay': '0s', '--needle-duration': `${timeSpan}s` }}>
      <path className="stitch-needle-outline" d="M -28.8 -.64 Q -16 -.78 -4.1 -.48 L 0 0 L -4.1 .48 Q -16 .78 -28.8 .64 Z" fill="#263b4b" stroke="#758b9b" strokeWidth=".17" strokeLinejoin="round" />
      <path className="stitch-needle-shaft-live" d="M -28.5 -.45 Q -15 -.58 -3.8 -.29 L 0 0 L -3.8 .29 Q -15 .58 -28.5 .45 Z" fill={`url(#${metalId})`} stroke="#d4e1eb" strokeWidth=".09" strokeLinejoin="round" />
      <path className="stitch-needle-shine" d="M -27.9 -.23 Q -16 -.39 -5 -.17" fill="none" stroke="#ffffff" strokeOpacity=".86" strokeWidth=".17" strokeLinecap="round" />
      <ellipse className="stitch-needle-eye" cx="-26.3" cy="0" rx="1.25" ry=".32" fill="#314858" stroke="#f3faff" strokeWidth=".16" />
      <path className="stitch-needle-thread" d="M -27.6 0 C -30.1 -1.65 -33.4 -.25 -36.2 2" fill="none" stroke="#e9b073" strokeWidth=".36" strokeLinecap="round" />
      <path className="stitch-needle-tip" d="M -1.25 -.17 L 0 0 L -1.25 .17 Z" fill="#ffffff" />
      <animateMotion begin="0s" dur={`${timeSpan}s`} calcMode="linear" keyTimes={motion.times} keyPoints={motion.points} fill="freeze" rotate="auto" path={motion.path} />
    </g>}
  </svg>;
}

export default function StitchExplorer({ state, dispatch }) {
  const item = stitches[state.stitch];
  const complete = !state.playing && state.step === 3;
  useEffect(() => {
    if (!state.playing) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: 'stitchComplete', run: state.run }), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 5150);
    return () => window.clearTimeout(timer);
  }, [state.playing, state.run, dispatch]);
  return <div className="stitch-explorer">
    <div className={`stitch-board ${state.playing ? 'is-running' : ''}`} role="group" aria-label={`${item.name}针法动态演示`}>
      <div className={`stitch-stage ${state.playing ? 'is-playing' : 'is-idle'} ${complete ? 'is-complete' : ''}`}>
        <span className="stitch-fabric" aria-hidden="true" />
        <div className="stitch-demo-heading"><strong>{item.name} · 动态演示</strong><small>{complete ? '绣制完成 · 成品展示' : state.playing ? '起针 → 走线 → 收针' : '点击右侧针法，观看绣制过程'}</small></div>
        <StitchDrawing item={item} playing={state.playing} run={state.run} />
        <img className="stitch-finish-image" src={assetUrl(item.finish)} alt={`${item.name}绣法成品示意图`} />
        <div className="stitch-result-stars" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <i key={index}>{index % 2 ? '✧' : '✦'}</i>)}</div>
        <div className="stitch-demo-footer"><span>{hints[item.name]}</span><span role="status">{complete ? '✓ 成品' : state.playing ? '● 绣制中' : '点击针法开始'}</span></div>
      </div>
    </div>
    <div className="stitch-list">{stitches.map((stitch, index) => <button key={stitch.name} type="button" className={`stitch-item stitch-${index + 1} ${index === state.stitch ? 'is-selected' : ''}`} onClick={() => dispatch({ type: 'stitch', index })} aria-pressed={index === state.stitch} aria-label={`${stitch.name}：${stitch.desc}`}><span className="stitch-swatch"><img src={assetUrl(stitch.thumb)} alt={`${stitch.name}针法缩略图`} /></span><span className="stitch-label"><strong>{stitch.name}</strong><small className="stitch-desc">{stitch.desc}</small></span><b>›</b></button>)}</div>
  </div>;
}
