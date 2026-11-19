# DIA Kompas 4.0 – výměna 3D asistentky

| Položka | Výsledek |
|---|---|
| Datum a čas | 19. 11. 2026, 12:31 CET (Europe/Prague) |
| Stav | COMPLETED |
| Pull request | [#37 – výměna za Microsoft Rocketbox](https://github.com/DIAKompas/diakompas/pull/37) |
| Produkce | Nasazeno na GitHub Pages z `main` na commitu `0c806a3f170f7c65a1b6c1c81e188f32aa6cbc70`. [Veřejný web](https://diakompas.github.io/diakompas/) |

## Model

Skutečný binární soubor `assets/assistant4/assistant.glb` byl nahrazen modelem **Microsoft Rocketbox Business Female 04** z distribuce InterviewFlowAI Talking Avatar. Nový soubor má **821 360 B**, SHA-256 `0698f2d091c25d6d78135447024b41770556348bb19b88f14aecac44d1e67165`, pět vložených WebP textur a 67 mimických tvarů. Předchozí soubor měl SHA-256 `db944aafbd83dc209c4f89cf8801f05cc6d0ab4ceee7dd5de0f3c85d6a2e7f46`. Licence **MIT** zahrnuje konkrétní model, kostru, materiály, textury, vlasy a oblečení. [Původ a licence](../assets/assistant4/AVATAR-LICENSE.md).

Three.js animuje kost hlavy a mimické tvary Rocketbox pro úsměv, oči, mrkání a ústa. Ústa reagují na nativní událost skutečného zahájení řeči. Synchronizace je přibližná. Web automaticky načítá 3D, respektuje systémové omezení pohybu a při nedostupném nebo ztraceném WebGL zobrazí portrét vytvořený z téhož GLB. Hlas se zkusí spustit po odeslání otázky. Aktivní hlas lze zastavit. Vstupní skript a jeho navazující model mají adresy s verzí, aby se při aktualizaci nekombinovaly staré a nové prostředky z mezipaměti.

## Testy

Chromium 141.0.7390.0 a skutečné soubory z vývojové větve servírované lokálně. Konfigurace zahrnovala desktop 1440 × 900, mobilní dotykový profil 393 × 873 a CZ/SK/EN/HU. Nebyl použit simulovaný hlasový backend v žádném browser E2E.

| Sada | PASS | FAIL | BLOCKED |
|---|---:|---:|---:|
| Browser E2E nové asistentky včetně skutečného automatického přehrání a zastavení v osmi variantách | 58 | 0 | 0 |
| `audit/assistant4-auto-browser.cjs` včetně kostry, vložených textur, pohybu a omezení animací | 18 | 0 | 0 |
| Kontextové a bezpečnostní scénáře průvodce | 96 | 0 | 0 |
| Rozměry karet a mobilní navigace | 8 | 0 | 0 |
| Širší browser regrese článků, receptů, navigace a interních odkazů, 8 variant GitHub Actions | 3 658 | 0 | 0 |
| Samostatná browser regrese obsahu | 392 | 0 | 0 |
| Pozorování animace hlavy, mrkání, očí a úst při skutečné řeči | 4 | 0 | 0 |
| Historická kontrola rozložení z 14. 11. 2026 | 80 | 8 | 0 |
| Lokální smluvní test hlasového adaptéru se simulovaným backendem | 1 | 0 | 0 |
| Veřejný web v Chromiu s WebGL, desktop a mobilní profil | 2 | 0 | 0 |
| Veřejný 2D portrét v cloudovém Chromu bez WebGL | 1 | 0 | 0 |
| **Celkem pro tuto revizi** | **4 318** | **8** | **0** |

Nativní Web Speech API bylo ověřeno s lokálním Speech Dispatcher a eSpeak NG **pouze v testovacím prostředí**. Na zvukovém výstupu ALSA bylo zachyceno 5 123 280 bajtů PCM se špičkou 29 649. Základní Chromium bez dostupného hlasového systému neposkytlo zvuk v osmi variantách a zachovalo čitelnou textovou odpověď. Běh se skutečným zvukem použil `DIA4_SPEECH_DISPATCHER=1`. Automatická řeč v konkrétním prohlížeči nadále závisí na povolení přehrávání a dostupnosti hlasu.

Celá vrstva 4.0 přenesla při otevření přibližně 1,51 MB před HTTP kompresí na lokálním serveru. Model se v mobilním profilu zobrazil 652–770 ms po otevření v této testovací relaci. Fyzické telefony ani jejich hardwarové GPU nebyly součástí tohoto měření.

Na veřejné adrese oba profily dostaly HTTP 200 a stáhly GLB se stejným SHA-256 jako soubor v repozitáři. V obou profilech se vykreslilo 3D bez chyb JavaScriptu. Snímky z obou profilů potvrdily tvář, vlasy a civilní oblečení. Cloudový Chrome se zakázaným WebGL načetl náhradní portrét Rocketbox.

Historický test porovnává mimo jiné absolutní svislou pozici karet proti commitu `d6430a3` z doby před přidáním panelu průvodce. Stejných osm kontrol tabletu a desktopu selhalo i při samostatném běhu na předchozí produkční revizi `f524def`. Mobilní karty prošly ve všech jazycích před výměnou i po ní.

Samostatný audit externích destinací na předchozí revizi PR měl 95 PASS a 5 BLOCKED kvůli HTTP 403 v GitHub Actions. Týkalo se to odkazu NICE a čtyř odkazů PubMed, které PR neupravoval. Audit obsahu a interních odkazů prošel. [GitHub Actions](https://github.com/DIAKompas/diakompas/actions/runs/44514005369)

## Snímky z Chromia

- [Desktop 1440 × 900](assistant4-rocketbox-20261119/desktop-1440x900.webp)
- [Mobil 393 × 873](assistant4-rocketbox-20261119/mobil-393x873.webp)

## Změněné soubory a commity

- `index.html` odkazuje na verzi skriptu Rocketbox.
- `assets/assistant4/` obsahuje nový GLB a portrét, renderer, dekodér meshopt, integraci hlasu, překlady a licence.
- `audit/browser-issue-30.cjs` upravuje úklid zachytávání síťových požadavků po browser testech.
- `audit/assistant4-auto-browser.cjs`, `audit/assistant4-browser.cjs` a `audit/assistant4-speech.cjs` ověřují automatické rozhraní, nový model a hlas. Odstraněna jsou očekávání ručního zapínání asistentky.
- `docs/DIA-KOMPAS-4-ASSISTANT.md` a tento report odkazují na aktuální licenci, technický postup a snímky.
- [`3eb6bda` – výměna binárního modelu, integrace a testy](https://github.com/DIAKompas/diakompas/commit/3eb6bdad005325bdadc4525aeedb424170e0aa63).
- [`d0c7a98` – verzování modelu a archivace skutečných browser snímků](https://github.com/DIAKompas/diakompas/commit/d0c7a985cc77932a2ad33a4a74237af7757b4d75).
- [`3a41618` – stabilní úklid po browser regresi](https://github.com/DIAKompas/diakompas/commit/3a41618689d4b275651fb482d5f56e0e882890ca).
- [`0c806a3` – sloučení ověřených změn do main](https://github.com/DIAKompas/diakompas/commit/0c806a3f170f7c65a1b6c1c81e188f32aa6cbc70).

**Soupis souborů**

- `assets/assistant4/AVATAR-LICENSE.md`
- `assets/assistant4/MESHOPT-LICENSE.txt`
- `assets/assistant4/REPLACEMENT-AVATAR-SPEC.md`
- `assets/assistant4/ROCKETBOX-LICENSE.txt`
- `assets/assistant4/assistant.glb`
- `assets/assistant4/assistant.js`
- `assets/assistant4/assistant.webp`
- `assets/assistant4/copy.js`
- `assets/assistant4/engine.js`
- `assets/assistant4/learning.js`
- `assets/assistant4/meshopt-decoder.js`
- `assets/assistant4/speech.js`
- `audit/assistant4-auto-browser.cjs`
- `audit/assistant4-browser.cjs`
- `audit/assistant4-speech.cjs`
- `audit/browser-issue-30.cjs`
- `docs/DIA-KOMPAS-4-ASSISTANT.md`
- `docs/DIA-KOMPAS-4-AVATAR-FIX-20261119.md`
- `index.html`
- `reports/DIA-KOMPAS-4-ROCKETBOX-2026-11-19.md`
- `reports/assistant4-rocketbox-20261119/desktop-1440x900.webp`
- `reports/assistant4-rocketbox-20261119/mobil-393x873.webp`

Pro opakované ověření spusťte `node audit/assistant4-auto-browser.cjs` a `node audit/assistant4-browser.cjs` v prostředí s Chromium a dostupnými systémovými hlasy pro čtyři jazyky. Rozlišení a snímky z aktuálního veřejného webu lze ověřit se stejným kontrolním součtem GLB uvedeným výše.
