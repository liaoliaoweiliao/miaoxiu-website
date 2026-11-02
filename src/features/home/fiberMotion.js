import { clamp } from './particleModel.js';

const smooth=t=>t*t*(3-2*t);
export const initialFiberMotion=()=>({from:0,target:0,progress:1,time:0,spread:0,hold:0,running:true,controlled:false});

export function selectFiberForm(state,target) {
  const from=state.from+(state.target-state.from)*smooth(state.progress);
  return {...state,from,target,progress:0,spread:0,hold:0,running:true,controlled:false};
}

export function controlFiberMotion(state,pose) {
  if(pose==='open'||pose==='fist') {
    const target=pose==='open'?1:0;
    const next=state.target===target?state:selectFiberForm(state,target);
    return {...next,running:true,controlled:true};
  }
  return {...state,running:false,controlled:pose!=='off'};
}

// One shared clock drives every strand; each gesture keeps its requested form.
export function advanceFiberMotion(state,dt,reduced=false) {
  if(!state.running)return state;
  if(reduced)return {...state,progress:1,spread:0};
  let next={...state,time:state.time+dt,progress:clamp(state.progress+dt/3.6)};
  next.spread=Math.sin(next.progress*Math.PI)*.9;
  if(next.progress===1) {
    next.hold=state.progress===1?state.hold+dt:0;
  }
  return next;
}
