import test from 'node:test';
import assert from 'node:assert/strict';
import { initialFiberMotion,selectFiberForm,controlFiberMotion,advanceFiberMotion } from '../src/features/home/fiberMotion.js';

const form=state=>state.from+(state.target-state.from)*state.progress**2*(3-2*state.progress);
const finish=state=>Array.from({length:100},()=>.1).reduce((current,dt)=>advanceFiberMotion(current,dt),state);

test('open palm selects the application and fist returns to the motif without automatic cycling',()=>{
  let state=finish(controlFiberMotion(initialFiberMotion(),'open'));
  assert.equal(state.target,1);assert.equal(state.progress,1);assert.equal(form(state),1);
  state=finish(state);assert.equal(state.target,1);assert.equal(state.progress,1);
  state=finish(controlFiberMotion(state,'fist'));
  assert.equal(state.target,0);assert.equal(state.progress,1);assert.equal(form(state),0);
  state=finish(state);assert.equal(state.target,0);assert.equal(state.progress,1);
});

test('reversing a gesture starts from the current form and repeated poses do not restart a transition',()=>{
  const opened=advanceFiberMotion(controlFiberMotion(initialFiberMotion(),'open'),.9);
  assert.equal(opened.target,1);assert.equal(opened.progress,.25);assert.ok(opened.spread>.5);
  const returning=controlFiberMotion(opened,'fist');
  assert.equal(returning.target,0);assert.equal(returning.progress,0);
  assert.equal(form(returning),form(opened));assert.equal(returning.time,opened.time);
  const midway=advanceFiberMotion(returning,.6);
  assert.ok(form(midway)<form(opened));
  assert.deepEqual(controlFiberMotion(midway,'fist'),midway);
  const reopened=controlFiberMotion(midway,'open');
  assert.equal(reopened.target,1);assert.equal(form(reopened),form(midway));
  assert.equal(form(finish(reopened)),1);
});

test('hand loss pauses motion, reacquiring the same pose resumes it and manual controls remain available',()=>{
  const started=advanceFiberMotion(controlFiberMotion(initialFiberMotion(),'open'),.6);
  for(const pose of ['waiting','none','off']){
    const stopped=controlFiberMotion(started,pose);
    assert.equal(advanceFiberMotion(stopped,.5),stopped);
    const resumed=controlFiberMotion(stopped,'open');
    assert.equal(resumed.progress,started.progress);assert.equal(resumed.time,started.time);
    const manual=selectFiberForm(stopped,0);assert.equal(manual.controlled,false);assert.equal(manual.running,true);
    assert.equal(form(finish(manual)),0);
  }
});

test('reduced motion immediately reaches either gesture form without changing its clock',()=>{
  let state=initialFiberMotion();
  for(const [pose,target] of [['open',1],['fist',0],['open',1]]){
    const controlled=controlFiberMotion(state,pose);
    state=advanceFiberMotion(controlled,.1,true);
    assert.equal(state.target,target);assert.equal(state.progress,1);assert.equal(state.spread,0);
    assert.equal(state.time,controlled.time);assert.equal(form(state),target);
  }
});
