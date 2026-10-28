import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../../utils/assets.js';
import { particleMotifs } from '../../data/homeParticles.js';
import { sampleMotif } from './particleModel.js';
import { FLIGHT_DURATION, WEAVER_CROP, sampleWeaver, wovenCloth, introFrame, weavingPose, clothPoint, butterflyPoint } from './weavingModel.js';

export default function WeavingIntro({ reduced, onFlying, onComplete }) {
  const canvasRef=useRef(null),buttonRef=useRef(null),callbacks=useRef({onFlying,onComplete});
  callbacks.current={onFlying,onComplete};
  const model=useRef({flying:false,progress:0,flightTime:0,loaded:false});
  const [available,setAvailable]=useState(false),[loaded,setLoaded]=useState(false),[flying,setFlying]=useState(false),[error,setError]=useState('');
  const reducedRef=useRef(reduced);reducedRef.current=reduced;

  function launch() {
    if(model.current.flying||!model.current.loaded)return;
    model.current.flying=true;setFlying(true);callbacks.current.onFlying();
    if(reducedRef.current)callbacks.current.onComplete();
  }

  useEffect(()=>{
    let disposed=false,frame,visible=true,previous=0,time=0,lastDraw=0;
    const canvas=canvasRef.current,context=canvas.getContext('2d');
    if(!context){setError('粒子引入画面暂不可用');return;}
    const compact=matchMedia('(max-width:640px)').matches;
    const count=compact?9000:18000,cloth=wovenCloth(compact?10000:22000);
    let woman=[],butterfly;
    const palette=['#f1e5cb','#8fceda','#dbb06f'];
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});observer.observe(canvas);
    async function load() {
      const [reference,motif]=await Promise.all(['home/heritage-long-panorama-wide.webp',particleMotifs[0].image].map(async path=>{const image=new Image();image.src=assetUrl(path);await image.decode();return image;}));
      const sampler=document.createElement('canvas');sampler.width=300;sampler.height=420;
      const ctx=sampler.getContext('2d',{willReadFrequently:true});
      const c=WEAVER_CROP;ctx.drawImage(reference,c.x,c.y,c.width,c.height,0,0,300,420);
      woman=sampleWeaver(ctx.getImageData(0,0,300,420).data,300,420,count);
      sampler.width=sampler.height=240;ctx.drawImage(motif,0,0,240,240);
      butterfly=sampleMotif(ctx.getImageData(0,0,240,240).data,240,240,compact?4000:6000);
      if(disposed)return;
      model.current.loaded=true;setAvailable(true);
      frame=requestAnimationFrame(draw);
    }
    function dots(points,opacity,unit,width,height,kind) {
      const pose=introFrame(width,height,0,time);
      for(let tone=0;tone<3;tone++) {
        context.beginPath();context.fillStyle=palette[tone];context.globalAlpha=opacity*(tone===1?.7:.88);
        for(const p of points) {
          if(p.tone!==tone)continue;
          let px,py;
          if(kind==='woman') {
            const position=weavingPose(p,time);
            px=pose.womanX+position.x*unit;
            py=height*(pose.compact?.48:.56)-position.y*unit;
          } else {
            const position=clothPoint(p.u,p.v,width,height,unit,time);px=position.x;py=position.y;
          }
          const radius=(tone===0?.52:.43)+(Math.sin(p.seed+time)*.5+.5)*.25;
          context.moveTo(px+radius,py);context.arc(px,py,radius,0,Math.PI*2);
        }
        context.fill();
      }
    }
    function draw(now) {
      if(disposed)return;
      frame=requestAnimationFrame(draw);
      if(now-lastDraw<30)return;lastDraw=now;
      const dt=Math.min((now-(previous||now))/1000,.05);previous=now;
      if(!visible||document.hidden)return;
      if(!reducedRef.current)time+=dt;
      const state=model.current;
      if(state.flying){state.flightTime+=dt*1000;state.progress=Math.min(1,state.flightTime/FLIGHT_DURATION);}
      const width=canvas.clientWidth,height=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,1.75);
      if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
      context.setTransform(dpr,0,0,dpr,0,0);context.clearRect(0,0,width,height);
      if(!state.flying)state.restTime=time;
      const pose=introFrame(width,height,state.progress,state.flying?state.restTime:time);
      canvas.dataset.progress=state.progress.toFixed(3);
      if(pose.sceneOpacity>0){
        dots(woman,pose.sceneOpacity,pose.unit,width,height,'woman');dots(cloth,pose.sceneOpacity,pose.unit,width,height,'cloth');
        // One continuous thread follows the same deformation as the hand; no shuttle cluster.
        context.fillStyle='#f3ddb2';context.globalAlpha=pose.sceneOpacity*.65;
        const hand=weavingPose({x:-1.85+.85*2.04*WEAVER_CROP.width/WEAVER_CROP.height,y:-.06,u:.85,v:.62},time);
        const startX=pose.womanX+hand.x*pose.unit,startY=height*(pose.compact?.48:.56)-hand.y*pose.unit;
        const stitch=clothPoint(.11,.18,width,height,pose.unit,time);
        for(let i=0;i<150;i++) {
          const t=i/150;
          context.fillRect(startX+(stitch.x-startX)*t,startY+(stitch.y-startY)*t+Math.sin(t*Math.PI)*pose.unit*.035,1,.7);
        }
      }
      context.globalAlpha=1;
      const positions=butterfly.positions,colors=butterfly.colors;
      for(let i=0;i<positions.length;i+=3) {
        const {x,y}=butterflyPoint(positions[i],positions[i+1],pose.butterfly,reducedRef.current?0:time);
        const light=Math.max(colors[i],colors[i+1],colors[i+2]);
        const r=colors[i],g=colors[i+1],b=colors[i+2];
        context.fillStyle=r>g*1.3&&r>b*1.3?'#dd4056':Math.min(r,g,b)>.55?'#e8edf3':r>.5&&g>.3&&b<g*.85?'#e3bd71':g>r*1.45&&g>.25?'#9470d4':'#3d5bc2';context.globalAlpha=.65+light*.3;
        context.fillRect(x,y,1.05,1.05);
      }
      context.globalAlpha=1;
      if(!canvas.dataset.painted){canvas.dataset.painted='true';setLoaded(true);}
      if(buttonRef.current){const hit=introFrame(width,height,0,0).butterfly;buttonRef.current.style.left=`${hit.x/width*100}%`;buttonRef.current.style.top=`${hit.y/height*100}%`;}
      if(state.flying&&state.progress===1){cancelAnimationFrame(frame);callbacks.current.onComplete();}
    }
    load().catch(()=>{if(!disposed)setError('引入画面加载失败，请重新进入首页再试。');});
    return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();};
  },[]);

  return <div className="weaving-intro" data-phase={flying?'flying':'weaving'}>
    <canvas ref={canvasRef} className="weaving-canvas" aria-label="粒子绣娘织布，布上的蝴蝶也由光点组成" data-ready={loaded?'true':'false'} />
    <p className="weaving-caption" aria-live="polite">{error||(!loaded?'星尘正在织成绣纹…':flying?'绣纹离开布面，飞向新的可能':'一针一线，织出会飞的绣纹')}</p>
    {!flying&&<button ref={buttonRef} className="weaving-butterfly" type="button" disabled={!available} onClick={launch} aria-label="点击布上的粒子蝴蝶，开启互动"><span>点击蝴蝶 · 唤醒绣纹</span></button>}
  </div>;
}
