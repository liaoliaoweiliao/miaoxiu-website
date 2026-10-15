import { A, motifs, garments, state, app } from './shared.js';
import { head, footer } from './components/layout.js';
import { home } from './pages/home.js';
import { history } from './pages/history.js';
import { experience } from './pages/experience.js';
import { gallery } from './pages/gallery.js';
function render(){document.title=({home:'首页',history:'苗绣探源',experience:'互动体验',gallery:'作品展览'})[state.page]+' · 穿在身上的民族历史';document.body.dataset.page=state.page;app.innerHTML=head()+({home,history,experience,gallery}[state.page]||home)()+footer()+(state.modal?`<div class="modal" data-action="close"><div class="modal-body"><button data-action="close">✕</button><img src="${A}${state.modal.src}" alt="${state.modal.title}"/><h2>${state.modal.title}</h2></div></div>`:'');}
function go(page){state.page=page;state.nav=false;location.hash=page;window.scrollTo({top:0,behavior:'smooth'});render()}
// Only the hero image and indicators change: do not re-render the rest of the page.
function setHeroSlide(index){
 const hero=app.querySelector('.hero');if(!hero)return;
 state.slide=(index+4)%4;hero.dataset.slide=String(state.slide);
 hero.querySelectorAll('.hero-slide').forEach((slide,i)=>{const active=i===state.slide;slide.classList.toggle('is-active',active);slide.setAttribute('aria-hidden',String(!active));});
 const count=hero.querySelector('.hero-current');if(count)count.textContent=String(state.slide+1).padStart(2,'0');
 hero.querySelectorAll('.hero-dot').forEach((dot,i)=>{const active=i===state.slide;dot.classList.toggle('is-active',active);dot.setAttribute('aria-current',String(active));});
}
// Auto-play pauses on hover, focus and hidden tabs; reduced-motion users get manual controls.
setInterval(()=>{const hero=app.querySelector('.hero');if(!hero||document.hidden||hero.matches(':hover')||hero.contains(document.activeElement)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;setHeroSlide(state.slide+1)},6500);
let heroTouchStart=null;
app.addEventListener('touchstart',e=>{heroTouchStart=e.target.closest('.hero')?{x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}:null},{passive:true});
app.addEventListener('touchend',e=>{if(!heroTouchStart)return;const dx=e.changedTouches[0].clientX-heroTouchStart.x,dy=e.changedTouches[0].clientY-heroTouchStart.y;heroTouchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.2)setHeroSlide(state.slide+(dx<0?1:-1))},{passive:true});
app.addEventListener('click',e=>{const el=e.target.closest('[data-go],[data-action]');if(!el)return;const action=el.dataset.action;if(el.dataset.motif!==undefined)state.motif=Number(el.dataset.motif);if(el.dataset.go){go(el.dataset.go);return}const idx=Number(el.dataset.index||0);switch(action){case'nav':state.nav=!state.nav;break;case'nextSlide':setHeroSlide(state.slide+1);return;case'prevSlide':setHeroSlide(state.slide-1);return;case'gotoSlide':setHeroSlide(idx);return;case'motif':state.motif=idx;break;case'spot':state.motif=idx%motifs.length;state.unlocked=Math.max(state.unlocked,Math.min(6,idx+2));localStorage.setItem('miao-unlocked',state.unlocked);break;case'draw':state.drawn=Math.floor(Math.random()*garments.length);state.garment=state.drawn;break;case'look':state.look=idx;break;case'garment':state.garment=idx;break;case'reset':state.garment=0;state.look=0;break;case'zoom':state.look=(state.look+1)%4;break;case'filter':state.galleryFilter=idx;break;case'modal':state.modal={src:el.dataset.src,title:el.dataset.title};break;case'close':if(e.target.closest('.modal-body')&&!e.target.closest('[data-action="close"]'))return;state.modal=null;break;case'search':{const q=document.getElementById('search')?.value.trim();state.query=q||'';if(q){const match=motifs.findIndex(m=>m.name.includes(q)||q.includes(m.name));if(match>=0){state.motif=match;go('experience');return}if(/作品|展览|设计|服饰/.test(q)){go('gallery');return}if(/历史|文化|技艺|针法/.test(q)){go('history');return}alert('暂无匹配内容，试试搜索“蝴蝶纹”“苗绣”或“作品”。')}return}case'save':downloadLook();return;case'theme':document.body.classList.toggle('bloom');break;}render()});
app.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='search'){document.querySelector('[data-action="search"]').click()}});
window.addEventListener('hashchange',()=>{const p=location.hash.slice(1);if(['home','history','experience','gallery'].includes(p)&&state.page!==p){state.page=p;render()}});
function downloadLook(){const canvas=document.createElement('canvas');canvas.width=700;canvas.height=900;const ctx=canvas.getContext('2d');ctx.fillStyle='#06253c';ctx.fillRect(0,0,700,900);const img=new Image();img.onload=()=>{ctx.drawImage(img,115,65,470,700);ctx.fillStyle='#ebbb82';ctx.textAlign='center';ctx.font='bold 36px serif';ctx.fillText('穿在身上的民族历史',350,805);ctx.font='22px serif';ctx.fillText(`苗绣人物换装 · ${garments[state.garment].text}`,350,849);const a=document.createElement('a');a.download='我的苗绣形象.png';a.href=canvas.toDataURL('image/png');a.click()};img.src=A+'experience/character.webp'}
render();
