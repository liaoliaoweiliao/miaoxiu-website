import { A, link, state } from '../shared.js';
import { escapeHtml } from '../utils.js';

const stories = [
  {
    title: '一针一线的传承',
    image: 'history/story-stitch.webp',
    label: '阅读故事',
    description: '在苗寨的晨雾里，绣娘把关于山川与家族的记忆，藏进一段段细密的针脚。',
    pages: [
      '天还没亮透，木楼里已经点起一盏灯。阿婆把绷架架在膝头，银针在布里进出，像雨点落在青石板上，细密而均匀。',
      '她绣的是一幅「蝴蝶妈妈」。不看图纸，花样早在心里——那是她七岁那年，母亲握着她的手，一针一针认下的第一幅纹样。',
      '如今她教孙女时，说的还是同一句话：「针脚要浅，心意要深。」绣线穿过布的声响，就这样一代接一代，从祖母的手传到孩子的手里。'
    ]
  },
  {
    title: '兰娟记事',
    image: 'history/story-lanjuan.webp',
    label: '阅读故事',
    description: '一位苗族少女兰娟，用一针一线记录家乡的山水与传说，绣出了自己的成长故事。',
    pages: [
      '兰娟十六岁那年离开山寨去城里读书。行囊里除了衣物，还有一块母亲绣到一半的绣片，蓝底上浮着几枝没绣完的桐花。',
      '想家的时候，她就着灯接着绣。桐花一瓣一瓣绽开，山里的雾、田里的水声、母亲哼过的歌，也跟着一针一线回到心里。',
      '后来她回到寨子，把这块绣片做成了一件小小的衣裳。她说，这不是一件衣服，是一段她带得走、也传得下去的家乡。'
    ]
  },
  {
    title: '蝴蝶妈妈',
    image: 'history/story-butterfly.webp',
    label: '阅读故事',
    description: '相传蝴蝶妈妈用五彩的丝线，绣出了苗族先民对美好生活的向往。',
    pages: [
      '古歌里唱，蝴蝶妈妈从枫木的心里生出来，又生下十二个蛋，孵出人、雷公、龙、虎与蛇——世间万物，都是她的孩子。',
      '所以苗家人把蝴蝶绣在衣襟上、袖口上、背扇上。孩子出生，绣一只蝴蝶护着他；姑娘出嫁，绣一对蝴蝶祝她圆满。',
      '那不是装饰，是一句反复被绣下的祝愿：愿你被生命护着，愿你生生不息。'
    ]
  }
];

const motifGroups = {
  animal: {
    title: '动物纹样', icon: '✿',
    items: [
      { name: '蝴蝶纹', icon: '🦋', image: 'history/motifs/motif-butterfly.webp', alt: '蝴蝶纹苗绣图案', desc: '象征生命、祖先与美好，\n是苗族最具代表性的纹样。' },
      { name: '鸟纹', icon: '◈', image: 'history/motifs/motif-bird.webp', alt: '鸟纹苗绣图案', desc: '记录飞翔与迁徙的愿望，\n寄托自由、祝福与远方。' },
      { name: '龙纹', icon: '✦', image: 'history/motifs/motif-dragon.webp', alt: '龙纹苗绣图案', desc: '融合山川与神话想象，\n守护家园，也守护团聚。' },
      { name: '鱼纹', icon: '◉', image: 'history/motifs/motif-fish.webp', alt: '鱼纹苗绣图案', desc: '水波中的鱼游向丰收，\n寓意富足、繁衍与生生不息。' },
      { name: '蛙纹', icon: '✺', image: 'history/motifs/motif-frog.webp', alt: '蛙纹苗绣图案', desc: '来自田野与雨水的灵动符号，\n寄托对丰年的期盼。' },
      { name: '牛纹', icon: '♢', image: 'history/motifs/motif-cattle.webp', alt: '牛纹苗绣图案', desc: '把勤劳与力量绣入衣襟，\n讲述人与土地相依的故事。' }
    ]
  },
  plant: {
    title: '植物纹样', icon: '✤',
    items: [
      { name: '稻穗纹', icon: '❋', image: 'history/motifs/motif-rice.webp', alt: '稻穗纹苗绣图案', desc: '一束稻穗连着一季丰收，\n记录苗家人与土地的约定。' },
      { name: '桐花纹', icon: '✿', image: 'history/motifs/motif-tung-flower.webp', alt: '桐花纹苗绣图案', desc: '桐花轻盈而明亮，\n象征春日、家园与新生。' }
    ]
  },
  geometry: {
    title: '几何纹样', icon: '✧',
    items: [
      { name: '水波纹', icon: '≈', image: 'history/motifs/motif-water-wave.webp', alt: '水波纹苗绣图案', desc: '连续的曲线像山间水流，\n让纹样拥有清晰的节奏。' },
      { name: '回纹', icon: '◇', image: 'history/motifs/motif-meander.webp', alt: '回纹苗绣图案', desc: '方折相连、循环不息，\n凝结苗族先民的秩序之美。' }
    ]
  }
};

