import { sampleSilk } from './particleModel.js';
import { assetUrl } from '../../utils/assets.js';

const vertex=`
attribute vec3 aFrom,aTo,aColorFrom,aColorTo,aFiber,aFiberTo;
attribute float aId,aAlong;
uniform float uMorph,uScatter,uTime,uAspect,uDpr,uSize,uSeed,uCount,uDensity,uExposure,uSourceForm,uTargetForm,uProgress,uLinePass;
uniform vec2 uRotation,uPointer;
varying vec3 vColor;varying float vAngle,vPhase,vOpacity;
float hash(float n){return fract(sin(n*127.1+uSeed)*43758.5453);}
void main(){
  float id=aId;
  float q=clamp(uProgress,0.0,1.0),envelope=sin(q*3.14159265);
  float bead=hash(id+11.0);
  float along=uLinePass>.5?aAlong:(bead<.42?0.0:bead>.58?1.0:(bead-.42)/.16);
  float lead=smoothstep(0.0,.62,q),tail=smoothstep(.38,1.0,q);
  float travelAlong=mix(tail,lead,along);
  float morph=mix(uSourceForm,uTargetForm,travelAlong);
  vec3 fiber=mix(aFiber,aFiberTo,morph);
  vec3 source=mix(aFrom,aTo,uSourceForm),target=mix(aFrom,aTo,uTargetForm);
  vec3 p=mix(source,target,travelAlong);
  // Leading stitches pull ahead while the tail remains attached to the old object.
  // These are real continuous polylines, with the point fibers following the same path.
  float bundle=floor(mod(id,96.0));
  p.x+=envelope*(along-.5)*2.4;
  p.y+=envelope*sin(along*3.14159)*(sin(bundle*.31+along*8.0+uTime*.4)*.1+cos(bundle*.13)*.18);
  p.z+=envelope*sin(along*9.0+bundle*.3)*.46;
  float lane=mod(id,2.0),travel=fract(id/uCount+uTime*.045+uSeed*.001);
  float winding=travel*31.4159+lane*3.14159;
  float radius=.65+hash(id+3.0)*.7;
  vec3 braid=vec3(cos(winding)*radius,(travel-.5)*3.1,sin(winding)*radius);
  braid.x+=sin(travel*9.0+uTime*.2)*.3;
  p=mix(p,braid,min(.18,uScatter*.2));
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
  vec3 color=mix(aColorFrom,aColorTo,morph);
  if(color.b>color.r*1.4&&color.r<.3)color=mix(color,vec3(.13,.25,.7),.34);
  if(color.g>color.r*1.45&&color.b>color.r*1.5&&color.g>.25)color=mix(color,vec3(.55,.22,.8),.72);
  color=mix(color,vec3(.56,.25,.84),uScatter*.28*lane);
  vColor=color*1.08;vAngle=fiber.x+sin(uTime*.45+fiber.z)*.11;
  vPhase=fiber.z;vOpacity=(.7+.3*sin(uTime*.6+id))*.7*uDensity*uExposure;
  if(uLinePass<.5&&bead>.42&&bead<.58)vOpacity*=1.0-envelope*.8;
  if(uLinePass>.5){
    float family=mod(bundle,5.0);
    vec3 silkColor=family<1.0?vec3(.86,.19,.3):family<2.0?vec3(.84,.62,.28):family<3.0?vec3(.8,.83,.9):family<4.0?vec3(.58,.32,.83):vec3(.22,.32,.7);
    vColor=mix(vColor,silkColor,.42);
    vOpacity=pow(max(0.0,envelope),.7)*.09*uExposure*(.65+.35*sin(along*70.0+fiber.z));
  }
}`;
const fragment=`precision mediump float;
varying vec3 vColor;varying float vAngle,vPhase,vOpacity;
uniform highp float uLinePass;
void main(){
  if(uLinePass>.5){gl_FragColor=vec4(vColor,vOpacity);return;}
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

export async function createParticleRenderer(canvas,sources,onLost,{count=200000,signal,previousSource=null,initialTarget=0}={}) {
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
  if(!gl)throw new Error('此浏览器无法显示三维丝线，已显示原图');
  const buffers=[],shaders=[];let program,disposed=false;
  const lost=event=>{event.preventDefault();onLost();};
  function dispose(){if(disposed)return;disposed=true;signal?.removeEventListener('abort',dispose);canvas.removeEventListener('webglcontextlost',lost);buffers.forEach(b=>gl.deleteBuffer(b));shaders.forEach(s=>gl.deleteShader(s));if(program)gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}
  signal?.addEventListener('abort',dispose,{once:true});
  if(signal?.aborted){dispose();throw new Error('渲染请求已取消');}
  try{
    const motifs=await Promise.all((previousSource?[...sources,previousSource]:sources).map(async(source,index)=>{
      const image=new Image();image.src=assetUrl(source.image);await image.decode();
      const sampler=document.createElement('canvas');sampler.width=sampler.height=512;
      const ctx=sampler.getContext('2d',{willReadFrequently:true}),crop=source.crop||[0,0,image.naturalWidth,image.naturalHeight];
      const scale=Math.min(512/crop[2],512/crop[3]),w=crop[2]*scale,h=crop[3]*scale;
      if(source.mask){ctx.beginPath();source.mask.forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo']((512-w)/2+x*w,(512-h)/2+y*h));ctx.closePath();ctx.clip();}
      ctx.drawImage(image,...crop,(512-w)/2,(512-h)/2,w,h);
      const samples=sampleSilk(ctx.getImageData(0,0,512,512).data,512,512,count,37+index);
      // Keep neighbouring stitches together instead of linking random pixels across the image.
      const keys=Float32Array.from({length:count},(_,i)=>Math.floor((samples.positions[i*3+1]+1.4)*24)*10000+samples.positions[i*3]*1000);
      const order=Uint32Array.from({length:count},(_,i)=>i).sort((a,b)=>keys[a]-keys[b]);
      return Object.fromEntries(Object.entries(samples).map(([key,data])=>{
        const sorted=new Float32Array(data.length);for(let i=0;i<count;i++)sorted.set(data.subarray(order[i]*3,order[i]*3+3),i*3);return [key,sorted];
      }));
    }));
    if(disposed)throw new Error('渲染请求已取消');
    let previous=previousSource?motifs.pop():null;
    program=gl.createProgram();
    for(const[type,source]of[[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
      const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('三维丝线暂不可用，已显示原图');
      gl.attachShader(program,shader);
    }
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('三维丝线暂不可用，已显示原图');gl.useProgram(program);
    const locations=Object.fromEntries(['aFrom','aTo','aColorFrom','aColorTo','aFiber','aFiberTo','aId','aAlong'].map(name=>[name,gl.getAttribLocation(program,name)]));
    function buffer(values){const result=gl.createBuffer();buffers.push(result);gl.bindBuffer(gl.ARRAY_BUFFER,result);gl.bufferData(gl.ARRAY_BUFFER,values,gl.STATIC_DRAW);return result;}
    function attributes(from,to){return {aFrom:from.positions,aTo:to.positions,aColorFrom:from.colors,aColorTo:to.colors,aFiber:from.fibers,aFiberTo:to.fibers};}
    const pointAttributes={...attributes(previous||motifs[0],previous?motifs[initialTarget]:motifs[1]),aId:Float32Array.from({length:count},(_,i)=>i)};
    const pointBuffers=Object.fromEntries(Object.entries(pointAttributes).map(([name,data])=>[name,buffer(data)]));
    const strands=6000,segments=20,lineCount=strands*segments*2;
    const lineArrays=Object.fromEntries(Object.keys(pointAttributes).map(name=>[name,new Float32Array(lineCount*(name==='aId'?1:3))]));
    lineArrays.aAlong=new Float32Array(lineCount);
    function fillLines(){for(let strand=0;strand<strands;strand++) {
      const id=Math.floor(strand*count/strands);
      for(let segment=0;segment<segments;segment++)for(let end=0;end<2;end++) {
        const index=(strand*segments+segment)*2+end;
        lineArrays.aAlong[index]=(segment+end)/segments;lineArrays.aId[index]=id;
        for(const name of Object.keys(pointAttributes))if(name!=='aId')lineArrays[name].set(pointAttributes[name].subarray(id*3,id*3+3),index*3);
      }
    }
    }
    fillLines();
    const lineBuffers=Object.fromEntries(Object.entries(lineArrays).map(([name,data])=>[name,buffer(data)]));
    function restoreCanonical() {
      Object.assign(pointAttributes,attributes(motifs[0],motifs[1]));fillLines();
      for(const [name,data] of Object.entries(pointAttributes)){gl.bindBuffer(gl.ARRAY_BUFFER,pointBuffers[name]);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);}
      for(const [name,data] of Object.entries(lineArrays)){gl.bindBuffer(gl.ARRAY_BUFFER,lineBuffers[name]);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);}
      previous=null;
    }
    function bind(attributes) {
      for(const [name,location]of Object.entries(locations)) {
        if(location<0)continue;
        if(!attributes[name]){gl.disableVertexAttribArray(location);gl.vertexAttrib1f(location,.5);continue;}
        gl.bindBuffer(gl.ARRAY_BUFFER,attributes[name]);gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location,name==='aId'||name==='aAlong'?1:3,gl.FLOAT,false,0,0);
      }
    }
    const uniform=Object.fromEntries(['Morph','SourceForm','TargetForm','Progress','LinePass','Scatter','Time','Aspect','Dpr','Size','Seed','Count','Density','Exposure','Rotation','Pointer'].map(key=>[key,gl.getUniformLocation(program,`u${key}`)]));
    gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);canvas.addEventListener('webglcontextlost',lost);
    return {count,dispose,draw({morph,from=0,target=1,progress=1,scatter,time,rotation,pointer,seed}){
      const width=canvas.clientWidth,height=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,1.5);
      if(!width||!height||gl.isContextLost())return;
      if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
      if(previous&&(target!==initialTarget||progress>=.995))restoreCanonical();
      const sourceForm=previous?0:from,targetForm=previous?1:target;
      gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT);
      for(const[key,value]of Object.entries({Morph:morph,SourceForm:sourceForm,TargetForm:targetForm,Progress:progress,Scatter:scatter,Time:time,Aspect:width/height,Dpr:dpr,Size:Math.min(.66,width/height*.66),Seed:seed,Count:count,Density:Math.max(.4,Math.sqrt(200000/count)),Exposure:Math.min(1,Math.max(.17,Math.pow(Math.min(width,height)/780,1.6)))}))gl.uniform1f(uniform[key],value);
      gl.uniform2f(uniform.Rotation,rotation.x,rotation.y);gl.uniform2f(uniform.Pointer,pointer.x,pointer.y);gl.uniform1f(uniform.LinePass,0);bind(pointBuffers);gl.drawArrays(gl.POINTS,0,count);
      if(progress>.005&&progress<.995){gl.uniform1f(uniform.LinePass,1);bind(lineBuffers);gl.drawArrays(gl.LINES,0,lineCount);}
      canvas.dataset.connecting=previous?'true':'false';canvas.dataset.pull=progress.toFixed(3);canvas.dataset.strands=String(strands);
    }};
  }catch(error){dispose();throw error;}
}
