import { useCallback, useEffect, useRef, useState } from 'react';
import { Header, Footer } from './components/Layout.jsx';
import SiteBackground from './components/SiteBackground.jsx';
import HomePage from './pages/HomePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import ExperiencePage from './pages/ExperiencePage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import SourcesPage from './pages/SourcesPage.jsx';
import ImageLightbox from './components/ImageLightbox.jsx';
import MoonCursor from './features/cursor/MoonCursor.jsx';
import { searchIndex } from './data/search.js';

const pages = { home: HomePage, history: HistoryPage, experience: ExperiencePage, gallery: GalleryPage, sources: SourcesPage };
const titles = { home: '首页', history: '苗绣探源', experience: '互动体验', gallery: '作品展览', sources: '素材来源' };

function currentPage() {
  const page = window.location.hash.slice(1).split('/')[0];
  return Object.hasOwn(pages, page) ? page : 'home';
}

const currentSection = () => window.location.hash.slice(1).split('/')[1] || null;

export default function App() {
  const [state, setState] = useState(() => ({
    page: currentPage(), section: currentSection(), motif: 0, galleryFilter: 0, query: '', nav: false, modal: null, bloom: false,
  }));

  const searchRevision = useRef(0);

  useEffect(() => {
    const onHashChange = () => setState((previous) => previous.page === currentPage() && previous.section === currentSection()
      ? { ...previous, nav: false }
      : { ...previous, page: currentPage(), section: currentSection(), nav: false, modal: null, searchTarget: null });
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
    const { section = null, ...pageState } = extra;
    setState((previous) => ({
      ...previous, searchTarget: null, ...pageState, page, section, nav: false, modal: null,
      sectionRevision: (previous.sectionRevision || 0) + 1,
      experienceThemeRequest: extra.experienceTheme ? (previous.experienceThemeRequest || 0) + 1 : previous.experienceThemeRequest,
    }));
    const hash = `#${page}${section ? `/${section}` : ''}`;
    if (window.location.hash !== hash) window.location.hash = hash;
    if (!section) window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, []);

  useEffect(() => {
    if (!state.section) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const section = document.getElementById(state.section);
      if (!section?.closest('main')) return;
      section.focus({ preventScroll: true });
      section.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [state.page, state.section, state.sectionRevision]);

  const closeModal = useCallback(() => setState((previous) => ({ ...previous, modal: null })), []);

  function onSearchSelect(id) {
    const target = searchIndex.find((item) => item.id === id);
    if (!target) return;
    onNavigate(target.page, {
      searchTarget: { ...target, revision: ++searchRevision.current },
      ...(target.theme ? { experienceTheme: target.theme } : {}),
    });
  }

  function onAction(action, index = 0, payload) {
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
      <SiteBackground />
      <Header {...state} onSearchSelect={onSearchSelect} onQueryChange={(query) => setState((previous) => ({ ...previous, query }))} onAction={onAction} onNavigate={onNavigate} />
      <Page state={state} onAction={onAction} onNavigate={onNavigate} />
      <Footer onNavigate={onNavigate} />
      <MoonCursor />
      {state.modal && <ImageLightbox artwork={state.modal} onClose={closeModal} />}
    </>
  );
}
