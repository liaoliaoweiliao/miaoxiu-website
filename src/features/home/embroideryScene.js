import { initialRebirthPattern } from '../../data/heritageRebirth.js';
import { makeButterfly } from './butterflyGeometry.js';

const vertexShader = `
precision highp float;
attribute vec3 aPosition;
attribute vec3 aSeed;
attribute vec2 aUv;
uniform float uTime;
uniform float uScatter;
uniform vec2 uRotation;
uniform float uAspect;
uniform float uDpr;
uniform vec4 uInput;
uniform float uRemix;
uniform vec2 uPatternSeeds;
uniform float uPatternMix;
varying vec2 vUv;
varying float vLight;
varying float vSeed;
varying float vGroup;
varying float vAngle;
void main() {
  vec3 p = aPosition;
  float seed = mix(uPatternSeeds.x, uPatternSeeds.y, uPatternMix);
  float energy = uInput.z * .5 + uInput.w;
  float wing = 1.0 - step(3.5, aSeed.z);
  float reach = abs(p.x);
  float flutter = sin(uTime * .72 + aUv.y * 1.5) * .11;
  p.z += wing * reach * (flutter + sin(aUv.x * 18.0 - uTime * .9 + seed) * (.012 + energy * .06));
  p.y += wing * sin(aUv.x * 12.0 + seed * .3) * aUv.x * .012;
  p.x *= 1.0 - wing * abs(flutter) * .12;
  p.y += sin(uTime * .4) * .018;
  float angle = aUv.y * 6.28318 + aSeed.z * 1.8 + uTime * .12;
  float radius = .25 + aUv.x * 1.7;
  vec3 flow = vec3(cos(angle) * radius, sin(angle * 1.5 + uTime * .19) * .65 + (aUv.x - .5) * .9, sin(angle) * radius * .65);
  flow += (aSeed.x - .5) * .06;
  p = mix(p, flow, uScatter);
  p.xy += uInput.xy * uInput.z * (.05 + uScatter * .18);
  p.z += sin(uTime * 1.8 + aUv.x * 28.0) * energy * .045;
  p += (aSeed.x - .5) * uRemix * .035;
  float yaw = uRotation.x;
  float pitch = uRotation.y;
  p.xz = mat2(cos(yaw), -sin(yaw), sin(yaw), cos(yaw)) * p.xz;
  p.yz = mat2(cos(pitch), -sin(pitch), sin(pitch), cos(pitch)) * p.yz;
  float depth = 4.6 - p.z;
  float zoom = min(uAspect, 1.28) * 2.5;
  gl_Position = vec4(p.x * zoom / uAspect, p.y * zoom, 0.0, depth);
  gl_PointSize = clamp((3.0 + aSeed.x * 1.5) * uDpr * 3.5 / depth, 1.0, 5.0 * uDpr);
  vUv = aUv;
  vGroup = aSeed.z;
  vSeed = aSeed.x;
  vAngle = atan(aPosition.y - .1, aPosition.x);
  float travelling = pow(.5 + .5 * sin(aUv.x * 42.0 - uTime * 1.8 + aSeed.y * 6.28), 8.0);
  vLight = (.42 + aSeed.x * .38 + travelling * .24) * (1.0 + uInput.w * .35) * (1.0 - uScatter * .25);
}`;