const stitches = [
  { name: '平绣', desc: '线面平整，色彩明快', thumb: 'history/stitches/01-pingxiu.webp', finish: 'history/stitch-results/01-pingxiu.webp', hotspots: [[15.28,40.56],[78.52,34.89],[68.06,72.22]], knots: [[34,46],[42,50],[51,45],[61,51],[42,63],[53,68],[65,63],[73,56]] },
  { name: '破线绣', desc: '一丝分成数缕，细密如发', thumb: 'history/stitches/03-poxianxiu.webp', finish: 'history/stitch-results/03-poxianxiu.webp', hotspots: [[15.74,58.33],[48.61,37.22],[75.46,33.33]], knots: [[27,54],[35,49],[43,45],[51,42],[59,40],[67,38],[74,36],[35,61],[45,58],[55,55],[65,52]] },
  { name: '锁绣', desc: '线迹相扣，轮廓利落', thumb: 'history/stitches/04-suoxiu.webp', finish: 'history/stitch-results/04-suoxiu.webp', hotspots: [[13.33,43.56],[51.85,41.67],[85.46,51.78]], knots: [[27,49],[35,45],[43,43],[51,43],[59,45],[67,48],[75,51],[83,53]] },
  { name: '缠绣', desc: '丝线缠绕，肌理丰润', thumb: 'history/stitches/06-chanxiu.webp', finish: 'history/stitch-results/06-chanxiu.webp', hotspots: [[14.07,49.22],[48.15,41.11],[80.83,59.11]], knots: [[27,53],[35,48],[43,44],[51,44],[59,48],[67,53],[75,58],[83,62]] },
  { name: '辫绣', desc: '编结成辫，纹理立体', thumb: 'history/stitches/05-bianxiu.webp', finish: 'history/stitch-results/05-bianxiu.webp', hotspots: [[18.33,68.89],[48.80,41.11],[80.00,69.00]], knots: [[25,63],[33,57],[41,51],[49,46],[57,51],[65,58],[73,64],[81,68]] },
  { name: '打籽绣', desc: '绣粒如珠，层次分明', thumb: 'history/stitches/02-dazixiu.webp', finish: 'history/stitch-results/02-dazixiu.webp', hotspots: [[33.52,35.89],[64.54,42.78],[63.89,71.33]], knots: [[38,44],[45,47],[53,46],[61,51],[43,58],[51,61],[59,60],[67,56],[47,70],[57,70]] }
];
const palette = [
  ['藏蓝', '#466bd5'],
  ['朱红', '#f26e43'],
  ['金黄', '#f2ba58'],
  ['米白', '#f4f0df'],
  ['深紫', '#72529a']
];
const colorChoices = [
  { name: '藏青', color: '#123b66', swatch: 'history/color-swatches/01-navy-swatch-no-text.webp', image: 'history/color-thread-closeups/01-navy-thread-closeup.png', meaning: '沉静深远，象征山川、夜色与坚韧。' },
  { name: '朱砂红', color: '#bd3d2f', swatch: 'history/color-swatches/02-vermilion-swatch-no-text.webp', image: 'history/color-thread-closeups/02-vermilion-thread-closeup.png', meaning: '热烈喜庆，常用于节庆服饰与重要纹样。' },
  { name: '暖金', color: '#d6a252', swatch: 'history/color-swatches/03-warm-gold-swatch-no-text.webp', image: 'history/color-thread-closeups/03-warm-gold-thread-closeup.png', meaning: '温暖明亮，寓意丰收、祝福与希望。' },
  { name: '靛蓝', color: '#416da3', swatch: 'history/color-swatches/04-indigo-swatch-no-text.webp', image: 'history/color-thread-closeups/04-indigo-thread-closeup.png', meaning: '清雅沉稳，连接河流、天空与远行。' },
  { name: '米白', color: '#eee6d5', swatch: 'history/color-swatches/05-ivory-swatch-no-text.webp', image: 'history/color-thread-closeups/05-ivory-thread-closeup.png', meaning: '质朴纯净，衬托彩线与细密针脚。' },
  { name: '翠绿', color: '#3c8068', swatch: 'history/color-swatches/06-jade-swatch-no-text.webp', image: 'history/color-thread-closeups/06-jade-thread-closeup.png', meaning: '生机盎然，象征植物、春天与新生。' }
];
const colorMotifs = [
  { name: '蝴蝶纹', key: 'butterfly', line: 'history/color-motifs/butterfly-line.webp', desc: '生命、自由与繁衍的象征' },
  { name: '花卉纹', key: 'flower', line: 'history/color-motifs/flower-line.webp', desc: '自然、丰收与吉祥的祝愿' },
  { name: '鸟纹', key: 'bird', line: 'history/color-motifs/bird-line.webp', desc: '迁徙、远方与自由的记忆' }
];
const colorExamples = [
  ['传统纹样', 'history/color-examples/07-traditional-festival-image-no-text.webp'],
  ['山野清雅', 'history/color-examples/08-mountain-elegant-image-no-text.webp'],
  ['现代苗风', 'history/color-examples/09-modern-miao-image-no-text.webp']
];
const defaultColorSet = [0, 2, 4];
function colorSelection() {
  return Array.isArray(state.historyColors) ? state.historyColors.filter((i) => Number.isInteger(i) && i >= 0 && i < colorChoices.length).slice(0, 3) : [];
}
function appliedColors() {
  const picked = colorSelection();
  if (!picked.length) return [];
  const result = [...picked];
  for (const i of defaultColorSet) if (result.length < 3 && !result.includes(i)) result.push(i);
  return result.slice(0, 3).sort((a, b) => a - b);
}
function motifColorImage(motif, indices) {
  if (!indices.length) return motif.line;
  return `history/color-motifs/${motif.key}-c${indices.join('-')}.webp`;
}

