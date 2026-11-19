# DIA Kompas 4.0 – provoz a vývoj asistentky

Vývojová větev je `feature/dia-kompas-4-3d-assistant`. Ostré rozhraní větve se testuje z kořenové stránky. Soubor `preview/assistant-4-prototype.html` zachovává historický prototyp a odkazuje na nové rozhraní.

## Rozhovor a hlas

- Stávající průvodce vysílá z panelu událost `dk:guide-state` při psaní, zpracování, dokončení odpovědi a resetu. Událost dokončení obsahuje hotový DOM odpovědi. Modul asistentky nemění volbu odpovědí ani bezpečnostní logiku.
- Hlas se spouští stisknutím tlačítka u hotové odpovědi. Výběr zobrazuje místní hlasy se stejným hlavním jazykem. Pokud odpovídající hlas chybí, stránka vysvětlí důvod a nabídne textovou odpověď. Zastavení ruší i čekající požadavek. Nový dotaz, reset, změna jazyka a skrytí karty hlas zastaví.
- Otevření úst vychází ze stavu skutečného hlasového výstupu. Animace má rytmický průběh a je přibližná. Asistentka neposílá text vlastní externí hlasové službě a nepoužívá mikrofon.

## Model, licence a výkon

- Základní geometrie a mimické posuny pocházejí z [MakeHuman Community, revize a8bc2d5](https://github.com/makehumancommunity/makehuman/tree/a8bc2d54ff0ac92e78ff71431b1023eda42bf482/makehuman/data), s [licencí CC0 pro základní podklady](https://www.makehumancommunity.org/about/license.html). Textura pleti `young_caucasian_female` a anatomicky přizpůsobený účes `ponytail01` pocházejí z [MakeHuman System Assets CC0](https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html). Tričko a materiály očí byly vytvořeny pro tento export. Portrét WebP je statický render stejného modelu. Model má anatomickou geometrii a textury pleti a vlasů. Pro dosažení fotorealismu je stále prostor v detailech osvětlení, kůže a oblečení.
- Three.js 0.187.0 a GLTFLoader se distribuují lokálně. Kopie licencí CC0 a MIT jsou v `assets/assistant4/`.
- Aplikace odkládá stažení rendereru a GLB do momentu zapnutí 3D. Vykresluje nejvýše přibližně 30 snímků za sekundu a s poměrem pixelů nejvýše 1,5. Rozhovor je použitelný ve 2D. Při ztrátě kontextu se uvolní scéna a vrátí se 2D portrét. Ruční omezení pohybu i systémové `prefers-reduced-motion` vypínají průběžnou animaci.
- Vzdělávací modely jsou schematické. Ke každému patří textový výklad a odborný zdroj. Zdroje jsou [NIDDK pro CGM](https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/continuous-glucose-monitoring), [NIDDK pro HbA1c](https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test) a [CDC pro talíř](https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html).

## Reprodukce

1. Získejte základní MakeHuman podklady z výše uvedené revize a rozbalte [systémový balíček CC0](https://files.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip). S Pythonem a Pillow spusťte `python tools/assistant4/prepare-textures.py /cesta/k/rozbalenemu/balicku /docasna/cesta/textury`. Pak exportujte `blender -b --python-exit-code 1 --python tools/assistant4/export-avatar.py -- /cesta/k/makehuman/data /docasna/cesta/textury assets/assistant4/assistant.glb`.
2. Pro obnovu balíčku Three.js nainstalujte do dočasného adresáře `three@0.187.0` a `esbuild@0.28.0`. Do `NODE_PATH` nastavte jeho absolutní cestu k `node_modules`. Spusťte esbuild s argumenty `tools/assistant4/three-entry.js --bundle --minify --format=esm --target=es2022 --legal-comments=inline --outfile=assets/assistant4/three-vendor.js`.
3. Pro nový WebP zapněte 3D, vytvářejte snímek prvku `.dk4-visual` před prvním dotazem a exportujte portrét 160 × 160 px.
4. S Playwrightem a nainstalovaným Chromium spusťte `node audit/assistant4-browser.cjs` a `E2E_SCOPE=all node audit/browser-e2e-ci.cjs`. Pro širší regresi použijte `ISSUE30_EXTERNAL=0 node audit/browser-issue-30.cjs`. Proměnná `DIA4_REPORT` určuje cestu výstupního JSON. Logiku hlasového adaptéru lze ověřit odděleně pomocí `node --test audit/assistant4-speech.cjs` se simulovaným hlasovým rozhraním. Návratový kód 2 u testu asistentky označuje chybějící možnost ověření. Pro praktický test zvuku má mít zařízení nainstalované místní hlasy CZ, SK, EN a HU.
