# DIA Kompas 4.0 — 3D assistant implementation plan

Status: design and implementation planning; NOT deployed. Branch: feature/dia-kompas-4-3d-assistant.

## Guardrails
- Preserve public main, current articles, recipes, conversational safety responses, QR code and CZ/SK/EN/HU.
- The virtual assistant is an educational guide, not a clinician. Use civilian clothing and no misleading medical credentials.
- Default text-first, muted; microphone and speech only on explicit user action.
- Respect prefers-reduced-motion, keyboard focus, screen readers, high contrast, low bandwidth and mobile viewport 393px.
- No paid APIs, subscriptions or external collection of microphone/audio without separate explicit consent.
- Do not claim an image mockup is a working 3D model or claim simulated tests are browser E2E.

## Delivery milestones
1. Inventory current homepage, conversational search, cards, modal behavior, languages, assets and performance; document baseline.
2. Implement progressively enhanced CSS 3D card hover/focus and accessible reader modal with safe fallback. Keep content stable.
3. Prototype realistic 3D assistant head/shoulders in civilian appearance with licensed glTF/GLB asset and local rendering; idle blink and subtle gaze. No fake lip-sync.
4. Connect assistant UI states (idle/listening/processing/responding) to existing conversational engine without changing medical safety logic.
5. Optional user-activated text-to-speech with explicit mute, per-language voices where available, and lip synchronization only after timing verification.
6. Educational interactive 3D models for HbA1c/CGM/nutrition with clear sources, captions and 2D fallbacks.

## Acceptance checks
- Desktop 1440x900, mobile 393x873; CZ/SK/EN/HU; keyboard and touch; reduced motion and 3D-disabled fallback.
- Existing follow-up dialogues, repeated questions, reset, internal links, articles and recipes continue to work.
- Safety scenarios: hypoglycemia, unconscious person, vomiting/abdominal pain, insulin dosage; no individualized dosing.
- Browser E2E and measured performance before merge. No production deployment before checks pass.
- Each report records date/time Europe/Prague, COMPLETED/PARTIAL/BLOCKED/FAILED, PASS/FAIL/BLOCKED, commits and next action.

## Release policy
Implement and test on this branch first. Merge to main only after verified regression, safety, accessibility and performance checks.
