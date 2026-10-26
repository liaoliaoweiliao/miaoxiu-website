import { colorChoices, colorMotifs } from '../../data/history.js';
import { assetUrl } from '../../utils/assets.js';
import { colorLayerPlan } from './historyModel.js';

export default function ColorLab({ state, dispatch }) {
  const motif = colorMotifs[state.colorMotif], picked = state.colors, layers = colorLayerPlan(picked);
  const rightColor = colorChoices[picked.includes(state.color) ? state.color : (picked.at(-1) ?? 0)];
  return (
    <div className="color-lab">
      <article className="color-lab-panel motif-picker-panel"><h3>✥　选择纹样</h3>
        <div className="color-motif-tabs">{colorMotifs.map((item, index) => <button key={item.key} type="button" className={`color-motif-tab ${index === state.colorMotif ? 'is-active' : ''}`} aria-pressed={index === state.colorMotif} onClick={() => dispatch({ type: 'colorMotif', index })}>{item.name}</button>)}</div>
        <button type="button" className={`color-motif-art ${picked.length ? 'has-color' : ''}`} onClick={() => dispatch({ type: 'colorMotif', index: (state.colorMotif + 1) % colorMotifs.length })} aria-label="切换纹样">
          {layers.map((color, index) => {
            const mask = `url("${assetUrl(`history/color-motifs/${motif.key}-paint-${index}.png`)}")`;
            return <i key={index} className="color-motif-paint" aria-hidden="true" data-color={color} style={{ '--paint-color': colorChoices[color].color, maskImage: mask, WebkitMaskImage: mask }} />;
          })}
          <img className="color-motif-line" src={assetUrl(motif.line)} alt={`${motif.name}${picked.length ? `已上${picked.length}种颜色` : '线稿'}`} /><span>{motif.desc}</span>
        </button>
        <div className="palette-readout" aria-live="polite">{picked.length > 0 && <b>已选择 {picked.length}/3 种颜色</b>}<div>{picked.length ? picked.map((index, order) => <span key={index} className="palette-chip is-picked"><i style={{ background: colorChoices[index].color }} />{['主色', '辅色', '点缀'][order]}·{colorChoices[index].name}</span>) : <span className="palette-empty">先选一种颜色上色，可继续添加到三种颜色</span>}</div></div>
      </article>
      <article className="color-lab-panel color-picker-panel"><h3>✥　点击上色</h3><p className="color-action-hint">选择1—3种颜色：第一种为主色，第二种为辅色，第三种为点缀色；系统会按规律分布上色。</p>
        <div className="color-swatch-grid">{colorChoices.map((item, index) => <button key={item.name} type="button" className={`color-swatch ${picked.includes(index) ? 'is-active' : ''}`} style={{ '--swatch': item.color }} aria-label={`选择${item.name}`} aria-pressed={picked.includes(index)} disabled={picked.length >= 3 && !picked.includes(index)} title={picked.length >= 3 && !picked.includes(index) ? '最多选择三种颜色，请先取消一种' : undefined} onClick={() => dispatch({ type: 'color', index })}><span><img src={assetUrl(item.swatch)} alt="" /></span><b>{item.name}</b><small>{picked.includes(index) ? `第 ${picked.indexOf(index) + 1} 色` : picked.length >= 3 ? '已达上限' : '点击选择'}</small></button>)}</div>
        <div className="color-selection-tools"><span>已选 {picked.length}/3</span><button type="button" onClick={() => dispatch({ type: 'colorReset' })}>清空选择</button></div>
      </article>
      <article className="color-lab-panel color-meaning-panel"><h3>✥　色彩寓意</h3><div className="meaning-art"><img className="meaning-main-image" src={assetUrl(rightColor.image)} alt={`${rightColor.name}绣线肌理特写`} /></div><div className="meaning-copy"><span className="meaning-dot" style={{ background: rightColor.color }} /><strong>{rightColor.name}</strong><p>{rightColor.meaning}</p></div></article>
    </div>
  );
}
