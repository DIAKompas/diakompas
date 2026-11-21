# Microsoft Rocketbox Business Female 04

- Model `assistant.glb` je totožný s `avatars/female.glb` z [InterviewFlowAI Talking Avatar](https://github.com/InterviewFlowAI/talking-avatar/tree/d3e4dcf6609d733097466eb17b3fa63fc720140a/avatars), revize `d3e4dcf6609d733097466eb17b3fa63fc720140a`.
- Původní model, kostra, vložené textury, materiály včetně vlasů a saka a mimické tvary pocházejí z [Microsoft Rocketbox](https://github.com/microsoft/Microsoft-Rocketbox). Pro redistribuci této varianty viz přiložený [MIT text Microsoftu](ROCKETBOX-LICENSE.txt). InterviewFlowAI exportoval model do GLB a použil kompresi meshopt. DIA Kompas používá samotný GLB bez jejich SDK nebo hostované služby.
- SHA-256 nového binárního souboru je `0698f2d091c25d6d78135447024b41770556348bb19b88f14aecac44d1e67165`. Soubor má 821 360 B. Vložených je pět WebP textur a 67 mimických tvarů.
- `assistant.webp` je zmenšený skutečný render tohoto modelu v Chromiu. Slouží během načítání a jako 2D alternativa bez WebGL.
- `meshopt-decoder.js` je distribuovaný modul verze 1.1 přebraný z Three.js r187. Licence [meshoptimizer MIT](MESHOPT-LICENSE.txt). Všechny podklady načítá web ze svého umístění.

## Reprodukce a ověření

Z uvedeného commitu Talking Avatar zkopírujte `avatars/female.glb` do `assets/assistant4/assistant.glb`. Srovnejte SHA-256. Spusťte `node audit/assistant4-auto-browser.cjs` a `node audit/assistant4-browser.cjs`. Proměnná `DIA4_SCREENSHOTS` umožňuje uložit snímky a `DIA4_REPORT` exportovat výsledky hlavní sady. Test používá skutečný Chromium a soubory z tohoto checkoutu. Hlas potřebuje dostupné hlasy pro CS, SK, EN a HU.

`engine.js` používá kost `Head` se zachováním výchozí orientace, oční morph targety ARKit a kombinaci `jawOpen`, `viseme_aa` a `mouthFunnel`. Rytmus pohybu úst je přibližný a běží pouze při aktivním přehrávání. CSS využívá stejný poměr stran pro živý model i portrét. Materiál hlavy zachovává mapu normál a sako původní atlas.

Předchozí model MakeHuman byl zamítnut kvůli výslednému vzhledu. Výroba a licence staršího exportu jsou doložené v historii repozitáře. K výběru nové varianty byl porovnán tento starší render s variantou Microsoftu vykreslenou na obou cílových rozlišeních.

## Hologram

`hologram.glb` and its transparent SVG fallback are adapted from the neutral `body` mesh in MakeHuman's `base.obj` under CC0 1.0. The derived model uses only head/neck geometry and no body shape sliders, hair, skin materials, eyes, clothing or textures. The wireframe and fallback are reproducible with `tools/make-hologram.py`.

- [Pinned MakeHuman base.obj](https://github.com/makehumancommunity/makehuman/blob/a8bc2d54ff0ac92e78ff71431b1023eda42bf482/makehuman/data/3dobjs/base.obj)
- [Pinned MakeHuman asset license](https://github.com/makehumancommunity/makehuman/blob/a8bc2d54ff0ac92e78ff71431b1023eda42bf482/LICENSE.ASSETS.md)
