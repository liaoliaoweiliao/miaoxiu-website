import { useEffect, useRef, useState } from 'react';
import { createEmbroideryScene } from './embroideryScene.js';
import { createEmbroideryMedia } from './embroideryMedia.js';
import { createRebirthPattern, initialRebirthPattern, rebirthDensities, rebirthMotifs, rebirthPalettes } from '../../data/heritageRebirth.js';

function ButterflyFallback() {
  return (
    <svg className="rebirth-fallback" viewBox="0 0 600 560" role="img" aria-label="红靛金银紫五色丝线蝴蝶纹静态图">
      <defs>
        <radialGradient id="rebirth-wing"><stop stopColor="#cbd3e1" /><stop offset=".36" stopColor="#334a7e" /><stop offset=".5" stopColor="#b02b43" /><stop offset=".7" stopColor="#6d488f" /><stop offset=".86" stopColor="#293b68" /><stop offset="1" stopColor="#d9ba7b" /></radialGradient>
        <pattern id="rebirth-fibres" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0L4 4M-1 3L1 5" stroke="#d9dfec" strokeWidth=".4" strokeOpacity=".5" /></pattern>
        <path id="rebirth-wing-outline" d="M296 245C240 135 102 70 62 134C12 208 138 279 290 278C140 244 59 286 92 358C145 475 267 432 296 275Z" />
      </defs>
      <g fill="url(#rebirth-wing)" stroke="#d7bb7d" strokeWidth="1.5"><use href="#rebirth-wing-outline" /><use href="#rebirth-wing-outline" transform="translate(600 0) scale(-1 1)" /></g>
      <g fill="url(#rebirth-fibres)"><use href="#rebirth-wing-outline" /><use href="#rebirth-wing-outline" transform="translate(600 0) scale(-1 1)" /></g>
      <path d="M300 210C290 176 260 167 263 186M300 210C310 176 340 167 337 186M300 220L300 355" fill="none" stroke="#dec7a4" strokeWidth="5" />
    </svg>
  );
}

