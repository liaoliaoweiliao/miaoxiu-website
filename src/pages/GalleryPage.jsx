import { useCallback, useLayoutEffect, useRef } from 'react';
import { assetUrl } from '../utils/assets.js';
import { galleryDisplayWorks } from '../data/gallery.js';

function routeThrough(points) {
  if (points.length < 2) return '';
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const distance = point.y - previous.y;
    const bend = Math.min(30, Math.max(12, window.innerWidth * 0.021)) * (index % 2 ? 1 : -1);
    return `${path} C ${previous.x + bend} ${previous.y + distance * 0.34}, ${point.x + bend} ${point.y - distance * 0.34}, ${point.x} ${point.y}`;
  }, '');
}

function NeedleScene({ anchorRef }) {
  return (
    <div className="needle-scene" aria-hidden="true">
      <svg viewBox="0 0 320 112" role="presentation">
        <defs>
          <linearGradient id="needle-silver" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset=".46" stopColor="#82909a" />
            <stop offset=".68" stopColor="#f9fbfc" />
            <stop offset="1" stopColor="#697680" />
          </linearGradient>
          <linearGradient id="thread-silk" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9e302c" />
            <stop offset=".52" stopColor="#cf493e" />
            <stop offset="1" stopColor="#a82e2c" />
          </linearGradient>
        </defs>
        <path className="needle-thread-prelude" d="M 9 77 C 39 76 65 69 88 63 C 103 59 111 56 120 59 C 131 63 135 72 152 72 C 174 72 176 52 199 52 C 215 52 222 59 237 62" />
        <g className="needle-body">
          <path d="M 120 59 L 278 46" fill="none" stroke="url(#needle-silver)" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 276 45.5 L 290 44.5 L 278 49.5 Z" fill="#9aa6ac" />
          <path d="M 126 56.4 L 270 44.5" fill="none" stroke="#fff" strokeWidth=".7" opacity=".85" />
          <ellipse cx="120" cy="59" rx="8.4" ry="3.5" transform="rotate(-4.7 120 59)" fill="#f5f0e5" stroke="#75838b" strokeWidth="1.6" />
          <ellipse cx="120" cy="59" rx="4.5" ry="1.6" transform="rotate(-4.7 120 59)" fill="none" />
        </g>
      </svg>
      <span className="thread-anchor-start" ref={anchorRef} />
    </div>
  );
}

