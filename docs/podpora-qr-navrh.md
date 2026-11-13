# DIA Kompas – podpora QR (příprava před nasazením)

Stav: návrh ve větvi, veřejný web beze změny.

## Umístění
Vpravo nahoře v hlavičce stránky viditelné tlačítko „❤️ Podpořit DIA Kompas“; na mobilu zachovat viditelnost bez překrytí jazyků a navigace.

## Chování
Kliknutí otevře přístupný dialog s nadpisem „Podpořte DIA Kompas“, QR kódem, textem „Dobrovolný příspěvek pomáhá dlouhodobě provozovat nezávislého zdravotně-vzdělávacího průvodce. Výši příspěvku si zvolíte sami.“ a tlačítkem Zavřít. Zavírání také přes Escape a kliknutí mimo dialog; po zavření vrátit fokus na spouštěcí tlačítko.

## Platební QR – ověřeno z dodaného obrázku
- Formát SPD 1.0, CZK, bankovní kód 0800.
- Částka AM:0.00 – dobrovolná výše příspěvku.
- Zpráva: Dobrovolna podpora DIA Kompas.
- QR obsahuje také jméno příjemce a účet; před nasazením je třeba potvrdit souhlas se zveřejněním těchto údajů.

## Podmínky publikace
1. Přidat originální QR obrázek jako statický soubor do repozitáře (bez externí QR služby).
2. Přidat tlačítko a dialog do existujícího index.html bez zásahu do konverzační logiky.
3. Ověřit skutečný desktop 1440×900, mobil 393×873 a CZ/SK/EN/HU.
4. Teprve poté sloučit do main a nasadit.

Není potřeba Stripe, PayPal ani předplatné. Dobrovolné příspěvky se převádějí přímo na účet.
