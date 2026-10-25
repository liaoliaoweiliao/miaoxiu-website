const steps = [
  { title: '寻纹解密', hint: '在图片中发现纹样', destination: 'board' },
  { title: '苗绣衣橱', hint: '抽取并收藏整套绣衣', destination: 'wardrobe' },
  { title: '人物装扮', hint: '穿戴后，随机开启下一轮', destination: 'dressup' },
];

export default function JourneyProgress({ game, onMove }) {
  const current = !game.found ? 0 : !game.lastDraw ? 1 : 2;
  return <nav className="journey-progress container" aria-label="本轮体验进度">
    <div className="journey-round"><span className="eyebrow">循纹入衣</span><strong>第 {game.round} 轮绣衣之旅</strong><small>已完成 {game.completedRounds} 轮 · 收藏持续保留</small></div>
    <ol>{steps.map((step, index) => {
      const done = index < current || index === 2 && game.dressed;
      return <li key={step.destination} className={done ? 'is-done' : index === current ? 'is-current' : ''}>
        <button type="button" onClick={() => onMove(step.destination)} aria-current={index === current ? 'step' : undefined}>
          <span className="journey-number" aria-hidden="true">{done ? '✓' : `0${index + 1}`}</span>
          <span><strong>{step.title}</strong><small>{step.hint}</small></span>
        </button>
      </li>;
    })}</ol>
  </nav>;
}
