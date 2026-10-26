import { useEffect, useId, useRef, useState } from 'react';
import { assetUrl } from '../../utils/assets.js';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const ease = (value) => value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
const paths = [
  [[249, 341], [345, 408], [490, 466], [670, 506], [860, 531], [1080, 542], [1290, 519], [1480, 479], [1640, 425], [1770, 400]],
  [[1770, 400], [1860, 365], [1930, 385], [1950, 435]],
];
const panorama = 'home/heritage-long-panorama-wide.webp';
const steps = ['指尖传承', '绣纹延展', '走进日常'];
// Coordinates refer to the unmodified 2172 × 724 panorama, including the two floral borders.
const flowers = [[345, 430, 43], [501, 501, 43], [737, 578, 44], [1046, 617, 42], [1356, 560, 42], [1618, 456, 42], [1712, 454, 38]];
const messages = ['一针一线之间，技艺在指尖延续。', '沿着绣布，看看传统纹样如何延伸出新的设计。', '花卉纹样从绣带的连续铺陈，变为本子封面的细窄边饰。'];
const pathCache = new WeakMap();

function sample(points, time) {
  let table = pathCache.get(points);
  if (!table) {
    const samples = [];
    let distance = 0;
    let previous = null;
    for (let index = 0; index < points.length - 1; index += 1) {
      const p0 = points[Math.max(0, index - 1)];
      const p1 = points[index];
      const p2 = points[index + 1];
      const p3 = points[Math.min(points.length - 1, index + 2)];
      for (let step = index === 0 ? 0 : 1; step <= 32; step += 1) {
        const t = step / 32;
        const interpolate = (axis) => 0.5 * (2 * p1[axis] + (-p0[axis] + p2[axis]) * t + (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * t ** 2 + (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * t ** 3);
        const point = { x: interpolate(0), y: interpolate(1) };
        if (previous) distance += Math.hypot(point.x - previous.x, point.y - previous.y);
        samples.push({ ...point, distance });
        previous = point;
      }
    }
    table = { samples, total: distance };
    pathCache.set(points, table);
  }
  const target = clamp(time, 0, 1) * table.total;
  let low = 0;
  let high = table.samples.length - 1;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (table.samples[middle].distance < target) low = middle + 1;
    else high = middle;
  }
  const end = table.samples[low];
  const start = table.samples[Math.max(0, low - 1)];
  const span = end.distance - start.distance;
  const ratio = span ? (target - start.distance) / span : 0;
  return { x: start.x + (end.x - start.x) * ratio, y: start.y + (end.y - start.y) * ratio };
}

function initialJourney() {
  return { stage: 0, busy: false, perched: true, x: 249, y: 341, pan: 0, artWidth: 2172, maxPan: 1, worldWidth: 1000, lit: 0, hint: '点击小鸟，看看绣纹如何走进日常', message: messages[0] };
}

export default function HeritageJourney() {
  const artId = useId();
  const viewportRef = useRef(null);
  const modelRef = useRef(null);
  if (!modelRef.current) modelRef.current = initialJourney();
  const [view, setView] = useState(modelRef.current);
  const activeRef = useRef(false);
  const pendingRef = useRef(new Set());
  const touchRef = useRef(null);

  function paint() {
    const model = modelRef.current;
    model.pan = clamp(model.pan, 0, model.maxPan);
    if (activeRef.current) setView({ ...model });
  }

  useEffect(() => {
    activeRef.current = true;
    function resize() {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const model = modelRef.current;
      model.artWidth = Math.max(viewport.clientHeight * 2172 / 724, viewport.clientWidth / 0.65);
      model.worldWidth = viewport.clientWidth * 2172 / model.artWidth;
      model.maxPan = Math.max(0, 2172 - model.worldWidth);
      model.pan = clamp(model.x - model.worldWidth * .52, 0, model.maxPan);
      paint();
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(viewportRef.current);
    return () => {
      activeRef.current = false;
      observer.disconnect();
      for (const pending of pendingRef.current) {
        cancelAnimationFrame(pending.id);
        pending.resolve(false);
      }
      pendingRef.current.clear();
    };
  }, []);

  function animate(duration, update) {
    return new Promise((resolve) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { update(1); resolve(activeRef.current); return; }
      const start = performance.now();
      const pending = { id: null, resolve };
      pendingRef.current.add(pending);
      function tick(now) {
        if (!activeRef.current) { pendingRef.current.delete(pending); resolve(false); return; }
        const progress = clamp((now - start) / duration, 0, 1);
        update(progress);
        if (progress < 1) pending.id = requestAnimationFrame(tick);
        else { pendingRef.current.delete(pending); resolve(true); }
      }
      pending.id = requestAnimationFrame(tick);
    });
  }

  function ready(hint) {
    Object.assign(modelRef.current, { busy: false, perched: true, hint });
    paint();
  }

  async function advance() {
    const model = modelRef.current;
    if (model.busy || !activeRef.current) return;
    model.busy = true;
    model.perched = false;
    if (model.stage === 0) {
      Object.assign(model, { stage: 1, message: messages[1] });
      paint();
      if (!(await animate(6500, (time) => {
        const point = sample(paths[0], time);
        Object.assign(model, point, { lit: flowers.filter(([x]) => x < point.x).length, pan: clamp(point.x - model.worldWidth * .52, 0, model.maxPan) });
        paint();
      }))) return;
      ready('再次点击小鸟 · 看看封面边饰');
    } else if (model.stage === 1) {
      if (!(await animate(1800, (time) => {
        const point = sample(paths[1], ease(time));
        Object.assign(model, point, { pan: clamp(point.x - model.worldWidth * .52, 0, model.maxPan) });
        paint();
      }))) return;
      Object.assign(model, { pan: model.maxPan, stage: 2, message: messages[2] });
      ready('点击小鸟 · 再看一遍');
    } else {
      const from = model.pan;
      const startPan = clamp(249 - model.worldWidth * .52, 0, model.maxPan);
      const startX = model.x;
      const startY = model.y;
      if (!(await animate(1200, (time) => {
        const progress = ease(time);
        Object.assign(model, { x: startX + (249 - startX) * progress, y: startY + (341 - startY) * progress, pan: from + (startPan - from) * progress });
        paint();
      }))) return;
      Object.assign(model, { stage: 0, x: 249, y: 341, pan: startPan, lit: 0, message: messages[0] });
      ready('点击小鸟，看看绣纹如何走进日常');
    }
  }

  function touchStart(event) {
    if (event.target.closest('button')) return;
    const touch = event.changedTouches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function touchEnd(event) {
    if (!touchRef.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchRef.current.x;
    const dy = touch.clientY - touchRef.current.y;
    touchRef.current = null;
    if (dx < -65 && Math.abs(dx) > Math.abs(dy) * 1.6) advance();
  }

  return (
    <section className="heritage-journey" aria-label="传承与新生：从指尖技艺到日常设计" data-heritage-journey="" data-stage={view.stage} aria-busy={view.busy}>
      <div ref={viewportRef} className="heritage-viewport" tabIndex={0} aria-label="轻触绣布上的小鸟体验三段故事，键盘可使用回车或空格继续" onKeyDown={(event) => { if (event.target === event.currentTarget && ['Enter', ' ', 'ArrowLeft'].includes(event.key)) { event.preventDefault(); advance(); } }} onTouchStart={touchStart} onTouchEnd={touchEnd} onTouchCancel={() => { touchRef.current = null; }}>
        <div className="heritage-art" style={{ '--heritage-art-width': `${view.artWidth}px`, '--heritage-shift': `${view.pan * view.artWidth / 2172}px` }}>
          <img className="heritage-panorama" src={assetUrl(panorama)} alt="绣娘穿针引线，花卉与蝶形纹样沿绣布延展，右侧陈列本子、布袋等应用作品" loading="lazy" draggable={false} />
          <svg className="heritage-details" viewBox="0 0 2172 724" aria-hidden="true">
            <defs>
              <linearGradient id={`${artId}-veil`} x2="0" y2="1"><stop offset="0" stopColor="#165981" stopOpacity=".12" /><stop offset=".7" stopColor="#0b3655" stopOpacity=".38" /><stop offset="1" stopColor="#165981" stopOpacity="0" /></linearGradient>
              <clipPath id={`${artId}-hand`}><ellipse cx="245" cy="379" rx="62" ry="43" /><ellipse cx="345" cy="430" rx="53" ry="38" /></clipPath>
              {flowers.map(([x, y, radius], index) => <clipPath id={`${artId}-flower-${index}`} key={index}><circle cx={x} cy={y} r={radius} /></clipPath>)}
              <clipPath id={`${artId}-cover`}><path d="M2035 456 L2147 494 L2144 532 L2030 493Z" /></clipPath>
            </defs>
            <path d="M300 110H1775V410L1650 426 1480 490 1250 550 1000 584 780 553 580 485 400 413 300 385Z" fill={`url(#${artId}-veil)`} />
            <image className={`heritage-hand-light ${view.stage === 0 ? 'is-lit' : ''}`} href={assetUrl(panorama)} width="2172" height="724" clipPath={`url(#${artId}-hand)`} />
            {flowers.map((_, index) => <image key={index} className={`heritage-flower-light ${view.lit > index ? 'is-lit' : ''}`} data-flower={index} href={assetUrl(panorama)} width="2172" height="724" clipPath={`url(#${artId}-flower-${index})`} />)}
            <g className={`heritage-cover-light ${view.stage === 2 ? 'is-lit' : ''}`}>
              <image href={assetUrl(panorama)} width="2172" height="724" clipPath={`url(#${artId}-cover)`} />
              <path d="M2035 456 L2147 494 L2144 532 L2030 493Z" />
            </g>
          </svg>
          <button className={`heritage-bird ${view.busy ? 'is-flying' : ''} ${view.perched ? 'is-perched' : ''} ${view.stage === 0 ? 'is-at-fingertip' : ''}`} type="button" data-heritage-bird="" aria-label={view.hint} disabled={view.busy} onClick={advance} style={{ left: `${view.x / 2172 * 100}%`, top: `${view.y / 724 * 100}%`, '--heritage-art-width': `${view.artWidth}px`, '--bird-screen-x': `${(view.x - view.pan) * view.artWidth / 2172}px`, '--journey-width': `${view.worldWidth * view.artWidth / 2172}px` }}>
            <img className="heritage-bird-img" src={assetUrl('home/bird-flap-clean.png')} alt="" aria-hidden="true" /><span className="heritage-bird-hint">{view.hint}</span>
          </button>
        </div>
        <div className="heritage-ink-top" aria-hidden="true" /><div className="heritage-shimmer" aria-hidden="true" /><div className="heritage-floor" aria-hidden="true" />
        <div className="heritage-topline">
          <span className="heritage-ornament" aria-hidden="true">✧ ───── ❖ ───── ✧</span>
          <h2>传承与新生</h2>
          <span className="heritage-subtitle">从指尖的技艺，到日常的设计</span>
          {view.stage === 2 && <div className="heritage-comparison" role="group" aria-label="原图花卉边饰对照：绣布连续铺陈，封面缩小排列">
            <figure><svg viewBox="1630 410 130 94" role="img" aria-label="原绣布局部：连续的红色花卉纹样"><image href={assetUrl(panorama)} width="2172" height="724" /></svg><figcaption>绣布 · 连续铺陈</figcaption></figure>
            <span aria-hidden="true">→</span>
            <figure><svg viewBox="2025 465 120 83" role="img" aria-label="原本子封面局部：缩小排列的花卉边饰"><image href={assetUrl(panorama)} width="2172" height="724" /></svg><figcaption>封面 · 缩小为边饰</figcaption></figure>
          </div>}
        </div>
        <div className="heritage-bottom">
          <p className="heritage-whisper" data-heritage-message="" aria-live="polite">{view.message}</p>
          <ol className="heritage-progress" aria-label="传承与新生进度">{steps.map((step, index) => <li key={step} aria-current={view.stage === index ? 'step' : undefined}><span data-heritage-number={view.stage === index ? '' : undefined}>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol>
        </div>
      </div>
    </section>
  );
}
