// 将线上已渲染的苗绣站点固化为单个自包含 index.html（离线可双击打开）
// 做法：内联 CSS、将 /images/* 转 data URI、剥离依赖网络的脚本、补原生 JS 交互
import { writeFile } from "node:fs/promises";

const BASE = "http://localhost:3000";
const OUT = "F:/苗绣·生生不息/index.html";

const fetchText = async (p) => (await fetch(BASE + p)).text();
const fetchDataUri = async (p) => {
  const r = await fetch(BASE + p);
  const buf = Buffer.from(await r.arrayBuffer());
  const ct = r.headers.get("content-type") || "image/jpeg";
  return `data:${ct};base64,${buf.toString("base64")}`;
};

let html = await fetchText("/");

// 1) 收集并内联 CSS
const cssHrefs = [...new Set([...html.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]))];
let css = "";
for (const h of cssHrefs) css += (await fetchText(h)) + "\n";

// 2) 收集所有图片路径（HTML 中的 <img src> 与 CSS 中的 url()）
const imgPaths = new Set([
  ...html.matchAll(/src="(\/images\/[^"]+)"/g).map((m) => m[1]),
  ...css.matchAll(/url\(\s*["']?(\/images\/[^"')]+)["']?\s*\)/g).map((m) => m[1]),
]);
const dataUriMap = {};
for (const p of imgPaths) dataUriMap[p] = await fetchDataUri(p);

// 3) 把图片替换为 data URI（HTML + CSS）
for (const [p, uri] of Object.entries(dataUriMap)) {
  html = html.split(`src="${p}"`).join(`src="${uri}"`);
  css = css.split(`url("${p}")`).join(`url("${uri}")`);
  css = css.split(`url('${p}')`).join(`url('${uri}')`);
  css = css.split(`url(${p})`).join(`url(${uri})`);
}

// 4) 移除线上的样式表/预加载链接 + 所有脚本（离线无法运行/会 404）
html = html.replace(/<link[^>]+rel="stylesheet"[^>]*>/g, "");
html = html.replace(/<link[^>]+as="style"[^>]*>/g, "");
html = html.replace(/<link[^>]+rel="preload"[^>]*>/g, "");
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");

// 5) 注入内联样式（含离线兜底：强制显示 + 中文字体栈）
const fallbackCss = `
<style>
  /* 离线兜底：SSR 中 Framer Motion 初始隐藏态改为直接可见 */
  [style*="opacity:0"],[style*="opacity: 0"]{opacity:1 !important}
  [style*="transform"]{transform:none !important}
  /* 字体离线兜底（next/font 的 woff2 在 file:// 下取不到，回退系统字体） */
  body,button,input,textarea,select,p,h1,h2,h3,h4,h5,h6,span,a,li,div{
    font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei","Hiragino Sans GB",sans-serif !important;
  }
  .font-serif,.font-serif *{font-family:"Noto Serif SC","Songti SC","SimSun",serif !important;}
</style>`;

// 6) 补原生 JS 交互：导航平滑滚动 + 当前区块高亮 + 回到顶部 + 进度条
const interactJs = `
<script>
(function(){
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));
  var map = {};
  navLinks.forEach(function(a){
    var id = a.getAttribute('href').slice(1);
    if(id) map[id] = a;
  });
  var sections = Object.keys(map).map(function(id){return document.getElementById(id);}).filter(Boolean);
  // 平滑滚动
  navLinks.forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  });
  // 回到顶部
  var top = document.createElement('button');
  top.textContent = '↑';
  top.setAttribute('aria-label','回到顶部');
  top.style.cssText='position:fixed;right:20px;bottom:20px;width:44px;height:44px;border-radius:9999px;border:1px solid rgba(120,120,120,.3);background:rgba(255,255,255,.9);color:#1e3a5f;font-size:20px;cursor:pointer;z-index:9999;opacity:0;pointer-events:none;transition:opacity .3s;box-shadow:0 4px 14px rgba(0,0,0,.12)';
  document.body.appendChild(top);
  top.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });
  // 进度条
  var bar = document.createElement('div');
  bar.style.cssText='position:fixed;top:0;left:0;height:3px;width:0;z-index:9999;background:linear-gradient(90deg,#c1272d,#b8860b,#c1272d);transition:width .1s';
  document.body.appendChild(bar);
  function onScroll(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h>0 ? (window.scrollY/h)*100 : 0;
    bar.style.width = p + '%';
    top.style.opacity = window.scrollY>600 ? '1':'0';
    top.style.pointerEvents = window.scrollY>600 ? 'auto':'none';
    var pos = window.scrollY + 120;
    var current = null;
    sections.forEach(function(s){ if(s.offsetTop<=pos) current = s.id; });
    navLinks.forEach(function(a){ a.classList.remove('nav-active'); });
    if(current && map[current]) map[current].classList.add('nav-active');
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();
</script>`;

html = html.replace("</head>", `${fallbackCss}</head>`);
html = html.replace("</body>", `${interactJs}</body>`);

await writeFile(OUT, html, "utf8");
console.log("written", OUT, "bytes:", Buffer.byteLength(html));
console.log("inlined images:", Object.keys(dataUriMap).length);
