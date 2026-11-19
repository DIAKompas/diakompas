# DIA Kompas 4.0 – výměna 3D asistentky

| Položka | Výsledek |
|---|---|
| Datum a čas | 19. 11. 2026, 12:15 CET (Europe/Prague) |
| Stav | Ověřený kandidát |
| Pull request | [#37 – výměna za Microsoft Rocketbox](https://github.com/DIAKompas/diakompas/pull/37) |
| Produkce | Čeká na uzavření kontroly a sloučení PR #37. |

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
| Širší browser regrese článků, receptů, navigace a interních odkazů | probíhá | – | – |
| Lokální smluvní test hlasového adaptéru se simulovaným backendem | 1 | 0 | 0 |
| Zobrazení na veřejném webu a ověření binárního souboru | – | – | čeká na nasazení |

Nativní Web Speech API bylo ověřeno s lokálním Speech Dispatcher a eSpeak NG **pouze v testovacím prostředí**. Na zvukovém výstupu ALSA bylo zachyceno 5 123 280 bajtů PCM se špičkou 29 649. Základní Chromium bez dostupného hlasového systému neposkytlo zvuk v osmi variantách a zachovalo čitelnou textovou odpověď. Běh se skutečným zvukem použil `DIA4_SPEECH_DISPATCHER=1`. Automatická řeč v konkrétním prohlížeči nadále závisí na povolení přehrávání a dostupnosti hlasu.

Celá vrstva 4.0 přenesla při otevření přibližně 1,51 MB před HTTP kompresí na lokálním serveru. Model se v mobilním profilu zobrazil 652–770 ms po otevření v této testovací relaci. Fyzické telefony ani jejich hardwarové GPU nebyly součástí tohoto měření.

## Snímky z Chromia

- [Desktop 1440 × 900](assistant4-rocketbox-20261119/desktop-1440x900.webp)
- [Mobil 393 × 873](assistant4-rocketbox-20261119/mobil-393x873.webp)

## Změněné soubory a commity

- `index.html` odkazuje na verzi skriptu Rocketbox.
- `assets/assistant4/` obsahuje nový GLB a portrét, renderer, dekodér meshopt, integraci hlasu, překlady a licence.
- `audit/assistant4-auto-browser.cjs`, `audit/assistant4-browser.cjs` a `audit/assistant4-speech.cjs` ověřují automatické rozhraní, nový model a hlas. Odstraněna jsou očekávání ručního zapínání asistentky.
- `docs/DIA-KOMPAS-4-ASSISTANT.md` a tento report odkazují na aktuální licenci, technický postup a snímky.
- [`3eb6bda` – výměna binárního modelu, integrace a testy](https://github.com/DIAKompas/diakompas/commit/3eb6bdad005325bdadc4525aeedb424170e0aa63). Ostatní revize jsou v [historii pull requestu](https://github.com/DIAKompas/diakompas/pull/37/commits).
