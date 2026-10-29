import test from 'node:test';
import assert from 'node:assert/strict';
import { costumeSets } from '../src/data/catalog.js';
import { COLLECTION_KEY, levels, readCollection, createExperienceState, experienceReducer, hitRegion, isHit, ownedSets, hasOutfit, previewLayers, setById, visibleCollection } from '../src/features/experience/gameModel.js';

function storage(initial = {}) {
  const items = new Map(Object.entries(initial));
  return { getItem(key) { return items.get(key) ?? null; }, setItem(key, value) { items.set(key, value); } };
}
const reduce = experienceReducer;

test('desktop resumes both saved outfits without bypassing the new round gate; web starts with base avatars', () => {
  const girl = costumeSets.find(costume => costume.gender === 'girl');
  const boy = costumeSets.find(costume => costume.gender === 'boy');
  const saved = { unlocked: [...new Set([girl.theme, boy.theme])], owned: [girl.id, boy.id], gender: 'boy', equipped: { girl: girl.id, boy: boy.id } };
  const profile = storage({ [COLLECTION_KEY]: JSON.stringify(saved) });
  const desktop = createExperienceState(profile, () => 0, { restoreOutfit: true });
  assert.deepEqual(visibleCollection(desktop).equipped, saved.equipped);
  assert.deepEqual(visibleCollection(createExperienceState(profile, () => 0)).equipped, { girl: null, boy: null });
  assert.equal(desktop.found, false);
  assert.equal(desktop.dressed, false);
  assert.strictEqual(reduce(desktop, { type: 'drawStart' }), desktop);
  let next = draw(solve(desktop), 'boy');
  next = reduce(next, { type: 'equip', id: boy.id });
  next = reduce(next, { type: 'round', completed: true, random: 0 });
  assert.equal(next.round, 2);
  assert.deepEqual(visibleCollection(next).equipped, { girl: null, boy: null });
  assert.equal(next.collection.equipped.boy, boy.id);
});

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