function storyCard(item, index) {
  return `<article class="story-card story-card-${index + 1}" data-story-card="${index}">
    <button class="story-image" data-action="story-open" data-index="${index}" aria-label="阅读故事《${item.title}》">
      <img src="${A}${item.image}" alt="${item.title}" />
      <span class="story-play" aria-hidden="true">▷</span>
      <span class="story-glint" aria-hidden="true"></span>
    </button>
    <div class="story-copy">
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <button class="story-more" data-action="story-open" data-index="${index}">${item.label}<span class="story-more-count">共 ${item.pages.length} 节</span></button>
    </div>
  </article>`;
}

/* 小故事阅读器：逐字浮现 + 分节翻阅，state.story = {index, page} */
function storyReader() {
  const current = state.story;
  if (!current) return '';
  const index = Math.max(0, Math.min(stories.length - 1, Number(current.index) || 0));
  const item = stories[index];
  const total = item.pages.length;
  const page = Math.max(0, Math.min(total - 1, Number(current.page) || 0));
  const hasPrev = page > 0;
  const hasNext = page < total - 1;
  return `<div class="story-reader" data-action="story-close">
    <section class="story-reader-panel" role="dialog" aria-modal="true" aria-labelledby="story-reader-title" tabindex="-1">
      <button class="story-reader-close" data-action="story-close" aria-label="合上故事">✕</button>
      <div class="story-reader-art">
        <img src="${A}${item.image}" alt="${item.title}" />
        <span class="story-reader-veil" aria-hidden="true"></span>
        <span class="story-reader-seal" aria-hidden="true">苗绣<br />小故事</span>
        <span class="story-reader-thread" aria-hidden="true"></span>
      </div>
      <div class="story-reader-body">
        <span class="story-reader-eyebrow">苗族小故事 · ${String(index + 1).padStart(2, '0')}</span>
        <h2 id="story-reader-title">${item.title}</h2>
        <p class="story-reader-text"><span data-story-text>${escapeHtml(item.pages[page])}</span><i class="story-reader-caret" aria-hidden="true"></i></p>
        <div class="story-reader-foot">
          <div class="story-reader-progress" aria-hidden="true">${item.pages.map((_, i) => `<i class="${i < page ? 'is-done' : ''}${i === page ? ' is-current' : ''}"></i>`).join('')}</div>
          <span class="story-reader-count">${String(page + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
          <div class="story-reader-nav">
            <button data-action="story-nav" data-dir="-1" ${hasPrev ? '' : 'disabled'} aria-label="上一节">‹</button>
            ${hasNext
              ? `<button data-action="story-nav" data-dir="1" aria-label="下一节">›</button>`
              : `<button class="story-reader-done" data-action="story-close">合上故事 ✓</button>`}
          </div>
        </div>
        <p class="story-reader-hint">点击正文可直接显示全文 · ← → 翻节 · Esc 合上</p>
      </div>
    </section>
  </div>`;
}

