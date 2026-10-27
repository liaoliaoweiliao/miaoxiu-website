import test from 'node:test';
import assert from 'node:assert/strict';
import { createSoundState, measureMovement, measureSound, SOUND_COOLDOWN_MS } from '../src/features/home/embroideryInput.js';
import { createRebirthPattern, initialRebirthPattern, rebirthMotifs } from '../src/data/heritageRebirth.js';
import { makeButterfly } from '../src/features/home/butterflyGeometry.js';

function frame(dx = 0, dy = 0, brightness = 0) {
  return Float32Array.from({ length: 64 * 48 }, (_, index) => {
    const x = index % 64 - dx;
    const y = Math.floor(index / 64) - dy;
    return brightness + (x > 16 && x < 38 && y > 12 && y < 32 ? 150 + (x * 13 + y * 7) % 90 : 15);
  });
}

test('local camera flow finds mirrored movement and ignores still frames and uniform lighting', () => {
  const still = frame();
  assert.deepEqual(measureMovement(null, still, 64, 48), { x: 0, y: 0, amount: 0 });
  assert.deepEqual(measureMovement(still, still, 64, 48), { x: 0, y: 0, amount: 0 });
  assert.deepEqual(measureMovement(still, frame(0, 0, 25), 64, 48), { x: 0, y: 0, amount: 0 });
  const right = measureMovement(still, frame(3), 64, 48);
  const up = measureMovement(still, frame(0, -3), 64, 48);
  assert.ok(right.x < -0.5 && right.amount > 0.2);
  assert.ok(up.y > 0.5 && up.amount > 0.2);
  assert.ok(measureMovement(still, frame(3, 0, 20), 64, 48).x < -0.5);
});

test('audio requires a rising peak after warmup and cools down even after silence', () => {
  const state = createSoundState();
  const samples = (level) => new Float32Array(1024).fill(level);
  assert.equal(measureSound(samples(0.5), state, 0).peak, false);
  measureSound(samples(0.01), state, 900);
  assert.equal(measureSound(samples(0.4), state, 1000).peak, true);
  assert.equal(measureSound(samples(0.4), state, 1100).peak, false);
  measureSound(samples(0), state, 1300);
  assert.equal(measureSound(samples(0.4), state, 1400).peak, false);
  measureSound(samples(0), state, 1000 + SOUND_COOLDOWN_MS - 100);
  const peak = measureSound(samples(0.5), state, 1000 + SOUND_COOLDOWN_MS);
  assert.equal(peak.peak, true);
  assert.ok(peak.level > 0 && peak.level <= 1);
});

test('remixes preserve the butterfly subject with changed ornaments and bounded layout', () => {
  assert.deepEqual(rebirthMotifs, ['蝴蝶纹', '花卉纹', '几何纹']);
  for (const sample of [0, 0.4, 0.999, 1]) {
    const pattern = createRebirthPattern(initialRebirthPattern, () => sample);
    assert.equal(pattern.primary, initialRebirthPattern.primary);
    assert.notEqual(pattern.secondary, initialRebirthPattern.secondary);
    assert.notEqual(pattern.primary, pattern.secondary);
    assert.ok(pattern.columns >= 5 && pattern.columns <= 9);
  }
});

test('the million-particle butterfly has actual fibre vertices, four wings and depth without 16-bit indices', () => {
  const geometry = makeButterfly(1000000);
  assert.equal(geometry.particleCount, 1000000);
  assert.ok(geometry.threadCount > 10000 && geometry.threadCount % 2 === 0);
  assert.equal(geometry.positions.length, (1000000 + geometry.threadCount) * 3);
  const wings = new Set();
  let minimumZ = Infinity;
  let maximumZ = -Infinity;
  for (let i = 0; i < 1000000; i += 41) {
    wings.add(geometry.seeds[i * 3 + 2]);
    minimumZ = Math.min(minimumZ, geometry.positions[i * 3 + 2]);
    maximumZ = Math.max(maximumZ, geometry.positions[i * 3 + 2]);
    assert.ok(Number.isFinite(geometry.positions[i * 3]));
  }
  for (const group of [0, 1, 2, 3, 4, 5]) assert.ok(wings.has(group));
  assert.ok(maximumZ - minimumZ > .2);
});
