const GUST_INTERVAL = 1.7;
const MAX_VOICES = 3;
const BELL_PITCHES = [1396.91, 1661.22, 1864.66, 2217.46];
const PARTIALS = [
  { ratio: 1, weight: 0.7, decay: 1.36 },
  { ratio: 2.76, weight: 0.2, decay: 0.94 },
  { ratio: 4.18, weight: 0.075, decay: 0.62 },
  { ratio: 5.42, weight: 0.025, decay: 0.4 },
];

/** A quiet, synthesized interpretation of small silver bells; no recorded artifact is implied. */
export function createSilverChimeAudio() {
  const page = typeof document === 'undefined' ? null : document;
  const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
  const voices = new Set();
  let context = null;
  let master = null;
  let enabled = false;
  let disposed = false;
  let activation = 0;
  let lastGust = -Infinity;
  let lastPitch = -1;

  function releaseVoice(voice) {
    if (!voices.delete(voice)) return;
    for (const oscillator of voice.oscillators) {
      oscillator.onended = null;
      try { oscillator.stop(); } catch { /* Already stopped or context closed. */ }
      oscillator.disconnect();
    }
    for (const gain of voice.gains) gain.disconnect();
  }

  function stop() {
    enabled = false;
    activation += 1;
    if (master && context?.state !== 'closed') {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(0, context.currentTime);
    }
    for (const voice of [...voices]) releaseVoice(voice);
  }

  async function enable() {
    if (disposed || typeof Context !== 'function' || page?.hidden) return false;
    const request = ++activation;
    try {
      if (!context || context.state === 'closed') {
        context = new Context();
        master = context.createGain();
        master.gain.setValueAtTime(0, context.currentTime);
        master.connect(context.destination);
        lastGust = -Infinity;
      }
      if (context.state === 'suspended') await context.resume();
      // A mute, route change or hidden tab may happen while resume is pending.
      if (disposed || request !== activation || page?.hidden || context.state !== 'running') return false;
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(0.28, context.currentTime);
      enabled = true;
      return true;
    } catch {
      if (request === activation) stop();
      return false;
    }
  }

  function strike(frequency, startsAt) {
    if (voices.size >= MAX_VOICES) return false;
    const voice = { oscillators: [], gains: [] };
    voices.add(voice);
    try {
      const output = context.createGain();
      output.gain.setValueAtTime(0.028, startsAt);
      output.connect(master);
      voice.gains.push(output);
      for (const { ratio, weight, decay } of PARTIALS) {
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        voice.oscillators.push(oscillator);
        voice.gains.push(envelope);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency * ratio, startsAt);
        envelope.gain.setValueAtTime(0.00001, startsAt);
        envelope.gain.linearRampToValueAtTime(weight, startsAt + 0.003);
        envelope.gain.exponentialRampToValueAtTime(0.00001, startsAt + decay);
        oscillator.connect(envelope);
        envelope.connect(output);
        oscillator.start(startsAt);
        oscillator.stop(startsAt + 1.42);
      }
      // All partials end together. Releasing one releases the complete bell voice.
      voice.oscillators[0].onended = () => releaseVoice(voice);
      return true;
    } catch {
      releaseVoice(voice);
      return false;
    }
  }

  function playGust() {
    if (disposed || !enabled || page?.hidden || context?.state !== 'running') return false;
    const now = context.currentTime;
    if (now - lastGust < GUST_INTERVAL || voices.size >= MAX_VOICES) return false;
    lastGust = now;
    const count = Math.min(Math.random() < 0.62 ? 2 : 3, MAX_VOICES - voices.size);
    let pitch = (lastPitch + 1 + Math.floor(Math.random() * (BELL_PITCHES.length - 1))) % BELL_PITCHES.length;
    lastPitch = pitch;
    let startsAt = now + 0.018;
    let played = false;
    for (let index = 0; index < count; index += 1) {
      // Unequal spacing and slight tuning differences keep a gust from sounding looped.
      const detune = 1 + (Math.random() - 0.5) * 0.009;
      played = strike(BELL_PITCHES[pitch] * detune, startsAt) || played;
      pitch = (pitch + 1 + Math.floor(Math.random() * 2)) % BELL_PITCHES.length;
      startsAt += 0.065 + Math.random() * 0.045;
    }
    return played;
  }

  function handleVisibility() {
    if (page.hidden) stop();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    page?.removeEventListener('visibilitychange', handleVisibility);
    master?.disconnect();
    if (context && context.state !== 'closed') {
      try { Promise.resolve(context.close()).catch(() => {}); } catch { /* No audio remains connected. */ }
    }
  }

  page?.addEventListener('visibilitychange', handleVisibility);
  return { enable, playGust, stop, dispose, supported: typeof Context === 'function' };
}
