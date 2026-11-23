# DIA Kompas P2/P3 – real Chromium development matrix, 2026-11-23

Run: https://github.com/DIAKompas/diakompas/actions/runs/45171678952
Result: **PASS** (workflow succeeded).

## What was actually executed
- Applied `tests/patches/p3-header-overflow.css` to a disposable checkout copy of the real `index.html` with `tests/scripts/apply_p3_header_isolated.py --isolated-ci`.
- Served the modified HTML locally and opened it in real Playwright Chromium.
- Eight viewport widths: 320, 360, 393, 768, 1024, 1280, 1440, 1920.
- All eight showed `document.documentElement.scrollWidth == innerWidth` (no horizontal overflow).
- Exercised first eight keyboard Tab presses per viewport; no fatal keyboard-focus test failure.
- Collected visible controls, labels, bounding boxes and under-44px target counts. JSON result artifact: `p2-p3-browser-matrix`.

## Accessibility findings requiring further work
- At 393px: 10 visible controls with width or height under 44px; at 768px: 29.
- Examples of under-24px heights: social links Facebook, Instagram and YouTube (~19px); article action links (~15px at larger viewports); question-field associated link (~21px).
- A small CSS bounding box alone is not definitive WCAG nonconformance: evaluate spacing, overlapping target exceptions, semantic element, actual tappable region, and keyboard activation.
- Test did not use real TalkBack/NVDA, did not verify Enter/Space activation or full keyboard sequence, and did not visually review all translations.
- The existing production-only smoke test may still fail at 1440px because production intentionally has not received the CSS correction.

## Next
1. Add detailed target geometry and spacing checks and validate a targeted touch-area patch in isolated HTML.
2. Expand keyboard activation/focus tests and article navigation across CS/SK/EN/HU.
3. Only then consider review of minimal production diff; no deployment authorized by this technical PASS alone.

Production main and separate private voice MASTER remain unchanged.
