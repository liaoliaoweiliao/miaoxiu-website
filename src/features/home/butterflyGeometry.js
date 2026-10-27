// Original 3D embroidery inspired by the guide's butterfly motif. These curves
// describe wings and individual stitches, not a traced product photograph.
const upper = [
  [[.08, .22], [.3, .58], [1.05, 1.36], [1.53, 1.02]],
  [[1.53, 1.02], [1.85, .76], [1.28, .09], [.1, -.12]],
  [[.1, -.12], [.34, -.02], [.14, .1], [.08, .22]],
];
const lower = [
  [[.1, -.05], [.55, .08], [1.3, .1], [1.2, -.35]],
  [[1.2, -.35], [1.23, -.9], [.62, -1.3], [.34, -1.16]],
  [[.34, -1.16], [.1, -1.1], [.05, -.38], [.1, -.05]],
];
const hash = (n) => {
  let value = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  value = Math.imul(value ^ value >>> 13, 0xc2b2ae35);
  return ((value ^ value >>> 16) >>> 0) / 4294967296;
};

function cubic(points, t) {
  const s = 1 - t;
  const weights = [s * s * s, 3 * s * s * t, 3 * s * t * t, t * t * t];
  return [0, 1].map((axis) => points.reduce((sum, point, index) => sum + point[axis] * weights[index], 0));
}

function wingPoint(group, radius, along) {
  const side = group % 2 ? 1 : -1;
  const bottom = group > 1;
  const curves = bottom ? lower : upper;
  const section = Math.min(2, Math.floor(along * 3));
  const point = cubic(curves[section], along * 3 - section);
  const rootY = bottom ? -.08 : .15;
  const ripple = Math.sin(along * Math.PI * 32) * .012 * Math.sin(Math.PI * along);
  const x = (.07 + (point[0] - .07) * radius + ripple * radius) * side;
  const y = rootY + (point[1] - rootY) * radius;
  const z = Math.sin(radius * Math.PI) * (.19 + .09 * Math.cos(along * 9))
    + Math.sin(along * 22 + radius * 5) * .018 * radius + (bottom ? -.10 : .08);
  return [x, y, z];
}

function wingSampler(group) {
  const samples = 1024;
  const cumulative = [0];
  const root = [.07, group > 1 ? -.08 : .15];
  let previous = wingPoint(group, 1, 0);
  for (let step = 1; step <= samples; step += 1) {
    const point = wingPoint(group, 1, step / samples);
    const area = Math.abs((previous[0] - root[0] * (group % 2 ? 1 : -1)) * (point[1] - root[1])
      - (point[0] - root[0] * (group % 2 ? 1 : -1)) * (previous[1] - root[1]));
    cumulative.push(cumulative.at(-1) + area);
    previous = point;
  }
  return (fraction) => {
    const target = fraction * cumulative.at(-1);
    let low = 0;
    let high = samples;
    while (low + 1 < high) {
      const mid = low + high >> 1;
      if (cumulative[mid] < target) low = mid;
      else high = mid;
    }
    return (low + (target - cumulative[low]) / Math.max(1e-9, cumulative[high] - cumulative[low])) / samples;
  };
}

export function makeButterfly(particleCount) {
  // Line endpoints follow the same surface as the particles; no solid fabric
  // mesh or point indices are needed, including at the million-particle setting.
  const threads = [];
  const add = (group, radius, along) => threads.push({ group, radius, along, point: wingPoint(group, radius, along) });
  for (let group = 0; group < 4; group += 1) {
    for (const radius of [.42, .68, .86, .96, 1]) {
      for (let step = 0; step < 260; step += 1) {
        add(group, radius, step / 260);
        add(group, radius, (step + 1) / 260);
      }
    }
    for (let vein = 0; vein < 22; vein += 1) {
      const along = (vein + .5) / 22;
      for (let step = 0; step < 52; step += 1) {
        add(group, .08 + step / 52 * .9, along);
        add(group, .08 + (step + 1) / 52 * .9, along);
      }
    }
  }
  const vertices = particleCount + threads.length;
  const positions = new Float32Array(vertices * 3);
  const seeds = new Float32Array(vertices * 3);
  const uvs = new Float32Array(vertices * 2);
  const perWing = Math.floor(particleCount * .235);
  const wingCount = perWing * 4;
  const bodyEnd = Math.floor(particleCount * .985);
  const samplers = [0, 1, 2, 3].map(wingSampler);
  const strandSamples = 256;
  function write(index, point, radius, along, group, strand) {
    positions.set(point, index * 3);
    seeds.set([hash(index + 1), hash(strand + 41), group], index * 3);
    uvs.set([radius, along], index * 2);
  }
  for (let index = 0; index < particleCount; index += 1) {
    if (index < wingCount) {
      const group = Math.floor(index / perWing);
      const local = index % perWing;
      const strand = Math.floor(local / strandSamples);
      const along = samplers[group]((strand + .5) / Math.ceil(perWing / strandSamples));
      const radius = .045 + Math.sqrt((local % strandSamples + .5) / strandSamples) * .955;
      const point = wingPoint(group, radius, along);
      point[2] += (hash(index + 23) - .5) * .014;
      write(index, point, radius, along, group, strand);
    } else if (index < bodyEnd) {
      const along = (index - wingCount) / (bodyEnd - wingCount);
      const angle = hash(index) * Math.PI * 2;
      const radius = .015 + Math.pow(Math.sin(along * Math.PI), .7) * .035;
      write(index, [Math.cos(angle) * radius, -.64 + along * 1.12, .13 + Math.sin(angle) * radius], along, angle, 4, index % 32);
    } else {
      const along = (index - bodyEnd) / (particleCount - bodyEnd);
      const side = along < .5 ? -1 : 1;
      const t = along * 2 % 1;
      const point = [side * (.03 + t * .38 + Math.sin(t * Math.PI) * .08 - Math.pow(t, 6) * .12), .43 + t * .48 + Math.sin(t * Math.PI) * .08, .13 + Math.cos(t * Math.PI) * .025];
      point[0] += (hash(index) - .5) * .008;
      write(index, point, t, along, 5, index % 20);
    }
  }
  threads.forEach((thread, offset) => write(particleCount + offset, thread.point, thread.radius, thread.along, thread.group, offset >> 1));
  return { positions, seeds, uvs, particleCount, threadCount: threads.length };
}
