import { costumeSets } from '../../data/catalog.js';
import { waterRegions } from './water-regions.js';
const rect=(x,y,w,h)=>({shape:'rect',x,y,w,h});
const ellipse=(cx,cy,rx,ry)=>({shape:'ellipse',cx,cy,rx,ry});
export const levels = [
  {id:'star',name:'八角星纹',icon:'✵',title:'彩色苗绣纹样特写',image:'close-up of colourful Miao embroidery motifs.jpg',description:'最左侧露出的彩色星纹、粉红色方框、右侧红色方框与最右侧蓝色方框中，都绣有鲜明的八角星形图案。',regions:[
    rect(19.6,1,11.5,16.5),rect(19.6,25.4,11.5,17),rect(19.2,49.4,11.5,17.3),rect(19.4,74.3,11.5,17),
    rect(65.3,0,11.3,17.3),rect(65.1,26.1,11.8,16.5),rect(64.5,51.1,12.3,15.8),rect(64.2,75.5,12.5,16.6),
    rect(91.1,0,8.9,11.4),rect(91.1,20.1,8.9,17.2),rect(91.1,44.3,8.9,17.4),rect(91.1,68.5,8.9,17.3),rect(91.1,92.4,8.9,7.6),
    rect(0,10.4,4.7,13.2),rect(0,32.7,5.5,13.4),rect(0,55.1,5.2,14),rect(0,77.8,5.1,13.8)
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

export const themeById = (id) => levels.find((level) => level.id === id);
export const setById = (id) => costumeSets.find((costume) => costume.id === id);
export const ownedSets = (collection, gender = collection.gender) => costumeSets.filter((costume) => costume.gender === gender && collection.owned.includes(costume.id));
export const hasOutfit = (collection) => Boolean(collection.equipped[collection.gender]);
export const randomImageIndex = (random = Math.random) => Math.min(2, Math.max(0, Math.floor(random() * 3)));

export function visibleCollection({ collection, outfitChosen }) {
  return { ...collection, equipped: {
    girl: outfitChosen.girl ? collection.equipped.girl : null,
    boy: outfitChosen.boy ? collection.equipped.boy : null,
  } };
}

export function previewLayers(collection) {
  const costume = setById(collection.equipped[collection.gender]);
  return [{ src: costume ? costume.portrait : `experience/catalog/${collection.gender}-base.webp`, source: [0, 0, 768, 1152], dest: [0, 0, 768, 1152], setId: costume?.id || null, part: 'all' }];
}

export function hitRegion(index, x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) return -1;
  return levels[index]?.regions.findIndex((region) => region.shape === 'rect'
    ? x >= region.x && x <= region.x + region.w && y >= region.y && y <= region.y + region.h
    : ((x - region.cx) / region.rx) ** 2 + ((y - region.cy) / region.ry) ** 2 <= 1) ?? -1;
}
export const isHit = (index, x, y) => hitRegion(index, x, y) >= 0;

export function createExperienceState(storage, random = Math.random) {
  const level = randomImageIndex(random);
  return { level, theme: levels[level].id, round: 1, found: false, region: 0, dressed: false, outfitChosen: { girl: false, boy: false }, feedback: null, cursor: null, unlock: null, drawing: false, drawGender: null, lastDraw: null, reveal: false, dealing: false, selectedCard: null, filter: 'all', notice: '找到任意一处对应纹样，即可解锁该主题衣橱。', collectionNote: '', saving: false, saveNote: '', wearRevision: 0, drawRevision: 0, collection: readCollection(storage) };
}

export function experienceReducer(state, action) {
  const collection = state.collection;
  switch (action.type) {
    case 'find': {
      if (state.found) return state;
      const region = hitRegion(state.level, action.x, action.y);
      const feedback = { x: action.x, y: action.y, hit: region >= 0 };
      if (region < 0) return { ...state, feedback, notice: '还未找到，再仔细观察纹样的形状。' };
      const theme = levels[state.level];
      return { ...state, found: true, region, theme: theme.id, unlock: theme.id, lastDraw: null, drawGender: null, feedback, notice: `已找到${theme.name}，对应苗绣衣橱已解锁。`, collection: collection.unlocked.includes(theme.id) ? collection : { ...collection, unlocked: [...collection.unlocked, theme.id] } };
    }
    case 'cursor': return { ...state, cursor: { x: Math.max(0, Math.min(100, action.x)), y: Math.max(0, Math.min(100, action.y)) } };
    case 'round': {
      if (state.drawing || state.reveal || state.found && !action.completed || action.completed && (!state.found || !state.lastDraw || !state.dressed || !hasOutfit(visibleCollection(state)))) return state;
      const choices = levels.map((_, index) => index).filter((index) => index !== state.level);
      const sample = Number.isFinite(action.random) ? action.random : 0;
      const level = choices[Math.min(choices.length - 1, Math.max(0, Math.floor(sample * choices.length)))];
      return { ...state, level, theme: levels[level].id, round: state.round + 1, drawGender: null, lastDraw: null, reveal: false, found: false, dressed: false, outfitChosen: { girl: false, boy: false }, feedback: null, cursor: null, region: 0, unlock: null, selectedCard: null, filter: 'all', collectionNote: '', saveNote: '', dealing: true, notice: '新一轮寻纹已开始，找到纹样后可继续抽取服装、装扮人物。已有收藏会保留。' };
    }
    case 'dealDone': return { ...state, dealing: false };
    case 'pool':
      return levels.some((level) => level.id === action.id) && !state.drawing && !state.reveal && !state.lastDraw ? { ...state, theme: action.id, drawGender: null, collectionNote: '', reveal: false } : state;
    case 'gender': {
      if (!['girl', 'boy'].includes(action.id) || state.drawing || state.reveal) return state;
      return { ...state, collection: { ...collection, gender: action.id }, selectedCard: ownedSets(collection, action.id)[0]?.id || null, dressed: Boolean(state.found && state.lastDraw && state.outfitChosen[action.id] && collection.equipped[action.id]) };
    }
    case 'drawGender': {
      if (!['girl', 'boy'].includes(action.id) || state.drawing || state.reveal || state.lastDraw || !state.found || state.theme !== levels[state.level].id) return state;
      return { ...state, collection: { ...collection, gender: action.id }, collectionNote: '', selectedCard: ownedSets(collection, action.id)[0]?.id || null, drawGender: action.id };
    }
    case 'drawStart':
      return state.found && state.theme === levels[state.level].id && !state.lastDraw && !state.drawing && !state.reveal && state.drawGender && collection.unlocked.includes(state.theme) ? { ...state, collection: { ...collection, gender: state.drawGender }, drawing: true, reveal: false, collectionNote: '绣衣流转中，即将揭晓你的专属套装…' } : state;
    case 'drawComplete': {
      if (!state.drawing) return state;
      const pool = costumeSets.filter((costume) => costume.theme === state.theme && costume.gender === state.drawGender);
      const missing = pool.filter((costume) => !collection.owned.includes(costume.id));
      const candidates = missing.length ? missing : pool;
      if (!candidates.length) return { ...state, drawing: false };
      const sample = Number.isFinite(action.random) ? action.random : 0;
      const costume = candidates[Math.min(candidates.length - 1, Math.max(0, Math.floor(sample * candidates.length)))];
      const fresh = !collection.owned.includes(costume.id);
      return { ...state, collection: fresh ? { ...collection, owned: [...collection.owned, costume.id] } : collection, drawing: false, reveal: true, lastDraw: costume.id, dressed: hasOutfit(visibleCollection(state)), selectedCard: costume.id, drawRevision: state.drawRevision + 1, lastFresh: fresh, collectionNote: fresh ? `已收藏「${costume.name}」整套服装，可前往人物装扮一键穿戴。` : `「${costume.name}」已在藏品库中，可再次试穿；重复卡不占用新位置。` };
    }
    case 'revealDone': return { ...state, reveal: false };
    case 'dismiss': return { ...state, unlock: null };
    case 'openWardrobe': return state.found ? { ...state, theme: levels[state.level].id, drawGender: state.theme === levels[state.level].id ? state.drawGender : null, lastDraw: state.theme === levels[state.level].id ? state.lastDraw : null, unlock: null } : state;
    case 'filter': return ['all', ...levels.map(({ id }) => id)].includes(action.id) ? { ...state, filter: action.id } : state;
    case 'equip': {
      const costume = setById(action.id);
      if (!costume || !collection.owned.includes(action.id) || costume.gender !== collection.gender) return state;
      return { ...state, collection: { ...collection, equipped: { ...collection.equipped, [collection.gender]: costume.id } }, outfitChosen: { ...state.outfitChosen, [collection.gender]: true }, selectedCard: costume.id, dressed: Boolean(state.found && state.lastDraw), wearRevision: state.wearRevision + 1, saveNote: '搭配已更新，可保存当前效果图。' };
    }
    case 'reset': return { ...state, collection: { ...collection, equipped: { ...collection.equipped, [collection.gender]: null } }, outfitChosen: { ...state.outfitChosen, [collection.gender]: false }, dressed: false, wearRevision: state.wearRevision + 1, saveNote: '已恢复基础形象，藏品仍保留。' };
    case 'saveStart': return { ...state, saving: true, saveNote: '正在生成当前搭配效果图…' };
    case 'saveDone': return { ...state, saving: false, saveNote: action.error ? '图片尚未加载完成，未能保存。请稍后重试。' : '效果图已生成，已发起下载。' };
    case 'storageFailed': return { ...state, collectionNote: '当前浏览器无法保存收藏，离开前请保存搭配效果图。' };
    default: return state;
  }
}
