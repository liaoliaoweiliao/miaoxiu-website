import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classifyHand,initialGesture,stabilizeGesture } from '../src/features/home/handGestureModel.js';

// Actual local model outputs from Google's woman_hands.jpg / fist.jpg fixtures.
const hands=JSON.parse(readFileSync(new URL('./fixtures/hand-landmarks.json',import.meta.url)));
test('real hand landmarks classify open palm and fist regardless of mirroring or scale',()=>{
  for(const [name,pose] of [['open','open'],['fist','fist'],['worldOpen','open'],['worldFist','fist']]) {
    assert.equal(classifyHand(hands[name]),pose);
    assert.equal(classifyHand(hands[name].map(p=>({x:1-p.x,y:p.y,z:p.z}))),pose);
    assert.equal(classifyHand(hands[name].map(p=>({x:p.x*.55+.1,y:p.y*.55+.2,z:p.z*.55}))),pose);
  }
  assert.equal(classifyHand(null),'none');assert.equal(classifyHand([]),'none');
  assert.equal(classifyHand(Array(21).fill({x:0,y:0,z:0})),'none');
  assert.equal(classifyHand(hands.open.map((p,i)=>i===3?{...p,x:NaN}:p)),'none');
});
test('open palm stabilizes before starting while a recognized fist stops immediately',()=>{
  let state=initialGesture(),events=[];
  const frame=(pose,time)=>{state=stabilizeGesture(state,pose,time);if(state.event)events.push(state.event);};
  frame('open',100);frame('fist',200);frame('open',300);frame('open',600);
  assert.deepEqual(events,['fist']);
  frame('open',750);frame('open',900);frame('open',2000);
  assert.deepEqual(events,['fist','open']);
  frame('neutral',2100);frame('open',2200);frame('open',2700);
  assert.deepEqual(events,['fist','open']);
  frame('fist',2800);assert.equal(state.event,'fist');frame('fist',3300);frame('fist',4000);
  assert.deepEqual(events,['fist','open','fist']);
  frame('none',4100);frame('none',5400);frame('fist',5500);frame('fist',6000);
  assert.deepEqual(events,['fist','open','fist','fist']);
});
