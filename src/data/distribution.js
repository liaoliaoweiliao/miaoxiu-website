import { COUNTY_CENTERS } from './atlasGeography.js';

export const DISTRIBUTION_SOURCES = [
  { id: 'museum', title: '中国民族博物馆 · 苗疆华彩', url: 'https://www.cnmuseum.com/cn/report/1803/0531-1.htm', note: '湘西、黔东南、川黔滇的地域支系导览框架。' },
  { id: 'overview', title: '国家民委 · 苗族概况', url: 'https://www.neac.gov.cn/seac/ztzl/mz/gk.shtml', note: '方言区及代表分布地区；本页以地域组织导览，不划定支系边界。' },
  { id: 'dress', title: '国家民委 · 苗族风俗文化', url: 'https://www.neac.gov.cn/seac/ztzl/mz/fswh.shtml', note: '服饰形制及刺绣、挑花、蜡染等工艺介绍。' },
  { id: 'guizhou', title: '玉屏网 · 贵州山地文化', url: 'https://www.yp.gov.cn/contents/2023/06/12/receive-d623afd0-090a-11ee-b32f-f73003bbafb2.html', note: '六枝、威宁、赫章的苗族服饰地域资料；来源为地道风物。' },
  { id: 'junlian', title: '四川统一战线 · 筠连苗绣', url: 'https://www.sctyzx.gov.cn/yb/202504/54314276.html', note: '筠连苗绣传承与省级非遗资料，不计入本页七条国家级档案。' },
  { id: 'malipo', title: '外交部 · 麻栗坡县旅游推荐', url: 'https://wjfp.mfa.gov.cn/jksl/202208/t20220817_10744874.htm', note: '当地苗族支系与川黔滇方言资料。' },
  { id: 'geography', title: '阿里云 DataV · 地理数据', url: 'https://datav.aliyun.com/portal/school/atlas/area_selector', note: '省级轮廓与县级中心坐标，仅作地区定位。' },
];

export const BRANCHES = [
  { id: 'east', name: '湘西', full: '湘西地域支系', subtitle: '武陵山间 · 绣花入衣', color: '#e6b96b', motif: 'flower',
    description: '从湘西走向黔东北、渝东南。衣袖、衣领与围腰上的花饰，是认识这一地区苗族服饰的一扇窗。',
    tags: ['绣花围腰', '青蓝衣色', '衣缘花饰'], source: 'dress' },
  { id: 'central', name: '黔东南', full: '黔东南地域支系', subtitle: '苗岭深处 · 绣与银相映', color: '#e1856e', motif: 'butterfly',
    description: '从黔东南延伸到桂北、湘西南的代表地区。百褶裙、刺绣与织锦，展现出村寨之间丰富的服饰变化。',
    tags: ['百褶裙', '刺绣织锦', '银饰相映'], source: 'dress' },
  { id: 'west', name: '川黔滇', full: '川黔滇地域支系', subtitle: '高原相连 · 经纬成花', color: '#79bcb1', motif: 'diamond',
    description: '沿川南、黔西与云南寻找苗乡。挑花、刺绣与蜡染并见，服饰形制随地方变化，各有自己的细节。',
    tags: ['挑花', '刺绣', '蜡染'], source: 'dress' },
];

