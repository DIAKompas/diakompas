#!/usr/bin/env python3
"""Build an isolated, unpublishable HTML review preview from the 16 approved JSON fixtures."""
import json, html, pathlib, re, sys
from urllib.parse import urlparse
ROOT=pathlib.Path(__file__).resolve().parents[2]
SOURCE=ROOT/'tests/fixtures/plain-language-safety-20261123.json'
OUT=ROOT/'tests/output/plain-language-safety'
LANGS=('cs','sk','en','hu')
IDS=('diabeticka-noha','nohy-varovne-priznaky','bercove-vredy','nemoc-sick-day-plan')
LABEL={'cs':('Bezpečnostní testovací náhled','Zpět na přehled','Odborné zdroje'),'sk':('Bezpečnostný testovací náhľad','Späť na prehľad','Odborné zdroje'),'en':('Safety review preview','Back to overview','Clinical sources'),'hu':('Biztonsági tesztelőnézet','Vissza az áttekintéshez','Szakmai források')}
E=lambda s:html.escape(str(s),quote=True)
def url(lang,id):return f'../../{lang}/{id}.html'
def main():
 data=json.loads(SOURCE.read_text(encoding='utf-8'));assert len(data)==4
 assert {x['id'] for x in data}==set(IDS)
 OUT.mkdir(parents=True,exist_ok=True);pages=[]
 for article in data:
  for lang in LANGS:
   a=article['locales'][lang];assert a['title'] and a['lead'] and len(a['sections']) in (4,5)
   assert all(len(s)==2 and all(s) for s in a['sections'])
   links=' '.join(f'<a href="../{other}/{article["id"]}.html" hreflang="{other}">{other.upper()}</a>' for other in LANGS)
   sections=''.join(f'<section><h2>{E(h)}</h2><p>{E(t)}</p></section>' for h,t in a['sections'])
   sources=''.join(f'<li><a rel="noopener noreferrer" href="{E(u)}">{E(name)}</a></li>' for name,u in article['sources'] if urlparse(u).scheme=='https')
   assert len(article['sources'])==sources.count('<li>')
   title=E(a['title']);desc=E(a['lead'])
   doc=f"""<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{title} | DIA Kompas TEST</title><meta name="description" content="{desc}"><style>body{{font:18px/1.65 system-ui,Arial,sans-serif;color:#173e5a;background:#f7fbfe;margin:auto;max-width:850px;padding:16px}}nav a{{display:inline-block;padding:9px}}main{{background:white;border-radius:12px;padding:clamp(16px,4vw,36px)}}h1{{line-height:1.25}}p{{overflow-wrap:anywhere}}.notice{{padding:10px;border:2px solid #b35a12}}a{{color:#075b9c}}@media(max-width:420px){{body{{font-size:17px;padding:8px}}main{{padding:14px}}}}</style></head><body><header><strong>DIA Kompas – {E(LABEL[lang][0])}</strong><p class="notice">TEST / NOT PUBLISHED / NOINDEX</p><nav aria-label="Language">{links}</nav></header><main><h1>{title}</h1><p>{desc}</p>{sections}<h2>{E(LABEL[lang][2])}</h2><ul>{sources}</ul></main><footer><a href="../index.html">{E(LABEL[lang][1])}</a></footer></body></html>"""
   dest=OUT/lang/(article['id']+'.html');dest.parent.mkdir(exist_ok=True);dest.write_text(doc,encoding='utf-8');pages.append(dest)
 idx='<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>DIA Kompas TEST</title></head><body><h1>Isolated review preview – not published</h1><ul>'+''.join(f'<li><a href="{lang}/{a["id"]}.html">{E(lang+" "+a["locales"][lang]["title"])}</a></li>' for a in data for lang in LANGS)+'</ul></body></html>'
 (OUT/'index.html').write_text(idx,encoding='utf-8')
 for p in pages:
  s=p.read_text();assert '<meta name="robots" content="noindex,nofollow">' in s and '<meta name="description"' in s
  for other in LANGS:assert (OUT/other/p.name).exists()
 assert len(pages)==16
 print('PASS: 16 isolated HTML pages, language links, meta descriptions, noindex, sources and responsive styles')
if __name__=='__main__':main()
