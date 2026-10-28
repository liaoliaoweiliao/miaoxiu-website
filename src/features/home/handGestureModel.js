// Palm-relative joint geometry works for either hand and a mirrored preview.
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z||0)-(b.z||0));
function angle(a,b,c) {
  const u=[a.x-b.x,a.y-b.y,(a.z||0)-(b.z||0)],v=[c.x-b.x,c.y-b.y,(c.z||0)-(b.z||0)];
  return Math.acos(Math.max(-1,Math.min(1,u.reduce((sum,x,i)=>sum+x*v[i],0)/(Math.hypot(...u)*Math.hypot(...v)||1))))*180/Math.PI;
}
export function classifyHand(points) {
  if(points?.length!==21||points.some(p=>![p.x,p.y,p.z||0].every(Number.isFinite)))return 'none';
  const palm=distance(points[0],points[9]);if(palm<.025)return 'none';
  let extended=0,curled=0;
  for(const base of [5,9,13,17]) {
    const tip=points[base+3],pip=points[base+1],mcp=points[base];
    const bend=angle(mcp,pip,tip),reach=distance(tip,points[0])/distance(pip,points[0]);
    if(bend>140&&reach>1.16&&distance(tip,mcp)>distance(pip,mcp)*1.5)extended++;
    if(bend<130&&reach<1.12)curled++;
  }
  return extended===4?'open':curled>=3&&extended<=1?'fist':'neutral';
}

// A held gesture fires once; ambiguous frames cannot cycle through the catalog.
export function stabilizeGesture(state,pose,now) {
  if(pose==='none') {
    if(now-state.lastSeen>1200)return {...state,candidate:'none',since:now,latched:'none',event:null};
    return {...state,event:null};
  }
  const next={...state,lastSeen:now,event:null};
  // Stopping is immediate on a recognized fist; starting still requires a stable palm.
  if(pose==='fist')return {...next,candidate:pose,since:now,latched:pose,event:state.latched===pose?null:pose};
  if(pose!==state.candidate)return {...next,candidate:pose,since:now};
  if(pose==='open'&&now-state.since>=420&&pose!==state.latched) {
    next.latched=pose;next.event=pose;
  }
  return next;
}
export const initialGesture=()=>({candidate:'none',latched:'none',since:0,lastSeen:0,event:null});