function motifButton(item, index, group) {
  const selected = state.historyGroup === group && state.historyMotif === index;
  return `<button class="motif-menu-item ${selected ? 'is-active' : ''}" data-action="motif-preview" data-group="${group}" data-index="${index}" aria-label="查看${item.name}"><span class="motif-glyph">${item.icon}</span><strong>${item.name}</strong><span class="motif-arrow">›</span></button>`;
}

function groupSection(groupKey) {
  const group = motifGroups[groupKey];
  const open = state.historyGroup === groupKey;
  return `<div class="motif-menu-section ${open ? 'is-open' : ''}">
    <button class="motif-group-title ${open ? 'is-open' : ''}" data-action="motif-group" data-group="${groupKey}" aria-expanded="${open}"><span>${group.icon}</span>${group.title} <b>${open ? '⌃' : '›'}</b></button>
    ${open ? group.items.map((item, index) => motifButton(item, index, groupKey)).join('') : ''}
  </div>`;
}

function stitchItem(item, index) {
  const selected = state.historyStitch === index;
  return `<button class="stitch-item stitch-${index + 1} ${selected ? 'is-selected' : ''}" data-action="stitch-select" data-index="${index}" aria-pressed="${selected}"><span class="stitch-swatch"><img src="${A}${item.thumb}" alt="${item.name}针法缩略图" /></span><span><strong>${item.name}</strong><small>${item.desc}</small></span><b>›</b></button>`;
}

function stitchMotionPath(points) {
  if (!points.length) return 'M 0 0';
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i += 1) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const bend = Math.max(2, Math.min(8, Math.abs(x1 - x0) * .24));
    const sign = y1 >= y0 ? 1 : -1;
    d += ` C ${x0 + bend} ${y0 + sign * bend}, ${x1 - bend} ${y1 - sign * bend}, ${x1} ${y1}`;
  }
  return d;
}

function stitchMotion(item, playing) {
  const visibleKnots = playing ? item.knots.length : 0;
  const start = [8, 76];
  const end = [88, 55];
  const motionPoints = playing ? [start, item.hotspots[0], ...item.knots, item.hotspots[1], end] : [];
  const motionPath = stitchMotionPath(motionPoints);
  const point = end;
  return `<svg class="stitch-motion" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <path class="stitch-action-thread" d="${motionPath}" />
    <g class="stitch-needle-group"><path class="stitch-needle-shaft" d="M-3-5L3 5"/><path class="stitch-needle-eye" d="M-1.4-2.4L1.4 2.4"/><circle class="stitch-needle-tip" cx="3" cy="5" r="1.15"/><animateMotion dur="4.6s" begin="0s" fill="freeze" rotate="auto" path="${motionPath}" /></g>
    <g class="stitch-knot-layer">${item.knots.slice(0, visibleKnots).map(([x, y], i) => `<g transform="translate(${x} ${y})"><g class="stitch-knot" style="--knot-delay:${i * 180}ms"><circle class="stitch-knot-loop" r="3.5"/><circle r="2.2"/><path d="M-2.4-1.2C-.8-3.6 2.2-3.2 2.7-.7C3.2 1.7.1 3.2-2 1.6C-3.2.7-3.1-.2-2.4-1.2Z"/></g></g>`).join('')}</g>
    <circle class="stitch-needle-anchor" cx="${point[0]}" cy="${point[1]}" r="1.9" />
  </svg>`;
}

