# DIA Kompas 3.0 – integrované ověření opravy průvodce

Dokončeno: 09. 11. 2026 17:22 CET. Větev výhradně `audit-pruvodce-20261109`. Výchozí commit `ecae00ffbe08efb512607f22721a45eefa325b18`.

## Závěr
V integrovaném DOM prostředí se po otázce vytváří kontextový rozhovor a běžné hledání jej nepřebírá. Celá finální sada: **160 PASS / 0 FAIL** (40 kontrol v každém ze čtyř jazyků). Nejde o skutečné prohlížečové E2E ani o potvrzení mobilního vykreslení. Browser E2E a vizuální ověření jsou **BLOCKED**.

Doporučení: opravená auditní větev je kandidát pro následné browser ověření; produkční nasazení zatím nedoporučuji bez desktopového a mobilního E2E. Neprovedl jsem žádné nasazení ani zápis do main nebo stabilní zálohy.

## Co je skutečně otestované
Spuštěn kompletní index.html v jsdom 31.0.0 / Node 24, včetně původní odpovědní funkce, načtení článků a slovníku, NL intentů, skutečných DOM událostí, tlačítka odeslání, klávesy Enter, tlačítka Nový rozhovor a jazykových tlačítek. NL skript je pro offline test vložen přesně na místo původního externího script tagu, bez změny jeho obsahu. Není použita kopie clinicalGuard ani přepsaná odpovědní logika.

Scroll a matchMedia mají testovací stuby: jsdom neprovádí layout. Výsledky tedy nepotvrzují reálné posouvání, viditelnost, překryvy, dotykovou klávesnici nebo rozměry 1440 × 900 / 393 × 873. Minimum 30 skutečných browser E2E scénářů není splněno; povolenou náhradou jsou tyto integrované testy.

| Jazyk | PASS | FAIL | Prohlížečové E2E |
|---|---:|---:|---|
| CZ | 40 | 0 | BLOCKED |
| SK | 40 | 0 | BLOCKED |
| EN | 40 | 0 | BLOCKED |
| HU | 40 | 0 | BLOCKED |

Počty označují kontrolní body; jedna kontrola opakovaného odesílání zahrnuje 12 odeslání a omezení historie na 16 zpráv. Nejde o 160 unikátních zdravotnických situací. Původní sada před opravou měla 124 kontrol: 111 PASS / 13 FAIL. Po opravách prošla 124/124; dalších 36 kontrol rozšířilo finální sadu na 160/160.

## Opravy a důkazy
- Vysoký cukr → jednotky → „Co mám dělat?“: dříve obecné nenalezení podkladu, nyní zachovaný kontext a obecná bezpečná odpověď s odborným zdrojem a souvisejícím článkem. Typ glukózového kontextu přežije dotaz na jednotky.
- HbA1c → měření → krátké „Jak často?“: dříve CZ odpovídala o jednotkách, SK/HU nenašly podklad. Nyní se odpovídá na četnost kontrol HbA1c; opakování také prošlo.
- Rozdíl diabetu 1. a 2. typu: dříve zachytila obecná větev pro druhý typ a pouze nabídla vysvětlit rozdíl. Nyní se zobrazí skutečné vysvětlení obou typů z článku.
- Navazující zvracení a bolest břicha po tématu vysokého cukru: bezpečnostní guard využije kontext; změna tématu a reset tento kontext zruší.

Původní inicializační oprava: https://github.com/DIAKompas/diakompas/commit/ecae00ffbe08efb512607f22721a45eefa325b18
Oprava kontextu: https://github.com/DIAKompas/diakompas/commit/f8c8006c03041b8f93e08bb1ada9f5dbfbbaffc9
Reprodukovatelný integrovaný test: https://github.com/DIAKompas/diakompas/commit/6a0dd4945af7ab1a5bf3f5f71a669c1ec93add57
Skript: audit/dialog-integration-test.cjs (vyžaduje jsdom 31.0.0 dostupný přes NODE_PATH).

## Bezpečnostní rozsah
V každém jazyce ověřeno vykreslení bezpečné větve pro nízký cukr s třesem, bezvědomí, vysoký cukr se zvracením/bolestí břicha, dotaz na individuální inzulinovou dávku a vysazení metforminu. Dále alkohol, návaznost na diabetes 2. typu a THC. Obsah odpovědí je uložen níže v důkazech. Kontroly jsou cílené obsahové podmínky, nikoli nezávislá klinická revize ani záruka pro libovolný dotaz.

Nová obecná odpověď k vysokému cukru vychází z NHS; informace o HbA1c byly ověřeny vůči NIDDK/NICE:
- https://www.nhs.uk/conditions/high-blood-sugar-hyperglycaemia/
- https://www.nhs.uk/conditions/diabetic-ketoacidosis/
- https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test
- https://www.nice.org.uk/guidance/ng28/chapter/Blood-glucose-management

## Odkazy a zachování webu
- Interní článek z odpovědi byl v DOM otevřen a obsah článku se zobrazil, ve všech 4 jazycích.
- U 32 různých externích URL z odpovědí ověřena HTTP dostupnost: **26 PASS, 0 FAIL, 6 BLOCKED (HTTP 403 na diabetesjournals.org)**. HTTP 200 není plná obsahová revize a HTTP 403 nedokazuje neplatný odkaz. Prohlížečové otevírání nových karet není ověřeno.
- HTML a CSS mimo script bloky jsou vůči výchozímu commitu byte-identické. Měněna byla pouze odpovědní logika v posledním modulu průvodce; skripty osmi úvodních kroků, receptů, článků a navigace nebyly měněny.
- Po zápisech má main i master-stable-20261109 stále HEAD cbdb83f0b8105a2c20a941e2ddc61870851139a7.

## Technická překážka a neověřené oblasti
Opětovný pokus spustit /usr/bin/chromium přes Playwright selhal před otevřením stránky: `process_singleton_posix.cc:297: socket() failed: Operation not permitted (1)`. Nebylo žádáno o obcházení omezení. Dříve dostupný vzdálený prohlížeč neumí vystaveným API změnit viewport ani otevřít místní auditní náhled; veřejná verze není náhradou za test této nezveřejněné auditní větve.

BLOCKED: browser E2E na obou požadovaných rozměrech, skutečný mobilní scroll, překrývání/mizení ovládání, dotyková klávesnice, otevírání externích karet a 6 externích URL s HTTP 403. Pro tyto oblasti nejsou vytvořeny ani deklarovány screenshoty úspěchu. Rozhraní nebylo publikováno přes další službu.

## Zbývající rozsah produktu
Průvodce používá pravidla, kontext a existující ověřené texty. Není připojen obecný generativní model; nové nebo neznámé formulace mimo pravidla mohou stále vyžadovat upřesnění. Úspěšná sada potvrzuje uvedené konkrétní scénáře a nikoli porozumění všem možným větám.
