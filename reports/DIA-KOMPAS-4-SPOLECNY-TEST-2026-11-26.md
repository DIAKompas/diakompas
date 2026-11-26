# DIA Kompas 4.0 – společný test šesti bodů

**26. 11. 2026 07:24:59 CET (Europe/Prague)**  
**Celkový stav BLOCKED pro úplné převzetí. Společná soukromá verze 2 byla úspěšně nasazena.**

[Společný testovací web](https://dia-kompas-recepty-p1.fairydepot64.chatgpt.site/)

## Výsledky

| Bod | Stav | Výsledek a zbývající ověření |
| --- | --- | --- |
| 1. Mikrofon a hlasový průvodce | BLOCKED | Integroval jsem automatické uvítání a pokus o spuštění mikrofonu, ruční ovládání, uložení preference, výběr kroků, témat, článků a receptů, čtení, návrat, závěrečnou nabídku a Názvosloví. Pauza, pokračování, zastavení a návrat fungují hlasem v přestávkách mezi úseky. Okamžité hlasové přerušení uprostřed syntézy zůstává **FAIL** vzhledem k oddělení řeči a poslechu kvůli ozvěně. V dialogu jsou k dispozici ruční ovladače. Chromium v tomto prostředí ohlásilo blokovaný mikrofon. Skutečný zvuk, fyzický mikrofon a Android Chrome nebyly ověřeny. |
| 2. Grafika a přístupnost | PASS v testovaném rozsahu | Přenesl jsem do v30 dříve schválené fotografické rozložení a znovu použil existující WebP fotografie. Osm karet tvoří dvě řady po čtyřech na mobilu a jednu řadu na desktopu. Témata mají na mobilu čtyři sloupce. Hologram a čtyři uvítací MP3 mají shodné bajty s v30. Nejnovější články zobrazují čtyři nové položky. |
| 3. Rybí recepty a moderní léčba | BLOCKED pro redakční převzetí | Nasazeno 10 rybích receptů a osm článků pod původně schválenými názvy ve všech čtyřech jazycích. Původní rozpracované znění receptů jsem v dostupných podkladech nenašel, proto jsem připravil nové ingredience a postupy se stejnými názvy pro dvě porce. Výživové údaje na porci jsou odhady z obvyklých hodnot surovin. U rybích receptů chybí dříve plánované fotografie a nezávislý audit výživových údajů. Léčebné články mají zdroje a jsou v soukromém náhledu pro odbornou a jazykovou revizi. |
| 4. Inzulín a inzulínová léčba | BLOCKED pro redakční převzetí | Patnáct dohledaných titulů, 60 jazykových verzí a osmá karta vedle moderní léčby. Doplnil jsem tři původní schémata, včetně „Co inzulín nahrazuje?“, s textovým popisem a čtením popisku. Přidána vybraná hesla do Názvosloví. Původních pět schválených položek zahrnovalo texty, diagramy a licencované fotografie, kartu, hlasovou navigaci a propagaci po publikaci. Vedle schémat chybí schválené klinické fotografie a nezávislá odborná revize. Propagace je vázaná na pozdější publikaci. Obsah neuvádí individuální dávkování. |
| 5. Facebook, Instagram, YouTube | BLOCKED | V propojeném účtu jsem ověřil totožnost tří profilů. Dostupné akce správy neposkytují úpravy profilu, banneru či připnutí. Facebook v prohlížeči nezpřístupnil ovládání stránky, Instagram vyžaduje přihlášení a YouTube Studio opětovné ověření majitele. Úpravy nebyly provedeny. Stav připnutí a nové odkazy zůstaly neověřené. |
| 6. SEO a indexace | BLOCKED pro indexaci | Produkční HTML má shodné bajty s commitem `c29ccde00c2540e775476ac20c8245117c307e3f` z PR #44. Schválené title a description, Open Graph title, description, URL a typ i canonical prošly kontrolou. Produkční sitemap vrací HTTP 200 a obsahuje 105 unikátních adres. Repozitářové `/diakompas/robots.txt` vrací 200, hostitelské `/robots.txt` vrací 404. Google Search Console a Bing Webmaster Tools vyžadují přihlášení. Žádost o reindexaci nebyla odeslána. Ve zkontrolovaných veřejných výsledcích pro cílové dotazy nebyl web nalezen. Stav indexace zůstává neověřený. |

## Zálohy a revize

- MASTER v30 `a1d429dae3375e5afb0d51683aadfdcce2955f56` zůstává samostatně nasazený. Ověřil jsem ZIP `DIA-Kompas-MASTER-v30-pred-P1-20261123.zip` a vnitřní SHA-256 Git bundle, tar archivu a nastavení. SHA-256 ZIP je `57cb138b54f0d55f2a4d5314afb1a07c266a13fc155a3d18ee040b648a6b13b6`. Obnovený Git bundle ukazuje na přesný commit v30.
- Obnovitelná verze 1 soukromého P1 odpovídá revizi `5854140428986e50d95e673348c2bcec8a16d4ff`. Závěrečná hlasová nabídka pochází z `5825c7e76808a15250f4eb020c2dc12783ad3291`.
- Soukromé změny mají commity `72a602dbae15615a8723e40e0a85b14eea0e3336` (integrace hlasu, vzhledu a SEO) a `f5475c1b8a7b3e990d71536cbaae59fc9ea06b7a` (články, recepty a schémata).
- Soukromá verze 2 eviduje přesný druhý commit a úspěšné nasazení `appgdep_6b07d02cfcf08191a5f14732fa0dd88f`. SHA-256 odeslaného taru je `cea9c96d0fb5636b551ff39ea5014c58177e5a79437a2cd0fcb80643c8587f4d`. Přímé HTTP požadavky bez přihlášení zobrazily přihlašovací bránu. Prohlížečové testy obsahu proběhly na téže lokální revizi, protože soukromý živý obsah vyžaduje identitu vlastníka.
- GitHub `main` a produkce jsou na `c29ccde00c2540e775476ac20c8245117c307e3f`. Revizi v32 jsem nepoužil. Report je v neprodukční větvi `reports/diakompas4-sest-bodu-20261126`.

## Provedené testy

- Chromium s osmi šířkami rámce od 320 do 1920 px. Ověřeny počty sloupců, obrázky, témata, čtyři jazykové varianty rozhraní, čtyři karty nejnovějších článků a absence vodorovného přetékání.
- Skutečný DOM v Chromu. Otevření a zavření čtečky, přepínání a uložení hlasové preference, 15 článků v inzulínové kartě, 44 receptů celkem, výživové hodnoty a rozbalení postupu. Schéma v čtečce má obrázek s alternativním textem a úplný popis.
- Simulované Web Speech události na skutečném DOM. Prošel pokus o uvítání, hlasový přechod mezi tématy, výběr článku číslem, pauza a pokračování, přečtení schématu, závěrečná nabídka a dotaz na inzulín v Názvosloví. Mikrofon a syntéza se při simulaci nepřekrývaly.
- Kontrola syntaxe JavaScriptu, validní XML SVG a sitemap, `git diff --check` a kontrola souborů zabalené verze. Potvrzeno 23 unikátních nových článků, 10 nových receptů a 132 jazykových verzí.

## Zbývající přejímka

Na reálném telefonu ověřit zvuk a mikrofon v samostatné kartě Chromu, včetně hlasových povelů mezi částmi a chování při odepření mikrofonu. Doplnit licencované fotografie a nezávislou redakční revizi. Ke změnám sociálních profilů a žádostem o indexaci je potřeba funkční přístup s právy správce.
