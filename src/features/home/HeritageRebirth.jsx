import { useEffect, useRef, useState } from 'react';
import { createEmbroideryScene } from './embroideryScene.js';
import { rebirthPalettes } from '../../data/heritageRebirth.js';

function ClothFallback() {
  return (
    <svg className="rebirth-fallback" viewBox="0 0 600 560" role="img" aria-label="紫青色花纹交织的数字绣衣静态图">
      <defs>
        <linearGradient id="rebirth-cloth" x2="1" y2="1"><stop stopColor="#b379f5" /><stop offset=".5" stopColor="#443d94" /><stop offset="1" stopColor="#ec8acb" /></linearGradient>
        <pattern id="rebirth-flowers" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M24 8Q35 0 34 15Q49 13 40 25Q49 38 34 34Q34 49 24 40Q12 49 14 34Q0 36 8 24Q0 12 15 14Q12 0 24 8Z" fill="none" stroke="#88e4e0" strokeWidth="1.3" /><circle cx="24" cy="24" r="6" fill="none" stroke="#f0a1df" /></pattern>
      </defs>
      <path d="M270 80Q300 56 330 80L350 115L500 365L340 475L315 180L300 140L285 180L260 475L100 365L250 115Z" fill="url(#rebirth-cloth)" fillOpacity=".45" stroke="#c9a2ff" />
      <path d="M270 80Q300 56 330 80L350 115L500 365L340 475L315 180L300 140L285 180L260 475L100 365L250 115Z" fill="url(#rebirth-flowers)" />
      <path d="M255 113L126 360L253 447M345 113L474 360L347 447M270 88L284 160L267 463M330 88L316 160L333 463" fill="none" stroke="#72e8da" strokeWidth="3" />
    </svg>
  );
}

function DigitalEmbroidery() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const dragRef = useRef(null);
  const settings = useRef({ scatter: 0, colour: rebirthPalettes[0].rgb, paused: false, yaw: 0, pitch: 0, resetSerial: 0 });
  const [scatter, setScatter] = useState(0);
  const [palette, setPalette] = useState(0);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState('loading');
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    function start() {
      sceneRef.current?.dispose();
      try {
        sceneRef.current = createEmbroideryScene(canvas, settings, () => setStatus('ready'));
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
    changeScatter(0);
    setPalette(0);
    setPaused(false);
    rotate(0, 0);
    update({ colour: rebirthPalettes[0].rgb, paused: false, resetSerial: settings.current.resetSerial + 1 });
  }

  const unavailable = status === 'unavailable';
  return (
    <div className="rebirth-digital" data-rebirth-state={status}>
      <div className="rebirth-copy">
        <p className="rebirth-eyebrow"><span /> HERITAGE, REIMAGINED</p>
        <h2 id="rebirth-title">传承与新生<span>让绣纹，<br />在数字中呼吸。</span></h2>
        <p className="rebirth-description">从一根丝线，到万千光点。<br />让古老的纹样离开布面，<br />在聚散之间，织出新的想象。</p>
        <div className="rebirth-palette" role="group" aria-label="绣衣配色">
          {rebirthPalettes.map((item, index) => (
            <button key={item.id} type="button" aria-pressed={palette === index} disabled={unavailable} onClick={() => { setPalette(index); update({ colour: item.rgb }); }}>
              <i style={{ background: `linear-gradient(135deg, ${item.colours.join(', ')})` }} aria-hidden="true" />{item.name}
            </button>
          ))}
        </div>
        <p className="rebirth-art-note">苗绣纹样启发的数字艺术想象</p>
      </div>

      <div className="rebirth-artwork">
        <div className="rebirth-orbit" aria-hidden="true" />
        <div className="rebirth-axis rebirth-axis-top" aria-hidden="true"><span>织 / WEAVE</span><span>形 / FORM</span></div>
        {status !== 'ready' && <ClothFallback />}
        <canvas
          ref={canvasRef}
          className="rebirth-canvas"
          tabIndex={unavailable ? -1 : 0}
          role="img"
          aria-label="可旋转的粒子绣衣。拖动或使用方向键旋转，下方滑块控制散开与聚合"
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
        <div className="rebirth-art-caption" aria-hidden="true"><span>虚实之间</span><i /><span>一线新生</span></div>
        <p className="rebirth-gesture" id="rebirth-gesture">{unavailable ? '当前设备展示静态绣衣' : '拖动旋转 · 轻触下方，解开一件绣衣'}</p>
      </div>

      <div className="rebirth-controls">
        <div className="rebirth-phase" aria-live="polite"><span>{scatter < 15 ? '01' : scatter < 85 ? '02' : '03'}</span><div><strong>{scatter < 15 ? '凝线成衣' : scatter < 85 ? '虚实相生' : '散作星尘'}</strong><small>{scatter < 15 ? '一针一线，皆有来处' : scatter < 85 ? '纹样在光中自由舒展' : '每一束光，都是新的可能'}</small></div></div>
        <div className="rebirth-scatter"><label htmlFor="rebirth-scatter">聚散程度 <output htmlFor="rebirth-scatter">{scatter}%</output></label><input id="rebirth-scatter" type="range" min="0" max="100" value={scatter} disabled={unavailable} onChange={(event) => changeScatter(Number(event.target.value))} /><div aria-hidden="true"><span>成衣</span><span>游离</span></div></div>
        <div className="rebirth-actions">
          <button type="button" className="rebirth-transform" disabled={unavailable} onClick={() => changeScatter(scatter >= 50 ? 0 : 100)}>{scatter >= 50 ? '聚拢成衣' : '散作星尘'}<span aria-hidden="true">↗</span></button>
          <button type="button" className="rebirth-pause" disabled={unavailable} aria-label={paused ? '继续绣衣动态' : '暂停绣衣动态'} aria-pressed={paused} onClick={() => { setPaused(!paused); update({ paused: !paused }); }}>{paused ? '继续' : '暂停'}</button>
          <button type="button" className="rebirth-reset" disabled={unavailable} onClick={reset}>重置</button>
        </div>
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
