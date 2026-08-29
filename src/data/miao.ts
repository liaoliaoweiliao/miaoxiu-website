/**
 * 苗绣文化数据
 * 基于真实苗族文化研究整理
 */

export interface PatternInfo {
  id: string;
  name: string;
  nameEn: string;
  category: "图腾" | "自然" | "几何" | "叙事";
  meaning: string;
  story: string;
  region: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  patternKey: string;
}

export const PATTERNS: PatternInfo[] = [
  {
    id: "butterfly-mother",
    name: "蝴蝶妈妈",
    nameEn: "Butterfly Mother",
    category: "图腾",
    meaning: "苗族创世神话中的始祖图腾，象征生命起源与族群繁衍",
    story:
      "相传枫木心生出蝴蝶妈妈，她与水泡相恋生下十二个蛋，孵化出人类始祖姜央及龙、虎、蛇等万物。蝴蝶妈妈纹是苗绣中最神圣的图腾，绣于背扇、盛装衣肩，寄托对生命源起的敬畏与对子孙绵延的祈愿。",
    region: "黔东南·台江、施洞",
    difficulty: 5,
    patternKey: "butterfly",
  },
  {
    id: "dragon",
    name: "龙纹",
    nameEn: "Dragon",
    category: "图腾",
    meaning: "吉祥、力量与水神崇拜，苗族龙纹与汉族龙形制不同",
    story:
      "苗龙无爪、身形灵动，常与鱼、虾、水草共绣，体现苗族对水的崇拜与对自然的亲近。苗绣中的龙纹不威严而亲和，是族群与自然和谐共生的象征，多见于盛装袖片与裙摆。",
    region: "黔东南·雷山、凯里",
    difficulty: 4,
    patternKey: "dragon",
  },
  {
    id: "bird",
    name: "鸟纹",
    nameEn: "Bird",
    category: "图腾",
    meaning: "灵性使者，沟通天地，象征自由与灵魂升华",
    story:
      "苗族认为鸟是祖先灵魂的化身，能传递人间祈愿至天界。绣衣上的鸟纹多为锦鸡、燕子、喜鹊，造型夸张灵动，常与花卉组合，寓意生生不息、灵性相通。",
    region: "黔东南·丹寨、三都",
    difficulty: 3,
    patternKey: "bird",
  },
  {
    id: "flower",
    name: "花卉纹",
    nameEn: "Floral",
    category: "自然",
    meaning: "生命繁衍、四季轮回、美好祝愿",
    story:
      "苗绣花卉不拘泥于写实，多为意象化的八瓣花、牡丹、石榴花，花瓣层层叠叠，色彩浓烈。花卉纹是苗绣中数量最多的纹样，寄托着苗族女性对美好生活的向往与对生命繁盛的礼赞。",
    region: "全苗区通用",
    difficulty: 2,
    patternKey: "flower",
  },
  {
    id: "sun",
    name: "太阳纹",
    nameEn: "Sun",
    category: "自然",
    meaning: "光明、温暖、生命之源",
    story:
      "苗族先民崇拜太阳，认为太阳是万物生长的根本。太阳纹多为圆形中心放射光芒，常与铜鼓纹结合，体现苗族古老的宇宙观与自然崇拜，多绣于盛装背部与儿童帽饰。",
    region: "黔南·惠水、长顺",
    difficulty: 3,
    patternKey: "sun",
  },
  {
    id: "fish",
    name: "鱼纹",
    nameEn: "Fish",
    category: "图腾",
    meaning: "多子多福、年年有余、生命繁衍",
    story:
      "鱼在苗族文化中象征繁衍，因鱼产卵众多。苗绣鱼纹造型圆润饱满，常与龙、鸟组合，构成「龙鱼同源」的意象，多见于婚嫁绣品，寓意子孙满堂、家族兴旺。",
    region: "黔东南·施洞、黄平",
    difficulty: 3,
    patternKey: "fish",
  },
  {
    id: "spiral",
    name: "螺旋纹",
    nameEn: "Spiral",
    category: "几何",
    meaning: "生命循环、宇宙运行、时间流转",
    story:
      "螺旋纹是苗绣中最古老的几何纹样之一，源自苗族对自然规律的观察。它象征生命的循环往复与宇宙的永恒运转，常作为边饰或填充纹样，体现苗族哲学中的循环观。",
    region: "川滇黔交界",
    difficulty: 2,
    patternKey: "spiral",
  },
  {
    id: "geometric",
    name: "回纹边饰",
    nameEn: "Geometric Border",
    category: "几何",
    meaning: "绵延不断、福寿长久",
    story:
      "回纹是苗绣边饰中最常见的几何纹样，由直线折返构成，寓意福泽绵长、生生不息。它常用于绣品边缘，既起装饰作用，也象征族群的延续与文化的传承。",
    region: "全苗区通用",
    difficulty: 1,
    patternKey: "geometric",
  },
];

export interface HistoryEvent {
  year: string;
  title: string;
  description: string;
  type: "起源" | "发展" | "鼎盛" | "传承" | "保护";
}