function stitchBoard(item) {
  const playing = Boolean(state.historyPlaying);
  const complete = !playing && state.historyStep === 3;
  return `<div class="stitch-board ${playing ? 'is-running' : ''}" role="group" aria-label="${item.name}绣制过程动画">
    <div class="stitch-stage ${playing ? 'is-playing' : 'is-idle'} ${complete ? 'is-complete' : ''}">
      <span class="stitch-fabric" aria-hidden="true"></span>
      <img class="stitch-process-image" src="${A}${item.finish}" alt="${item.name}绣制过程" />
      <img class="stitch-finish-image ${complete ? 'is-final' : 'is-idle'}" src="${A}${item.finish}" alt="${item.name}完成后的成品效果" />
      ${playing ? stitchMotion(item, true) : ''}
      <span class="stitch-finish-flash" aria-hidden="true"></span>
    </div>
  </div>`;
}

function colorLab() {
  const motif = colorMotifs[state.historyColorMotif] || colorMotifs[0];
  const picked = colorSelection();
  const applied = appliedColors();
  const rightIndex = state.historyColor >= 0 ? state.historyColor : (picked[picked.length - 1] ?? 0);
  const rightColor = colorChoices[rightIndex] || colorChoices[0];
  const motifImage = motifColorImage(motif, applied);
  const paletteDots = applied.length ? applied.map((index) => {
    const item = colorChoices[index];
    const selected = picked.includes(index);
    return `<span class="palette-chip ${selected ? 'is-picked' : 'is-auto'}"><i style="background:${item.color}"></i>${item.name}${selected ? '' : '<small>补色</small>'}</span>`;
  }).join('') : '<span class="palette-empty">请选择三种颜色，组合成一幅苗绣配色</span>';
  return `<div class="color-lab">
    <article class="color-lab-panel motif-picker-panel">
      <h3>✥　选择纹样</h3>
      <div class="color-motif-tabs">${colorMotifs.map((item, i) => `<button class="color-motif-tab ${i === state.historyColorMotif ? 'is-active' : ''}" data-action="color-motif" data-index="${i}">${item.name}</button>`).join('')}</div>
      <button class="color-motif-art ${applied.length ? 'has-color' : ''}" data-action="color-motif" data-index="${state.historyColorMotif}" aria-label="切换纹样"><img src="${A}${motifImage}" alt="${motif.name}${applied.length ? '三色配色效果' : '线稿'}"/><span>${motif.desc}</span></button>
      <div class="palette-readout"><b>${picked.length ? `已选择 ${picked.length}/3 种颜色` : '未上色线稿'}</b><div>${paletteDots}</div></div>
    </article>
    <article class="color-lab-panel color-picker-panel">
      <h3>✥　点击上色</h3>
      <p class="color-action-hint">连续点击色卡选择三种颜色；再次点击可取消，左侧纹样会同步更新。</p>
      <div class="color-swatch-grid">${colorChoices.map((item, i) => `<button class="color-swatch ${picked.includes(i) ? 'is-active' : ''}" data-action="color-pick" data-index="${i}" style="--swatch:${item.color}" aria-label="选择${item.name}"><span style="background-image:url('${A}${item.swatch}')"></span><b>${item.name}</b><small>${picked.includes(i) ? `第 ${picked.indexOf(i) + 1} 色` : '点击选择'}</small></button>`).join('')}</div>
      <div class="color-selection-tools"><span>已选 ${picked.length}/3</span><button data-action="color-reset">清空选择</button></div>
      <div class="color-example-row">${colorExamples.map(([name, image], i) => `<button class="color-example ${i === state.historyColorExample ? 'is-active' : ''}" data-action="color-example" data-index="${i}"><img src="${A}${image}" alt="${name}"/><span>${name}</span></button>`).join('')}</div>
    </article>
    <article class="color-lab-panel color-meaning-panel">
      <h3>✥　色彩寓意</h3>
      <div class="meaning-art"><img src="${A}${rightColor.image}" alt="${rightColor.name}绣线肌理特写"/></div>
      <div class="meaning-copy"><span class="meaning-dot" style="background:${rightColor.color}"></span><strong>${rightColor.name}</strong><p>${rightColor.meaning}</p></div>
      <img class="meaning-bottom-art" src="${A}${colorExamples[state.historyColorExample][1]}" alt="配色纹样"/>
    </article>
  </div>
  <button class="color-challenge ${state.historyChallenge ? 'is-active' : ''}" data-action="color-challenge"><span>🦋</span> 配色挑战：为纹样选择三种主色 <span>🦋</span>${state.historyChallenge ? '<b> 已开启</b>' : ''}</button>`;
}

