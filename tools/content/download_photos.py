"""Reacquire each published photograph using its recorded Commons provenance."""
import json,urllib.request,io,hashlib
from pathlib import Path
from PIL import Image,ImageOps
root=Path(__file__).resolve().parents[2]
for p in json.loads((root/'content/recipe-photo-licenses.json').read_text()):
 dst=root/p['path']
 if dst.exists():
  assert hashlib.sha256(dst.read_bytes()).hexdigest()==p['sha256'],str(dst)
  continue
 request=urllib.request.Request(p['download'],headers={'User-Agent':'DIAKompas/1.0 content research'})
 with urllib.request.urlopen(request,timeout=60) as response:img=Image.open(io.BytesIO(response.read()))
 img=ImageOps.exif_transpose(img).convert('RGB');img.thumbnail((800,800));dst.parent.mkdir(parents=True,exist_ok=True);img.save(dst,'WEBP',quality=82,method=6)
 print(dst)
