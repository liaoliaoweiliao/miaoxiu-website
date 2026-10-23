import { materialSources } from '../data/sources.js';

const groups = [
  ['images', '影像素材', '纹样科普与作品展览'],
  ['research', '参考文献', '研究资料与开放获取文献'],
];

export default function SourcesPage() {
  const imageCount = materialSources.filter((source) => source.group === 'images').length;
  const researchCount = materialSources.filter((source) => source.group === 'research').length;
  return (
    <main className="sources-page container">
      <header className="sources-heading">
        <span className="eyebrow">循迹溯源 · 致谢每一份创作</span>
        <h1>素材来源</h1>
        <p>汇集本站素材的出处、署名与许可信息，致谢每一份创作。</p>
        <div className="source-overview">
          <span>{materialSources.length} 项来源</span><span>影像 {imageCount} 项</span>
          {researchCount > 0 && <span>文献 {researchCount} 项</span>}
        </div>
      </header>
      {groups.filter(([group]) => materialSources.some((source) => source.group === group)).map(([group, title, subtitle]) => (
        <section key={group} className="source-group" aria-labelledby={`source-${group}`}>
          <div className="source-group-heading"><h2 id={`source-${group}`}>{title}</h2><p>{subtitle}</p></div>
          <ol className="source-list">
            {materialSources.filter((source) => source.group === group).map((source, index) => (
              <li className="source-entry" key={`${source.title}-${index}`}>
                <span className="source-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div className="source-entry-body">
                  <span className="source-platform">{source.platform}</span><h3>{source.title}</h3>
                  {source.credits.length > 0 && <p className="source-credit">{group === 'research' ? '作者' : '清单署名'}：{source.credits.join('、')}</p>}
                  {source.usage && <p className="source-credit">用途：{source.usage}</p>}
                  {source.doi && <p className="source-credit">DOI：{source.doi}</p>}
                  {source.license && <p className="source-credit">清单所列协议：<a href={source.licenseUrl} target="_blank" rel="noopener noreferrer">{source.license}</a></p>}
                  {source.url ? (
                    <a className="source-url" href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.linkLabel || source.url}</span><b aria-hidden="true">↗</b></a>
                  ) : <p className="source-reference">{source.reference || ''}<small>原清单未附网址</small></p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <p className="sources-note">以上署名及协议信息依项目素材清单列示；各素材的具体使用条件请以来源页面为准。</p>
    </main>
  );
}
