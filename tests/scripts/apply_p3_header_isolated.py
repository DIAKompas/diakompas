#!/usr/bin/env python3
"""Apply reviewed P3 CSS to an isolated checkout only; never writes to production."""
from pathlib import Path
import argparse
p=argparse.ArgumentParser()
p.add_argument('--isolated-ci',action='store_true')
args=p.parse_args()
if not args.isolated_ci: raise SystemExit('BLOCKED: requires --isolated-ci')
root=Path(__file__).resolve().parents[2]
index=root/'index.html'
css=(root/'tests/patches/p3-header-overflow.css').read_text(encoding='utf-8')
original=index.read_text(encoding='utf-8')
marker='<!-- DIA-P3-ISOLATED-HEADER-PATCH -->'
if marker in original:raise SystemExit('BLOCKED: patch already present')
if '<style id="master41">' not in original:raise SystemExit('BLOCKED: expected existing styles missing')
if 'header .top' not in original:raise SystemExit('BLOCKED: header layout not found')
new=original.replace('</head>',marker+'\n<style id="dia-p3-header-fix">\n'+css+'\n</style>\n</head>',1)
if new.count(marker)!=1:raise SystemExit('BLOCKED: injection failed')
index.write_text(new,encoding='utf-8')
print('PASS: injected reviewed P3 header CSS into isolated checkout index.html')
