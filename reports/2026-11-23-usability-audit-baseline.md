# DIA Kompas – vstupní audit srozumitelnosti a použitelnosti
Datum: 2026-11-23
Rozsah: první technická inventura produkčního repozitáře; nejde o dokončený browser/klinický audit.

## Ověřené skutečnosti
- GitHub main: 404 položek v rekurzivním stromu při kontrole.
- seo/articles.json: 100 záznamů, přesně 25 pro cs, sk, en, hu.
- Existují: content/articles-20261113.json, content/articles-foot-care-20261113.json, content/recipes-20261113.json, content/recipe-photo-licenses.json, tools/seo/{README.md,export.cjs,build.py,regenerate.cjs}.
- Dokumentace content/README.md říká, že obsah prošel interní redakční, nikoli nezávislou klinickou revizí.
- tools/seo/README.md uvádí jako zdroj pravdy root index.html a požaduje regeneraci HTML po změnách schváleného obsahu.
- Samostatné bezpečnostní testovací kopie jsou zatím v tests/fixtures/plain-language-safety-20261123.json, ne ve zdroji pravdy index.html.

## Zjištění a priority
P0 – Nepublikovat bezpečnostní změny pouze z testovacích JSON kopií: neprokazují změnu skutečně zobrazovaných článků. Nutné ověřit zdroj pravdy, proces generování, integritu a browser test.
P1 – Pro všech 100 jazykových stránek vytvořit inventuru nadpisů, délky odstavců, odborných termínů a jednoduchých akčních instrukcí. Zatím NEOTESTOVÁNO.
P1 – Při jazykové revizi ověřit srozumitelnost pro laiky, zachování významu a konzistenci naléhavosti ve 4 jazycích. Rodilý mluvčí/odborná revize PENDING.
P1 – Zkontrolovat ovládání mobilu a přístupnost v reálném prohlížeči, včetně čteček obrazovky a hlasového průvodce. PENDING.
P2 – Zkontrolovat skutečnou HTTP dostupnost odkazů a hreflang/canonical/sitemap. PENDING.

## Zásady
- Žádný redesign, žádná ztráta článků, receptů, jazyků, QR, hlasových funkcí.
- Každá změna pouze izolovaně, s měřitelnými regresními kontrolami.
- Bez potvrzeného PASS žádný merge do main.
- „DIA Kompas – diabetes lidsky a srozumitelně.“

## Stav
PASS: evidence 100 článkových jazykových stránek a inventura hlavních obsahových nástrojů.
BLOCKED/PENDING: úplná obsahová analýza root index.html (při pokusu o načtení konektor vrátil prázdný obsah), skutečné browser E2E, klinické posouzení.
Produkce: nezměněna.
