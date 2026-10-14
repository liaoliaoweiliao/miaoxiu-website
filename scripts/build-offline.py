"""Generate the double-click offline demo and the identical hosted static entry."""
from pathlib import Path
import re,base64,json,mimetypes
root=Path(__file__).resolve().parents[1]
def data(path):
 return 'data:'+str(mimetypes.guess_type(path.name)[0] or 'application/octet-stream')+';base64,'+base64.b64encode(path.read_bytes()).decode()
css='\n'.join(p.read_text() for p in [root/'src/styles/base.css',root/'src/styles/home.css',root/'src/styles/history.css',root/'src/styles/experience.css',root/'src/styles/gallery.css'])
def css_asset(m):
 p=(root/'src/styles'/m[2]).resolve()
 return 'url("'+data(p)+'")' if p.is_file() else m[0]
css=re.sub(r'url\(([\'\"]?)([^)\'\"]+)\1\)',css_asset,css)
files=['utils.js','shared.js','game.js','components/layout.js','pages/home.js','pages/history.js','pages/experience.js','pages/gallery.js','main.js']
js='\n'.join(re.sub(r'^import .*?;\s*','', (root/'src'/f).read_text(),flags=re.M).replace('export ','') for f in files)
assets={p.relative_to(root/'assets').as_posix():data(p) for p in (root/'assets').rglob('*') if p.is_file()}
js=js.replace('app.innerHTML=head()+','app.innerHTML=(head()+').replace("</div></div>`:'');document.body", "</div></div>`:'')).replace(/(?:\\.\\/assets\\/)([^\\\"<>]+\\.(?:webp|jpg|png))/g,(_,name)=>IMAGE_DATA[name]||'');document.body")
js=js.replace("img.src=A+'experience/character.webp'", "img.src=IMAGE_DATA['experience/character.webp']")
html='<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>穿在身上的民族历史 · 苗绣</title><style>'+css+'</style></head><body><div id="app"></div><script>const IMAGE_DATA='+json.dumps(assets,ensure_ascii=False)+';\n'+js+'</script></body></html>'
(root/'index.html').write_text(html)
(root/'dist').mkdir(exist_ok=True)
(root/'dist/index.html').write_text(html)
(root/'dev.html').write_text('<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>苗绣</title><link rel="stylesheet" href="./src/style.css"></head><body><div id="app"></div><script type="module" src="./src/main.js"></script></body></html>')
print('Generated offline index.html and dist/index.html')
