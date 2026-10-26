import test from 'node:test';
import assert from 'node:assert/strict';
import { createSilverChimeAudio } from '../src/features/gallery/silverChimeAudio.js';

function installAudio(t, { suspended = false, resume } = {}) {
  const originals = ['AudioContext', 'webkitAudioContext', 'document'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  const contexts = [];
  const page = new EventTarget();
  page.hidden = false;
  const parameter = () => ({
    value: 0,
    setValueAtTime(value) { this.value = value; },
    linearRampToValueAtTime() {},
    exponentialRampToValueAtTime() {},
    cancelScheduledValues() {},
  });
  class AudioContextMock {
    constructor() {
      this.state = suspended ? 'suspended' : 'running';
      this.currentTime = 0;
      this.destination = {};
      this.oscillators = [];
      this.gains = [];
      contexts.push(this);
    }
    createGain() {
      const node = { gain: parameter(), connect() {}, disconnect() { this.disconnected = true; } };
      this.gains.push(node);
      return node;
    }
    createOscillator() {
      const oscillator = {
        frequency: parameter(),
        connect() {},
        disconnect() { this.disconnected = true; },
        start(at) { this.startedAt = at; },
        stop(at) { if (at === undefined) this.cancelled = true; else this.endsAt = at; },
        finish() { this.onended?.(); },
      };
      this.oscillators.push(oscillator);
      return oscillator;
    }
    async resume() {
      await resume?.();
      this.state = 'running';
    }
    async close() { this.state = 'closed'; }
  }
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: AudioContextMock });
  Object.defineProperty(globalThis, 'webkitAudioContext', { configurable: true, value: undefined });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: page });
  t.after(() => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  return { contexts, page };
}

test('silver bells create no audio until explicit enable and mute cancels even staggered notes', async (t) => {
  const { contexts } = installAudio(t);
  const audio = createSilverChimeAudio();
  t.after(() => audio.dispose());
  assert.equal(audio.playGust(), false);
  assert.equal(contexts.length, 0);
  assert.equal(await audio.enable(), true);
  assert.equal(contexts.length, 1);
  const context = contexts[0];
  assert.equal(context.oscillators.length, 0);
  assert.equal(audio.playGust(), true);
  assert.ok(context.oscillators.length === 8 || context.oscillators.length === 12);
  assert.ok(new Set(context.oscillators.map(({ startedAt }) => startedAt)).size >= 2);
  audio.stop();
  assert.equal(context.gains[0].gain.value, 0);
  assert.ok(context.oscillators.every(({ cancelled, disconnected }) => cancelled && disconnected));
  assert.equal(audio.playGust(), false);
  assert.equal(context.state, 'running');
});

test('silver bells enforce a gust interval and at most three active or scheduled voices', async (t) => {
  const { contexts } = installAudio(t);
  const audio = createSilverChimeAudio();
  t.after(() => audio.dispose());
  await audio.enable();
  const context = contexts[0];
  assert.equal(audio.playGust(), true);
  const firstCount = context.oscillators.length;
  context.currentTime = 1.69;
  assert.equal(audio.playGust(), false);
  assert.equal(context.oscillators.length, firstCount);
  context.currentTime = 1.8;
  audio.playGust();
  assert.ok(context.oscillators.length <= 12, 'scheduled notes count toward the voice ceiling');
  for (const oscillator of context.oscillators) oscillator.finish();
  context.currentTime = 4;
  assert.equal(audio.playGust(), true, 'completed voices release their capacity');
});

test('hidden pages stop all sound and returning does not restore sound without opt-in', async (t) => {
  const { contexts, page } = installAudio(t);
  const audio = createSilverChimeAudio();
  t.after(() => audio.dispose());
  await audio.enable();
  audio.playGust();
  page.hidden = true;
  page.dispatchEvent(new Event('visibilitychange'));
  assert.ok(contexts[0].oscillators.every(({ cancelled }) => cancelled));
  assert.equal(await audio.enable(), false);
  page.hidden = false;
  page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(audio.playGust(), false);
  assert.equal(await audio.enable(), true);
  audio.dispose();
  assert.equal(contexts[0].state, 'closed');
  assert.equal(await audio.enable(), false);
});

test('a late audio resume cannot turn sound back on after mute or dispose', async (t) => {
  let resolveResume;
  const pending = new Promise((resolve) => { resolveResume = resolve; });
  const { contexts } = installAudio(t, { suspended: true, resume: () => pending });
  const audio = createSilverChimeAudio();
  const enabling = audio.enable();
  audio.stop();
  resolveResume();
  assert.equal(await enabling, false);
  assert.equal(audio.playGust(), false);
  assert.equal(contexts[0].gains[0].gain.value, 0);
  audio.dispose();
});

test('unsupported audio and a rejected activation stay silent without throwing', async (t) => {
  installAudio(t, { suspended: true, resume: () => Promise.reject(new Error('Activation blocked')) });
  const rejected = createSilverChimeAudio();
  assert.equal(await rejected.enable(), false);
  assert.equal(rejected.playGust(), false);
  rejected.dispose();
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: undefined });
  const unsupported = createSilverChimeAudio();
  assert.equal(unsupported.supported, false);
  assert.equal(await unsupported.enable(), false);
  assert.equal(unsupported.playGust(), false);
  unsupported.dispose();
});