const fragmentShader = `
precision highp float;
uniform vec3 uColour;
uniform float uScatter;
uniform float uLines;
uniform float uDensity;
uniform vec4 uPatternA;
uniform vec4 uPatternB;
uniform float uPatternMix;
varying vec2 vUv;
varying float vLight;
varying float vSeed;
varying float vGroup;
varying float vAngle;
vec3 embroidery(vec4 pattern) {
  float r = vUv.x;
  float repeat = vUv.y * pattern.z + pattern.w * .15915;
  float rounded = sin(repeat * 6.28318);
  float angular = abs(fract(repeat) * 2.0 - 1.0) * 2.0 - 1.0;
  float scallop = (pattern.y < 1.5 ? rounded : angular) * .035;
  float stripe = r + scallop;
  vec3 red = vec3(.83, .075, .16);
  vec3 indigo = vec3(.16, .25, .56);
  vec3 gold = vec3(.91, .63, .26);
  vec3 silver = vec3(.76, .83, .91);
  vec3 purple = vec3(.48, .24, .69);
  vec3 colour = mix(silver, indigo, smoothstep(.25, .39, stripe));
  colour = mix(colour, red, smoothstep(.39, .46, stripe) * (1.0 - smoothstep(.57, .64, stripe)));
  colour = mix(colour, purple, smoothstep(.62, .69, stripe) * (1.0 - smoothstep(.76, .82, stripe)));
  colour = mix(colour, indigo, smoothstep(.78, .84, stripe));
  colour = mix(colour, silver, smoothstep(.9, .94, stripe));
  colour = mix(colour, gold, smoothstep(.978, .99, r));
  float stitch = pow(.5 + .5 * cos(vUv.y * pattern.z * 6.28318 + r * 7.0), 18.0);
  colour = mix(colour, gold, stitch * smoothstep(.35, .5, r) * .7);
  if (vGroup > 3.5) colour = mix(red, gold, .4 + .35 * sin(r * 60.0));
  if (vGroup > 4.5) colour = silver;
  return mix(colour, colour * (.6 + uColour * .6), .35);
}
void main() {
  float fibre = 1.0;
  if (uLines < .5) {
    vec2 point = gl_PointCoord - .5;
    point = mat2(cos(vAngle), -sin(vAngle), sin(vAngle), cos(vAngle)) * point;
    float distance = length(point * vec2(1.5, 5.5));
    if (distance > 1.0) discard;
    fibre = exp(-distance * distance * 3.5);
  }
  vec3 colour = mix(embroidery(uPatternA), embroidery(uPatternB), smoothstep(.22, .78, uPatternMix));
  float alpha = fibre * vLight * uDensity * .4;
  if (uLines > .5) alpha = .12 * vLight * (1.0 - uScatter * .7);
  gl_FragColor = vec4(colour, alpha);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const detail = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Butterfly shader unavailable: ${detail}`);
  }
  return shader;
}

