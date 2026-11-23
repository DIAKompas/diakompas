# DIA Kompas – schválená priorita: fotografické karty a přehledná navigace

Datum zadání: 2026-11-23
Stav: **APPROVED DESIGN DIRECTION / NOT IMPLEMENTED / NOT DEPLOYED**

## Schválený směr
Uživatel schválil poslední dvojici grafických konceptů mobilního a desktopového webu v chatu. Koncepty nejsou přesné screenshoty aktuálního webu ani hotový kód.

1. **Začínám s diabetem:** všech osm existujících kroků, každá karta s malou tematickou fotografií místo dosavadní ikony. Názvy a odkazy zachovat podle skutečných článků.
2. **Mobil 393 px:** 8 kroků ve 2 řadách po 4; pod nimi viditelná sekce **Témata**, 4 karty v řádku; čitelnost a dotyková dostupnost mají přednost před mechanickým zmenšováním.
3. **Desktop:** 8 fotografických kroků v jedné řadě; viditelné sekce Témata a Nejnovější články; přehledné rozložení.
4. **Přístupnost:** větší skutečné aktivní plochy odkazů, viditelný focus, klávesnice a mobilní ovládání; zachovat čitelnost.
5. **Zachovat:** CZ/SK/EN/HU, všechny existující články a jejich názvy, recepty, interaktivního průvodce, QR dary, navigaci a funkční odkazy. Nepřebírat z grafických konceptů neověřené názvy článků, obsah ani fiktivní funkce.
6. **Obrázky:** použít vlastní nebo prokazatelně licenčně použitelné optimalizované fotografie; vhodné alt texty, lazy loading a kontrola velikosti souborů. Generované grafické koncepty nejsou automaticky připravené produkční obrazové podklady.
7. **Ochrana:** pracovat v izolované větvi, zachovat GitHub `main` a soukromý hlasový MASTER 4.0, před nasazením reálné Chromium E2E na 320/360/393/768/1024/1280/1440/1920 px, 4 jazyky, klávesnice, touch targets, odkazy, regresní SEO a obsah.

## Další provedení
Nejdřív zmapovat skutečný DOM/CSS karet a dostupné licenční fotografie. Připravit minimální implementaci do oddělené vývojové kopie, skutečný soukromý preview a automatické testy. Produkci měnit až po prokazatelném PASS a kontrole rozdílů.

**Poznámka:** Toto je uložené schválené zadání, nikoliv důkaz implementace nebo automatická úloha běžící na pozadí.
