import { useEffect, useRef, useState } from 'react';
import { createPortal, preload } from 'react-dom';
import { assetUrl } from '../../utils/assets.js';

const closedBookCover = 'history/storybooks/closed-book-user.png';

export default function StoryBook({ item, onClose }) {
  const [phase, setPhase] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'open' : 'cover');
  const panel = useRef(null);
  const close = useRef(null);
  const openingTimer = useRef(null);
  const closing = useRef(false);
  useEffect(() => {
    preload(assetUrl(closedBookCover), { as: 'image' });
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus({ preventScroll: true });
    openingTimer.current = window.setTimeout(() => setPhase('open'), 1000);
    return () => {
      window.clearTimeout(openingTimer.current);
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    if (phase !== 'closing') return undefined;
    // Also finish if animations are interrupted, for example by a motion preference change.
    const timer = window.setTimeout(onClose, 2000);
    return () => window.clearTimeout(timer);
  }, [phase, onClose]);
  function requestClose() {
    if (closing.current) return;
    closing.current = true;
    window.clearTimeout(openingTimer.current);
    if (phase === 'cover' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) onClose();
    else setPhase('closing');
  }
  function keydown(event) {
    if (event.key === 'Escape') { event.preventDefault(); requestClose(); }
    if (event.key !== 'Tab') return;
    const buttons = [...panel.current.querySelectorAll('button')];
    if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus(); }
  }
  return createPortal(<div className={`story-animation-overlay${phase === 'closing' ? ' is-closing' : ''}`} onClick={(event) => { if (event.target === event.currentTarget) requestClose(); }} onKeyDown={keydown} onAnimationEnd={(event) => {
    if (event.target === event.currentTarget && event.animationName === 'storyBookDismiss') onClose();
  }}>
    <section ref={panel} className="story-animation-shell" data-phase={phase} role="dialog" aria-modal="true" aria-label={`${item.title}故事书`}>
      <div className="story-sparkles" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div>
      <div className="story-book-cover" aria-hidden={phase !== 'cover'}><img src={assetUrl('history/storybooks/cover-book-user.png')} alt="苗绣小故事图书" /></div>
      <div className="story-book-open" aria-hidden={phase === 'cover'}>
        <div className="story-book-spread" style={{ '--story-spread': `url("${assetUrl(item.book)}")`, '--story-cover': `url("${assetUrl(closedBookCover)}")` }}>
          <img src={assetUrl(item.book)} alt={`${item.title}打开后的页面`} />
          <div className="story-book-fold" aria-hidden="true"><div className="story-book-right" /><div className="story-book-leaf"><div className="story-book-leaf-front" /><div className="story-book-leaf-back" /></div></div>
        </div>
      </div>
      <button ref={close} type="button" className="story-animation-close" onClick={requestClose} aria-disabled={phase === 'closing'} aria-label="合上故事">×</button>
    </section>
  </div>, document.body);
}
