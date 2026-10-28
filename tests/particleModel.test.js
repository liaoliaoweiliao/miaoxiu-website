import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleMotif, sampleSilk, motionSignal, soundEnergy } from '../src/features/home/particleModel.js';
import { introFrame, sampleWeaver, wovenCloth, clothPoint, weavingPose } from '../src/features/home/weavingModel.js';

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
    assert.equal(start.butterfly.tilt,.48);
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
});
