import { DISTRIBUTION_SOURCES } from './distribution.js';
import { assetUrl } from '../utils/assets.js';

export const materialSources=[
  {
    title: '靛染织物与花鸟蝴蝶底纹',
    url: assetUrl('common/indigo-embroidery.webp'),
    linkLabel: '查看背景纹样',
    platform: '本站背景装饰 · AI 生成',
    credits: [],
    group: 'images',
    usage: '五页公共背景的低对比边角暗纹；苗绣灵感创作，不作为馆藏复刻或传统纹样考据依据',
  },
  {
    "title": "苗绣龙纹",
    "url": "https://epe.lac-bac.gc.ca/100/201/300/asian_social_science/2021/ASS-V17N12-All.pdf",
    "platform": "Asian Social Science · 2021年第17卷第12期",
    "credits": [],
    "group": "images",
    "usage": "纹样科普",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "rows": [
      "A2"
    ]
  },
  {
    "title": "GuizhouOct06canon 662",
    "url": "https://www.flickr.com/photos/gillpenney/2762913178/",
    "platform": "Flickr",
    "credits": [
      "Tianjin24"
    ],
    "group": "images",
    "usage": "作品展览",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
    "rows": [
      "A3"
    ]
  },
  {
    "title": "雷山苗族节庆女上衣（20世纪）",
    "url": "https://commons.wikimedia.org/wiki/File:Woman%27s_festive_jacket,_Miao_people,_Leishan_county,_Guizhou_province,_China,_20th_century,_cotton,_silk,_metal_foil,_metal_sequin_-_Textile_Museum_of_Canada_-_DSC00839.JPG",
    "platform": "Wikimedia Commons · 加拿大纺织博物馆展品照片",
    "credits": ["Daderot"],
    "group": "images",
    "usage": "首页苗绣地图 · 雷山参考图",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "rows": ["首页地图"]
  },
  {
    "title": "剑河苗族女装（柳州博物馆展品）",
    "url": "https://commons.wikimedia.org/wiki/File:20260215_Jianhe_Miao_female_clothing_in_the_Liuzhou_Museum.jpg",
    "platform": "Wikimedia Commons · 2026 Wiki Loves Folklore",
    "credits": ["Yumeto"],
    "group": "images",
    "usage": "首页苗绣地图 · 剑河参考图；网页展示版缩小",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "rows": ["首页地图"]
  },
  {
    "title": "施洞型苗族女装（20世纪中期）",
    "url": "https://commons.wikimedia.org/wiki/File:Woman%27s_ensemble_of_the_Miao_people_(Yangtze_River),_Shidong_style,_mid-20th_century.jpg",
    "platform": "Wikimedia Commons · 服饰照片",
    "credits": ["Wmpearl"],
    "group": "images",
    "usage": "首页苗绣地图 · 台江参考图",
    "license": "Public domain",
    "licenseUrl": "https://commons.wikimedia.org/wiki/Template:PD-self",
    "rows": ["首页地图"]
  },
  ...DISTRIBUTION_SOURCES.map((source) => ({
    title: source.title, url: source.url, platform: '首页地域导览参考',
    credits: [], group: 'research', usage: source.note,
  }))
];
