import './style.css';
import { initMoonCursor } from './moon-cursor.js';
import { bindImageZoom, toggleImageZoom } from './image-zoom.js';
import { escapeHtml } from './utils.js';
import { bindLookViewer } from './look-viewer.js';
import { game, levels, collection, unlockMarkup } from './game.js';
import { state, app, A, motifs, garments } from './shared.js';
import { head, footer } from './components/layout.js';
import { home } from './pages/home.js';
import { history } from './pages/history.js';
import { experience } from './pages/experience.js';
import { gallery } from './pages/gallery.js';
import { sources } from './pages/sources.js';
import { handleExperienceAction, handleExperienceKey, bindGarmentReveal } from './experience-actions.js';
import { handleAtlasClick } from './pages/atlas.js';

// 离线构建时 IMAGE_DATA 由 build 脚本注入，用于把图片内联进单一 HTML；普通 dev/build 下原样输出。
function assetMarkup(html){return typeof IMAGE_DATA==='undefined'?html:html.replace(/(?:\.\/assets\/)([^"<>]+\.(?:webp|jpg|png|svg))/g,(_,name)=>IMAGE_DATA[name]||'');}

/* ============ 探源页（history 分支）：刺绣动画 + 纹样放大镜 ============ */
let stitchAnimationTimer=null;
let stitchAnimationRun=0;
function stopStitchAnimation(){stitchAnimationRun+=1;state.historyPlaying=false;if(stitchAnimationTimer){clearTimeout(stitchAnimationTimer);stitchAnimationTimer=null;}}
function playStitchAnimation(index){
 stopStitchAnimation();
 const run=stitchAnimationRun;
 state.historyStitch=index;
 state.historyStep=0;
 state.historyPlaying=true;
 render();
 stitchAnimationTimer=setTimeout(()=>{if(run!==stitchAnimationRun)return;state.historyPlaying=false;state.historyStep=3;render();},5600);
}
function bindMotifMagnifier(){const art=document.querySelector('[data-magnifier]');if(!art)return;const base=art.querySelector('.motif-base-image');const lens=art.querySelector('.motif-magnifier');if(!base||!lens)return;const zoom=2.8;const move=e=>{const rect=art.getBoundingClientRect();const x=Math.max(0,Math.min(rect.width,e.clientX-rect.left));const y=Math.max(0,Math.min(rect.height,e.clientY-rect.top));const xp=x/rect.width*100,yp=y/rect.height*100;const src=base.currentSrc||base.src;lens.style.left=`${x}px`;lens.style.top=`${y}px`;lens.style.backgroundImage=`url("${src}")`;lens.style.backgroundSize=`${zoom*100}% ${zoom*100}%`;lens.style.backgroundPosition=`${xp}% ${yp}%`;lens.classList.add('is-visible')};art.addEventListener('pointermove',move);art.addEventListener('pointerenter',move);art.addEventListener('pointerleave',()=>lens.classList.remove('is-visible'))}

/* ============ 探源页：小故事阅读器（逐字浮现 + 分节翻阅 + 鼠标跟随光晕） ============ */
let storyTypingTimer=null;
function storyStopTyping(){if(storyTypingTimer){clearInterval(storyTypingTimer);storyTypingTimer=null;}}
function finishStoryTyping(){storyStopTyping();const reader=app.querySelector('.story-reader');if(!reader)return;const node=reader.querySelector('[data-story-text]');if(node&&node.dataset.full!==undefined)node.textContent=node.dataset.full;reader.classList.remove('is-typing');}
function bindStoryReader(){
 storyStopTyping();
 const reader=app.querySelector('.story-reader');
 if(!reader)return;
 const node=reader.querySelector('[data-story-text]');
 if(node){
  const full=node.textContent||'';
  node.dataset.full=full;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){reader.classList.remove('is-typing');}
  else{
   node.textContent='';let i=0;reader.classList.add('is-typing');
   storyTypingTimer=setInterval(()=>{
    i+=2;node.textContent=full.slice(0,i);
    if(i>=full.length){node.textContent=full;storyStopTyping();reader.classList.remove('is-typing');}
   },26);
  }
 }
 reader.querySelector('.story-reader-close')?.focus({preventScroll:true});
}
function bindStoryCards(){
 const cards=app.querySelectorAll('[data-story-card]');
 cards.forEach(card=>{
  const art=card.querySelector('.story-image');
  if(!art)return;
  art.addEventListener('pointermove',e=>{
   const rect=card.getBoundingClientRect();
   const px=(e.clientX-rect.left)/rect.width-0.5,py=(e.clientY-rect.top)/rect.height-0.5;
   card.style.setProperty('--story-tilt-x',`${(-py*5).toFixed(2)}deg`);
   card.style.setProperty('--story-tilt-y',`${(px*6).toFixed(2)}deg`);
   card.style.setProperty('--story-glow-x',`${((px+0.5)*100).toFixed(1)}%`);
   card.style.setProperty('--story-glow-y',`${((py+0.5)*100).toFixed(1)}%`);
  });
  art.addEventListener('pointerleave',()=>{card.style.setProperty('--story-tilt-x','0deg');card.style.setProperty('--story-tilt-y','0deg');});
 });
}
function openStory(index){storyStopTyping();state.story={index:Number(index)||0,page:0};render();}
function storyNav(dir){
 if(!state.story)return;
 const total=app.querySelectorAll('.story-reader-progress i').length||1;
 const now=Number(state.story.page)||0;
 const next=Math.max(0,Math.min(total-1,now+(Number(dir)||1)));
 if(next===now)return;
 state.story.page=next;render();
}
function closeStory(){
 const index=state.story?.index;
 state.story=null;storyStopTyping();render();
 if(index!==undefined)app.querySelector(`[data-story-card="${index}"] .story-image`)?.focus({preventScroll:true});
}

/* ============ 首页（home 分支）：首屏轮播 + 传承小鸟长卷 ============ */
function setHeroSlide(index){
 const hero=app.querySelector('.hero');if(!hero)return;
 state.slide=(index+4)%4;hero.dataset.slide=String(state.slide);
 hero.querySelectorAll('.hero-slide').forEach((slide,i)=>{const active=i===state.slide;slide.classList.toggle('is-active',active);slide.setAttribute('aria-hidden',String(!active));});
 const count=hero.querySelector('.hero-current');if(count)count.textContent=String(state.slide+1).padStart(2,'0');
 hero.querySelectorAll('.hero-dot').forEach((dot,i)=>{const active=i===state.slide;dot.classList.toggle('is-active',active);dot.setAttribute('aria-current',String(active));});
}
setInterval(()=>{const hero=app.querySelector('.hero');if(!hero||document.hidden||hero.matches(':hover')||hero.contains(document.activeElement)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;setHeroSlide(state.slide+1)},6500);
let heroTouchStart=null;
app.addEventListener('touchstart',e=>{heroTouchStart=e.target.closest('.hero')?{x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}:null},{passive:true});
app.addEventListener('touchend',e=>{if(!heroTouchStart)return;const dx=e.changedTouches[0].clientX-heroTouchStart.x,dy=e.changedTouches[0].clientY-heroTouchStart.y;heroTouchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.2)setHeroSlide(state.slide+(dx<0?1:-1))},{passive:true});

/* 苗绣首页第三幕 · 小鸟三次点击的可逆长卷叙事。 */
let heritageRun=0;
let heritageModel=null;
const heritageClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const heritageEase=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const heritageBirdPaths=[[[585,535],[505,507],[427,468],[338,409],[249,367]],[[249,367],[345,408],[490,466],[670,506],[860,531],[1080,542],[1290,519],[1480,479],[1640,438],[1815,412],[1950,410],[2079,421]],[[2079,421],[2140,361],[2200,269],[2270,142],[2360,-48]]];
const heritagePathCache=new WeakMap();
function heritageSample(points,t){
 let table=heritagePathCache.get(points);
 if(!table){
  const samples=[];
  const curve=(i,u)=>{
   const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
   const interp=c=>.5*((2*p1[c])+(-p0[c]+p2[c])*u+(2*p0[c]-5*p1[c]+4*p2[c]-p3[c])*u*u+(-p0[c]+3*p1[c]-3*p2[c]+p3[c])*u*u*u);
   return{x:interp(0),y:interp(1)};
  };
  let distance=0,previous=null;
  for(let i=0;i<points.length-1;i++){
   for(let j=(i===0?0:1);j<=32;j++){
    const p=curve(i,j/32);
    if(previous)distance+=Math.hypot(p.x-previous.x,p.y-previous.y);
    samples.push({x:p.x,y:p.y,d:distance});previous=p;
   }
  }
  table={samples,total:distance};heritagePathCache.set(points,table);
 }
 const target=heritageClamp(t,0,1)*table.total,samples=table.samples;
 let lo=0,hi=samples.length-1;
 while(lo<hi){const mid=(lo+hi)>>1;if(samples[mid].d<target)lo=mid+1;else hi=mid;}
 const b=samples[lo],a=samples[Math.max(0,lo-1)],span=b.d-a.d,u=span?(target-a.d)/span:0;
 return{x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u};
}
function heritageSizes(model){
 const {viewport,art}=model,w=viewport.clientWidth,h=viewport.clientHeight;
 const artW=Math.max(h*2172/724,w/.65);
 const oldFraction=model.maxPan>0?model.pan/model.maxPan:0;
 model.artW=artW;model.worldW=w*2172/artW;model.maxPan=Math.max(0,2172-model.worldW);
 model.startPan=0;
 model.pan=model.stage===0?0:heritageClamp(oldFraction*model.maxPan,0,model.maxPan);
 art.style.setProperty('--heritage-art-width',`${artW}px`);
 model.bird.style.setProperty('--heritage-art-width',`${artW}px`);
 heritagePaint(model);
}
function heritagePaint(model){
 const pan=heritageClamp(model.pan,0,model.maxPan);
 model.pan=pan;
 model.art.style.setProperty('--heritage-shift',`${pan*model.artW/2172}px`);
 model.bird.style.left=`${model.x/2172*100}%`;
 model.bird.style.top=`${model.y/724*100}%`;
}
function heritageMessage(model,number,message,cue){
 model.scene.querySelector('[data-heritage-number]').textContent=number;
 model.scene.querySelector('[data-heritage-message]').textContent=message;
 model.scene.querySelectorAll('.heritage-progress i').forEach((el,i)=>el.classList.toggle('is-current',i===Number(number)-1));
}
function heritageReady(model,label){
 model.busy=false;model.bird.disabled=false;model.bird.classList.remove('is-flying','is-hidden','is-flying-left');model.bird.classList.add('is-perched');model.bird.setAttribute('aria-label',label);model.bird.querySelector('.heritage-bird-hint').textContent=label;
}
function heritageMoving(model){model.busy=true;model.bird.disabled=true;model.bird.classList.add('is-flying');model.bird.classList.remove('is-perched')}
function heritageAnimate(model,duration,paint){
 return new Promise(resolve=>{
  const run=model.run,reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){paint(1);resolve(true);return}
  const start=performance.now();
  function step(now){if(model.run!==run||!model.scene.isConnected){resolve(false);return}let t=heritageClamp((now-start)/duration,0,1);paint(t);if(t<1){model.raf=requestAnimationFrame(step)}else{model.raf=null;resolve(true)}}
  model.raf=requestAnimationFrame(step);
 });
}
function heritageDelay(model,ms){return new Promise(resolve=>{const run=model.run;setTimeout(()=>resolve(run===model.run&&model.scene.isConnected),window.matchMedia('(prefers-reduced-motion: reduce)').matches?50:ms)})}
async function heritageAdvance(model){
 if(model.busy)return;
 if(model.stage===0){
  heritageMoving(model);model.bird.classList.add('is-flying-left');
  heritageMessage(model,'01','小鸟循着针线，从绣片飞向绣娘指尖。','');
  const ok=await heritageAnimate(model,2600,t=>{const p=heritageSample(heritageBirdPaths[0],t);model.x=p.x;model.y=p.y;heritagePaint(model)});if(!ok)return;
  model.x=249;model.y=367;model.stage=1;heritagePaint(model);
  heritageMessage(model,'02','小鸟停在指尖的针线处，轻轻扇动翅膀。','');heritageReady(model,'再次点击小鸟 · 飞往本子鸟纹');
 }else if(model.stage===1){
  model.bird.classList.remove('is-flying-left');heritageMoving(model);
  heritageMessage(model,'02','小鸟带着绣纹，沿着长卷飞向当代设计。','');
  const ok=await heritageAnimate(model,8600,t=>{
   const p=heritageSample(heritageBirdPaths[1],t);model.x=p.x;model.y=p.y;
   model.pan=heritageClamp(p.x-model.worldW*.52,model.startPan,model.maxPan);
   heritagePaint(model);
  });if(!ok)return;
  model.x=2079;model.y=421;model.pan=model.maxPan;model.stage=2;heritagePaint(model);
  heritageMessage(model,'03','小鸟停在本子封面的小鸟纹样上。','');heritageReady(model,'第三次点击小鸟 · 飞向右上方');
 }else if(model.stage===2){
  model.bird.classList.remove('is-flying-left');heritageMoving(model);
  heritageMessage(model,'03','绣纹继续延伸，飞向画卷以外。','');
  const ok=await heritageAnimate(model,2500,t=>{const p=heritageSample(heritageBirdPaths[2],t);model.x=p.x;model.y=p.y;heritagePaint(model)});if(!ok)return;
  model.bird.classList.add('is-hidden');if(!(await heritageDelay(model,550)))return;
  const from=model.pan;
  if(!(await heritageAnimate(model,1600,t=>{model.pan=from*(1-heritageEase(t));heritagePaint(model)})))return;
  model.stage=0;model.x=585;model.y=535;model.pan=0;heritagePaint(model);
  heritageMessage(model,'01','绣片上的小鸟又回到了起点。','');heritageReady(model,'点击小鸟 · 重新唤醒绣纹');
 }
}
function initHeritageJourney(){
 const scene=app.querySelector('[data-heritage-journey]');heritageRun++;
 if(heritageModel?.raf)cancelAnimationFrame(heritageModel.raf);
 if(!scene){heritageModel=null;return}
 const model={run:heritageRun,scene,viewport:scene.querySelector('.heritage-viewport'),art:scene.querySelector('.heritage-art'),bird:scene.querySelector('.heritage-bird'),pan:0,x:585,y:535,stage:0,busy:false,raf:null,artW:2172,maxPan:1,worldW:1000};heritageModel=model;
 model.trailLength=0;
 heritageSizes(model);model.pan=model.startPan;heritagePaint(model);
 model.bird.addEventListener('click',e=>{e.stopPropagation();heritageAdvance(model)});
 model.viewport.addEventListener('keydown',e=>{if(e.target!==model.viewport||!['Enter',' ','ArrowLeft'].includes(e.key))return;e.preventDefault();heritageAdvance(model)});
 let touch=null;
 model.viewport.addEventListener('touchstart',e=>{if(e.target.closest('button'))return;const q=e.changedTouches[0];touch={x:q.clientX,y:q.clientY}},{passive:true});
 model.viewport.addEventListener('touchend',e=>{if(!touch)return;const q=e.changedTouches[0],dx=q.clientX-touch.x,dy=q.clientY-touch.y;touch=null;if(dx< -65&&Math.abs(dx)>Math.abs(dy)*1.6)heritageAdvance(model)},{passive:true});
}
window.addEventListener('resize',()=>{if(heritageModel?.scene.isConnected)heritageSizes(heritageModel)},{passive:true});

/* ============ 图片灯箱（experience,gallery 分支） ============ */
let modalReturn=null;
function imageModal(){
 if(!state.modal)return '';
 const title=escapeHtml(state.modal.title||'苗绣图片'),src=escapeHtml(A+state.modal.src),extension=state.modal.src.split('.').pop().toLowerCase(),filename=escapeHtml((state.modal.title||'苗绣图片').replace(/[\\/:*?"<>|]/g,'-')+'.'+extension);
 return `<div class="modal image-lightbox" data-action="close"><section class="modal-body image-lightbox-body ${state.modal.description?'has-details':''}" role="dialog" aria-modal="true" aria-labelledby="image-viewer-title"><button class="image-viewer-close" data-action="close" aria-label="关闭图片欣赏">✕</button><div class="image-viewer-stage"><img src="${src}" alt="${title}" draggable="false"/></div><div class="image-viewer-caption"><h2 id="image-viewer-title">${title}</h2><button class="image-viewer-zoom" data-action="zoomImage" aria-pressed="false">⤢ 放大细节</button><a class="image-viewer-save" data-action="downloadImage" href="${src}" download="${filename}">⇩ 保存图片</a></div>${state.modal.description?`<p class="image-viewer-details">${escapeHtml(state.modal.description)}</p>`:''}<p class="image-viewer-hint">双击图片放大，再次双击恢复全图；放大后可拖动欣赏。Esc 关闭</p></section></div>`;
}
function closeImageModal(){state.modal=null;render();if(modalReturn){const targets=app.querySelectorAll('[data-action]');[...targets].find(el=>el.dataset.action===modalReturn.action&&el.dataset.src===modalReturn.src)?.focus({preventScroll:true});modalReturn=null;}}

function render(){
 const active=document.activeElement,boardFocus=active?.classList.contains('decode-board'),action=active?.dataset.action,id=active?.dataset.id,part=active?.dataset.part;
 document.title=({home:'首页',history:'苗绣探源',experience:'互动体验',gallery:'作品展览',sources:'素材来源'})[state.page]+' · 穿在身上的民族历史';document.body.dataset.page=state.page;
 app.innerHTML=assetMarkup(head()+({home,history,experience,gallery,sources}[state.page]||home)()+footer()+(state.page==='experience'?unlockMarkup():'')+imageModal());
 bindLookViewer();
 bindGarmentReveal();
 bindImageZoom();
 initHeritageJourney();
 bindMotifMagnifier();
 bindStoryCards();
 bindStoryReader();
 document.body.classList.toggle('image-viewer-open',!!state.modal);
 document.body.classList.toggle('story-reader-open',!!state.story);
 document.body.classList.toggle('unlock-open',state.page==='experience'&&!!game.unlock);
 if(state.modal)app.querySelector('.image-viewer-close')?.focus({preventScroll:true});
 else if(state.page==='experience'&&game.unlock)app.querySelector('.unlock-dialog')?.focus();
 else if(boardFocus)app.querySelector('.decode-board')?.focus({preventScroll:true});
 else if(action)app.querySelector(`[data-action="${action}"]${id?`[data-id="${id}"]`:''}${part?`[data-part="${part}"]`:''}`)?.focus({preventScroll:true});
}
function go(page){state.page=page;state.nav=false;state.story=null;location.hash=page;window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});render();}
app.addEventListener('click',e=>{
 const el=e.target.closest('[data-go],[data-action]');
 if(!el||el.disabled)return;
 if(e.target.closest('[data-atlas]')){handleAtlasClick(e);return;}
 if(el.dataset.go){if(el.dataset.motif!==undefined)state.motif=Number(el.dataset.motif);go(el.dataset.go);return;}
 const action=el.dataset.action;
 if(handleExperienceAction(action,el,e,render))return;
 if(['motif-preview','motif-group','color-motif','color-pick','color-reset','color-example','color-challenge'].includes(action)){stopStitchAnimation();state.historyStep=0;}
 const idx=Number(el.dataset.index||0);
 switch(action){
  case'story-open':openStory(idx);return;
  case'story-nav':storyNav(Number(el.dataset.dir)||1);return;
  case'story-close':{if(e.target.closest('.story-reader-panel')&&!e.target.closest('button')){finishStoryTyping();return;}closeStory();return;}
  case'nav':state.nav=!state.nav;break;
  case'nextSlide':setHeroSlide(state.slide+1);return;
  case'prevSlide':setHeroSlide(state.slide-1);return;
  case'gotoSlide':setHeroSlide(idx);return;
  case'motif':state.motif=idx;break;
  case'motif-preview':state.historyGroup=el.dataset.group||state.historyGroup;state.historyMotif=idx;break;
  case'motif-group':state.historyGroup=el.dataset.group||'animal';state.historyMotif=0;break;
  case'stitch-select':playStitchAnimation(idx);return;
  case'stitch-step':state.historyStep=Math.max(0,Math.min(3,idx));break;
  case'stitch-reset':stopStitchAnimation();state.historyStep=0;break;
  case'color-motif':state.historyColorMotif=idx;break;
  case'color-pick':{const picked=Array.isArray(state.historyColors)?[...state.historyColors]:[];const pos=picked.indexOf(idx);if(pos>=0)picked.splice(pos,1);else{if(picked.length>=3)picked.shift();picked.push(idx)}state.historyColors=picked;state.historyColor=idx;break;}
  case'color-reset':state.historyColors=[];state.historyColor=-1;break;
  case'color-example':state.historyColorExample=idx;break;
  case'color-challenge':state.historyChallenge=!state.historyChallenge;break;
  case'spot':state.motif=idx%motifs.length;state.unlocked=Math.max(state.unlocked,Math.min(6,idx+2));localStorage.setItem('miao-unlocked',state.unlocked);break;
  case'draw':state.drawn=Math.floor(Math.random()*garments.length);state.garment=state.drawn;break;
  case'look':state.look=idx;break;
  case'garment':state.garment=idx;break;
  case'reset':state.garment=0;state.look=0;break;
  case'zoom':state.look=(state.look+1)%4;break;
  case'filter':state.galleryFilter=idx;break;
  case'modal':modalReturn={action:el.dataset.action,src:el.dataset.src};state.modal={src:el.dataset.src,title:el.dataset.title,description:el.dataset.description||''};break;
  case'downloadImage':return;
  case'zoomImage':toggleImageZoom();return;
  case'close':if(e.target.closest('.modal-body')&&!e.target.closest('.image-viewer-close'))return;closeImageModal();return;
  case'theme':document.body.classList.toggle('bloom');return;
  case'search':{const q=document.getElementById('search')?.value.trim();state.query=q||'';if(!q)return;
   if(/素材|来源/.test(q)){go('sources');return;}
   const theme=levels.find(l=>l.name.includes(q)||q.includes(l.name));if(theme){if(collection.unlocked.includes(theme.id))game.theme=theme.id;go('experience');return;}
   if(motifs.some(m=>m.name.includes(q))||/互动|衣橱|装扮/.test(q)){go('experience');return;}
   if(/作品|展览|设计|服饰/.test(q)){go('gallery');return;}if(/历史|文化|技艺|针法|苗绣/.test(q)){go('history');return;}
   alert('暂无匹配内容，试试搜索“水涡纹”“牡丹花纹”或“作品”。');return;}
 }
 render();
});
app.addEventListener('keydown',e=>{
 if(state.story){
  if(e.key==='Escape'){e.preventDefault();closeStory();return;}
  if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();storyNav(1);return;}
  if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();storyNav(-1);return;}
  if(e.key===' '||e.key==='Enter'){if(e.target.closest('.story-reader-panel')&&!e.target.closest('button')){e.preventDefault();finishStoryTyping();return;}}
  if(e.key==='Tab'){const controls=[...app.querySelectorAll('.story-reader button:not([disabled])')],first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}return;}
 }
 if(state.modal){
 if(e.key==='Escape'){e.preventDefault();closeImageModal();return;}
 if(e.key==='Tab'){const controls=[...app.querySelectorAll('.image-lightbox button,.image-lightbox a')],first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}return;
 }if(e.target.classList.contains('decode-board')&&e.target.dataset.action==='modal'&&['Enter',' '].includes(e.key)){e.preventDefault();e.target.click();return;}if(state.page==='experience'&&handleExperienceKey(e,render))return;if(e.key==='Enter'&&e.target.id==='search')app.querySelector('[data-action="search"]')?.click();});
window.addEventListener('hashchange',()=>{const p=location.hash.slice(1);if(['home','history','experience','gallery','sources'].includes(p)&&state.page!==p){state.page=p;render();}});
render();
initMoonCursor();
