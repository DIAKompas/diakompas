# Content release — 13 November 2026

`articles-20261113.json` contains ten new educational articles in Czech, Slovak, English and Hungarian, including the same primary-source links in every language. There is no individual diagnosis, personal treatment target or medicine dose. Safety escalation is localized; this is an internal editorial review, not an independent medical review.

`recipes-20261113.json` contains ten new single-serving recipes, also in all four languages. Existing recipes remain intact. Grain weights are dry and pulses are cooked/drained where stated. `nutrition-estimates.json` records ingredient assumptions and the calculation inputs for the new recipes. The displayed figures are rounded estimates, not brand-specific or laboratory measurements; real labels and weights take precedence.

`recipe-photo-licenses.json` maps all 34 recipes (24 existing plus 10 new) to real Wikimedia Commons photographs, local WebP files, source pages, authors, licenses and SHA-256 hashes. Photographs illustrate ingredients or comparable servings; they are not presented as photographs of a tested preparation of these exact recipes. No AI-generated images or paid image licenses are used. Each modified image remains available under its recorded license; resizing, format conversion and display cropping are disclosed in the manifest. The website shows attribution, source and license links with each photo.

To rebuild the inline data and register it before the existing language snapshot:

```
python3 tools/content/integrate.py
python3 tools/content/build_pages.py
python3 tools/content/validate.py
```

Install the existing `tools/seo` dependencies before generating static pages. The content build preserves the root reader/routing and existing static article pages. The independently routed alcohol article is deliberately not exported from jsdom's previous article body.

For actual browser verification run `node audit/content-browser-e2e.cjs` with Playwright and Chromium installed. Tests use UI actions at 1440×900 and 393×873 in all four languages; static and jsdom checks are reported separately. GitHub Actions also retains the existing guide regression suite.

## Foot-care release — 13 November 2026

`articles-foot-care-20261113.json` adds four original educational articles in CZ/SK/EN/HU: diabetic foot problems, leg ulcers, daily care and warning signs. Primary sources are NICE NG19, CDC and NHS. The articles distinguish venous and arterial causes, require circulation assessment before compression, and give consistent urgent and emergency actions in every language. This is internal editorial verification, not independent clinical review.

The existing integrate/build commands include both article manifests. Run `python3 tools/content/validate_foot_care.py` for focused data and preservation checks. `node audit/foot-care-browser-e2e.cjs` runs actual Chromium UI checks at 1440×900 and 393×873, including article text, sources, language, overflow, guide follow-up/reset and the payment QR. GitHub Actions retains results and screenshots.
