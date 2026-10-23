/* Contemporary line ornaments inspired by the site's butterfly, flower and spiral motifs. */
export default function EmbroideryOrnament({ motif = 'butterfly', className = '' }) {
  return (
    <svg className={`embroidery-ornament ${className}`} viewBox="0 0 40 32" fill="none" aria-hidden="true" focusable="false">
      {motif === 'butterfly' && <>
        <path d="M20 14C12 0 1 3 6 12c2 4 8 5 14 5C8 15 5 26 12 26c5 0 6-6 8-9m0-3C28 0 39 3 34 12c-2 4-8 5-14 5 12-2 15 9 8 9-5 0-6-6-8-9M20 11v17m-1-16-4-5m6 5 4-5" />
        <path className="ornament-detail" d="m8 9 7 4m-5 9 5-3M32 9l-7 4m5 9-5-3" />
      </>}
      {motif === 'flower' && <>
        <path d="M20 12C7-3 6 12 15 15 0 14 7 27 17 20c-6 15 9 15 6 0 10 7 17-6 2-5C34 12 33-3 20 12Z" />
        <path className="ornament-detail" d="m20 12 4 5-4 5-4-5Zm0-6v3M9 17h3m16 0h3M14 27l2-3m10 3-2-3" />
      </>}
      {motif === 'spiral' && <>
        <path d="M19 16c-1-7-12-6-12 2 0 10 16 12 21 4 8-12-8-24-17-16M21 16c1 7 12 6 12-2C33 4 17 2 12 10c-8 12 8 24 17 16" />
        <path className="ornament-detail" d="m3 16 2-3m30 6 2-3M19 3l3 1m-4 24 3 1" />
      </>}
      {motif === 'star' && <>
        <path d="m20 2 4 8 9-3-3 9 8 4-10 2 1 8-9-5-9 5 1-8-10-2 8-4-3-9 9 3Z" />
        <path className="ornament-detail" d="m20 9 7 8-7 8-7-8Zm0 5 3 3-3 3-3-3Z" />
      </>}
    </svg>
  );
}