export default function GalleryPage({ onAction }) {
  const works = galleryDisplayWorks();
  const stageRef = useRef(null);
  const startRef = useRef(null);
  const railEntryRef = useRef(null);
  const markerRefs = useRef([]);
  const endRef = useRef(null);
  const cardRefs = useRef([]);
  const revealedRef = useRef(new Set());
  const reducedMotionRef = useRef(false);

  const revealCard = useCallback((index) => {
    const card = cardRefs.current[index];
    if (!card || revealedRef.current.has(index)) return;
    revealedRef.current.add(index);
    card.classList.add('is-visible');
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const route = stage?.querySelector('.thread-route');
    const glint = stage?.querySelector('.thread-glint');
    const svg = stage?.querySelector('.thread-drawing');
    if (!stage || !route || !glint || !svg) return undefined;

    let geometry = null;
    let frame = 0;
    let currentProgress = 0;
    let targetProgress = 0;
    let disposed = false;

    const paint = (progress) => {
      if (!geometry) return;
      const visibleLength = geometry.length * progress;
      route.style.strokeDasharray = `${visibleLength} ${geometry.length}`;
      route.style.strokeDashoffset = '0';
      glint.style.strokeDasharray = `${visibleLength} ${geometry.length}`;
      glint.style.strokeDashoffset = '0';
      geometry.markers.forEach(({ element, progress: markerProgress }, index) => {
        if (progress >= markerProgress - 0.003) {
          element.classList.add('is-stitched');
          revealCard(index);
        }
        const previous = index === 0 ? 0 : (geometry.markers[index - 1].progress + markerProgress) / 2;
        const next = index === geometry.markers.length - 1 ? 1 : (markerProgress + geometry.markers[index + 1].progress) / 2;
        element.classList.toggle('is-active', progress >= previous && (progress < next || (index === geometry.markers.length - 1 && progress <= 1)));
      });
      if (progress >= 0.995) stage.classList.add('is-finished');
      if (progress < 0.04 && window.scrollY <= 2) {
        stage.classList.remove('is-finished');
        geometry.markers.forEach(({ element }) => {
          element.classList.remove('is-stitched', 'is-active');
        });
      }
    };

    const drawTowardTarget = () => {
      frame = 0;
      if (disposed || !geometry) return;
      const delta = targetProgress - currentProgress;
      currentProgress = Math.abs(delta) < 0.004 ? targetProgress : currentProgress + delta * 0.27;
      paint(currentProgress);
      if (Math.abs(targetProgress - currentProgress) > 0.001) frame = window.requestAnimationFrame(drawTowardTarget);
    };

    const requestDraw = () => {
      if (frame || disposed || !geometry) return;
      frame = window.requestAnimationFrame(drawTowardTarget);
    };

    const updateProgress = () => {
      if (!geometry) return;
      if (reducedMotionRef.current) {
        targetProgress = 1;
        currentProgress = 1;
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        paint(1);
        return;
      } else if (window.scrollY <= 2) {
        targetProgress = 0.025;
      } else {
        const localY = Math.max(geometry.startY, Math.min(geometry.endY, window.innerHeight * 0.68 - stage.getBoundingClientRect().top));
        let low = 0;
        let high = geometry.length;
        for (let step = 0; step < 15; step += 1) {
          const middle = (low + high) / 2;
          if (route.getPointAtLength(middle).y < localY) low = middle;
          else high = middle;
        }
        targetProgress = (low + high) / 2 / geometry.length;
      }
      requestDraw();
    };

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      const pointAt = (element) => {
        const box = element.getBoundingClientRect();
        return { x: box.left + box.width / 2 - rect.left, y: box.top + box.height / 2 - rect.top };
      };
      const points = [startRef.current, railEntryRef.current, ...markerRefs.current.slice(0, works.length), endRef.current]
        .filter(Boolean)
        .map(pointAt);
      const width = stage.clientWidth;
      const height = stage.scrollHeight;
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.style.height = `${height}px`;
      const pathData = routeThrough(points);
      route.setAttribute('d', pathData);
      glint.setAttribute('d', pathData);
      const length = Math.max(1, route.getTotalLength());
      route.style.strokeDasharray = `0 ${length}`;
      glint.style.strokeDasharray = `0 ${length}`;
      const markerElements = markerRefs.current.slice(0, works.length);
      const markers = markerElements.map((element) => {
        const markerY = pointAt(element).y;
        let low = 0;
        let high = length;
        for (let step = 0; step < 15; step += 1) {
          const middle = (low + high) / 2;
          if (route.getPointAtLength(middle).y < markerY) low = middle;
          else high = middle;
        }
        return { element, progress: ((low + high) / 2) / length };
      });
      geometry = { length, startY: points[0]?.y ?? 0, endY: points.at(-1)?.y ?? height, markers };
      currentProgress = Math.min(currentProgress, 1);
      updateProgress();
      paint(currentProgress);
    };

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      reducedMotionRef.current = motionQuery.matches;
      updateProgress();
    };
    reducedMotionRef.current = motionQuery.matches;
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', measure);
    motionQuery.addEventListener?.('change', onMotionChange);
    measure();
    document.fonts?.ready?.then(() => { if (!disposed) measure(); });

    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', measure);
      motionQuery.removeEventListener?.('change', onMotionChange);
    };
  }, [revealCard, works.length]);

  return (
    <main className="jing-gallery" ref={stageRef}>
      <svg className="thread-drawing" aria-hidden="true" preserveAspectRatio="none">
        <path className="thread-route" />
        <path className="thread-glint" />
      </svg>
      <header className="jing-heading">
        <span className="jing-eyebrow">MIAO EMBROIDERY · THE THREAD OF STORIES</span>
        <h1 aria-label="作品展览"><span>作品</span><em>展览</em></h1>
        <p className="jing-heading-poem">循一线锦绣，赏万千绣意。</p>
        <p className="jing-heading-note">针穿过线，故事便有了起点。向下浏览，让一缕朱红串起每一件苗绣。</p>
        <span className="jing-scroll-prompt"><i aria-hidden="true" />向下浏览 · 牵引红线</span>
        <NeedleScene anchorRef={startRef} />
      </header>

      <section className="thread-exhibition" aria-label="苗绣作品长卷">
        <span className="thread-rail-entry" ref={railEntryRef} aria-hidden="true" />
        <ol className="jing-artworks">
          {works.map((work, index) => {
            const featured = [0, 4, 10, 15].includes(index);
            return (
              <li key={work.src} className={`thread-story jing-slot ${index % 2 ? 'is-right' : 'is-left'}${featured ? ' is-featured' : ''}${work.catalogue ? ' has-catalogue' : ''}`}>
                <span className="thread-stitch" ref={(node) => { markerRefs.current[index] = node; }} aria-hidden="true">
                  <i className="stitch-cross" />
                  <i className="stitch-needle" />
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </span>
                <button
                  type="button"
                  className="jing-work"
                  ref={(node) => { cardRefs.current[index] = node; }}
                  onClick={() => onAction('modal', 0, { src: work.src, title: `${work.kind ? `${work.kind}｜` : ''}${work.title}`, description: work.catalogue ? work.desc : '' })}
                  aria-label={`放大观赏${work.title}${work.kind ? `，${work.kind}` : ''}`}
                >
                  <span className={`jing-work-photo${work.detailPosition ? ' is-detail' : ''}`}>
                    <img src={assetUrl(work.src)} style={work.detailPosition ? { objectPosition: work.detailPosition, transformOrigin: work.detailPosition } : undefined} alt={`${work.title}${work.kind ? `（${work.kind}）` : ''}`} loading="lazy" decoding="async" />
                    <span className="photo-caption" aria-hidden="true">苗绣 · {String(index + 1).padStart(2, '0')}</span>
                  </span>
                  <span className="jing-work-copy">
                    <span className="jing-work-type">{work.sub}</span>
                    <span className="work-chapter">STITCH {String(index + 1).padStart(2, '0')}</span>
                    <span className="work-title" role="heading" aria-level="2">{work.title}</span>
                    <span className="work-description">{work.summary || work.desc}</span>
                    {work.kind && <span className="jing-work-kind">{work.kind}</span>}
                    <span className="jing-work-open">{work.catalogue ? '图赏与作品信息' : '观赏细节'} <i aria-hidden="true">↗</i></span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <footer className="thread-colophon">
        <span className="closing-knot" ref={endRef} aria-hidden="true">
          <i className="knot-loop" /><i className="knot-tail" />
          <svg className="closing-needle" viewBox="0 0 62 18"><path d="M 4 13 L 52 4" /><ellipse cx="5" cy="13" rx="3" ry="1.7" /></svg>
        </span>
        <p>一针一线，绣见万象。</p>
        <span className="colophon-caption">收针 · 苗绣作品展</span>
      </footer>
    </main>
  );
}
