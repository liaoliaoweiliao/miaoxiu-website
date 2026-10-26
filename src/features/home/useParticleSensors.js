import { useEffect, useRef, useState } from 'react';
import { motionSignal, soundEnergy } from './particleModel.js';

const errors = (error, kind) => error.name === 'NotAllowedError'
  ? `${kind}权限未开启，可继续使用鼠标或触屏`
  : error.name === 'NotFoundError' ? `没有找到${kind}，可继续手动体验` : `${kind}暂不可用，请检查设备后重试`;

export default function useParticleSensors(signal, onImpulse) {
  const videoRef = useRef(null), resources = useRef({}), alive = useRef(false);
  const [camera, setCamera] = useState('off'), [microphone, setMicrophone] = useState('off');
  const [notice, setNotice] = useState(''), [levels, setLevels] = useState({ camera: 0, microphone: 0 });
  const impulseRef = useRef(onImpulse); impulseRef.current = onImpulse;

  function stop(kind) {
    const item = resources.current[kind];
    if (item) {
      delete resources.current[kind]; // Invalidates a permission request still in flight.
      item.stream?.getTracks().forEach(track => { track.onended = null; track.stop(); });
      item.source?.disconnect();
      item.context?.close().catch(() => {});
    }
    if (kind === 'camera' && videoRef.current) videoRef.current.srcObject = null;
    if (kind === 'camera') { signal.current.motion = 0; signal.current.body = { x: 0, y: 0 }; }
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
        ? { video: { width: { ideal: 160 }, height: { ideal: 120 }, facingMode: 'user' }, audio: false }
        : { audio: { echoCancellation: true, noiseSuppression: true }, video: false });
      if (!alive.current || resources.current[kind] !== item || document.hidden) { stream.getTracks().forEach(track => track.stop()); if (resources.current[kind] === item) stop(kind); return; }
      item.stream = stream;
      for (const track of stream.getTracks()) track.onended = () => {
        if (resources.current[kind] === item) { stop(kind); setNotice(`${kind === 'camera' ? '摄像头' : '麦克风'}已断开，可重新开启。`); }
      };
      if (kind === 'camera') {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
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
      if (alive.current && resources.current[kind] === item) { stop(kind); setNotice(errors(error, kind === 'camera' ? '摄像头' : '麦克风')); }
    }
  }

  useEffect(() => {
    alive.current = true;
    const sample = document.createElement('canvas'); sample.width = 40; sample.height = 30;
    const context = sample.getContext('2d', { willReadFrequently: true });
    let lastImpulse = 0;
    const interval = setInterval(() => {
      if (document.hidden) return;
      const cam = resources.current.camera, mic = resources.current.microphone;
      let motion = 0, audio = 0;
      if (cam?.stream && videoRef.current?.readyState >= 2 && context) {
        context.drawImage(videoRef.current, 0, 0, 40, 30);
        const rgba = context.getImageData(0,0,40,30).data, gray = new Uint8Array(1200);
        for (let i=0;i<gray.length;i++) gray[i]=(rgba[i*4]+rgba[i*4+1]+rgba[i*4+2])/3;
        const result=motionSignal(gray,cam.previous,40,30); cam.previous=gray;
        motion=result.energy;
        if (motion > .025) signal.current.body={x:result.x,y:result.y};
      }
      if (mic?.analyser) { mic.analyser.getByteTimeDomainData(mic.samples); audio=soundEnergy(mic.samples); }
      signal.current.motion=motion; signal.current.audio=audio;
      if ((motion > .28 || audio > .42) && performance.now()-lastImpulse > 2800) { lastImpulse=performance.now(); impulseRef.current(); }
      if (cam || mic) setLevels({ camera: motion, microphone: audio });
    },100);
    const hide = () => { if (document.hidden) { stop('camera'); stop('microphone'); } };
    document.addEventListener('visibilitychange',hide);
    return () => { alive.current=false; clearInterval(interval); document.removeEventListener('visibilitychange',hide); stop('camera'); stop('microphone'); };
  }, []);
  return { videoRef, camera, microphone, notice, levels, toggle };
}
