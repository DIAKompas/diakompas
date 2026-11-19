# DIA Kompas 4.0 — replacement avatar asset acceptance

## Selected asset route
Use a genuinely realistic, fully 3D, rigged female avatar built from **MakeHuman CC0** sources, in civilian clothing. A candidate free generator is Ara 3D Gen (https://github.com/olatunde85/3d-gen; https://ara3dgen.com/), which states its MakeHuman character assets are CC0 and supports GLB exports. Independently verify the precise exported model's texture, hair and clothing licenses before publication.

Do **not** substitute a 2D photo, a CSS face, or the currently rejected `assets/assistant4/assistant.glb`. A static photo can only be a loading/fallback visual.

## Required output
- One optimized `assets/assistant4/assistant.glb` (replace existing binary, not just references), preferably under 900 KiB if quality allows, with measured mobile loading cost.
- Realistic adult face, natural hair, civilian clothes, warm neutral expression, subtle skin detail, no scrubs/medical insignia.
- Eye blink, subtle idle head movement, jaw/mouth movement during actual speech. Inspect morph target names and update `engine.js` mappings as needed. Do not assume current `BlinkLeft/BlinkRight/Smile/Speak` exist in the new asset.
- Validate face front and three-quarter angles at 393×873 and 1440×900 in Chromium and on an actual phone.
- Verify glTF loads, textures resolve, no black/white face, no missing hair, correct framing, no JS errors.
- Preserve CZ/SK/EN/HU guide, automatic 3D, automatic voice after submitted question (subject to browser speech restrictions), reduced-motion fallback.

## Integration process
1. Export a civilian female avatar to GLB using a tool with demonstrable CC0-compatible asset licenses; retain license/source metadata in `assets/assistant4/AVATAR-LICENSE.md`.
2. Replace the **binary** GLB in the GitHub feature branch. The text-only GitHub contents editor is not appropriate for a binary GLB; use a binary-capable git checkout/commit or suitable repository upload workflow.
3. Inspect meshes, morph dictionaries, scene scale and orientation; adapt renderer to the actual exported skeleton/face morphs.
4. Run `node audit/assistant4-auto-browser.cjs` and updated regression suite. Record actual browser results, screenshots and voice device limitations.
5. Only after visual and safety checks, merge to `main` and verify public GitHub Pages.

## Current state
The current binary model has **not yet been replaced**. Do not claim this task is completed merely because a generator has been identified or a roadmap committed.
