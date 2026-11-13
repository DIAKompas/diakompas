# DIA Kompas 3.0 – produkční obsahová aktualizace

Datum a čas: **13. 11. 2026 17:22:10 CET (Europe/Prague)**  
Stav: **COMPLETED** — obsahová aktualizace i oprava posouvání rozhovoru jsou v main a veřejně ověřené. Finální browser sady mají 488 PASS / 0 FAIL / 0 BLOCKED. Přímý automatický přístup k jednomu externímu zdroji zůstává technicky omezen.

## Dokončeno a skutečně na produkci

- 10 nových článků v CZ/SK/EN/HU, celkem 40 nových statických stránek; aktualizované archivy, index a sitemap.
- 10 nových receptů se surovinami a postupem ve čtyřech jazycích. Celkem 34 receptů (24 původních + 10 nových).
- 34 skutečných fotografií Wikimedia Commons uložených lokálně. U každé je autor, zdroj, licence a informace o úpravě; manifest obsahuje původní URL a kontrolní součet. Licence všech 34 souborů se shodují s aktuálními metadaty Commons.
- Fotografie jsou označeny jako ilustrační: mohou ukazovat surovinu nebo obdobné servírování. Nejde vždy o snímek přesného výsledku uvedeného receptu.
- Článek „Alkohol, drogy a diabetes“ zůstává v tématu diabetu a nově je přímo propojený ze všech čtyř jazykových článků o diabetu 1. a 2. typu.
- Zachován průvodce, navigace, schválený vzhled a původní platební QR. Opraveno přetékání dlouhé maďarské desktopové navigace zalomením do druhého řádku.
- Ověřeno, že všech 10 ID článků i všech 10 českých názvů receptů je nových oproti původnímu main.

## PASS / FAIL / BLOCKED

Finální výsledky; starší neúspěšné iterace nejsou přičtené k aktuálním výsledkům.

| Kontrola | PASS | FAIL | BLOCKED |
|---|---:|---:|---:|
| Statická data, jazyky, zdroje, zachování QR a průvodce | 273 | 0 | 0 |
| Syntaxe vložených skriptů | 38 | 0 | 0 |
| Interní odkazy nových statických článků | 856 | 0 | 0 |
| Dekódování fotografií | 34 | 0 | 0 |
| Shoda licencí s Wikimedia Commons API | 34 | 0 | 0 |
| Skutečný Chromium: obsah, recepty, fotografie, jazyky, rozměry a QR | 392 | 0 | 0 |
| Finální rozšířená Chromium sada průvodce, všechny jazyky a oba rozměry | 96 | 0 | 0 |
| Veřejné soubory HTTP 200 a shoda SHA-256 s nasazeným obsahem | 86 | 0 | 0 |
| Dostupnost odborných externích zdrojů | 16 | 0 | 1 |
| GitHub Pages deployment obsahové verze | 1 | 0 | 0 |
| Hlavní stránka po posledním nasazení, HTTP 200 a shoda s main | 1 | 0 | 0 |
| **Celkem kontrolních položek** | **1827** | **0** | **1** |

Čísla zahrnují jednotlivé odkazy a soubory, nikoli 1827 nezávislých uživatelských scénářů.

Skutečné obsahové browser testy běžely ve všech čtyřech jazycích na desktopu **1440×900** a mobilu **393×873**. Starší regresní skript průvodce standardně spouštěl jen 12 HU/mobile variant; nastavení `E2E_SCOPE=all` nyní ověřuje všech osm kombinací. První úplný běh měl 93 PASS / 3 FAIL: CZ/desktop C02 a C03, SK/mobile C02, vždy `Answer/reset/input geometry`. Panel rozhovoru se při navazujících otázkách posunul pod sticky navigaci. Oprava používá skutečnou výšku záhlaví a přesný posun okna; po opravě **96 variant / 144 kroků PASS, 0 FAIL, 0 BLOCKED**, plus osm kontrol běhových chyb PASS. Obsah odpovědí a klinické pojistky se neměnily.

