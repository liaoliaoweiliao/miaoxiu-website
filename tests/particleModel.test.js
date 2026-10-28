import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleMotif, sampleSilk, motionSignal, soundEnergy } from '../src/features/home/particleModel.js';
import { introFrame, sampleWeaver, wovenCloth, clothPoint, weavingPose, butterflyPoint, WEAVER_CROP } from '../src/features/home/weavingModel.js';

test('motif sampling excludes transparent background and retains source color deterministically', () => {
  const image=new Uint8ClampedArray([255,0,0,0, 240,200,120,255, 0,0,0,255, 0,0,0,0]);
  const first=sampleMotif(image,2,2,100,37),second=sampleMotif(image,2,2,100,37);
  assert.deepEqual(first,second);
  for(let i=0;i<100;i++) { assert.equal(first.positions[i*3],0);assert.ok(Math.abs(first.positions[i*3+1]-1.35)<.00001);assert.ok(Math.abs(first.colors[i*3]-240/255)<.00001); }
  assert.throws(()=>sampleMotif(new Uint8ClampedArray(16),2,2,100),/没有可采样/);
});

test('body motion ignores still frames and locates mirrored movement', () => {
  const previous=new Uint8Array(16),still=new Uint8Array(16);
  assert.deepEqual(motionSignal(still,null,4,4),{energy:0,x:0,y:0});
  assert.deepEqual(motionSignal(still,previous,4,4),{energy:0,x:0,y:0});
  still[0]=255;
  const left=motionSignal(still,previous,4,4);
  assert.equal(left.x,1);assert.equal(left.y,1);assert.ok(left.energy>0);
  assert.equal(soundEnergy(new Uint8Array(512).fill(128)),0);
  assert.ok(soundEnergy(new Uint8Array(512).fill(160))>.3);
  assert.equal(soundEnergy(new Uint8Array(512).fill(255)),1);
});

test('weaver sampling isolates bright figure pixels and cloth stays reproducible',()=>{
  const data=new Uint8ClampedArray(40*40*4);
  for(let y=0;y<40;y++)for(let x=0;x<40;x++){const i=(y*40+x)*4;data.set(x<20?[230,225,210,255]:[10,60,100,255],i);}
  const figure=sampleWeaver(data,40,40,100);
  assert.equal(figure.length,100);
  assert.ok(figure.every(p=>p.x<-.9));
  assert.throws(()=>sampleWeaver(new Uint8ClampedArray(64),4,4,10),/绣娘轮廓/);
  assert.deepEqual(wovenCloth(200),wovenCloth(200));
});

test('butterfly flies on a straight line while the woven scene vanishes first',()=>{
  for(const [w,h] of [[1368,600],[366,448],[296,430]]){
    const start=introFrame(w,h,0),end=introFrame(w,h,1);
    for(const t of [.25,.5,.75]){
      const point=introFrame(w,h,t);
      assert.ok(Math.abs(point.butterfly.x-(start.butterfly.x+(end.butterfly.x-start.butterfly.x)*t))<.001);
      assert.ok(Math.abs(point.butterfly.y-(start.butterfly.y+(end.butterfly.y-start.butterfly.y)*t))<.001);
      assert.equal(point.sceneOpacity,0);
    }
    assert.equal(end.butterfly.x,w/2);assert.equal(end.butterfly.y,h/2);
    assert.ok(start.butterfly.x>0&&start.butterfly.x<w);
    const surface=clothPoint(.64,.45,w,h,start.unit);assert.equal(start.butterfly.y,surface.y);
    assert.ok(start.womanX-1.85*start.unit<=0);
  }
});

test('silk samples supply a finite direction and depth for every actual fiber',()=>{
 const data=new Uint8ClampedArray(16*16*4).fill(210);
 const result=sampleSilk(data,16,16,2000);
 assert.equal(result.fibers.length,6000);assert.equal(result.positions.length,6000);
 assert.ok([...result.fibers,...result.positions].every(Number.isFinite));
});


test('whole figure moves continuously across shoulder and hand regions',()=>{
  const shoulder={x:-.7,y:.1,u:.5,v:.5},hand={x:-.4,y:-.1,u:.8,v:.65};
  assert.notDeepEqual(weavingPose(shoulder,0),weavingPose(shoulder,1));
  assert.notDeepEqual(weavingPose(hand,0),weavingPose(hand,1));
  const left=weavingPose({...hand,u:.46999},1),right=weavingPose({...hand,u:.47001},1);
  assert.ok(Math.hypot(left.x-right.x,left.y-right.y)<.0001);
  for(const point of [shoulder,hand])for(let t=0;t<8;t+=.2){
    const start=weavingPose(point,0),next=weavingPose(point,t);
    assert.ok(Math.hypot(next.x-start.x,next.y-start.y)<.055);
  }
});

test('enlarged figure, cloth and perched or flying butterfly preserve their proportions',()=>{
  const data=new Uint8ClampedArray(30*42*4).fill(230),figure=sampleWeaver(data,30,42,300);
  const xs=figure.map(p=>p.x),ys=figure.map(p=>p.y),us=figure.map(p=>p.u),vs=figure.map(p=>p.v);
  const xScale=(Math.max(...xs)-Math.min(...xs))/(Math.max(...us)-Math.min(...us));
  const yScale=(Math.max(...ys)-Math.min(...ys))/(Math.max(...vs)-Math.min(...vs));
  assert.ok(Math.abs(xScale/yScale-WEAVER_CROP.width/WEAVER_CROP.height)<1e-6);
  for(const [w,h] of [[1920,920],[1440,780],[800,600],[390,630],[320,560]]){
    const frame=introFrame(w,h,0),left=clothPoint(0,0,w,h,frame.unit),right=clothPoint(1,0,w,h,frame.unit),bottom=clothPoint(0,1,w,h,frame.unit);
    assert.ok(Math.abs((right.x-left.x)/(bottom.y-left.y)-6)<1e-6);
    for(const progress of [0,.3,.7,1])for(const time of [0,1,2]){
      const pose=introFrame(w,h,progress).butterfly,center=butterflyPoint(0,0,pose,time);
      const x=butterflyPoint(1,0,pose,time),y=butterflyPoint(0,1,pose,time);
      assert.ok(Math.abs((x.x-center.x)/(center.y-y.y)-1)<1e-6);
    }
  }
});

test('a flying butterfly gently hinges its wings while its body and arrival remain fixed',()=>{
  const pose={x:300,y:220,scale:100},seconds=1/(2.2*4);
  const base=butterflyPoint(1,.4,pose),right=butterflyPoint(1,.4,pose,0,{seconds,progress:.5});
  const left=butterflyPoint(-1,.4,pose,0,{seconds,progress:.5});
  assert.ok(right.x<base.x&&right.x>pose.x+(base.x-pose.x)*.9);
  assert.ok(right.y<base.y&&base.y-right.y<5);
  assert.ok(Math.abs(left.x+right.x-2*pose.x)<1e-6);
  for(const progress of [0,.2,.5,.8,1]){
    const flight={seconds,progress};
    assert.deepEqual(butterflyPoint(0,.3,pose,0,flight),butterflyPoint(0,.3,pose));
    if(progress===0||progress===1)assert.deepEqual(butterflyPoint(1,.4,pose,0,flight),base);
  }
});
