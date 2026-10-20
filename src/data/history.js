// Content and asset references preserved from upstream 82f079f.
export const stories = [
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

export const motifGroups = {
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

export const stitches = [
  { name: '平绣', desc: '线面平整，色彩明快', thumb: 'history/stitches/01-pingxiu.webp', finish: 'history/stitch-results/01-pingxiu.webp', hotspots: [[15.28,40.56],[78.52,34.89],[68.06,72.22]], knots: [[34,46],[42,50],[51,45],[61,51],[42,63],[53,68],[65,63],[73,56]] },
  { name: '破线绣', desc: '一丝分成数缕，细密如发', thumb: 'history/stitches/03-poxianxiu.webp', finish: 'history/stitch-results/03-poxianxiu.webp', hotspots: [[15.74,58.33],[48.61,37.22],[75.46,33.33]], knots: [[27,54],[35,49],[43,45],[51,42],[59,40],[67,38],[74,36],[35,61],[45,58],[55,55],[65,52]] },
  { name: '锁绣', desc: '线迹相扣，轮廓利落', thumb: 'history/stitches/04-suoxiu.webp', finish: 'history/stitch-results/04-suoxiu.webp', hotspots: [[13.33,43.56],[51.85,41.67],[85.46,51.78]], knots: [[27,49],[35,45],[43,43],[51,43],[59,45],[67,48],[75,51],[83,53]] },
  { name: '缠绣', desc: '丝线缠绕，肌理丰润', thumb: 'history/stitches/06-chanxiu.webp', finish: 'history/stitch-results/06-chanxiu.webp', hotspots: [[14.07,49.22],[48.15,41.11],[80.83,59.11]], knots: [[27,53],[35,48],[43,44],[51,44],[59,48],[67,53],[75,58],[83,62]] },
  { name: '辫绣', desc: '编结成辫，纹理立体', thumb: 'history/stitches/05-bianxiu.webp', finish: 'history/stitch-results/05-bianxiu.webp', hotspots: [[18.33,68.89],[48.80,41.11],[80.00,69.00]], knots: [[25,63],[33,57],[41,51],[49,46],[57,51],[65,58],[73,64],[81,68]] },
  { name: '打籽绣', desc: '绣粒如珠，层次分明', thumb: 'history/stitches/02-dazixiu.webp', finish: 'history/stitch-results/02-dazixiu.webp', hotspots: [[33.52,35.89],[64.54,42.78],[63.89,71.33]], knots: [[38,44],[45,47],[53,46],[61,51],[43,58],[51,61],[59,60],[67,56],[47,70],[57,70]] }
];
export const colorChoices = [
  { name: '藏青', color: '#123b66', swatch: 'history/color-swatches/01-navy-swatch-no-text.webp', image: 'history/color-thread-closeups/01-navy-thread-closeup.png', meaning: '沉静深远，象征山川、夜色与坚韧。' },
  { name: '朱砂红', color: '#bd3d2f', swatch: 'history/color-swatches/02-vermilion-swatch-no-text.webp', image: 'history/color-thread-closeups/02-vermilion-thread-closeup.png', meaning: '热烈喜庆，常用于节庆服饰与重要纹样。' },
  { name: '暖金', color: '#d6a252', swatch: 'history/color-swatches/03-warm-gold-swatch-no-text.webp', image: 'history/color-thread-closeups/03-warm-gold-thread-closeup.png', meaning: '温暖明亮，寓意丰收、祝福与希望。' },
  { name: '靛蓝', color: '#416da3', swatch: 'history/color-swatches/04-indigo-swatch-no-text.webp', image: 'history/color-thread-closeups/04-indigo-thread-closeup.png', meaning: '清雅沉稳，连接河流、天空与远行。' },
  { name: '米白', color: '#eee6d5', swatch: 'history/color-swatches/05-ivory-swatch-no-text.webp', image: 'history/color-thread-closeups/05-ivory-thread-closeup.png', meaning: '质朴纯净，衬托彩线与细密针脚。' },
  { name: '翠绿', color: '#3c8068', swatch: 'history/color-swatches/06-jade-swatch-no-text.webp', image: 'history/color-thread-closeups/06-jade-thread-closeup.png', meaning: '生机盎然，象征植物、春天与新生。' }
];
export const colorMotifs = [
  { name: '蝴蝶纹', key: 'butterfly', line: 'history/color-motifs/butterfly-line.webp', desc: '生命、自由与繁衍的象征' },
  { name: '花卉纹', key: 'flower', line: 'history/color-motifs/flower-line.webp', desc: '自然、丰收与吉祥的祝愿' },
  { name: '鸟纹', key: 'bird', line: 'history/color-motifs/bird-line.webp', desc: '迁徙、远方与自由的记忆' }
];
export const colorExamples = [
  ['传统纹样', 'history/color-examples/07-traditional-festival-image-no-text.webp'],
  ['山野清雅', 'history/color-examples/08-mountain-elegant-image-no-text.webp'],
  ['现代苗风', 'history/color-examples/09-modern-miao-image-no-text.webp']
];
export const defaultColorSet = [0, 2, 4];
