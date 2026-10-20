import { app } from './shared.js';
const imageZoomControllers=new WeakMap();
export function toggleImageZoom(){const stage=app.querySelector('.image-viewer-stage');imageZoomControllers.get(stage)?.toggle();}
export function bindImageZoom(){
 const stage=app.querySelector('.image-viewer-stage'),photo=stage?.querySelector?.('img');
 if(!photo)return;
 const button=app.querySelector('.image-viewer-zoom');
 let scale=1,x=0,y=0,drag=null;
 const limits=()=>({x:Math.max(0,(photo.clientWidth*scale-stage.clientWidth)/2),y:Math.max(0,(photo.clientHeight*scale-stage.clientHeight)/2)});
 function paint(){const limit=limits();x=Math.max(-limit.x,Math.min(limit.x,x));y=Math.max(-limit.y,Math.min(limit.y,y));photo.style.transform=`translate(${x}px,${y}px) scale(${scale})`;stage.classList.toggle('is-zoomed',scale>1);if(button){button.textContent=scale>1?'↙ 恢复全图':'⤢ 放大细节';button.setAttribute('aria-pressed',String(scale>1));}}
 function toggle(point){
  if(!photo.clientWidth||!photo.clientHeight)return;
  if(scale>1){scale=1;x=0;y=0;}else{const r=photo.getBoundingClientRect();scale=2.5;x=point?(r.left+r.width/2-point.clientX)*(scale-1):0;y=point?(r.top+r.height/2-point.clientY)*(scale-1):0;}
  drag=null;stage.classList.remove('is-dragging');paint();
 }
 stage.addEventListener('dblclick',event=>{event.preventDefault();toggle(event);});
 stage.addEventListener('pointerdown',event=>{if(scale===1||event.button!==0)return;event.preventDefault();drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x,y};stage.setPointerCapture?.(event.pointerId);stage.classList.add('is-dragging');});
 stage.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;event.preventDefault();x=drag.x+event.clientX-drag.startX;y=drag.y+event.clientY-drag.startY;paint();});
 const release=event=>{if(drag?.id!==event.pointerId)return;drag=null;stage.classList.remove('is-dragging');};
 stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
 imageZoomControllers.set(stage,{toggle});
}
