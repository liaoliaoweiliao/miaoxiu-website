export const navigation = [
  { id: 'home', label: '首页', chapter: '01', cue: '从苗乡出发', note: '一眼千年，山水有绣。' },
  { id: 'history', label: '苗绣探源', chapter: '02', cue: '读懂一针一线', note: '听故事 · 识纹样 · 看针法' },
  { id: 'experience', label: '互动体验', chapter: '03', cue: '把喜欢穿上身', note: '寻纹解密 · 抽取苗衣 · 自由换装' },
  { id: 'gallery', label: '作品展览', chapter: '04', cue: '让绣色入眼', note: '十八件作品，十八种相遇。' },
];

// Each invitation leads to existing content; no account or stored progress needed.
export const inspirationCards = [
  {
    id: 'butterfly', page: 'history', stamp: '寻根签', image: 'history/story-butterfly.webp',
    title: '衣襟上的蝴蝶，藏着谁的故事？',
    description: '从「蝴蝶妈妈」的古歌开始，读懂苗绣里关于生命的祝愿。',
    action: '去苗绣探源找答案', tag: '故事 · 纹样 · 针法',
  },
  {
    id: 'wardrobe', page: 'experience', stamp: '绣趣签', image: 'home/feature-experience-photo.jpg',
    title: '下一套苗衣，会是什么模样？',
    description: '寻一处纹样，抽一套苗衣，再搭配出属于你的苗绣装扮。',
    action: '开启我的苗绣体验', tag: '寻纹 · 抽衣 · 换装',
  },
  {
    id: 'gallery', page: 'gallery', stamp: '赏色签', image: 'home/feature-gallery.webp',
    title: '如果针线会说话，它会说什么？',
    description: '走近十八件绣作，放大看看那些值得慢慢欣赏的细节。',
    action: '走进作品长廊', tag: '绣作 · 细节 · 灵感',
  },
];
