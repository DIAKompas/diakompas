# DIA Kompas 3.0 — schválený designový standard

**Stav:** SCHVÁLENO uživatelem  
**Datum schválení:** 17. 11. 2026 (Europe/Prague)  
**Výchozí produkční commit:** `8b9e1029bc7b6a8cdedfb8cb8dc9afc4c763a01b`  
**Web:** https://diakompas.github.io/diakompas/  
**Repozitář:** `DIAKompas/diakompas`, produkční větev `main`

## Rozhodnutí

Uživatel po ověření veřejného webu výslovně potvrdil, že oprava modální čtečky funguje a že se mu současná celková konstrukce webu líbí. Následně požádal označit tuto podobu jako **schválený designový standard DIA Kompas 3.0**.

## Závazné principy pro další změny

1. Zachovat současnou celkovou konstrukci, vzhled, navigaci a rozložení webu jako referenční základ.
2. Zachovat modální čtečku článků: otevření z karet a podčlánků včetně „Alkohol, drogy a diabetes“, možnost zavření a návratu bez ztráty kontextu.
3. Zachovat přehledné sekce „Začínám s diabetem“, „Témata“, „Nejnovější články“, recepty, slovník a interaktivního průvodce.
4. Zachovat použitelnost na mobilu, tabletu a desktopu a jazykové verze CZ/SK/EN/HU.
5. Zachovat existující obsah, odborné zdroje a platební QR kód.
6. Nové články, recepty a funkce přizpůsobovat schválené konstrukci; neprovádět plošný redesign bez nového výslovného rozhodnutí uživatele.
7. Změny nejprve připravovat v testovací větvi, ověřovat skutečnými testy relevantních uživatelských cest a až poté nasazovat do `main`. Samotný úspěšný deploy nenahrazuje kontrolu chování veřejného webu.

## Historie potvrzení

- PR #19: první produkční nasazení modální čtečky.
- PR #20: oprava otevírání z úvodních karet a programových vstupů.
- PR #21: oprava samostatného článku „Alkohol, drogy a diabetes“ v sekci Témata.
- Po PR #21 uživatel potvrdil: „Perfektni!!!! Oprava se povedla ,takhle semi to libi cela konstrukce vebu“.
- Následně výslovně požádal o označení aktuální podoby jako schváleného standardu.

**Poznámka:** Tento dokument fixuje schválené výchozí řešení, nikoli zákaz budoucích oprav, přístupnostních úprav nebo obsahového rozvoje. Při zásadní změně designu je nutné nové rozhodnutí.
