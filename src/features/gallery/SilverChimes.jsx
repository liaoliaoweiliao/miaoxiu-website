import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createSilverChimeAudio } from './silverChimeAudio.js';

// A contemporary composition inspired by embroidery and Miao silverwork.
// These outlines are drawn for this page, rather than a replica of an artefact.
function Silverwork({ small = false }) {
  const uid = useId().replace(/:/g, '');
  const silver = `url(#${uid}-silver)`;
  const recess = `url(#${uid}-recess)`;
  return (
    <svg viewBox="0 0 180 330" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${uid}-silver`} x1="20" y1="0" x2="150" y2="85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8d9fa7" /><stop offset=".26" stopColor="#d4dedb" />
          <stop offset=".52" stopColor="#b2c1c4" /><stop offset=".72" stopColor="#e0e3d9" /><stop offset="1" stopColor="#849aa5" />
        </linearGradient>
        <linearGradient id={`${uid}-recess`} x2="1" y2="1">
          <stop stopColor="#345568" /><stop offset="1" stopColor="#91a7af" />
        </linearGradient>
        <pattern id={`${uid}-weave`} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 1H4M1 0V4" stroke="#efbe8c" strokeWidth=".42" opacity=".38" />
          <path d="M0 3H4" stroke="#492d31" strokeWidth=".5" opacity=".5" />
        </pattern>
        <g id={`${uid}-bell`}>
          <ellipse cy="-1" rx="2.8" ry="4" stroke="#c8d5d3" strokeWidth="1.1" />
          <path d="M-5 4Q-8 8-8 16L-11 21Q0 26 11 21L8 16Q8 8 5 4Q0 1-5 4Z" fill={silver} stroke="#829aa5" strokeWidth=".8" />
          <path d="M-5 8Q0 5 5 8M-7 17Q0 20 7 17M-8 20Q0 23 8 20" stroke="#5f7a88" strokeWidth=".8" />
          <path d="M-5 10V14M-2 9V15M2 9V15M5 10V14" stroke="#e6e7dd" strokeWidth=".6" />
          <ellipse cy="22" rx="8" ry="1.8" fill="#3e5966" /><path d="M0 21V26" stroke="#b9c7c6" strokeWidth="1.6" strokeLinecap="round" />
        </g>
        <g id={`${uid}-leaf`}>
          <path d="M0 0C-14 9-12 25 0 34C12 23 14 10 0 0Z" fill={silver} stroke="#829ba6" strokeWidth=".8" />
          <path d="M0 3V30M0 11L-6 8M0 17L-8 13M0 23L-7 19M0 12L6 8M0 18L8 13M0 24L7 19" stroke="#617c89" strokeWidth=".8" />
          <path d="M-2 5C-10 13-8 23-2 28" stroke="#e0e5dc" strokeWidth=".7" />
        </g>
      </defs>
      <path d="M90 0V24" stroke="#a8bdc5" strokeWidth="1" />
      <path d="M88 0V23" stroke="#edf0e1" strokeWidth=".35" opacity=".7" />
      <ellipse cx="90" cy="27" rx="4" ry="6" fill={recess} stroke="#bdcece" />
      <g className="chime-silver-crown" data-sway="crown" style={{ transformOrigin: '90px 29px' }}>
        <path d="M90 53C77 31 48 27 37 39C30 50 44 67 64 69C49 72 52 89 65 90C78 91 85 77 90 68C95 77 102 91 115 90C128 89 131 72 116 69C136 67 150 50 143 39C132 27 103 31 90 53Z" fill={silver} stroke="#7e97a2" strokeWidth="1" />
        <path d="M81 54C69 40 48 37 45 43C42 49 54 60 73 60ZM99 54C111 40 132 37 135 43C138 49 126 60 107 60ZM78 70C66 70 60 77 64 82C69 87 77 77 78 70ZM102 70C114 70 120 77 116 82C111 87 103 77 102 70Z" fill={recess} stroke="#e0e6df" strokeWidth=".65" />
        <path d="M49 47Q60 47 71 54M131 47Q120 47 109 54M60 63L65 64M115 64L120 63M69 78L73 74M111 78L107 74M85 44L79 34M95 44L101 34" stroke="#5f7985" strokeWidth="1" strokeLinecap="round" />
        <path d="M41 38Q62 27 83 48M139 38Q118 27 97 48M57 85Q65 94 78 78M123 85Q115 94 102 78" stroke="#edf0e3" strokeWidth=".65" />
        <path d="M40 43C38 53 52 65 73 65M140 43C142 53 128 65 107 65M58 75Q55 85 65 87M122 75Q125 85 115 87" stroke="#6c8792" strokeWidth=".6" strokeDasharray="1 2" />
        <path d="M49 44C51 50 59 54 64 52C70 49 59 44 56 46M131 44C129 50 121 54 116 52C110 49 121 44 124 46" stroke="#a7bdbf" strokeWidth=".65" />
        {[0, 1, 2, 3, 4, 5, 6].map((n) => <g key={n} stroke="#718a94" strokeWidth=".6">
          <path d={`M${48 + n * 4} ${35 + n * n * .19}l-1.1 2.6M${132 - n * 4} ${35 + n * n * .19}l1.1 2.6`} />
          <path d={`M${44 + n * 4} ${57 + n * 1.5}l1 -2M${136 - n * 4} ${57 + n * 1.5}l-1 -2`} />
        </g>)}
        <path d="M90 46C84 50 84 63 90 72C96 63 96 50 90 46Z" fill={silver} stroke="#6d8792" />
        <path d="M88 50V62" stroke="#f0f1e7" strokeWidth=".65" />
        <path d="M86 46Q78 29 75 35M94 46Q102 29 105 35" stroke="#bdcccb" strokeWidth="1.3" />
        {[59, 90, 121].map((x) => <circle key={x} cx={x} cy={x === 90 ? 74 : 89} r="3" fill={recess} stroke="#c4d2d0" strokeWidth="1" />)}
      </g>
      {[{ x: 59, y: 92, length: small ? 80 : 96 }, { x: 90, y: 77, length: 154 }, { x: 121, y: 92, length: small ? 97 : 119 }].map(({ x, y, length }, index) => small && index === 1 ? null : (
        <g key={x} className={`chime-chain chime-chain-${index}`} data-sway="chain" data-part={index} style={{ transformOrigin: `${x}px ${y}px` }}>
          <path d={`M${x} ${y}V${y + length}`} stroke="#658494" strokeWidth="2" />
          <path d={`M${x} ${y}V${y + length}`} stroke="#c4d3d1" strokeWidth="1.5" strokeDasharray="3 2.7" strokeLinecap="round" />
          <path d={`M${x - .7} ${y + 1}V${y + length}`} stroke="#edf0e2" strokeWidth=".4" strokeDasharray="2 3.7" />
          {!small && <g data-sway="silver" style={{ transformOrigin: `${x}px ${y + length * .6}px` }}>
            <path d={`M${x} ${y + length * .6}q${index === 2 ? 9 : -9} 4 ${index === 2 ? 9 : -9} 12`} stroke="#a9bfca" strokeWidth=".8" />
            <use href={`#${uid}-leaf`} transform={`translate(${x + (index === 2 ? 9 : -9)} ${y + length * .6 + 12}) scale(.48)`} />
          </g>}
          <g className="chime-pendant" data-sway={index === 1 ? 'embroidery' : 'silver'} style={{ transformOrigin: `${x}px ${y + length}px` }}>
            {index === 0 && <use href={`#${uid}-bell`} transform={`translate(${x} ${y + length})`} />}
            {index === 2 && <><use href={`#${uid}-leaf`} transform={`translate(${x} ${y + length})`} /><use href={`#${uid}-bell`} transform={`translate(${x} ${y + length + 37}) scale(.6)`} /></>}
            {index === 1 && <g transform={`translate(${x} ${y + length})`}>
              <ellipse cy="0" rx="3" ry="4" stroke="#bdcfcc" />
              <path d="M0 5L24 32L0 61L-24 32Z" fill="#953e39" stroke="#c9ad79" strokeWidth="1.5" />
              <path d="M0 5L24 32L0 61L-24 32Z" fill={`url(#${uid}-weave)`} />
              <path d="M0 10L19 32L0 55L-19 32Z" stroke="#edcd95" strokeWidth="1.1" strokeDasharray="2.5 2" />
              <path d="M0 20C-12 12-17 29-5 31C-17 36-10 48 0 40C10 48 17 36 5 31C17 29 12 12 0 20Z" stroke="#e1bc80" strokeWidth="2.4" />
              <path d="M0 24L5 31L0 37L-5 31Z" fill="#648e83" stroke="#d4c08b" strokeWidth=".8" />
              <path d="M-14 31L-9 32M9 32L14 31M0 44V49M0 14V18M-1 61V68M-5 58L-5 64M4 58L5 65" stroke="#e6b775" strokeWidth="1" />
            </g>}
          </g>
        </g>
      ))}
    </svg>
  );
}

