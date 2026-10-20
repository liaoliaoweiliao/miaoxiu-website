import { Fragment } from 'react';
import { assetUrl } from '../utils/assets.js';

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
          <span className="brand-mark"><img src={assetUrl('common/nav-logo.svg')} alt="苗绣纹样标志" width="50" height="50" /></span>
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
              <span className="nav-label">{label}</span>
              <span className="nav-marker" aria-hidden="true">
                <svg viewBox="0 0 120 22" focusable="false">
                  <path className="nav-scroll-line" d="M6 11H34C40 11 43 8 42 5C41 2 36 3 37 6C38 9 44 11 50 11M70 11C76 11 82 9 83 6C84 3 79 2 78 5C77 8 80 11 86 11H114" />
                  <path className="nav-scroll-echo" d="M13 15H32Q39 15 43 12M77 12Q81 15 88 15H107" />
                  <path className="nav-scroll-knot" d="M60 3L68 11 60 19 52 11Z" />
                  <path className="nav-scroll-heart" d="M60 7L64 11 60 15 56 11Z" />
                  <path className="nav-scroll-tip" d="M3 11L6 8 9 11 6 14ZM111 11L114 8 117 11 114 14Z" />
                </svg>
              </span>
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
        {[...navigation, ['sources', '素材来源']].map(([target, label], index) => (
          <Fragment key={target}>
            {index > 0 && <i aria-hidden="true">│</i>}
            <button type="button" data-go={target} onClick={() => onNavigate(target)}>{label}</button>
          </Fragment>
        ))}
      </div>
      <p>传承千年针线，遇见穿在身上的民族历史</p>
    </footer>
  );
}