test('all four clipped stars on the far left unlock the star wardrobe without accepting the adjacent trim', () => {
  for (const y of [17, 39.4, 62.1, 84.7]) {
    const state = reduce(start(), { type: 'find', x: 2.5, y });
    assert.equal(state.found, true);
    assert.deepEqual(state.collection.unlocked, ['star']);
    assert.equal(isHit(0, 6.8, y), false, 'the red hanging strip is not a star');
  }
  for (const y of [5, 28, 50, 73, 97]) assert.equal(isHit(0, 2.5, y), false, 'the small separator motifs stay outside the star targets');
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

test('draws in separately solved journeys fill missing sets first without duplicate collection entries', () => {
  let state = solve(start());
  for (let count = 1; count <= 6; count += 1) {
    if (count > 1) state = solve(start(0, storage({ [COLLECTION_KEY]: JSON.stringify(state.collection) })));
    state = draw(state);
    assert.equal(state.collection.owned.length, count);
    assert.equal(state.lastFresh, true);
    assert.equal(state.collection.equipped.girl, null, 'draws collect without auto-equipping');
  }
  state = draw(solve(start(0, storage({ [COLLECTION_KEY]: JSON.stringify(state.collection) }))));
  assert.equal(state.collection.owned.length, 6);
  assert.equal(state.lastFresh, false);
  assert.match(state.collectionNote, /重复卡/);
  assert.equal(state.drawRevision, 1);
  state = draw(solve(start(0, storage({ [COLLECTION_KEY]: JSON.stringify(state.collection) }))), 'boy');
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
  state = draw(solve(start(1, storage({ [COLLECTION_KEY]: JSON.stringify(state.collection) }))), 'boy');
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
  assert.equal(next.theme, levels[next.level].id);
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

test('many completed rounds reset transient selections and keep all collected outfits and separate looks', () => {
  let state = start();
  for (let index = 0; index < 9; index += 1) {
    state = draw(solve(state), index % 2 ? 'boy' : 'girl');
    state = reduce(state, { type: 'equip', id: state.lastDraw });
    state = reduce(state, { type: 'filter', id: state.theme });
    const previous = state;
    state = reduce(state, { type: 'round', completed: true, random: index % 2 ? 0.99 : 0 });
    assert.notEqual(state.level, previous.level);
    assert.equal(state.theme, levels[state.level].id);
    assert.equal(state.round, index + 2);
    assert.equal(state.filter, 'all', 'an old theme filter must not hide the next outfit');
    assert.equal(state.selectedCard, null);
    assert.equal(state.collectionNote, '');
    assert.equal(state.saveNote, '');
    assert.equal(state.found, false);
    assert.equal(state.dressed, false);
    assert.equal(state.drawGender, null);
    assert.equal(state.lastDraw, null);
    assert.strictEqual(state.collection, previous.collection, 'ownership and both equipped looks survive');
  }
});

test('changing unsolved photos always changes the image, and reveal blocks round changes', () => {
  for (let index = 0; index < levels.length; index += 1) {
    for (const random of [0, 0.5, 0.99, 1]) {
      const state = start(index);
      const next = reduce(state, { type: 'round', completed: false, random });
      assert.notEqual(next.level, index);
    }
  }
  let state = reduce(solve(start()), { type: 'drawGender', id: 'girl' });
  state = reduce(state, { type: 'drawStart' });
  assert.strictEqual(reduce(state, { type: 'round', completed: true, random: 0 }), state);
  state = reduce(state, { type: 'drawComplete', random: 0 });
  state = reduce(state, { type: 'equip', id: state.lastDraw });
  assert.strictEqual(reduce(state, { type: 'round', completed: true, random: 0 }), state);
});

test('only the discovered theme allows one draw, including after role, pool and dressing changes', () => {
  const saved = storage({ [COLLECTION_KEY]: JSON.stringify({ unlocked: ['star', 'peony'], owned: ['star-boy-1'], gender: 'girl', equipped: { girl: null, boy: 'star-boy-1' } }) });
  let state = start(0, saved);
  assert.strictEqual(reduce(state, { type: 'drawGender', id: 'girl' }), state, 'stored unlocks cannot bypass this round search');
  state = reduce(state, { type: 'pool', id: 'swirl' });
  assert.deepEqual(state.collection.unlocked, ['star', 'peony'], 'viewing a locked pool does not unlock it');
  state = solve(state);
  assert.equal(state.theme, 'star');
  state = reduce(state, { type: 'pool', id: 'peony' });
  assert.strictEqual(reduce(state, { type: 'drawGender', id: 'girl' }), state, 'a previously unlocked different theme cannot be drawn this round');
  state = reduce(state, { type: 'openWardrobe' });
  state = draw(state);
  const drawn = state.lastDraw;
  assert.strictEqual(reduce(state, { type: 'drawStart' }), state);
  assert.strictEqual(reduce(state, { type: 'drawGender', id: 'boy' }), state);
  assert.strictEqual(reduce(state, { type: 'pool', id: 'peony' }), state);
  state = reduce(state, { type: 'gender', id: 'boy' });
  state = reduce(state, { type: 'equip', id: 'star-boy-1' });
  assert.equal(state.dressed, true, 'an explicitly worn older full outfit can finish the current journey');
  assert.equal(reduce(state, { type: 'round', completed: true, random: 0 }).round, 2);
  assert.equal(state.lastDraw, drawn);
  assert.strictEqual(reduce(state, { type: 'drawStart' }), state);
  state = reduce(state, { type: 'gender', id: 'girl' });
  state = reduce(state, { type: 'equip', id: drawn });
  assert.equal(state.dressed, true);
  state = reduce(state, { type: 'reset' });
  assert.equal(state.lastDraw, drawn);
  assert.strictEqual(reduce(state, { type: 'drawStart' }), state, 'resetting the portrait does not grant another draw');
});

test('any owned full outfit can finish after a draw, including other themes and a choice made before drawing', () => {
  const saved = storage({ [COLLECTION_KEY]: JSON.stringify({ unlocked: ['star', 'peony'], owned: ['peony-girl-2-1', 'peony-boy-2-1'], gender: 'girl', equipped: { girl: 'peony-girl-2-1', boy: 'peony-boy-2-1' } }) });
  let state = solve(start(0, saved));
  state = reduce(state, { type: 'equip', id: 'peony-girl-2-1' });
  assert.equal(state.dressed, false, 'wearing old clothes does not skip the round draw');
  assert.strictEqual(reduce(state, { type: 'round', completed: true }), state);
  state = draw(state);
  assert.equal(state.dressed, true, 'an explicit earlier choice remains valid when the draw finishes');
  assert.notEqual(state.lastDraw, state.collection.equipped.girl);
  state = reduce(state, { type: 'gender', id: 'boy' });
  assert.equal(state.dressed, false, 'a stored but unchosen role still shows the base figure');
  state = reduce(state, { type: 'equip', id: 'peony-boy-2-1' });
  assert.equal(state.dressed, true);
  state = reduce(state, { type: 'gender', id: 'girl' });
  assert.equal(state.dressed, true, 'switching back recognizes the explicitly worn other-theme outfit');
  const next = reduce(state, { type: 'round', completed: true, random: 0 });
  assert.equal(next.round, 2);
  assert.equal(hasOutfit(visibleCollection(next)), false);
  assert.deepEqual(next.collection, state.collection);
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

test('saved outfits stay in history while each unchosen role shows its original appearance', () => {
  const saved = { unlocked: ['star'], owned: ['star-girl-1', 'star-boy-1'], gender: 'girl', equipped: { girl: 'star-girl-1', boy: 'star-boy-1' } };
  let state = start(0, storage({ [COLLECTION_KEY]: JSON.stringify(saved) }));
  for (const gender of ['girl', 'boy', 'girl']) {
    state = reduce(state, { type: 'gender', id: gender });
    assert.equal(hasOutfit(visibleCollection(state)), false);
    assert.equal(previewLayers(visibleCollection(state))[0].src, `experience/catalog/${gender}-base.webp`);
    assert.deepEqual(state.collection.equipped, saved.equipped, 'showing the original figure must not erase saved looks');
  }
  state = reduce(state, { type: 'equip', id: 'star-girl-1' });
  assert.equal(previewLayers(visibleCollection(state))[0].src, setById('star-girl-1').portrait);
  state = reduce(state, { type: 'gender', id: 'boy' });
  assert.equal(previewLayers(visibleCollection(state))[0].src, 'experience/catalog/boy-base.webp');
  state = reduce(state, { type: 'gender', id: 'girl' });
  assert.equal(previewLayers(visibleCollection(state))[0].src, setById('star-girl-1').portrait, 'an explicit choice remains while switching roles in the same round');
  state = reduce(state, { type: 'reset' });
  assert.equal(previewLayers(visibleCollection(state))[0].src, 'experience/catalog/girl-base.webp');
  assert.equal(state.collection.equipped.boy, 'star-boy-1');
  assert.deepEqual(state.collection.owned, saved.owned);
});

test('drawing does not select a suit, and wearing waits for the finish action before a new original figure', () => {
  const saved = { unlocked: ['star'], owned: ['star-girl-1'], gender: 'girl', equipped: { girl: 'star-girl-1', boy: null } };
  let state = draw(solve(start(0, storage({ [COLLECTION_KEY]: JSON.stringify(saved) }))));
  assert.equal(previewLayers(visibleCollection(state))[0].src, 'experience/catalog/girl-base.webp');
  assert.equal(state.dressed, false);
  assert.strictEqual(reduce(state, { type: 'round', completed: true, random: 0 }), state);
  state = reduce(state, { type: 'equip', id: state.lastDraw });
  assert.equal(state.dressed, true);
  assert.equal(state.round, 1, 'wearing an entire suit does not advance automatically');
  assert.equal(previewLayers(visibleCollection(state))[0].setId, state.lastDraw);
  const history = state.collection;
  state = reduce(state, { type: 'round', completed: true, random: 0 });
  assert.equal(state.round, 2);
  assert.equal(hasOutfit(visibleCollection(state)), false);
  assert.equal(previewLayers(visibleCollection(state))[0].src, 'experience/catalog/girl-base.webp');
  assert.strictEqual(state.collection, history);
  assert.equal(hasOutfit(visibleCollection(start(0, storage({ [COLLECTION_KEY]: JSON.stringify(history) })))), false);
});

test('v3 whole-component outfits and v2 discovery migrate; corrupt/blocked storage is recoverable', () => {
  const legacy = { unlocked: ['star'], owned: ['star-girl-1'], equipped: { girl: { head: 'star-girl-1', top: 'star-girl-1', skirt: 'star-girl-1' } } };
  assert.equal(readCollection(storage({ 'miao-wardrobe-v3': JSON.stringify(legacy) })).equipped.girl, 'star-girl-1');
  assert.deepEqual(readCollection(storage({ 'miao-decode-v2': JSON.stringify({ 'eight-point-star': { found: true }, peony: { found: true } }) })).unlocked, ['star', 'peony']);
  for (const raw of ['{bad', 'null', '[]', '42']) assert.deepEqual(readCollection(storage({ [COLLECTION_KEY]: raw })).owned, []);
  assert.deepEqual(readCollection({ getItem() { throw new Error('denied'); } }).unlocked, []);
  assert.equal(reduce(start(), { type: 'storageFailed' }).collectionNote.includes('无法保存收藏'), true);
});
