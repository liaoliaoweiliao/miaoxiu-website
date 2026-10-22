import { Fragment, useEffect, useRef, useState } from 'react';
import { assetUrl } from '../utils/assets.js';

const navigation = [
  ['home', '首页'],
  ['history', '苗绣探源'],
  ['experience', '互动体验'],
  ['gallery', '作品展览'],
];

export function Header({ page, nav, query, bloom, onQueryChange, onAction, onNavigate }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchButtonRef = useRef(null);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  useEffect(() => { setSearchOpen(false); }, [page]);

  function search() {
    if (window.matchMedia('(max-width: 760px)').matches && !searchOpen) {
      if (nav) onAction('nav');
      setSearchOpen(true);
      return;
    }
    onAction('search');
  }

  return (
    <header className="topbar">
      <div className="nav-inner">
        <button type="button" className="brand" onClick={() => onNavigate('home')}>
          <span className="brand-mark"><img src={assetUrl('common/nav-logo.svg')} alt="苗绣纹样标志" width="50" height="50" /></span>
          <span className="brand-title">
            穿在身上的民族历史
            <span className="brand-seal" aria-hidden="true">
              <img src={assetUrl('common/miao-embroidery-seal.png')} alt="" width="1024" height="1536" />
            </span>
          </span>
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
                <svg viewBox="0 0 144 24" focusable="false">
                  <path className="nav-scroll-line" d="M10 12H18L21 9L24 12H43C50 12 54 10 52 6C50 2 44 4 46 7C48 9 53 12 61 12M83 12C91 12 96 9 98 7C100 4 94 2 92 6C90 10 94 12 101 12H120L123 9L126 12H134" />
                  <path className="nav-scroll-return" d="M27 12V7H36V10H32M117 12V7H108V10H112" />
                  <path className="nav-scroll-stitches" d="M13 17H40Q49 17 55 13M89 13Q95 17 104 17H131" />
                  <path className="nav-scroll-knot" d="M72 2L82 12 72 22 62 12ZM57 8L61 12 57 16M87 8L83 12 87 16" />
                  <path className="nav-scroll-heart" d="M72 7L77 12 72 17 67 12Z" />
                  <path className="nav-scroll-needle" d="M72 10L74 12 72 14 70 12Z" />
                  <path className="nav-scroll-tip" d="M3 12L6 9 9 12 6 15ZM135 12L138 9 141 12 138 15Z" />
                </svg>
              </span>
            </button>
          ))}
        </nav>
        <div className="nav-tools">
          <div className={`search ${searchOpen ? 'is-open' : ''}`}>
            <input
              ref={searchRef}
              id="search"
              type="search"
              value={query}
              placeholder="请输入关键词"
              aria-label="搜索苗绣内容"
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setSearchOpen(false);
                  searchButtonRef.current?.focus();
                }
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  onAction('search');
                }
              }}
            />
            <button ref={searchButtonRef} type="button" onClick={search} aria-label="搜索" aria-controls="search" aria-expanded={searchOpen || undefined}>⌕</button>
          </div>
          <button
            type="button"
            className="mini-flower"
            onClick={() => onAction('theme')}
            title="纹样装饰"
            aria-label="切换纹样装饰"
            aria-pressed={bloom}
          >
            ❀
          </button>
          <button
            type="button"
            className="hamburger"
            onClick={() => { setSearchOpen(false); onAction('nav'); }}
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
