import { useEffect, useRef, useState } from 'react';
import { heritageApplications, heritageChapters } from '../../data/heritageJourney.js';
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
  return { stage: 0, number: 1, busy: false, hidden: false, flyingLeft: false, perched: false, x: 585, y: 535, pan: 0, artWidth: 2172, maxPan: 1, worldWidth: 1000, hint: '点击小鸟 · 看纹样的来处', message: '从绣布上的鸟纹出发，看看苗绣如何走进今天的生活。' };
}

export default function HeritageJourney() {
  const viewportRef = useRef(null);
  const modelRef = useRef(null);
  if (!modelRef.current) modelRef.current = initialJourney();
  const [view, setView] = useState(modelRef.current);
  const activeRef = useRef(false);
  const pendingRef = useRef(new Set());
  const touchRef = useRef(null);
  const chapter = heritageChapters[view.stage];

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
      if (!(await animate(2600, (time) => { const point = sample(paths[0], time); Object.assign(model, point, { pan: clamp(point.x - model.worldWidth * .52, 0, model.maxPan) }); paint(); }))) return;
      Object.assign(model, { x: 249, y: 367, stage: 1, number: 2, message: '小鸟停在指尖的针线处，轻轻扇动翅膀。' });
      ready('再次点击小鸟 · 看当代应用');
    } else if (model.stage === 1) {
      Object.assign(model, { flyingLeft: false, number: 2, message: '小鸟带着绣纹，沿着长卷飞向当代设计。' });
      paint();
      if (!(await animate(8600, (time) => { const point = sample(paths[1], time); Object.assign(model, point, { pan: clamp(point.x - model.worldWidth * 0.52, 0, model.maxPan) }); paint(); }))) return;
      Object.assign(model, { x: 2079, y: 421, pan: model.maxPan, stage: 2, number: 3, message: '小鸟停在本子封面的小鸟纹样上。' });
      ready('点击小鸟 · 再看一遍旅程');
    } else {
      Object.assign(model, { flyingLeft: false, number: 3, message: '绣纹继续延伸，飞向画卷以外。' });
      paint();
      if (!(await animate(2500, (time) => { Object.assign(model, sample(paths[2], time)); paint(); }))) return;
      model.hidden = true;
      paint();
      if (!(await delay(550))) return;
      const from = model.pan;
      const startPan = clamp(585 - model.worldWidth * .52, 0, model.maxPan);
      if (!(await animate(1600, (time) => { model.pan = from + (startPan - from) * ease(time); paint(); }))) return;
      Object.assign(model, { stage: 0, x: 585, y: 535, pan: startPan, number: 1, message: '绣片上的小鸟又回到了起点。' });
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
    <section className="heritage-journey" aria-labelledby="heritage-title" data-heritage-journey="">
      <header className="heritage-heading">
        <div>
          <p className="heritage-eyebrow"><span>04</span> 当代应用与传承</p>
          <h2 id="heritage-title">让苗绣，走进今天的生活</h2>
        </div>
        <p className="heritage-intro">一枚鸟纹，如何从绣布走向日常？<br />跟随小鸟，从绣娘的指尖出发，发现传统纹样的新去处。</p>
      </header>

      <ol className="heritage-chapters" aria-label="从纹样到日常的三步旅程">
        {heritageChapters.map((item, index) => (
          <li key={item.label} aria-current={view.stage === index ? 'step' : undefined} className={index < view.stage ? 'is-complete' : ''}>
            <span className="heritage-chapter-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span><strong>{item.label}</strong><small>{item.location}</small></span>
          </li>
        ))}
      </ol>

      <div className="heritage-workspace">
        <div id="heritage-scene" ref={viewportRef} className="heritage-viewport" tabIndex={0} aria-label="轻触绣布上的小鸟体验三段故事，键盘可使用回车或空格继续" aria-describedby="heritage-howto" onKeyDown={(event) => { if (event.target === event.currentTarget && ['Enter', ' ', 'ArrowLeft'].includes(event.key)) { event.preventDefault(); advance(); } }} onTouchStart={touchStart} onTouchEnd={touchEnd} onTouchCancel={() => { touchRef.current = null; }}>
          <div className="heritage-art" aria-hidden="false" style={{ '--heritage-art-width': `${view.artWidth}px`, '--heritage-shift': `${view.pan * view.artWidth / 2172}px` }}>
            <img className="heritage-panorama" src={assetUrl('home/heritage-long-panorama-wide.webp')} alt="连续的苗绣长卷：绣娘、绵延的绣布与右侧现代设计作品" loading="lazy" draggable={false} />
            <button className={`heritage-bird ${view.busy ? 'is-flying' : ''} ${view.hidden ? 'is-hidden' : ''} ${view.flyingLeft ? 'is-flying-left' : ''} ${view.perched ? 'is-perched' : ''} ${view.stage === 1 ? 'is-at-fingertip' : ''}`} type="button" data-heritage-bird="" aria-label={view.hint} disabled={view.busy} onClick={advance} style={{ left: `${view.x / 2172 * 100}%`, top: `${view.y / 724 * 100}%`, '--heritage-art-width': `${view.artWidth}px`, '--bird-screen-x': `${(view.x - view.pan) * view.artWidth / 2172}px`, '--journey-width': `${view.worldWidth * view.artWidth / 2172}px` }}>
              <img className="heritage-bird-img" src={assetUrl('home/bird-flap-clean.png')} alt="" aria-hidden="true" /><span className="heritage-bird-hint">{view.hint}</span>
            </button>
          </div>
          <span className="heritage-scene-label">互动长卷<span aria-hidden="true"> · </span>传承与新生</span>
          <div className="heritage-bottom">
            <p className="heritage-whisper" data-heritage-message="" aria-live="polite">{view.message}</p>
          </div>
        </div>

        <aside className="heritage-story" aria-label="当前长卷讲解">
          <p className="heritage-story-index"><span data-heritage-number="">{String(view.number).padStart(2, '0')}</span><span>/ 03</span><span className="heritage-story-location">{chapter.label}</span></p>
          <div className="heritage-story-copy">
            <h3>{chapter.title}</h3>
            <p>{chapter.description}</p>
            <div className="heritage-story-detail">
              <h4>{chapter.detailTitle}</h4>
              <p>{chapter.detail}</p>
            </div>
          </div>
          <button className="heritage-continue" type="button" onClick={advance} disabled={view.busy} aria-controls="heritage-scene" aria-describedby="heritage-howto">
            <span>{view.busy ? '小鸟正在带路…' : chapter.action}</span><span aria-hidden="true">↗</span>
          </button>
          <p id="heritage-howto" className="heritage-howto">点击画中小鸟或上方按钮继续；也可在画面上向左轻扫。</p>
        </aside>
      </div>

      <div className="heritage-applications-heading">
        <h3>不止于盛装，也在日常</h3>
        <p>三种应用灵感<span> · 以下为设计示意</span></p>
      </div>
      <div className="heritage-applications">
        {heritageApplications.map((application) => (
          <article className="heritage-application" key={application.category}>
            <div className="heritage-application-image"><img className={application.imageClass} src={assetUrl(application.image)} alt={application.alt} loading="lazy" /></div>
            <div className="heritage-application-copy">
              <span className="heritage-application-category">{application.category}</span>
              <h4>{application.title}</h4>
              <p>{application.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
