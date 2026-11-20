# DIA Kompas 4.0 – hlasový průvodce bez hologramu

20. 11. 2026, 11:00 CET (Europe/Prague)

[Soukromý testovací náhled](https://dia-kompas-hologram-pr38.fairydepot64.chatgpt.site/) vyžaduje přihlášení přes Continue with ChatGPT pod účtem vlastníka. Nasazení soukromé kopie skončilo úspěšně. Nasazený kód odpovídá commitu [`5124984`](https://github.com/DIAKompas/diakompas/commit/51249847d7269e3ba2c63d6b4eb1bf163f966876) v PR #38. Produkční main je na `0c806a3`.

Kód stránky už nevytváří ani nenačítá holografickou hlavu. Hlas lze vypnout, volba zůstává uložená a po přirozeném dokončení čtení se průvodce znovu pokusí naslouchat. Ruční zastavení hlasu samo mikrofon znovu nespustí. Při blokovaném přehrávání je dostupné kompaktní tlačítko hlasového přivítání. Volby režimu jsou přístupné klávesnicí a v přístupnostním stromu prohlížeče.

- **PASS 8**. Skutečné Chromium, 393 × 873 a 1440 × 900, CZ/SK/EN/HU. Bez hologramu a vodorovného přetoku. Klávesová volba režimů 1/2/3, uložení volby, vypnutí hlasu, přivítání po stisknutí Enter a nativní čtení odpovědí na napsané otázky HbA1c a CGM.
- **PASS 1 se simulovaným mikrofonem**. Hlasová volba, předání obou přepisů průvodci a opětovné spuštění poslechu po konci nativního čtení v Chromiu.
- **FAIL 0**.
- **BLOCKED 2**. Skutečný hlasový vstup a průchod s fyzickým mikrofonem. Průchod se skutečným odečítačem obrazovky.

Pro ruční akceptaci otevřít odkaz na telefonu, spustit přivítání, pokud ho prohlížeč automaticky nepřehraje, povolit mikrofon a říct „tři“. Pak položit nahlas „Co je HbA1c?“ a po dočtení „Co je CGM?“. Ověřit také nabídku a vypnutí hlasu s TalkBackem.

## Bod 1 – 20. 11. 2026, 11:39 CET (Europe/Prague)

- Soukromý náhled byl aktualizován ze zdrojového commitu `57130b2`. Kontrolní součty obou změněných aplikačních souborů souhlasí s nasazeným archivem.
- **PASS 4 v Chromiu.** Automatický pokus o přivítání před interakcí, přehrání po stisknutí Enter, vypnutí hlasu a zachování volby po obnově, skutečné přečtení oznámení po zkušební odpovědi. Prohlížeč první automatické přehrání odmítl s `not-allowed`.
- **PASS 2 se simulovaným rozpoznáváním řeči.** Po výběru režimu prohlížečová vrstva požádala o spuštění rozpoznávání a při simulovaném odmítnutí zůstalo viditelné stavové hlášení. Po přirozeném dočtení oznámení se poslech znovu vyžádal.
- **FAIL 0. BLOCKED 1.** Fyzický mikrofon a jeho skutečné povolení a rozpoznání na zařízení uživatele. Doporučený uživatelský test je otevřít náhled při první návštěvě, podle potřeby spustit přivítání, zvolit „tři“, schválit systémovou žádost o mikrofon a po otázce poslechnout hlášení o konci čtení.
