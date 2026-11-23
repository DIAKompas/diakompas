# DIA Kompas P1–P4: první skutečný statický regresní běh (2026-11-23)

## GitHub Actions PASS
Run: https://github.com/DIAKompas/diakompas/actions/runs/45169029124

- 100 manifestových článkových stránek: 25 CS, 25 SK, 25 EN, 25 HU.
- 25 unikátních článků, všechny čtyři jazyky u každého.
- 0 errors, 0 warnings ve statické kontrole.
- Ověřeno: jazyk `html lang`, právě jeden H1, viewport, základní přítomnost navigačních/fokusovatelných prvků, alternativní texty obrázků, canonical URL, čtyři hreflang odkazy + x-default, JSON-LD a pokrytí manifestu v sitemapě.
- Test: `tests/scripts/check_p1_p4_static.py`; workflow `.github/workflows/p1-p4-static-audit.yml`.

## Výklad výsledků
PASS je platný pouze pro výše uvedená statická pravidla. Neověřuje správnost překladu, screen-reader odezvu, funkčnost mikrofonu, kontrast, reálné rozložení 393×873, klávesnici, HTTP stav externích odkazů ani odbornou medicínskou revizi.

## Další kroky bez potřeby souhlasu
P1: obsahový audit všech jazykových variant, včetně klinických rizik.
P2: reálná přístupnost a oddělený soukromý hlasový prototyp.
P3: browser E2E mobil/tablet/desktop.
P4: živé HTTP odkazy a SEO integrita.

Produkční `main` a soukromý MASTER beze změny.
