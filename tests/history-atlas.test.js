import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { colorChoices, colorMotifs, motifGroups, stories, stitches } from '../src/data/history.js';
import { ATLAS_RECORDS, initialAtlasState, TIMES } from '../src/data/atlas.js';
import { colorLayerPlan, historyReducer, initialHistoryState } from '../src/features/history/historyModel.js';
import { atlasReducer, filteredAtlas } from '../src/features/history/atlasModel.js';

test('archive history content includes storybook text, every motif and six stitches', () => {
  assert.deepEqual(stories.map(({ pages }) => pages.length), [2, 2, 2]);
  assert.match(stories[1].pages.join(''), /南迁路途/);
  assert.equal(Object.values(motifGroups).reduce((total, group) => total + group.items.length, 0), 10);
  assert.equal(stitches.length, 6);
  let state = historyReducer(initialHistoryState, { type: 'group', group: 'plant' });
  state = historyReducer(state, { type: 'motifMove', direction: -1 });
  assert.equal(motifGroups[state.group].items[state.motif].name, '桐花纹');
  state = historyReducer(state, { type: 'group', group: 'geometry' });
  assert.equal(state.motif, 0);
});

test('one to three colors keep selection order and never add unselected colors', () => {
  let state = initialHistoryState;
  assert.deepEqual(colorLayerPlan([]), []);
  assert.deepEqual(colorLayerPlan([5]), [5, 5, 5]);
  assert.deepEqual(colorLayerPlan([5, 1]), [5, 1, 5]);
  for (const index of [5, 1, 3]) state = historyReducer(state, { type: 'color', index });
  assert.deepEqual(state.colors, [5, 1, 3]);
  assert.deepEqual(colorLayerPlan(state.colors), [5, 1, 3]);
  assert.strictEqual(historyReducer(state, { type: 'color', index: 2 }), state, 'a fourth color requires deselecting an existing choice');
  state = historyReducer(state, { type: 'color', index: 3 });
  assert.deepEqual(state.colors, [5, 1]);
  assert.deepEqual(colorLayerPlan(state.colors), [5, 1, 5]);
  state = historyReducer(state, { type: 'color', index: 2 });
  assert.deepEqual(state.colors, [5, 1, 2]);
  state = historyReducer(state, { type: 'colorReset' });
  assert.deepEqual(colorLayerPlan(state.colors), []);
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

test('all active archive images, storybook spreads and color masks exist locally', () => {
  const images = [
    'history/storybooks/cover-book-user.png',
    ...stories.flatMap((item) => [item.image, item.book]),
    ...Object.values(motifGroups).flatMap((group) => group.items.map((item) => item.image)),
    ...stitches.flatMap((item) => [item.thumb, item.finish]),
    ...colorChoices.flatMap((item) => [item.swatch, item.image]),
    ...colorMotifs.map((item) => item.line),
  ];
  for (const motif of colorMotifs) {
    for (let layer = 0; layer < 3; layer += 1) images.push(`history/color-motifs/${motif.key}-paint-${layer}.png`);
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
