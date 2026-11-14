# DIA Kompas 3.0 — jednorázová historická inicializace
Datum evidence: 2026-11-14 (Europe/Prague). Stav: PARTIAL — doložená historie GitHubu, ne úplný export Work ani všech chatů.

## Hierarchie důkazů
1. Aktuální obsah produkční větve `main`, historie commitů a mergovaných PR jsou primární technické důkazy.
2. Reporty a pracovní deníky uložené v repozitáři jsou důkazy pouze v rozsahu skutečně zaznamenaných testů.
3. Historické uživatelské požadavky a dostupné souhrny chatů vysvětlují motivaci a schválení, **neprokazují** automaticky nasazení.
4. Chybějící původní Work report či screenshot nevyplňovat domněnkou. Rozlišovat „požadováno“, „commitováno“, „sloučeno do main“ a „ověřeno v reálném prohlížeči“.

## Ověřený výchozí stav
- Repozitář: https://github.com/DIAKompas/diakompas
- Produkční web: https://diakompas.github.io/diakompas/
- Produkční větev: `main`.
- Výchozí HEAD před tímto historickým zápisem: [e1b643d](https://github.com/DIAKompas/diakompas/commit/e1b643d18faf82f2b77121747e4c74b38c49a221) — vytvoření pravidel archivu `reports/README.md`.
- V `reports/` byl při inicializaci pouze `README.md`; starší Work reporty zde dosud nebyly uloženy.
- GitHub ukazuje merge [PR #15](https://github.com/DIAKompas/diakompas/pull/15) ([c1f929e](https://github.com/DIAKompas/diakompas/commit/c1f929e98aa4df02eee8cc280f87d03c81241f9d)) dne 14. 11. 2026: čtyřsloupcové mobilní rozložení a úpravy mobilních odkazů. Merge do main je doložen; živý vizuální test zde nově proveden nebyl.

## Chronologie doložená historií commitů
### 7.–8. listopadu
- [4ae61dc](https://github.com/DIAKompas/diakompas/commit/4ae61dca0): vícejazyčné lokální Q&A, kontextové navazování a zdroje.
- [40bb6dd](https://github.com/DIAKompas/diakompas/commit/40bb6dd00): nasazení R14 průvodce dle zprávy commitu.
- [fde4371](https://github.com/DIAKompas/diakompas/commit/fde4371ab): nasazení rozpoznávání přirozeného jazyka.
- [5233f23](https://github.com/DIAKompas/diakompas/commit/5233f236f): hotfix interaktivního průvodce.

### 9.–10. listopadu
- [50f918b](https://github.com/DIAKompas/diakompas/commit/50f918bbc): vzdělávací článek o alkoholu, drogách a diabetu.
- [98dce7a](https://github.com/DIAKompas/diakompas/commit/98dce7a47): praktické rady začleněny jako krok 8.
- [ecae00f](https://github.com/DIAKompas/diakompas/commit/ecae00ffb): oprava chyby `placeholder is not defined`.
- [d488a87](https://github.com/DIAKompas/diakompas/commit/d488a876c): oprava závodu při scrollování.
- [7b16d2b](https://github.com/DIAKompas/diakompas/commit/7b16d2b06): 64 reálných browser kontrol podle popisu commitu.
- [10bdedc](https://github.com/DIAKompas/diakompas/commit/10bdedc9e): ověřování 96 variant prohlížeče.
- [da52b8a](https://github.com/DIAKompas/diakompas/commit/da52b8abf): dokumentace uzavření 96 variant jako PASS dle popisu commitu; přesná metodika vyžaduje přečtení reportu.
- [034323c](https://github.com/DIAKompas/diakompas/commit/034323ccc): nasazení průvodce 3.0 dle zprávy commitu.

### 13. listopadu
- [1c25392](https://github.com/DIAKompas/diakompas/commit/1c25392ff): platební QR a rozměry dialogu.
- [34197f3](https://github.com/DIAKompas/diakompas/commit/34197f3de): zpřístupnění článku o alkoholu/drogách v tématu diabetes ve čtyřech jazycích.
- [ce8157e](https://github.com/DIAKompas/diakompas/commit/ce8157e02): 10 vícejazyčných článků, 10 receptů a fotografie podle zprávy commitu.
- [61683fd](https://github.com/DIAKompas/diakompas/commit/61683fd99): nasazení obsahové aktualizace podle zprávy commitu.
- [9257900](https://github.com/DIAKompas/diakompas/commit/9257900d8): závěrečný report obsahového vydání (historický dokument mimo novou složku reports).
- [878b244](https://github.com/DIAKompas/diakompas/commit/878b244bf): finalizace reportu vydání.

### 14. listopadu
- [b572bf3](https://github.com/DIAKompas/diakompas/commit/b572bf3f3): kompaktní mobilní třísloupcové karty.
- [d013e9f](https://github.com/DIAKompas/diakompas/commit/d013e9fe7): čtyřsloupcové mobilní karty a vícejazyčné browser kontroly podle zprávy commitu.
- [c1f929e](https://github.com/DIAKompas/diakompas/commit/c1f929e98aa4df02eee8cc280f87d03c81241f9d): merge PR #15 do main.
- [e1b643d](https://github.com/DIAKompas/diakompas/commit/e1b643d18faf82f2b77121747e4c74b38c49a221): pravidla centrální archivace.

## Historické požadavky a rozhodnutí (konverzační kontext, nikoliv potvrzení implementace)
- DIA Kompas: zdravotně-vzdělávací, srozumitelný konverzační průvodce, nikoliv běžný vyhledávač.
- CZ/SK/EN/HU; odkazy na odborné zdroje; bez individuální diagnózy a dávkování; bezpečnostní scénáře.
- Rozložení sekce „Začínám s diabetem“ včetně kroku 8, sekce „Témata“, mobilní 393×873.
- Zachování receptů, článků, průvodce a platebního QR při UI změnách.
- Nezavádět nové placené služby bez krytí; cílem ekonomická udržitelnost.
- Připnutý chat „Návrat k hlavnímu chatu“ je řídicí rozcestník, nikoli automaticky synchronizovaný archiv.

## Neověřeno / zbývá doplnit
- Kompletní historické Work relace a jejich původní textové reporty nejsou automaticky dostupné z GitHubu.
- Průběžné interní postupy Worku lze rekonstruovat pouze z uložených souborů, commitů a případných skutečných reportů, ne z odhadu.
- Skutečné produkční browser E2E výsledky je nutné posuzovat podle uložených důkazů; tato inicializace žádné E2E nespustila.
- U každého nového úkolu vytvářet `reports/DIAK-YYYYMMDD-NNN-worklog.md` a `reports/DIAK-YYYYMMDD-NNN.md`.

## Postup při návratu
1. Načti `reports/README.md` a tento historický index.
2. Vypiš nejnovější soubory v `reports/` a poslední commity `main`.
3. Ověř stav konkrétních souborů/PR a případného nasazení.
4. Pokračuj od posledního doloženého stavu, nikoliv pouze podle paměti.
