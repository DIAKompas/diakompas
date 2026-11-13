"""Validate foot-care publication data and unchanged application code (not browser E2E)."""
import json,re,subprocess,html,xml.etree.ElementTree as ET
from pathlib import Path
r=Path(__file__).resolve().parents[2];results=[]
def check(name,value):
 results.append(dict(name=name,result='PASS' if value else 'FAIL'))
 if not value:print('FAIL',name)
a=json.loads((r/'content/articles-foot-care-20261113.json').read_text());old=json.loads((r/'content/articles-20261113.json').read_text());s=(r/'index.html').read_text()
check('four unique articles',len(a)==len({x['id'] for x in a})==4)
manifest=json.loads((r/'seo/articles.json').read_text());sitemap=(r/'sitemap.xml').read_text()
for x in a:
 check(x['id']+' four languages',set(x['locales'])=={'cs','sk','en','hu'})
 check(x['id']+' source domains',all(u.startswith(('https://www.nice.org.uk/','https://www.cdc.gov/','https://www.nhs.uk/')) for n,u in x['sources']))
 for lang,v in x['locales'].items():
  p=r/f'{lang}/clanky/{x["id"]}/index.html';text=p.read_text()
  check(x['id']+' '+lang+' complete text',len(v['sections'])>=5 and all(len(t)>90 for h,t in v['sections']))
  check(x['id']+' '+lang+' static title',f'<html lang="{lang}">' in text and '<h1>'+html.escape(v['title'])+'</h1>' in text)
  check(x['id']+' '+lang+' static body',all(html.escape(t,quote=False) in text or t in html.unescape(text) for h,t in v['sections']))
  check(x['id']+' '+lang+' sources',all(u in text for n,u in x['sources']))
  check(x['id']+' '+lang+' archive',(r/f'{lang}/clanky/index.html').read_text().count('/clanky/'+x['id']+'/')>=1)
  check(x['id']+' '+lang+' indexed',any(m['id']==x['id'] and m['language']==lang for m in manifest) and f'/{lang}/clanky/{x["id"]}/' in sitemap)
base=subprocess.check_output(['git','show','878b244:index.html'],cwd=r).decode()
pat=r'<script id="dk-content-data-20261113">.*?</script>'
check('all other root bytes unchanged',re.sub(pat,'',s,flags=re.S)==re.sub(pat,'',base,flags=re.S))
payload=json.loads(re.search(r'window.DK_CONTENT_UPDATE=(.*?);</script>',s,re.S)[1].replace('<\\/','</'))
check('payload matches original and four new articles',payload['articles']==old+a)
for f in ['nl-intents.js','assets/podpora-dia-kompas-qr.svg','seo/style.css','seo/analytics.js']:
 check('unchanged '+f,(r/f).read_bytes()==subprocess.check_output(['git','show','878b244:'+f],cwd=r))
basepayload=json.loads(re.search(r'window.DK_CONTENT_UPDATE=(.*?);</script>',base,re.S)[1].replace('<\\/','</'))
check('recipes and photos unchanged',payload['recipes']==basepayload['recipes'] and payload['photos']==basepayload['photos'])
ET.fromstring(sitemap)
counts={k:sum(x['result']==k for x in results) for k in ['PASS','FAIL','BLOCKED']}
(r/'audit/foot-care-20261113/static-results.json').write_text(json.dumps(dict(kind='Static checks, not browser E2E',counts=counts,results=results),ensure_ascii=False,indent=2)+'\n')
print(counts);raise SystemExit(bool(counts['FAIL']))
