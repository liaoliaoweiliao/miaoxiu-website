import { A } from './shared.js';
import { costumeSets } from './catalog.js';
import { waterRegions } from './water-regions.js';
const rect=(x,y,w,h)=>({shape:'rect',x,y,w,h});
const ellipse=(cx,cy,rx,ry)=>({shape:'ellipse',cx,cy,rx,ry});
export const levels = [
  {id:'star',name:'八角星纹',icon:'✵',title:'彩色苗绣纹样特写',image:'close-up of colourful Miao embroidery motifs.jpg',description:'左侧粉红色方框、右侧红色方框与最右侧蓝色方框中，都绣有鲜明的八角星形图案。',regions:[
    rect(19.6,1,11.5,16.5),rect(19.6,25.4,11.5,17),rect(19.2,49.4,11.5,17.3),rect(19.4,74.3,11.5,17),
    rect(65.3,0,11.3,17.3),rect(65.1,26.1,11.8,16.5),rect(64.5,51.1,12.3,15.8),rect(64.2,75.5,12.5,16.6),
    rect(91.1,0,8.9,11.4),rect(91.1,20.1,8.9,17.2),rect(91.1,44.3,8.9,17.4),rect(91.1,68.5,8.9,17.3),rect(91.1,92.4,8.9,7.6)
  ]},
  {id:'peony',name:'牡丹花纹',icon:'❀',title:'苗族传统服饰与绣花裙',image:'traditional Miao costumes and embroidered skirts.jpg',description:'左侧两位女性的黑色裙子上，大朵粉红色牡丹与绿色叶子相互映衬。',regions:[
    ellipse(19.2,71.6,4.4,4.2),ellipse(22,79.8,4.7,4.8),ellipse(24,87,5.2,6.1),ellipse(23,94.8,4.6,4.9),ellipse(12.7,92,3.4,6.3),ellipse(11.8,82,2.2,4),
    ellipse(37,63,4.5,7.5),ellipse(39.5,74,4.8,7.8),ellipse(32.2,73,2.5,9.5),ellipse(39,80.5,3.2,3.5)
  ]},
  {id:'swirl',name:'水涡纹',icon:'◎',title:'彩色刺绣背包',image:'colorful embroidered backpack.jpg',description:'中央绿色与黑色背包上的红白卷曲线条，以及右侧背包上的蓝白卷曲线条，组成连续回旋的水涡纹。',regions:waterRegions}
];
export const CULTURE={
 star:{title:'八角星纹 · 对称与秩序',text:'八角星纹以中心向八个方向展开，重复排列形成清晰的几何节奏。绣娘通过针脚、色线与对称结构，把细密的纹样组织在袖口、围腰和衣裙上。观察尖角之间的色彩交替，可以读出苗绣几何装饰的层次。'},
 peony:{title:'牡丹花纹 · 针线中的花叶',text:'牡丹花纹以层叠的花瓣和舒展的绿叶构成装饰。粉红、红色与绿色在深色衣裙上形成鲜明对比。绣制时，花瓣的层次与叶脉的方向共同表现花朵的形态，体现苗绣以针线描绘自然的细腻手艺。'},
 swirl:{title:'水涡纹 · 回旋的线条',text:'水涡纹以连续卷曲和回旋的线条组成图案。红白或蓝白色线彼此衬托，让弯曲线条在深色底布上更加清晰。它适合重复组合在衣襟、袖片与围腰上，形成连绵而富有节奏的装饰。'}
};
export const COLLECTION_KEY='miao-wardrobe-v4';
export function readCollection(storage){
 const empty={unlocked:[],owned:[],gender:'girl',equipped:{girl:null,boy:null}};
 try{
  const str=storage.getItem(COLLECTION_KEY)||storage.getItem('miao-wardrobe-v3');
  if(!str){const old=JSON.parse(storage.getItem('miao-decode-v2')||'{}');if(old['eight-point-star']?.found)empty.unlocked.push('star');if(old.peony?.found)empty.unlocked.push('peony');return empty;}
  const raw=JSON.parse(str);if(!raw||typeof raw!=='object')return empty;
  empty.unlocked=[...new Set((Array.isArray(raw.unlocked)?raw.unlocked:[]).filter(id=>levels.some(l=>l.id===id)))];
  empty.owned=[...new Set((Array.isArray(raw.owned)?raw.owned:[]).filter(id=>costumeSets.some(c=>c.id===id&&empty.unlocked.includes(c.theme))))];
  if(raw.gender==='boy')empty.gender='boy';
  for(const gender of ['girl','boy']){
   const wear=raw.equipped?.[gender];
   const id=typeof wear==='string'?wear:wear&&Object.values(wear).every(id=>id===wear.head)?wear.head:null;
   if(empty.owned.includes(id)&&costumeSets.find(c=>c.id===id)?.gender===gender)empty.equipped[gender]=id;
  }
 }catch{/* Invalid or unavailable storage starts with an empty collection. */}
 return empty;
}
const safeStorage={getItem(k){try{return localStorage.getItem(k)}catch{return null}},setItem(k,v){try{localStorage.setItem(k,v);return true}catch{return false}}};
export const collection=readCollection(safeStorage);
export const randomImageIndex=(random=Math.random)=>Math.min(2,Math.max(0,Math.floor(random()*3)));
const first=randomImageIndex();
export const game={level:first,theme:levels[first].id,round:1,found:false,region:0,dressed:false,feedback:null,cursor:null,unlock:null,drawing:false,drawGender:null,lastDraw:null,reveal:false,dealing:false,selectedCard:null,filter:'all',notice:'找到任意一处对应纹样，即可解锁该主题衣橱。',collectionNote:'',saving:false};
export function saveCollection(){if(!safeStorage.setItem(COLLECTION_KEY,JSON.stringify(collection)))game.collectionNote='当前浏览器无法保存收藏，离开前请保存搭配效果图。';}
export const themeById=id=>levels.find(l=>l.id===id);
export const setById=id=>costumeSets.find(c=>c.id===id);
export const isUnlocked=id=>collection.unlocked.includes(id);
export const ownedSets=(gender=collection.gender)=>costumeSets.filter(c=>c.gender===gender&&collection.owned.includes(c.id));
export function isHit(index,x,y){return hitRegion(index,x,y)>=0;}
export function hitRegion(index,x,y){
 if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>100||y<0||y>100)return -1;
 return levels[index]?.regions.findIndex(r=>r.shape==='rect'?x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h:((x-r.cx)/r.rx)**2+((y-r.cy)/r.ry)**2<=1)??-1;
}
export function findTarget(x,y){
 if(game.found)return false;const region=hitRegion(game.level,x,y);game.feedback={x,y,hit:region>=0};
 if(region<0){game.notice='还未找到，再仔细观察纹样的形状。';return false;}
 const l=levels[game.level];game.found=true;game.region=region;game.theme=l.id;game.unlock=l.id;game.lastDraw=null;game.drawGender=null;game.notice=`已找到${l.name}，对应苗绣衣橱已解锁。`;
 if(!isUnlocked(l.id))collection.unlocked.push(l.id);saveCollection();
 window.dispatchEvent(new CustomEvent('miao:motif-found',{detail:{theme:l.id,name:l.name,image:l.image,round:game.round}}));return true;
}
export function startRandomRound(random=Math.random,completed=false){
 if(game.drawing||game.found&&!completed||completed&&(!game.dressed||!hasOutfit()))return null;
 const choices=completed?[0,1,2].filter(i=>i!==game.level):[0,1,2];game.level=choices[Math.min(choices.length-1,Math.max(0,Math.floor(random()*choices.length)))];
 game.round++;game.drawGender=null;game.lastDraw=null;game.reveal=false;game.found=false;game.dressed=false;game.feedback=null;game.cursor=null;game.region=0;game.unlock=null;game.dealing=true;game.notice='新一轮寻纹已开始，找到纹样后可继续收集服饰、搭配人物。';return game.level;
}
export function choosePool(id){if(!isUnlocked(id)||game.drawing)return false;game.theme=id;game.drawGender=null;game.lastDraw=null;game.collectionNote="";game.reveal=false;return true;}
export function chooseGender(gender){if(!['girl','boy'].includes(gender)||game.drawing)return false;collection.gender=gender;game.lastDraw=null;game.collectionNote="";game.reveal=false;game.selectedCard=ownedSets()[0]?.id||null;saveCollection();return true;}
export function chooseDrawGender(gender){
 if(!chooseGender(gender))return false;game.drawGender=gender;return true;
}
export function drawCostume(random=Math.random,theme=game.theme,gender=game.drawGender){
 if(!game.drawGender||gender!==game.drawGender||!isUnlocked(theme)||!['girl','boy'].includes(gender))return null;
 const pool=costumeSets.filter(c=>c.theme===theme&&c.gender===gender);if(!pool.length)return null;
 const missing=pool.filter(c=>!collection.owned.includes(c.id));const candidates=missing.length?missing:pool;
 const card=candidates[Math.min(candidates.length-1,Math.max(0,Math.floor(random()*candidates.length)))];const fresh=!collection.owned.includes(card.id);
 if(fresh)collection.owned.push(card.id);game.lastDraw=card.id;game.selectedCard=card.id;game.collectionNote=fresh?`已收藏「${card.name}」整套服装，可前往人物装扮一键穿戴。`:`「${card.name}」已在藏品库中，可再次试穿；重复卡不占用新位置。`;saveCollection();
 window.dispatchEvent(new CustomEvent('miao:collection-updated',{detail:{theme:card.theme,setId:card.id,gender:card.gender,fresh}}));return card;
}
export function equipCard(id){
 const card=setById(id);if(!card||!collection.owned.includes(id)||card.gender!==collection.gender)return false;
 collection.equipped[collection.gender]=id;game.selectedCard=id;if(game.found)game.dressed=true;game.wearRevision=(game.wearRevision||0)+1;saveCollection();return true;
}
export function resetOutfit(){collection.equipped[collection.gender]=null;game.dressed=false;game.wearRevision=(game.wearRevision||0)+1;saveCollection();}
export const hasOutfit=()=>Boolean(collection.equipped[collection.gender]);
export function assetURL(path){return typeof IMAGE_DATA==='undefined'?A+path:IMAGE_DATA[path]||A+path;}
export function previewLayers(){
 const id=collection.equipped[collection.gender],c=setById(id);
 return [{src:c?c.portrait:`experience/catalog/${collection.gender}-base.webp`,source:[0,0,768,1152],dest:[0,0,768,1152],setId:c?.id||null,part:'all'}];
}
export function previewMarkup(){const layer=previewLayers()[0],dressed=hasOutfit();return `<div class="avatar-canvas" aria-label="当前人物预览"><div class="garment-display" data-appearance="${collection.gender}-${collection.equipped[collection.gender]||'base'}-${game.wearRevision||0}"><img class="whole-avatar ${dressed?'is-dressed':''}" data-look-revision="${game.wearRevision||0}" src="${A}${layer.src}" alt="${dressed?'已穿戴整套服装的人物':collection.gender==='girl'?'renwu ip 原始女孩形象':'renwu ip2 原始男孩形象'}"/>${dressed?`<span class="garment-shimmer" style="--garment-mask:url('${assetURL(layer.src)}')" aria-hidden="true"></span><span class="garment-sparks" aria-hidden="true">${Array.from({length:5},(_,i)=>`<i style="--glint:${i}">✧</i>`).join('')}</span>`:''}</div></div>`;}

