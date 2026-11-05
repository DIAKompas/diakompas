from pathlib import Path
import json,re,html,hashlib,xml.etree.ElementTree as ET
ROOT=Path(__file__).parent/'work';OUT=ROOT/'site';OUT.mkdir(exist_ok=True)
data=json.loads((ROOT/'articles.json').read_text());BASE='https://diakompas.github.io/diakompas/';LANGS=list(data)
copy={
'cs':dict(home='Domů',articles='Články',social='Ze sociálních sítí',start='Začínám s diabetem',intro='Vzdělávací články o diabetu, měření glukózy, stravě, pohybu a prevenci. U článků najdete konkrétní zdroje.',read='Číst článek',back='Všechny články',lang='Jazyk',privacy='Soukromí a měření',notice='Vzdělávací obsah nenahrazuje individuální doporučení zdravotníka.',pub='Publikováno',upd='Aktualizováno'),
'sk':dict(home='Domov',articles='Články',social='Zo sociálnych sietí',start='Začínam s diabetom',intro='Vzdelávacie články o diabete, meraní glukózy, strave, pohybe a prevencii. Pri článkoch nájdete konkrétne zdroje.',read='Čítať článok',back='Všetky články',lang='Jazyk',privacy='Súkromie a meranie',notice='Vzdelávací obsah nenahrádza individuálne odporúčanie zdravotníka.',pub='Publikované',upd='Aktualizované'),
'en':dict(home='Home',articles='Articles',social='From social media',start='Getting started with diabetes',intro='Educational articles about diabetes, glucose monitoring, food, activity and prevention, with specific sources.',read='Read article',back='All articles',lang='Language',privacy='Privacy and analytics',notice='Educational content does not replace individual advice from a healthcare professional.',pub='Published',upd='Updated'),
'hu':dict(home='Kezdőlap',articles='Cikkek',social='A közösségi médiából',start='Első lépések a cukorbetegséggel',intro='Ismeretterjesztő cikkek a cukorbetegségről, glükózmérésről, étkezésről, mozgásról és megelőzésről, konkrét forrásokkal.',read='Cikk elolvasása',back='Minden cikk',lang='Nyelv',privacy='Adatvédelem és mérés',notice='Az ismeretterjesztő tartalom nem helyettesíti az egészségügyi szakember személyre szabott tanácsát.',pub='Megjelent',upd='Frissítve')}
esc=lambda x:html.escape(str(x),quote=True)
url=lambda lang,id=None:BASE+f'{lang}/clanky/'+(id+'/' if id else '')
files={};manifest=[]
def put(path,s):
 q=OUT/path;q.parent.mkdir(parents=True,exist_ok=True);q.write_text(s);files[path]=s
def links(lang,id=None):
 variants=''.join(f'<link rel="alternate" hreflang="{l}" href="{url(l,id)}">' for l in LANGS)
 return variants+f'<link rel="alternate" hreflang="x-default" href="{url("cs",id)}">'
def page(lang,id,title,description,body,schema):
 c=copy[lang];canonical=url(lang,id);switch=''.join(f'<a href="{url(l,id)}" lang="{l}" hreflang="{l}"'+(' aria-current="page"' if l==lang else '')+'>'+{'cs':'CZ','sk':'SK','en':'EN','hu':'HU'}[l]+'</a>' for l in LANGS)
 return f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{esc(title)} | DIA Kompas</title><meta name="description" content="{esc(description)}"><link rel="canonical" href="{canonical}">{links(lang,id)}<meta property="og:type" content="{'article' if id else 'website'}"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(description)}"><meta property="og:url" content="{canonical}"><meta property="og:site_name" content="DIA Kompas"><link rel="stylesheet" href="{BASE}seo/style.css"><script type="application/ld+json">{json.dumps(schema,ensure_ascii=False).replace('</','<\\/')}</script><script defer src="{BASE}seo/analytics.js"></script></head><body data-article-id="{id or ''}" data-language="{lang}"><header><a class="brand" href="{BASE}?lang={lang}#domu"><img src="{BASE}logo.svg" width="44" height="44" alt="">DIA Kompas</a><nav aria-label="{esc(c['lang'])}">{switch}</nav></header><main><nav class="breadcrumbs"><a href="{BASE}?lang={lang}#domu">{c['home']}</a> · <a href="{url(lang)}">{c['articles']}</a></nav>{body}</main><footer><nav><a href="{url(lang)}">{c['back']}</a><a href="{BASE}?lang={lang}#zacinam">{c['start']}</a><a href="{BASE}?lang={lang}#socialni-site">{c['social']}</a><button id="privacy-open">{c['privacy']}</button></nav><p>{c['notice']}</p></footer></body></html>'''
