import test from 'node:test';
import assert from 'node:assert/strict';
import { initialFiberMotion,selectFiberForm,controlFiberMotion,advanceFiberMotion } from '../src/features/home/fiberMotion.js';

test('fist holds the exact in-between state and reopening resumes without rewinding or changing pairs',()=>{
  const waiting=controlFiberMotion(initialFiberMotion(),'waiting');
  assert.equal(advanceFiberMotion(waiting,10),waiting);
  const opened=advanceFiberMotion(controlFiberMotion(waiting,'open'),.9);
  assert.equal(opened.target,1);assert.equal(opened.progress,.25);assert.ok(opened.spread>.5);
  const held=controlFiberMotion(opened,'fist');
  assert.equal(advanceFiberMotion(held,10),held);
  const resumed=controlFiberMotion(held,'open');
  assert.equal(resumed.progress,opened.progress);assert.equal(resumed.time,opened.time);assert.equal(resumed.target,opened.target);
  assert.deepEqual(advanceFiberMotion(resumed,.1),advanceFiberMotion(opened,.1));
});

test('an open palm drives a repeatable ordered motif/application cycle with no random transition',()=>{
  function run(){
    let state=controlFiberMotion(initialFiberMotion(),'open');const targets=[state.target];
    for(let i=0;i<300;i++){
      const next=advanceFiberMotion(state,.1);
      assert.ok(next.progress>=0&&next.progress<=1);assert.ok(next.spread>=0&&next.spread<=.9);
      if(next.target!==state.target){targets.push(next.target);assert.equal(next.from,state.target);}
      state=next;
    }
    return {state,targets};
  }
  const first=run();assert.deepEqual(first,run());
  assert.ok(first.targets.length>=6);assert.ok(first.targets.every((v,i)=>v===1-i%2));
});

test('hand loss or camera stop holds motion; manual controls and reduced motion remain available',()=>{
  const started=advanceFiberMotion(controlFiberMotion(initialFiberMotion(),'open'),.6);
  for(const pose of ['none','off']){
    const stopped=controlFiberMotion(started,pose);
    assert.equal(advanceFiberMotion(stopped,.5),stopped);
    const manual=selectFiberForm(stopped,0);assert.equal(manual.controlled,false);assert.equal(manual.running,true);
    const reduced=advanceFiberMotion(manual,.1,true);assert.equal(reduced.progress,1);assert.equal(reduced.spread,0);assert.equal(reduced.time,manual.time);
  }
});
