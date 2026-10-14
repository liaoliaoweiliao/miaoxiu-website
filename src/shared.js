export const A='./assets/';
export const motifs=[{name:'蝴蝶纹',icon:'🦋',tag:'生命与起源',desc:'在苗族文化中，蝴蝶是美好、自由与生命延续的象征。相传蝴蝶妈妈孕育万物，因此蝴蝶纹常见于服饰之上，寓意平安、幸福与代代相传。'},{name:'花卉纹',icon:'❀',tag:'繁花似锦',desc:'花卉纹将山野繁花绣进衣襟，表达对自然、丰收与美好生活的向往。'},{name:'鸟纹',icon:'🐦',tag:'自由与祝福',desc:'鸟纹承载关于迁徙、自然和吉祥的记忆，以灵动的针法记录世代传承的故事。'},{name:'鱼纹',icon:'🐟',tag:'丰饶有余',desc:'鱼纹常寄托繁衍、生机和富足的愿望，线条柔和而充满韵律。'},{name:'几何纹',icon:'◇',tag:'秩序之美',desc:'菱形、回纹和交错线条构成独特的节奏，凝结着苗族先民的审美智慧。'},{name:'龙纹',icon:'🐉',tag:'守护吉祥',desc:'苗绣中的龙纹造型丰富多变，融入日常生活与文化想象，象征力量和守护。'}];
export const garments=[{name:'上衣',emoji:'👘',text:'绣花上衣 · 蝴蝶纹',filter:'none'},{name:'裙摆',emoji:'👗',text:'百褶裙 · 花卉纹',filter:'hue-rotate(20deg)'},{name:'围腰',emoji:'✿',text:'绣花围腰 · 几何纹',filter:'hue-rotate(-25deg)'},{name:'袖片',emoji:'🪡',text:'精绣袖片 · 鸟纹',filter:'saturate(1.4)'},{name:'下裙',emoji:'❖',text:'苗绣下裙 · 鱼纹',filter:'hue-rotate(45deg)'}];
export let state={page:location.hash.slice(1).split('/')[0]||'home',slide:0,motif:0,unlocked:1,drawn:-1,garment:0,look:0,query:'',modal:null,nav:false};
export const app=document.querySelector('#app');
export const frame=(content,cls='')=>`<div class="ornate ${cls}"><span class="corner tl">❧</span><span class="corner tr">❧</span><span class="corner bl">❧</span><span class="corner br">❧</span>${content}</div>`;
export const link=(page,text,cls='')=>`<button class="${cls}" data-go="${page}">${text}</button>`;