// Curated county-level reference locations, not a population census or an exhaustive
// branch taxonomy. A region may contain several dialects and clothing traditions.
// Each county counts once; equal-weight kernels show the density of this sample only.
const locations = [
  ['huayuan', '花垣', '湖南', '湘西', 'east', 433124, 'overview', '湘西苗乡的一处导览地点，可继续阅读花垣的国家级苗绣档案。', 'xiangxi'],
  ['fenghuang', '凤凰', '湖南', '湘西', 'east', 433123, 'overview', '与花垣、松桃相邻，从武陵山区的地域联系认识当地苗族文化。'],
  ['songtao', '松桃', '贵州', '铜仁', 'east', 520628, 'overview', '黔东北的苗乡。这里同时收录了松桃苗绣的国家级项目档案。', 'songtao'],
  ['xiushan', '秀山', '重庆', '渝东南', 'east', 500241, 'overview', '国家民委资料列举的湘西方言通行地区之一，位于渝东南。'],
  ['youyang', '酉阳', '重庆', '渝东南', 'east', 500242, 'overview', '武陵山区的一处代表地点，位于湘、黔、渝相邻的文化地带。'],
  ['pengshui', '彭水', '重庆', '渝东南', 'east', 500243, 'overview', '国家民委资料列举的湘西方言通行地区之一，可从这里认识渝东南苗乡。'],
  ['leishan', '雷山', '贵州', '黔东南', 'central', 522634, 'overview', '雷山服饰形制多样，长裙、中裙、短裙等各有风格。先细看一件节庆上衣的针线。', 'leishan'],
  ['kaili', '凯里', '贵州', '黔东南', 'central', 522601, 'overview', '凯里苗族堆花绣以绫缎片折叠堆成花饰，是本页非遗档案中的一项地方技艺。', 'kaili'],
  ['jianhe', '剑河', '贵州', '黔东南', 'central', 522629, 'overview', '剑河苗族锡绣有鲜明的材料与工艺特色；配图是当地女装参考，不作为锡绣局部图。', 'jianhe'],
  ['taijiang', '台江', '贵州', '黔东南', 'central', 522630, 'overview', '从台江走近施洞型服饰，观察绣花与银饰在整套衣装中的搭配。', 'taijiang'],
  ['danzhai', '丹寨', '贵州', '黔东南', 'central', 522636, 'overview', '黔东南苗族聚居地区的一处导览地点，服饰与技艺仍需按具体村寨分别认识。'],
  ['rongshui', '融水', '广西', '柳州', 'central', 450225, 'overview', '国家民委列举的黔东方言通行地区之一，展示苗族文化在桂北的地域延伸。'],
  ['sanjiang', '三江', '广西', '柳州', 'central', 450226, 'overview', '桂北的一处导览地点，当地多个民族共同生活，不能以县界理解支系边界。'],
  ['jingzhou', '靖州', '湖南', '怀化', 'central', 431229, 'overview', '国家民委列举的黔东方言通行地区之一，位于湘西南。'],
  ['huaxi', '花溪', '贵州', '贵阳', 'west', 520111, 'dress', '花溪苗绣以挑花见长；在国家级项目档案中，能进一步了解当地绣艺。', 'huaxi'],
  ['liuzhi', '六枝', '贵州', '六盘水', 'west', 520203, 'guizhou', '贵州西部的一处服饰导览地点，资料介绍了当地纹绣衣装的地域特点。'],
  ['weining', '威宁', '贵州', '毕节', 'west', 520526, 'guizhou', '从黔西北的高原苗乡，认识几何花纹与披毡等服饰线索。'],
  ['hezhang', '赫章', '贵州', '毕节', 'west', 520527, 'guizhou', '与威宁相邻的一处高原地点，资料介绍了当地苗族披毡的服饰特色。'],
  ['junlian', '筠连', '四川', '宜宾', 'west', 511527, 'junlian', '川南苗绣的传承地点。当地苗绣有省级非遗资料，另与本页国家级名录区分。'],
  ['malipo', '麻栗坡', '云南', '文山', 'west', 532624, 'malipo', '外交部县情资料介绍了当地白苗、花苗、黑苗、青苗等称谓及川黔滇方言。'],
];

export const DISTRIBUTION_POINTS = locations.map(([id, name, province, zone, branch, code, source, description, archive]) => ({
  id, name, province, zone, branch, code, source, description, archive,
  fullName: COUNTY_CENTERS[code].name, coordinates: COUNTY_CENTERS[code].center,
}));

export const INITIAL_DISTRIBUTION = { branch: 'all', province: 'all', selected: 'leishan', visited: [], heat: true, metric: null, run: 0 };

export const PROVINCE_LABELS = [
  ['四川', 103.9, 29.85], ['重庆', 108.4, 29.95], ['贵州', 106.6, 27.6],
  ['湖南', 111.5, 27.5], ['广西', 108.1, 23.75], ['云南', 102.85, 24.4],
];
