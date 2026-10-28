import { clamp, randomSequence } from './particleModel.js';

export const FLIGHT_DURATION = 1800;
export const WEAVER_CROP = { x: 0, y: 125, width: 300, height: 420 };
const figureHeight=2.04,figureWidth=figureHeight*WEAVER_CROP.width/WEAVER_CROP.height;

// The mask follows the reference figure; the village and landscape are excluded.
const outline = [[0,.07],[.35,0],[.82,.04],[.99,.24],[.86,.39],[.66,.45],[.54,.42],[.51,.55],[.74,.5],[.92,.51],[.95,.66],[.63,.78],[.6,.96],[0,1]];
export function insideWeaver(x,y) {
  let inside=false;
  for(let i=0,j=outline.length-1;i<outline.length;j=i++) {
    const a=outline[i],b=outline[j];
    if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}

export function sampleWeaver(pixels,width,height,count) {
  const random=randomSequence(71),candidates=[];
  for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
    const i=(y*width+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
    if(insideWeaver(x/width,y/height)&&pixels[i+3]>100&&r*.2126+g*.7152+b*.0722>115&&r>g*.77) candidates.push({x,y});
  }
  if(!candidates.length)throw new Error('绣娘轮廓暂不可用');
  return Array.from({length:count},()=>{
    const p=candidates[Math.floor(random()*candidates.length)];
    return {x:-1.85+p.x/width*figureWidth,y:1.19-p.y/height*figureHeight,z:(random()-.5)*.12,tone:random()<.18?1:0,seed:random()*6.28,u:p.x/width,v:p.y/height};
  });
}

export function wovenCloth(count) {
  const random=randomSequence(93);
  return Array.from({length:count},(_,i)=>{
    const u=random(),v=random(),x=-.72+u*2.65;
    const edge=i%7===0;
    return {x,y:-.48+Math.sin(u*5)*.09-v*.45,z:(random()-.5)*.12,tone:edge?0:i%3===0?1:2,seed:u*9,u,edge,v:edge?(i%2?0:1):v};
  });
}

// Smooth weights deform the whole reference figure, including shoulder, arm and hand.
export function weavingPose(point,time) {
  const beat=Math.sin(time*1.55),breathe=Math.sin(time*.77);
  const arm=Math.exp(-((point.u-.72)**2/.11+(point.v-.61)**2/.075));
  const upper=Math.max(0,1-point.v),lean=beat*.004;
  return {x:point.x+(.3-point.y)*lean+breathe*.003+arm*beat*.017,
    y:point.y+upper*breathe*.004+arm*Math.cos(time*1.55)*.012};
}

// Length and depth share one scale; resizing never stretches the cloth on one axis.
export function clothPoint(u,v,width,height,unit,time=0) {
  const compact=width<700,length=width*(compact?1.13:.78),scale=length/6;
  return {x:width*(compact?-.07:.22)+u*length,
    y:height*(compact?.73:.64)+Math.sin(u*5+time*.65)*scale*.065+v*scale};
}

export function introFrame(width,height,progress,time=0) {
  const t=clamp(progress),compact=width<700,unit=compact?Math.min(height*.38,width*.58):Math.min(height*.46,width*.27);
  const start=clothPoint(.64,.45,width,height,unit,time),end={x:width/2,y:height/2};
  const clothDepth=width*(compact?1.13:.78)/6,restScale=clothDepth*.78/2.7;
  return {
    unit,compact,sceneOpacity:1-clamp(t/.22),womanX:1.85*unit-(compact?12:3),
    butterfly:{x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t,
      scale:restScale+(Math.min(width,height)*.33-restScale)*t},
  };
}

export function butterflyPoint(x,y,pose,time=0,flight=null) {
  const scale=pose.scale*(1-Math.sin(time*2)**2*.008);
  if(flight){
    // Wings hinge beside the body; the body's path and the resting proportions stay fixed.
    const angle=Math.sin(flight.seconds*Math.PI*2*2.2)*.42*Math.sin(Math.PI*clamp(flight.progress));
    const wing=Math.max(0,Math.abs(x)-.08);
    x-=Math.sign(x)*wing*(1-Math.cos(angle));
    y+=wing*Math.sin(angle)*.1;
  }
  return {x:pose.x+x*scale,y:pose.y-y*scale};
}
