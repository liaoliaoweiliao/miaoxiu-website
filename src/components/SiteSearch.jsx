import { useEffect, useRef, useState } from 'react';
import { searchSuggestions } from '../data/search.js';
import { normalizeSearch, searchContent } from '../features/search/searchModel.js';

export default function SiteSearch({ page, nav, query, onQueryChange, onSelect, onOpen }) {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef(null);
  const input = useRef(null);
  const trigger = useRef(null);
  const { items, total } = searchContent(query);

  function dismiss() { setOpen(false); setExpanded(false); setActive(-1); }
  useEffect(() => { dismiss(); }, [page]);
  useEffect(() => { if (nav) dismiss(); }, [nav]);
  useEffect(() => {
    function outside(event) { if (!root.current?.contains(event.target)) dismiss(); }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  useEffect(() => { setActive(-1); }, [query]);
  useEffect(() => {
    if (open && active >= 0) document.getElementById(`site-search-option-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  function show() { onOpen(); setExpanded(true); setOpen(true); }
  function choose(item) {
    // Keep focus on a persistent control until the destination takes focus.
    trigger.current?.focus({ preventScroll: true });
    dismiss();
    onSelect(item.id);
  }
  function submit() {
    show();
    input.current?.focus();
    const exact = items.find((item) => normalizeSearch(item.title) === normalizeSearch(query));
    const chosen = open && active >= 0 ? items[active] : exact || (total === 1 ? items[0] : null);
    if (chosen) choose(chosen);
  }
  return <div ref={root} className={`search ${expanded ? 'is-open' : ''}`} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <input ref={input} id="search" type="search" role="combobox" value={query} placeholder="搜索针法、纹样、作品"
      aria-label="搜索苗绣内容" aria-autocomplete="list" aria-expanded={open} aria-controls={open && items.length ? 'site-search-results' : undefined}
      aria-activedescendant={open && active >= 0 && items[active] ? `site-search-option-${active}` : undefined}
      onFocus={show} onChange={(event) => { onQueryChange(event.target.value); setOpen(true); setActive(-1); }}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing || event.keyCode === 229) return;
        if (event.key === 'Escape') { event.preventDefault(); dismiss(); trigger.current?.focus(); }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault(); show();
          setActive((previous) => items.length ? (previous + (event.key === 'ArrowDown' ? 1 : previous < 0 ? 0 : -1) + items.length) % items.length : -1);
        }
        if (event.key === 'Enter') { event.preventDefault(); submit(); }
      }} />
    <button ref={trigger} type="button" className="search-trigger" aria-label="搜索" aria-controls="search" aria-expanded={expanded} onClick={() => {
      if (window.matchMedia('(max-width:760px)').matches && !expanded) {
        show(); window.requestAnimationFrame(() => input.current?.focus());
      } else submit();
    }}><svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg></button>
    {open && <div className="search-popover">
      <p className="search-summary" role="status">{!query.trim() ? '试试搜索' : total ? `找到 ${total} 项${total > items.length ? `，先显示 ${items.length} 项` : ''}` : '没有找到相关内容，试试这些关键词'}</p>
      {items.length > 0 ? <div id="site-search-results" role="listbox" aria-label="搜索结果">
        {items.map((item, index) => <button key={item.id} id={`site-search-option-${index}`} type="button" className="search-option" role="option" tabIndex={-1} aria-selected={index === active} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(item)}>
          <span><strong>{item.title}</strong><small>{item.label}</small></span><i aria-hidden="true">↗</i>
        </button>)}
      </div> : <div className="search-suggestions" aria-label="推荐搜索词">{searchSuggestions.map((word) => <button key={word} type="button" onClick={() => { onQueryChange(word); show(); input.current?.focus(); }}>{word}</button>)}</div>}
      {items.length > 0 && <p className="search-key-hint">{total > items.length ? '继续输入可缩小范围 · ' : ''}选择一项直达内容 · ↑↓ 选择 · 回车打开</p>}
    </div>}
  </div>;
}
