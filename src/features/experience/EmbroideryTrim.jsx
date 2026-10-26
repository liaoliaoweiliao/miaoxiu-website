export default function EmbroideryTrim() {
  return <svg className="embroidery-trim" viewBox="0 0 240 44" fill="none" aria-hidden="true" focusable="false">
    <path className="trim-thread" d="M8 36V8h30M202 36h30V8h-30M42 22h156" />
    <path className="trim-stitches" d="M14 37V14h24M202 30h24V14h-24M46 27h148" />
    {[26, 214].map((x) => <g key={x} transform={`translate(${x} 22)`}>
      {[0, 45, 90, 135].map((angle) => <ellipse key={angle} className="trim-petal" rx="3" ry="11" transform={`rotate(${angle})`} />)}
      <path className="trim-heart" d="m0-4 4 4-4 4-4-4Z" />
    </g>)}
    {[76, 120, 164].map((x) => <path key={x} className="trim-knot" d={`m${x} 18 4 4-4 4-4-4Z`} />)}
  </svg>;
}
