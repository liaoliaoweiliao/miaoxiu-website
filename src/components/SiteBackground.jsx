/* Shared embroidered cloth, kept outside the content and interaction layers. */
export default function SiteBackground() {
  return (
    <div className="site-background" aria-hidden="true">
      <span className="cloth-grain" />
      <span className="cloth-field" />
      <span className="cloth-edge cloth-edge-left" />
      <span className="cloth-edge cloth-edge-right" />
      <span className="cloth-selvedge cloth-selvedge-left" />
      <span className="cloth-selvedge cloth-selvedge-right" />
    </div>
  );
}
