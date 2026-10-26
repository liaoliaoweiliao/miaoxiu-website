import { sampleMotif } from './particleModel.js';

const vertex = `
attribute vec3 aFrom; attribute vec3 aTo;
attribute vec3 aColorFrom; attribute vec3 aColorTo;
uniform float uMorph, uScatter, uTime, uAspect, uDpr, uSize, uSeed;
uniform vec2 uRotation, uPointer;
varying vec3 vColor; varying float vAlpha;
float hash(float n) { return fract(sin(n * 127.1 + uSeed) * 43758.5453); }
void main() {
  float id = aId;
  vec3 p = mix(aFrom, aTo, uMorph);
  float theta = hash(id + 1.0) * 6.28318;
  float phi = acos(hash(id + 2.0) * 2.0 - 1.0);
  vec3 cloud = vec3(sin(phi)*cos(theta), cos(phi), sin(phi)*sin(theta)) * (1.1 + hash(id+3.0)*1.5);
  p = mix(p, cloud, min(.94, uScatter));
  p.z += sin(uTime*.65 + id*.12) * .035;
  p.xy += vec2(sin(uTime*.4+id),cos(uTime*.35+id)) * .008;
  vec2 away = p.xy - uPointer * 1.4;
  p.xy += normalize(away + vec2(.001)) * exp(-dot(away,away)*9.0) * .16;
  float cy=cos(uRotation.x), sy=sin(uRotation.x), cx=cos(uRotation.y), sx=sin(uRotation.y);
  p = vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
  p = vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);
  float perspective = 3.6 / (3.6-p.z);
  gl_Position = vec4(p.x * perspective * uSize/uAspect, p.y*perspective*uSize, p.z*.06, 1.0);
  gl_PointSize = (1.7 + hash(id+4.0)*1.5) * uDpr * perspective;
  vColor = mix(aColorFrom,aColorTo,uMorph) * 1.45;
  vAlpha = .8 + .2*sin(uTime*.8 + id);
}`;

const fragment = `precision mediump float; varying vec3 vColor; varying float vAlpha;
void main() { float d=length(gl_PointCoord-vec2(.5))*2.0; if(d>1.0)discard;
  float alpha=(exp(-d*d*3.0)-.0498)*vAlpha; gl_FragColor=vec4(vColor,alpha); }`;

export async function createParticleRenderer(canvas, urls, onLost) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power', preserveDrawingBuffer: true });
  if (!gl) throw new Error('此浏览器无法显示三维粒子，已显示原图');
  const buffers = [], shaders = [];
  let program;
  const lost = (event) => { event.preventDefault(); onLost(); };
  function dispose() {
    canvas.removeEventListener('webglcontextlost', lost);
    buffers.forEach(buffer => gl.deleteBuffer(buffer));
    shaders.forEach(shader => gl.deleteShader(shader));
    if (program) gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
  try {
    const count = matchMedia('(max-width: 640px)').matches ? 6500 : 12000;
    const motifs = await Promise.all(urls.map(async (url, index) => {
      const image = new Image(); image.src = url; await image.decode();
      const sampler = document.createElement('canvas'); sampler.width = sampler.height = 240;
      const context = sampler.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, 240, 240);
      return sampleMotif(context.getImageData(0, 0, 240, 240).data, 240, 240, count, 37 + index);
    }));
    program = gl.createProgram();
    for (const [type, source] of [[gl.VERTEX_SHADER, 'attribute float aId;\n' + vertex], [gl.FRAGMENT_SHADER, fragment]]) {
      const shader = gl.createShader(type); shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('三维粒子暂不可用，已显示原图');
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('三维粒子暂不可用，已显示原图');
    gl.useProgram(program);
    function attribute(name, values, size) {
      const buffer = gl.createBuffer(); buffers.push(buffer); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW);
      const location = gl.getAttribLocation(program, name); gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    }
    attribute('aFrom', motifs[0].positions, 3); attribute('aTo', motifs[1].positions, 3);
    attribute('aColorFrom', motifs[0].colors, 3); attribute('aColorTo', motifs[1].colors, 3);
    attribute('aId', Float32Array.from({ length: count }, (_, i) => i), 1);
    const uniform = Object.fromEntries(['Morph','Scatter','Time','Aspect','Dpr','Size','Seed','Rotation','Pointer'].map(key => [key,gl.getUniformLocation(program,`u${key}`)]));
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); gl.clearColor(0,0,0,0);
    canvas.addEventListener('webglcontextlost', lost);
    return {
      count, dispose,
      draw({ morph, scatter, time, rotation, pointer, seed }) {
        const width=canvas.clientWidth, height=canvas.clientHeight, dpr=Math.min(devicePixelRatio || 1,2);
        if (!width || !height || gl.isContextLost()) return;
        if (canvas.width !== Math.round(width*dpr) || canvas.height !== Math.round(height*dpr)) { canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr); }
        gl.viewport(0,0,canvas.width,canvas.height); gl.clear(gl.COLOR_BUFFER_BIT);
        for (const [key,value] of Object.entries({Morph:morph,Scatter:scatter,Time:time,Aspect:width/height,Dpr:dpr,Size:Math.min(.66,width/height*.66),Seed:seed})) gl.uniform1f(uniform[key], value);
        gl.uniform2f(uniform.Rotation,rotation.x,rotation.y); gl.uniform2f(uniform.Pointer,pointer.x,pointer.y);
        gl.drawArrays(gl.POINTS,0,count);
      },
    };
  } catch (error) { dispose(); throw error; }
}
