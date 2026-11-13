from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
def load(p):return json.loads((root/p).read_text())
s=(root/'index.html').read_text()
articles=load('content/articles-20261113.json');recipes=load('content/recipes-20261113.json');photos=load('content/recipe-photo-licenses.json')
fiber=next(a for a in articles if a['id']=='vlaknina-kazdy-den')
eu=['EU — Regulation 1169/2011, Annex I and XV','https://eur-lex.europa.eu/eli/reg/2011/1169/oj/eng']
if eu not in fiber['sources']:fiber['sources'].append(eu)
(root/'content/articles-20261113.json').write_text(json.dumps(articles,ensure_ascii=False,indent=2)+'\n')
# Deliberately inline the generated payload: static export also runs without network resources.
data=json.dumps({'articles':articles,'recipes':recipes,'photos':photos},ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
block='<script id="dk-content-data-20261113">window.DK_CONTENT_UPDATE='+data+';</script>\n'
if 'id="dk-content-data-20261113"' in s:s=re.sub(r'<script id="dk-content-data-20261113">.*?</script>\n',lambda _:block,s,flags=re.S)
else:s=s.replace('<script id="dk-445-complete-article-localization">',block+'<script id="dk-445-complete-article-localization">')
inject='''// Content release: register before the localization snapshot so language switching stays consistent.
for(const entry of window.DK_CONTENT_UPDATE.articles){
 if(!DK_ARTICLES.some(a=>a.id===entry.id))DK_ARTICLES.push({...entry,...entry.locales.cs});
 for(const lang of ['cs','sk','en','hu']){translations[lang]??={};translations[lang][entry.id]=entry.locales[lang];}
 const grid=document.querySelector('#articles-view .content-grid');if(grid){
  const card=document.createElement('button');card.type='button';card.className='content-card';card.dataset.articleCat=entry.cat;card.dataset.openArticle=entry.id;
  const img=document.createElement('img');img.src=grid.querySelector('[data-open-article="'+entry.cat+'"] img')?.src||window.DK_SAFE_ARTICLE_IMAGE;img.alt='';
  const pad=document.createElement('div');pad.className='pad';const h=document.createElement('h2');h.textContent=entry.locales.cs.title;const p=document.createElement('p');p.textContent=entry.locales.cs.lead;pad.append(h,p);card.append(img,pad);grid.append(card);card.addEventListener('click',()=>window.dkArticle(entry.id));
 }
}
'''
if '// Content release: register' not in s:s=s.replace('const originals=DK_ARTICLES.map',inject+'const originals=DK_ARTICLES.map')
start=s.index('<script id="dk-recipes-audit-fix-20261030">');end=s.index('</script>',start)
part=s[start:end]
if 'recipes.push(...window.DK_CONTENT_UPDATE.recipes)' not in part:part=part.replace('const ui={','recipes.push(...window.DK_CONTENT_UPDATE.recipes);\nconst ui={')
old="const dish=el('div','dish',r.emoji);dish.setAttribute('aria-hidden','true');"
new="""const photo=window.DK_CONTENT_UPDATE.photos.find(p=>p.recipeIndex===i);
   const dish=el('figure','dk-recipe-photo');
   if(photo){const img=el('img');img.src=photo.path;img.alt=photo.alt[lang];img.loading='lazy';img.width=800;img.height=533;dish.append(img);
    const caption=el('figcaption','dk-recipe-credit');const labels={cs:'Ilustrační fotografie',sk:'Ilustračná fotografia',en:'Representative photograph',hu:'Illusztrációs fénykép'};
    caption.append(document.createTextNode(labels[lang]+' · '+photo.author+' · '));const source=el('a','',photo.license);source.href=photo.source;source.target='_blank';source.rel='noopener noreferrer';caption.append(source);const license=el('a','',({cs:'Licence',sk:'Licencia',en:'License',hu:'Licenc'})[lang]);license.href=photo.licenseUrl;license.target='_blank';license.rel='noopener noreferrer';caption.append(document.createTextNode(' · '),license);dish.append(caption);}
"""
part=part.replace(old,new)
s=s[:start]+part+s[end:]
css='''<style id="dk-recipe-photos-20261113">
#recipes .dk-recipe-photo{margin:0}#recipes .dk-recipe-photo img{display:block;width:100%;height:160px;object-fit:cover;background:#edf4f7}#recipes .dk-recipe-credit{font-size:10px;line-height:1.4;padding:6px 10px;color:#50677a;overflow-wrap:anywhere}#recipes .dk-recipe-credit a{color:#0867a8;text-decoration:underline}#recipes .dk-recipe-credit{max-height:84px;overflow:auto}
@media(max-width:600px){#recipes .dk-recipe-photo img{height:190px}#recipes .dk-recipe-credit{font-size:11px}}
</style>'''
if 'id="dk-recipe-photos-20261113"' not in s:s=s.replace('</body>',css+'\n</body>')
(root/'index.html').write_text(s)