function EmbroideredPetal({ kind }) {
  return <svg viewBox="0 0 34 40" aria-hidden="true">
    {kind === 0 ? <>
      <path d="M17 36C-4 23 4 1 16 7C26-3 39 17 17 36Z" fill="#b35d50" stroke="#d9b180" strokeWidth="1" strokeDasharray="2 1.5" />
      <path d="M17 32L12 12M18 28L23 11M13 27L8 18M21 24L27 16M15 29L18 11" stroke="#e7bb88" strokeWidth=".75" />
    </> : kind === 1 ? <>
      <path d="M5 36C-1 9 16 3 30 4C29 21 22 33 5 36Z" fill="#4d817e" stroke="#c5b482" strokeWidth="1" strokeDasharray="2 1.5" />
      <path d="M6 34L26 8M11 28L9 17M16 23L15 12M20 18L21 8M11 28L23 27M16 22L27 20" stroke="#dfc590" strokeWidth=".9" />
    </> : <>
      <path d="M5 35C-2 20 6 1 29 6C30 19 24 27 5 35Z" fill="#a64c45" stroke="#e0b980" strokeWidth="1" strokeDasharray="2 1.5" />
      <path d="M6 32Q15 16 25 9M9 26Q10 14 22 10M13 25Q24 22 26 14M10 29L18 27" stroke="#e2c18c" strokeWidth="1" />
      <path d="M8 35L4 38M11 33L9 38" stroke="#ca9a78" strokeWidth=".7" />
    </>}
  </svg>;
}

