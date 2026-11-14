# DIA Kompas 3.0 — centrální archiv práce

Schváleno vlastníkem projektu dne 2026-11-14. Repozitář `DIAKompas/diakompas` je centrálním trvalým archivem výstupů ChatGPT Work a projektových úkolů. Připnutý chat „Návrat k hlavnímu chatu“ je řídicí rozcestník; automatický zápis do jiného chatu není zaručen.

## Povinný postup pro každý nový úkol
1. Přiřaď jednoznačné ID `DIAK-YYYYMMDD-NNN` a název; zaznamenej zadání, cíle a výchozí stav.
2. Průběžně dokumentuj skutečně provedené kroky, rozhodnutí, změny souborů, větve, commity, důkazy a překážky. Nevydávej plán za provedenou práci.
3. Ulož pracovní deník do `reports/DIAK-YYYYMMDD-NNN-worklog.md`.
4. Ulož závěrečný nebo průběžný report do `reports/DIAK-YYYYMMDD-NNN.md`.
5. Report musí obsahovat datum/čas Europe/Prague, stav COMPLETED/PARTIAL/BLOCKED/FAILED, PASS/FAIL/BLOCKED testy (skutečné browser E2E odděleně od simulací), dokončené i nedokončené kroky, změny souborů, větve, commity, skutečný stav produkčního nasazení, odkazy na důkazy a přesný další krok.
6. V poslední odpovědi Work uveď přímé odkazy na oba soubory a commit archivace; připrav krátký přehled k vložení do připnutého chatu „Návrat k hlavnímu chatu“.
7. Při blokaci nebo vyčerpání limitu ulož průběžný stav, pokud to oprávnění dovolí. Pokud zápis selže, vypiš obsah reportu přímo v odpovědi a výslovně označ archivaci jako BLOCKED.
8. Před dalším úkolem přečti poslední report a navazuj na ověřený stav. Starší úkoly doplňuj jen z doložitelných podkladů; neodhaduj chybějící průběh.
9. Do veřejného archivu nevkládej hesla, tokeny, osobní či zdravotní údaje ani jiná tajemství.

## Pravidla bezpečnosti změn
- Dokumentace sama o sobě neopravňuje k nasazení změn webu.
- Práce na webu má vlastní testovací a schvalovací postup dle zadání.
- Samotný archiv není automatická synchronizace historie Work ani jiné konverzace ChatGPT.

## Navigace
- [Seznam reportů](./)
- [Repozitář](https://github.com/DIAKompas/diakompas)
