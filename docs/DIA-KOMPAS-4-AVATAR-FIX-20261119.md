# DIA Kompas 4.0 – correction release gate (2026-11-19)

## User feedback
The currently deployed 3D face is visually unacceptable (stiff, uncanny). The intended experience is a friendly, convincing human-like 3D guide with automatically active motion, and speech after submitting a question, without visible 3D/motion switches.

## Implemented in this branch
- Automatic initialization of WebGL avatar with fallback for unsupported devices.
- Removed 3D and motion toggle controls and their obsolete handlers.
- Speech starts automatically on a new answer where browser speech synthesis is supported. User may stop playback.
- Language voice selection shown only when multiple matching voices exist.
- Speech supports browser-provided voices beyond localService and can attempt the browser's language fallback.
- A separate browser regression script: `node audit/assistant4-auto-browser.cjs`.

## Release blockers / honest limits
1. **New visual model not supplied:** The existing `assistant.glb` has NOT been replaced. Do not merge this branch as a visual redesign; it would keep the same rejected face.
2. **Browser regression not executed in this session:** No new PASS counts can be claimed. Existing `audit/assistant4-browser.cjs` tests the old manual toggles and must be updated or superseded before release.
3. **Speech may be blocked by browser autoplay restrictions or missing language voices:** no unconditional audio guarantee. No microphone or external speech API is added.
4. **Accessibility:** respect OS reduced-motion preference; maintain readable guide without WebGL or audio.

## Next execution sequence
- Source or create a legally reusable, human-quality rigged GLB avatar with expression morph targets `BlinkLeft`, `BlinkRight`, `Smile`, `Speak` or implement a documented mapping; optimize for mobile and document licensing.
- Verify appearance against screenshot at desktop and 393×873 mobile, including facial expression and lighting.
- Run new Playwright regression on all four languages and actual WebGL; test voice with installed voices on a physical device; verify no JS exceptions and safety dialogues.
- Merge only after visual acceptance and checks; report PASS/FAIL/BLOCKED separately.

Production `main` remains unchanged by this branch.
