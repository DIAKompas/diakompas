# DIA Kompas 3.0 — audit struktury a plán modální čtečky
Datum: 2026-11-17
Větev: feature/modalni-ctecka-20261117
Produkce main: beze změn

## Ověřená struktura main
GitHub Git Trees API, recursive=1: 195 souborů, truncated=false, 95 HTML souborů, 84 lokalizovaných HTML stránek (21 cs, 21 sk, 21 en, 21 hu).
index.html: 1 085 650 bajtů, samostatná aplikace s vloženým obsahem.
content/articles-20261113.json a content/recipes-20261113.json: obsahová data.
tools/content/integrate.py, build_pages.py, validate.py: generování a kontroly.
seo/style.css a seo/analytics.js: samostatné SEO články; canonical, hreflang, JSON-LD.
audit/content-browser-e2e.cjs: reálné browser testy.
assets/recipes: obrázky a licence.
Příklad cs/clanky/cgm/index.html: plnohodnotný statický článek s odkazy na další článek, slovník, externí zdroje a jazykové mutace.

## Návrh implementace
1. Zachovat přímé adresy, canonical, hreflang a statické články kvůli SEO, sdílení a sociálním sítím.
2. Na interních odkazech z aplikace otevřít čtečku jako dialog bez opuštění stránky.
3. Čtečka zobrazí celý článek, nikoliv jen úryvek, včetně zdrojů, obrázků a souvisejících článků; recepty a slovník budou mít vlastní adaptéry.
4. Při zavření obnovit fokus na původní odkaz a přesnou pozici scrollu.
5. Podporovat vnořené přechody a tlačítko Zpět v čtečce; neblokovat externí odkazy a nouzové informace.
6. Podporovat klávesnici (Esc, focus trap), screen readery (role=dialog, aria-modal), mobil 393×873 a desktop 1440×900.
7. Přímý příchod z odkazu musí stále fungovat jako běžná samostatná stránka; volitelně nabídnout návrat na hlavní web.
8. Při změně jazyka zachovat obsahový identifikátor a zobrazit správnou mutaci, je-li dostupná.
9. Nesahat do hlavní produkce, dokud neprojdou skutečné browser E2E testy a uživatelský náhled.

## Testovací matice
CZ/SK/EN/HU × mobil 393×873 / desktop 1440×900:
- úvodní stránka -> článek -> Zavřít -> stejná pozice
- podstránka -> související článek -> Zpět -> Zavřít
- recept a slovník
- přímý odkaz ze sociální sítě a obnovení stránky
- klávesnice, čtečka obrazovky, focus, scroll lock
- interaktivní průvodce, externí zdroje, bezpečnostní obsah
- žádná regrese současných karet, jazyků, QR a článků

## Stav
PASS: kompletní strom repozitáře; vzorový SEO článek; obsahová dokumentace.
BLOCKED: načtení plného 1,09 MB index.html přes GitHub konektor (vrací prázdný obsah); proto zatím nelze bezpečně implementovat změnu hlavní aplikace.
NOT RUN: browser E2E a vizuální náhled.
