import { sampleSilk } from './particleModel.js';
import { assetUrl } from '../../utils/assets.js';

const vertex=`
attribute vec3 aFrom,aTo,aColorFrom,aColorTo,aFiber,aFiberTo;
attribute float aId;
uniform float uMorph,uScatter,uTime,uAspect,uDpr,uSize,uSeed,uCount,uDensity,uExposure;
uniform vec2 uRotation,uPointer;
varying vec3 vColor;varying float vAngle,vPhase,vOpacity;
float hash(float n){return fract(sin(n*127.1+uSeed)*43758.5453);}
void main(){
  float id=aId;vec3 fiber=mix(aFiber,aFiberTo,uMorph);vec3 p=mix(aFrom,aTo,uMorph);
  float lane=mod(id,2.0),travel=fract(id/uCount+uTime*.045+uSeed*.001);
  float winding=travel*31.4159+lane*3.14159;
  float radius=.65+hash(id+3.0)*.7;
  vec3 braid=vec3(cos(winding)*radius,(travel-.5)*3.1,sin(winding)*radius);
  braid.x+=sin(travel*9.0+uTime*.2)*.3;
  p=mix(p,braid,min(.9,uScatter));
  p.z+=sin(p.x*24.0+p.y*9.0+uTime*.7+fiber.z)*.027;
  p.xy+=vec2(sin(uTime*.4+id),cos(uTime*.35+id))*.002;
  vec2 away=p.xy-uPointer*1.4;
  p.xy+=normalize(away+vec2(.001))*exp(-dot(away,away)*9.0)*.16;
  float cy=cos(uRotation.x),sy=sin(uRotation.x),cx=cos(uRotation.y),sx=sin(uRotation.y);
  p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
  p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);
  float perspective=3.6/(3.6-p.z);
  gl_Position=vec4(p.x*perspective*uSize/uAspect,p.y*perspective*uSize,p.z*.06,1.0);
  gl_PointSize=max(1.6,(3.1+fiber.y*2.0)*uDensity)*uDpr*perspective;
  vec3 color=mix(aColorFrom,aColorTo,uMorph);
  if(color.b>color.r*1.4&&color.r<.3)color=mix(color,vec3(.13,.25,.7),.34);
  if(color.g>color.r*1.45&&color.b>color.r*1.5&&color.g>.25)color=mix(color,vec3(.55,.22,.8),.72);
  color=mix(color,vec3(.56,.25,.84),uScatter*.28*lane);
  vColor=color*1.25;vAngle=fiber.x+sin(uTime*.45+fiber.z)*.11;
  vPhase=fiber.z;vOpacity=(.7+.3*sin(uTime*.6+id))*.7*uDensity*uExposure;
}`;
const fragment=`precision mediump float;
varying vec3 vColor;varying float vAngle,vPhase,vOpacity;
void main(){
  vec2 uv=gl_PointCoord-vec2(.5);float c=cos(vAngle),s=sin(vAngle);
  vec2 thread=vec2(uv.x*c+uv.y*s,-uv.x*s+uv.y*c);
  float taper=1.0-smoothstep(.31,.49,abs(thread.x));
  float center=exp(-pow(thread.y/.055,2.0));
  float fibers=exp(-pow((thread.y-.08)/.025,2.0))+exp(-pow((thread.y+.08)/.025,2.0));
  float twist=.72+.28*cos(thread.x*100.0+vPhase);
  float glow=exp(-dot(uv,uv)*17.0)*.025;
  float alpha=((center+fibers*.22)*taper*twist+glow)*vOpacity;
  if(alpha<.004)discard;gl_FragColor=vec4(vColor,alpha);
}`;

export async function createParticleRenderer(canvas,sources,onLost,{count=200000,signal}={}) {
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
  if(!gl)throw new Error('此浏览器无法显示三维丝线，已显示原图');
  const buffers=[],shaders=[];let program,disposed=false;
  const lost=event=>{event.preventDefault();onLost();};
  function dispose(){if(disposed)return;disposed=true;signal?.removeEventListener('abort',dispose);canvas.removeEventListener('webglcontextlost',lost);buffers.forEach(b=>gl.deleteBuffer(b));shaders.forEach(s=>gl.deleteShader(s));if(program)gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}
  signal?.addEventListener('abort',dispose,{once:true});
  if(signal?.aborted){dispose();throw new Error('渲染请求已取消');}
  try{
    const motifs=await Promise.all(sources.map(async(source,index)=>{
      const image=new Image();image.src=assetUrl(source.image);await image.decode();
      const sampler=document.createElement('canvas');sampler.width=sampler.height=512;
      const ctx=sampler.getContext('2d',{willReadFrequently:true}),crop=source.crop||[0,0,image.naturalWidth,image.naturalHeight];
      const scale=Math.min(512/crop[2],512/crop[3]),w=crop[2]*scale,h=crop[3]*scale;
      if(source.mask){ctx.beginPath();source.mask.forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo']((512-w)/2+x*w,(512-h)/2+y*h));ctx.closePath();ctx.clip();}
      ctx.drawImage(image,...crop,(512-w)/2,(512-h)/2,w,h);
      return sampleSilk(ctx.getImageData(0,0,512,512).data,512,512,count,37+index);
    }));
    if(disposed)throw new Error('渲染请求已取消');
    program=gl.createProgram();
    for(const[type,source]of[[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
      const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('三维丝线暂不可用，已显示原图');
      gl.attachShader(program,shader);
    }
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('三维丝线暂不可用，已显示原图');gl.useProgram(program);
    function attribute(name,values,size){const buffer=gl.createBuffer();buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,values,gl.STATIC_DRAW);const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,0,0);}
    attribute('aFrom',motifs[0].positions,3);attribute('aTo',motifs[1].positions,3);
    attribute('aColorFrom',motifs[0].colors,3);attribute('aColorTo',motifs[1].colors,3);attribute('aFiber',motifs[0].fibers,3);attribute('aFiberTo',motifs[1].fibers,3);
    attribute('aId',Float32Array.from({length:count},(_,i)=>i),1);
    const uniform=Object.fromEntries(['Morph','Scatter','Time','Aspect','Dpr','Size','Seed','Count','Density','Exposure','Rotation','Pointer'].map(key=>[key,gl.getUniformLocation(program,`u${key}`)]));
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.clearColor(0,0,0,0);canvas.addEventListener('webglcontextlost',lost);
    return {count,dispose,draw({morph,scatter,time,rotation,pointer,seed}){
      const width=canvas.clientWidth,height=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,1.5);
      if(!width||!height||gl.isContextLost())return;
      if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
      gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT);
      for(const[key,value]of Object.entries({Morph:morph,Scatter:scatter,Time:time,Aspect:width/height,Dpr:dpr,Size:Math.min(.66,width/height*.66),Seed:seed,Count:count,Density:Math.max(.4,Math.sqrt(200000/count)),Exposure:Math.min(1,Math.max(.17,Math.pow(Math.min(width,height)/780,1.6)))}))gl.uniform1f(uniform[key],value);
      gl.uniform2f(uniform.Rotation,rotation.x,rotation.y);gl.uniform2f(uniform.Pointer,pointer.x,pointer.y);gl.drawArrays(gl.POINTS,0,count);
    }};
  }catch(error){dispose();throw error;}
}
