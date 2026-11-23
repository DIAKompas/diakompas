#!/usr/bin/env python3
"""Read-only P1-P4 static regression audit for the checked-out DIA Kompas tree."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter,defaultdict
import json,re,sys,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[2]
LANGS=('cs','sk','en','hu')
BASE='https://diakompas.github.io/diakompas/'
class Inspect(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags=[];self.lang=None;self.canonical=[];self.alternates={};self.viewport=False
        self.images=[];self.headings=[];self.links=[];self.jsonld=0;self.focusable=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs);self.tags.append(tag)
        if tag=='html':self.lang=a.get('lang')
        if tag=='meta' and a.get('name')=='viewport':self.viewport=True
        if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
        if tag=='link' and a.get('rel')=='alternate':self.alternates[a.get('hreflang')]=a.get('href')
        if tag=='img':self.images.append(a)
        if tag in ('h1','h2'):self.headings.append(tag)
        if tag=='a':self.links.append(a.get('href',''))
        if tag=='script' and a.get('type')=='application/ld+json':self.jsonld+=1
        if tag in ('a','button','input','select','textarea'):self.focusable+=1
def main():
    manifest=json.loads((ROOT/'seo/articles.json').read_text(encoding='utf-8'))
    errors=[];warnings=[];seen=set();bylang=Counter();ids=defaultdict(set)
    for row in manifest:
        lang=row['language'];aid=row['id'];bylang[lang]+=1;ids[aid].add(lang)
        key=(lang,aid)
        if key in seen:errors.append(f'duplicate manifest {key}')
        seen.add(key)
        path=ROOT/lang/'clanky'/aid/'index.html'
        if not path.exists():errors.append(f'missing {path}');continue
        doc=path.read_text(encoding='utf-8')
        p=Inspect();p.feed(doc)
        expected=BASE+lang+'/clanky/'+aid+'/'
        if p.lang!=lang:errors.append(f'html language mismatch {key}')
        if p.canonical!=[expected]:errors.append(f'canonical mismatch {key}')
        if row['canonicalURL']!=expected:errors.append(f'manifest URL mismatch {key}')
        if not p.viewport:errors.append(f'viewport missing {key}')
        if p.headings.count('h1')!=1:errors.append(f'h1 count {key}: {p.headings.count("h1")}')
        if not p.jsonld:errors.append(f'JSON-LD missing {key}')
        for other in LANGS:
            target=BASE+other+'/clanky/'+aid+'/'
            if p.alternates.get(other)!=target:errors.append(f'hreflang {other} mismatch {key}')
        if p.alternates.get('x-default')!=BASE+'cs/clanky/'+aid+'/':errors.append(f'x-default mismatch {key}')
        for im in p.images:
            if 'alt' not in im:errors.append(f'img without alt {key}')
        if p.focusable==0:warnings.append(f'no focusable controls {key}')
    for aid,langs in ids.items():
        if langs!=set(LANGS):errors.append(f'language coverage {aid}: {sorted(langs)}')
    if len(set(bylang.values()))!=1:errors.append(f'language count differs: {dict(bylang)}')
    root=(ROOT/'index.html').read_text(encoding='utf-8')
    if not re.search(r'<meta\b[^>]*name=["\']viewport["\']',root):errors.append('root viewport missing')
    if 'setLang(' not in root:errors.append('root language switch missing')
    if 'DK_ARTICLES' not in root:errors.append('root article data missing')
    if not (ROOT/'sitemap.xml').exists():errors.append('sitemap.xml missing')
    else:
        try:
            tree=ET.parse(ROOT/'sitemap.xml')
            urls=[x.text for x in tree.iter() if x.tag.endswith('loc')]
            for row in manifest:
                if row['canonicalURL'] not in urls:errors.append(f'sitemap missing {row["language"]}/{row["id"]}')
        except Exception as exc:errors.append(f'sitemap parse failed {exc}')
    print(json.dumps({'checked_articles':len(manifest),'by_language':dict(bylang),'unique_ids':len(ids),'errors':errors[:30],'warnings':warnings[:30],'total_errors':len(errors),'total_warnings':len(warnings)},ensure_ascii=False,indent=2))
    if errors:sys.exit(1)
    print('PASS: P1 language coverage; P2 static semantic controls; P3 viewport; P4 canonical, hreflang, JSON-LD, sitemap')
    print('LIMIT: no clinical review, visual/mobile browser E2E, keyboard interaction or live HTTP checks')
if __name__=='__main__':main()
