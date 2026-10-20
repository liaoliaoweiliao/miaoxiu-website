import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { themeById } from './gameModel.js';

export default function UnlockDialog({ theme, onClose, onWardrobe }) {
  const dialogRef = useRef(null);
  const level = themeById(theme);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);

  function onKeyDown(event) {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    if (event.key !== 'Tab') return;
    const buttons = dialogRef.current?.querySelectorAll('button');
    const first = buttons?.[0], last = buttons?.[buttons.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) { event.preventDefault(); first?.focus(); }
  }

  return createPortal(<div className="unlock-overlay" onKeyDown={onKeyDown} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><section ref={dialogRef} className="unlock-dialog" role="dialog" aria-modal="true" aria-labelledby="unlock-title" tabIndex={-1}>
    <button type="button" className="unlock-close" onClick={onClose} aria-label="关闭">×</button><div className="unlock-symbol">{level.icon}</div><span className="eyebrow">寻纹成功</span><h2 id="unlock-title">你找到了{level.name}！</h2><p>{level.description}</p><div className="unlock-ticket">{level.name}卡池已解锁<br /><small>先选择角色，再抽取整套服装为人物换装</small></div><button type="button" className="primary-btn" onClick={onWardrobe}>进入对应苗绣衣橱 →</button>
  </section></div>, document.getElementById('overlay-root') || document.body);
}
