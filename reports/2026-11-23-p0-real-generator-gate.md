# DIA Kompas – P0 integration gate, 2026-11-23

## Implementováno pouze v review větvi
- `tests/scripts/patch_p0_index_isolated.py` – skript s povinným přepínačem `--isolated-ci`, který má v dočasné kopii nahradit pouze sekce 4 schválených článků v CZ/SK/EN/HU a před změnou ověřit shodu původních textů, nadpisů, zdrojů a počtu sekcí.
- `.github/workflows/p0-real-generator-integration.yml` – izolovaná CI regenerace skutečným `tools/seo/regenerate.cjs`, následná kontrola 16 článků a povolených cest změn.
- Commity `e762abfb430243b3b3a2d2f2b6b36f26f030bb87`, `fce439ec509764de343ba23b123e7228fc63c505`.

## Stav důkazů
- PASS: dřívější `plain-language-safety-preview.yml` běhy, včetně root source gate.
- NOT YET VERIFIED: nový `p0-real-generator-integration.yml` se v dostupném seznamu GitHub Actions běhů neobjevil. Nový workflow v jiné než výchozí větvi může vyžadovat zvláštní spuštění či dostupnost na default branch; není dovoleno vydávat vytvoření YAML za proběhlý test.
- PENDING: klinická revize, skutečný prohlížeč 393 px, HTTP kontrola zdrojů a důkaz přesné regenerace.
- BLOCKED: produkční merge/nasazení do dokončení kritických kontrol.

## Pokračování
Nejdříve získat provedený CI běh skutečného generátoru (nebo ekvivalentní izolované lokální spuštění), analyzovat jeho logy a diffs. Při FAIL opravit výhradně review větev. Poté dokončit P0 a pokračovat P1–P4. Produkční main a soukromý hlasový MASTER nedotčeny.
