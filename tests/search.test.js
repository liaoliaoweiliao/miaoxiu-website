import test from 'node:test';
import assert from 'node:assert/strict';
import { searchIndex } from '../src/data/search.js';
import { galleryDisplayWorks } from '../src/data/gallery.js';
import { motifGroups, stitches, stories } from '../src/data/history.js';
import { searchContent } from '../src/features/search/searchModel.js';

test('search destinations resolve every current work, stitch, motif and story without duplicate IDs', () => {
  assert.equal(new Set(searchIndex.map(({ id }) => id)).size, searchIndex.length);
  const works = galleryDisplayWorks();
  for (const item of searchIndex) {
    if (item.kind === 'work') assert.equal(works[item.index].title, item.title);
    if (item.kind === 'stitch') assert.equal(stitches[item.index].name, item.title);
    if (item.kind === 'story') assert.equal(stories[item.index].title, item.title);
    if (item.kind === 'motif') assert.equal(motifGroups[item.group].items[item.index].name, item.title);
  }
  assert.equal(searchIndex.filter(({ kind }) => kind === 'work').length, works.length);
});

test('needle technique searches offer all six concrete choices', () => {
  const { items, total } = searchContent('针法');
  assert.equal(total, 6);
  assert.deepEqual(items.map(({ title }) => title), stitches.map(({ name }) => name));
  assert.ok(items.every(({ kind, page }) => kind === 'stitch' && page === 'history'));
});

test('exact names lead to their concrete destination instead of a generic page', () => {
  for (const item of searchIndex) assert.equal(searchContent(item.title).items[0].id, item.id, item.title);
  assert.equal(searchContent('锁绣').items[0].index, 2);
});

test('spaces, punctuation and fullwidth input still find the intended work', () => {
  assert.equal(searchContent('  蝶舞 空间  ').items[0].title, '蝶舞·空间');
  assert.equal(searchContent('纤维－山岚').items[0].title, '纤维·山岚');
  assert.equal(searchContent('锁绣 针法').items[0].title, '锁绣');
});

test('blank and unknown queries remain empty, with no fallback to an unrelated page', () => {
  for (const query of ['', '   ', '…', '不存在98765', '<script>alert(1)</script>']) {
    assert.deepEqual(searchContent(query), { items: [], total: 0 });
  }
});

test('broad results stay brief while retaining their total count', () => {
  const result = searchContent('作品');
  assert.equal(result.items.length, 6);
  assert.ok(result.total >= 18);
  assert.equal(searchContent('八角星纹').items[0].theme, 'star');
});
