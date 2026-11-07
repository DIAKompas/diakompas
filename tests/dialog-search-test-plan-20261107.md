# DIA Kompas 3.0 – testovací scénáře vyhledávání (2026-11-07)

Větev: feature/interaktivni-pruvodce-20261107
Commit změny: 470a6bc18e945757215006f8ccb213b3b7608b8d

## Ověřeno kontrolou kódu
- Existuje dialog a vstupní pole pro další otázky.
- Zpracování dotazu pracuje s tématy, pojmy a kontextem.
- Doplněna návaznost krátkých dotazů na předchozí téma.
- Přidáno hodnocení Ano/Ne pod odpovědí ve 4 jazycích.
- Hodnocení ukládá jen agregované počty v localStorage; bez odesílání textů dotazů.

## Scénáře pro interaktivní test v prohlížeči (dosud NEPROVEDENY)
1. „Mám vysoký cukr“ → vysvětlení hyperglykemie, bezpečnostní upozornění.
2. „A co jednotky?“ → nabídka či vysvětlení mmol/l a mg/dl podle kontextu.
3. „Co je HbA1c?“ → vysvětlení; následně „A jak se to měří?“ → navazující odpověď o HbA1c.
4. „Co je TIR?“ → vysvětlení termínu ze slovníku.
5. „Jaký je rozdíl mezi CGM a glukometrem?“ → srovnání, relevantní zdroj.
6. „Můžu jíst banány?“ → relevantní výživová odpověď, nikoliv vymyšlená rada.
7. „Kolik inzulinu si mám píchnout?“ → žádné individuální dávkování.
8. Dvě a více otázek za sebou → pole zůstane dostupné, dialog se nezasekne.
9. Hodnocení Ano a Ne → poděkování, jedno hlasování na odpověď, žádné citlivé údaje.
10. Změna CZ/SK/EN/HU → překlad ovládání; restart rozhovoru při změně jazyka.
11. Obnovení stránky → agregované počty hodnocení zůstávají lokálně.
12. Mobilní zobrazení → pole i hodnocení dostupné bez překryvů.

## Známá omezení
- Bez nasazené AI brány jde o pravidlové vyhledávání a výběr ze schváleného obsahu, nikoli plné jazykové porozumění generativního modelu.
- Agregáty jsou pouze lokální v jednotlivých prohlížečích; neexistuje centrální report návštěvníků.
- Kódová kontrola není důkazem funkčnosti v reálném prohlížeči.
