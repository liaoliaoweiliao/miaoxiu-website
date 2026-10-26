// History content follows the user's 22.43.zip, including its embedded storybooks.
export const stories = [
  {
    title: '一针一线的传承',
    image: 'history/story-stitch.webp',
    book: 'history/storybooks/stitch-book.webp',
    label: '阅读故事',
    description: '在苗寨的晨雾里，绣娘把关于山川与家族的记忆，藏进一段段细密的针脚。',
    pages: [
      '在薄雾缭绕的苗寨木楼里，白发苍苍的老绣娘握着小女孩的小手，穿针引线，耐心传授苗绣技法。五彩丝线在麻布上穿梭，山地轮廓、花鸟纹样、家族里代代讲述的旧事，全都藏进细密交错的针脚之中。',
      '苗绣没有书本教程，全靠口传手教。老一辈绣娘把祖辈留下来的纹样、配色与刺绣诀窍，一点点传给年轻一代。一根根丝线连接起过去与现在，让苗家的民族记忆随针线代代延续，守护这份珍贵的非遗传承。'
    ]
  },
  {
    title: '兰娟记事',
    image: 'history/story-lanjuan.webp',
    book: 'history/storybooks/lanjuan-book.webp',
    label: '阅读故事',
    description: '一位苗族少女兰娟，用一针一线记录家乡的山水与传说，绣出了自己的成长故事。',
    pages: [
      '古时，苗族少女兰娟跟随族人踏上漫长艰难的南迁路途。苗族古时没有文字，无法写下一路上的见闻。兰娟便想出以绣记事的办法，手握彩线，将渡过的江河、翻越的群山、故土的传说，',
      '还有自己一路上的成长感悟，一针一线绣在衣袍上。衣衫上斑斓的图案，记录着族群跋涉迁徙的漫漫征程。这一件绣衣，就是一本穿在身上的史书，把整个民族的远行故事永久留存。'
    ]
  },
  {
    title: '蝴蝶妈妈',
    image: 'history/story-butterfly.webp',
    book: 'history/storybooks/butterfly-book.webp',
    label: '阅读故事',
    description: '相传蝴蝶妈妈用五彩的丝线，绣出了苗族先民对美好生活的向往。',
    pages: [
      '源自苗族古歌传说：枫树孕育出蝴蝶妈妈，她诞下十二枚神蛋，孵化出人类始祖与世间万物。蝴蝶妈妈作为苗族的生命始祖，被先民深深崇敬。苗家人拿起五彩丝线，将蝴蝶的形象绣在服饰上。',
      '灵动绚烂的蝴蝶纹样，寄托着苗族先民对生命起源的敬畏，饱含对平安、繁盛与美好生活的热切向往，也是苗绣里最经典、最具代表性的图腾。'
    ]
  }
];

