"""Export the new article pages without rewriting existing pages or root routing."""
import json,subprocess,shutil
from pathlib import Path
root=Path(__file__).resolve().parents[2];work=root/'tools/seo/work';work.mkdir(exist_ok=True)
shutil.copyfile(root/'index.html',work/'index-source.html')
subprocess.run(['node',str(root/'tools/seo/export.cjs'),str(work)],check=True,stdout=subprocess.DEVNULL)
a=json.loads((work/'articles.json').read_text())
# Alcohol has an independent multilingual reader; its SPA handler navigates away.
# It cannot be exported from the previous article body by jsdom.
for lang in a:a[lang]=[x for x in a[lang] if x['id']!='alkohol-drogy-diabetes']
(work/'articles.json').write_text(json.dumps(a,ensure_ascii=False))
subprocess.run(['python3',str(root/'tools/seo/build.py')],check=True)
new=json.loads((root/'content/articles-20261113.json').read_text())+json.loads((root/'content/articles-foot-care-20261113.json').read_text())
files=['seo/articles.json','sitemap.xml']
for lang in ['cs','sk','en','hu']:
 files.append(f'{lang}/clanky/index.html')
 files += [f'{lang}/clanky/{a["id"]}/index.html' for a in new]
for f in files:
 dst=root/f;dst.parent.mkdir(exist_ok=True,parents=True);shutil.copyfile(work/'site'/f,dst)
print('Copied',len(files),'files; preserved root and existing article pages')
