# DIA Kompas 4.0 – uživatelský test hologramu v PR #38

| Položka | Výsledek |
|---|---|
| Datum a čas | 19. 11. 2026, 13:42 CET (Europe/Prague) |
| Stav | PARTIAL. Náhled připravený k posouzení vzhledu a ovládání. |
| Soukromý náhled | [Otevřít náhled přes účet ChatGPT vlastníka](https://dia-kompas-hologram-pr38.fairydepot64.chatgpt.site/) |
| Vývoj | [PR #38](https://github.com/DIAKompas/diakompas/pull/38), `feature/assistant4-hologram-accessibility-20261119` |
| Produkce | `main` zůstala na `0c806a3f170f7c65a1b6c1c81e188f32aa6cbc70`. Žádný merge do produkce. |

Oddělený náhled servíruje stejný kód a model jako vývojová větev. Publikace testovací kopie skončila stavem `succeeded`. Cloudový Chrome ověřil bránu `Continue with ChatGPT`. Ověření obsahu v relaci přihlášeného vlastníka nezahrnuje tento report. Funkční testy použily totožné statické soubory v samostatné instanci Chromia s WebGL.

## Změny

- Transparentní 3D hologram z neutrální základní sítě hlavy MakeHuman CC0. Skutečné úsečky GLB tvoří hlavu a krk. Model neobsahuje povrchy, obličejovou texturu ani vlasy. Canvas má průhledné pozadí.
- Otočka o 360° trvá 30 sekund. Animace se pozastavuje mimo obrazovku. Při omezení pohybu je hlava čelně bez rotace. Při výpadku WebGL se načte transparentní čelní SVG ze stejné geometrie.
- První návštěva nabízí tři režimy s číselnými zkratkami a tlačítky. Volba zůstává uložená po obnově. Hlasové přivítání lze spustit jedním úkonem. Vstup z mikrofonu začne po stisknutí hlasové volby a podléhá oprávnění prohlížeče. Omezenou nebo nedostupnou hlasovou volbu aplikace oznámí a nechá přístupnou volbu tlačítky.
- Vypnutí hlasu zastaví rozběhlou odpověď. Konverzace zůstává na téže adrese, bez přesunu samotného hologramu do panelu. Odpovědi jsou v režimech 1 i 3 dostupné také jako text.
- [`0abbc3f`](https://github.com/DIAKompas/diakompas/commit/0abbc3f3992ead5749330c6f7dc571514cadd2eb) upravuje model, ovládání, styly a související verze prostředků. [`a5def51`](https://github.com/DIAKompas/diakompas/commit/a5def5142dca7bbedbe0dd228fafaa556e264555) přidává obsluhu čekání na mikrofon, ukončení klávesou Escape a opakovatelný browser test.

## Výsledky

| Kontrola | PASS | FAIL | BLOCKED |
|---|---:|---:|---:|
| Chromium, CZ/SK/EN/HU × 1440 × 900 a 393 × 873. První návštěva, hlasový výstup, klávesnice, uložení, HbA1c, navazující odpověď, omezení pohybu. | 64 | 0 | 0 |
| Skutečná otočka hologramu a snímky v několika úhlech | 1 | 0 | 0 |
| Nedostupný mikrofon, textová volba, klávesnice a náhradní 2D zobrazení | 1 | 0 | 0 |
| Rozpoznání mluveného příkazu přes mikrofon | 0 | 0 | 1 |
| Ruční průchod s odečítačem obrazovky | 0 | 0 | 1 |
| **Celkem** | **66** | **0** | **2** |

Nativní Web Speech API a výstup do zvukového zařízení testovacího systému vytvořily 4 828 782 bajtů PCM. Fyzický reproduktor nebyl součástí testu. Test mikrofonu zkusil i virtuální zvukový vstup WAV, ale nativní `getUserMedia` v Chromiu skončilo `NotSupportedError` a rozpoznávání při pokusu o příjem nedodalo žádnou událost zachycení zvuku. Nebyl použit simulovaný rozpoznávač. Kontrola Chromium accessibility tree ověřila názvy tlačítek, skupinu voleb, fokus a sémantiku živého výpisu konverzace. Reálný odečítač jako NVDA nebo TalkBack nebyl v testovacím prostředí dostupný.

GLB má 58 284 bajtů, 2 779 vrcholů a 6 016 úseček. SHA-256 `8c9daea3d4007c0193c484bf8b570070a930f105159731f0168a1241e45ad964`. V tomto lokálním běhu byl přenos modelu dokončen po 413 ms v mobilním profilu a 474 ms na desktopu. Oba rozměry měly nulový vodorovný přetok.

## Snímky a opakování

- Hologram [zepředu](assistant4-hologram-20261119/front.webp), [z profilu](assistant4-hologram-20261119/profile.webp), [zezadu](assistant4-hologram-20261119/rear.webp).
- První návštěva [desktop 1440 × 900](assistant4-hologram-20261119/desktop.webp) a [mobil 393 × 873](assistant4-hologram-20261119/mobile.webp).
- [Výstup pravidelné sady Chromium testů](assistant4-hologram-20261119/browser-results.json).
- Spuštění s Chromium a Playwright `DIA38_ROTATION=1 node audit/assistant4-hologram-browser.cjs`. Je-li testovací zvuk zpřístupněn přes Speech Dispatcher, spusťte s `DIA4_SPEECH_DISPATCHER=1` a dostupnými hlasy pro všechny čtyři jazyky.

**Doporučení.** Náhled je připravený k osobnímu posouzení vzhledu, klávesnice a dotykového ovládání. Před schválením nasazení je potřeba ověřit mluvené volby s mikrofonem a průchod se skutečným odečítačem obrazovky na zařízení vlastníka.

## Průběžná kontrola 19. 11. 2026 v 18:39 CET

- **COMPLETED** — Oddělený náhled zůstává nasazený. Bez přihlášení vrací HTTP 401 a zobrazuje vlastní bránu „Continue with ChatGPT“. Ověření obsahu pod účtem vlastníka vyžaduje jeho relaci. [Testovací náhled](https://dia-kompas-hologram-pr38.fairydepot64.chatgpt.site/)
- **COMPLETED** — Čtyři nové dotykové kontroly prošly v reálném Chromiu v mobilním profilu 393 × 873. V každém jazyce šlo klepnutím vybrat všechny tři režimy a poslední volba přetrvala po obnově. Dříve úspěšné testy se neopakovaly.
- **BLOCKED** — Hlasový vstup a ruční ověření odečítače. V testovacím prostředí chybí fyzické zvukové zařízení a odečítač. Nativní pokus o zvukový vstup v Chromiu skončil `NotSupportedError` a nebyla zaznamenána událost zachycení zvuku.
- **PARTIAL** — 70 PASS, 0 FAIL, 2 BLOCKED. Pro další krok otevřít náhled s účtem vlastníka na telefonu, spustit hlasovou volbu, povolit mikrofon a ověřit „jedna“, „dva“ a „tři“. Následně projít volby a přečtení odpovědi s TalkBack nebo jiným skutečným odečítačem. Příčina zobrazení zastaveného ukazatele Work není z dostupných záznamů zjistitelná. Produkční `main` je na `0c806a3`.
