import { game, collection, previewMarkup, setById } from './game.js';
const lookView={scale:1,x:0,y:0,key:null,expanded:false};
export function lookViewerMarkup(){
 const outfit=setById(collection.equipped[collection.gender]);
 return `<div class="look-viewer ${lookView.expanded?'viewer-expanded':''}" role="region" aria-label="人物服饰观看器"><div class="viewer-header"><span>✧ 服饰观赏</span><small>${outfit?'整套穿戴':'原始形象'}</small></div><div class="viewer-viewport" tabindex="0" role="group" aria-label="拖拽移动人物，滚轮或双指缩放，方向键移动，加减号缩放，零键复位" data-view-key="${collection.gender}-${collection.equipped[collection.gender]||'base'}-${game.wearRevision||0}"><div class="viewer-halo" aria-hidden="true"></div><div class="viewer-floor" aria-hidden="true"></div><div class="viewer-actor">${previewMarkup()}</div><span class="viewer-corner viewer-corner-tl" aria-hidden="true"></span><span class="viewer-corner viewer-corner-br" aria-hidden="true"></span></div><div class="viewer-caption">${outfit?outfit.name:collection.gender==='girl'?'苗绣姑娘':'苗绣少年'}</div><div class="viewer-tools" role="group" aria-label="观赏控制"><button data-view="out" aria-label="缩小人物">−</button><output class="viewer-scale" aria-live="polite">100%</output><button data-view="in" aria-label="放大人物">＋</button><span></span><button data-view="reset">复位</button><button data-view="expand" aria-label="${lookView.expanded?'退出全屏观赏':'全屏观赏'}" aria-pressed="${lookView.expanded}">${lookView.expanded?'收起':'全屏'}</button></div><p class="viewer-hint">拖拽移动 · 滚轮 / 双指缩放 · 双击复位</p></div>`;
}
export function bindLookViewer(){
 const root=document.querySelector('.look-viewer'),viewport=root?.querySelector?.('.viewer-viewport');
 if(!viewport?.addEventListener){lookView.expanded=false;document.body.classList.toggle('look-viewer-open',false);return;}
 const actor=root.querySelector('.viewer-actor'),meter=root.querySelector('.viewer-scale');
 if(lookView.key!==viewport.dataset.viewKey){lookView.key=viewport.dataset.viewKey;lookView.scale=1;lookView.x=lookView.y=0;}
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function update(){lookView.scale=clamp(lookView.scale,1,3);const bounds=viewport.getBoundingClientRect();lookView.x=clamp(lookView.x,-bounds.width*lookView.scale/2,bounds.width*lookView.scale/2);lookView.y=clamp(lookView.y,-bounds.height*(lookView.scale-1)/2,bounds.height*(lookView.scale-1)/2);actor.style.transform=`translate(${lookView.x}px,${lookView.y}px) scale(${lookView.scale})`;meter.value=`${Math.round(lookView.scale*100)}%`;meter.textContent=meter.value;root.querySelector('[data-view="out"]').disabled=lookView.scale<=1;root.querySelector('[data-view="in"]').disabled=lookView.scale>=3;}
 const reset=()=>{lookView.scale=1;lookView.x=lookView.y=0;update();};
 function expand(on){lookView.expanded=on;root.classList.toggle('viewer-expanded',on);document.body.classList.toggle('look-viewer-open',on);const button=root.querySelector('[data-view="expand"]');button.textContent=on?'收起':'全屏';button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?'退出全屏观赏':'全屏观赏');viewport.focus({preventScroll:true});update();}
 const points=new Map();let pinchDistance=0;
 const distance=()=>{const [a,b]=[...points.values()];return Math.hypot(a.x-b.x,a.y-b.y);};
 viewport.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});viewport.setPointerCapture(e.pointerId);viewport.classList.add('is-dragging');if(points.size===2)pinchDistance=distance();});
 viewport.addEventListener('pointermove',e=>{const old=points.get(e.pointerId);if(!old)return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size===2){const next=distance();if(pinchDistance>0)lookView.scale*=next/pinchDistance;pinchDistance=next;}else{lookView.x+=e.clientX-old.x;lookView.y+=e.clientY-old.y;}update();});
 const release=e=>{points.delete(e.pointerId);pinchDistance=0;if(!points.size)viewport.classList.remove('is-dragging');};
 for(const type of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(type,release);
 viewport.addEventListener('wheel',e=>{e.preventDefault();lookView.scale*=Math.exp(-clamp(e.deltaY,-100,100)*.002);update();},{passive:false});
 viewport.addEventListener('dblclick',reset);
 root.addEventListener('click',e=>{const button=e.target.closest('[data-view]');if(!button||button.disabled)return;switch(button.dataset.view){case'in':lookView.scale+=.25;update();break;case'out':lookView.scale-=.25;update();break;case'reset':reset();break;case'expand':expand(!lookView.expanded);break;}});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&lookView.expanded){expand(false);e.preventDefault();return;}if(e.target!==viewport)return;switch(e.key){case'+':case'=':lookView.scale+=.25;break;case'-':lookView.scale-=.25;break;case'0':reset();break;case'ArrowLeft':lookView.x-=20;break;case'ArrowRight':lookView.x+=20;break;case'ArrowUp':lookView.y-=20;break;case'ArrowDown':lookView.y+=20;break;default:return;}e.preventDefault();update();});
 if(lookView.expanded)expand(true);else update();
}
