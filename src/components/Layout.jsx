import { Fragment, useEffect, useRef, useState } from 'react';
import { assetUrl } from '../utils/assets.js';
import { inspirationCards, navigation } from '../data/navigation.js';

export function Header({ page, nav, query, bloom, onQueryChange, onAction, onNavigate }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [inspiration, setInspiration] = useState(null);
  const headerRef = useRef(null);
  const inspirationButtonRef = useRef(null);
  const closeInspirationRef = useRef(null);
  const searchRef = useRef(null);
  const searchButtonRef = useRef(null);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  useEffect(() => { setSearchOpen(false); setInspiration(null); }, [page]);
  useEffect(() => {
    if (inspiration) closeInspirationRef.current?.focus();
  }, [Boolean(inspiration)]);
  useEffect(() => {
    function dismiss(event) {
      if (!headerRef.current?.contains(event.target)) {
        setInspiration(null);
        setSearchOpen(false);
        if (nav) onAction('nav');
      }
    }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [nav, onAction]);

  function closeInspiration() {
    setInspiration(null);
    inspirationButtonRef.current?.focus();
  }

  function drawInspiration() {
    const candidates = inspirationCards.filter((card) => card.page !== page && card.id !== inspiration?.id);
    setInspiration(candidates[Math.floor(Math.random() * candidates.length)]);
    setSearchOpen(false);
    if (nav) onAction('nav');
  }

  function search() {
    setInspiration(null);
    if (window.matchMedia('(max-width: 1000px)').matches && !searchOpen) {
      if (nav) onAction('nav');
      setSearchOpen(true);
      return;
    }
    onAction('search');
  }

  return (
    <header ref={headerRef} className="topbar" onKeyDown={(event) => {
      if (event.key !== 'Escape') return;
      if (inspiration) { event.preventDefault(); closeInspiration(); }
      else if (nav) {
        onAction('nav');
        headerRef.current?.querySelector('.hamburger')?.focus();
      }
    }} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setInspiration(null);
        if (nav) onAction('nav');
      }
    }}>
      <div className="nav-inner">
        <button type="button" className="brand" aria-label="苗绣 · 穿在身上的民族历史，返回首页" onClick={() => { setInspiration(null); onNavigate('home'); }}>
          <span className="brand-mark"><img src={assetUrl('common/nav-logo.svg')} alt="" width="50" height="50" /></span>
          <span className="brand-copy">
            <span className="brand-name">苗绣 <i>文化纪行</i></span>
            <span className="brand-caption">穿在身上的民族历史</span>
          </span>
        </button>
        <nav id="primary-navigation" className={`nav ${nav ? 'open' : ''}`} aria-label="主导航">
          <div className="nav-mobile-heading" aria-hidden="true"><span>循一缕绣线，赴一场相遇</span><small>CHOOSE YOUR CHAPTER</small></div>
          {navigation.map(({ id: target, label, chapter, cue, note }) => (
            <button
              type="button"
              key={target}
              className={`nav-link ${page === target ? 'active' : ''}`}
              aria-label={label}
              aria-current={page === target ? 'page' : undefined}
              onClick={() => { setInspiration(null); onNavigate(target); }}
            >
              <span className="nav-chapter" aria-hidden="true">{chapter}<span>{cue}</span></span>
              <span className="nav-label">{label}</span>
              <span className="nav-marker" aria-hidden="true">
                <svg viewBox="0 0 120 18" focusable="false"><path d="M0 9H47L53 3L60 9L67 15L73 9H120M47 9L53 15L60 9L67 3L73 9" /><path className="nav-thread-core" d="M56 9L60 5L64 9L60 13Z" /></svg>
              </span>
              <span className="nav-note" aria-hidden="true">{note}</span>
              <span className="nav-mobile-arrow" aria-hidden="true">↗</span>
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
              placeholder="搜一搜苗绣"
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
            <button ref={searchButtonRef} type="button" onClick={search} aria-label="搜索" aria-controls="search" aria-expanded={searchOpen || undefined}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg></button>
          </div>
          <button
            type="button"
            className="mini-flower"
            onClick={() => onAction('theme')}
            title="纹样装饰"
            aria-label="切换纹样装饰"
            aria-pressed={Boolean(bloom)}
          >
            ❀
          </button>
          <button ref={inspirationButtonRef} type="button" className="nav-inspiration" aria-label="抽一枚灵感签" aria-expanded={Boolean(inspiration)} aria-controls="nav-inspiration-panel" onClick={() => inspiration ? closeInspiration() : drawInspiration()}>
            <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 2 17.5 10.5 26 14 17.5 17.5 14 26 10.5 17.5 2 14 10.5 10.5Z" /><path d="m14 9 5 5-5 5-5-5Z" /></svg>
            <span><span className="inspiration-label-wide">抽枚灵感签</span><span className="inspiration-label-small">一签</span></span><span className="inspiration-arrow" aria-hidden="true">↗</span>
          </button>
          <button
            type="button"
            className="hamburger"
            onClick={() => { setSearchOpen(false); setInspiration(null); onAction('nav'); }}
            aria-label={nav ? '收起导航' : '展开导航'}
            aria-expanded={Boolean(nav)}
            aria-controls="primary-navigation"
          >
            <span /><span />
          </button>
        </div>
      </div>
      {inspiration && (
        <section id="nav-inspiration-panel" className="inspiration-panel" role="dialog" aria-modal="false" aria-labelledby="inspiration-heading">
          <div className="inspiration-panel-heading"><span>一线一遇 <small>A LITTLE SERENDIPITY</small></span><button ref={closeInspirationRef} type="button" onClick={closeInspiration} aria-label="收起灵感签">×</button></div>
          <div className="inspiration-art"><img src={assetUrl(inspiration.image)} alt="" /><span className="inspiration-stamp">{inspiration.stamp}</span><span className="inspiration-art-caption">下一针，绣向哪里？</span></div>
          <div className="inspiration-copy" aria-live="polite" aria-atomic="true">
            <span className="inspiration-tag">{inspiration.tag}</span>
            <h2 id="inspiration-heading">{inspiration.title}</h2>
            <p>{inspiration.description}</p>
            <button className="inspiration-go" type="button" onClick={() => { setInspiration(null); onNavigate(inspiration.page); }}>{inspiration.action}<span aria-hidden="true">↗</span></button>
          </div>
          <div className="inspiration-panel-foot"><span>不赶路，偶尔循着好奇走。</span><button type="button" onClick={drawInspiration}>换一签 <span aria-hidden="true">⤮</span></button></div>
        </section>
      )}
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
        {[...navigation, { id: 'sources', label: '素材来源' }].map(({ id: target, label }, index) => (
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
