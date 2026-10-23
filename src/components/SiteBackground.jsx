import { useEffect, useRef } from 'react';
import EmbroideryOrnament from './EmbroideryOrnament.jsx';

/* One continuous cloth canvas; scrolling moves the embroidery, never tiles the image. */
export default function SiteBackground() {
  const background = useRef(null);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    function paint() {
      frame = 0;
      const range = Math.max(window.innerHeight, document.documentElement.scrollHeight - window.innerHeight);
      const progress = reduced.matches ? 0 : Math.min(1, Math.max(0, window.scrollY / range));
      background.current?.style.setProperty('--scroll-progress', progress.toFixed(4));
    }
    function schedule() { if (!frame) frame = window.requestAnimationFrame(paint); }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.querySelector('#root'));
    schedule();
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={background} className="site-background" aria-hidden="true">
      <span className="cloth-grain" />
      <span className="cloth-edge cloth-edge-left" />
      <span className="cloth-edge cloth-edge-right" />
      <div className="cloth-scroll-motifs cloth-scroll-left">
        <EmbroideryOrnament motif="star" />
        <i className="cloth-stitched-trail" />
        <EmbroideryOrnament motif="flower" />
        <i className="cloth-stitched-trail" />
        <EmbroideryOrnament motif="spiral" />
      </div>
      <div className="cloth-scroll-motifs cloth-scroll-right">
        <EmbroideryOrnament motif="flower" />
        <i className="cloth-stitched-trail" />
        <EmbroideryOrnament motif="butterfly" />
        <i className="cloth-stitched-trail" />
        <EmbroideryOrnament motif="star" />
      </div>
    </div>
  );
}