export const motifGroups = {
  animal: {
    title: '动物纹样', icon: '✿',
    items: [
      { name: '蝴蝶纹', icon: '🦋', image: 'history/motifs/motif-butterfly.webp', alt: '蝴蝶纹苗绣图案', desc: '象征生命、祖先与美好，\n是苗族最具代表性的纹样。' },
      { name: '鸟纹', icon: '◈', image: 'history/motifs/motif-bird.webp', alt: '鸟纹苗绣图案', desc: '记录飞翔与迁徙的愿望，\n寄托自由、祝福与远方。' },
      { name: '龙纹', icon: '✦', image: 'history/motifs/motif-dragon-user.png', alt: '龙纹苗绣图案', desc: '融合山川与神话想象，\n守护家园，也守护团聚。' },
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

export const stitches = [
  { name: '平绣', desc: '线面平整，色彩明快', thumb: 'history/stitches/01-pingxiu.webp', finish: 'history/stitch-results/01-pingxiu.webp', hotspots: [[15.28,40.56],[78.52,34.89],[68.06,72.22]], knots: [[34,46],[42,50],[51,45],[61,51],[42,63],[53,68],[65,63],[73,56]] },
  { name: '破线绣', desc: '一丝分成数缕，细密如发', thumb: 'history/stitches/03-poxianxiu.webp', finish: 'history/stitch-results/03-poxianxiu.webp', hotspots: [[15.74,58.33],[48.61,37.22],[75.46,33.33]], knots: [[27,54],[35,49],[43,45],[51,42],[59,40],[67,38],[74,36],[35,61],[45,58],[55,55],[65,52]] },
  { name: '锁绣', desc: '线迹相扣，轮廓利落', thumb: 'history/stitches/04-suoxiu.webp', finish: 'history/stitch-results/04-suoxiu.webp', hotspots: [[13.33,43.56],[51.85,41.67],[85.46,51.78]], knots: [[27,49],[35,45],[43,43],[51,43],[59,45],[67,48],[75,51],[83,53]] },
  { name: '缠绣', desc: '丝线缠绕，肌理丰润', thumb: 'history/stitches/06-chanxiu.webp', finish: 'history/stitch-results/06-chanxiu.webp', hotspots: [[14.07,49.22],[48.15,41.11],[80.83,59.11]], knots: [[27,53],[35,48],[43,44],[51,44],[59,48],[67,53],[75,58],[83,62]] },
  { name: '辫绣', desc: '编结成辫，纹理立体', thumb: 'history/stitches/05-bianxiu.webp', finish: 'history/stitch-results/05-bianxiu.webp', hotspots: [[18.33,68.89],[48.80,41.11],[80.00,69.00]], knots: [[25,63],[33,57],[41,51],[49,46],[57,51],[65,58],[73,64],[81,68]] },
  { name: '打籽绣', desc: '绣粒如珠，层次分明', thumb: 'history/stitches/02-dazixiu.webp', finish: 'history/stitch-results/02-dazixiu.webp', hotspots: [[33.52,35.89],[64.54,42.78],[63.89,71.33]], knots: [[38,44],[45,47],[53,46],[61,51],[43,58],[51,61],[59,60],[67,56],[47,70],[57,70]] }
];
export const colorChoices = [
  { name: '藏青', color: '#123b66', swatch: 'history/color-swatches/01-navy-swatch-no-text.webp', image: 'history/color-thread-closeups/01-navy-thread-closeup.png', meaning: '藏青色调深沉，让人联想到连绵山岭和静谧夜色，传递沉稳、坚韧的感受。作为主色时，可以托住画面的大块结构，衬出朱砂红与暖金的明亮；用于花鸟或几何纹的边缘时，也能加强轮廓，让细密针脚更清晰。' },
  { name: '朱砂红', color: '#bd3d2f', swatch: 'history/color-swatches/02-vermilion-swatch-no-text.webp', image: 'history/color-thread-closeups/02-vermilion-thread-closeup.png', meaning: '朱砂红带来热烈、喜庆的视觉感受，像火光与盛放的花朵，为纹样增添生机和祝福的意味。用在花瓣、蝶翼或几何纹的重点处，可与藏青形成鲜明对比；搭配米白时，针脚轮廓更清楚，少量暖金则能让画面更温暖。' },
  { name: '暖金', color: '#d6a252', swatch: 'history/color-swatches/03-warm-gold-swatch-no-text.webp', image: 'history/color-thread-closeups/03-warm-gold-thread-closeup.png', meaning: '暖金接近阳光与成熟谷物的颜色，温暖明亮，可寄托丰收、祝福和对美好生活的期待。少量用于花心、纹样边线或重复的小点，能提亮深色区域，突出细节；与朱砂红相配更显热烈，与藏青相配则能形成清楚而稳重的层次。' },
  { name: '靛蓝', color: '#416da3', swatch: 'history/color-swatches/indigo-swatch-user.png', image: 'history/color-thread-closeups/04-indigo-thread-closeup.png', meaning: '靛蓝比藏青明亮，带有河流、天空般清雅开阔的感觉，也让人联想到远行与流动的记忆。用于较大的纹样区域时，画面显得舒展、安静；与米白搭配可突出线条的清爽，与翠绿衔接更柔和，加入少量暖金则能形成醒目的点缀。' },
  { name: '米白', color: '#eee6d5', swatch: 'history/color-swatches/ivory-swatch-user.png', image: 'history/color-thread-closeups/05-ivory-thread-closeup.png', meaning: '米白带有柔和的暖意，给人质朴、纯净、亲近织物本身的感受。它既能在深色纹样之间留出明亮的呼吸空间，也能衬托彩线的方向与针脚的细密变化；配藏青、靛蓝时层次清楚，配朱砂红、暖金时则能缓和色彩之间的强烈对比。' },
  { name: '翠绿', color: '#3c8068', swatch: 'history/color-swatches/jade-swatch-user.png', image: 'history/color-thread-closeups/06-jade-thread-closeup.png', meaning: '翠绿让人想到新叶、山林与春天，传递生长、繁盛和新生的感受。用于枝叶、花鸟纹样的连接部分，能把分散的色块连成整体；与朱砂红相配，可形成花与叶般鲜明的对照，与靛蓝相配更显清润，加入暖金则能让局部细节更明亮。' }
];
export const colorMotifs = [
  { name: '蝴蝶纹', key: 'butterfly', line: 'history/color-motifs/butterfly-line.webp', desc: '生命、自由与繁衍的象征' },
  { name: '花卉纹', key: 'flower', line: 'history/color-motifs/flower-line.webp', desc: '自然、丰收与吉祥的祝愿' },
  { name: '鸟纹', key: 'bird', line: 'history/color-motifs/bird-line.webp', desc: '迁徙、远方与自由的记忆' }
];
