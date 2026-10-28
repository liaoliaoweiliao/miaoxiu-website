import { useEffect, useRef, useState } from 'react';
import { soundEnergy } from './particleModel.js';
import { assetUrl } from '../../utils/assets.js';
import { classifyHand, initialGesture, stabilizeGesture } from './handGestureModel.js';

const errors = (error, kind) => error.name === 'NotAllowedError'
  ? `${kind}权限未开启，可继续使用鼠标或触屏`
  : error.name === 'NotFoundError' ? `没有找到${kind}，可继续手动体验` : `${kind}暂不可用，请检查设备后重试`;

export default function useParticleSensors(signal, onImpulse, onGesture) {
  const videoRef = useRef(null), resources = useRef({}), alive = useRef(false);
  const [camera, setCamera] = useState('off'), [microphone, setMicrophone] = useState('off');
  const [gesture,setGesture]=useState('请将手掌放入镜头');
  const gestureRef=useRef(onGesture);gestureRef.current=onGesture;
  const [notice, setNotice] = useState(''), [levels, setLevels] = useState({ camera: 0, microphone: 0 });
  const impulseRef = useRef(onImpulse); impulseRef.current = onImpulse;

  function stop(kind) {
    const item = resources.current[kind];
    if (item) {
      delete resources.current[kind]; // Invalidates a permission request still in flight.
      item.stream?.getTracks().forEach(track => { track.onended = null; track.stop(); });
      clearTimeout(item.timeout);item.worker?.terminate();
      item.rejectReady?.(new Error('识别请求已取消'));item.rejectReady=null;
      item.source?.disconnect();
      item.context?.close().catch(() => {});
    }
    if (kind === 'camera' && videoRef.current) videoRef.current.srcObject = null;
    if (kind === 'camera') { if(alive.current)setGesture('请将手掌放入镜头');signal.current.motion = 0; signal.current.body = { x: 0, y: 0 }; }
    else signal.current.audio = 0;
    if (alive.current) {
      (kind === 'camera' ? setCamera : setMicrophone)('off');
      setLevels(current => ({ ...current, [kind]: 0 }));
    }
  }

  async function toggle(kind) {
    if (resources.current[kind]) { stop(kind); return; }
    setNotice('');
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setNotice('摄像头与麦克风需要 HTTPS 或 localhost；仍可使用鼠标、触屏和按钮。'); return;
    }
    const item = {}; resources.current[kind] = item;
    const setStatus = kind === 'camera' ? setCamera : setMicrophone;
    setStatus('pending');
    try {
      const stream = await navigator.mediaDevices.getUserMedia(kind === 'camera'
        ? { video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false }
        : { audio: { echoCancellation: true, noiseSuppression: true }, video: false });
      if (!alive.current || resources.current[kind] !== item || document.hidden) { stream.getTracks().forEach(track => track.stop()); if (resources.current[kind] === item) stop(kind); return; }
      item.stream = stream;
      for (const track of stream.getTracks()) track.onended = () => {
        if (resources.current[kind] === item) { stop(kind); setNotice(`${kind === 'camera' ? '摄像头' : '麦克风'}已断开，可重新开启。`); }
      };
      if (kind === 'camera') {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        if(resources.current[kind]!==item)return;
        item.gesture=initialGesture();
        setNotice('正在加载本地手部识别…');
        item.worker=new Worker(new URL('./handTracking.worker.js',import.meta.url),{type:'module'});
        await new Promise((resolve,reject)=>{
          item.rejectReady=reject;
          item.timeout=setTimeout(()=>reject(new Error('手部识别加载超时')),45000);
          item.worker.onerror=()=>{
            if(item.rejectReady)item.rejectReady(new Error('手部识别启动失败'));
            else if(resources.current.camera===item){stop('camera');setNotice('本地手部识别中断，请重试或使用下方按钮。');}
          };
          item.worker.onmessage=({data})=>{
            if(resources.current.camera!==item)return;
            if(data.type==='ready') {
              clearTimeout(item.timeout);item.rejectReady=null;item.ready=true;setNotice('');resolve();
            } else if(data.type==='error') {
              if(item.rejectReady)item.rejectReady(new Error(data.message));
              else {stop('camera');setNotice('本地手部识别暂不可用，请重试或使用下方按钮。');}
            } else if(data.type==='landmarks') {
              item.busy=false;
              const now=performance.now(),pose=classifyHand(data.worldPoints||data.points);
              item.gesture=stabilizeGesture(item.gesture,pose,now);
              setGesture(pose==='open'?'已识别：张手':pose==='fist'?'已识别：握拳':pose==='none'?'未检测到手，请将整只手放入镜头':'请握拳或张开手掌');
              if(data.points){const wrist=data.points[0];signal.current.body={x:1-wrist.x*2,y:1-wrist.y*2};signal.current.motion=pose==='open'?.45:pose==='fist'?.08:.15;}
              else {signal.current.motion=0;signal.current.body={x:0,y:0};}
              if(item.gesture.event)gestureRef.current(item.gesture.event);
            }
          };
          item.worker.postMessage({type:'init',root:assetUrl('home/hand-tracking'),model:assetUrl('home/hand-tracking/hand_landmarker.task')});
        });
      } else {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) throw new Error('AudioContext unavailable');
        item.context = new Audio();
        item.analyser = item.context.createAnalyser(); item.analyser.fftSize = 512;
        item.source = item.context.createMediaStreamSource(stream); item.source.connect(item.analyser);
        item.samples = new Uint8Array(item.analyser.fftSize);
        await item.context.resume();
      }
      if (alive.current && resources.current[kind] === item) setStatus('on');
    } catch (error) {
      if (alive.current && resources.current[kind] === item) { stop(kind); setNotice(kind==='camera'&&item.worker?'本地手部识别启动失败，请重试或使用下方按钮。':errors(error, kind === 'camera' ? '摄像头' : '麦克风')); }
    }
  }

  useEffect(() => {
    alive.current = true;
    let lastImpulse = 0;
    const interval = setInterval(() => {
      if (document.hidden) return;
      const cam = resources.current.camera, mic = resources.current.microphone;
      let audio = 0;
      if (cam?.ready&&!cam.busy&&videoRef.current?.readyState>=2) {
        cam.busy=true;
        createImageBitmap(videoRef.current).then(bitmap=>{
          if(resources.current.camera!==cam){bitmap.close();return;}
          cam.worker.postMessage({type:'frame',bitmap,timestamp:performance.now()},[bitmap]);
        }).catch(()=>{if(resources.current.camera===cam)cam.busy=false;});
      }
      if (mic?.analyser) { mic.analyser.getByteTimeDomainData(mic.samples); audio=soundEnergy(mic.samples); }
      signal.current.audio=audio;
      if ((audio > .42) && performance.now()-lastImpulse > 2800) { lastImpulse=performance.now(); impulseRef.current(); }
      if (cam || mic) setLevels({ camera: signal.current.motion, microphone: audio });
    },100);
    const hide = () => { if (document.hidden) { stop('camera'); stop('microphone'); } };
    document.addEventListener('visibilitychange',hide);
    return () => { alive.current=false; clearInterval(interval); document.removeEventListener('visibilitychange',hide); stop('camera'); stop('microphone'); };
  }, []);
  return { videoRef, camera, microphone, notice, levels, gesture, toggle };
}
