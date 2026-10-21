import test from 'node:test';
import assert from 'node:assert/strict';
import { ATLAS_RECORDS } from '../src/data/atlas.js';
import { DISTRIBUTION_POINTS, DISTRIBUTION_SOURCES, INITIAL_DISTRIBUTION } from '../src/data/distribution.js';
import { distributionPoints, distributionReducer, distributionStats, heatCells, projectPoint } from '../src/features/home/distributionModel.js';

test('curated points have unique county codes, traceable sources and valid archive relationships', () => {
  assert.equal(new Set(DISTRIBUTION_POINTS.map((point) => point.code)).size, 20);
  for (const point of DISTRIBUTION_POINTS) {
    assert.ok(DISTRIBUTION_SOURCES.some((source) => source.id === point.source), point.id);
    assert.equal(point.coordinates.length, 2);
    const position = projectPoint(point.coordinates);
    assert.ok(position.x > 0 && position.x < 820 && position.y > 0 && position.y < 460, point.id);
    if (point.archive) assert.ok(ATLAS_RECORDS.some((record) => record.id === point.archive), point.archive);
  }
  const stats = distributionStats(DISTRIBUTION_POINTS);
  assert.deepEqual([stats.branches, stats.points, stats.provinces, stats.archives.length], [3, 20, 6, 7]);
  assert.equal(distributionStats([...DISTRIBUTION_POINTS, DISTRIBUTION_POINTS[0]]).archives.length, 7, 'archive records are deduplicated');
});

test('branch and province filters keep a valid selection and remove incompatible filters', () => {
  let state = distributionReducer(INITIAL_DISTRIBUTION, { type: 'branch', value: 'central' });
  let stats = distributionStats(distributionPoints(state));
  assert.deepEqual([stats.branches, stats.points, stats.provinces, stats.archives.length], [1, 8, 3, 4]);
  state = distributionReducer(state, { type: 'province', value: '广西' });
  assert.equal(distributionPoints(state).length, 2);
  assert.equal(distributionStats(distributionPoints(state)).archives.length, 0);
  assert.equal(state.selected, 'rongshui');
  assert.equal(distributionReducer(state, { type: 'point', value: 'leishan' }), state);
  assert.equal(distributionReducer(state, { type: 'province', value: '未知地区' }), state);
  state = distributionReducer(state, { type: 'branch', value: 'west' });
  assert.equal(state.province, 'all');
  assert.equal(state.selected, 'huaxi');
  stats = distributionStats(distributionPoints(state));
  assert.deepEqual([stats.points, stats.provinces, stats.archives.length], [6, 3, 1]);
});

test('wandering visits every unseen point before repeating and reset preserves the embroidery trail', () => {
  let state = { ...INITIAL_DISTRIBUTION, visited: [] };
  for (let index = 0; index < 20; index++) {
    state = distributionReducer(state, { type: 'wander', sample: 0 });
    assert.equal(state.visited.length, index + 1);
  }
  const previous = state.selected;
  state = distributionReducer(state, { type: 'wander', sample: 1 });
  assert.notEqual(state.selected, previous);
  assert.equal(state.visited.length, 20);
  state = distributionReducer(state, { type: 'branch', value: 'east' });
  state = distributionReducer(state, { type: 'heat' });
  state = distributionReducer(state, { type: 'reset' });
  assert.equal(state.branch, 'all');
  assert.equal(state.heat, false);
  assert.equal(state.visited.length, 20);
});

test('wandering stays within the active branch and province', () => {
  let state = distributionReducer(INITIAL_DISTRIBUTION, { type: 'branch', value: 'west' });
  state = distributionReducer(state, { type: 'province', value: '云南' });
  state = distributionReducer(state, { type: 'wander', sample: .8 });
  assert.equal(state.selected, 'malipo');
  assert.deepEqual(state.visited, ['malipo']);
  assert.equal(distributionReducer(state, { type: 'wander', sample: 0 }), state, 'a completed one-point filter has no new destination');
});

test('heat levels use equal point weights and a fixed scale across filters', () => {
  const single = heatCells([DISTRIBUTION_POINTS[6]]);
  const clustered = heatCells(DISTRIBUTION_POINTS.filter((point) => ['leishan', 'kaili', 'taijiang', 'jianhe'].includes(point.id)));
  assert.ok(single.length > 0);
  assert.ok(single.every((cell) => cell.value <= 1 && cell.level <= 1));
  assert.ok(clustered.some((cell) => cell.level === 3));
  const cell = single[0];
  const sameCell = heatCells(DISTRIBUTION_POINTS).find((entry) => entry.x === cell.x && entry.y === cell.y);
  assert.ok(sameCell.value >= cell.value);
  assert.deepEqual(heatCells([]), []);
});
