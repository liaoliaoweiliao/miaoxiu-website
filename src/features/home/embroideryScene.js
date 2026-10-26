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
uniform float uMotion;
varying vec2 vUv;
varying float vLight;
varying float vSeed;
void main() {
  float t = uTime * uMotion;
  vec3 p = aPosition;
  p.z += sin(aUv.x * 25.0 + aUv.y * 9.0 + t * 0.9) * 0.035 * aUv.y;
  p.x += sin(t * 0.6 + aUv.y * 6.0) * 0.025 * aUv.y;
  float s = uScatter;
  float angle = aUv.x * 6.28318 + t * 0.15 + aUv.y * 4.5;
  float radius = 0.35 + aUv.y * 1.1 + sin(aUv.x * 17.0 + aUv.y * 12.0) * 0.12;
  vec3 cloud = vec3(cos(angle) * radius, sin(aUv.x * 12.56 + aUv.y * 7.0 + t * 0.4) * 0.48 + (aUv.y - 0.5) * 0.8, sin(angle) * radius * 0.65);
  cloud += (aSeed - 0.5) * 0.19;
  p = mix(p, cloud, s);
  p.y += sin(angle * 2.0 + t * 0.6) * s * 0.16;
  float yaw = uRotation.x;
  float pitch = uRotation.y;
  p.xz = mat2(cos(yaw), -sin(yaw), sin(yaw), cos(yaw)) * p.xz;
  p.yz = mat2(cos(pitch), -sin(pitch), sin(pitch), cos(pitch)) * p.yz;
  float depth = 4.0 - p.z;
  float zoom = min(uAspect, 1.25) * 2.6;
  gl_Position = vec4(p.x * zoom / uAspect, p.y * zoom, 0.0, depth);
  gl_PointSize = clamp((2.0 + aSeed.z * 1.5) * uDpr * 2.6 / depth, 1.0, 4.0 * uDpr);
  vUv = aUv;
  vLight = (0.55 + 0.45 * aSeed.y) * (1.0 - s * 0.2);
  vSeed = aSeed.z;
}`;

const fragmentShader = `
precision highp float;
uniform vec3 uColour;
uniform float uScatter;
uniform float uLines;
varying vec2 vUv;
varying float vLight;
varying float vSeed;
void main() {
  float dotAlpha = 1.0;
  if (uLines < 0.5) {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    dotAlpha = 1.0 - d * d;
  }
  vec2 tile = vec2(fract(vUv.x * 7.0) - 0.5, fract(vUv.y * 4.0) - 0.5);
  float angle = atan(tile.y, tile.x);
  float petal = 0.24 + 0.095 * cos(angle * 6.0);
  float flower = 1.0 - smoothstep(0.015, 0.052, abs(length(tile) - petal));
  float border = 1.0 - smoothstep(0.025, 0.048, abs(vUv.y - 0.91));
  border += 1.0 - smoothstep(0.015, 0.032, abs(vUv.y - 0.18));
  float diamond = 1.0 - smoothstep(0.035, 0.075, abs(abs(tile.x) + abs(tile.y) - 0.42));
  vec3 cyan = vec3(0.31, 0.94, 0.92);
  vec3 pink = mix(vec3(1.0, 0.31, 0.73), uColour, 0.28);
  vec3 colour = uColour * (0.48 + 0.3 * vSeed);
  colour = mix(colour, pink, flower * 0.9);
  colour = mix(colour, cyan, clamp(border + diamond * 0.45, 0.0, 1.0));
  float alpha = dotAlpha * vLight * mix(0.85, 0.52, uScatter);
  if (uLines > 1.5) alpha *= 0.19 * (1.0 - uScatter);
  else if (uLines > 0.5) alpha *= mix(0.19, 0.08, uScatter);
  gl_FragColor = vec4(colour, alpha);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const detail = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Embroidery shader unavailable: ${detail}`);
  }
  return shader;
}

// A cape-like open surface, not a scan or reconstruction of a museum object.
function makeCloth() {
  const positions = [];
  const seeds = [];
  const uvs = [];
  const columns = 300;
  const rows = 180;
  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows;
    for (let col = 0; col <= columns; col += 1) {
      const u = col / columns;
      const angle = 0.25 + u * (Math.PI * 2 - 0.5);
      const fold = Math.sin(angle * 9 + v * 4) * v * 0.085;
      const radius = 0.19 + Math.sin(v * Math.PI * 0.52) * 1.03 + fold;
      const x = Math.sin(angle) * radius;
      const y = 0.96 - v * (1.8 - Math.abs(Math.sin(angle)) * 0.66);
      const z = Math.cos(angle) * radius * 0.52 + fold;
      positions.push(x, y, z);
      // Stable pseudo-random seeds keep the same particles through a full cycle.
      const hash = (n) => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };
      const index = row * (columns + 1) + col;
      seeds.push(hash(index + 1), hash(index + 37), hash(index + 91));
      uvs.push(u, v);
    }
  }
  const triangles = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const index = row * (columns + 1) + col;
      const nextRow = index + columns + 1;
      triangles.push(index, nextRow, index + 1, index + 1, nextRow, nextRow + 1);
    }
  }
  const lines = [];
  for (let row = 0; row < rows; row += 6) {
    for (let col = 0; col < columns; col += 2) {
      const index = row * (columns + 1) + col;
      lines.push(index, index + 2);
      if (col % 12 === 0) lines.push(index, index + (columns + 1) * 6);
    }
  }
  return { positions: new Float32Array(positions), seeds: new Float32Array(seeds), uvs: new Float32Array(uvs), lines: new Uint16Array(lines), triangles: new Uint16Array(triangles) };
}

export function createEmbroideryScene(canvas, settings, onReady) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
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
  let rotation = -0.32;
  let resetSerial = settings.current.resetSerial;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => motionPreference.matches;
  const dispose = () => {
    destroyed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    resizeObserver?.disconnect();
    document.removeEventListener('visibilitychange', wake);
    motionPreference.removeEventListener('change', wake);
    buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    if (program) gl.deleteProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
  };

  function wake() {
    previous = 0;
    if (!destroyed && visible && !document.hidden && !frame) frame = requestAnimationFrame(draw);
  }

  function draw(now) {
    frame = 0;
    if (destroyed || !visible || document.hidden || gl.isContextLost()) return;
    const state = settings.current;
    if (state.resetSerial !== resetSerial) {
      resetSerial = state.resetSerial;
      rotation = -0.32;
      time = 0;
    }
    const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
    previous = now;
    if (!state.paused && !reduced()) {
      time += delta;
      rotation += delta * 0.12;
    }
    scatter = reduced() ? state.scatter : scatter + (state.scatter - scatter) * Math.min(1, delta * 4.5);
    if (Math.abs(scatter - state.scatter) < 0.001) scatter = state.scatter;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform1f(uniforms.uTime, time);
    gl.uniform1f(uniforms.uMotion, reduced() ? 0 : 1);
    gl.uniform1f(uniforms.uScatter, scatter);
    gl.uniform2f(uniforms.uRotation, rotation + state.yaw, 0.07 + state.pitch);
    gl.uniform1f(uniforms.uAspect, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    gl.uniform1f(uniforms.uDpr, Math.min(window.devicePixelRatio || 1, 1.75));
    gl.uniform3fv(uniforms.uColour, state.colour);
    gl.uniform1f(uniforms.uLines, 2);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.drawElements(gl.TRIANGLES, cloth.triangles.length, gl.UNSIGNED_SHORT, 0);
    gl.uniform1f(uniforms.uLines, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineBuffer);
    gl.drawElements(gl.LINES, cloth.lines.length, gl.UNSIGNED_SHORT, 0);
    gl.uniform1f(uniforms.uLines, 0);
    gl.drawArrays(gl.POINTS, 0, cloth.positions.length / 3);
    // Static views draw only on input, resize, visibility or preference changes.
    if ((!state.paused && !reduced()) || scatter !== state.scatter) frame = requestAnimationFrame(draw);
  }

  let uniforms;
  let cloth;
  let lineBuffer;
  let triangleBuffer;
  try {
    shaders.push(compile(gl, gl.VERTEX_SHADER, vertexShader));
    shaders.push(compile(gl, gl.FRAGMENT_SHADER, fragmentShader));
    program = gl.createProgram();
    shaders.forEach((shader) => gl.attachShader(program, shader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`Embroidery program unavailable: ${gl.getProgramInfoLog(program)}`);
    gl.useProgram(program);
    cloth = makeCloth();
    for (const [name, data, size] of [['aPosition', cloth.positions, 3], ['aSeed', cloth.seeds, 3], ['aUv', cloth.uvs, 2]]) {
      const buffer = gl.createBuffer();
      buffers.push(buffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    }
    lineBuffer = gl.createBuffer();
    buffers.push(lineBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cloth.lines, gl.STATIC_DRAW);
    triangleBuffer = gl.createBuffer();
    buffers.push(triangleBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cloth.triangles, gl.STATIC_DRAW);
    uniforms = Object.fromEntries(['uTime', 'uScatter', 'uRotation', 'uAspect', 'uDpr', 'uMotion', 'uColour', 'uLines'].map((name) => [name, gl.getUniformLocation(program, name)]));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
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
  } catch (error) {
    dispose();
    throw error;
  }
}
