import test from 'node:test';
import assert from 'node:assert/strict';
import { initialFiberMotion,selectFiberForm,controlFiberMotion,advanceFiberMotion } from '../src/features/home/fiberMotion.js';

test('palm spreads, fist collects and reversing a gesture never resets geometry',()=>{
  let state=controlFiberMotion(initialFiberMotion(),'open');
  for(let i=0;i<60;i++)state=advanceFiberMotion(state,1/60);
  assert.ok(state.spread>.98);assert.ok(Math.abs(state.progress-.5)<.01);
  const closing=controlFiberMotion(state,'fist');
  assert.equal(closing.spread,state.spread);assert.equal(closing.progress,state.progress);
  const moving=advanceFiberMotion(closing,1/60);
  assert.ok(moving.spread<closing.spread);assert.ok(moving.progress>closing.progress);
  const reversing=controlFiberMotion(moving,'open');
  assert.equal(reversing.spread,moving.spread);assert.equal(reversing.progress,moving.progress);
  assert.ok(advanceFiberMotion(reversing,1/60).spread>moving.spread);
  let gathered=closing;for(let i=0;i<180;i++)gathered=advanceFiberMotion(gathered,1/60);
  assert.equal(gathered.spread,0);assert.equal(gathered.progress,1);assert.equal(gathered.running,false);
});

test('sustained palm stays dispersed in a deterministic network rather than cycling randomly',()=>{
  function run(){let state=controlFiberMotion(initialFiberMotion(),'open');for(let i=0;i<300;i++)state=advanceFiberMotion(state,1/60);return state;}
  const result=run();assert.deepEqual(result,run());assert.equal(result.target,1);assert.ok(result.spread>.999);assert.ok(Math.abs(result.progress-.5)<.001);
});

test('hand loss or camera stop holds motion; manual controls and reduced motion remain available',()=>{
  const reducedOpen=advanceFiberMotion(controlFiberMotion(initialFiberMotion(),'open'),.1,true);
  assert.equal(reducedOpen.progress,1);assert.equal(reducedOpen.spread,0);assert.equal(reducedOpen.running,false);
  const started=advanceFiberMotion(controlFiberMotion(initialFiberMotion(),'open'),.6);
  for(const pose of ['none','off']){
    const stopped=controlFiberMotion(started,pose);
    assert.equal(advanceFiberMotion(stopped,.5),stopped);
    const manual=selectFiberForm(stopped,0);assert.equal(manual.controlled,false);assert.equal(manual.running,true);
    const reduced=advanceFiberMotion(manual,.1,true);assert.equal(reduced.progress,1);assert.equal(reduced.spread,0);assert.equal(reduced.time,manual.time);
  }
});
