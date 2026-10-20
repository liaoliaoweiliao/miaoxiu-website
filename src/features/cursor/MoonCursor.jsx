import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MoonButterfly from './MoonButterfly.jsx';

export function moonCursorIntent(target) {
  if (!target?.closest) return ['default', ''];
  if (target.closest('input,textarea,select,[contenteditable="true"]')) return ['native', ''];
  if (target.closest('[disabled],[aria-disabled="true"]')) return ['disabled', '⊘'];
  if (target.closest('[aria-busy="true"],.is-drawing')) return ['busy', ''];
  if (target.closest('.image-viewer-stage.is-zoomed,.look-viewport')) return ['move', '✥'];
  if (target.closest('.decode-board[data-action="find"],.decode-board[role="button"]')) return ['precise', ''];
  if (target.closest('.image-viewer-stage')) return ['zoom', '+'];
  if (target.closest('[data-cursor="ew-resize"]')) return ['resize', '↔'];
  if (target.closest('[data-cursor="ns-resize"]')) return ['resize', '↕'];
  if (target.closest('[data-cursor="diagonal-resize"]')) return ['resize', '↗'];
  if (target.closest('abbr,[data-cursor="help"]')) return ['help', '?'];
  if (target.closest('a,button,[role="button"],[data-action],[data-go]')) return ['hover', '↗'];
  if (target.closest('p,h1,h2,h3,h4,.source-credit')) return ['text', 'Ⅰ'];
  return ['default', ''];
}

export default function MoonCursor() {
  const cursor = useRef(null);
  const [status, setStatus] = useState({ visible: false, intent: 'default', mark: '' });
  const [effects, setEffects] = useState([]);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, point = { x: 0, y: 0 }, lastSpark = 0, lastPoint = null, sequence = 0;
    function hide() {
      setStatus((previous) => previous.visible ? { ...previous, visible: false } : previous);
      document.body.classList.remove('moon-cursor-active');
      lastPoint = null;
    }
    function effect(kind, x, y) {
      const item = { id: ++sequence, kind, x, y };
      setEffects((previous) => previous.length < 20 ? [...previous, item] : previous);
    }
    function update(event) {
      if (event.pointerType !== 'mouse') return hide();
      const [intent, mark] = moonCursorIntent(event.target);
      if (intent === 'native') return hide();
      setStatus((previous) => previous.visible && previous.intent === intent && previous.mark === mark ? previous : { visible: true, intent, mark });
      document.body.classList.add('moon-cursor-active');
      point = { x: event.clientX, y: event.clientY };
      if (!frame) frame = window.requestAnimationFrame(() => {
        if (cursor.current) cursor.current.style.transform = `translate3d(${point.x - 2}px,${point.y - 1}px,0)`;
        frame = 0;
      });
      if (!reduced.matches && event.timeStamp - lastSpark > 40 && (!lastPoint || Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) > 13)) {
        if (lastPoint) effect(sequence % 5 === 0 ? 'moon-butterfly-ghost' : 'moon-spark', lastPoint.x, lastPoint.y);
        lastSpark = event.timeStamp;
        lastPoint = { ...point };
      }
    }
    function down(event) {
      if (event.pointerType !== 'mouse' || event.button !== 0 || reduced.matches) return;
      const [intent] = moonCursorIntent(event.target);
      if (intent !== 'native' && intent !== 'disabled') effect('moon-click-ripple', event.clientX, event.clientY);
    }
    const out = (event) => { if (!event.relatedTarget) hide(); };
    const key = (event) => { if (event.key === 'Tab') hide(); };
    const visibility = () => { if (document.hidden) hide(); };
    document.addEventListener('pointermove', update, { passive: true });
    document.addEventListener('pointerdown', down, { passive: true });
    document.addEventListener('pointerout', out, { passive: true });
    document.addEventListener('keydown', key);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', hide);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', update);
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('pointerout', out);
      document.removeEventListener('keydown', key);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', hide);
      document.body.classList.remove('moon-cursor-active');
    };
  }, []);

  return createPortal(<div className="moon-cursor-layer" aria-hidden="true">
    <div ref={cursor} className="moon-cursor" hidden={!status.visible} data-intent={status.intent}>
      <span className="moon-butterfly"><MoonButterfly /></span>
      <span className="moon-cursor-badge">{status.mark}</span>
      <span className="moon-precision" />
    </div>
    <div className="moon-cursor-effects">
      {effects.map((item) => <span key={item.id} className={item.kind} style={{ left: item.x, top: item.y }} onAnimationEnd={() => setEffects((previous) => previous.filter(({ id }) => id !== item.id))} />)}
    </div>
  </div>, document.body);
}