export const HISTORY_TIMELINE: HistoryEvent[] = [
  {
    year: "新石器时代",
    title: "苗绣起源",
    description:
      "苗族先民在长江中下游地区开始纺织与刺绣，与河姆渡文化、良渚文化的纺织技术一脉相承。考古发现的新石器时代骨针、纺轮，为苗绣的远古源头提供了实物证据。",
    type: "起源",
  },
  {
    year: "先秦时期",
    title: "纹样成型",
    description:
      "苗族在迁徙过程中将自然崇拜、图腾信仰绣于衣饰，形成「穿在身上的史书」。虫、鸟、鱼、花等纹样逐渐定型，成为族群识别与文化记忆的载体。",
    type: "发展",
  },
  {
    year: "唐宋时期",
    title: "技艺成熟",
    description:
      "苗绣技艺体系基本成熟，平绣、锁绣、破线绣、辫绣等十余种针法齐备。文献记载「蛮妇织绣，五彩斑斓」，苗绣成为西南地区重要的手工艺代表。",
    type: "鼎盛",
  },
  {
    year: "明清时期",
    title: "支系分化",
    description:
      "苗族因迁徙形成众多支系，各支系苗绣风格各异：施洞破线绣精细华美、雷山锁绣古朴厚重、丹寨蜡染绣清新雅致，构成丰富的苗绣文化谱系。",
    type: "发展",
  },
  {
    year: "2006年",
    title: "列入国家级非遗",
    description:
      "苗绣被国务院列入第一批国家级非物质文化遗产名录，标志着苗绣保护进入国家层面。此后，各级传承人认定、传习所建设、生产性保护等措施陆续展开。",
    type: "保护",
  },
  {
    year: "当代",
    title: "数字创新",
    description:
      "苗绣进入数字化保护与创新表达新阶段：纹样数据库建设、AI辅助设计、虚拟博物馆、跨界文创等，让千年苗绣在数字时代焕发新生，走向世界舞台。",
    type: "传承",
  },
];

export interface BranchInfo {
  name: string;
  region: string;
  feature: string;
  technique: string;
  x: number; // 地图坐标百分比
  y: number;
}

export const MIAO_BRANCHES: BranchInfo[] = [
  {
    name: "施洞型",
    region: "贵州·台江施洞",
    feature: "破线绣，色彩浓烈，纹样繁复华美",
    technique: "破线绣、锁绣",
    x: 52,
    y: 58,
  },
  {
    name: "雷山型",
    region: "贵州·雷山",
    feature: "锁绣为主，古朴厚重，银饰与绣并重",
    technique: "锁绣、平绣",
    x: 48,
    y: 62,
  },
  {
    name: "丹寨型",
    region: "贵州·丹寨",
    feature: "蜡染与刺绣结合，清新雅致",
    technique: "蜡染绣、平绣",
    x: 50,
    y: 66,
  },
  {
    name: "花溪型",
    region: "贵州·贵阳花溪",
    feature: "挑花为主，几何纹样，色彩明快",
    technique: "挑花、十字绣",
    x: 46,
    y: 56,
  },
  {
    name: "湘西型",
    region: "湖南·凤凰、花垣",
    feature: "土布刺绣，纹样古朴，色调沉稳",
    technique: "平绣、打籽绣",
    x: 62,
    y: 50,
  },
  {
    name: "文山型",
    region: "云南·文山",
    feature: "受壮绣影响，色彩鲜艳，纹样灵动",
    technique: "平绣、贴布绣",
    x: 38,
    y: 68,
  },
];

export interface TechniqueInfo {
  name: string;
  nameEn: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  steps: string[];
  feature: string;
}