function DigitalEmbroidery() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const dragRef = useRef(null);
  const mediaRef = useRef(null);
  const remixRef = useRef(null);
  const [particleCount, setParticleCount] = useState(() => window.innerWidth < 700 || navigator.hardwareConcurrency <= 4 ? 200000 : 400000);
  const settings = useRef({ scatter: 0, colour: rebirthPalettes[0].rgb, paused: false, yaw: 0, pitch: 0, resetSerial: 0, pattern: initialRebirthPattern, patternSerial: 0, particleCount, input: { x: 0, y: 0, amount: 0, level: 0 } });
  const [scatter, setScatter] = useState(0);
  const [palette, setPalette] = useState(0);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState('loading');
  const [rotation, setRotation] = useState(0);
  const [pattern, setPattern] = useState(initialRebirthPattern);
  const [patternSerial, setPatternSerial] = useState(0);
  const [remixMessage, setRemixMessage] = useState('蝴蝶为形，花卉为韵。每一根丝线，都有新的去向。');
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [media, setMedia] = useState({ camera: { status: 'off', message: '未开启 · 移动身体或手，带动转向与聚散。' }, microphone: { status: 'off', message: '未开启 · 用声音唤起绣线，以峰值换纹样。' } });

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const changed = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', changed);
    mediaRef.current = createEmbroideryMedia({
      onState: (kind, value) => setMedia((current) => ({ ...current, [kind]: value })),
      onInput: (kind, input) => {
        if (kind === 'camera') Object.assign(settings.current.input, { x: input.x, y: input.y, amount: input.amount });
        else settings.current.input.level = input.level;
        if (!settings.current.paused && !preference.matches) sceneRef.current?.redraw();
      },
      onPeak: () => { if (!settings.current.paused && !preference.matches) remixRef.current?.('声音峰值'); },
    });
    return () => {
      preference.removeEventListener('change', changed);
      mediaRef.current?.dispose();
      mediaRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (status === 'unavailable') mediaRef.current?.stopAll('当前展示静态蝶纹，媒体交互已关闭。');
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    function start() {
      sceneRef.current?.dispose();
      try {
        sceneRef.current = createEmbroideryScene(canvas, settings, () => setStatus('ready'), () => setStatus('unavailable'));
      } catch {
        sceneRef.current = null;
        setStatus('unavailable');
      }
    }
    function lost(event) {
      event.preventDefault();
      sceneRef.current?.dispose();
      sceneRef.current = null;
      setStatus('unavailable');
    }
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', start);
    start();
    return () => {
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', start);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  function update(change) {
    Object.assign(settings.current, change);
    sceneRef.current?.redraw();
  }

  function changeScatter(value) {
    setScatter(value);
    update({ scatter: value / 100 });
  }

  function rotate(yaw, pitch) {
    update({ yaw, pitch: Math.max(-0.55, Math.min(0.55, pitch)) });
    setRotation(yaw);
  }

  function reset() {
    mediaRef.current?.stopAll();
    changeScatter(0);
    setPalette(0);
    setPaused(false);
    rotate(0, 0);
    setPattern(initialRebirthPattern);
    setPatternSerial(0);
    setRemixMessage('已恢复初始纹样，媒体交互已关闭。');
    update({ colour: rebirthPalettes[0].rgb, paused: false, pattern: initialRebirthPattern, patternSerial: 0, resetSerial: settings.current.resetSerial + 1 });
  }

  function remix(source = '手动') {
    const next = createRebirthPattern(settings.current.pattern);
    const serial = settings.current.patternSerial + 1;
    setPattern(next);
    setPatternSerial(serial);
    setRemixMessage(`${source}换纹样 · 第 ${serial} 次新组合`);
    update({ pattern: next, patternSerial: serial });
  }
  remixRef.current = remix;

  const unavailable = status === 'unavailable';
  const mediaOn = Object.values(media).some((item) => ['active', 'requesting'].includes(item.status));
  return (
    <div className="rebirth-digital" data-rebirth-state={status} data-pattern-version={patternSerial}>
      <div className="rebirth-copy">
        <div><p className="rebirth-eyebrow">BUTTERFLY / REBORN IN THREADS</p><h2 id="rebirth-title">传承与新生<span>万缕成蝶，<br />一绣新生。</span></h2></div>
        <div className="rebirth-intro"><p className="rebirth-description">将苗绣蝴蝶纹，织入有深度的光。<br />红与靛蓝相映，金银穿行，紫色流转。<br />以动作舒展双翼，以声音唤醒丝线。</p><p className="rebirth-art-note">苗绣纹样启发的数字创作</p></div>
      </div>

      <div className="rebirth-artwork">
        <div className="rebirth-stage-mark" aria-hidden="true"><span>蝶 · 生命与起源</span><span>RED / INDIGO / GOLD / SILVER / VIOLET</span></div>
        {status !== 'ready' && <ButterflyFallback />}
        <canvas
          ref={canvasRef}
          className="rebirth-canvas"
          tabIndex={unavailable ? -1 : 0}
          role="img"
          aria-label="可旋转的三维丝线蝴蝶纹。拖动或使用方向键旋转，下方滑块控制散开与聚合"
          aria-describedby="rebirth-gesture"
          data-rotation={rotation.toFixed(2)}
          onPointerDown={(event) => {
            if (unavailable || (event.pointerType === 'mouse' && event.button !== 0)) return;
            dragRef.current = { x: event.clientX, y: event.clientY, yaw: settings.current.yaw, pitch: settings.current.pitch };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (drag) rotate(drag.yaw + (event.clientX - drag.x) * 0.009, drag.pitch + (event.clientY - drag.y) * 0.004);
          }}
          onPointerUp={() => { dragRef.current = null; }}
          onPointerCancel={() => { dragRef.current = null; }}
          onLostPointerCapture={() => { dragRef.current = null; }}
          onKeyDown={(event) => {
            if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'Home') rotate(0, 0);
            else rotate(settings.current.yaw + (event.key === 'ArrowLeft' ? -0.15 : event.key === 'ArrowRight' ? 0.15 : 0), settings.current.pitch + (event.key === 'ArrowUp' ? -0.1 : event.key === 'ArrowDown' ? 0.1 : 0));
          }}
        />
        <div className="rebirth-art-caption" aria-hidden="true"><span>以蝶为形</span><i /><span>以线为魂</span></div>
        <p className="rebirth-gesture" id="rebirth-gesture">{unavailable ? '当前设备展示静态蝶纹' : '拖动或方向键旋转 · 聚散之间，纹样新生'}</p>
      </div>

      <div className="rebirth-materials">
        <div className="rebirth-palette" role="group" aria-label="蝶纹配色">
          {rebirthPalettes.map((item, index) => <button key={item.id} type="button" aria-pressed={palette === index} disabled={unavailable} onClick={() => { setPalette(index); update({ colour: item.rgb }); }}><i style={{ background: `conic-gradient(${item.colours.join(', ')})` }} aria-hidden="true" />{item.name}</button>)}
        </div>
        <div className="rebirth-quality"><label htmlFor="rebirth-quality">纤维精细度</label><select id="rebirth-quality" disabled={unavailable} value={particleCount} onChange={(event) => { const count = Number(event.target.value); setParticleCount(count); update({ particleCount: count }); }}>{rebirthDensities.map((item) => <option key={item.count} value={item.count}>{item.name}</option>)}</select></div>
      </div>

      <div className="rebirth-controls">
        <div className="rebirth-phase" aria-live="polite"><span>{scatter < 15 ? '01' : scatter < 85 ? '02' : '03'}</span><div><strong>{scatter < 15 ? '万缕成蝶' : scatter < 85 ? '舒翼流光' : '散作星尘'}</strong><small>{rebirthMotifs[pattern.primary]} × {rebirthMotifs[pattern.secondary]} · 灵感重组</small></div></div>
        <div className="rebirth-scatter"><label htmlFor="rebirth-scatter">聚散程度 <output htmlFor="rebirth-scatter">{scatter}%</output></label><input id="rebirth-scatter" type="range" min="0" max="100" value={scatter} disabled={unavailable} onChange={(event) => changeScatter(Number(event.target.value))} /><div aria-hidden="true"><span>成蝶</span><span>游离</span></div></div>
        <div className="rebirth-actions">
          <button type="button" className="rebirth-transform" disabled={unavailable} onClick={() => changeScatter(scatter >= 50 ? 0 : 100)}>{scatter >= 50 ? '聚拢成蝶' : '散作星尘'}<span aria-hidden="true">↗</span></button>
          <button type="button" className="rebirth-pause" disabled={unavailable} aria-label={paused ? '继续蝶纹动态' : '暂停蝶纹动态'} aria-pressed={paused} onClick={() => { setPaused(!paused); update({ paused: !paused }); }}>{paused ? '继续' : '暂停'}</button>
          <button type="button" className="rebirth-reset" disabled={unavailable} onClick={reset}>重置</button>
        </div>
      </div>

      <div className="rebirth-inputs" role="group" aria-labelledby="rebirth-input-title" aria-describedby="rebirth-privacy">
        <div className="rebirth-input-heading"><div><p className="rebirth-input-kicker">与绣纹共创</p><h3 id="rebirth-input-title">以身为引，以声为线。</h3><p>可分别开启，也可同时使用；手动操作始终保留。</p></div><button type="button" className="rebirth-close-inputs" disabled={!mediaOn} onClick={() => mediaRef.current?.stopAll()}>关闭交互</button></div>
        <div className="rebirth-input-grid">
          {['camera', 'microphone'].map((kind) => {
            const label = kind === 'camera' ? '摄像头' : '麦克风';
            const device = media[kind];
            const active = device.status === 'active';
            const requesting = device.status === 'requesting';
            return <div className="rebirth-input-card" key={kind} data-device={kind} data-status={device.status}>
              <div className="rebirth-device-title"><span aria-hidden="true" className="rebirth-device-dot" /><strong>{kind === 'camera' ? '动作织纹' : '声音染线'}</strong><span>{active ? '已开启' : requesting ? '等待授权' : device.status === 'error' ? '暂不可用' : '未开启'}</span></div>
              <p id={`rebirth-${kind}-status`} role="status">{device.message}</p>
              <button type="button" aria-pressed={active || requesting} aria-describedby={`rebirth-${kind}-status rebirth-privacy`} disabled={status !== 'ready'} onClick={() => mediaRef.current?.toggle(kind)}>{requesting ? `取消${label}授权` : `${active ? '关闭' : '开启'}${label}`}</button>
            </div>;
          })}
        </div>
        <div className="rebirth-remix-row"><div><p role="status" className="rebirth-remix-status">{remixMessage}</p><p className="rebirth-motion-note">{reducedMotion ? '已遵循减少动态效果：画面静止，换纹样直接切换；声音不自动触发。' : paused ? '动态已暂停，媒体暂不影响画面；仍可手动换纹样。' : '新的组合会依次散开、穿梭、再聚合；聚散滑块仍可自由调节。'}</p></div><button type="button" className="rebirth-remix" disabled={unavailable} onClick={() => remix()}>随机换纹样 <span aria-hidden="true">↻</span></button></div>
        <p className="rebirth-privacy" id="rebirth-privacy">仅在点击开启后请求权限。音视频仅在浏览器本地分析，不录音、不保存、不上传。关闭交互、离开首页或隐藏页面时自动停止设备。</p>
      </div>
    </div>
  );
}

export default function HeritageRebirth() {
  return (
    <section className="heritage-rebirth" aria-label="传承与新生：数字绣境" data-heritage-rebirth="">
      <div className="rebirth-topbar"><p><span>04</span> 一根绣线的未来</p><span className="rebirth-label">数字绣境</span></div>
      <DigitalEmbroidery />
    </section>
  );
}
