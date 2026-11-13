import json,urllib.request,hashlib,concurrent.futures,subprocess,argparse
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
root=Path(__file__).resolve().parents[2];base='https://diakompas.github.io/diakompas/';parser=argparse.ArgumentParser();parser.add_argument('--commit',required=True);parser.add_argument('--path',action='append');parser.add_argument('--output',default='audit/content-20261113/production-results.json');args=parser.parse_args();commit=args.commit
new=json.loads((root/'content/articles-20261113.json').read_text());photos=json.loads((root/'content/recipe-photo-licenses.json').read_text())
paths=args.path or ['index.html']+[f'{lang}/clanky/{a["id"]}/index.html' for lang in ['cs','sk','en','hu'] for a in new]+[p['path'] for p in photos]
def check(p):
 try:
  request=urllib.request.Request(base+p+'?verify='+commit[:7],headers={'User-Agent':'DIAKompas/1.0 production verification'})
  with urllib.request.urlopen(request,timeout=40) as response:actual=response.read();status=response.status
  expected=subprocess.check_output(['git','show',commit+':'+p],cwd=root)
  same=hashlib.sha256(actual).digest()==hashlib.sha256(expected).digest()
  return {'path':p,'status':status,'bytes':len(actual),'sha256':hashlib.sha256(actual).hexdigest(),'matchesRelease':same,'result':'PASS' if status==200 and same else 'FAIL'}
 except Exception as e:return {'path':p,'result':'BLOCKED','error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(check,paths))
counts={k:sum(r['result']==k for r in results) for k in ['PASS','FAIL','BLOCKED']}
output={'kind':'Live production HTTP and byte equality, not browser E2E','checkedCommit':commit,'finished':datetime.now(ZoneInfo('Europe/Prague')).isoformat(),'counts':counts,'results':results}
(root/args.output).write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n');print(counts)
for r in results:
 if r['result']!='PASS':print(r)
