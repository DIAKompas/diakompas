import json,re,hashlib,subprocess,html
from pathlib import Path
from urllib.parse import urlparse
root=Path(__file__).resolve().parents[2];results=[]
def check(name,condition):
 results.append({'name':name,'result':'PASS' if condition else 'FAIL'})
 if not condition:print('FAIL',name)
def load(p):return json.loads((root/p).read_text())
articles=load('content/articles-20261113.json');recipes=load('content/recipes-20261113.json');photos=load('content/recipe-photo-licenses.json')
check('10 unique new articles',len(articles)==len({a['id'] for a in articles})==10)
check('10 new recipes',len(recipes)==10)
for a in articles:
 check(a['id']+' all four languages',set(a['locales'])=={'cs','sk','en','hu'})
 for lang,v in a['locales'].items():
  check(a['id']+' '+lang+' complete',bool(v['title'] and v['lead'] and len(v['sections'])>=4 and all(len(p)>90 for h,p in v['sections'])))
  p=root/f'{lang}/clanky/{a["id"]}/index.html';text=p.read_text();check(a['id']+' '+lang+' static page',f'<html lang="{lang}">' in text and v['title'] in text and v['title'] == html.unescape(re.sub('<[^>]*>','',re.search(r'<h1>(.*?)</h1>',text,re.S)[1])))
  check(a['id']+' '+lang+' sources',all(url in text for name,url in a['sources']))
 check(a['id']+' primary sources',all(urlparse(url).netloc in {'www.niddk.nih.gov','www.nidcr.nih.gov','www.cdc.gov','diabetes.org','eur-lex.europa.eu','www.nhs.uk'} for n,url in a['sources']))
for i,r in enumerate(recipes):
 check(f'recipe {i} localized',set(r['locales'])=={'cs','sk','en','hu'} and all(len(t)==3 and len(t[1])>=5 and len(t[2])>=3 for t in r['locales'].values()))
 check(f'recipe {i} nutrition estimates',all(r[k]>0 for k in ['kcal','carbs','protein']))
check('34 photo mappings',len(photos)==len({p['recipeIndex'] for p in photos})==34)
for p in photos:
 check('photo '+str(p['recipeIndex'])+' license',bool(p['author'] and p['source'] and p['licenseUrl']) and bool(re.fullmatch(r'CC BY(?:-SA)? [1-4]\.0|CC0|Public domain',p['license'])))
 check('photo '+str(p['recipeIndex'])+' local bytes',hashlib.sha256((root/p['path']).read_bytes()).hexdigest()==p['sha256'])
 check('photo '+str(p['recipeIndex'])+' alt languages',set(p['alt'])=={'cs','sk','en','hu'})
s=(root/'index.html').read_text();base=subprocess.check_output(['git','show','5bec0ed:index.html'],cwd=root).decode()
for id in ['dk-donation-styles','dk-donation-script','dk-qr-repair','dk-donation-desktop-fix']:
 pat=rf'<(?:script|style) id="{id}">.*?</(?:script|style)>';check('preserve '+id,re.search(pat,s,re.S)[0]==re.search(pat,base,re.S)[0])
check('guide intents unchanged',(root/'nl-intents.js').read_bytes()==subprocess.check_output(['git','show','5bec0ed:nl-intents.js'],cwd=root))
# Content payload round-trips exactly; no reliance on external script loading.
payload=json.loads(re.search(r'window.DK_CONTENT_UPDATE=(.*?);</script>',s,re.S)[1].replace('<\\/','</'))
check('embedded source data matches',payload=={'articles':articles,'recipes':recipes,'photos':photos})
manifest=load('seo/articles.json');check('40 new static pages indexed',sum(x['id'] in {a['id'] for a in articles} for x in manifest)==40)
check('payment QR asset unchanged',(root/'assets/podpora-dia-kompas-qr.svg').read_bytes()==subprocess.check_output(['git','show','5bec0ed:assets/podpora-dia-kompas-qr.svg'],cwd=root))
counts={k:sum(r['result']==k for r in results) for k in ['PASS','FAIL','BLOCKED']};(root/'audit/content-20261113/static-results.json').write_text(json.dumps({'kind':'Static data checks, not browser E2E','counts':counts,'results':results},ensure_ascii=False,indent=2)+'\n');print(counts)
raise SystemExit(bool(counts['FAIL']))
