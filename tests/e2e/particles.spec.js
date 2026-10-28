import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const hands=JSON.parse(readFileSync(new URL('../fixtures/hand-landmarks.json',import.meta.url)));

test.beforeEach(async ({ page }) => {
  page.errors=[];page.on('pageerror',error=>page.errors.push(error.message));
});
test.afterEach(async ({ page })=>{expect(page.errors).toEqual([]);});

async function enter(page) {
  await page.getByRole('button',{name:'点击布上的粒子蝴蝶，开启互动',exact:true}).click();
  await expect(page.locator('.particle-heritage')).toHaveAttribute('data-phase','interactive',{timeout:15000});
}

const pixels = async canvas => canvas.evaluate(element=>{
  const gl=element.getContext('webgl'),data=new Uint8Array(element.width*element.height*4);
  gl.readPixels(0,0,element.width,element.height,gl.RGBA,gl.UNSIGNED_BYTE,data);
  let lit=0,hash=0;for(let i=0;i<data.length;i+=4){if(data[i+3]>0)lit++;hash=(hash+data[i]*(i%1009))%1000000007;}return {lit,hash};
});

test('particle weaver and cloth disappear before the butterfly finishes its straight flight',async({page})=>{
  await page.goto('/');
  const scene=page.locator('.weaving-canvas'),section=page.locator('.particle-heritage');
  await scene.scrollIntoViewIfNeeded();await expect(scene).toHaveAttribute('data-ready','true',{timeout:15000});
  const lit=async(leftOnly)=>scene.evaluate((canvas,left)=>{
    const data=canvas.getContext('2d').getImageData(0,0,left?Math.floor(canvas.width*.2):canvas.width,canvas.height).data;
    let count=0;for(let i=3;i<data.length;i+=4)if(data[i])count++;return count;
  },leftOnly);
  await expect.poll(()=>lit(true)).toBeGreaterThan(300);
  await expect(page.getByRole('button',{name:'开启摄像头',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'点击布上的粒子蝴蝶，开启互动',exact:true}).click();
  await expect(section).toHaveAttribute('data-phase','flying');
  await expect.poll(()=>scene.evaluate(canvas=>Number(canvas.dataset.progress))).toBeGreaterThan(.3);
  expect(await lit(true)).toBe(0);
  expect(await lit(false)).toBeGreaterThan(100);
  await expect(section).toHaveAttribute('data-phase','interactive',{timeout:15000});
  await expect(scene).toHaveCount(0);
  const layout=await section.evaluate(el=>({canvas:el.querySelector('.particle-stage').getBoundingClientRect().bottom,sensors:el.querySelector('.particle-sensor-panel').getBoundingClientRect().top}));
  expect(layout.sensors).toBeGreaterThanOrEqual(layout.canvas-1);
});

test('real particle canvas renders, morphs, rotates and regroups without requesting devices',async({page})=>{
  await page.addInitScript(()=>{
    window.deviceRequests=0;navigator.mediaDevices.getUserMedia=async()=>{window.deviceRequests++;throw new DOMException('Denied','NotAllowedError');};
    window.ribbonVertices=0;const draw=WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays=function(mode,first,count){if(mode===this.TRIANGLES)window.ribbonVertices=count;return draw.call(this,mode,first,count);};
  });
  await page.goto('/');
  await enter(page);
  const canvas=page.locator('.particle-main-canvas');await canvas.scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute('data-ready','true',{timeout:15000});
  await expect.poll(async()=> (await pixels(canvas)).lit).toBeGreaterThan(3000);
  const initial=await pixels(canvas);
  await page.evaluate(()=>{Math.random=()=>.9;});await canvas.focus();await page.keyboard.press('Enter');
  await expect(page.locator('.particle-heritage')).toHaveAttribute('data-motif','1');
  await expect.poll(async()=> (await pixels(canvas)).hash).not.toBe(initial.hash);
  await canvas.focus();await page.keyboard.press('ArrowRight');
  const revision=await page.locator('.particle-heritage').getAttribute('data-revision');
  await canvas.press('Enter');
  await expect(page.locator('.particle-heritage')).not.toHaveAttribute('data-revision',revision);
  await expect.poll(()=>canvas.evaluate(c=>Number(c.dataset.pull))).toBeGreaterThan(.15);
  await expect(canvas).toHaveAttribute('data-strands','6000');
  await expect.poll(()=>page.evaluate(()=>window.ribbonVertices)).toBeGreaterThan(10000);
  expect(await canvas.evaluate(c=>c.getContext('webgl').getError())).toBe(0);
  expect(await page.evaluate(()=>window.deviceRequests)).toBe(0);
  await page.getByRole('button',{name:'开启摄像头',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('摄像头权限未开启');
  await expect(page.getByRole('button',{name:'开启摄像头',exact:true})).toBeVisible();
});

test('actual local hand model ignores blank camera motion and releases streams on stop, hide and navigation',async({page})=>{
  test.setTimeout(60000);
  await page.addInitScript(()=>{
    window.capturedTracks=[];window.requested=[];
    navigator.mediaDevices.getUserMedia=async constraints=>{
      window.requested.push(constraints);
      let stream;
      if(constraints.video){
        const canvas=document.createElement('canvas');canvas.width=160;canvas.height=120;
        const ctx=canvas.getContext('2d');let bright=false;
        window.fakeTimer=setInterval(()=>{ctx.fillStyle=bright?'white':'black';ctx.fillRect(0,0,160,120);bright=!bright;},110);
        stream=canvas.captureStream(20);window.fakeCamera=canvas;
      }else{
        const context=new AudioContext(),osc=context.createOscillator(),destination=context.createMediaStreamDestination();
        osc.connect(destination);osc.start();stream=destination.stream;window.fakeAudio=context;
      }
      window.capturedTracks.push(...stream.getTracks());return stream;
    };
  });
  await page.goto('/');
  await enter(page);
  await page.getByRole('button',{name:'开启摄像头',exact:true}).click();
  await expect(page.getByRole('button',{name:'关闭摄像头',exact:true})).toHaveAttribute('aria-pressed','true',{timeout:30000});
  await expect(page.locator('.particle-camera')).toBeVisible();
  await expect(page.locator('.particle-camera span')).toContainText('未检测到手',{timeout:15000});
  await expect.poll(()=>page.locator('.particle-sensor-buttons i').first().evaluate(e=>Number(e.style.getPropertyValue('--level')))).toBe(0);
  await expect(page.locator('.particle-heritage')).toHaveAttribute('data-form','motif');
  await page.getByRole('button',{name:'开启麦克风',exact:true}).click();
  await expect(page.getByRole('button',{name:'关闭麦克风',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect.poll(()=>page.locator('.particle-sensor-buttons i').last().evaluate(e=>Number(e.style.getPropertyValue('--level')))).toBeGreaterThan(.1);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.getByRole('button',{name:'开启摄像头',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'开启麦克风',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>window.capturedTracks.every(track=>track.readyState==='ended'))).toBe(true);
  await page.evaluate(()=>Object.defineProperty(document,'hidden',{configurable:true,value:false}));
  await page.getByRole('button',{name:'开启麦克风',exact:true}).click();
  await expect(page.getByRole('button',{name:'关闭麦克风',exact:true})).toBeVisible();
  await page.goto('/#history');
  expect(await page.evaluate(()=>window.capturedTracks.every(track=>track.readyState==='ended'))).toBe(true);
});

test('cancelled pending permission releases a late stream and WebGL failure retains original images',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind==='webgl'?null:original.call(this,kind,...args);};
    navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>{window.resolveMedia=()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=10;window.lateTrack=canvas.captureStream().getVideoTracks()[0];resolve(new MediaStream([window.lateTrack]));};});
  });
  await page.goto('/');await enter(page);await page.locator('.particle-stage').scrollIntoViewIfNeeded();
  await expect(page.locator('.particle-fallback')).toContainText('已显示原图');
  await page.evaluate(()=>{Math.random=()=>.9;});await page.locator('.particle-main-canvas').press('Enter');
  await expect(page.locator('.particle-original')).toHaveAttribute('viewBox','0 0 540 640');
  await page.getByRole('button',{name:'开启摄像头',exact:true}).click();
  await page.getByRole('button',{name:'取消摄像头请求',exact:true}).click();
  await page.evaluate(()=>window.resolveMedia());
  await expect.poll(()=>page.evaluate(()=>window.lateTrack.readyState)).toBe('ended');
  await expect(page.locator('.particle-camera')).toBeHidden();
});

