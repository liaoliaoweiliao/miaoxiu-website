let moonCursorStarted=false;
const moonButterflyArtwork=`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 72" fill="none"><defs><linearGradient id="moon-wing-blue" x1="8" y1="4" x2="53" y2="49" gradientUnits="userSpaceOnUse"><stop stop-color="#b4c6dc"/><stop offset=".48" stop-color="#54769e"/><stop offset="1" stop-color="#203e62"/></linearGradient><linearGradient id="moon-wing-silver" x1="8" y1="4" x2="52" y2="48" gradientUnits="userSpaceOnUse"><stop stop-color="#fff8e7"/><stop offset=".35" stop-color="#c7d4e4"/><stop offset=".7" stop-color="#e7edf5"/><stop offset="1" stop-color="#9baec7"/></linearGradient><radialGradient id="moon-little-pearl" cx=".35" cy=".3"><stop stop-color="#fffef8"/><stop offset=".65" stop-color="#d4dce8"/><stop offset="1" stop-color="#8ba0ba"/></radialGradient></defs><g class="moon-wing-left"><path d="M30 34C22 14 12 7 3 2C4 16 10 32 28 37C16 30 10 36 14 45C18 55 29 47 31 38Z" fill="url(#moon-wing-blue)" stroke="url(#moon-wing-silver)" stroke-width="1.7" stroke-linejoin="round"/><path d="M27 31C21 18 14 11 7 7C10 22 16 29 26 33M16 37C17 45 22 47 27 39" stroke="#edf1ed" stroke-width=".65"/><path d="M11 14Q20 15 25 28M9 17Q12 25 23 29M18 41Q23 43 26 38" stroke="#cbd8e7" stroke-width=".55"/><g fill="#f5f0e7" transform="translate(16 21)"><ellipse ry="5" rx="1.4"/><ellipse ry="5" rx="1.4" transform="rotate(60)"/><ellipse ry="5" rx="1.4" transform="rotate(120)"/><circle r="1.1" fill="#58779b"/></g><g fill="#e8ecef"><circle cx="11" cy="14" r=".8"/><circle cx="23" cy="29" r="1"/><circle cx="20" cy="40" r="1.9"/><circle cx="21" cy="11" r=".7"/></g></g><g class="moon-wing-right"><path d="M32 34C39 19 50 10 61 7C58 23 48 34 35 37C48 31 55 36 51 45C47 54 36 47 32 39Z" fill="url(#moon-wing-blue)" stroke="url(#moon-wing-silver)" stroke-width="1.7" stroke-linejoin="round"/><path d="M36 31C43 20 50 15 56 12C52 25 44 31 36 33M37 40C43 47 47 44 48 38" stroke="#edf1ed" stroke-width=".65"/><path d="M53 18Q44 19 39 29M54 22Q49 29 40 31M39 40Q44 43 47 40" stroke="#cbd8e7" stroke-width=".55"/><g fill="#f5f0e7" transform="translate(46 25)"><ellipse ry="4.6" rx="1.3"/><ellipse ry="4.6" rx="1.3" transform="rotate(60)"/><ellipse ry="4.6" rx="1.3" transform="rotate(120)"/><circle r="1" fill="#58779b"/></g><g fill="#e8ecef"><circle cx="53" cy="16" r=".8"/><circle cx="39" cy="31" r="1"/><circle cx="43" cy="41" r="1.8"/><circle cx="42" cy="14" r=".65"/></g></g><g stroke="url(#moon-wing-silver)" stroke-linecap="round"><path d="M30 29Q25 20 25 15M32 29Q35 20 40 17" stroke-width=".85"/><circle cx="25" cy="15" r="1.5" fill="url(#moon-little-pearl)" stroke-width=".5"/><circle cx="40" cy="17" r="1.5" fill="url(#moon-little-pearl)" stroke-width=".5"/><ellipse cx="31.5" cy="35" rx="2.1" ry="9" fill="url(#moon-wing-silver)" stroke-width=".6"/><circle cx="31.5" cy="28" r="2.2" fill="url(#moon-little-pearl)" stroke-width=".6"/></g><g class="moon-pendant" stroke="url(#moon-wing-silver)" stroke-width=".7"><path d="M31.5 44V52M18 48V54M46 48V55"/><circle cx="31.5" cy="55" r="2.7" fill="url(#moon-little-pearl)"/><circle cx="18" cy="56" r="1.7" fill="url(#moon-little-pearl)"/><circle cx="46" cy="57" r="1.7" fill="url(#moon-little-pearl)"/><path d="M31.5 59V62M31.5 62C26 66 28 69 31.5 71C35 69 37 66 31.5 62Z" fill="url(#moon-wing-blue)"/><path d="M31.5 64V69" stroke="#f1f0e6" stroke-width=".5"/></g></svg>`;
export function moonCursorIntent(target){
 if(!target?.closest)return ['default',''];
 if(target.closest('input,textarea,select,[contenteditable="true"]'))return ['native',''];
 if(target.closest('[disabled],[aria-disabled="true"]'))return ['disabled','⊘'];
 if(target.closest('[aria-busy="true"],.is-drawing'))return ['busy',''];
 if(target.closest('.image-viewer-stage.is-zoomed,.look-viewport'))return ['move','✥'];
 if(target.closest('.decode-board[data-action="find"]'))return ['precise',''];
 if(target.closest('.image-viewer-stage'))return ['zoom','+'];
 if(target.closest('[data-cursor="ew-resize"]'))return ['resize','↔'];
 if(target.closest('[data-cursor="ns-resize"]'))return ['resize','↕'];
 if(target.closest('[data-cursor="diagonal-resize"]'))return ['resize','↗'];
 if(target.closest('abbr,[data-cursor="help"]'))return ['help','?'];
 if(target.closest('a,button,[role="button"],[data-action],[data-go]'))return ['hover','↗'];
 if(target.closest('p,h1,h2,h3,h4,.source-credit'))return ['text','Ⅰ'];
 return ['default',''];
}
export function initMoonCursor(){
 if(moonCursorStarted||typeof document.createElement!=='function'||!matchMedia('(hover: hover) and (pointer: fine)').matches)return;
 moonCursorStarted=true;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),layer=document.createElement('div');
 layer.className='moon-cursor-layer';layer.setAttribute('aria-hidden','true');layer.innerHTML=`<div class="moon-cursor" hidden><span class="moon-butterfly">${moonButterflyArtwork}</span><span class="moon-cursor-badge"></span><span class="moon-precision"></span></div><div class="moon-cursor-effects"></div>`;document.body.append(layer);
 const cursor=layer.querySelector('.moon-cursor'),badge=layer.querySelector('.moon-cursor-badge'),effects=layer.querySelector('.moon-cursor-effects');
 let frame=0,position={x:0,y:0},lastSpark=0,lastPoint=null,sparkIndex=0;
 const hide=()=>{cursor.hidden=true;document.body.classList.remove('moon-cursor-active');lastPoint=null;};
 function effect(kind,x,y){if(effects.childElementCount>=20)return;const node=document.createElement('span');node.className=kind;node.style.left=x+'px';node.style.top=y+'px';effects.append(node);setTimeout(()=>node.remove(),kind==='moon-click-ripple'?850:650);}
 function update(event){
  if(event.pointerType!=='mouse')return hide();
  const [intent,mark]=moonCursorIntent(event.target);if(intent==='native')return hide();
  cursor.dataset.intent=intent;badge.textContent=mark;cursor.hidden=false;document.body.classList.add('moon-cursor-active');position={x:event.clientX,y:event.clientY};
  if(!frame)frame=requestAnimationFrame(()=>{cursor.style.transform=`translate3d(${position.x-2}px,${position.y-1}px,0)`;frame=0;});
  if(!reduced.matches&&event.timeStamp-lastSpark>40&&(!lastPoint||Math.hypot(position.x-lastPoint.x,position.y-lastPoint.y)>13)){
   if(lastPoint)effect(++sparkIndex%5===0?'moon-butterfly-ghost':'moon-spark',lastPoint.x,lastPoint.y);lastSpark=event.timeStamp;lastPoint={...position};
  }
 }
 document.addEventListener('pointermove',update,{passive:true});
 document.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'||event.button!==0||reduced.matches)return;const [intent]=moonCursorIntent(event.target);if(intent!=='native'&&intent!=='disabled')effect('moon-click-ripple',event.clientX,event.clientY);},{passive:true});
 document.addEventListener('pointerout',event=>{if(!event.relatedTarget)hide();},{passive:true});
 document.addEventListener('keydown',event=>{if(event.key==='Tab')hide();});window.addEventListener('blur',hide);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});
}
