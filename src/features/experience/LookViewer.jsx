import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { assetUrl } from '../../utils/assets.js';
import { setById, previewLayers, hasOutfit } from './gameModel.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const initialView = { scale: 1, x: 0, y: 0 };

export default function LookViewer({ collection, revision }) {
  const [view, setView] = useState(initialView);
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef(null);
  const rootRef = useRef(null);
  const expandButton = useRef(null);
  const points = useRef(new Map());
  const pinch = useRef(0);
  const outfit = setById(collection.equipped[collection.gender]);
  const dressed = hasOutfit(collection);
  const layer = previewLayers(collection)[0];
  const appearance = `${collection.gender}-${outfit?.id || 'base'}-${revision}`;

  function constrain(next) {
    const rect = viewportRef.current?.getBoundingClientRect();
    const scale = clamp(next.scale, 1, 3);
    return { scale, x: clamp(next.x, -(rect?.width || 0) * scale / 2, (rect?.width || 0) * scale / 2), y: clamp(next.y, -(rect?.height || 0) * (scale - 1) / 2, (rect?.height || 0) * (scale - 1) / 2) };
  }
  const change = (update) => setView((previous) => constrain(typeof update === 'function' ? update(previous) : update));
  const reset = () => setView(initialView);

  useEffect(() => { setView(initialView); points.current.clear(); pinch.current = 0; setDragging(false); }, [appearance]);
  useEffect(() => {
    const viewport = viewportRef.current;
    function wheel(event) {
      if (event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      change((previous) => ({ ...previous, scale: previous.scale * Math.exp(-clamp(event.deltaY, -100, 100) * 0.002) }));
    }
    viewport?.addEventListener('wheel', wheel, { passive: false });
    return () => viewport?.removeEventListener('wheel', wheel);
  }, [expanded]);
  useEffect(() => {
    if (!expanded) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    viewportRef.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = previousOverflow; expandButton.current?.focus({ preventScroll: true }); };
  }, [expanded]);
  useEffect(() => {
    function resized() { change((previous) => previous); }
    window.addEventListener('resize', resized);
    return () => { window.removeEventListener('resize', resized); points.current.clear(); };
  }, []);

  const distance = () => { const [first, second] = [...points.current.values()]; return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0; };
  function pointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    if (points.current.size === 2) pinch.current = distance();
  }
  function pointerMove(event) {
    const previous = points.current.get(event.pointerId);
    if (!previous) return;
    points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (points.current.size === 2) {
      const next = distance(), oldDistance = pinch.current;
      if (oldDistance > 0) change((current) => ({ ...current, scale: current.scale * next / oldDistance }));
      pinch.current = next;
    } else change((current) => ({ ...current, x: current.x + event.clientX - previous.x, y: current.y + event.clientY - previous.y }));
  }
  function release(event) { points.current.delete(event.pointerId); pinch.current = 0; if (!points.current.size) setDragging(false); }
  function onKeyDown(event) {
    if (event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape' && expanded) { event.preventDefault(); setExpanded(false); return; }
    if (expanded && event.key === 'Tab') {
      const controls = [...(rootRef.current?.querySelectorAll('button:not(:disabled),[tabindex="0"]') || [])];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (event.target !== viewportRef.current) return;
    const keys = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] };
    if (keys[event.key]) { const [x, y] = keys[event.key]; change((current) => ({ ...current, x: current.x + x, y: current.y + y })); }
    else if (event.key === '+' || event.key === '=') change((current) => ({ ...current, scale: current.scale + 0.25 }));
    else if (event.key === '-') change((current) => ({ ...current, scale: current.scale - 0.25 }));
    else if (event.key === '0') reset();
    else return;
    event.preventDefault();
  }

  const viewer = <div ref={rootRef} className={`look-viewer look-arriving ${expanded ? 'viewer-expanded' : ''}`} role={expanded ? 'dialog' : 'region'} aria-modal={expanded || undefined} aria-label="人物服饰观看器" onKeyDown={onKeyDown}>
    <div className="viewer-header"><span>✧ 服饰观赏</span><small>{outfit ? '整套穿戴' : '原始形象'}</small></div>
    <div ref={viewportRef} className={`viewer-viewport ${dragging ? 'is-dragging' : ''}`} tabIndex={0} role="group" aria-label="拖拽移动人物，滚轮或双指缩放，方向键移动，加减号缩放，零键复位" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} onDoubleClick={reset}>
      <div className="viewer-halo" aria-hidden="true" /><div className="viewer-floor" aria-hidden="true" />
      <div className="viewer-actor" style={{ transform: `translate(${view.x}px,${view.y}px) scale(${view.scale})` }}><div className="avatar-canvas" aria-label="当前人物预览"><div key={appearance} className="garment-display garment-enter" data-appearance={appearance}>
        <img className={`whole-avatar ${dressed ? 'is-dressed' : ''}`} src={assetUrl(layer.src)} alt={dressed ? '已穿戴整套服装的人物' : collection.gender === 'girl' ? '原始女孩形象' : '原始男孩形象'} />
        {dressed && <><span className="garment-shimmer" style={{ '--garment-mask': `url("${assetUrl(layer.src)}")` }} aria-hidden="true" /><span className="garment-sparks" aria-hidden="true">{[0, 1, 2, 3, 4].map((index) => <i key={index} style={{ '--glint': index }}>✧</i>)}</span></>}
      </div></div></div><span className="viewer-corner viewer-corner-tl" aria-hidden="true" /><span className="viewer-corner viewer-corner-br" aria-hidden="true" />
    </div>
    <div className="viewer-caption">{outfit ? outfit.name : collection.gender === 'girl' ? '苗绣姑娘' : '苗绣少年'}</div>
    <div className="viewer-tools" role="group" aria-label="观赏控制"><button type="button" onClick={() => change((current) => ({ ...current, scale: current.scale - 0.25 }))} aria-label="缩小人物" disabled={view.scale <= 1}>−</button><output className="viewer-scale" aria-live="polite">{Math.round(view.scale * 100)}%</output><button type="button" onClick={() => change((current) => ({ ...current, scale: current.scale + 0.25 }))} aria-label="放大人物" disabled={view.scale >= 3}>＋</button><span /><button type="button" onClick={reset}>复位</button><button ref={expandButton} type="button" onClick={() => setExpanded(!expanded)} aria-label={expanded ? '退出全屏观赏' : '全屏观赏'} aria-pressed={expanded}>{expanded ? '收起' : '全屏'}</button></div>
    <p className="viewer-hint">拖拽移动 · 滚轮 / 双指缩放 · 双击复位</p>
  </div>;
  return expanded ? createPortal(viewer, document.getElementById('overlay-root') || document.body) : viewer;
}
