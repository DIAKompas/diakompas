# Produkční nasazení DIA Kompasu 4.0

**PASS** · 22. 11. 2026 v 18:12:14 CET (Europe/Prague)

- Produkční commit `ac6a4aad9d128f1db248aaf9110d2dcf1bbc1d80` na `main`. [Veřejný web](https://diakompas.github.io/diakompas/) · [Nasazení GitHub Pages](https://github.com/DIAKompas/diakompas/actions/runs/45048051471).
- Původní HEAD `91f069f796d0fba07534a5642ae9a1ded5c466ac` potvrzený běžícím webem a záložní větví `backup/voice-language-20261122-91f069f`.
- Schválená hlasová nabídka pochází ze Sites revize `5825c7e76808a15250f4eb020c2dc12783ad3291`. Připravený commit `2cc688886a91d2b9c8d31ebd3f1436014460e129` jsem dohledal v předchozí pracovní kopii `dia-kompas-production-candidate`. Jeho strom se shoduje s obsahem soukromého kandidáta `6cb08e0cc298541255951ebe8e7425e75747d16b` a prvním produkčním commitem `893a7bb8a2986142d31c68f8e2412277c7d04abb`.
- Po prvním nasazení regresní kontrola odhalila, že uložená volba přebíjela jazyk odkazů s parametrem `?lang=`. Konečný commit obnovuje prioritu platného parametru. Na běžné adrese se používá ručně uložený jazyk, při první návštěvě preference zařízení.
- Lokální ověření zahrnulo 15 jazykových scénářů a hlasovou nabídku s replay, názvoslovím a návratem ve čtyřech jazycích. Hlasový test používal simulované prohlížečové rozhraní. Ověření vydání potvrdilo shodu veřejné domovské stránky, hlasových skriptů, QR souboru a kontrolního článku s nasazeným stromem.
- Samostatné kontroly širších funkcí nahlásily stejné výsledky jako před vydáním. [Issue 30](https://github.com/DIAKompas/diakompas/actions/runs/45048051596) 50 PASS a 6 FAIL v rozložení a pozici stránky po zavření článku. [Mobile four-column](https://github.com/DIAKompas/diakompas/actions/runs/45048051541) 80 PASS a 8 FAIL v geometrii tabletů a desktopu.
- Změny zasáhly pouze čtyři soubory v `main`. MASTER v30 jsem znovu ověřil na `a1d429dae3375e5afb0d51683aadfdcce2955f56`. Obsah článků a QR soubor jsou shodné s původní produkcí.
