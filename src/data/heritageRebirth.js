import { motifs } from './site.js';

// Original procedural embroidery: these palettes describe the digital artwork,
// rather than the historical colours or construction of a particular garment.
export const rebirthPalettes = [
  { id: 'heritage', name: '五色原绣', colours: ['#ba2947', '#30477f', '#d2ad69', '#d5deec', '#8158b0'], rgb: [1, 1, 1] },
  { id: 'garnet', name: '朱金流彩', colours: ['#cb3545', '#34436c', '#e8b35e', '#cbd0dd', '#794990'], rgb: [1.35, .82, .65] },
  { id: 'moon', name: '银紫月华', colours: ['#a94468', '#354c8c', '#bfaa7d', '#e1e6f0', '#a583cb'], rgb: [.85, .95, 1.4] },
];

// Names come from the site's cultural guide; the shader creates new combinations.
export const rebirthMotifs = [0, 1, 4].map((index) => motifs[index].name);
export const initialRebirthPattern = { primary: 0, secondary: 1, columns: 7, seed: 0 };
export const rebirthDensities = [
  { count: 200000, name: '流畅 · 20万' },
  { count: 400000, name: '细腻 · 40万' },
  { count: 1000000, name: '极致 · 100万' },
];

export function createRebirthPattern(previous = initialRebirthPattern, random = Math.random) {
  const pick = (count) => Math.min(count - 1, Math.floor(Math.max(0, random()) * count));
  const secondary = previous.secondary === 1 ? 2 : 1;
  return { primary: 0, secondary, columns: 5 + pick(5), seed: previous.seed + 1 + random() * 8 };
}
