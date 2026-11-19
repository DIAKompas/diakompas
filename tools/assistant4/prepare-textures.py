"""Prepare skin and alpha-preserving hair textures from the extracted CC0 asset pack."""
from pathlib import Path
import shutil
import sys

from PIL import Image

source, destination = map(Path, sys.argv[1:3])
destination.mkdir(parents=True, exist_ok=True)
skin = source / "skins/young_caucasian_female/young_lightskinned_female_diffuse.png"
hair = source / "hair/ponytail01"

with Image.open(skin) as image:
    image.convert("RGB").resize((1024, 1024), Image.Resampling.LANCZOS).save(
        destination / "skin.jpg", quality=84, optimize=True)
with Image.open(hair / "ponytail01_diffuse.png") as image:
    resized = image.convert("RGBA").resize((448, 448), Image.Resampling.LANCZOS)
    resized.quantize(colors=256, method=Image.Quantize.FASTOCTREE).save(destination / "hair.png", optimize=True)
for filename in ("ponytail01.obj", "ponytail01.mhclo"):
    shutil.copyfile(hair / filename, destination / filename)
