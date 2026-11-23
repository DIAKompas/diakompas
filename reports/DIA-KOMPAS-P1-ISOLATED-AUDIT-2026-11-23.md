# DIA Kompas 4.0 — P1 isolation and hologram dependency audit
Date: 2026-11-23 (Europe/Prague)
Scope: isolated branch `fix/p1-voice-regressions-no-hologram-20261123`; no changes to main, production, or protected Sites masters.

## Verified source state
- The private Sites P1 revision `5854140428986e50d95e673348c2bcec8a16d4ff` is NOT a commit in GitHub repository `DIAKompas/diakompas` (GitHub 422).
- GitHub PR #38 development branch diverges from main (47 ahead, 8 behind at time of audit).
- `assets/assistant4/accessibility.js` contains basic voice navigation for two root sections; the complete private Sites P1 recipe/navigation implementation is not available in this GitHub revision.
- GitHub `index.html` content fetch returned empty despite nonempty blob SHA; this prevents comprehensive dependency validation.

## Hologram-related code and assets
- `assets/assistant4/engine.js`: WebGL/Three renderer and exported `mountAvatar` function, including hologram rendering.
- `assets/assistant4/assistant.css`: selectors for visual/canvas/stage, some may also affect shared layouts.
- `assets/assistant4/hologram.glb` and `hologram.svg`: dedicated assets.
- `tools/make-hologram.py`: asset generation script.
- `audit/assistant4-hologram-browser.cjs`: dedicated hologram test, which would need replacement or retirement if assets are removed.
- `assets/assistant4/AVATAR-LICENSE.md`: mixed license documentation; do not delete without checking whether other avatar dependencies remain.
- `assets/assistant4/assistant.js`: no direct `mountAvatar` call or engine import in inspected version. This alone does not establish that all hologram assets are unused.

## Safety gate before deletion
1. Obtain full current Sites P1 source (especially `index.html`, `voice-recipes.js`, `voice-articles.js`) and reconcile with this GitHub branch.
2. Search all imports, dynamic imports, HTML script tags, CSS references, runtime asset fetches, and test fixtures for hologram/engine/Three dependencies.
3. Remove only exclusively hologram-related code/assets. Preserve all voice, microphone, accessibility, and recipe functionality.
4. Run syntax checks and voice navigation regression tests; test actual Android Chrome separately.
5. Deploy only to a private preview after PASS. Never update production/main or protected Sites masters.

## P1 outstanding issues
1. Step 8 submenu voice enumeration/selection.
2. Restore three spoken post-article choices (repeat, glossary, return).
3. Nutrition & recipes: include real Recipes button, numbered recipe selection, ingredients and preparation reading.
4. Unrecognized speech: request repetition, resume listening without losing context.
5. TTS interruption: stop/pause/resume/back mid-utterance without self-recognition; mark unsupported browser behavior BLOCKED, not PASS.

## Status
- Branch isolation: PASS.
- Hologram code/assets identified: PASS.
- Full dependency closure: BLOCKED (Sites source and complete index content unavailable).
- Hologram deletion: NOT STARTED — safety gate not met.
- P1 fixes: NOT STARTED — avoid overwriting newer Sites code.
- Production/master modifications: NONE.
