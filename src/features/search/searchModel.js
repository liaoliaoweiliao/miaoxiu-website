import { searchIndex } from '../../data/search.js';

export const normalizeSearch = (text) => String(text ?? '').normalize('NFKC').toLowerCase().replace(/[\p{P}\p{Z}\s]/gu, '');

export function searchContent(query, limit = 6) {
  const needle = normalizeSearch(query);
  if (!needle) return { items: [], total: 0 };
  const tokens = String(query).trim().split(/\s+/u).map(normalizeSearch).filter(Boolean);
  const matches = searchIndex.map((item) => {
    const title = normalizeSearch(item.title);
    const keywords = item.keywords.map(normalizeSearch);
    const text = title + keywords.join('') + normalizeSearch(item.label);
    const score = title === needle ? 1000
      : title.startsWith(needle) ? 800
      : title.includes(needle) ? 700
      : keywords.includes(needle) ? 600
      : text.includes(needle) || tokens.every((token) => text.includes(token)) ? 100 : 0;
    return { item, score };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score);
  return { items: matches.slice(0, limit).map(({ item }) => item), total: matches.length };
}
