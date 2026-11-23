# DIA Kompas – audit P0–P4, technický průchod 2026-11-23

## Ověřené výsledky
- Produkční zdroj `index.html` byl načten z GitHub blob `e51a09ac1d7668d45ac3b219b95001eabd8d9bdb` (1 093 553 znaků).
- P0: testovací zdroj 4 články × 4 jazyky, bez změny produkce. Nový read-only test `tests/scripts/check_p0_root_source.py` ověřuje původní texty, nadpisy, zdroje a strukturu vůči skutečnému `index.html`.
- CI workflow run [45167673234](https://github.com/DIAKompas/diakompas/actions/runs/45167673234) dokončen SUCCESS po přidání kontroly skutečného zdroje.
- Publikační řetězec: `index.html` → `tools/seo/export.cjs` (jsdom, `setLang`, `DK_ARTICLES`, `dkArticle`) → `tools/seo/build.py` → statické jazykové články, `seo/articles.json`, sitemap a index. Samostatný P0 preview generátor tento produkční řetězec **nenahrazuje**.

## P1–P4 první statická inventura
- P1: v hlavním souboru existují `setLang` a jazyková data; úplné posouzení všech 100 lokalizovaných textů a terminologie dosud neproběhlo.
- P2: produkční `index.html` obsahuje atributy `aria-label`, `aria-live`, `aria-expanded`, ale prosté hledání v souboru nenalezlo `SpeechRecognition` ani `speechSynthesis`. **To není důkaz chybějící hlasové funkce v samostatném soukromém prototypu**; tento prototyp je jiné prostředí.
- P3: hlavní soubor obsahuje viewport meta a responzivní CSS (`@media`). Skutečný browser test 393×873 a dotykového ovládání nebyl vykonán.
- P4: `tools/seo/build.py` generuje canonical, hreflang, Article JSON-LD, manifest a sitemap. Kontrola skutečných HTTP odpovědí všech URL zatím neproběhla.

## Bezpečnostní release gate
**BLOCKED pro produkční nasazení:** chybí ověření integrace upravených textů do skutečného zdroje a následná regenerace v izolované větvi, klinická revize a browser E2E. Do `main` nebylo zapsáno nic.

## Následující práce
1. P0: izolovaně připravit patch `index.html` s přesnou shodou původních 16 textů, bez zásahu do dalších dat; regenerovat standardním SEO řetězcem; testovat změny.
2. P1: jazykový audit, zachování věcného významu a srozumitelnosti.
3. P2: oddělené testy přístupnosti produkce a soukromého hlasového průvodce.
4. P3: reálný mobilní browser test.
5. P4: HTTP odkazy, sitemap, canonical/hreflang a regrese.