export function history() {
  const group = motifGroups[state.historyGroup] || motifGroups.animal;
  const item = group.items[state.historyMotif] || group.items[0];
  const imagePath = `${A}${item.image}`;
  return `<main class="history-page">
    <section class="history-story container">
      <header class="history-heading">
        <div><span class="history-mark">✦</span><div><h1>苗族小故事</h1><p>在绣线之间，听见代代相传的声音</p></div></div>
        <span class="heading-line" aria-hidden="true"></span>
      </header>
      <div class="story-grid">${stories.map(storyCard).join('')}</div>
    </section>

    <section class="history-pattern container">
      <header class="history-heading compact">
        <div><span class="history-mark">✧</span><div><h2>纹样图案</h2><p>一纹一世界，图案里的自然与信仰</p></div></div>
        <span class="heading-line" aria-hidden="true"></span>
      </header>
      <div class="motif-explorer">
        <aside class="motif-menu" aria-label="纹样分类">${groupSection('animal')}${groupSection('plant')}${groupSection('geometry')}</aside>
        <div class="motif-feature">
          <button class="motif-arrow-btn prev" aria-label="上一个纹样">‹</button>
          <div class="motif-art" data-magnifier><img class="motif-base-image" src="${imagePath}" alt="${item.alt}" /><div class="motif-art-shade"></div><div class="motif-art-copy"><h3>${item.name}</h3><p>${item.desc.replace('\n', '<br/>')}</p></div><span class="motif-magnifier" aria-hidden="true"></span></div>
          <button class="motif-arrow-btn next" aria-label="下一个纹样">›</button>
        </div>
      </div>
    </section>

    <section class="history-stitches container">
      <header class="history-heading compact">
        <div><span class="history-mark">✧</span><div><h2>六大针法</h2><p>一针一线，传承千年的匠心</p></div></div>
        <span class="heading-line" aria-hidden="true"></span>
      </header>
      <div class="stitch-explorer">
        ${stitchBoard(stitches[state.historyStitch] || stitches[0])}
        <div class="stitch-list">${stitches.map(stitchItem).join('')}</div>
      </div>
    </section>

    <section class="history-colors container">
      <header class="history-heading compact">
        <div><span class="history-mark">✧</span><div><h2>色彩解析</h2><p>一色一山河，传统色里的民族审美</p></div></div>
        <span class="heading-line" aria-hidden="true"></span>
      </header>
      ${colorLab()}
    </section>

    <section class="history-closing">
      <div class="closing-mountain" aria-hidden="true"></div>
      <div class="closing-copy"><h2>— 走进苗绣，遇见千年的文化之美 —</h2><p>每一针，都是时间的痕迹；每一色，都是民族的记忆。</p>${link('experience', '继续探索苗绣　→', 'closing-button')}</div>
    </section>
  </main>${storyReader()}`;
}
