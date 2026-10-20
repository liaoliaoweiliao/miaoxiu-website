import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Header, Footer } from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import ExperiencePage from './pages/ExperiencePage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import { motifs } from './data/site.js';
import { assetUrl } from './utils/assets.js';

const pages = { home: HomePage, history: HistoryPage, experience: ExperiencePage, gallery: GalleryPage };
const titles = { home: '首页', history: '苗绣探源', experience: '互动体验', gallery: '作品展览' };

function currentPage() {
  const page = window.location.hash.slice(1).split('/')[0];
  return Object.hasOwn(pages, page) ? page : 'home';
}

function ArtworkModal({ artwork, onClose }) {
  const closeButton = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        event.preventDefault();
        closeButton.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className="modal" onClick={onClose}>
      <section className="modal-body" role="dialog" aria-modal="true" aria-labelledby="artwork-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" ref={closeButton} onClick={onClose} aria-label="关闭作品预览">✕</button>
        <img src={assetUrl(artwork.src)} alt={artwork.title} />
        <h2 id="artwork-title">{artwork.title}</h2>
      </section>
    </div>,
    document.body,
  );
}

export default function App() {
  const [state, setState] = useState(() => ({
    page: currentPage(), motif: 0, galleryFilter: 0, query: '', nav: false, modal: null, bloom: false,
  }));

  useEffect(() => {
    const onHashChange = () => setState((previous) => ({ ...previous, page: currentPage(), nav: false, modal: null }));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.title = `${titles[state.page]} · 穿在身上的民族历史`;
    document.body.dataset.page = state.page;
  }, [state.page]);

  useEffect(() => {
    document.body.classList.toggle('bloom', state.bloom);
    return () => document.body.classList.remove('bloom');
  }, [state.bloom]);

  const onNavigate = useCallback((page, extra = {}) => {
    if (!Object.hasOwn(pages, page)) return;
    setState((previous) => ({ ...previous, ...extra, page, nav: false, modal: null }));
    if (window.location.hash !== `#${page}`) window.location.hash = page;
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, []);

  const closeModal = useCallback(() => setState((previous) => ({ ...previous, modal: null })), []);

  function onAction(action, index = 0, payload) {
    if (action === 'search') {
      const query = state.query.trim();
      if (!query) return;
      const motif = motifs.findIndex((item) => item.name.includes(query) || query.includes(item.name));
      if (motif >= 0) onNavigate('experience', { motif });
      else if (/作品|展览|设计|服饰/.test(query)) onNavigate('gallery');
      else if (/苗绣|历史|文化|技艺|针法/.test(query)) onNavigate('history');
      else window.alert('暂无匹配内容，试试搜索“蝴蝶纹”“苗绣”或“作品”。');
      return;
    }
    setState((previous) => {
      switch (action) {
        case 'nav': return { ...previous, nav: !previous.nav };
        case 'theme': return { ...previous, bloom: !previous.bloom };
        case 'motif': return { ...previous, motif: index };
        case 'filter': return { ...previous, galleryFilter: index };
        case 'modal': return { ...previous, modal: payload };
        case 'close': return { ...previous, modal: null };
        default: return previous;
      }
    });
  }

  const Page = pages[state.page];
  return (
    <>
      <Header {...state} onQueryChange={(query) => setState((previous) => ({ ...previous, query }))} onAction={onAction} onNavigate={onNavigate} />
      <Page state={state} onAction={onAction} onNavigate={onNavigate} />
      <Footer onNavigate={onNavigate} />
      {state.modal && <ArtworkModal artwork={state.modal} onClose={closeModal} />}
    </>
  );
}
