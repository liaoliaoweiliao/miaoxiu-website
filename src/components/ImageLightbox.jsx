import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { assetUrl } from '../utils/assets.js';
import { saveImage } from '../utils/saveImage.js';

const initialView = { scale: 1, x: 0, y: 0 };

export default function ImageLightbox({ artwork, onClose }) {
  const panelRef = useRef(null);
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const closeRef = useRef(null);
  const dragRef = useRef(null);
  const [view, setView] = useState(initialView);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState('');
  const title = artwork.title || '苗绣图片';
  const source = assetUrl(artwork.src);
  const extension = artwork.src.split('.').pop().toLowerCase();
  const filename = `${title.replace(/[\\/:*?"<>|]/g, '-')}.${extension}`;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('image-viewer-open');
    closeRef.current?.focus({ preventScroll: true });
    function handleKeyDown(event) {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const controls = [...panelRef.current.querySelectorAll('button, a[href]')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove('image-viewer-open');
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [onClose]);

  useEffect(() => { setView(initialView); setDragging(false); dragRef.current = null; }, [artwork.src]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (imageRef.current && stageRef.current) setView((previous) => constrain(previous));
    });
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  function constrain(next) {
    const image = imageRef.current;
    const stage = stageRef.current;
    const xLimit = Math.max(0, (image.clientWidth * next.scale - stage.clientWidth) / 2);
    const yLimit = Math.max(0, (image.clientHeight * next.scale - stage.clientHeight) / 2);
    return { ...next, x: Math.max(-xLimit, Math.min(xLimit, next.x)), y: Math.max(-yLimit, Math.min(yLimit, next.y)) };
  }

  function toggleZoom(point) {
    if (!imageRef.current?.clientWidth || !imageRef.current.clientHeight) return;
    if (view.scale > 1) setView(initialView);
    else {
      const rect = imageRef.current.getBoundingClientRect();
      const scale = 2.5;
      setView(constrain({ scale, x: point ? (rect.left + rect.width / 2 - point.clientX) * (scale - 1) : 0, y: point ? (rect.top + rect.height / 2 - point.clientY) * (scale - 1) : 0 }));
    }
    dragRef.current = null;
    setDragging(false);
  }

  function startDrag(event) {
    if (view.scale === 1 || event.button !== 0) return;
    event.preventDefault();
    dragRef.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: view.x, y: view.y };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
  }

  function moveDrag(event) {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    event.preventDefault();
    setView(constrain({ scale: view.scale, x: drag.x + event.clientX - drag.startX, y: drag.y + event.clientY - drag.startY }));
  }

  function endDrag(event) {
    if (dragRef.current?.id !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
  }

  return createPortal(
    <div className="modal image-lightbox" onClick={onClose}>
      <section ref={panelRef} className={`modal-body image-lightbox-body ${artwork.description ? 'has-details' : ''}`} role="dialog" aria-modal="true" aria-labelledby="image-viewer-title" onClick={(event) => event.stopPropagation()}>
        <button ref={closeRef} type="button" className="image-viewer-close" onClick={onClose} aria-label="关闭图片欣赏">✕</button>
        <div ref={stageRef} className={`image-viewer-stage ${view.scale > 1 ? 'is-zoomed' : ''} ${dragging ? 'is-dragging' : ''}`} onDoubleClick={(event) => { event.preventDefault(); toggleZoom(event); }} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
          <img ref={imageRef} src={source} alt={title} draggable={false} style={{ transform: `translate(${view.x}px,${view.y}px) scale(${view.scale})` }} />
        </div>
        <div className="image-viewer-caption">
          <h2 id="image-viewer-title">{title}</h2>
          <button type="button" className="image-viewer-zoom" onClick={() => toggleZoom()} aria-pressed={view.scale > 1}>{view.scale > 1 ? '↙ 恢复全图' : '⤢ 放大细节'}</button>
          <a className="image-viewer-save" href={source} download={filename} aria-disabled={saving} onClick={async (event) => {
            if (!window.miaoxiuDesktop) return;
            event.preventDefault();
            if (saving) return;
            setSaving(true);
            try { const result = await saveImage(source, filename); setSaveNote(result.status === 'saved' ? `图片已保存至：${result.path}` : '已取消保存。'); }
            catch (error) { setSaveNote(error.message); }
            finally { setSaving(false); }
          }}>{saving ? '正在保存…' : '⇩ 保存图片'}</a>
        </div>
        {artwork.description && <p className="image-viewer-details">{artwork.description}</p>}
        {saveNote && <p role="status">{saveNote}</p>}
        <p className="image-viewer-hint">双击图片放大，再次双击恢复全图；放大后可拖动欣赏。Esc 关闭</p>
      </section>
    </div>,
    document.body,
  );
}
