import { useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame.jsx';
import { motifs, garments } from '../data/site.js';
import { assetUrl } from '../utils/assets.js';
import DecodeGame from '../features/experience/DecodeGame.jsx';
import UnlockDialog from '../features/experience/UnlockDialog.jsx';
import useExperience from '../features/experience/useExperience.js';
import { levels } from '../features/experience/gameModel.js';
import { downloadLook, lookScale } from '../features/experience/saveLook.js';

export default function ExperiencePage({ state = {}, onAction }) {
  const externalMotif = Number.isInteger(state.motif) && motifs[state.motif] ? state.motif : 0;
  const [experience, dispatch] = useExperience(externalMotif);
  const { game, garment, look } = experience;
  const selectedMotif = motifs[experience.motif] || motifs[0];
  const selectedGarment = garments[garment];
  const currentReward = game.progress[game.theme];
  const drawn = currentReward.reward;
  const wardrobeRef = useRef(null);
  const wardrobeFocusRequested = useRef(false);
  const savingRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => () => savingRef.current?.abort(), []);

  useEffect(() => {
    if (game.unlock !== null || !wardrobeFocusRequested.current) return undefined;
    wardrobeFocusRequested.current = false;
    // Wait for the dialog to unmount and restore its trigger before moving on.
    const frame = window.requestAnimationFrame(() => {
      const wardrobe = wardrobeRef.current;
      wardrobe?.focus({ preventScroll: true });
      wardrobe?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [game.unlock]);

  function selectMotif(index) {
    dispatch({ type: 'motif', index });
    onAction?.('motif', index);
  }

  async function save() {
    if (savingRef.current) return;
    const controller = new AbortController();
    savingRef.current = controller;
    setSaving(true);
    setSaveStatus('正在生成形象图……');
    try {
      await downloadLook({ garment: selectedGarment, look, signal: controller.signal });
      if (!controller.signal.aborted) setSaveStatus('形象图已生成，请在浏览器下载中查看。');
    } catch (error) {
      if (!controller.signal.aborted) setSaveStatus(error.message || '保存失败，请稍后重试。');
    } finally {
      if (!controller.signal.aborted) { savingRef.current = null; setSaving(false); }
    }
  }

  function openWardrobe() {
    wardrobeFocusRequested.current = true;
    dispatch({ type: 'dismiss' });
  }

  const drawNote = !currentReward.found
    ? '先在上方找到对应纹样，即可解锁本主题的一次抽取机会。'
    : drawn === null ? '本次抽取消耗1次机会，随机获得1件苗绣服装部件。'
      : `恭喜获得「${garments[drawn].name}」！已为人物试穿，本主题抽取机会已使用。`;

  return <main className="experience-page">
    <section className="decode-section"><div className="decode-inner">
      <div className="side-heading"><span className="seal">非遗</span><h1>寻纹<br />解密</h1><p>在苗绣图案中，<br />寻找并点击隐藏纹样，<br />解锁专属苗绣服饰。</p></div>
      <Frame className="pattern-image-frame"><DecodeGame game={game} dispatch={dispatch} /></Frame>
      <p className="tip">⌕　提示：仔细观察花鸟纹样的细节，也可以使用方向键移动观察点，回车确认。</p>
    </div></section>
    <div className="divider-deco" aria-hidden="true">❧</div>
    <section ref={wardrobeRef} id="wardrobe" className="wardrobe container" tabIndex={-1} aria-label="苗绣衣橱"><Frame className="wardrobe-frame"><div className="wardrobe-layout">
      <div className="side-heading"><span className="seal">抽卡</span><h2>苗绣<br />衣橱</h2><p>解锁纹样后，<br />获得一次抽取机会，<br />领取对应的<br />传统苗绣服饰部件。</p></div>
      <div className="wardrobe-main">
        <div className="motif-tabs" aria-label="了解纹样文化">{motifs.map((item, index) => <button key={item.name} type="button" className={`motif-tab ${index === experience.motif ? 'selected' : ''}`} onClick={() => selectMotif(index)} aria-pressed={index === experience.motif}><span>{item.icon}</span><strong>{item.name}</strong></button>)}</div>
        <div className="wardrobe-theme-tabs level-tabs" aria-label="切换主题衣橱">{levels.map((item, index) => <button key={item.id} type="button" className={game.theme === index ? 'active' : ''} aria-pressed={game.theme === index} onClick={() => dispatch({ type: 'theme', index })}><span>{item.icon}</span>{item.name}<small>{!game.progress[index].found ? '待解锁' : game.progress[index].reward === null ? '可抽取' : '已领取'}</small></button>)}</div>
        <p className="wardrobe-current">当前衣橱：{levels[game.theme].name}</p>
        <div className="card-stage">
          <div className="side-card" aria-hidden="true">{garments[4].emoji}<span>下裙</span></div><div className="side-card" aria-hidden="true">{garments[2].emoji}<span>围腰</span></div>
          <div className={`reward-card ${game.flipping ? 'flipping' : ''}`} aria-live="polite"><div className="reward-icon">{drawn === null ? '🦋' : garments[drawn].emoji}</div><img src={assetUrl('experience/fashion-card.webp')} alt={drawn === null ? '待抽取的苗绣服饰卡片' : `已获得${garments[drawn].name}卡片`} /><strong>{drawn === null ? '苗绣服饰' : garments[drawn].name}</strong><small>{levels[game.theme].name}</small></div>
          <div className="side-card" aria-hidden="true">{garments[3].emoji}<span>袖片</span></div><div className="side-card" aria-hidden="true">{garments[1].emoji}<span>裙摆</span></div>
        </div>
        <button type="button" className="draw-btn" disabled={!currentReward.found || drawn !== null || game.flipping} onClick={() => dispatch({ type: 'draw', random: Math.random() })}>{!currentReward.found ? '寻找纹样后解锁' : drawn !== null ? '本主题已领取' : '单次抽取'}</button>
        <p className="draw-note" role="status">{drawNote}</p>
      </div>
    </div></Frame></section>
    <div className="divider-deco" aria-hidden="true">❧</div>
    <section className="dressup container"><Frame className="dressup-frame"><div className="dressup-layout">
      <div className="side-heading"><span className="seal">互动</span><h2>人物<br />换装</h2><p>使用服饰部件，<br />为苗绣人物自由换装，<br />感受纹样背后的文化魅力。</p><div className="look-picker" aria-label="选择人物形象">{[0, 1, 2, 3].map((index) => <button key={index} type="button" className={look === index ? 'on' : ''} aria-pressed={look === index} onClick={() => dispatch({ type: 'look', index })}><img src={assetUrl('experience/character.webp')} alt={`人物形象${index + 1}`} /></button>)}</div></div>
      <div className="character-stage"><div className="halo" aria-hidden="true" /><img style={{ filter: selectedGarment.filter, transform: `scale(${lookScale(look)})` }} src={assetUrl('experience/character.webp')} alt={`穿着${selectedGarment.name}的传统苗绣卡通人物`} /><div className="character-controls"><button type="button" onClick={() => dispatch({ type: 'reset' })} title="重置" aria-label="重置服饰和人物形象">↶</button><button type="button" onClick={() => dispatch({ type: 'nextLook' })} title="切换形象" aria-label="切换人物形象">⌕</button></div></div>
      <aside className="outfit-panel"><h3>✧ 纹样文化介绍</h3><img className="detail-image" src={assetUrl('experience/pattern-detail.webp')} alt="苗绣纹样刺绣特写" /><h4>{selectedMotif.name}</h4><p>{selectedMotif.desc}</p><h3>✧ 我的服装部件</h3><div className="garment-grid">{garments.map((item, index) => <button key={item.name} type="button" className={garment === index ? 'chosen' : ''} aria-pressed={garment === index} onClick={() => dispatch({ type: 'garment', index })}><span>{item.emoji}</span><small>{item.name}</small></button>)}{[0, 1, 2].map((index) => <span key={index} className="empty-slot" aria-hidden="true">✧</span>)}</div><button type="button" className="save-btn" onClick={save} disabled={saving}>⇩　{saving ? '正在保存……' : '保存形象图'}</button><span className="save-status" role="status">{saveStatus}</span></aside>
    </div></Frame></section>
    {game.unlock !== null && <UnlockDialog index={game.unlock} onClose={() => dispatch({ type: 'dismiss' })} onWardrobe={openWardrobe} onContinue={() => dispatch(game.level < levels.length - 1 ? { type: 'level', index: game.level + 1 } : { type: 'dismiss' })} />}
  </main>;
}
