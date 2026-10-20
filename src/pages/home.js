import { A, motifs, garments, state, frame, link } from '../shared.js';
import { renderAtlas } from './atlas.js';
export function home(){return `<section class="hero" role="region" aria-roledescription="carousel" aria-label="首页苗绣图片轮播" data-slide="${state.slide}"><div class="hero-slides">${['苗绣主题视觉：苗族盛装女子与山间苗寨','苗年庆典：身着苗族盛装的群众在舞台上起舞','苗族盛装、绣花服饰与银饰群像','苗寨广场上身着盛装的苗族队伍'].map((alt,i)=>`<div class="hero-slide ${i===state.slide?'is-active':''}" aria-hidden="${i===state.slide?'false':'true'}"><img src="${A}home/hero-slide-0${i+1}.webp" alt="${alt}" ${i===0?'fetchpriority="high"':'loading="eager"'} draggable="false"></div>`).join('')}</div><div class="hero-dots" role="group" aria-label="选择轮播图片">${[0,1,2,3].map(i=>`<button type="button" class="hero-dot ${i===state.slide?'is-active':''}" data-action="gotoSlide" data-index="${i}" aria-label="查看第 ${i+1} 张图片" aria-current="${i===state.slide?'true':'false'}"></button>`).join('')}</div><div class="hero-controls"><div class="hero-count" aria-live="polite"><strong class="hero-current">0${state.slide+1}</strong><span>/04</span></div><div class="hero-arrows"><button type="button" data-action="prevSlide" aria-label="上一张图片">〈</button><button type="button" data-action="nextSlide" aria-label="下一张图片">〉</button></div></div></section><main class="container"><section class="feature-grid feature-editorial" aria-label="探索苗绣三大主题">
 <article class="feature-card feature-heritage">
  <div class="feature-art" aria-hidden="true"><img src="${A}home/feature-heritage.webp" alt="" loading="lazy"/></div>
  <div class="feature-content"><span class="feature-index">CHAPTER 01 <span class="feature-sep"></span> THE ROOTS</span><div class="feature-heading"><span class="feature-mini">❖</span><h2>苗绣探源</h2></div><p class="feature-desc">探寻文化根脉，解读纹样与技艺</p><div class="feature-rule"></div><ul class="feature-topics"><li>苗族小故事</li><li>纹样图案</li><li>六大针法</li><li>色彩解析</li></ul><span class="feature-foot" aria-hidden="true">循纹溯源 <b>·</b> 以绣为史</span></div>
 </article>
 <article class="feature-card feature-experience">
  <div class="feature-art" aria-hidden="true"><img src="${A}home/feature-experience-photo.jpg" alt="" loading="lazy"/></div>
  <div class="feature-content"><span class="feature-index">CHAPTER 02 <span class="feature-sep"></span> THE CRAFT</span><div class="feature-heading"><span class="feature-mini">✳</span><h2>互动体验</h2></div><p class="feature-desc">游戏探索，感受苗绣魅力</p><div class="feature-rule"></div><ul class="feature-topics"><li>寻纹解密</li><li>苗绣衣橱</li><li>人物换装</li></ul><span class="feature-foot" aria-hidden="true">穿针引线 <b>·</b> 指尖生花</span></div>
 </article>
 <article class="feature-card feature-gallery">
  <div class="feature-art" aria-hidden="true"><img src="${A}home/feature-gallery.webp" alt="" loading="lazy"/></div>
  <div class="feature-content"><span class="feature-index">CHAPTER 03 <span class="feature-sep"></span> THE WORKS</span><div class="feature-heading"><span class="feature-mini">✿</span><h2>作品展览</h2></div><p class="feature-desc">欣赏匠心之作，感受艺术之美</p><div class="feature-rule"></div><span class="feature-gallery-copy">一针一线的色彩，<span>藏着值得细看的故事。</span></span><span class="feature-foot" aria-hidden="true">绣色万象 <b>·</b> 匠心入画</span></div>
 </article>
</section>${renderAtlas()}<section class="heritage-journey" aria-label="传承与新生：绣布小鸟三次互动" data-heritage-journey>
  <div class="heritage-viewport" tabindex="0" aria-label="轻触绣布上的小鸟体验三段故事，键盘可使用回车或空格继续">
    <div class="heritage-art" aria-hidden="false">
      <img class="heritage-panorama" src="${A}home/heritage-long-panorama-wide.webp" alt="连续的苗绣长卷：绣娘、绵延的绣布与右侧现代设计作品" loading="lazy" draggable="false">
      
      <img class="heritage-target-motif" src="${A}home/bird-motif-target.png" alt="" aria-hidden="true"/>
      <button class="heritage-bird" type="button" data-heritage-bird aria-label="点击小鸟，唤醒绣纹" style="left:26.93%;top:73.90%"><img class="heritage-bird-img" src="${A}home/bird-flap.gif" alt="" aria-hidden="true"/><span class="heritage-bird-hint">点击小鸟 · 唤醒绣纹</span></button>
    </div>
    <div class="heritage-ink-top" aria-hidden="true"></div>
    <div class="heritage-shimmer" aria-hidden="true"></div>
    <div class="heritage-floor" aria-hidden="true"></div>
    <div class="heritage-topline"><span class="heritage-ornament" aria-hidden="true">✧ ───── ❖ ───── ✧</span><h2>传承与新生</h2><span class="heritage-subtitle">绣纹有灵 · 从指尖飞向未来</span></div>
    <div class="heritage-bottom">
       <p class="heritage-stage-index" aria-hidden="true"><span data-heritage-number>01</span><span class="heritage-stage-rule"></span>03</p>
       <p class="heritage-whisper" data-heritage-message aria-live="polite">绣片上的小鸟即将启程：先飞向指尖，再沿着绣布走进今天。</p>
       <div class="heritage-progress" aria-hidden="true"><i class="is-current"></i><i></i><i></i></div>
    </div>
  </div>
</section></main>`}
