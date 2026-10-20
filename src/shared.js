export const A='./assets/';
export const motifs=[{name:'蝴蝶纹',icon:'🦋',tag:'生命与起源',desc:'在苗族文化中，蝴蝶是美好、自由与生命延续的象征。相传蝴蝶妈妈孕育万物，因此蝴蝶纹常见于服饰之上，寓意平安、幸福与代代相传。'},{name:'花卉纹',icon:'❀',tag:'繁花似锦',desc:'花卉纹将山野繁花绣进衣襟，表达对自然、丰收与美好生活的向往。'},{name:'鸟纹',icon:'🐦',tag:'自由与祝福',desc:'鸟纹承载关于迁徙、自然和吉祥的记忆，以灵动的针法记录世代传承的故事。'},{name:'鱼纹',icon:'🐟',tag:'丰饶有余',desc:'鱼纹常寄托繁衍、生机和富足的愿望，线条柔和而充满韵律。'},{name:'几何纹',icon:'◇',tag:'秩序之美',desc:'菱形、回纹和交错线条构成独特的节奏，凝结着苗族先民的审美智慧。'},{name:'龙纹',icon:'🐉',tag:'守护吉祥',desc:'苗绣中的龙纹造型丰富多变，融入日常生活与文化想象，象征力量和守护。'}];
export const garments=[{name:'上衣',emoji:'👘',text:'绣花上衣 · 蝴蝶纹',filter:'none'},{name:'裙摆',emoji:'👗',text:'百褶裙 · 花卉纹',filter:'hue-rotate(20deg)'},{name:'围腰',emoji:'✿',text:'绣花围腰 · 几何纹',filter:'hue-rotate(-25deg)'},{name:'袖片',emoji:'🪡',text:'精绣袖片 · 鸟纹',filter:'saturate(1.4)'},{name:'下裙',emoji:'❖',text:'苗绣下裙 · 鱼纹',filter:'hue-rotate(45deg)'}];
export let state={
 page:location.hash.slice(1).split('/')[0]||'home',
 slide:0,
 motif:0,
 unlocked:parseInt(localStorage.getItem('miao-unlocked')||'1'),
 drawn:-1,
 garment:0,
 look:0,
 query:'',
 modal:null,
 nav:false,
 // 探源页（history 分支）状态
 historyGroup:'animal',
 historyMotif:0,
 historyStitch:0,
 historyStep:0,
 historyPlaying:false,
 historyColorMotif:0,
 historyColor:-1,
 historyColors:[],
 historyColorExample:0,
 historyChallenge:false,
 story:null,
 // 作品展览筛选
 galleryFilter:0
};
export const app=document.querySelector('#app');
const interactionFrameArt='<span class="interaction-art" aria-hidden="true"><i class="art-rule art-rule-top"></i><i class="art-rule art-rule-bottom"></i><i class="art-rule art-rule-left"></i><i class="art-rule art-rule-right"></i><i class="art-piece art-tl" style="--pc-x:0;--pc-y:0;--pc-w:350;--pc-h:320;--mobile-x:0;--mobile-y:0;--mobile-w:310;--mobile-h:310;"></i><i class="art-piece art-tr" style="--pc-x:1322;--pc-y:0;--pc-w:350;--pc-h:320;--mobile-x:631;--mobile-y:0;--mobile-w:310;--mobile-h:310;"></i><i class="art-piece art-bl" style="--pc-x:0;--pc-y:621;--pc-w:350;--pc-h:320;--mobile-x:0;--mobile-y:1362;--mobile-w:310;--mobile-h:310;"></i><i class="art-piece art-br" style="--pc-x:1322;--pc-y:621;--pc-w:350;--pc-h:320;--mobile-x:631;--mobile-y:1362;--mobile-w:310;--mobile-h:310;"></i><i class="art-piece art-tm" style="--pc-x:735;--pc-y:0;--pc-w:205;--pc-h:110;--mobile-x:376;--mobile-y:0;--mobile-w:190;--mobile-h:115;"></i><i class="art-piece art-bm" style="--pc-x:735;--pc-y:831;--pc-w:205;--pc-h:110;--mobile-x:376;--mobile-y:1557;--mobile-w:190;--mobile-h:115;"></i><i class="art-piece art-lm" style="--pc-x:0;--pc-y:405;--pc-w:105;--pc-h:140;--mobile-x:0;--mobile-y:717;--mobile-w:110;--mobile-h:200;"></i><i class="art-piece art-rm" style="--pc-x:1567;--pc-y:405;--pc-w:105;--pc-h:140;--mobile-x:831;--mobile-y:717;--mobile-w:110;--mobile-h:200;"></i></span>';
export const frame=(content,cls='')=>`<div class="ornate ${cls}"><span class="corner tl">❧</span><span class="corner tr">❧</span><span class="corner bl">❧</span><span class="corner br">❧</span>${/^(pattern-image-frame|wardrobe-frame|dressup-frame)$/.test(cls)?interactionFrameArt:''}${content}</div>`;
export const link=(page,text,cls='')=>`<button class="${cls}" data-go="${page}">${text}</button>`;
