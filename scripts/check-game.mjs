import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const stored=new Map(),events=[];const focusable={focus(){},classList:{contains(){return false},remove(){}},dataset:{}};
const app={innerHTML:'',handlers:{},addEventListener(k,f){this.handlers[k]=f},querySelector(){return focusable},querySelectorAll(){return []}};
globalThis.document={querySelector(){return app},title:'',activeElement:focusable,body:{dataset:{},classList:{toggle(){}}},getElementById(){return {scrollIntoView(){}}}};
globalThis.location={hash:'#experience'};
globalThis.localStorage={getItem(k){return stored.get(k)??null},setItem(k,v){stored.set(k,v)}};
globalThis.window={dispatchEvent(e){events.push(e)},addEventListener(){},scrollTo(){}};
globalThis.CustomEvent=class {constructor(type,opts){this.type=type;this.detail=opts.detail}};
globalThis.matchMedia=()=>({matches:true});
const {game,levels,isHit,findTarget,claimReward,readProgress}=await import('../src/game.js');
await import('../src/main.js');
assert.equal((app.innerHTML.match(/class="decode-board/g)||[]).length,1);
assert.ok(app.innerHTML.includes('彩色刺绣背包'));
assert.ok(!app.innerHTML.includes('class="hotspot'));
assert.equal(claimReward(),null,'locked wardrobe cannot draw');
for(let i=0;i<3;i++){
 game.level=i;const t=levels[i].target;
 assert.equal(isHit(i,0,0),false);assert.equal(findTarget(0,0),false);
 assert.equal(game.progress[i].found,false);
 assert.equal(findTarget(t.x+t.w/2,t.y+t.h/2),true);
 assert.equal(game.theme,i);assert.equal(events.at(-1).detail.theme,levels[i].id);
 assert.equal(findTarget(t.x,t.y),false,'no repeated unlock');
 assert.equal(claimReward(()=>.6),3);assert.equal(claimReward(),null,'single draw credit');
 game.unlock=null;
}
assert.equal(events.length,3);
assert.deepEqual(readProgress(localStorage),game.progress);
assert.ok(readProgress({getItem(){return '{bad'}}).every(p=>!p.found));
assert.ok(readProgress({getItem(){return JSON.stringify({spiral:{found:true,reward:99}})}})[0].reward===null);
// Exercise delegated controls and page rerenders.
function click(action,index=0,x=0,y=0){const el={dataset:{action,index:String(index)},disabled:false,getBoundingClientRect(){return {left:0,top:0,width:100,height:100}}};app.handlers.click({target:{closest(sel){if(sel==='.unlock-dialog'||sel==='.unlock-close')return null;return el}},detail:1,clientX:x,clientY:y});}
click('level',1);assert.equal(game.level,1);assert.ok(app.innerHTML.includes('红色民族服饰'));
click('wardrobeTheme',2);assert.equal(game.theme,2);assert.ok(app.innerHTML.includes('当前衣橱：回纹与线条纹'));
click('find',0,20,50);assert.equal(events.length,3);
click('decodeZoom');assert.ok(app.innerHTML.includes('decode-viewport zoomed'));
click('nextLevel');assert.equal(game.level,2);assert.equal(game.zoom,false);
// The self-contained entry parses and runs without ES module support or asset requests.
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*)<\/script>/)[1];
new vm.Script(script);
const sandbox={document,location,localStorage,window,CustomEvent,matchMedia,setTimeout};
vm.runInNewContext(script,sandbox);
assert.ok(app.innerHTML.includes('data:image/jpeg;base64,'));
assert.ok(!app.innerHTML.includes('src="./assets/'));
console.log('PASS: all 3 targets, miss feedback, one-time unlock/draw, persisted progress, theme events, delegated controls, offline entry');
