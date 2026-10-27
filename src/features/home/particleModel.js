export const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));

// Deterministic sampling keeps silhouettes stable across frames and transitions.
export function randomSequence(seed = 37) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

export function sampleMotif(pixels, width, height, count, seed = 37) {
  const random = randomSequence(seed), candidates = [];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const offset = (y * width + x) * 4;
    const [r, g, b, a] = pixels.subarray(offset, offset + 4);
    const light = (r * .2126 + g * .7152 + b * .0722) / 255;
    if (a > 90 && light > .12 && random() < .05 + light ** 2 * .95) candidates.push({ x, y, r, g, b, light });
  }
  if (!candidates.length) throw new Error('纹样图片没有可采样的像素');
  const positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = candidates[Math.floor(random() * candidates.length)], j = i * 3;
    positions[j] = (p.x / width - .5) * 2.7;
    positions[j + 1] = (.5 - p.y / height) * 2.7;
    positions[j + 2] = (p.light - .5) * .2 + (random() - .5) * .15;
    colors.set([p.r / 255, p.g / 255, p.b / 255], j);
  }
  return { positions, colors };
}

export function sampleSilk(pixels,width,height,count,seed=37) {
  const result=sampleMotif(pixels,width,height,count,seed),random=randomSequence(seed+13);
  const fibers=new Float32Array(count*3);
  const light=(x,y)=>{const i=(clamp(y,0,height-1)*width+clamp(x,0,width-1))*4;return pixels[i]+pixels[i+1]+pixels[i+2];};
  for(let i=0;i<count;i++) {
    const j=i*3,x=Math.round((result.positions[j]/2.7+.5)*width),y=Math.round((.5-result.positions[j+1]/2.7)*height);
    const dx=light(x+1,y)-light(x-1,y),dy=light(x,y+1)-light(x,y-1);
    fibers[j]=Math.atan2(dy,dx)+Math.PI/2+(random()-.5)*.25;
    fibers[j+1]=random();fibers[j+2]=random()*Math.PI*2;
    result.positions[j]+=(random()-.5)*2.7/width;
    result.positions[j+1]+=(random()-.5)*2.7/height;
    result.positions[j+2]+=Math.sin(x*.09+y*.13)*.08;
  }
  return {...result,fibers};
}

export function motionSignal(current, previous, width, height) {
  if (!previous || previous.length !== current.length) return { energy: 0, x: 0, y: 0 };
  let total = 0, xSum = 0, ySum = 0;
  for (let i = 0; i < current.length; i++) {
    const change = Math.abs(current[i] - previous[i]);
    if (change < 22) continue;
    const weight = change / 255;
    total += weight; xSum += (i % width) * weight; ySum += Math.floor(i / width) * weight;
  }
  return { energy: clamp(total / (width * height) * 4), x: total ? 1 - xSum / total / width * 2 : 0, y: total ? 1 - ySum / total / height * 2 : 0 };
}

export function soundEnergy(samples) {
  let sum = 0;
  for (const value of samples) sum += ((value - 128) / 128) ** 2;
  return clamp(Math.sqrt(sum / Math.max(1, samples.length)) * 3);
}
