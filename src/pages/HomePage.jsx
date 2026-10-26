import { useEffect, useRef, useState } from 'react';
import Atlas from './AtlasPage.jsx';
import HeritageRebirth from '../features/home/HeritageRebirth.jsx';
import { assetUrl } from '../utils/assets.js';

const slides = [
  '苗绣主题视觉：苗族盛装女子与山间苗寨',
  '苗年庆典：身着苗族盛装的群众在舞台上起舞',
  '苗族盛装、绣花服饰与银饰群像',
  '苗寨广场上身着盛装的苗族队伍',
];

const features = [
  {
    className: 'feature-heritage',
    page: 'history',
    image: 'home/feature-heritage.webp',
    chapter: 'CHAPTER 01',
    subtitle: 'THE ROOTS',
    icon: '❖',
    title: '苗绣探源',
    description: '探寻文化根脉，解读纹样与技艺',
    topics: ['苗族小故事', '纹样图案', '六大针法', '色彩解析'],
    foot: ['循纹溯源', '以绣为史'],
  },
  {
    className: 'feature-experience',
    page: 'experience',
    image: 'home/feature-experience-photo.jpg',
    chapter: 'CHAPTER 02',
    subtitle: 'THE CRAFT',
    icon: '✳',
    title: '互动体验',
    description: '游戏探索，感受苗绣魅力',
    topics: ['寻纹解密', '苗绣衣橱', '人物换装'],
    foot: ['穿针引线', '指尖生花'],
  },
  {
    className: 'feature-gallery',
    page: 'gallery',
    image: 'home/feature-gallery.webp',
    chapter: 'CHAPTER 03',
    subtitle: 'THE WORKS',
    icon: '✿',
    title: '作品展览',
    description: '欣赏匠心之作，感受艺术之美',
    foot: ['绣色万象', '匠心入画'],
  },
];

function HeroCarousel({ initialSlide = 0 }) {
  const [slide, setSlide] = useState(initialSlide);
  const heroRef = useRef(null);
  const touchStart = useRef(null);
  const goToSlide = (index) => setSlide((index + slides.length) % slides.length);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const hero = heroRef.current;
      if (
        !hero ||
        document.hidden ||
        hero.matches(':hover') ||
        hero.contains(document.activeElement) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }
      setSlide((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, []);

  function handleTouchStart(event) {
    const touch = event.changedTouches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event) {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      setSlide((current) => (current + (dx < 0 ? 1 : -1) + slides.length) % slides.length);
    }
  }

  return (
    <section
      ref={heroRef}
      className="hero"
      role="region"
      aria-roledescription="carousel"
      aria-label="首页苗绣图片轮播"
      data-slide={slide}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { touchStart.current = null; }}
    >
      <div className="hero-slides">
        {slides.map((alt, index) => (
          <div
            key={alt}
            className={`hero-slide ${index === slide ? 'is-active' : ''}`}
            aria-hidden={index !== slide}
          >
            <img
              src={assetUrl(`home/hero-slide-0${index + 1}.webp`)}
              alt={alt}
              fetchPriority={index === 0 ? 'high' : undefined}
              loading={index === 0 ? undefined : 'eager'}
              draggable={false}
            />
          </div>
        ))}
      </div>
      <div className="hero-dots" role="group" aria-label="选择轮播图片">
        {slides.map((_, index) => (
          <button
            type="button"
            key={index}
            className={`hero-dot ${index === slide ? 'is-active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`查看第 ${index + 1} 张图片`}
            aria-current={index === slide ? 'true' : 'false'}
          />
        ))}
      </div>
      <div className="hero-controls">
        <div className="hero-count" aria-live="polite">
          <strong className="hero-current">{String(slide + 1).padStart(2, '0')}</strong>
          <span>/04</span>
        </div>
        <div className="hero-arrows">
          <button type="button" onClick={() => goToSlide(slide - 1)} aria-label="上一张图片">
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m13 3-6 7 6 7" /></svg>
          </button>
          <button type="button" onClick={() => goToSlide(slide + 1)} aria-label="下一张图片">
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m7 3 6 7-6 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default function HomePage({ state, onNavigate }) {
  return (
    <>
      <HeroCarousel initialSlide={state?.slide || 0} />
      <main className="container">
        <section className="feature-grid feature-editorial" aria-label="探索苗绣三大主题">
          {features.map((feature) => (
            <article key={feature.title} className={`feature-card ${feature.className}`}>
              <div className={`feature-art ${feature.artClassName || ''}`.trim()} aria-hidden="true">
                <img src={assetUrl(feature.image)} alt="" loading="lazy" />
              </div>
              <span className="feature-embroidered-frame" aria-hidden="true">
                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                  <i key={corner} className={`feature-stitch-knot ${corner}`} />
                ))}
              </span>
              <div className="feature-content">
                <span className="feature-index">
                  {feature.chapter} <span className="feature-sep" /> {feature.subtitle}
                </span>
                <div className="feature-heading">
                  <span className="feature-mini" aria-hidden="true">{feature.icon}</span>
                  <h2>{feature.title}</h2>
                </div>
                <p className="feature-desc">{feature.description}</p>
                <div className="feature-rule" />
                {feature.topics ? (
                  <ul className="feature-topics">
                    {feature.topics.map((topic) => <li key={topic}>{topic}</li>)}
                  </ul>
                ) : (
                  <span className="feature-gallery-copy">一针一线的色彩，<span>藏着值得细看的故事。</span></span>
                )}
                <div className="feature-actions">
                  <span className="feature-foot" aria-hidden="true">{feature.foot[0]} <b>·</b> {feature.foot[1]}</span>
                  <button
                    type="button"
                    className="feature-link"
                    aria-label={`前往${feature.title}`}
                    onClick={() => onNavigate(feature.page)}
                  >
                    进入栏目 <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
        <Atlas />
        <HeritageRebirth />
      </main>
    </>
  );
}
