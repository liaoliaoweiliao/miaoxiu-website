import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { assetUrl } from '../../utils/assets.js';

function StoryText({ text }) {
  const [visible, setVisible] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? text.length : 0);
  useEffect(() => {
    if (visible >= text.length) return undefined;
    const timer = window.setInterval(() => setVisible((length) => Math.min(text.length, length + 2)), 26);
    return () => window.clearInterval(timer);
  }, [text, visible >= text.length]);
  return <p className="story-reader-text" tabIndex={0} onClick={() => setVisible(text.length)} onKeyDown={(event) => {
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); setVisible(text.length); }
  }} aria-label={text}>
    <span data-story-text aria-hidden="true">{text.slice(0, visible)}</span>
    {visible < text.length && <i className="story-reader-caret" style={{ display: 'inline-block' }} aria-hidden="true" />}
  </p>;
}

export default function StoryReader({ item, index, onClose }) {
  const [page, setPage] = useState(0);
  const panel = useRef(null);
  const close = useRef(null);
  const navigate = useCallback((direction) => setPage((current) => Math.max(0, Math.min(item.pages.length - 1, current + direction))), [item]);

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('story-reader-open');
    close.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
      document.body.classList.remove('story-reader-open');
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  function keydown(event) {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) {
      event.preventDefault(); navigate(['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1); return;
    }
    if (event.key !== 'Tab') return;
    const controls = [...panel.current.querySelectorAll('button:not(:disabled),[tabindex="0"]')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }

  return createPortal(<div className="story-reader" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={keydown}>
    <section ref={panel} className="story-reader-panel" role="dialog" aria-modal="true" aria-labelledby="story-reader-title" tabIndex={-1}>
      <button ref={close} type="button" className="story-reader-close" onClick={onClose} aria-label="合上故事">✕</button>
      <div className="story-reader-art"><img src={assetUrl(item.image)} alt={item.title} /><span className="story-reader-veil" aria-hidden="true" /><span className="story-reader-seal" aria-hidden="true">苗绣<br />小故事</span><span className="story-reader-thread" aria-hidden="true" /></div>
      <div className="story-reader-body">
        <span className="story-reader-eyebrow">苗族小故事 · {String(index + 1).padStart(2, '0')}</span><h2 id="story-reader-title">{item.title}</h2>
        <StoryText key={page} text={item.pages[page]} />
        <div className="story-reader-foot">
          <div className="story-reader-progress" aria-hidden="true">{item.pages.map((_, number) => <i key={number} className={`${number < page ? 'is-done' : ''}${number === page ? ' is-current' : ''}`} />)}</div>
          <span className="story-reader-count" aria-live="polite">{String(page + 1).padStart(2, '0')} / {String(item.pages.length).padStart(2, '0')}</span>
          <div className="story-reader-nav"><button type="button" onClick={() => navigate(-1)} disabled={page === 0} aria-label="上一节">‹</button>{page < item.pages.length - 1 ? <button type="button" onClick={() => navigate(1)} aria-label="下一节">›</button> : <button type="button" className="story-reader-done" onClick={onClose}>合上故事 ✓</button>}</div>
        </div>
        <p className="story-reader-hint">点击正文可直接显示全文 · ← → 翻节 · Esc 合上</p>
      </div>
    </section>
  </div>, document.body);
}
