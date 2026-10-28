import { useEffect, useRef, useState } from 'react';
import { particleMotifs, silkDensities } from '../../data/homeParticles.js';
import { assetUrl } from '../../utils/assets.js';
import { clamp } from './particleModel.js';
import { createParticleRenderer } from './particleRenderer.js';
import useParticleSensors from './useParticleSensors.js';
import WeavingIntro from './WeavingIntro.jsx';

export default function ParticleHeritage() {
  const canvasRef=useRef(null), stageRef=useRef(null);
  const input=useRef({ target:0, burst:0, seed:0, motion:0, audio:0, body:{x:0,y:0}, pointer:{x:5,y:5}, drag:{x:0,y:0}, paused:false });
  const [motif,setMotif]=useState(0),[pair,setPair]=useState(0),[density,setDensity]=useState(200000);
  const [phase,setPhase]=useState('weaving'),[entered,setEntered]=useState(false);
  const [ready,setReady]=useState(false), [fallback,setFallback]=useState(''), [count,setCount]=useState(0),[renderKey,setRenderKey]=useState('');
  const [reduced,setReduced]=useState(false), [started,setStarted]=useState(false), [revision,setRevision]=useState(0);
  const dragging=useRef(null),renderedSource=useRef(null);
  function select(index, burst = true) {
    input.current.from=input.current.visualMorph??input.current.target;
    input.current.target=index;
    if (burst) { input.current.burst=1; input.current.seed=Math.random()*100; }
    setMotif(index); setRevision(value=>value+1);
  }
  function regroup() { select(Math.random()<.5 ? 0 : 1); }
  function handGesture(pose) {
    if(pose==='fist') {
      if(input.current.target===1)setPair(value=>(value+1)%particleMotifs.length);
      select(0);
    } else if(pose==='open')select(1);
  }
  const sensors=useParticleSensors(input,regroup,handGesture);

  useEffect(() => {
    const query=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>{setReduced(query.matches);input.current.reduced=query.matches;};
    update(); query.addEventListener('change',update);
    const observer=new IntersectionObserver(entries=>{ if(entries[0].isIntersecting)setStarted(true); },{rootMargin:'180px'});
    observer.observe(stageRef.current);
    return ()=>{query.removeEventListener('change',update);observer.disconnect();};
  },[]);

  useEffect(() => {
    if (!started||!entered) return;
    setReady(false);setFallback('');
    let disposed=false, renderer, frame, visible=true, previous=0, elapsed=0,lastDraw=0;
    let morph=input.current.target, scatter=0, rotation={x:0,y:0}, renderedRevision=-1,announced=false,lastWidth=0,lastHeight=0;
    const controller=new AbortController();
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}); observer.observe(stageRef.current);
    const sources=[particleMotifs[pair],particleMotifs[pair].modern];
    const previousSource=sources.includes(renderedSource.current)?null:renderedSource.current;
    createParticleRenderer(canvasRef.current,sources,()=>{if(!disposed){setReady(false);setFallback('三维画面已暂停，当前显示原图；重新进入首页可重试。');}},{count:density,signal:controller.signal,previousSource,initialTarget:input.current.target})
      .then(instance=>{
        if(disposed){instance.dispose();return;} renderer=instance;setCount(instance.count);
        function tick(now) {
          if(disposed)return;
          frame=requestAnimationFrame(tick);
          const dt=Math.min((now-(previous||now))/1000,.1);
          if(!visible||document.hidden)return;
          if(now-lastDraw<30)return;lastDraw=now;previous=now;
          const state=input.current;
          const width=canvasRef.current.clientWidth,height=canvasRef.current.clientHeight;
          if((state.paused||state.reduced)&&renderedRevision===state.revision&&width===lastWidth&&height===lastHeight)return;
          lastWidth=width;lastHeight=height;
          if(!state.paused)elapsed+=dt;

          const smoothing=1-Math.exp(-dt*3);
          morph=state.reduced||state.paused?state.target:morph+(state.target-morph)*smoothing;
          state.burst=Math.max(0,state.burst-dt*.28);
          const desired=state.reduced||state.paused?0:Math.max(Math.sin(state.burst*Math.PI)*.88,state.audio*.7,state.motion*.7);
          scatter=state.reduced||state.paused?0:scatter+(desired-scatter)*(1-Math.exp(-dt*5));
          const rx=state.drag.x+state.body.x*state.motion*.8+(state.reduced?0:Math.sin(elapsed*.18)*.14);
          const ry=state.drag.y+state.body.y*state.motion*.5;
          if(state.paused||state.reduced)rotation={x:rx,y:ry};
          else {rotation.x+=(rx-rotation.x)*smoothing;rotation.y+=(ry-rotation.y)*smoothing;}
          state.visualMorph=morph;
          renderer.draw({morph,from:state.from??state.target,target:state.target,progress:state.reduced?1:1-state.burst,scatter,time:state.reduced?0:elapsed,rotation,pointer:state.pointer,seed:state.seed});
          renderedSource.current=sources[state.target];
          renderedRevision=state.revision;
          if(!announced){announced=true;setRenderKey(`${pair}-${density}`);setReady(true);setPhase('interactive');}
        }
        frame=requestAnimationFrame(tick);
      }).catch(error=>{if(!disposed){setFallback(error.message);setPhase('interactive');}});
    return ()=>{disposed=true;controller.abort();cancelAnimationFrame(frame);observer.disconnect();renderer?.dispose();};
  },[started,entered,pair,density]);

  // A manual change also renders while the animation is paused.
  input.current.revision=revision;
  const isReady=ready&&renderKey===`${pair}-${density}`;
  const current=motif===0?particleMotifs[pair]:particleMotifs[pair].modern;
  useEffect(()=>{if(phase==='interactive')canvasRef.current?.focus({preventScroll:true});},[phase]);
  function point(event) {
    if(phase!=='interactive')return;
    const rect=event.currentTarget.getBoundingClientRect();
    input.current.pointer={x:(event.clientX-rect.left)/rect.width*2-1,y:1-(event.clientY-rect.top)/rect.height*2};
    if(dragging.current) {
      const dx=event.clientX-dragging.current.x,dy=event.clientY-dragging.current.y;
      input.current.drag={x:dragging.current.rx+dx*.005,y:clamp(dragging.current.ry+dy*.005,-.9,.9)};
      setRevision(value=>value+1);
    }
  }
  return <section className="particle-heritage" aria-labelledby="particle-title" data-motif={motif} data-revision={revision} data-phase={phase} data-pair={particleMotifs[pair].key} data-form={motif===0?'motif':'application'}>
    <header className="particle-heading"><span>✧　纹样 · 无限新生　✧</span><h2 id="particle-title">传承与创新</h2><p>以星尘为线，让古老绣纹与此刻的你相遇</p></header>
    <div className="particle-experience">
      <div className="particle-stage" ref={stageRef}>
        {phase==='interactive'&&<div className="particle-orbit" aria-hidden="true" />}
        {phase==='interactive'&&!isReady&&!fallback&&<p className="silk-loading" role="status">彩色丝线正在汇聚…</p>}
        {phase==='interactive'&&fallback&&<svg className="particle-original" viewBox={(current.crop||[0,0,1254,1254]).join(' ')} role="img" aria-label={`${current.name}原图预览`}><image href={assetUrl(current.image)} width="1254" height="1254" /></svg>}
        <canvas key={`${pair}-${density}`} ref={canvasRef} className={`particle-main-canvas ${isReady&&!fallback?'is-ready':''}`} aria-label="三维纹样粒子画布，拖动旋转，轻点或回车随机重组" tabIndex={phase==='interactive'?0:-1} aria-hidden={phase!=='interactive'}
          data-ready={isReady&&!fallback?'true':'false'} data-particles={count}
          onPointerDown={event=>{if(phase!=='interactive'||event.button!==0)return;event.currentTarget.setPointerCapture(event.pointerId);dragging.current={x:event.clientX,y:event.clientY,rx:input.current.drag.x,ry:input.current.drag.y};}}
          onPointerMove={point} onPointerUp={event=>{if(dragging.current&&Math.hypot(event.clientX-dragging.current.x,event.clientY-dragging.current.y)<7)select(1-input.current.target);dragging.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}
          onPointerCancel={()=>{dragging.current=null;}}
          onPointerLeave={()=>{if(!dragging.current)input.current.pointer={x:5,y:5};}}
          onKeyDown={event=>{if(phase!=='interactive')return;if(/^[1-5]$/.test(event.key)){setPair(Number(event.key)-1);select(0);return;}if(event.key===' '){event.preventDefault();select(1-input.current.target);return;}if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();input.current.drag.x+=event.key==='ArrowLeft'?-.15:event.key==='ArrowRight'?.15:0;input.current.drag.y=clamp(input.current.drag.y+(event.key==='ArrowUp'?-.15:event.key==='ArrowDown'?.15:0),-.9,.9);setRevision(value=>value+1);}if(event.key==='Enter'){event.preventDefault();regroup();}}} />
        <span className="particle-stage-tag">MIAO / LIVING PATTERNS</span>
        {phase==='interactive'&&<span className="particle-stage-hint">拖动旋转 · 点击切换应用 · 回车随机缠绕</span>}
        {phase!=='interactive'&&<WeavingIntro reduced={reduced} onFlying={()=>setPhase('flying')} onComplete={()=>setEntered(true)} />}
        <div className={`particle-camera ${sensors.camera==='on'?'is-on':''}`}><video ref={sensors.videoRef} muted playsInline aria-label="本地摄像头体感预览" /><span>{sensors.gesture}</span></div>
        {fallback&&<p className="particle-fallback" role="status">{fallback}</p>}
      </div>
      {phase==='interactive'&&<div className="particle-sensor-panel">
        <div className="silk-controls">
          <label>纹样与应用<select aria-label="选择纹样与现代应用" value={pair} onChange={event=>{setPair(Number(event.target.value));select(0);}}>{particleMotifs.map((item,index)=><option key={item.key} value={index}>{item.name} → {item.modern.name}</option>)}</select></label>
          <button type="button" className="silk-form-toggle" onClick={()=>select(1-input.current.target)}>{motif===0?'查看现代应用':'返回传统纹样'}</button>
          <label>丝线密度<select aria-label="选择丝线粒子数量" value={density} onChange={event=>setDensity(Number(event.target.value))}>{silkDensities.map(number=><option key={number} value={number}>{number/10000} 万</option>)}</select></label>
          <span className="silk-count" aria-live="polite">{current.name} · {isReady?`${count/10000} 万丝线粒子`:'正在汇聚'}</span>
        </div>
        <div className="particle-sensors"><div className="particle-sensor-intro"><h4>让纹样，回应你</h4><p>握拳收拢为传统纹样，张手拉出丝线，织成对应的现代应用；再次握拳进入下一组纹样。保持手势半秒即可，手掌移动可转动画面。声音越强，丝线越舒展。</p></div>
          <div className="particle-sensor-buttons">{[['camera','摄像头'],['microphone','麦克风']].map(([key,label])=><button key={key} type="button" aria-pressed={sensors[key]==='on'} onClick={()=>sensors.toggle(key)}>{sensors[key]==='pending'?`取消${label}请求`:sensors[key]==='on'?`关闭${label}`:`开启${label}`}<i aria-hidden="true" style={{'--level':sensors.levels[key]}} /></button>)}</div>
          <p className="particle-privacy">仅在开启后使用设备，画面与声音只在本机处理，不录制、不上传。离开首页或切换标签页自动关闭。</p>
          <p className="particle-device-status" role="status">{sensors.notice||[sensors.camera==='on'?sensors.gesture:'',sensors.microphone==='on'?'声音已开启':''].filter(Boolean).join(' · ')||'无需开启设备，也可拖动或点击体验。'}</p>
        </div>
        {reduced&&<p className="particle-motion-note">已遵循减少动态效果设置，纹样切换保持静态。</p>}
      </div>}
    </div>
  </section>;
}
