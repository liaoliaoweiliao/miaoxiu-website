import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { levels } from './gameModel.js';

export default function UnlockDialog({ index, onClose, onWardrobe, onContinue }) {
  const dialogRef = useRef(null);
  const level = levels[index];

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  function onKeyDown(event) {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    if (event.key !== 'Tab') return;
    const buttons = dialogRef.current?.querySelectorAll('button:not(:disabled)');
    if (!buttons?.length) return;
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) {
      event.preventDefault(); first.focus();
    }
  }

  return createPortal(<div className="unlock-overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={onKeyDown}>
    <section ref={dialogRef} className="unlock-dialog" role="dialog" aria-modal="true" aria-labelledby="unlock-title" aria-describedby="unlock-description" tabIndex={-1}>
      <button type="button" className="unlock-close" onClick={onClose} aria-label="关闭解锁提示">×</button>
      <div className="unlock-symbol">{level.icon}</div><span className="eyebrow">纹样发现 · 衣橱解锁</span>
      <h2 id="unlock-title">你找到了{level.name}！</h2><p id="unlock-description">{level.description}</p>
      <div className="unlock-ticket">✓ {level.name}主题衣橱<br /><small>已获得一次专属抽取机会</small></div>
      <button type="button" className="primary-btn" onClick={onWardrobe}>前往苗绣衣橱 →</button>
      <button type="button" className="unlock-continue" onClick={onContinue}>{index < levels.length - 1 ? '继续寻找下一张' : '返回寻纹画面'}</button>
    </section>
  </div>, document.body);
}
