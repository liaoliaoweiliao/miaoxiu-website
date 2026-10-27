import { galleryDisplayWorks } from './gallery.js';
import { motifGroups, stitches, stories } from './history.js';
import { levels } from '../features/experience/gameModel.js';

export const searchIndex = [
  { id: 'home', title: '首页', label: '首页 · 地域与支系', keywords: ['地域', '支系', '分布', '地图'], kind: 'page', page: 'home' },
  { id: 'history', title: '苗绣探源', label: '苗绣探源 · 故事与文化', keywords: ['苗绣', '历史', '文化', '传承'], kind: 'section', page: 'history', section: 'history-stories' },
  { id: 'gallery', title: '作品展览', label: '作品展览 · 全部作品', keywords: ['作品', '展览', '设计', '服饰'], kind: 'page', page: 'gallery' },
  { id: 'decode', title: '寻纹解密', label: '互动体验 · 寻找纹样', keywords: ['互动', '互动体验', '寻纹', '解密'], kind: 'section', page: 'experience', section: 'board' },
  { id: 'wardrobe', title: '苗绣衣橱', label: '互动体验 · 抽取整套服装', keywords: ['衣橱', '抽卡', '抽取', '套装', '服装'], kind: 'section', page: 'experience', section: 'wardrobe' },
  { id: 'dressup', title: '人物装扮', label: '互动体验 · 我的藏品库', keywords: ['装扮', '换装', '收藏', '藏品'], kind: 'section', page: 'experience', section: 'dressup' },
  { id: 'colors', title: '色彩解析', label: '苗绣探源 · 配色体验', keywords: ['色彩', '颜色', '配色'], kind: 'section', page: 'history', section: 'history-colors' },
  { id: 'sources', title: '素材来源', label: '素材来源 · 署名与许可', keywords: ['素材', '来源', '版权', '许可'], kind: 'page', page: 'sources' },
  ...stitches.map((item, index) => ({ id: `stitch-${index}`, title: item.name, label: `针法 · ${item.desc}`, keywords: ['针法', '绣法', '技艺', '技法'], kind: 'stitch', page: 'history', section: 'history-stitches', index })),
  ...galleryDisplayWorks().map((item, index) => ({ id: `work-${index}`, title: item.title, label: `作品 · ${item.sub}`, keywords: ['作品', '展览', item.sub], kind: 'work', page: 'gallery', index })),
  ...stories.map((item, index) => ({ id: `story-${index}`, title: item.title, label: '故事 · 打开故事书', keywords: ['故事', '传说'], kind: 'story', page: 'history', section: 'history-stories', index })),
  ...Object.entries(motifGroups).flatMap(([group, entry]) => entry.items.map((item, index) => ({ id: `motif-${group}-${index}`, title: item.name, label: `纹样 · ${entry.title}`, keywords: ['纹样', '图案', entry.title], kind: 'motif', page: 'history', section: 'history-patterns', group, index }))),
  ...levels.map((item) => ({ id: `theme-${item.id}`, title: item.name, label: '互动体验 · 对应主题衣橱', keywords: ['纹样', '衣橱', item.name], kind: 'theme', page: 'experience', section: 'wardrobe', theme: item.id })),
];

export const searchSuggestions = ['针法', '蝴蝶纹', '银冠盛装'];
