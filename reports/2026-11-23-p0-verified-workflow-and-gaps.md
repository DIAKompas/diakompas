# DIA Kompas – P0 průběžné ověření (2026-11-23)

## Rozsah
Pouze oddělená větev `review/plain-language-safety-cz-sk-en-hu-20261123`. Produkční `main` beze změny.

## Ověřené skutečnosti
- Produkční `index.html` lze načíst přes GitHub blob SHA `e51a09ac1d7668d45ac3b219b95001eabd8d9bdb`; soubor má 1 093 553 znaků. Obsahuje vložené pole `const DK_ARTICLES` i texty čtyř prioritních témat. Nejde tedy jen o externí JSON.
- Testovací fixtures: `tests/fixtures/plain-language-safety-20261123.json` – 4 témata × 4 jazyky = 16 lokalizací.
- Workflow run 45165320588: úspěšné kroky „Build isolated HTML preview“, „Check all 16 pages and safety text preservation“, „Upload artifact“. Artefakt `dia-kompas-safety-review-preview` existuje a není expirovaný.
- Generátor `tests/scripts/build_plain_language_preview.py` vytváří **samostatné** statické stránky s `noindex,nofollow`, nikoli změny v produkčním `index.html` ani standardních článkových stránkách.
- Automatické kontroly generátoru kontrolují počet, základní HTML, existenci jazykových souborů, HTTPS schéma zdrojů a metatagy. **Nekontrolují** skutečnou HTTP dostupnost zdrojů, klinickou správnost, ekvivalenci všech překladů ani skutečné ovládání v mobilním prohlížeči.

## P0 odborné body k ověření
1. `diabeticka-noha`: včasné akutní vyšetření horké oteklé nohy i bez bolesti; nezatěžování při podezření na Charcotovu nohu.
2. `nohy-varovne-priznaky`: jasné rozlišení kontroly dnes / okamžité akutní pomoci.
3. `bercove-vredy`: posouzení prokrvení před kompresí a bezpečné rozlišení varovných příznaků.
4. `nemoc-sick-day-plan`: ketoacidóza, zvracení, tekutiny, urgentní pomoc a žádné individuální dávkování inzulinu.

## Stav
- PASS: získání hlavního zdroje; sestavení 16 izolovaných HTML náhledů; workflow kontroly; uložení artefaktu.
- PENDING: nezávislá odborná kontrola; ověření dostupnosti zdrojů; browser E2E včetně 393 px; srovnání s produkčními články.
- BLOCKED pro nasazení: není ověřená integrace do skutečné publikační cesty.

## Další postup bez dalšího schvalování
Dokončit P0 důkazy; případné opravy výhradně v testovací větvi. Poté pokračovat P1–P4. Nepřepisovat funkční hlasový MASTER, neměnit design ani `main` bez úplných PASS.
