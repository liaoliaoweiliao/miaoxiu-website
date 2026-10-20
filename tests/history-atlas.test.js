import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { colorChoices, colorExamples, colorMotifs, motifGroups, stories, stitches } from '../src/data/history.js';
import { ATLAS_RECORDS, initialAtlasState, TIMES } from '../src/data/atlas.js';
import { appliedColors, historyReducer, initialHistoryState, motifColorImage } from '../src/features/history/historyModel.js';
import { atlasReducer, filteredAtlas } from '../src/features/history/atlasModel.js';

test('upstream history content retains every story, motif and stitch', () => {
  assert.deepEqual(stories.map(({ pages }) => pages.length), [3, 3, 3]);
  assert.equal(Object.values(motifGroups).reduce((total, group) => total + group.items.length, 0), 10);
  assert.equal(stitches.length, 6);
  let state = historyReducer(initialHistoryState, { type: 'group', group: 'plant' });
  state = historyReducer(state, { type: 'motifMove', direction: -1 });
  assert.equal(motifGroups[state.group].items[state.motif].name, '桐花纹');
  state = historyReducer(state, { type: 'group', group: 'geometry' });
  assert.equal(state.motif, 0);
});

test('color selections toggle and replace oldest choice while producing canonical image names', () => {
  let state = initialHistoryState;
  for (const index of [5, 1, 3]) state = historyReducer(state, { type: 'color', index });
  assert.deepEqual(state.colors, [5, 1, 3]);
  assert.equal(motifColorImage(colorMotifs[0], appliedColors(state.colors)), 'history/color-motifs/butterfly-c1-3-5.webp');
  state = historyReducer(state, { type: 'color', index: 2 });
  assert.deepEqual(state.colors, [1, 3, 2]);
  state = historyReducer(state, { type: 'color', index: 3 });
  assert.deepEqual(state.colors, [1, 2]);
  assert.deepEqual(appliedColors(state.colors), [0, 1, 2]);
  state = historyReducer(state, { type: 'colorReset' });
  assert.deepEqual(appliedColors(state.colors), []);
  assert.equal(motifColorImage(colorMotifs[2], appliedColors(state.colors)), colorMotifs[2].line);
});

test('stitch replay ignores stale completion and changing other tools stops playback', () => {
  let state = historyReducer(initialHistoryState, { type: 'stitch', index: 0 });
  const first = state.run;
  state = historyReducer(state, { type: 'stitch', index: 3 });
  assert.strictEqual(historyReducer(state, { type: 'stitchComplete', run: first }), state);
  state = historyReducer(state, { type: 'color', index: 1 });
  assert.equal(state.playing, false);
  assert.equal(state.step, 0);
  assert.strictEqual(historyReducer(state, { type: 'stitchComplete', run: state.run }), state);
});

test('all historical content and every three-color combination resolve to preserved local assets', () => {
  const images = [
    ...stories.map((item) => item.image),
    ...Object.values(motifGroups).flatMap((group) => group.items.map((item) => item.image)),
    ...stitches.flatMap((item) => [item.thumb, item.finish]),
    ...colorChoices.flatMap((item) => [item.swatch, item.image]),
    ...colorExamples.map((item) => item[1]),
    ...colorMotifs.map((item) => item.line),
  ];
  for (const motif of colorMotifs) {
    for (let a = 0; a < 6; a += 1) for (let b = a + 1; b < 6; b += 1) for (let c = b + 1; c < 6; c += 1) images.push(motifColorImage(motif, [a, b, c]));
  }
  for (const image of images) assert.ok(existsSync(new URL(`../public/assets/${image}`, import.meta.url)), image);
});

test('official atlas cumulative timeline and regional filters agree with all seven records', () => {
  assert.equal(ATLAS_RECORDS.length, 7);
  for (const time of TIMES) {
    const state = atlasReducer(initialAtlasState, { type: 'year', value: String(time.year) });
    assert.equal(filteredAtlas(state).length, time.total);
  }
  let state = atlasReducer(initialAtlasState, { type: 'area', value: '黔东南' });
  assert.equal(state.view, 'guizhou');
  assert.equal(filteredAtlas(state).length, 4);
  state = atlasReducer(state, { type: 'year', value: '2006' });
  assert.equal(state.area, 'all');
  assert.equal(filteredAtlas(state).length, 3);
  state = atlasReducer(state, { type: 'province', value: '湖南' });
  assert.equal(filteredAtlas(state).length, 0, 'a 2021 record remains outside the 2006 filter');
  assert.equal(state.view, 'all');
  state = atlasReducer(state, { type: 'reset' });
  state = atlasReducer(state, { type: 'province', value: '贵州' });
  state = atlasReducer(state, { type: 'point', value: 'huaxi' });
  assert.equal(state.selected, 'huaxi');
  assert.equal(state.area, '贵阳');
  assert.equal(filteredAtlas(state).length, 1);
});