Finální obsahová sada po opravě: **392 PASS / 0 FAIL / 0 BLOCKED**. Obě skutečné browser sady dohromady: **488 PASS / 0 FAIL / 0 BLOCKED**. Statické ani jsdom kontroly se do tohoto browser počtu nezapočítávají.
Důkazy:
- [Finální obsahový Chromium běh – SUCCESS](https://github.com/DIAKompas/diakompas/actions/runs/43460723465) — testovaný commit `43bf9ed51e3c14f87391625f464d8796736b7362`, 392/0/0; výsledky a snímky v artefaktu.
- [Předchozí omezený regresní běh průvodce – SUCCESS](https://github.com/DIAKompas/diakompas/actions/runs/43459509761).
- [Finální úplná kontrola průvodce – 96 PASS / 0 FAIL](https://github.com/DIAKompas/diakompas/actions/runs/43460723336), testovaný commit `43bf9ed51e3c14f87391625f464d8796736b7362`. Výsledky: [guide-browser-results.json](content-20261113/guide-browser-results.json).
- [Obsahové výsledky](content-20261113/content-browser-results.json) a [veřejná hlavní stránka po poslední opravě](content-20261113/production-final-root.json).
- [GitHub Pages obsahového nasazení – SUCCESS](https://github.com/DIAKompas/diakompas/actions/runs/43459526521), merge `61683fd999c89bbc242abb86a69e6b43845a0a1d`.
- [GitHub Pages následné opravy](https://github.com/DIAKompas/diakompas/actions/runs/43461547309), merge `1a3abd5657943dd7fccf5672ab62c8ba5d1ad5d1`; veřejná hlavní stránka vrací HTTP 200 a přesně odpovídá jeho bajtům.
- [Veřejné soubory a výsledky hashů](production-release-20261113-public-checks.json).
- [Statické výsledky](content-20261113/static-results.json), [odborné odkazy](content-20261113/source-link-results.json), [licence fotografií](../content/recipe-photo-licenses.json).

BLOCKED: EUR-Lex vrací HTTP 202 s JavaScriptovou ochranou proti robotům. URL nebyla označena za rozbitou ani skryta. Zbývajících 16 zdrojů odpovědělo HTTP 200. Obsah příslušného nařízení EUR-Lex byl nezávisle načten a ověřen prostřednictvím webové rešerše; přímá HTTP blokace není vydávána za přímý HTTP PASS. Lokální Chromium nešlo spustit kvůli `socket() failed: Operation not permitted`; skutečné browser ověření bylo dokončeno v GitHub Actions a lokální blokace se do finálního pokrytí nepřenáší.

Zdravotní bezpečnost: obsah je vzdělávací, neobsahuje individuální dávkování ani pokyny k vlastnímu vysazení léčby. U akutních příznaků směruje k pomoci; u bezvědomí nepodává nic ústy. Proběhla interní obsahová kontrola, nikoli nezávislá zdravotnická revize.

## Nové články

1. **Ledviny při diabetu: co říká eGFR a albumin v moči** — [CS](https://diakompas.github.io/diakompas/cs/clanky/ledviny-egfr-uacr/) · [SK](https://diakompas.github.io/diakompas/sk/clanky/ledviny-egfr-uacr/) · [EN](https://diakompas.github.io/diakompas/en/clanky/ledviny-egfr-uacr/) · [HU](https://diakompas.github.io/diakompas/hu/clanky/ledviny-egfr-uacr/)
2. **Oči a diabetes: proč nečekat na zhoršení zraku** — [CS](https://diakompas.github.io/diakompas/cs/clanky/oci-preventivni-kontrola/) · [SK](https://diakompas.github.io/diakompas/sk/clanky/oci-preventivni-kontrola/) · [EN](https://diakompas.github.io/diakompas/en/clanky/oci-preventivni-kontrola/) · [HU](https://diakompas.github.io/diakompas/hu/clanky/oci-preventivni-kontrola/)
3. **Zuby a dásně: součást péče o diabetes** — [CS](https://diakompas.github.io/diakompas/cs/clanky/zuby-dasne-diabetes/) · [SK](https://diakompas.github.io/diakompas/sk/clanky/zuby-dasne-diabetes/) · [EN](https://diakompas.github.io/diakompas/en/clanky/zuby-dasne-diabetes/) · [HU](https://diakompas.github.io/diakompas/hu/clanky/zuby-dasne-diabetes/)
4. **Spánek a glykemie: malé změny večerních návyků** — [CS](https://diakompas.github.io/diakompas/cs/clanky/spanek-diabetes/) · [SK](https://diakompas.github.io/diakompas/sk/clanky/spanek-diabetes/) · [EN](https://diakompas.github.io/diakompas/en/clanky/spanek-diabetes/) · [HU](https://diakompas.github.io/diakompas/hu/clanky/spanek-diabetes/)
5. **Když diabetes unavuje: co je diabetický distres** — [CS](https://diakompas.github.io/diakompas/cs/clanky/diabeticky-distres/) · [SK](https://diakompas.github.io/diakompas/sk/clanky/diabeticky-distres/) · [EN](https://diakompas.github.io/diakompas/en/clanky/diabeticky-distres/) · [HU](https://diakompas.github.io/diakompas/hu/clanky/diabeticky-distres/)
6. **Cestování s diabetem: co připravit před odjezdem** — [CS](https://diakompas.github.io/diakompas/cs/clanky/cestovani-s-diabetem/) · [SK](https://diakompas.github.io/diakompas/sk/clanky/cestovani-s-diabetem/) · [EN](https://diakompas.github.io/diakompas/en/clanky/cestovani-s-diabetem/) · [HU](https://diakompas.github.io/diakompas/hu/clanky/cestovani-s-diabetem/)
7. **Nachlazení a diabetes: plán pro dny nemoci** — [CS](https://diakompas.github.io/diakompas/cs/clanky/nemoc-sick-day-plan/) · [SK](https://diakompas.github.io/diakompas/sk/clanky/nemoc-sick-day-plan/) · [EN](https://diakompas.github.io/diakompas/en/clanky/nemoc-sick-day-plan/) · [HU](https://diakompas.github.io/diakompas/hu/clanky/nemoc-sick-day-plan/)
8. **Vláknina: jak ji přidat do běžného dne** — [CS](https://diakompas.github.io/diakompas/cs/clanky/vlaknina-kazdy-den/) · [SK](https://diakompas.github.io/diakompas/sk/clanky/vlaknina-kazdy-den/) · [EN](https://diakompas.github.io/diakompas/en/clanky/vlaknina-kazdy-den/) · [HU](https://diakompas.github.io/diakompas/hu/clanky/vlaknina-kazdy-den/)
9. **Jak sestavit talíř bez seznamu zákazů** — [CS](https://diakompas.github.io/diakompas/cs/clanky/talir-bez-zakazu/) · [SK](https://diakompas.github.io/diakompas/sk/clanky/talir-bez-zakazu/) · [EN](https://diakompas.github.io/diakompas/en/clanky/talir-bez-zakazu/) · [HU](https://diakompas.github.io/diakompas/hu/clanky/talir-bez-zakazu/)
10. **Diabetes a krevní tlak: proč nestačí sledovat jen cukr** — [CS](https://diakompas.github.io/diakompas/cs/clanky/tlak-srdce-diabetes/) · [SK](https://diakompas.github.io/diakompas/sk/clanky/tlak-srdce-diabetes/) · [EN](https://diakompas.github.io/diakompas/en/clanky/tlak-srdce-diabetes/) · [HU](https://diakompas.github.io/diakompas/hu/clanky/tlak-srdce-diabetes/)

## Nové recepty

1. Šakšuka s žitným chlebem
2. Gazpacho s cottage sýrem
3. Tabbouleh s cizrnou
4. Lilkový dip s celozrnnou pitou
5. Zeleninový kuskus s tofu
6. Špenátová frittata s bramborem
7. Řecký salát s celozrnným chlebem
8. Brokolicová polévka s bílými fazolemi
9. Žitný chléb se sardinkami a rajčaty
10. Chia jogurt s borůvkami

Výživové hodnoty jsou označené jako odhady; vstupy výpočtu jsou v `content/nutrition-estimates.json`.

## Větve a přesné commity

Testovací větev: `feature/content-update-20261113`. Produkční větev: `main`. PR [#7](https://github.com/DIAKompas/diakompas/pull/7) a následná oprava [#9](https://github.com/DIAKompas/diakompas/pull/9) jsou skutečně sloučené.

| SHA | Změna |
|---|---|
| `ce8157e0241b1a16153576b2cffb0fe80c2396d4` | Připravený obsah, recepty, fotografie a nástroje |
| `cf12ab4469d73be52267b2aafd573d8faa48c97e` | Oprava maďarské navigace; přenos souboru byl následně opraven |
| `c6d227ff6fd95c73248f5c74c2a70835ad3c330e` | Propojení čtyř článků o typech diabetu a klasifikace blokovaného zdroje |
| `6fda9507f907d0587b68272177866c677ed36d78` | Obnovení úplného souboru po zkráceném přenosu; kompletní stránka znovu ověřena |
| `d13b9ddf7c1fdce01f7e790f0dd7aa942487cb93` | Informace o úpravách fotografií přímo v popiscích |
| `6db599bc138780ee4d305567ce872b2d50c8e346` | Zachování popisků v generátoru, obnovené výsledky zdrojů; finální zdrojová verze |
| `61683fd999c89bbc242abb86a69e6b43845a0a1d` | Obsahový produkční merge do main |
| `b52143826fc6581c99dfc6ea82e36d0893fee20c` | Úplný rozsah CI pro všechny čtyři jazyky a oba rozměry |
| `43bf9ed51e3c14f87391625f464d8796736b7362` | Oprava zarovnání panelu rozhovoru pod sticky navigací |
| `1a3abd5657943dd7fccf5672ab62c8ba5d1ad5d1` | Ověřená oprava sloučená do main přes PR #9 |

Původní main: `6a24eb86465e86bca0a5ef02e065e97a23dd73d0`. Záloha před nasazením: `backup/before-content-release-20261113` na tomto SHA. Stabilní záloha `master-stable-20261109` na `cbdb83f0b8105a2c20a941e2ddc61870851139a7` nebyla měněna.

Původní browser běh zachytil 45 hlášení přetékání v HU desktopu; po opravě je finální obsahová sada 392 PASS / 0 FAIL. Během přenosu opravy byl zachycen zkrácený soubor index.html a obnoven před produkčním mergem. Po opravě posouvání má finální nasazený index Git blob `681b8ee4e95fb87f06b1e2f6d00690ee9a0da098`; veřejná kopie odpovídá místní kompletní verzi.

## Změněné soubory

Obsahová aktualizace mění **102 souborů** oproti původnímu main. Tento report a veřejné kontrolní výsledky jsou dva další dokumentační soubory.

```text
.github/workflows/content-e2e.yml
assets/recipes/CREDITS.md
assets/recipes/recipe-00.webp
assets/recipes/recipe-01.webp
assets/recipes/recipe-02.webp
assets/recipes/recipe-03.webp
assets/recipes/recipe-04.webp
assets/recipes/recipe-05.webp
assets/recipes/recipe-06.webp
assets/recipes/recipe-07.webp
assets/recipes/recipe-08.webp
assets/recipes/recipe-09.webp
assets/recipes/recipe-10.webp
assets/recipes/recipe-11.webp
assets/recipes/recipe-12.webp
assets/recipes/recipe-13.webp
assets/recipes/recipe-14.webp
assets/recipes/recipe-15.webp
assets/recipes/recipe-16.webp
assets/recipes/recipe-17.webp
assets/recipes/recipe-18.webp
assets/recipes/recipe-19.webp
assets/recipes/recipe-20.webp
assets/recipes/recipe-21.webp
assets/recipes/recipe-22.webp
assets/recipes/recipe-23.webp
assets/recipes/recipe-24.webp
assets/recipes/recipe-25.webp
assets/recipes/recipe-26.webp
assets/recipes/recipe-27.webp
assets/recipes/recipe-28.webp
assets/recipes/recipe-29.webp
assets/recipes/recipe-30.webp
assets/recipes/recipe-31.webp
assets/recipes/recipe-32.webp
assets/recipes/recipe-33.webp
audit/content-20261113/photo-contact-sheet.jpg
audit/content-20261113/source-link-results.json
audit/content-20261113/static-results.json
audit/content-browser-e2e.cjs
content/README.md
content/articles-20261113.json
content/nutrition-estimates.json
content/recipe-photo-licenses.json
content/recipes-20261113.json
cs/clanky/cestovani-s-diabetem/index.html
cs/clanky/diabetes-typy/index.html
cs/clanky/diabeticky-distres/index.html
cs/clanky/index.html
cs/clanky/ledviny-egfr-uacr/index.html
cs/clanky/nemoc-sick-day-plan/index.html
cs/clanky/oci-preventivni-kontrola/index.html
cs/clanky/spanek-diabetes/index.html
cs/clanky/talir-bez-zakazu/index.html
cs/clanky/tlak-srdce-diabetes/index.html
cs/clanky/vlaknina-kazdy-den/index.html
cs/clanky/zuby-dasne-diabetes/index.html
en/clanky/cestovani-s-diabetem/index.html
en/clanky/diabetes-typy/index.html
en/clanky/diabeticky-distres/index.html
en/clanky/index.html
en/clanky/ledviny-egfr-uacr/index.html
en/clanky/nemoc-sick-day-plan/index.html
en/clanky/oci-preventivni-kontrola/index.html
en/clanky/spanek-diabetes/index.html
en/clanky/talir-bez-zakazu/index.html
en/clanky/tlak-srdce-diabetes/index.html
en/clanky/vlaknina-kazdy-den/index.html
en/clanky/zuby-dasne-diabetes/index.html
hu/clanky/cestovani-s-diabetem/index.html
hu/clanky/diabetes-typy/index.html
hu/clanky/diabeticky-distres/index.html
hu/clanky/index.html
hu/clanky/ledviny-egfr-uacr/index.html
hu/clanky/nemoc-sick-day-plan/index.html
hu/clanky/oci-preventivni-kontrola/index.html
hu/clanky/spanek-diabetes/index.html
hu/clanky/talir-bez-zakazu/index.html
hu/clanky/tlak-srdce-diabetes/index.html
hu/clanky/vlaknina-kazdy-den/index.html
hu/clanky/zuby-dasne-diabetes/index.html
index.html
seo/articles.json
sitemap.xml
sk/clanky/cestovani-s-diabetem/index.html
sk/clanky/diabetes-typy/index.html
sk/clanky/diabeticky-distres/index.html
sk/clanky/index.html
sk/clanky/ledviny-egfr-uacr/index.html
sk/clanky/nemoc-sick-day-plan/index.html
sk/clanky/oci-preventivni-kontrola/index.html
sk/clanky/spanek-diabetes/index.html
sk/clanky/talir-bez-zakazu/index.html
sk/clanky/tlak-srdce-diabetes/index.html
sk/clanky/vlaknina-kazdy-den/index.html
sk/clanky/zuby-dasne-diabetes/index.html
tools/content/build_pages.py
tools/content/check_links.py
tools/content/download_photos.py
tools/content/integrate.py
tools/content/nutrition.py
tools/content/validate.py
audit/production-release-2026-11-13-nexus.md
audit/production-release-20261113-public-checks.json
```

## Nedokončeno a další krok

Žádná funkční práce z tohoto zadání nezůstala nedokončená. Tři nalezené chyby posouvání byly opraveny a všechny browser varianty prošly. Jediným technickým omezením je přímé automatické načtení jednoho externího zdroje EUR-Lex (HTTP 202); obsah zdroje byl ověřen jinou cestou. Nepřidával se WordPress ani placené služby.

Další krok: běžná redakční údržba. Při nové práci vycházet z aktuálního main. Nesouvisející PR #8 s dalšími změnami průvodce nebyl v rámci tohoto zadání sloučen ani měněn. Fotografie mohou ukazovat suroviny či obdobné servírování; přesný původ a licence jsou u každé fotografie a v manifestu.

## PŘEDÁNÍ PRO NEXUS – PROJEKT DIA KOMPAS

COMPLETED. Main obsahuje 10 nových článků × 4 jazyky, 10 nových receptů a fotografie všech 34 receptů. Obsahové E2E 392 PASS, úplná regrese průvodce 96 PASS / 144 kroků, bez FAIL/BLOCKED v browser testech. Osm pomocných kontrol běhových chyb PASS. QR a klinické odpovědi zachovány. Obsahový merge `61683fd`, následná ověřená oprava posouvání `1a3abd5`, PR #7 a #9 sloučeny. Veřejné soubory i finální hlavní stránka ověřeny. Zůstává pouze omezení přímého HTTP přístupu k EUR-Lex. Další funkční pokračování není nutné; výsledky jsou v `audit/content-20261113/` a v tomto reportu.
