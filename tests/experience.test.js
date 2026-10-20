import test from 'node:test';
import assert from 'node:assert/strict';
import { costumeSets } from '../src/data/catalog.js';
import { COLLECTION_KEY, levels, readCollection, createExperienceState, experienceReducer, hitRegion, isHit, ownedSets, hasOutfit, previewLayers, setById } from '../src/features/experience/gameModel.js';

function storage(initial = {}) {
  const items = new Map(Object.entries(initial));
  return { getItem(key) { return items.get(key) ?? null; }, setItem(key, value) { items.set(key, value); } };
}
const reduce = experienceReducer;
function start(index = 0, saved) { return createExperienceState(saved, () => (index + 0.1) / 3); }
function solve(state) {
  const region = levels[state.level].regions[0];
  return reduce(state, { type: 'find', x: region.shape === 'rect' ? region.x + region.w / 2 : region.cx, y: region.shape === 'rect' ? region.y + region.h / 2 : region.cy });
}
function draw(state, gender = 'girl', random = 0) {
  state = reduce(state, { type: 'drawGender', id: gender });
  state = reduce(state, { type: 'drawStart' });
  state = reduce(state, { type: 'drawComplete', random });
  return reduce(state, { type: 'revealDone' });
}

test('upstream catalog keeps all 36 matched card/portrait sets, six per theme and gender', () => {
  assert.equal(costumeSets.length, 36);
  assert.equal(new Set(costumeSets.map(({ id }) => id)).size, 36);
  for (const { id } of levels) for (const gender of ['girl', 'boy']) {
    const pool = costumeSets.filter((costume) => costume.theme === id && costume.gender === gender);
    assert.equal(pool.length, 6);
    assert.ok(pool.every((costume) => costume.card && costume.portrait && costume.sourceCard && costume.sourcePortrait));
  }
});

test('all upstream annotated regions accept their center, outside/invalid coordinates miss', () => {
  for (let index = 0; index < levels.length; index += 1) {
    for (const region of levels[index].regions) {
      const x = region.shape === 'rect' ? region.x + region.w / 2 : region.cx;
      const y = region.shape === 'rect' ? region.y + region.h / 2 : region.cy;
      assert.ok(hitRegion(index, x, y) >= 0);
    }
    assert.equal(isHit(index, 0, 0), false);
    assert.equal(isHit(index, NaN, 50), false);
    assert.equal(isHit(index, 50, Infinity), false);
    assert.equal(isHit(index, -1, 50), false);
    assert.equal(isHit(index, 101, 50), false);
  }
  assert.equal(hitRegion(20, 50, 50), -1);
  assert.equal(levels[2].id, 'swirl');
  assert.ok(levels[2].regions.length > 100, 'user-annotated water swirl regions are preserved');
});

test('each random photograph unlocks only its theme and repeat hits do not duplicate it', () => {
  for (let index = 0; index < 3; index += 1) {
    const initial = start(index);
    assert.equal(initial.level, index);
    const missed = reduce(initial, { type: 'find', x: 0, y: 0 });
    assert.equal(missed.found, false);
    assert.equal(missed.feedback.hit, false);
    const solved = solve(missed);
    assert.equal(solved.found, true);
    assert.equal(solved.unlock, levels[index].id);
    assert.deepEqual(solved.collection.unlocked, [levels[index].id]);
    assert.strictEqual(solve(solved), solved);
    assert.deepEqual(initial.collection.unlocked, [], 'state updates remain immutable');
  }
});

test('drawing requires an unlocked pool and explicit role selection', () => {
  let state = start();
  assert.strictEqual(reduce(state, { type: 'drawStart' }), state);
  state = reduce(state, { type: 'drawGender', id: 'girl' });
  assert.strictEqual(reduce(state, { type: 'drawStart' }), state);
  state = solve(state);
  assert.equal(state.drawGender, null);
  assert.strictEqual(reduce(state, { type: 'drawStart' }), state);
  state = reduce(state, { type: 'drawGender', id: 'boy' });
  state = reduce(state, { type: 'drawStart' });
  assert.equal(state.drawing, true);
  assert.strictEqual(reduce(state, { type: 'drawStart' }), state);
  assert.strictEqual(reduce(state, { type: 'gender', id: 'girl' }), state);
  assert.strictEqual(reduce(state, { type: 'pool', id: 'peony' }), state);
  state = reduce(state, { type: 'drawComplete', random: 0.99 });
  assert.equal(state.reveal, true);
  assert.equal(state.drawing, false);
  assert.equal(setById(state.lastDraw).gender, 'boy');
  assert.strictEqual(reduce(state, { type: 'drawStart' }), state);
});

