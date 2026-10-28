import { sampleSilk } from './particleModel.js';
import { assetUrl } from '../../utils/assets.js';

const vertex=`
attribute vec3 aFrom,aTo,aColorFrom,aColorTo,aFiber,aFiberTo;
attribute float aId;attribute vec2 aRibbon;
uniform float uMorph,uScatter,uTime,uAspect,uDpr,uSize,uSeed,uCount,uDensity,uExposure,uSourceForm,uTargetForm,uProgress,uLinePass,uThreadWidth;
uniform vec2 uRotation,uPointer,uViewport;
varying vec3 vColor;varying float vAngle,vPhase,vOpacity,vAcross,vAlong;
vec3 pulled(float along){
  float q=clamp(uProgress,0.0,1.0),envelope=max(sin(q*3.14159265),uScatter*.5);
  float travelAlong=mix(smoothstep(.38,1.0,q),smoothstep(0.0,.62,q),along);
  vec3 source=mix(aFrom,aTo,uSourceForm),target=mix(aFrom,aTo,uTargetForm);
  vec3 p=mix(source,target,travelAlong);
  // Adjacent fibers share a slow wave and keep their place in twelve depth planes.
  float strand=floor(aId/uCount*6000.0),layer=mod(strand,12.0);
  float band=(floor(strand/12.0)+.5)/500.0-.5;
  float phase=uTime*.48,arch=sin(along*3.14159265);
  float weave=mod(layer,2.0)<1.0?1.0:-1.0;
  p.x+=envelope*(along-.5)*2.2;
  p.y+=envelope*arch*(band*.5+sin(along*6.283185+phase+band*.4)*.12*weave);
  p.z+=envelope*arch*((layer-5.5)/5.5*.45+cos(along*6.283185+phase)*.14);
  return p;
}
vec3 project(vec3 p){
  float cy=cos(uRotation.x),sy=sin(uRotation.x),cx=cos(uRotation.y),sx=sin(uRotation.y);
  p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
  p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);
  float perspective=3.6/(3.6-p.z);
  return vec3(p.x*perspective*uSize/uAspect,p.y*perspective*uSize,p.z*.06);
}
void main(){
  float id=aId,q=clamp(uProgress,0.0,1.0),envelope=sin(q*3.14159265),bead=mod(id,20.0)/20.0;
  float along=uLinePass>.5?aRibbon.x:(bead<.42?0.0:bead>.58?1.0:(bead-.42)/.16);
  float travelAlong=mix(smoothstep(.38,1.0,q),smoothstep(0.0,.62,q),along);
  float morph=mix(uSourceForm,uTargetForm,travelAlong);
  vec3 fiber=mix(aFiber,aFiberTo,morph),p=pulled(along),clip=project(p);
  // Screen-space ribbons stay visibly thick even where WebGL only supports 1px lines.
  if(uLinePass>1.5){
    vec2 direction=(project(pulled(min(1.0,along+.003)))-project(pulled(max(0.0,along-.003)))).xy*uViewport;
    direction=normalize(direction+vec2(.00001));
    clip.xy+=vec2(-direction.y,direction.x)*aRibbon.y*uThreadWidth*uDpr/uViewport;
  }
  gl_Position=vec4(clip,1.0);
  gl_PointSize=max(1.6,(3.1+fiber.y*2.0)*uDensity)*uDpr*3.6/(3.6-p.z);
  vec3 color=mix(aColorFrom,aColorTo,morph);
  if(color.b>color.r*1.4&&color.r<.3)color=mix(color,vec3(.13,.25,.7),.34);
  if(color.g>color.r*1.45&&color.b>color.r*1.5&&color.g>.25)color=mix(color,vec3(.55,.22,.8),.72);
  vColor=color*1.08;vAngle=fiber.x+sin(uTime*.4)*.035;
  vPhase=fiber.z;vOpacity=(.85+.15*sin(uTime*.45))*.7*uDensity*uExposure;vAcross=aRibbon.y;vAlong=along;
  if(uLinePass<.5)vOpacity*=1.0-envelope*.7;
  if(uLinePass>.5){
    float family=mod(floor(id/uCount*6000.0),5.0);
    vec3 silkColor=family<1.0?vec3(.8,.14,.2):family<2.0?vec3(.95,.7,.32):family<3.0?vec3(.84,.87,.91):family<4.0?vec3(.53,.29,.66):vec3(.18,.32,.62);
    // Each strand keeps the same dye through both directions of the cycle.
    vColor=mix((aColorFrom+aColorTo)*.54,silkColor,.4);
    float strength=pow(max(0.0,envelope),.7);
    vOpacity=strength*.1*max(.55,uExposure)*(.85+.15*cos(along*6.283185));
    if(uLinePass>1.5)vOpacity=strength*(uLinePass>2.5?.045:.3)*max(.7,uExposure)*(.95+.05*cos(along*90.0+fiber.z));
  }
}`;
const fragment=`precision mediump float;
varying vec3 vColor;varying float vAngle,vPhase,vOpacity,vAcross,vAlong;
uniform highp float uLinePass;
void main(){
  if(uLinePass>.5){
    if(uLinePass<1.5){gl_FragColor=vec4(vColor,vOpacity);return;}
    if(uLinePass>2.5){gl_FragColor=vec4(vColor,vOpacity*exp(-vAcross*vAcross*5.0));return;}
    // Close parallel filaments and a narrow satin highlight give a smooth embroidery silk.
    float profile=sqrt(max(0.0,1.0-vAcross*vAcross));
    float filaments=.9+.1*cos(vAcross*18.0+sin(vAlong*800.0+vPhase)*.28);
    float sheen=pow(max(0.0,1.0-abs(vAcross+.24)),9.0);
    vec3 silk=vColor*(.76+.24*profile)*filaments+vec3(.17,.15,.12)*sheen;
    float edge=1.0-smoothstep(.65,1.0,abs(vAcross));
    gl_FragColor=vec4(silk,vOpacity*edge);return;
  }
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
    const locations=Object.fromEntries(['aFrom','aTo','aColorFrom','aColorTo','aFiber','aFiberTo','aId','aRibbon'].map(name=>[name,gl.getAttribLocation(program,name)]));
    function buffer(values){const result=gl.createBuffer();buffers.push(result);gl.bindBuffer(gl.ARRAY_BUFFER,result);gl.bufferData(gl.ARRAY_BUFFER,values,gl.STATIC_DRAW);return result;}
    function attributes(from,to){return {aFrom:from.positions,aTo:to.positions,aColorFrom:from.colors,aColorTo:to.colors,aFiber:from.fibers,aFiberTo:to.fibers};}
    const pointAttributes={...attributes(previous||motifs[0],previous?motifs[initialTarget]:motifs[1]),aId:Float32Array.from({length:count},(_,i)=>i)};
    const pointBuffers=Object.fromEntries(Object.entries(pointAttributes).map(([name,data])=>[name,buffer(data)]));
    const strands=6000,segments=32,lineCount=strands*segments*2;
    const lineArrays=Object.fromEntries(Object.keys(pointAttributes).map(name=>[name,new Float32Array(lineCount*(name==='aId'?1:3))]));
    lineArrays.aRibbon=new Float32Array(lineCount*2);
    function fillLines(){for(let strand=0;strand<strands;strand++) {
      const id=Math.floor(strand*count/strands);
      for(let segment=0;segment<segments;segment++)for(let end=0;end<2;end++) {
        const index=(strand*segments+segment)*2+end;
        lineArrays.aRibbon[index*2]=(segment+end)/segments;lineArrays.aId[index]=id;
        for(const name of Object.keys(pointAttributes))if(name!=='aId')lineArrays[name].set(pointAttributes[name].subarray(id*3,id*3+3),index*3);
      }
    }
    }
    fillLines();
    const lineBuffers=Object.fromEntries(Object.entries(lineArrays).map(([name,data])=>[name,buffer(data)]));
    const boldStrands=240,ribbonSegments=64,ribbonCount=boldStrands*ribbonSegments*6;
    const ribbonArrays=Object.fromEntries(Object.entries(lineArrays).map(([name])=>[name,new Float32Array(ribbonCount*(name==='aId'?1:name==='aRibbon'?2:3))]));
    function fillRibbons(){
      const corners=[[0,-1],[1,-1],[0,1],[0,1],[1,-1],[1,1]];
      for(let strand=0;strand<boldStrands;strand++)for(let segment=0;segment<ribbonSegments;segment++)for(let c=0;c<6;c++){
        const [end,side]=corners[c],source=Math.floor(strand*strands/boldStrands)*segments*2,index=(strand*ribbonSegments+segment)*6+c;
        for(const [name,data] of Object.entries(ribbonArrays)){
          const size=name==='aId'?1:name==='aRibbon'?2:3;
          data.set(lineArrays[name].subarray(source*size,source*size+size),index*size);
        }
        ribbonArrays.aRibbon.set([(segment+end)/ribbonSegments,side],index*2);
      }
    }
    fillRibbons();
    const ribbonBuffers=Object.fromEntries(Object.entries(ribbonArrays).map(([name,data])=>[name,buffer(data)]));
    function restoreCanonical() {
      Object.assign(pointAttributes,attributes(motifs[0],motifs[1]));fillLines();fillRibbons();
      for(const [name,data] of Object.entries(pointAttributes)){gl.bindBuffer(gl.ARRAY_BUFFER,pointBuffers[name]);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);}
      for(const [name,data] of Object.entries(lineArrays)){gl.bindBuffer(gl.ARRAY_BUFFER,lineBuffers[name]);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);}
      for(const [name,data] of Object.entries(ribbonArrays)){gl.bindBuffer(gl.ARRAY_BUFFER,ribbonBuffers[name]);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);}
      previous=null;
    }
    function bind(attributes) {
      for(const [name,location]of Object.entries(locations)) {
        if(location<0)continue;
        if(!attributes[name]){gl.disableVertexAttribArray(location);gl.vertexAttrib2f(location,.5,0);continue;}
        gl.bindBuffer(gl.ARRAY_BUFFER,attributes[name]);gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location,name==='aId'?1:name==='aRibbon'?2:3,gl.FLOAT,false,0,0);
      }
    }
    const uniform=Object.fromEntries(['ThreadWidth','Viewport','Morph','SourceForm','TargetForm','Progress','LinePass','Scatter','Time','Aspect','Dpr','Size','Seed','Count','Density','Exposure','Rotation','Pointer'].map(key=>[key,gl.getUniformLocation(program,`u${key}`)]));
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
      if(progress>.005&&progress<.995){
        gl.uniform1f(uniform.LinePass,1);bind(lineBuffers);gl.drawArrays(gl.LINES,0,lineCount);
        gl.uniform2f(uniform.Viewport,canvas.width,canvas.height);bind(ribbonBuffers);
        const threadWidth=width<700?.7:.85;
        gl.uniform1f(uniform.LinePass,3);gl.uniform1f(uniform.ThreadWidth,threadWidth*2.0);gl.drawArrays(gl.TRIANGLES,0,ribbonCount);
        gl.uniform1f(uniform.LinePass,2);gl.uniform1f(uniform.ThreadWidth,threadWidth);gl.drawArrays(gl.TRIANGLES,0,ribbonCount);
      }
      canvas.dataset.clock=time.toFixed(4);canvas.dataset.spread=scatter.toFixed(4);canvas.dataset.layers='12';canvas.dataset.boldStrands=String(boldStrands);canvas.dataset.connecting=previous?'true':'false';canvas.dataset.pull=progress.toFixed(3);canvas.dataset.strands=String(strands);
    }};
  }catch(error){dispose();throw error;}
}