export default function SilverChimes({ active = true }) {
  const rootRef = useRef(null);
  const audioRef = useRef(null);
  const animations = useRef([]);
  const lastGust = useRef(-Infinity);
  const sequence = useRef(0);
  const timers = useRef(new Set());
  const soundIntent = useRef(false);
  const soundRequest = useRef(0);
  const motion = useRef(false);
  const [sound, setSound] = useState(false);
  const [notice, setNotice] = useState('');
  const [petals, setPetals] = useState([]);
  const [wind, setWind] = useState({ sequence: 0, direction: 1 });

  const muteSound = useCallback(() => {
    soundRequest.current += 1;
    soundIntent.current = false;
    audioRef.current?.stop();
    setSound(false);
  }, []);

  const quiet = useCallback(() => {
    muteSound();
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
    setPetals([]);
  }, [muteSound]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { motion.current = preference.matches; quiet(); };
    motion.current = preference.matches;
    preference.addEventListener('change', change);
    const visibility = () => { if (document.hidden) quiet(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', quiet);
    return () => {
      preference.removeEventListener('change', change);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', quiet);
      quiet();
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, [quiet]);

  useEffect(() => { if (!active) quiet(); }, [active, quiet]);

  async function toggleSound() {
    if (soundIntent.current) { muteSound(); return; }
    soundIntent.current = true;
    const request = ++soundRequest.current;
    audioRef.current ??= createSilverChimeAudio();
    const enabled = await audioRef.current.enable();
    if (request !== soundRequest.current) return;
    if (!soundIntent.current) { audioRef.current?.stop(); return; }
    if (!enabled) {
      soundIntent.current = false;
      setNotice('此浏览器暂时无法播放铃声，仍可轻拂观绣。');
      return;
    }
    setNotice('');
    setSound(true);
  }

  function stir(event, side, pointer = false) {
    if (!active || document.hidden || (pointer && event.pointerType !== 'mouse')) return;
    const now = performance.now();
    if (now - lastGust.current < 1400) return;
    lastGust.current = now;
    const bounds = event.currentTarget.getBoundingClientRect();
    const direction = event.detail === 0 && !pointer ? (sequence.current % 2 ? -1 : 1)
      : event.clientX <= bounds.left + bounds.width / 2 ? 1 : -1;
    const id = ++sequence.current;
    setWind({ sequence: id, direction });
    if (soundIntent.current) audioRef.current?.playGust();
    if (motion.current) return;

    // Every part shares the gust, while its mass and material set its response.
    const previous = animations.current;
    const parts = [...rootRef.current.querySelectorAll('[data-sway]')];
    const initial = parts.map((part) => getComputedStyle(part).transform);
    previous.forEach((animation) => animation.cancel());
    animations.current = parts.map((part, index) => {
      const kind = part.dataset.sway;
      const strand = Number(part.dataset.part || 0);
      const amplitude = ({ chain: 6.2 - strand * .65, silver: 9, embroidery: 5.5, crown: 1.8 })[kind] * direction;
      const delay = ({ chain: strand * 55, silver: 145, embroidery: 290, crown: 100 })[kind];
      return part.animate([
        { transform: initial[index] === 'none' ? 'rotate(0deg)' : initial[index], offset: 0 },
        { transform: `rotate(${-amplitude}deg)`, offset: .15 },
        { transform: `rotate(${amplitude * .58}deg)`, offset: .36 },
        { transform: `rotate(${-amplitude * .29}deg)`, offset: .57 },
        { transform: `rotate(${amplitude * .1}deg)`, offset: .78 },
        { transform: 'rotate(0deg)', offset: 1 },
      ], { duration: kind === 'embroidery' ? 4700 : 4200, delay, easing: 'ease-in-out' });
    });
    const count = id % 2 ? 3 : 2;
    const next = Array.from({ length: count }, (_, index) => ({ id: `${id}-${index}`, side, direction, kind: (id + index) % 3, offset: index, duration: 4700 + index * 420 }));
    setPetals((current) => [...current, ...next].slice(-6));
    const timer = window.setTimeout(() => {
      setPetals((current) => current.filter((petal) => !next.some((item) => item.id === petal.id)));
      timers.current.delete(timer);
    }, 6100);
    timers.current.add(timer);
  }

  return <div className="silver-chimes" ref={rootRef} data-wind-sequence={wind.sequence} data-wind-direction={wind.direction}>
    <button type="button" className="silver-chime silver-chime-main" aria-label="轻拂银铃，唤起微风" aria-describedby="silver-chime-hint" onPointerEnter={(event) => stir(event, 'main', true)} onClick={(event) => stir(event, 'main')}>
      <Silverwork />
    </button>
    <button type="button" className="silver-chime silver-chime-echo" aria-label="轻拂小银铃，唤起微风" onPointerEnter={(event) => stir(event, 'echo', true)} onClick={(event) => stir(event, 'echo')}>
      <Silverwork small />
    </button>
    <div className="silver-chime-controls">
      <span className="silver-chime-caption">银铃引绣 · 风过花醒</span>
      <button type="button" className="silver-sound-toggle" onClick={toggleSound} aria-pressed={sound}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5L5 9H2V15H5L9 19V5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />{sound ? <path d="M13 8Q18 12 13 16M16 5Q24 12 16 19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /> : <path d="M14 9L20 15M20 9L14 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />}</svg>
        {sound ? '关闭铃声' : '听银铃'}
      </button>
      <span id="silver-chime-hint" className="silver-chime-hint">轻拂银铃，绣片随风</span>
      <span className="silver-sound-notice" role="status">{notice}</span>
    </div>
    <div className="silver-petal-field" aria-hidden="true">
      {petals.map((petal) => <span key={petal.id} className={`silver-petal silver-petal-${petal.side}`} style={{ '--wind': petal.direction, '--petal-offset': petal.offset, '--fall-time': `${petal.duration}ms` }}><i><EmbroideredPetal kind={petal.kind} /></i></span>)}
    </div>
  </div>;
}