export function createEmbroideryScene(canvas, settings, onReady, onUnavailable = () => {}) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'high-performance' });
  if (!gl) throw new Error('WebGL unavailable');
  const shaders = [];
  const buffers = [];
  let program;
  let observer;
  let resizeObserver;
  let frame = 0;
  let visible = false;
  let destroyed = false;
  let time = 0;
  let previous = 0;
  let scatter = settings.current.scatter;
  let resetSerial = settings.current.resetSerial;
  let pattern = settings.current.pattern || initialRebirthPattern;
  let oldPattern = pattern;
  let patternSerial = settings.current.patternSerial;
  let remixProgress = 1;
  let geometry;
  let uniforms;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => motionPreference.matches;
  const dispose = () => {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    resizeObserver?.disconnect();
    document.removeEventListener('visibilitychange', wake);
    motionPreference.removeEventListener('change', wake);
    buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    if (program) gl.deleteProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
    geometry = null;
  };
  function wake() {
    if (!destroyed && visible && !document.hidden && !frame) { previous = 0; frame = requestAnimationFrame(draw); }
  }
  function upload(particleCount) {
    const generated = makeButterfly(particleCount);
    for (const [index, data] of [generated.positions, generated.seeds, generated.uvs].entries()) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[index]);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }
    if (gl.getError() !== gl.NO_ERROR) throw new Error('Butterfly buffers unavailable');
    geometry = { particleCount: generated.particleCount, threadCount: generated.threadCount };
    canvas.dataset.particleCount = String(geometry.particleCount);
  }
  function draw(now) {
    frame = 0;
    if (destroyed || !visible || document.hidden || gl.isContextLost()) return;
    const state = settings.current;
    if (geometry.particleCount !== state.particleCount) {
      try { upload(state.particleCount); }
      catch { dispose(); onUnavailable(); return; }
    }
    if (state.resetSerial !== resetSerial) {
      resetSerial = state.resetSerial;
      time = 0;
      pattern = state.pattern;
      oldPattern = pattern;
      remixProgress = 1;
      patternSerial = state.patternSerial;
    }
    if (state.patternSerial !== patternSerial) {
      patternSerial = state.patternSerial;
      oldPattern = pattern;
      pattern = state.pattern;
      remixProgress = state.paused || reduced() ? 1 : 0;
    }
    const delta = previous ? Math.min((now - previous) / 1000, .05) : 0;
    previous = now;
    if (!state.paused && !reduced()) { time += delta; remixProgress = Math.min(1, remixProgress + delta / 3.2); }
    if (reduced()) remixProgress = 1;
    const input = state.paused || reduced() ? { x: 0, y: 0, amount: 0, level: 0 } : state.input;
    const burst = Math.sin(remixProgress * Math.PI);
    const targetScatter = Math.max(state.scatter, burst * .92, Math.min(.82, input.amount * .65 + input.level * .22));
    scatter = reduced() || state.paused ? state.scatter : scatter + (targetScatter - scatter) * Math.min(1, delta * 4.5);
    if (Math.abs(scatter - targetScatter) < .001) scatter = targetScatter;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.useProgram(program);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uniforms.uTime, time);
    gl.uniform1f(uniforms.uScatter, scatter);
    gl.uniform2f(uniforms.uRotation, -.13 + Math.sin(time * .18) * .22 + state.yaw + input.x * input.amount * .35, -.08 + state.pitch + input.y * input.amount * .16);
    gl.uniform4f(uniforms.uInput, input.x, input.y, input.amount, input.level);
    gl.uniform1f(uniforms.uRemix, burst);
    gl.uniform4f(uniforms.uPatternA, oldPattern.primary, oldPattern.secondary, oldPattern.columns, oldPattern.seed);
    gl.uniform4f(uniforms.uPatternB, pattern.primary, pattern.secondary, pattern.columns, pattern.seed);
    gl.uniform2f(uniforms.uPatternSeeds, oldPattern.seed, pattern.seed);
    gl.uniform1f(uniforms.uPatternMix, remixProgress);
    gl.uniform1f(uniforms.uAspect, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    gl.uniform1f(uniforms.uDpr, Math.min(window.devicePixelRatio || 1, 1.5));
    gl.uniform1f(uniforms.uDensity, Math.sqrt(200000 / geometry.particleCount));
    gl.uniform3fv(uniforms.uColour, state.colour);
    gl.uniform1f(uniforms.uLines, 1);
    gl.drawArrays(gl.LINES, geometry.particleCount, geometry.threadCount);
    gl.uniform1f(uniforms.uLines, 0);
    gl.drawArrays(gl.POINTS, 0, geometry.particleCount);
    if (!state.paused && !reduced()) frame = requestAnimationFrame(draw);
  }
  try {
    shaders.push(compile(gl, gl.VERTEX_SHADER, vertexShader));
    shaders.push(compile(gl, gl.FRAGMENT_SHADER, fragmentShader));
    program = gl.createProgram();
    shaders.forEach((shader) => gl.attachShader(program, shader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`Butterfly program unavailable: ${gl.getProgramInfoLog(program)}`);
    gl.useProgram(program);
    for (const [name, size] of [['aPosition', 3], ['aSeed', 3], ['aUv', 2]]) {
      const buffer = gl.createBuffer();
      buffers.push(buffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    }
    upload(settings.current.particleCount);
    uniforms = Object.fromEntries(['uTime', 'uScatter', 'uRotation', 'uAspect', 'uDpr', 'uColour', 'uLines', 'uDensity', 'uInput', 'uRemix', 'uPatternA', 'uPatternB', 'uPatternSeeds', 'uPatternMix'].map((name) => [name, gl.getUniformLocation(program, name)]));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      wake();
    }
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    }, { rootMargin: '80px' });
    observer.observe(canvas);
    document.addEventListener('visibilitychange', wake);
    motionPreference.addEventListener('change', wake);
    resize();
    onReady();
    return { redraw: wake, dispose };
  } catch (error) { dispose(); throw error; }
}
