import { useEffect, useRef, useState } from 'react';
import { particleMotifs } from '../../data/homeParticles.js';
import { assetUrl } from '../../utils/assets.js';
import { clamp } from './particleModel.js';
import { createParticleRenderer } from './particleRenderer.js';
import useParticleSensors from './useParticleSensors.js';

export default function ParticleHeritage() {
  const canvasRef=useRef(null), stageRef=useRef(null);
  const input=useRef({ target:0, burst:0, seed:0, motion:0, audio:0, body:{x:0,y:0}, pointer:{x:5,y:5}, drag:{x:0,y:0}, paused:false, auto:true });
  const [motif,setMotif]=useState(0), [paused,setPaused]=useState(false), [automatic,setAutomatic]=useState(true);
  const [ready,setReady]=useState(false), [fallback,setFallback]=useState(''), [count,setCount]=useState(0);
  const [reduced,setReduced]=useState(false), [started,setStarted]=useState(false), [revision,setRevision]=useState(0);
  const dragging=useRef(null);
  function select(index, burst = true) {
    input.current.target=index;
    if (burst) { input.current.burst=1; input.current.seed=Math.random()*100; }
    setMotif(index); setRevision(value=>value+1);
  }
  function regroup() { select(Math.random()<.5 ? 0 : 1); }
  const sensors=useParticleSensors(input,regroup);

  useEffect(() => {
    const query=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>{setReduced(query.matches);input.current.reduced=query.matches;input.current.auto=!query.matches;setAutomatic(!query.matches);};
    update(); query.addEventListener('change',update);
    const observer=new IntersectionObserver(entries=>{ if(entries[0].isIntersecting)setStarted(true); },{rootMargin:'180px'});
    observer.observe(stageRef.current);
    return ()=>{query.removeEventListener('change',update);observer.disconnect();};
  },[]);

  useEffect(() => {
    if (!started) return;
    let disposed=false, renderer, frame, visible=true, previous=0, elapsed=0, lastCycle=0;
    let morph=input.current.target, scatter=0, rotation={x:0,y:0}, renderedRevision=-1;
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}); observer.observe(stageRef.current);
    createParticleRenderer(canvasRef.current,particleMotifs.map(item=>assetUrl(item.image)),()=>{if(!disposed){setReady(false);setFallback('三维画面已暂停，当前显示原图；重新进入首页可重试。');}})
      .then(instance=>{
        if(disposed){instance.dispose();return;} renderer=instance;setCount(instance.count);setReady(true);
        function tick(now) {
          if(disposed)return;
          frame=requestAnimationFrame(tick);
          const dt=Math.min((now-(previous||now))/1000,.05);previous=now;
          if(!visible||document.hidden)return;
          const state=input.current;
          if(state.paused&&renderedRevision===state.revision)return;
          if(!state.paused)elapsed+=dt;
          if(!state.paused&&state.auto&&!state.reduced&&elapsed-lastCycle>13){lastCycle=elapsed;select(1-state.target);}
          const smoothing=1-Math.exp(-dt*3);
          morph=state.reduced||state.paused?state.target:morph+(state.target-morph)*smoothing;
          state.burst=Math.max(0,state.burst-dt*.48);
          const desired=state.reduced||state.paused?0:Math.max(Math.sin(state.burst*Math.PI)*.88,state.audio*.7,state.motion*.7);
          scatter=state.reduced||state.paused?0:scatter+(desired-scatter)*(1-Math.exp(-dt*5));
          const rx=state.drag.x+state.body.x*state.motion*.8+(state.reduced?0:Math.sin(elapsed*.18)*.14);
          const ry=state.drag.y+state.body.y*state.motion*.5;
          if(state.paused||state.reduced)rotation={x:rx,y:ry};
          else {rotation.x+=(rx-rotation.x)*smoothing;rotation.y+=(ry-rotation.y)*smoothing;}
          renderer.draw({morph,scatter,time:state.reduced?0:elapsed,rotation,pointer:state.pointer,seed:state.seed});
          renderedRevision=state.revision;
        }
        frame=requestAnimationFrame(tick);
      }).catch(error=>{if(!disposed)setFallback(error.message);});
    return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();renderer?.dispose();};
  },[started]);

  // A manual change also renders while the animation is paused.
  input.current.revision=revision;
  const current=particleMotifs[motif];
  function point(event) {
    const rect=event.currentTarget.getBoundingClientRect();
    input.current.pointer={x:(event.clientX-rect.left)/rect.width*2-1,y:1-(event.clientY-rect.top)/rect.height*2};
    if(dragging.current) {
      const dx=event.clientX-dragging.current.x,dy=event.clientY-dragging.current.y;
      input.current.drag={x:dragging.current.rx+dx*.005,y:clamp(dragging.current.ry+dy*.005,-.9,.9)};
      setRevision(value=>value+1);
    }
  }
  return <section className="particle-heritage" aria-labelledby="particle-title" data-motif={motif} data-revision={revision}>
    <header className="particle-heading"><span>✧　纹样 · 无限新生　✧</span><h2 id="particle-title">传承与创新</h2><p>以星尘为线，让古老绣纹与此刻的你相遇</p></header>
    <div className="particle-experience">
      <div className="particle-stage" ref={stageRef}>
        <div className="particle-orbit" aria-hidden="true" />
        {(!ready||fallback)&&<img className="particle-original" src={assetUrl(current.image)} alt={`${current.name}原图预览`} />}
        <canvas ref={canvasRef} className={ready&&!fallback?'is-ready':''} aria-label="三维纹样粒子画布，拖动旋转，使用下方按钮切换纹样" tabIndex={0}
          data-ready={ready&&!fallback?'true':'false'} data-particles={count}
          onPointerDown={event=>{if(event.button!==0)return;event.currentTarget.setPointerCapture(event.pointerId);dragging.current={x:event.clientX,y:event.clientY,rx:input.current.drag.x,ry:input.current.drag.y};}}
          onPointerMove={point} onPointerUp={event=>{dragging.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}
          onPointerCancel={()=>{dragging.current=null;}}
          onPointerLeave={()=>{if(!dragging.current)input.current.pointer={x:5,y:5};}}
          onKeyDown={event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();input.current.drag.x+=event.key==='ArrowLeft'?-.15:event.key==='ArrowRight'?.15:0;input.current.drag.y=clamp(input.current.drag.y+(event.key==='ArrowUp'?-.15:event.key==='ArrowDown'?.15:0),-.9,.9);setRevision(value=>value+1);}if(event.key==='Enter'){event.preventDefault();regroup();}}} />
        <span className="particle-stage-tag">MIAO / LIVING PATTERNS</span>
        <span className="particle-stage-hint">拖动旋转 · 方向键转动 · 回车重组</span>
        <div className={`particle-camera ${sensors.camera==='on'?'is-on':''}`}><video ref={sensors.videoRef} muted playsInline aria-label="本地摄像头体感预览" /><span>体感已开启</span></div>
        {fallback&&<p className="particle-fallback" role="status">{fallback}</p>}
      </div>
      <aside className="particle-guide">
        <span className="particle-chapter">{current.chapter}</span><h3>{current.title}</h3><p className="particle-description">{current.description}</p>
        <div className="particle-motifs" role="group" aria-label="选择粒子纹样">{particleMotifs.map((item,index)=><button key={item.name} type="button" aria-pressed={motif===index} onClick={()=>{input.current.auto=false;setAutomatic(false);select(index);}}><img src={assetUrl(item.image)} alt="" /><span>{item.name}</span></button>)}</div>
        <button className="particle-regroup" type="button" onClick={regroup}>✧ 随机重组</button>
        <div className="particle-playback"><button type="button" disabled={reduced} aria-pressed={automatic} onClick={()=>{input.current.auto=!automatic;setAutomatic(!automatic);}}>自动演绎{automatic?'：开':'：关'}</button><button type="button" aria-pressed={paused} onClick={()=>{input.current.paused=!paused;setPaused(!paused);setRevision(value=>value+1);}}>{paused?'继续动画':'暂停动画'}</button></div>
        <div className="particle-sensors"><h4>让纹样，回应你</h4><p>挥手或移动身体改变流向；声音越强，星尘越舒展。明显的动作或声音会唤起一次随机重组。</p>
          <div className="particle-sensor-buttons">{[['camera','摄像头'],['microphone','麦克风']].map(([key,label])=><button key={key} type="button" aria-pressed={sensors[key]==='on'} onClick={()=>sensors.toggle(key)}>{sensors[key]==='pending'?`取消${label}请求`:sensors[key]==='on'?`关闭${label}`:`开启${label}`}<i aria-hidden="true" style={{'--level':sensors.levels[key]}} /></button>)}</div>
          <p className="particle-privacy">仅在开启后使用设备，画面与声音只在本机处理，不录制、不上传。离开首页或切换标签页自动关闭。</p>
          <p className="particle-device-status" role="status">{sensors.notice||[sensors.camera==='on'?'体感已开启':'',sensors.microphone==='on'?'声音已开启':''].filter(Boolean).join(' · ')||'无需开启设备，也可拖动或点击体验。'}</p>
        </div>
        {reduced&&<p className="particle-motion-note">已遵循减少动态效果设置，纹样切换保持静态。</p>}
      </aside>
    </div>
  </section>;
}