test('repeat draws fill missing sets first and completed pools never duplicate collection entries', () => {
  let state = solve(start());
  for (let count = 1; count <= 6; count += 1) {
    state = draw(state);
    assert.equal(state.collection.owned.length, count);
    assert.equal(state.lastFresh, true);
    assert.equal(state.collection.equipped.girl, null, 'draws collect without auto-equipping');
  }
  state = draw(state);
  assert.equal(state.collection.owned.length, 6);
  assert.equal(state.lastFresh, false);
  assert.match(state.collectionNote, /重复卡/);
  assert.equal(state.drawRevision, 7);
  state = draw(state, 'boy');
  assert.equal(state.collection.owned.length, 7);
  assert.equal(ownedSets(state.collection).length, 1);
  assert.equal(ownedSets(state.collection, 'girl').length, 6);
});

test('whole outfits enforce ownership and gender, preserve separate boys/girls, and reset safely', () => {
  let state = draw(solve(start()));
  assert.strictEqual(reduce(state, { type: 'equip', id: 'star-girl-6' }), state);
  const girlId = state.lastDraw;
  state = reduce(state, { type: 'equip', id: girlId });
  assert.equal(hasOutfit(state.collection), true);
  assert.equal(state.dressed, true);
  assert.equal(previewLayers(state.collection)[0].src, setById(girlId).portrait);
  state = draw(state, 'boy');
  assert.strictEqual(reduce(state, { type: 'equip', id: girlId }), state);
  const boyId = state.lastDraw;
  state = reduce(state, { type: 'equip', id: boyId });
  assert.deepEqual(state.collection.equipped, { girl: girlId, boy: boyId });
  const reset = reduce(state, { type: 'reset' });
  assert.equal(reset.collection.equipped.boy, null);
  assert.equal(reset.collection.equipped.girl, girlId);
  assert.deepEqual(reset.collection.owned, state.collection.owned);
  assert.equal(reset.dressed, false);
  assert.equal(previewLayers(reset.collection)[0].src, 'experience/catalog/boy-base.webp');
});

test('the loop requires wearing an outfit and chooses a different photograph after completion', () => {
  let state = solve(start());
  assert.strictEqual(reduce(state, { type: 'round', completed: false, random: 0 }), state);
  assert.strictEqual(reduce(state, { type: 'round', completed: true, random: 0 }), state);
  state = draw(state);
  assert.strictEqual(reduce(state, { type: 'round', completed: true, random: 0 }), state);
  state = reduce(state, { type: 'equip', id: state.lastDraw });
  const next = reduce(state, { type: 'round', completed: true, random: 0 });
  assert.notEqual(next.level, state.level);
  assert.equal(next.round, 2);
  assert.equal(next.found, false);
  assert.equal(next.dressed, false);
  assert.equal(next.unlock, null);
  assert.equal(next.drawGender, null);
  assert.equal(next.lastDraw, null);
  assert.equal(next.dealing, true);
  assert.deepEqual(next.collection, state.collection);
  const cursor = reduce(next, { type: 'cursor', x: -4, y: 104 });
  assert.deepEqual(cursor.cursor, { x: 0, y: 100 });
  assert.equal(reduce(cursor, { type: 'round', completed: false, random: 0.99 }).level, 2);
});

test('v4 collection restores valid ownership and outfits while rejecting forged or wrong-role entries', () => {
  const saved = { unlocked: ['star', 'star', 'bad'], owned: ['star-girl-1', 'star-boy-1', 'star-girl-1', 'peony-girl-2-1', 'bad'], gender: 'boy', equipped: { girl: 'star-boy-1', boy: 'star-boy-1' } };
  const collection = readCollection(storage({ [COLLECTION_KEY]: JSON.stringify(saved) }));
  assert.deepEqual(collection.unlocked, ['star']);
  assert.deepEqual(collection.owned, ['star-girl-1', 'star-boy-1']);
  assert.deepEqual(collection.equipped, { girl: null, boy: 'star-boy-1' });
  assert.equal(collection.gender, 'boy');
  const resumed = start(2, storage({ [COLLECTION_KEY]: JSON.stringify(collection) }));
  assert.deepEqual(resumed.collection, collection);
  assert.equal(resumed.found, false, 'reload begins a new search while retaining collection');
});

test('v3 whole-component outfits and v2 discovery migrate; corrupt/blocked storage is recoverable', () => {
  const legacy = { unlocked: ['star'], owned: ['star-girl-1'], equipped: { girl: { head: 'star-girl-1', top: 'star-girl-1', skirt: 'star-girl-1' } } };
  assert.equal(readCollection(storage({ 'miao-wardrobe-v3': JSON.stringify(legacy) })).equipped.girl, 'star-girl-1');
  assert.deepEqual(readCollection(storage({ 'miao-decode-v2': JSON.stringify({ 'eight-point-star': { found: true }, peony: { found: true } }) })).unlocked, ['star', 'peony']);
  for (const raw of ['{bad', 'null', '[]', '42']) assert.deepEqual(readCollection(storage({ [COLLECTION_KEY]: raw })).owned, []);
  assert.deepEqual(readCollection({ getItem() { throw new Error('denied'); } }).unlocked, []);
  assert.equal(reduce(start(), { type: 'storageFailed' }).collectionNote.includes('无法保存收藏'), true);
});
