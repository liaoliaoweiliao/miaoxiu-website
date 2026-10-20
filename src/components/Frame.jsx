export function Frame({ children, className = '' }) {
  return (
    <div className={`ornate ${className}`.trim()}>
      <span className="corner tl" aria-hidden="true">❧</span>
      <span className="corner tr" aria-hidden="true">❧</span>
      <span className="corner bl" aria-hidden="true">❧</span>
      <span className="corner br" aria-hidden="true">❧</span>
      {children}
    </div>
  );
}

export default Frame;
