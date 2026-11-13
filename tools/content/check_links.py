import json,urllib.request,concurrent.futures
from pathlib import Path
root=Path(__file__).resolve().parents[2]
a=json.loads((root/'content/articles-20261113.json').read_text());urls=sorted({u for x in a for n,u in x['sources']})
def check(u):
 try:
  with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'DIAKompas/1.0 content verification'}),timeout=35) as r:return {'url':u,'status':r.status,'finalURL':r.url,'result':'PASS' if r.status==200 else 'FAIL'}
 except Exception as e:return {'url':u,'result':'BLOCKED','error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:r=list(pool.map(check,urls))
(root/'audit/content-20261113/source-link-results.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print([(x['result'],x.get('status'),x['url']) for x in r])
