import { createSoundState, measureMovement, measureSound } from './embroideryInput.js';

const labels = { camera: '摄像头', microphone: '麦克风' };
const emptyInput = { x: 0, y: 0, amount: 0, level: 0 };

function mediaError(error, kind) {
  const label = labels[kind];
  if (['NotAllowedError', 'PermissionDeniedError', 'SecurityError'].includes(error?.name)) return `${label}未获授权；可在浏览器设置中允许后重试，手动互动仍可使用。`;
  if (['NotFoundError', 'DevicesNotFoundError', 'OverconstrainedError'].includes(error?.name)) return `未找到可用${label}，手动互动仍可使用。`;
  if (['NotReadableError', 'TrackStartError'].includes(error?.name)) return `${label}可能被其他程序占用，关闭占用后可重试。`;
  if (error?.name === 'NotSupportedError') return `当前浏览器不支持${label}所需的本地分析，请换用支持的浏览器；手动互动仍可使用。`;
  return `${label}启动或分析失败，请重试；手动互动仍可使用。`;
}

// Owns every device resource, including requests that resolve after cancellation.
// The callbacks publish status only on transitions; samples never enter React.
export function createEmbroideryMedia({ onState, onInput, onPeak }) {
  const slots = Object.fromEntries(Object.keys(labels).map((kind) => [kind, { version: 0, status: 'off', release: null }]));
  let disposed = false;
  function publish(kind, status, message) {
    slots[kind].status = status;
    if (!disposed) onState(kind, { status, message });
  }
  function stop(kind, message = `${labels[kind]}已关闭，手动互动仍可使用。`, status = 'off') {
    const slot = slots[kind];
    slot.version += 1;
    slot.release?.();
    slot.release = null;
    onInput(kind, emptyInput);
    publish(kind, status, message);
  }
  function stopAll(message) {
    for (const kind of Object.keys(slots)) stop(kind, message);
  }
  async function start(kind) {
    const slot = slots[kind];
    if (disposed || slot.status === 'active' || slot.status === 'requesting') return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      publish(kind, 'error', `当前环境不支持${labels[kind]}权限。请用 HTTPS 或 localhost 打开；手动互动仍可使用。`);
      return;
    }
    const version = ++slot.version;
    const current = () => !disposed && slot.version === version;
    let stream;
    let video;
    let audio;
    let source;
    let analyser;
    let timer;
    let ended;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((track) => { track.removeEventListener('ended', ended); track.stop(); });
      if (video) { video.pause(); video.srcObject = null; }
      source?.disconnect();
      analyser?.disconnect();
      if (audio && audio.state !== 'closed') void audio.close().catch(() => {});
    };
    slot.release = release;
    publish(kind, 'requesting', `等待${labels[kind]}授权；可再次点击取消。`);
    try {
      // Resume inside the explicit click gesture for mobile browsers.
      let resumed;
      if (kind === 'microphone') {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) throw new DOMException('AudioContext unavailable', 'NotSupportedError');
        audio = new AudioContext();
        resumed = audio.resume().then(() => null, (error) => error);
      }
      stream = await navigator.mediaDevices.getUserMedia(kind === 'camera'
        ? { video: { width: { ideal: 160 }, height: { ideal: 120 }, frameRate: { ideal: 12, max: 15 }, facingMode: 'user' }, audio: false }
        : { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false }, video: false });
      if (!current()) { stream.getTracks().forEach((track) => track.stop()); release(); return; }
      ended = () => stop(kind, `${labels[kind]}已断开；手动互动仍可使用。`, 'error');
      stream.getTracks().forEach((track) => track.addEventListener('ended', ended));
      let sample;
      if (kind === 'camera') {
        video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.srcObject = stream;
        await video.play();
        if (!current()) { release(); return; }
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 48;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) throw new Error('Camera sampling unavailable');
        let previous;
        sample = () => {
          if (video.readyState < 2) return;
          context.drawImage(video, 0, 0, 64, 48);
          const pixels = context.getImageData(0, 0, 64, 48).data;
          const gray = new Float32Array(64 * 48);
          for (let i = 0; i < gray.length; i += 1) gray[i] = pixels[i * 4] * 0.299 + pixels[i * 4 + 1] * 0.587 + pixels[i * 4 + 2] * 0.114;
          onInput(kind, measureMovement(previous, gray, 64, 48));
          previous = gray;
        };
      } else {
        const resumeError = await resumed;
        if (!current()) { release(); return; }
        if (resumeError) throw resumeError;
        source = audio.createMediaStreamSource(stream);
        analyser = audio.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser); // No connection to speakers, recording or uploads.
        const samples = new Float32Array(analyser.fftSize);
        const sound = createSoundState();
        sample = () => {
          if (audio.state !== 'running') throw new Error('Audio context interrupted');
          analyser.getFloatTimeDomainData(samples);
          const input = measureSound(samples, sound, performance.now());
          onInput(kind, input);
          if (input.peak) onPeak();
        };
      }
      publish(kind, 'active', kind === 'camera' ? '摄像头已开启 · 左右／上下移动身体或手，带动绣纹转向与聚散。' : '麦克风已开启 · 声音带动绣线起伏；明显峰值换纹样，间隔至少 4.5 秒。');
      function poll() {
        if (!current()) return;
        try { sample(); timer = setTimeout(poll, 100); }
        catch (error) { stop(kind, mediaError(error, kind), 'error'); }
      }
      poll();
    } catch (error) {
      release();
      if (current()) stop(kind, mediaError(error, kind), 'error');
    }
  }
  function leave() {
    if (document.hidden) stopAll('页面已隐藏，媒体交互已关闭；返回后可主动重新开启。');
  }
  const pagehide = () => stopAll('已离开页面，媒体交互已关闭。');
  document.addEventListener('visibilitychange', leave);
  window.addEventListener('pagehide', pagehide);
  return {
    toggle(kind) { if (!disposed) { if (['active', 'requesting'].includes(slots[kind].status)) stop(kind); else void start(kind); } },
    stopAll,
    dispose() {
      disposed = true;
      stopAll();
      document.removeEventListener('visibilitychange', leave);
      window.removeEventListener('pagehide', pagehide);
    },
  };
}
