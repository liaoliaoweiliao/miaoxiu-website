const framePieces = [
  ['tl', [0, 0, 350, 320], [0, 0, 310, 310]],
  ['tr', [1322, 0, 350, 320], [631, 0, 310, 310]],
  ['bl', [0, 621, 350, 320], [0, 1362, 310, 310]],
  ['br', [1322, 621, 350, 320], [631, 1362, 310, 310]],
  ['tm', [735, 0, 205, 110], [376, 0, 190, 115]],
  ['bm', [735, 831, 205, 110], [376, 1557, 190, 115]],
  ['lm', [0, 405, 105, 140], [0, 717, 110, 200]],
  ['rm', [1567, 405, 105, 140], [831, 717, 110, 200]],
];

function InteractionArt() {
  return <span className="interaction-art" aria-hidden="true">
    {['top', 'bottom', 'left', 'right'].map((side) => <i key={side} className={`art-rule art-rule-${side}`} />)}
    {framePieces.map(([name, pc, mobile]) => <i key={name} className={`art-piece art-${name}`} style={Object.fromEntries(
      ['pc', 'mobile'].flatMap((prefix, index) => ['x', 'y', 'w', 'h'].map((axis, position) => [`--${prefix}-${axis}`, [pc, mobile][index][position]])),
    )} />)}
  </span>;
}

export function Frame({ children, className = '' }) {
  return (
    <div className={`ornate ${className}`.trim()}>
      <span className="corner tl" aria-hidden="true">❧</span>
      <span className="corner tr" aria-hidden="true">❧</span>
      <span className="corner bl" aria-hidden="true">❧</span>
      <span className="corner br" aria-hidden="true">❧</span>
      {/^(pattern-image-frame|wardrobe-frame|dressup-frame)$/.test(className) && <InteractionArt />}
      {children}
    </div>
  );
}

export default Frame;