for lang,articles in data.items():
 c=copy[lang];cards=[]
 for a in articles:
  id=a['id'];body=a['rendered']
  body=re.sub(r'href="#clanek-([a-z0-9-]+)"',lambda m:'href="'+url(lang,m[1])+'"',body)
  body=re.sub(r'href="(#pojem-[a-z0-9-]+|#zacinam)"',lambda m:'href="'+BASE+'?lang='+lang+m[1]+'"',body)
  schema={'@context':'https://schema.org','@type':'Article','headline':a['title'],'description':a['lead'],'inLanguage':lang,'mainEntityOfPage':url(lang,id),'publisher':{'@type':'Organization','name':'DIA Kompas','url':BASE}}
  for f,key in [('published','datePublished'),('updated','dateModified')]:
   if a.get(f):schema[key]=a[f]
  put(f'{lang}/clanky/{id}/index.html',page(lang,id,a['title'],a['lead'],body,schema))
  manifest.append({'id':id,'language':lang,'canonicalURL':url(lang,id),'legacyURL':BASE+'#clanek-'+id,'published':a.get('published'),'updated':a.get('updated'),'sourceSHA256':hashlib.sha256(json.dumps({k:v for k,v in a.items() if k!='rendered'},ensure_ascii=False,sort_keys=True).encode()).hexdigest()})
  dates='';published=a.get('published');updated=a.get('updated')
  if updated or published:dates=f'<p class="date">{c["upd"] if updated and published and updated>published else c["pub"]}: {esc(updated or published)}</p>'
  cards.append(f'<article class="card"><h2><a href="{url(lang,id)}">{esc(a["title"])}</a></h2><p>{esc(a["lead"])}</p>{dates}<a href="{url(lang,id)}">{c["read"]} →</a></article>')
 body=f'<h1>DIA Kompas — {c["articles"]}</h1><p class="lead">{c["intro"]}</p><div class="cards">'+''.join(cards)+'</div>'
 put(f'{lang}/clanky/index.html',page(lang,None,c['articles'],c['intro'],body,{'@context':'https://schema.org','@type':'CollectionPage','name':'DIA Kompas — '+c['articles'],'inLanguage':lang,'url':url(lang)}))
