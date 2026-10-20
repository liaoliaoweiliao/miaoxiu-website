import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../../utils/assets.js';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const ease = (value) => value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
const paths = [
  [[585, 535], [505, 507], [427, 468], [338, 409], [249, 367]],
  [[249, 367], [345, 408], [490, 466], [670, 506], [860, 531], [1080, 542], [1290, 519], [1480, 479], [1640, 438], [1815, 412], [1950, 410], [2079, 421]],
  [[2079, 421], [2140, 361], [2200, 269], [2270, 142], [2360, -48]],
];
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
  return { stage: 0, number: 1, busy: false, hidden: false, flyingLeft: false, perched: false, x: 585, y: 535, pan: 0, artWidth: 2172, maxPan: 1, worldWidth: 1000, hint: '点击小鸟 · 唤醒绣纹', message: '绣片上的小鸟即将启程：先飞向指尖，再沿着绣布走进今天。' };
}

export default function HeritageJourney() {
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
      const fraction = model.maxPan > 0 ? model.pan / model.maxPan : 0;
      model.artWidth = Math.max(viewport.clientHeight * 2172 / 724, viewport.clientWidth / 0.65);
      model.worldWidth = viewport.clientWidth * 2172 / model.artWidth;
      model.maxPan = Math.max(0, 2172 - model.worldWidth);
      model.pan = model.stage === 0 ? 0 : clamp(fraction * model.maxPan, 0, model.maxPan);
      paint();
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(viewportRef.current);
    return () => {
      activeRef.current = false;
      observer.disconnect();
      for (const pending of pendingRef.current) {
        if (pending.type === 'animation') cancelAnimationFrame(pending.id);
        else clearTimeout(pending.id);
        pending.resolve(false);
      }
      pendingRef.current.clear();
    };
  }, []);

  function animate(duration, update) {
    return new Promise((resolve) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { update(1); resolve(activeRef.current); return; }
      const start = performance.now();
      const pending = { type: 'animation', id: null, resolve };
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

  function delay(duration) {
    return new Promise((resolve) => {
      const pending = { type: 'timeout', id: null, resolve };
      pendingRef.current.add(pending);
      pending.id = setTimeout(() => { pendingRef.current.delete(pending); resolve(activeRef.current); }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 50 : duration);
    });
  }

  function ready(hint) {
    Object.assign(modelRef.current, { busy: false, hidden: false, flyingLeft: false, perched: true, hint });
    paint();
  }

  async function advance() {
    const model = modelRef.current;
    if (model.busy || !activeRef.current) return;
    model.busy = true;
    model.perched = false;
    if (model.stage === 0) {
      Object.assign(model, { flyingLeft: true, number: 1, message: '小鸟循着针线，从绣片飞向绣娘指尖。' });
      paint();
      if (!(await animate(2600, (time) => { Object.assign(model, sample(paths[0], time)); paint(); }))) return;
      Object.assign(model, { x: 249, y: 367, stage: 1, number: 2, message: '小鸟停在指尖的针线处，轻轻扇动翅膀。' });
      ready('再次点击小鸟 · 飞往本子鸟纹');
    } else if (model.stage === 1) {
      Object.assign(model, { flyingLeft: false, number: 2, message: '小鸟带着绣纹，沿着长卷飞向当代设计。' });
      paint();
      if (!(await animate(8600, (time) => { const point = sample(paths[1], time); Object.assign(model, point, { pan: clamp(point.x - model.worldWidth * 0.52, 0, model.maxPan) }); paint(); }))) return;
      Object.assign(model, { x: 2079, y: 421, pan: model.maxPan, stage: 2, number: 3, message: '小鸟停在本子封面的小鸟纹样上。' });
      ready('第三次点击小鸟 · 飞向右上方');
    } else {
      Object.assign(model, { flyingLeft: false, number: 3, message: '绣纹继续延伸，飞向画卷以外。' });
      paint();
      if (!(await animate(2500, (time) => { Object.assign(model, sample(paths[2], time)); paint(); }))) return;
      model.hidden = true;
      paint();
      if (!(await delay(550))) return;
      const from = model.pan;
      if (!(await animate(1600, (time) => { model.pan = from * (1 - ease(time)); paint(); }))) return;
      Object.assign(model, { stage: 0, x: 585, y: 535, pan: 0, number: 1, message: '绣片上的小鸟又回到了起点。' });
      ready('点击小鸟 · 重新唤醒绣纹');
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
    <section className="heritage-journey" aria-label="传承与新生：绣布小鸟三次互动" data-heritage-journey="">
      <div ref={viewportRef} className="heritage-viewport" tabIndex={0} aria-label="轻触绣布上的小鸟体验三段故事，键盘可使用回车或空格继续" onKeyDown={(event) => { if (event.target === event.currentTarget && ['Enter', ' ', 'ArrowLeft'].includes(event.key)) { event.preventDefault(); advance(); } }} onTouchStart={touchStart} onTouchEnd={touchEnd} onTouchCancel={() => { touchRef.current = null; }}>
        <div className="heritage-art" aria-hidden="false" style={{ '--heritage-art-width': `${view.artWidth}px`, '--heritage-shift': `${view.pan * view.artWidth / 2172}px` }}>
          <img className="heritage-panorama" src={assetUrl('home/heritage-long-panorama-wide.webp')} alt="连续的苗绣长卷：绣娘、绵延的绣布与右侧现代设计作品" loading="lazy" draggable={false} />
          <img className="heritage-target-motif" src={assetUrl('home/bird-motif-target.png')} alt="" aria-hidden="true" />
          <button className={`heritage-bird ${view.busy ? 'is-flying' : ''} ${view.hidden ? 'is-hidden' : ''} ${view.flyingLeft ? 'is-flying-left' : ''} ${view.perched ? 'is-perched' : ''}`} type="button" data-heritage-bird="" aria-label={view.hint} disabled={view.busy} onClick={advance} style={{ left: `${view.x / 2172 * 100}%`, top: `${view.y / 724 * 100}%`, '--heritage-art-width': `${view.artWidth}px` }}>
            <img className="heritage-bird-img" src={assetUrl('home/bird-flap.gif')} alt="" aria-hidden="true" /><span className="heritage-bird-hint">{view.hint}</span>
          </button>
        </div>
        <div className="heritage-ink-top" aria-hidden="true" /><div className="heritage-shimmer" aria-hidden="true" /><div className="heritage-floor" aria-hidden="true" />
        <div className="heritage-topline"><span className="heritage-ornament" aria-hidden="true">✧ ───── ❖ ───── ✧</span><h2>传承与新生</h2><span className="heritage-subtitle">绣纹有灵 · 从指尖飞向未来</span></div>
        <div className="heritage-bottom">
          <p className="heritage-stage-index" aria-hidden="true"><span data-heritage-number="">{String(view.number).padStart(2, '0')}</span><span className="heritage-stage-rule" />03</p>
          <p className="heritage-whisper" data-heritage-message="" aria-live="polite">{view.message}</p>
          <div className="heritage-progress" aria-hidden="true">{[1, 2, 3].map((number) => <i key={number} className={view.number === number ? 'is-current' : ''} />)}</div>
        </div>
      </div>
    </section>
  );
}
