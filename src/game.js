import { A } from './shared.js';
export const levels = [
  {id:'spiral',name:'旋涡纹',icon:'◎',title:'彩色刺绣背包',image:'colorful embroidered backpack.jpg',hint:'观察中央绿色与黑色背包上方的红白卷曲线条。',description:'红白卷曲线条连续回旋，形成富有节奏的旋涡纹。',target:{x:46,y:14,w:12,h:25}},
  {id:'flower',name:'花朵纹',icon:'❀',title:'红色民族服饰',image:'red ethnic costume.jpg',hint:'在画面中央的黄色绣片上，寻找红黄相间的花朵。',description:'黄色绣片上的红黄花朵，以鲜明的色彩与舒展的花瓣构成花朵纹。',target:{x:44,y:40,w:10,h:14}},
  {id:'lines',name:'回纹与线条纹',icon:'▱',title:'手工刺绣布',image:'hand‑embroidered fabric .jpg',hint:'沿左侧边框观察，寻找层层嵌套的平行线和重复折线。',description:'平行线、交叉线和重复折线层层嵌套，构成边框的几何装饰。',target:{x:17,y:37,w:13,h:23}}
];
const KEY='miao-decode-v1';
export function readProgress(storage){
  try { const raw=JSON.parse(storage.getItem(KEY)||'{}');return levels.map(l=>{const p=raw[l.id]||{};return {found:p.found===true,reward:p.found===true&&Number.isInteger(p.reward)&&p.reward>=0&&p.reward<5?p.reward:null};}); }
  catch {return levels.map(()=>({found:false,reward:null}));}
}
const storage={getItem(key){try{return localStorage.getItem(key)}catch{return null}},setItem(key,value){try{localStorage.setItem(key,value)}catch{/* session state remains usable */}}};
export const game={level:0,theme:0,progress:readProgress(storage),hint:false,zoom:false,notice:'每张图只有一个目标，找到即可完成本关。',feedback:null,cursor:null,unlock:null,flipping:false};
export function persistGame(){storage.setItem(KEY,JSON.stringify(Object.fromEntries(levels.map((l,i)=>[l.id,game.progress[i]]))));}
export function isHit(level,x,y){const t=levels[level].target;return x>=t.x&&x<=t.x+t.w&&y>=t.y&&y<=t.y+t.h;}
export function findTarget(x,y){
  if(game.progress[game.level].found)return false;
  const hit=isHit(game.level,x,y);game.feedback={x,y,hit};
  if(!hit){game.notice='这里还不是目标，再仔细看看纹样的线条。';return false;}
  game.progress[game.level].found=true;game.theme=game.level;game.unlock=game.level;game.notice=`已找到${levels[game.level].name}，对应苗绣衣橱已解锁！`;persistGame();
  window.dispatchEvent(new CustomEvent('miao:motif-found',{detail:{levelId:levels[game.level].id,theme:levels[game.level].id,name:levels[game.level].name,image:levels[game.level].image}}));return true;
}
export function claimReward(random=Math.random){const p=game.progress[game.theme];if(!p.found||p.reward!==null)return null;p.reward=Math.min(4,Math.floor(random()*5));persistGame();return p.reward;}
export function decodeMarkup(){const l=levels[game.level],p=game.progress[game.level],t=l.target;
 return `<div class="decode-game"><div class="decode-toolbar"><span class="level-label">第 0${game.level+1} 关 · ${l.title}</span><span class="decode-counter">已完成 ${game.progress.filter(p=>p.found).length} / 3</span></div><div class="level-tabs" aria-label="选择关卡">${levels.map((item,i)=>`<button data-action="level" data-index="${i}" class="${i===game.level?'active':''}" aria-pressed="${i===game.level}"><small>0${i+1}</small>${item.title}<span>${game.progress[i].found?'✓':'○'}</span></button>`).join('')}</div><div class="target-brief"><span>本关寻找</span><strong>${l.icon} ${l.name}</strong><small>单图 · 单目标</small></div><div class="decode-viewport ${game.zoom?'zoomed':''}"><div class="decode-board ${p.found?'solved':''}" data-action="find" tabindex="0" role="button" aria-disabled="${p.found}" aria-label="${l.title}，寻找${l.name}。方向键移动观察点，回车确认位置。" aria-describedby="decode-feedback"><img src="${A}experience/${l.image}" alt="${l.title}" draggable="false"/>${(game.hint||p.found)?`<span class="target-outline ${p.found?'found':''}" style="left:${t.x}%;top:${t.y}%;width:${t.w}%;height:${t.h}%">${p.found?'<b>✓ 已找到</b>':''}</span>`:''}${game.feedback?`<span class="click-ripple ${game.feedback.hit?'hit':'miss'}" style="left:${game.feedback.x}%;top:${game.feedback.y}%">${game.feedback.hit?'✦':'×'}</span>`:''}${game.cursor?`<span class="observation-cursor" style="left:${game.cursor.x}%;top:${game.cursor.y}%">＋</span>`:''}</div></div><div class="decode-actions"><button data-action="hint" aria-pressed="${game.hint}" ${p.found?'disabled':''}>⌕ ${game.hint?'收起提示':'查看线索'}</button><button data-action="decodeZoom" aria-pressed="${game.zoom}">${game.zoom?'－ 还原画面':'＋ 放大观察'}</button><button data-action="nextLevel" ${game.level===2?'disabled':''}>下一张 →</button></div><p id="decode-feedback" class="decode-feedback ${game.feedback?.hit?'success':''}" role="status" aria-live="polite">${game.notice}</p>${game.hint&&!p.found?`<p class="hint-copy">${l.hint}</p>`:''}${game.progress.every(p=>p.found)?'<div class="all-complete">✦ 三关寻纹已完成，三个主题衣橱全部解锁。</div>':''}</div>`;
}
export function unlockMarkup(){if(game.unlock===null)return '';const l=levels[game.unlock];return `<div class="unlock-overlay" data-action="dismissUnlock"><section class="unlock-dialog" role="dialog" aria-modal="true" aria-labelledby="unlock-title" tabindex="-1"><button class="unlock-close" data-action="dismissUnlock" aria-label="关闭解锁提示">×</button><div class="unlock-symbol">${l.icon}</div><span class="eyebrow">纹样发现 · 衣橱解锁</span><h2 id="unlock-title">你找到了${l.name}！</h2><p>${l.description}</p><div class="unlock-ticket">✓ ${l.name}主题衣橱<br/><small>已获得一次专属抽取机会</small></div><button class="primary-btn" data-action="openWardrobe">前往苗绣衣橱 →</button><button class="unlock-continue" data-action="continueDecode">${game.level<2?'继续寻找下一张':'返回寻纹画面'}</button></section></div>`;}
