import { clamp } from './particleModel.js';

const smooth=t=>t*t*(3-2*t);
export const initialFiberMotion=()=>({from:0,target:0,progress:1,time:0,spread:0,hold:0,running:true,controlled:false,intent:null});

export function selectFiberForm(state,target) {
  const from=state.from+(state.target-state.from)*smooth(state.progress);
  return {...state,from,target,progress:0,spread:0,hold:0,running:true,controlled:false,intent:null};
}

export function controlFiberMotion(state,pose) {
  if(pose==='open') {
    const next=state.progress>=1?selectFiberForm(state,1-state.target):state;
    return {...next,running:true,controlled:true,intent:'open'};
  }
  if(pose==='fist')return {...state,running:true,controlled:true,intent:'fist'};
  return {...state,running:false,controlled:pose!=='off',intent:null};
}

// Gestures change destinations, never the current position: reversal stays continuous.
export function advanceFiberMotion(state,dt,reduced=false) {
  if(!state.running)return state;
  if(state.controlled&&state.intent){
    const spreadTarget=state.intent==='open'?1:0,progressTarget=state.intent==='open'?.5:1;
    if(reduced)return {...state,spread:0,progress:1,running:false};
    const ease=1-Math.exp(-Math.max(0,dt)*4.5);
    const next={...state,time:state.time+dt,spread:state.spread+(spreadTarget-state.spread)*ease,progress:state.progress+(progressTarget-state.progress)*ease};
    if(state.intent==='fist'&&next.spread<.002&&1-next.progress<.002)return {...next,spread:0,progress:1,running:false};
    return next;
  }
  if(reduced)return {...state,progress:1,spread:0};
  const progress=clamp(state.progress+dt/3.6);
  return {...state,time:state.time+dt,progress,spread:Math.sin(progress*Math.PI)*.9};
}
