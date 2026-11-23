#!/usr/bin/env python3
"""Build a downloadable self-contained photo-card preview; never edit main."""
from pathlib import Path
import subprocess,sys
root=Path(__file__).resolve().parents[2]
subprocess.run([sys.executable,str(root/'tests/scripts/apply_p3_header_isolated.py'),'--isolated-ci'],check=True)
page=root/'index.html'
s=page.read_text(encoding='utf-8')
css=(root/'tests/patches/photo-card-mobile-preview.css').read_text(encoding='utf-8')
js=(root/'tests/patches/photo-card-mobile-preview.js').read_text(encoding='utf-8')
assert '</head>' in s and '</body>' in s
s=s.replace('</head>','<style id="dia-photo-card-preview">\n'+css+'\n</style>\n</head>',1)
s=s.replace('</body>','<script id="dia-photo-card-preview-script">\n'+js+'\n</script>\n</body>',1)
page.write_text(s,encoding='utf-8')
print('PASS: isolated photo-card HTML prototype created')
