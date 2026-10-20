import { Fragment } from 'react';

const navigation = [
  ['home', '首页'],
  ['history', '苗绣探源'],
  ['experience', '互动体验'],
  ['gallery', '作品展览'],
];

export function Header({ page, nav, query, onQueryChange, onAction, onNavigate }) {
  return (
    <header className="topbar">
      <div className="nav-inner">
        <button type="button" className="brand" onClick={() => onNavigate('home')}>
          <span className="brand-mark" aria-hidden="true">✿</span>
          <span>穿在身上的民族历史</span>
        </button>
        <nav id="primary-navigation" className={`nav ${nav ? 'open' : ''}`} aria-label="主导航">
          {navigation.map(([target, label]) => (
            <button
              type="button"
              key={target}
              className={`nav-link ${page === target ? 'active' : ''}`}
              aria-current={page === target ? 'page' : undefined}
              onClick={() => onNavigate(target)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="nav-tools">
          <div className="search">
            <input
              id="search"
              type="search"
              value={query}
              placeholder="请输入关键词"
              aria-label="搜索苗绣内容"
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  onAction('search');
                }
              }}
            />
            <button type="button" onClick={() => onAction('search')} aria-label="搜索">⌕</button>
          </div>
          <button
            type="button"
            className="mini-flower"
            onClick={() => onAction('theme')}
            title="纹样装饰"
            aria-label="切换纹样装饰"
          >
            ❀
          </button>
          <button
            type="button"
            className="hamburger"
            onClick={() => onAction('nav')}
            aria-label={nav ? '收起导航' : '展开导航'}
            aria-expanded={Boolean(nav)}
            aria-controls="primary-navigation"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="footer-pattern left" aria-hidden="true" />
      <div className="footer-pattern right" aria-hidden="true" />
      <div className="motto"><span>苗绣</span> · 不只是技艺，更是一种生活的哲学。</div>
      <div className="footer-links">
        {navigation.map(([target, label], index) => (
          <Fragment key={target}>
            {index > 0 && <i aria-hidden="true">│</i>}
            <button type="button" onClick={() => onNavigate(target)}>{label}</button>
          </Fragment>
        ))}
      </div>
      <p>传承千年针线，遇见穿在身上的民族历史</p>
    </footer>
  );
}
