import { useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame.jsx';
import { costumeSets } from '../data/catalog.js';
import { assetUrl } from '../utils/assets.js';
import DecodeGame from '../features/experience/DecodeGame.jsx';
import DrawStage, { ThemeIcon } from '../features/experience/DrawStage.jsx';
import LookViewer from '../features/experience/LookViewer.jsx';
import MiaoDivider from '../features/experience/MiaoDivider.jsx';
import UnlockDialog from '../features/experience/UnlockDialog.jsx';
import useExperience from '../features/experience/useExperience.js';
import useDressupScroll from '../features/experience/useDressupScroll.js';
import { CULTURE, hasOutfit, levels, ownedSets, previewLayers, setById, themeById, visibleCollection } from '../features/experience/gameModel.js';
import { downloadLook } from '../features/experience/saveLook.js';

const genders = [['girl', '苗绣姑娘'], ['boy', '苗绣少年']];

function GenderControls({ drawing = false, game, dispatch, onSelect }) {
  return <div className={`gender-switch ${drawing ? 'draw-gender-switch character-choice' : ''}`} role="group" aria-label={drawing ? '选择你的同行角色' : '切换装扮人物'}>{genders.map(([id, name]) => <button key={id} type="button" data-action={drawing ? 'drawGender' : 'gender'} data-id={id} onClick={() => { dispatch({ type: drawing ? 'drawGender' : 'gender', id }); if (drawing) onSelect?.(); }} aria-pressed={(drawing ? game.drawGender : game.collection.gender) === id} disabled={game.drawing || game.reveal || drawing && Boolean(game.lastDraw)}>
    {drawing ? <><span className="choice-portrait"><img src={assetUrl(`experience/catalog/${id}-base.webp`)} alt={name} /></span><span className="choice-text"><strong>{name}</strong><small>{id === 'girl' ? '与她共赴绣衣之约' : '与他共赴绣衣之约'}</small></span><span className="choice-check" aria-hidden="true">{game.drawGender === id ? '✓' : '◇'}</span></> : name}
  </button>)}</div>;
}

function SealTitle({ kind, image, title, heading = 'h2' }) {
  const Heading = heading;
  return <div className="title-with-seal"><span className={`section-seal section-seal--${kind}`}><img src={assetUrl(`experience/seals/${image}.webp`)} alt={`${kind === 'feiyi' ? '非遗' : kind === 'wardrobe' ? '绣裳' : '苗妆'}印章`} /></span><Heading>{title}</Heading></div>;
}

export default function ExperiencePage({ state = {}, onAction }) {
  const [game, dispatch] = useExperience(state.experienceTheme, state.experienceThemeRequest);
  const collection = visibleCollection(game);
  const theme = themeById(game.theme);
  const unlocked = collection.unlocked.includes(game.theme) && game.found && game.theme === levels[game.level].id;
  const last = setById(game.lastDraw);
  const pool = costumeSets.filter((costume) => costume.theme === game.theme && costume.gender === game.drawGender);
  const owned = ownedSets(collection);
  const shown = owned.filter((costume) => game.filter === 'all' || costume.theme === game.filter);
  const selected = setById(game.selectedCard);
  const culture = selected ? CULTURE[selected.theme] : null;
  const equipped = setById(collection.equipped[collection.gender]);
  const boardRef = useRef(null);
  const wardrobeRef = useRef(null);
  const dressupRef = useRef(null);
  const drawRef = useRef(null);
  const saveRef = useRef(null);
  const avatarRef = useRef(null);
  const collectionRef = useRef(null);
  const [destination, setDestination] = useState(null);
  useDressupScroll(avatarRef, collectionRef);

  useEffect(() => () => saveRef.current?.abort(), []);
  useEffect(() => {
    if (!destination) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const element = destination.kind === 'board' ? boardRef.current : destination.kind === 'wardrobe' ? wardrobeRef.current : destination.kind === 'draw' ? drawRef.current : dressupRef.current;
      const focusTarget = destination.selector ? element?.querySelector(destination.selector) || element : element;
      focusTarget?.focus({ preventScroll: true });
      element?.scrollIntoView({ behavior: destination.kind === 'draw' ? 'instant' : window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: destination.kind === 'board' ? 'center' : 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [destination]);

  const moveTo = (kind, selector) => setDestination({ kind, selector });
  useEffect(() => {
    const target = state.searchTarget;
    if (!target || target.page !== 'experience') return;
    moveTo(target.section, target.kind === 'theme' ? `[data-action="pool"][data-id="${target.theme}"]` : undefined);
  }, [state.searchTarget]);
  function openWardrobe() {
    if (!game.found) return;
    dispatch({ type: 'openWardrobe' });
    moveTo('wardrobe', '[data-action="drawGender"]');
  }
  function nextRound(completed) {
    if (game.drawing || game.reveal || game.found && !completed || completed && (!game.lastDraw || !game.dressed || !hasOutfit(collection))) return;
    dispatch({ type: 'round', completed, random: Math.random() });
    moveTo('board');
  }
  async function save() {
    if (!hasOutfit(collection) || saveRef.current) return;
    const controller = new AbortController();
    saveRef.current = controller;
    dispatch({ type: 'saveStart' });
    try {
      const result = await downloadLook({ layers: previewLayers(collection), gender: collection.gender, signal: controller.signal });
      if (!controller.signal.aborted) dispatch({ type: 'saveDone', result });
    } catch (error) { if (!controller.signal.aborted) dispatch({ type: 'saveDone', error: true, message: error.message }); }
    finally { if (!controller.signal.aborted) saveRef.current = null; }
  }

  return <main className="experience-page">
    <section className="decode-section container"><Frame className="pattern-image-frame"><div className="decode-inner">
      <div className="side-heading"><SealTitle kind="feiyi" image="feiyi" heading="h1" title={<>寻纹<br />解密</>} /><p>一针一线，藏着纹样。<br />在画面中找到一处，<br />开启对应主题衣橱。</p></div>
      <div className="decode-content"><DecodeGame ref={boardRef} game={game} dispatch={dispatch} onPreview={(artwork) => onAction?.('modal', 0, artwork)} onWardrobe={openWardrobe} onRound={nextRound} /></div>
    </div></Frame></section>
    <MiaoDivider />
    <section ref={wardrobeRef} className="wardrobe container" id="miao-wardrobe" tabIndex={-1} aria-label="苗绣衣橱"><Frame className="wardrobe-frame"><div className="wardrobe-layout">
      <div className="side-heading"><SealTitle kind="wardrobe" image="miaozhuang" title={<>苗绣<br />衣橱</>} /><p>寻纹开启主题卡池。<br />选择角色，抽取套装，<br />将针线之美收入藏品库。</p><small className="collection-total">已收藏 {collection.owned.length} 套</small>{unlocked && <div className="gender-prompt"><span className="eyebrow">绣衣之约</span><h3>选择同行角色</h3><GenderControls drawing game={game} dispatch={dispatch} onSelect={() => moveTo('draw')} /></div>}</div>
      <div className="wardrobe-main"><div className="motif-tabs">{levels.map((level) => <button key={level.id} type="button" className={`motif-tab ${game.theme === level.id ? 'selected' : ''} ${!collection.unlocked.includes(level.id) ? 'locked' : ''}`} data-action="pool" data-id={level.id} onClick={() => dispatch({ type: 'pool', id: level.id })} disabled={game.drawing || game.reveal || Boolean(last)} aria-pressed={game.theme === level.id}><span><ThemeIcon theme={level} /></span><strong>{level.name}</strong>{!collection.unlocked.includes(level.id) && <small>🔒 寻纹后解锁</small>}</button>)}</div>
        {unlocked ? <>
          {game.drawGender ? <div ref={drawRef} className="wardrobe-draw" tabIndex={-1} aria-label="本轮服装抽取"><p className="theme-status">{game.drawGender === 'girl' ? '苗绣姑娘' : '苗绣少年'} · {theme.name}主题</p><DrawStage game={game} pool={pool} theme={theme} last={last} /><button type="button" className="draw-btn" data-action="draw" onClick={() => dispatch({ type: 'drawStart' })} disabled={game.drawing || game.reveal || Boolean(last)}>{game.drawing ? '抽取中…' : game.reveal ? '套装揭晓…' : last ? '本轮已抽取一套' : '抽取整套服装'}</button><p className="draw-note" role="status" aria-live="polite">{game.collectionNote || '抽到的套装自动收藏，可前往人物装扮一键穿戴。'}</p><button type="button" className="save-btn loop-step-btn draw-next-step" data-action="openDressup" disabled={!last || game.drawing || game.reveal} onClick={() => moveTo('dressup', '.owned-card .wear-full')}>查看藏品并装扮 →</button></div> : <div className="gender-await"><span>♙</span><p>请选择苗绣姑娘或苗绣少年，开启专属苗绣衣橱。</p></div>}
        </> : <div className="pool-locked"><span>♙</span><h3>{theme.name}卡池尚未解锁</h3><p>先找到对应图片中的纹样，即可进入这个主题卡池。</p><button type="button" className="save-btn" data-action="backToPuzzle" onClick={() => moveTo('board')}>返回寻纹</button></div>}
      </div>
    </div></Frame></section>
    <MiaoDivider />
    <section ref={dressupRef} className="dressup container" id="miao-dressup" tabIndex={-1} aria-label="人物装扮"><Frame className="dressup-frame">
      <div className="dressup-heading"><div><span className="eyebrow">把收藏穿在身上</span><SealTitle kind="dressup" image="xiuchang" title="人物装扮" /></div><GenderControls game={game} dispatch={dispatch} /></div>
      <div className="atelier-grid"><div ref={avatarRef} className="avatar-panel"><LookViewer collection={collection} revision={game.wearRevision} /><div className="outfit-summary">{equipped && <small>当前穿戴</small>}<strong>{equipped ? `${equipped.name} · ${themeById(equipped.theme).name}` : '原始形象'}</strong></div><div className="avatar-actions"><button type="button" data-action="resetOutfit" onClick={() => dispatch({ type: 'reset' })} disabled={!hasOutfit(collection)}>恢复原始形象</button><button type="button" data-action="save" onClick={save} disabled={!hasOutfit(collection) || game.saving}>{game.saving ? '正在保存…' : '⇩ 保存效果图'}</button></div><p className="save-status" role="status">{game.saveNote}</p>{game.found && <><button type="button" className="save-btn loop-next-btn" data-action="finishLoop" onClick={() => nextRound(true)} disabled={!game.lastDraw || !game.dressed || !hasOutfit(collection) || game.drawing || game.reveal}>↻ 完成装扮，随机抽图再玩一轮</button>{!game.dressed && <small className="dressup-instruction">穿戴任意一套已收藏的完整服装，即可点击完成，开启下一轮。</small>}</>}</div>
        <div ref={collectionRef} className="collection-panel"><div className="collection-heading"><h3>我的藏品库</h3><span>{collection.gender === 'girl' ? '苗绣姑娘' : '苗绣少年'} · {owned.length} 套</span></div><div className="collection-filters" role="group" aria-label="筛选藏品主题">{[{ id: 'all', name: '全部' }, ...levels].map((level) => <button key={level.id} type="button" data-action="collectionFilter" data-id={level.id} onClick={() => dispatch({ type: 'filter', id: level.id })} aria-pressed={game.filter === level.id}>{level.name}</button>)}</div>
          {shown.length ? <div className="owned-grid">{shown.map((costume) => <article key={costume.id} className={`owned-card ${game.selectedCard === costume.id ? 'inspected' : ''} ${equipped?.id === costume.id ? 'is-equipped' : ''}`}><button type="button" className="inspect-card" data-action="equip" data-id={costume.id} onClick={() => dispatch({ type: 'equip', id: costume.id })} aria-label={`整套穿戴${costume.name}并了解纹样文化`}><img src={assetUrl(costume.card)} alt={`已收藏的${costume.name}套装`} loading="lazy" /><strong>{costume.name}</strong><small>{themeById(costume.theme).name}</small></button><button type="button" className="wear-full" data-action="equip" data-id={costume.id} onClick={() => dispatch({ type: 'equip', id: costume.id })} aria-pressed={equipped?.id === costume.id}>{equipped?.id === costume.id ? '✓ 已整套穿戴' : '整套穿戴'}</button></article>)}</div> : <div className="collection-empty"><span>✧</span><h4>{owned.length ? '暂无这个主题的藏品' : '还没有这个角色的服装卡'}</h4><p>解锁主题衣橱并选择角色抽卡，整套服装会自动出现在这里。</p><button type="button" className="save-btn" data-action="browseWardrobe" onClick={() => moveTo('wardrobe')}>前往苗绣衣橱</button></div>}
          <aside className="motif-culture" aria-live="polite"><span className="eyebrow">纹样文化</span>{culture ? <><h3>{culture.title}</h3><p>{culture.text}</p><small>当前选中：{selected.name} · 整套服装</small></> : <><h3>从一套服装，认识一种纹样</h3><p>点击已收藏的套装，为人物整套穿戴，同时了解它对应的苗绣纹样。</p></>}</aside>
        </div>
      </div>
    </Frame></section>
    {game.unlock && <UnlockDialog theme={game.unlock} onClose={() => dispatch({ type: 'dismiss' })} onWardrobe={openWardrobe} />}
  </main>;
}
