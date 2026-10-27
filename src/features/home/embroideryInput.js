const clamp = (value, max = 1) => Math.max(-max, Math.min(max, value));
export const SOUND_COOLDOWN_MS = 4500;

// Coarse optical flow, not body/hand landmark recognition. Removing the mean
// luminance makes uniform lighting changes less likely to look like movement.
export function measureMovement(previous, current, width, height) {
  if (!previous || previous.length !== current.length) return { x: 0, y: 0, amount: 0 };
  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const brightness = mean(current) - mean(previous);
  let changed = 0;
  let count = 0;
  for (let y = 4; y < height - 4; y += 2) {
    for (let x = 4; x < width - 4; x += 2) {
      if (Math.abs(current[y * width + x] - previous[y * width + x] - brightness) > 18) changed += 1;
      count += 1;
    }
  }
  const amount = Math.min(1, changed / Math.max(1, count) * 5);
  if (amount < 0.025) return { x: 0, y: 0, amount: 0 };
  let best = Infinity;
  let baseline = Infinity;
  let flowX = 0;
  let flowY = 0;
  for (let dy = -3; dy <= 3; dy += 1) {
    for (let dx = -3; dx <= 3; dx += 1) {
      let error = 0;
      for (let y = 4; y < height - 4; y += 2) {
        for (let x = 4; x < width - 4; x += 2) {
          error += Math.abs(current[y * width + x] - previous[(y - dy) * width + x - dx] - brightness);
        }
      }
      if (!dx && !dy) baseline = error;
      // Prefer small displacements when texture is ambiguous.
      const score = error + (Math.abs(dx) + Math.abs(dy)) * count * 0.08;
      if (score < best) { best = score; flowX = dx; flowY = dy; }
    }
  }
  if (best > baseline * 0.97) return { x: 0, y: 0, amount };
  return { x: clamp(-flowX / 3), y: clamp(-flowY / 3), amount };
}

export function createSoundState() {
  return { baseline: 0.02, previous: 0, envelope: 0, lastPeak: -Infinity, started: null };
}

export function measureSound(samples, state, now) {
  const rms = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
  state.started ??= now;
  const peak = now - state.started > 800 && now - state.lastPeak >= SOUND_COOLDOWN_MS
    && rms > Math.max(0.12, state.baseline * 2.2) && rms - state.previous > 0.045;
  state.baseline += (rms - state.baseline) * 0.06;
  state.envelope += (Math.min(1, rms * 4) - state.envelope) * 0.3;
  state.previous = rms;
  if (peak) state.lastPeak = now;
  return { level: state.envelope, peak };
}