test('five supplied motifs pair with individual applications and render up to one million silk particles',async({page})=>{
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await enter(page);
  const canvas=page.locator('.particle-main-canvas');
  const choices=page.getByLabel('选择纹样与现代应用');
  await expect(choices.locator('option')).toHaveCount(5);
  for(const [index,key] of ['butterfly','bird','dragon','spiral','geometric'].entries()){
    await choices.selectOption(String(index));
    await expect(page.locator('.particle-heritage')).toHaveAttribute('data-pair',key);
    await expect(canvas).toHaveAttribute('data-ready','true',{timeout:15000});
    await expect(canvas).toHaveAttribute('data-particles','200000');
    await expect.poll(async()=> (await pixels(canvas)).lit).toBeGreaterThan(3000);
    await page.getByRole('button',{name:'查看现代应用',exact:true}).click();
    await expect(page.locator('.particle-heritage')).toHaveAttribute('data-form','application');
    await expect.poll(async()=> (await pixels(canvas)).lit).toBeGreaterThan(3000);
    await page.getByRole('button',{name:'返回传统纹样',exact:true}).click();
  }
  for(const density of ['500000','1000000','200000']){
    await page.getByLabel('选择丝线粒子数量').selectOption(density);
    await expect(canvas).toHaveAttribute('data-ready','true',{timeout:20000});
    await expect(canvas).toHaveAttribute('data-particles',density);
    await expect.poll(async()=> (await pixels(canvas)).lit).toBeGreaterThan(3000);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(await page.evaluate(()=>innerWidth));
});


test('open palm unfolds the network, fist freezes its pixels and reopening continues the same transition',async({page})=>{
  await page.addInitScript(hands=>{
    window.handPose='none';window.workerStops=0;window.handTracks=[];
    const Original=window.Worker;
    window.Worker=class {
      constructor(url,options){if(!String(url).includes('handTracking.worker'))return new Original(url,options);}
      postMessage(data){if(data.type==='init')setTimeout(()=>this.onmessage?.({data:{type:'ready'}}),30);
        else {data.bitmap.close();setTimeout(()=>this.onmessage?.({data:{type:'landmarks',points:hands[window.handPose]||null,worldPoints:window.handPose==='open'?hands.worldOpen:window.handPose==='fist'?hands.worldFist:null}}),5);}}
      terminate(){window.workerStops++;this.onmessage=null;}
    };
    navigator.mediaDevices.getUserMedia=async()=>{
      const canvas=document.createElement('canvas');canvas.width=640;canvas.height=480;canvas.getContext('2d').fillRect(0,0,640,480);
      const stream=canvas.captureStream(10);window.handTracks.push(...stream.getTracks());return stream;
    };
  },hands);
  await page.goto('/');await enter(page);
  await page.getByRole('button',{name:'开启摄像头',exact:true}).click();
  await expect(page.getByRole('button',{name:'关闭摄像头',exact:true})).toBeVisible();
  const section=page.locator('.particle-heritage'),canvas=page.locator('.particle-main-canvas');
  await canvas.scrollIntoViewIfNeeded();
  await page.evaluate(()=>window.handPose='fist');await expect(section).toHaveAttribute('data-motion','held');
  await page.evaluate(()=>window.handPose='open');await expect(section).toHaveAttribute('data-motion','flowing');
  await expect.poll(()=>canvas.evaluate(c=>Number(c.dataset.pull)>.1&&Number(c.dataset.pull)<.9)).toBe(true);
  await expect(canvas).toHaveAttribute('data-layers','12');
  await page.evaluate(()=>window.handPose='fist');await expect(section).toHaveAttribute('data-motion','held');
  const frozen=await pixels(canvas),clock=await canvas.getAttribute('data-clock'),progress=Number(await canvas.getAttribute('data-pull'));
  await page.mouse.move(200,300);await page.waitForTimeout(600);
  expect(await pixels(canvas)).toEqual(frozen);
  await expect(canvas).toHaveAttribute('data-clock',clock);
  expect(Number(await canvas.getAttribute('data-pull'))).toBe(progress);
  await expect(section).toHaveAttribute('data-pair','butterfly');
  await page.evaluate(()=>window.handPose='open');await expect(section).toHaveAttribute('data-motion','flowing');
  await expect.poll(()=>canvas.evaluate(c=>Number(c.dataset.pull))).toBeGreaterThan(progress);
  expect(Number(await canvas.getAttribute('data-pull'))).toBeLessThan(progress+.35);
  await expect.poll(()=>pixels(canvas)).not.toEqual(frozen);
  await page.evaluate(()=>window.handPose='none');await expect(section).toHaveAttribute('data-motion','held');
  const lost=await pixels(canvas);await page.waitForTimeout(350);expect(await pixels(canvas)).toEqual(lost);
  await page.getByRole('button',{name:'关闭摄像头',exact:true}).click();
  expect(await page.evaluate(()=>window.workerStops)).toBe(1);
  expect(await page.evaluate(()=>window.handTracks.every(t=>t.readyState==='ended'))).toBe(true);
});

test('cancelling local model initialization terminates the worker and stops already granted camera tracks',async({page})=>{
  await page.addInitScript(()=>{
    window.workerStops=0;
    window.Worker=class {postMessage(){} terminate(){window.workerStops++;}};
    navigator.mediaDevices.getUserMedia=async()=>{const c=document.createElement('canvas');c.width=c.height=10;c.getContext('2d');const s=c.captureStream(10);setInterval(()=>c.getContext('2d').fillRect(0,0,10,10),60);window.pendingTrack=s.getVideoTracks()[0];return s;};
  });
  await page.goto('/');await enter(page);await page.getByRole('button',{name:'开启摄像头',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('正在加载本地手部识别');
  await page.getByRole('button',{name:'取消摄像头请求',exact:true}).click();
  await expect(page.getByRole('button',{name:'开启摄像头',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>window.workerStops)).toBe(1);
  expect(await page.evaluate(()=>window.pendingTrack.readyState)).toBe('ended');
});
