import { costumeSets } from './catalog.js';
import { game, collection, levels, setById, themeById, findTarget, startRandomRound, choosePool, chooseGender, chooseDrawGender, drawCostume, equipCard, resetOutfit, previewLayers, assetURL, hasOutfit } from './game.js';
import { app } from './shared.js';
const motion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
function scrollToId(id,focus){document.getElementById(id)?.scrollIntoView({behavior:motion(),block:'start'});if(focus)app.querySelector(focus)?.focus({preventScroll:true});}
function nextRound(render,completed){if(startRandomRound(Math.random,completed)===null)return;render();app.querySelector('.decode-board')?.scrollIntoView({behavior:motion(),block:'center'});app.querySelector('.decode-board')?.focus({preventScroll:true});setTimeout(()=>{game.dealing=false;app.querySelector('.decode-board')?.classList.remove('is-dealing');},500);}
export function handleExperienceAction(action,el,e,render){
 switch(action){
  case'find':{if(game.found)return true;const r=el.getBoundingClientRect();if(!r.width||!r.height)return true;findTarget(e.detail===0?game.cursor?.x??50:(e.clientX-r.left)/r.width*100,e.detail===0?game.cursor?.y??50:(e.clientY-r.top)/r.height*100);break;}
  case'randomImage':nextRound(render,false);return true;
  case'finishLoop':nextRound(render,true);return true;
  case'pool':choosePool(el.dataset.id);break;
  case'gender':chooseGender(el.dataset.id);break;
  case'drawGender':chooseDrawGender(el.dataset.id);break;
  case'draw':{
   if(game.drawing||game.reveal||!game.drawGender||!collection.unlocked.includes(game.theme))return true;
   const theme=game.theme,gender=game.drawGender;chooseGender(gender);game.drawing=true;game.reveal=false;game.collectionNote='绣衣流转中，即将揭晓你的专属套装…';if(typeof Image!=='undefined')for(const card of costumeSets.filter(c=>c.theme===theme&&c.gender===gender)){const image=new Image();image.onload=()=>{};image.onerror=()=>{};image.src=assetURL(card.card);}render();
   setTimeout(()=>{drawCostume(Math.random,theme,gender);game.drawing=false;game.reveal=true;render();setTimeout(()=>{game.reveal=false;app.querySelector('.draw-card')?.classList.remove('just-revealed');render();},1500);},matchMedia('(prefers-reduced-motion: reduce)').matches?0:3000);return true;
  }
  case'openWardrobe':if(!game.found)return true;if(game.theme!==levels[game.level].id)choosePool(levels[game.level].id);game.theme=levels[game.level].id;game.unlock=null;render();scrollToId('miao-wardrobe','[data-action="drawGender"]');return true;
  case'browseWardrobe':render();scrollToId('miao-wardrobe');return true;
  case'backToPuzzle':app.querySelector('.decode-board')?.scrollIntoView({behavior:motion(),block:'center'});app.querySelector('.decode-board')?.focus();return true;
  case'openDressup':if(game.lastDraw&&collection.gender!==setById(game.lastDraw).gender){const id=game.lastDraw;chooseGender(setById(id).gender);game.lastDraw=id;}render();scrollToId('miao-dressup','.owned-card .wear-full');return true;
  case'dismissUnlock':if(e.target.closest('.unlock-dialog')&&!e.target.closest('.unlock-close'))return true;game.unlock=null;render();app.querySelector('.decode-board')?.focus({preventScroll:true});return true;
  case'collectionFilter':if(['all',...levels.map(l=>l.id)].includes(el.dataset.id))game.filter=el.dataset.id;break;
  case'equip':equipCard(el.dataset.id);game.saveNote='搭配已更新，可保存当前效果图。';break;
  
  case'resetOutfit':resetOutfit();game.saveNote='已恢复基础形象，藏品仍保留。';break;
  case'save':saveLook(render);return true;
  default:return false;
 }
 render();return true;
}
export function handleExperienceKey(e,render){
 if(game.unlock){
  if(e.key==='Escape'){game.unlock=null;render();app.querySelector('.decode-board')?.focus();e.preventDefault();}
  if(e.key==='Tab'){const buttons=[...app.querySelectorAll('.unlock-dialog button')],first=buttons[0],last=buttons.at(-1),dialog=document.activeElement?.classList.contains('unlock-dialog');if(e.shiftKey&&(document.activeElement===first||dialog)){last?.focus();e.preventDefault();}else if(!e.shiftKey&&(document.activeElement===last||dialog)){first?.focus();e.preventDefault();}}
  return true;
 }
 if(!e.target.classList.contains('decode-board')||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '].includes(e.key))return false;
 e.preventDefault();if(game.found)return true;
 if(e.key==='Enter'||e.key===' ')findTarget(game.cursor?.x??50,game.cursor?.y??50);
 else{const c=game.cursor||{x:50,y:50};game.cursor={x:Math.max(0,Math.min(100,c.x+(e.key==='ArrowLeft'?-2:e.key==='ArrowRight'?2:0))),y:Math.max(0,Math.min(100,c.y+(e.key==='ArrowUp'?-2:e.key==='ArrowDown'?2:0)))};}
 render();return true;
}
export async function paintLook(canvas,layers,gender){
 canvas.width=900;canvas.height=1400;const ctx=canvas.getContext('2d');
 const bg=ctx.createLinearGradient(0,0,0,1400);bg.addColorStop(0,'#0d3852');bg.addColorStop(1,'#041c30');ctx.fillStyle=bg;ctx.fillRect(0,0,900,1400);
 const unique=[...new Set(layers.map(l=>l.src))],images={};
 await Promise.all(unique.map(src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images[src]=img;resolve();};img.onerror=()=>reject(new Error('image-load'));img.src=assetURL(src);}))); 
 const x=75,y=40,w=750,h=1125;
 for(const layer of layers){const [sx,sy,sw,sh]=layer.source,[dx,dy,dw,dh]=layer.dest;ctx.drawImage(images[layer.src],sx,sy,sw,sh,x+dx/768*w,y+dy/1152*h,dw/768*w,dh/1152*h);}
 ctx.strokeStyle='#d8b17d';ctx.lineWidth=2;ctx.strokeRect(28,28,844,1344);ctx.textAlign='center';ctx.fillStyle='#f0ce9f';ctx.font='bold 32px serif';ctx.fillText('我的苗绣装扮',450,1220);ctx.font='18px serif';ctx.fillStyle='#dae3e9';
 const names=[...new Set(layers.filter(l=>l.setId).map(l=>themeById(setById(l.setId).theme).name))];ctx.fillText(`${gender==='girl'?'苗绣女孩':'苗绣少年'} · ${names.join(' / ')}`,450,1260);ctx.font='16px serif';ctx.fillText('穿在身上的民族历史',450,1310);return canvas;
}
async function saveLook(render){
 if(!hasOutfit()||game.saving)return;const layers=previewLayers().map(p=>({...p})),gender=collection.gender;game.saving=true;game.saveNote='正在生成当前搭配效果图…';render();
 try{const canvas=await paintLook(document.createElement('canvas'),layers,gender);const a=document.createElement('a');a.download=`我的苗绣装扮-${gender}.png`;a.href=canvas.toDataURL('image/png');a.click();game.saveNote='效果图已生成，已发起下载。';}catch{game.saveNote='图片尚未加载完成，未能保存。请稍后重试。';}
 finally{game.saving=false;render();}
}

let lastGarmentAppearance=null;
export function bindGarmentReveal(){
 const figure=app.querySelector('.garment-display');
 if(!figure?.dataset?.appearance)return;
 const key=figure.dataset.appearance;
 if(lastGarmentAppearance!==key){lastGarmentAppearance=key;figure.classList.add('garment-enter');figure.closest?.('.look-viewer')?.classList.add('look-arriving');}
}