function regionShape(r){return r.shape==='rect'?`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="1"/>`:`<ellipse cx="${r.cx}" cy="${r.cy}" rx="${r.rx}" ry="${r.ry}"/>`;}
export function decodeMarkup(){const l=levels[game.level];return `<div class="decode-game"><div class="decode-toolbar"><span class="level-label">第 ${game.round} 轮 · ${l.title}</span><span class="decode-counter">${game.found?'已找到':'寻找 1 处'}</span></div><div class="target-brief"><span>本图寻找</span><strong>${l.icon} ${l.name}</strong><small>命中即可解锁</small></div><div class="decode-viewport"><div class="decode-board ${game.found?'solved':''} ${game.dealing?'is-dealing':''}" data-action="${game.found?'modal':'find'}" data-src="experience/${l.image}" data-title="${l.title}" role="button" tabindex="0" aria-label="${game.found?'点击欣赏'+l.title:'寻找'+l.name+'，可用方向键移动观察点，回车确认。'}" aria-describedby="decode-feedback"><img src="${A}experience/${l.image}" alt="${l.title}" draggable="false"/>${game.found?`<svg class="found-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${regionShape(l.regions[game.region])}</svg>`:''}${game.feedback?`<span class="click-ripple ${game.feedback.hit?'hit':'miss'}" style="left:${game.feedback.x}%;top:${game.feedback.y}%" aria-hidden="true">${game.feedback.hit?'✦':'×'}</span>`:''}${game.cursor?`<span class="observation-cursor" style="left:${game.cursor.x}%;top:${game.cursor.y}%" aria-hidden="true">＋</span>`:''}</div><button class="decode-image-preview" data-action="modal" data-src="experience/${l.image}" data-title="${l.title}" aria-label="放大欣赏${l.title}">⤢ 欣赏图片</button></div><div class="decode-actions">${game.found?'<button data-action="openWardrobe">前往对应苗绣衣橱 →</button>':'<button data-action="randomImage">↻ 随机抽图</button>'}</div><p id="decode-feedback" class="decode-feedback" role="status">${game.notice}</p></div>`;}
export function unlockMarkup(){if(!game.unlock)return '';const l=themeById(game.unlock);return `<div class="unlock-overlay" data-action="dismissUnlock"><section class="unlock-dialog" role="dialog" aria-modal="true" aria-labelledby="unlock-title" tabindex="-1"><button class="unlock-close" data-action="dismissUnlock" aria-label="关闭">×</button><div class="unlock-symbol">${l.icon}</div><span class="eyebrow">寻纹成功</span><h2 id="unlock-title">你找到了${l.name}！</h2><p>${l.description}</p><div class="unlock-ticket">${l.name}卡池已解锁<br/><small>先选择角色，再抽取整套服装为人物换装</small></div><button class="primary-btn" data-action="openWardrobe">进入对应苗绣衣橱 →</button></section></div>`;}