put('seo/style.css','''*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:20px}body{margin:0;background:#f7fbfe;color:#173e5a;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif}header,footer{padding:18px max(18px,calc((100% - 1080px)/2));background:#fff;border-bottom:1px solid #d8e7f0}header{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}.brand{display:flex;align-items:center;gap:10px;font-size:25px;font-weight:800;text-decoration:none}nav{display:flex;gap:12px;flex-wrap:wrap;align-items:center}nav a,button{min-height:44px;display:inline-flex;align-items:center;padding:8px 10px;border-radius:8px}nav a[aria-current]{background:#0877cf;color:white}main{max-width:800px;margin:auto;padding:24px 22px 40px;overflow-wrap:anywhere}a{color:#066ba8;text-underline-offset:3px}a:hover{text-decoration:underline}a:focus-visible,button:focus-visible{outline:3px solid #11a8b1;outline-offset:3px}h1{font-size:clamp(26px,5vw,36px);line-height:1.2;letter-spacing:-.5px}h2{font-size:23px;line-height:1.35;margin:30px 0 12px}h3{font-size:20px}p,li{font-size:17px;line-height:1.65}li{margin-bottom:8px}.lead{font-size:19px;color:#455e70}.breadcrumbs{font-size:14px}.dk-article-dates,.date,.meta{font-size:14px;color:#526b7b}.content-draft{padding:12px 16px;background:#eaf6ff;border-radius:10px;font-size:14px;line-height:1.6}.content-sources,.dk-reader-related,.dk-reader-glossary{margin:24px 0;padding:16px;border:1px solid #cbdfea;border-radius:12px;background:#fff}.content-sources p,.content-sources li,.dk-reader-glossary li{font-size:15px}summary{cursor:pointer;min-height:44px;font-weight:700}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.card{padding:18px;background:#fff;border:1px solid #d8e7f0;border-radius:12px}.card h2{font-size:21px;margin:0 0 10px}.card p{font-size:15px}table{border-collapse:collapse;width:100%;font-size:15px}th,td{border:1px solid #cbdfea;padding:10px;text-align:left}.dk-release-table{overflow-x:auto}caption{text-align:left;margin-bottom:10px}img{max-width:100%;height:auto}footer p{font-size:14px}button{font:inherit;border:1px solid #b5cfdf;background:#fff;color:#173e5a;cursor:pointer}dialog{max-width:540px;width:calc(100% - 32px);border:1px solid #b5cfdf;border-radius:14px;padding:24px;color:#173e5a}dialog::backdrop{background:#092f6780}dialog p{font-size:15px}.privacy-actions{display:flex;gap:10px;flex-wrap:wrap}@media(max-width:560px){main{padding:20px 17px 30px}.cards{grid-template-columns:1fr}p,li{font-size:16px}h2{font-size:21px}header{padding:14px 17px}.brand{font-size:23px}}''')
put('seo/articles.json',json.dumps(manifest,ensure_ascii=False,indent=2))
# The root document keeps legacy hash routes and article content intact.
s=(ROOT/'index-source.html').read_text()
s=re.sub(r'<!-- dk-seo-head -->.*?<!-- /dk-seo-head -->','',s,flags=re.S)
s=re.sub(r'<!-- dk-seo-archives -->.*?<!-- /dk-seo-archives -->','',s,flags=re.S)
s=re.sub(r'<!-- dk-seo-routing -->.*?<!-- /dk-seo-routing -->','',s,flags=re.S)
head=f'''<meta name="description" content="DIA Kompas – srozumitelný průvodce diabetem. Články o glukometrech a CGM, HbA1c, stravě, pohybu a prevenci s odkazy na zdroje."><link rel="canonical" href="{BASE}"><meta property="og:title" content="DIA Kompas – diabetes srozumitelně"><meta property="og:description" content="Vzdělávací průvodce diabetem: články, recepty a vysvětlení pojmů."><meta property="og:url" content="{BASE}"><meta property="og:type" content="website"><script type="application/ld+json">{{"@context":"https://schema.org","@type":"WebSite","name":"DIA Kompas","alternateName":["Diakompas","DiaKompas"],"url":"{BASE}","inLanguage":["cs","sk","en","hu"]}}</script>'''
s=s.replace('</head>','<!-- dk-seo-head -->'+head+'<!-- /dk-seo-head -->\n</head>')
# Explicit language selection in a normal link takes precedence over detection.
if "const requested=new URLSearchParams(location.search).get('lang');" not in s:s=s.replace("const saved=window.__diaStoreGet('diakompas-lang');","const requested=new URLSearchParams(location.search).get('lang');\n const saved=window.__diaStoreGet('diakompas-lang');",1)
s=s.replace("window.__diaInitialLang=manual&&supported.includes(saved)?saved:detected;","window.__diaInitialLang=supported.includes(requested)?requested:manual&&supported.includes(saved)?saved:detected;",1)
archive='<div class="wrap" style="padding:18px 0"><nav aria-label="DIA Kompas — články / articles"><a href="'+url('cs')+'">Články česky</a><a href="'+url('sk')+'" lang="sk">Články po slovensky</a><a href="'+url('en')+'" lang="en">Articles in English</a><a href="'+url('hu')+'" lang="hu">Cikkek magyarul</a></nav></div>'
s=s.replace('</footer>','<!-- dk-seo-archives -->'+archive+'<!-- /dk-seo-archives --></footer>',1)
# Canonical links are discoverable even if JavaScript is unavailable.
catalog='<noscript><section class="wrap"><h2>DIA Kompas — články</h2><ul>'+''.join(f'<li><a href="{url("cs",a["id"])}">{esc(a["title"])}</a></li>' for a in data['cs'])+'</ul></section></noscript>'
s=s.replace('</body>','<!-- dk-seo-routing -->'+catalog+'''<script id="dk-search-friendly-links-20261105">(()=>{const map=()=>{const lang=document.documentElement.lang||'cs';document.querySelectorAll('a[href^="#clanek-"],a[data-seo-article]').forEach(a=>{if(a.closest('#article-body'))return;a.dataset.seoArticle=a.dataset.seoArticle||a.getAttribute('href').slice(8);a.href='/diakompas/'+lang+'/clanky/'+a.dataset.seoArticle+'/';});};const old=window.setLang;window.setLang=function(){const r=old.apply(this,arguments);map();return r;};map();})();</script><!-- /dk-seo-routing -->\n</body>''')
# Recognize organic search referrals using only an allowlisted hostname.
s=s.replace("if(/(^|\\.)youtube\\.com$|(^|\\.)youtu\\.be$/.test(host))return 'youtube';", "if(/(^|\\.)youtube\\.com$|(^|\\.)youtu\\.be$/.test(host))return 'youtube';if(/(^|\\.)google\\.(com|cz|sk|hu)$/.test(host))return 'google';if(/(^|\\.)seznam\\.cz$/.test(host))return 'seznam';if(/(^|\\.)bing\\.com$/.test(host))return 'bing';")
s=s.replace("campaign_medium:source()!=='other'?'social':undefined", "campaign_medium:['google','seznam','bing'].includes(source())?'organic':source()!=='other'?'social':undefined")
put('index.html',s)
ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9');ns='{http://www.sitemaps.org/schemas/sitemap/0.9}';tree=ET.Element(ns+'urlset')
for loc,date in [(BASE,None)]+[(url(l),None) for l in LANGS]+[(x['canonicalURL'],max(filter(None,[x['published'],x['updated']]),default=None)) for x in manifest]:
 el=ET.SubElement(tree,ns+'url');ET.SubElement(el,ns+'loc').text=loc
 if date:ET.SubElement(el,ns+'lastmod').text=date
put('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n'+ET.tostring(tree,encoding='unicode'))
# The crawler rules must be served at the host root; a project-path robots.txt is informational only.
put('robots.txt','User-agent: *\nAllow: /\nSitemap: '+BASE+'sitemap.xml\n')
(ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({'articlePages':len(manifest),'archives':len(LANGS),'files':len(files),'sitemapURLs':len(list(tree))}))
