// This module is deliberately independent of the DOM and browser storage.
export const PROGRESS_KEY = 'miao-decode-v1';
export const LOOK_KEY = 'miao-look-v1';

export const levels = [
  { id: 'spiral', name: '旋涡纹', icon: '◎', title: '彩色刺绣背包', image: 'colorful embroidered backpack.jpg', hint: '观察中央绿色与黑色背包上方的红白卷曲线条。', description: '红白卷曲线条连续回旋，形成富有节奏的旋涡纹。', target: { x: 46, y: 14, w: 12, h: 25 } },
  { id: 'flower', name: '花朵纹', icon: '❀', title: '红色民族服饰', image: 'red ethnic costume.jpg', hint: '在画面中央的黄色绣片上，寻找红黄相间的花朵。', description: '黄色绣片上的红黄花朵，以鲜明的色彩与舒展的花瓣构成花朵纹。', target: { x: 44, y: 40, w: 10, h: 14 } },
  { id: 'lines', name: '回纹与线条纹', icon: '▱', title: '手工刺绣布', image: 'hand‑embroidered fabric .jpg', hint: '沿左侧边框观察，寻找层层嵌套的平行线和重复折线。', description: '平行线、交叉线和重复折线层层嵌套，构成边框的几何装饰。', target: { x: 17, y: 37, w: 13, h: 23 } },
];

export const initialNotice = '每张图只有一个目标，找到即可完成本关。';

export function readProgress(storage) {
  try {
    const raw = JSON.parse(storage?.getItem(PROGRESS_KEY) || '{}');
    return levels.map(({ id }) => {
      const saved = raw?.[id];
      const found = saved?.found === true;
      return { found, reward: found && Number.isInteger(saved?.reward) && saved.reward >= 0 && saved.reward < 5 ? saved.reward : null };
    });
  } catch {
    return levels.map(() => ({ found: false, reward: null }));
  }
}

export function persistProgress(storage, progress) {
  try {
    storage?.setItem(PROGRESS_KEY, JSON.stringify(Object.fromEntries(levels.map(({ id }, index) => [id, progress[index]]))));
  } catch { /* A blocked or full storage must not prevent playing. */ }
}

export function readLook(storage) {
  try {
    const raw = JSON.parse(storage?.getItem(LOOK_KEY) || '{}');
    return {
      garment: Number.isInteger(raw?.garment) && raw.garment >= 0 && raw.garment < 5 ? raw.garment : 0,
      look: Number.isInteger(raw?.look) && raw.look >= 0 && raw.look < 4 ? raw.look : 0,
    };
  } catch { return { garment: 0, look: 0 }; }
}

export function persistLook(storage, { garment, look }) {
  try { storage?.setItem(LOOK_KEY, JSON.stringify({ garment, look })); } catch { /* Session state remains usable. */ }
}

export function createGameState(storage) {
  return { level: 0, theme: 0, progress: readProgress(storage), hint: false, zoom: false, notice: initialNotice, feedback: null, cursor: null, unlock: null, flipping: false };
}

export function isHit(level, x, y) {
  const target = levels[level]?.target;
  return !!target && Number.isFinite(x) && Number.isFinite(y) && x >= target.x && x <= target.x + target.w && y >= target.y && y <= target.y + target.h;
}

export function claimReward(progress, theme, random = Math.random) {
  const current = progress[theme];
  if (!current?.found || current.reward !== null) return null;
  const sample = random();
  if (!Number.isFinite(sample)) return null;
  const reward = Math.max(0, Math.min(4, Math.floor(sample * 5)));
  return { reward, progress: progress.map((item, index) => index === theme ? { ...item, reward } : item) };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'level': {
      if (!Number.isInteger(action.index) || !levels[action.index]) return state;
      return { ...state, level: action.index, hint: false, zoom: false, feedback: null, cursor: null, unlock: null, notice: state.progress[action.index].found ? `已找到${levels[action.index].name}，可以前往衣橱领取服饰。` : initialNotice };
    }
    case 'theme': return levels[action.index] ? { ...state, theme: action.index } : state;
    case 'find': {
      if (state.progress[state.level].found || !Number.isFinite(action.x) || !Number.isFinite(action.y)) return state;
      const hit = isHit(state.level, action.x, action.y);
      const next = { ...state, feedback: { x: action.x, y: action.y, hit }, notice: '这里还不是目标，再仔细看看纹样的线条。' };
      if (!hit) return next;
      return { ...next, progress: state.progress.map((item, index) => index === state.level ? { ...item, found: true } : item), theme: state.level, unlock: state.level, notice: `已找到${levels[state.level].name}，对应苗绣衣橱已解锁！` };
    }
    case 'hint': return state.progress[state.level].found ? state : { ...state, hint: !state.hint };
    case 'zoom': return { ...state, zoom: !state.zoom };
    case 'cursor': return { ...state, cursor: { x: Math.max(0, Math.min(100, action.x)), y: Math.max(0, Math.min(100, action.y)) } };
    case 'dismiss': return { ...state, unlock: null };
    case 'draw': {
      if (state.flipping) return state;
      const result = claimReward(state.progress, state.theme, () => action.random);
      return result ? { ...state, progress: result.progress, flipping: true } : state;
    }
    case 'flipDone': return state.flipping ? { ...state, flipping: false } : state;
    default: return state;
  }
}

export function createExperienceState(storage, motif = 0) {
  return { game: createGameState(storage), ...readLook(storage), motif };
}

export function experienceReducer(state, action) {
  if (action.type === 'motif') return { ...state, motif: action.index };
  if (action.type === 'garment') return Number.isInteger(action.index) && action.index >= 0 && action.index < 5 ? { ...state, garment: action.index } : state;
  if (action.type === 'look') return Number.isInteger(action.index) && action.index >= 0 && action.index < 4 ? { ...state, look: action.index } : state;
  if (action.type === 'nextLook') return { ...state, look: (state.look + 1) % 4 };
  if (action.type === 'reset') return { ...state, garment: 0, look: 0 };
  const game = gameReducer(state.game, action);
  if (game === state.game) return state;
  return { ...state, game, garment: action.type === 'draw' && game.progress !== state.game.progress ? game.progress[game.theme].reward : state.garment };
}
