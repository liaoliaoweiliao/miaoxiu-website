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
                  <path className="nav-scroll-line" d="M12 12H60M84 12H132" />
                  <path className="nav-scroll-stitches" d="M18 17H53M91 17H126" />
                  <path className="nav-scroll-knot" d="M72 3L81 12 72 21 63 12Z" />
                  <path className="nav-scroll-needle" d="M72 10L74 12 72 14 70 12Z" />
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
