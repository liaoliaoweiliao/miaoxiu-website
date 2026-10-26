import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleMotif, motionSignal, soundEnergy } from '../src/features/home/particleModel.js';

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
