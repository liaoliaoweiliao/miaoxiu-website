import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { assetUrl } from '../../utils/assets.js';

export default function StoryBook({ item, onClose, onRead }) {
  const [open, setOpen] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const panel = useRef(null);
  const close = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus({ preventScroll: true });
    const timer = window.setTimeout(() => setOpen(true), 1000);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  function keydown(event) {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    if (event.key !== 'Tab') return;
    const buttons = [...panel.current.querySelectorAll('button')];
    if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus(); }
  }
  return createPortal(<div className="story-animation-overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={keydown}>
    <section ref={panel} className="story-animation-shell" data-phase={open ? 'open' : 'cover'} role="dialog" aria-modal="true" aria-label={`${item.title}故事书`}>
      <div className="story-sparkles" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div>
      <div className="story-book-cover" aria-hidden={open}><img src={assetUrl('history/storybooks/cover-book-user.png')} alt="苗绣小故事图书" /></div>
      <div className="story-book-open" aria-hidden={!open}><img src={assetUrl(item.book)} alt={`${item.title}打开后的页面`} /></div>
      <button ref={close} type="button" className="story-animation-close" onClick={onClose} aria-label="合上故事">×</button>
      <button type="button" className="story-book-read" onClick={onRead}>阅读文字</button>
    </section>
  </div>, document.body);
}
