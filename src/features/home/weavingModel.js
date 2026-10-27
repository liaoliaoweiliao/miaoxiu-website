import { clamp, randomSequence } from './particleModel.js';

export const FLIGHT_DURATION = 1800;
export const WEAVER_CROP = { x: 0, y: 125, width: 300, height: 420 };

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
    return {x:-1.85+p.x/width*1.67,y:1.19-p.y/height*2.04,z:(random()-.5)*.12,tone:random()<.18?1:0,seed:random()*6.28,hand:p.x/width>.47&&p.y/height>.49&&p.y/height<.8};
  });
}

export function wovenCloth(count) {
  const random=randomSequence(93);
  return Array.from({length:count},(_,i)=>{
    const u=random(),v=random(),x=-.72+u*2.65;
    const edge=i%7===0;
    return {x,y:-.48+Math.sin(u*5)*.09-v*.45,z:(random()-.5)*.12,tone:edge?0:i%3===0?1:2,seed:u*9,edge,v:edge?(i%2?0:1):v};
  });
}

export function introFrame(width,height,progress) {
  const t=clamp(progress),compact=width<700,unit=compact?Math.min(height*.38,width*.5):Math.min(height*.46,width*.25);
  const start={x:width/2+(compact?.062:.66)*unit,y:height*(compact?.72:.4)+.59*unit*(compact?.65:1)};
  const end={x:width/2,y:height/2};
  return {
    unit,compact,sceneOpacity:1-clamp(t/.22),
    butterfly:{x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t,scale:unit*.2+(Math.min(width,height)*.33-unit*.2)*t},
  };
}
