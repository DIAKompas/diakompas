# DIA Kompas 4.0 — schválená architektura odděleného hlasového prostředí

Datum: 2026-11-20. Stav: APPROVED — implementace a skutečné browser testy dosud neprovedeny.

Repo: DIAKompas/diakompas
Vývojová větev: feature/assistant4-hologram-accessibility-20261119
PR: https://github.com/DIAKompas/diakompas/pull/38
Soukromý preview: https://dia-kompas-hologram-pr38.fairydepot64.chatgpt.site/
Produkční main a veřejný web: NEMĚNIT.

## Schválené chování

1. Do hlavní navigace přidat výrazně přístupnou položku „Pro nevidomé“ (CZ/SK/EN/HU); zachovat stávající navigaci a obsah.
2. Běžná úvodní stránka zůstává původní a nesmí automaticky přehrávat hlas ani aktivovat mikrofon; odstranit z ní hlasové a mikrofonní přepínače, ale zachovat textového průvodce.
3. Existující hlasové rozhraní přenést do samostatného režimu „Pro nevidomé“, sdílejícího tytéž články, překlady a data. Nevytvářet duplicitní obsah.
4. První explicitní vstup do režimu uložit do localStorage. Při další návštěvě ve stejném prohlížeči automaticky obnovit hlasový režim, i při vstupu přes běžnou URL. Zajistit přístupné „Přejít na běžný web“, které přepne a uloží předvolbu. Bez registrace. Respektovat smazaná data/soukromý režim.
5. Po vstupu do hlasového režimu pokus o uvítací zvuk; při autoplay blokaci nabídnout klávesnicí i odečítačem ovladatelné tlačítko přehrání. Mikrofon pouze s oprávněním prohlížeče; žádné obcházení souhlasu. Při opuštění hlasového režimu vypnout mikrofon i přehrávání.
6. V hlasovém režimu zachovat nezávislé přepínače hlasu a mikrofonu a aktuálně funkční přivítání.
7. Odpovědi a celé články zobrazovat v přístupném modálním čtecím okně, ne jako překryv hero banneru. Modal: focus trap, aria-labelledby, Escape, zavírací tlačítko, vrácení fokusu, čitelnost mobil 393 px, spolupráce se screen readery.
8. Po ukončení čtení a oznámení návratu se modal skutečně zavře, obnoví se přesná původní nabídka a focus; naslouchání obnovit jen pokud uživatel mikrofon nevypnul.
9. Odstranit nežádoucí blok „Prozkoumejte názorné modely“ z běžné úvodní stránky (Senzor CGM, HbA1c, Talíř a výživa), bez odstranění skutečných článků.
10. Zachovat CZ/SK/EN/HU, všechny články, recepty, ostatní navigaci, přístupnost a responzivní vzhled.

## Povinné ověření před publikací

- Čistý prohlížeč: běžná stránka bez automatického zvuku/mikrofonu; volba „Pro nevidomé“ přepne režim.
- Reload, zavření a znovuotevření: uložený režim se obnoví; přepnutí zpět na běžný web se pamatuje.
- Bez oprávnění mikrofonu a se zákazem autoplay: funkční fallback a jasná hláška.
- Hlasové „Co je CGM?“ a čtení článku o rozdílech diabetu 1. a 2. typu: modal a správný návrat do původní nabídky.
- Desktop 1440×900, mobil 393×873; všechny čtyři jazyky; klávesnice a screen reader semantics.
- Browser E2E označit PASS pouze při skutečném běhu; ostatní BLOCKED. Doložit commity, výsledek a přesnou URL aktuálně nasazeného preview.

Nenasazovat do main. Neprohlašovat za dokončené před skutečným nasazením a ověřením soukromého preview.
