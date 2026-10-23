/* A single decorative canvas for all five pages; content keeps its own colors. */
export default function SiteBackground() {
  return (
    <div className="site-background" aria-hidden="true">
      <span className="cloth-grain" />
      <span className="cloth-edge cloth-edge-left" />
      <span className="cloth-edge cloth-edge-right" />
    </div>
  );
}