export const TECHNIQUES: TechniqueInfo[] = [
  {
    name: "平绣",
    nameEn: "Flat Embroidery",
    difficulty: 2,
    description:
      "最基础的苗绣针法，以平针铺底，针脚整齐排列。适合大面积填色，是初学者入门首选，也是复杂纹样的底层技法。",
    steps: [
      "将绣布绷于绣绷，保持平整紧致",
      "依纹样轮廓，由内向外平行运针",
      "针脚间距均匀，约1-2毫米",
      "层层叠加，形成饱满色块",
    ],
    feature: "针脚平整、色彩均匀、适合入门",
  },
  {
    name: "破线绣",
    nameEn: "Split-Thread Embroidery",
    difficulty: 5,
    description:
      "施洞苗绣绝技，将一根丝线破成数十根细如发丝的子线，再分别绣制。绣品在阳光下熠熠生辉，是苗绣中最精细的针法。",
    steps: [
      "选取优质蚕丝线，用指甲或特制工具破分",
      "将一根线破为8-16根细丝",
      "以极细针脚逐针绣制",
      "绣品呈现独特的丝光质感",
    ],
    feature: "丝光闪烁、极致精细、施洞绝技",
  },
  {
    name: "锁绣",
    nameEn: "Chain Stitch",
    difficulty: 3,
    description:
      "雷山苗绣代表针法，针针相扣形成链状线条。线条流畅圆润，适合勾勒轮廓与填充，是苗绣中最古老的针法之一。",
    steps: [
      "起针后，针从线圈内穿出",
      "拉紧线圈形成链节",
      "逐节相扣，形成连续线条",
      "可粗可细，灵活多变",
    ],
    feature: "线条圆润、链节相扣、古朴典雅",
  },
  {
    name: "辫绣",
    nameEn: "Braid Embroidery",
    difficulty: 4,
    description:
      "先将丝线编成三股辫，再盘钉于绣布形成纹样。立体感强，富有浮雕效果，是苗绣中最具装饰性的针法。",
    steps: [
      "用三股丝线编成细辫",
      "依纹样盘绕辫子",
      "用同色线将辫子钉缝于布面",
      "形成立体浮雕效果",
    ],
    feature: "立体浮雕、装饰性强、独具匠心",
  },
  {
    name: "打籽绣",
    nameEn: "Seed Stitch",
    difficulty: 3,
    description:
      "每针在布面绕线形成小结，密集排列如籽粒。质感独特，适合表现花蕊、鱼眼等细节，增加绣品层次。",
    steps: [
      "针穿出布面后，在针上绕线2-3圈",
      "紧贴出针点刺入布面",
      "形成立体小结",
      "密集排列形成籽粒效果",
    ],
    feature: "籽粒质感、立体突出、细节生动",
  },
  {
    name: "挑花",
    nameEn: "Cross Stitch",
    difficulty: 2,
    description:
      "依布纹经纬十字交叉绣制，几何纹样为主。花溪苗绣代表，无需绣绷，可随身绣制，是苗绣中最普及的针法。",
    steps: [
      "数布纹经纬线确定针位",
      "依十字交叉运针",
      "无需绣绷，徒手绣制",
      "形成规整几何图案",
    ],
    feature: "几何规整、徒手绣制、普及广泛",
  },
];

export interface InheritorInfo {
  name: string;
  title: string;
  level: string;
  region: string;
  specialty: string;
  story: string;
  years: number;
}

export const INHERITORS: InheritorInfo[] = [
  {
    name: "吴通英",
    title: "国家级非遗代表性传承人",
    level: "国家级",
    region: "贵州·台江",
    specialty: "施洞破线绣",
    story:
      "吴通英自幼随母学绣，12岁掌握破线绣绝技，能将一根丝线破为16根细丝。她绣制的《苗族古歌》长卷，以针为笔、以线为墨，将苗族千年史诗绣于布上，被誉为「穿在身上的史诗」。她创办传习所，培养弟子逾百人，让破线绣绝技薪火相传。",
    years: 50,
  },
  {
    name: "龙女三九",
    title: "国家级非遗代表性传承人",
    level: "国家级",
    region: "贵州·雷山",
    specialty: "雷山锁绣",
    story:
      "龙女三九是雷山苗绣的标志性人物，擅长古朴厚重的锁绣技法。她绣制的盛装衣肩，纹样繁复而层次分明，银饰与绣艺交相辉映。她致力于苗绣纹样的整理与记录，整理纹样逾千种，为苗绣文化留下珍贵档案。",
    years: 45,
  },
  {
    name: "王阿勇",
    title: "省级非遗代表性传承人",
    level: "省级",
    region: "贵州·丹寨",
    specialty: "蜡染刺绣",
    story:
      "王阿勇将蜡染与刺绣结合，开创独具特色的「蜡染绣」风格。她曾受邀赴多国展演，让苗绣走向世界。她创办合作社，带动百余名绣娘脱贫致富，用一针一线绣出乡村振兴的新图景。",
    years: 35,
  },
];

export interface CreationInfo {
  name: string;
  category: string;
  description: string;
  designer: string;
  innovation: string;
}

export const CREATIONS: CreationInfo[] = [
  {
    name: "苗绣数字纹样库",
    category: "数字资产",
    description:
      "将传统苗绣纹样矢量化、参数化，构建可检索、可生成的纹样数据库，为设计师与研究者提供数字资源。",
    designer: "苗绣·生生不息项目组",
    innovation: "AI辅助纹样识别与生成",
  },
  {
    name: "苗绣跨界时装系列",
    category: "时尚设计",
    description:
      "将苗绣纹样与现代时装结合，保留手工刺绣的温度，融入当代剪裁与面料，让苗绣走上国际时装周。",
    designer: "新锐设计师 × 苗绣传承人",
    innovation: "传统纹样当代解构",
  },
  {
    name: "苗绣AR互动绘本",
    category: "数字出版",
    description:
      "以AR技术呈现苗绣纹样的故事与寓意，扫描绣品即可观看纹样动画与文化解读，让儿童与青少年亲近非遗。",
    designer: "数字媒体团队",
    innovation: "AR增强现实体验",
  },
  {
    name: "苗绣智能家居系列",
    category: "文创产品",
    description:
      "将苗绣纹样应用于抱枕、屏风、灯具等家居用品，结合智能感应，让传统纹样融入现代生活场景。",
    designer: "工业设计团队",
    innovation: "非遗+智能家居",
  },
];
