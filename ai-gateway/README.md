# DIA Kompas 3.0 — AI gateway (experimental, not deployed)

This is the first server-side component for connecting the tested rule-based chat to a real language model. It lives ONLY on branch `feature/interaktivni-pruvodce-20261107`. The public GitHub Pages site is unchanged.

## Architecture
Browser chat -> HTTPS Cloudflare Worker -> OpenAI API -> educational answer + trusted source directory.

The API key is never included in HTML, JavaScript served to visitors, or GitHub. Worker secret: `OPENAI_API_KEY`. Worker configuration: `ALLOWED_ORIGIN` (exact HTTPS origin of the eventual isolated preview), optional `OPENAI_MODEL` (default `gpt-4.1-mini`).

POST JSON to Worker:
```json
{"language":"cs","messages":[{"role":"user","content":"Co znamená vysoký cukr?"},{"role":"assistant","content":"..."},{"role":"user","content":"A co jednotky?"}]}
```
Successful response: `{answer,language,sources,notice}`.

## Before any deployment
1. Choose and provision an isolated test domain and Cloudflare Worker; configure allowed origin to its exact HTTPS origin.
2. Set OpenAI API key **only as an encrypted Worker secret**; never send it in chat or commit it.
3. Add abuse protection and rate limits at the edge, daily spending limits, monitoring without sensitive question logging, and explicit user privacy notice/retention policy.
4. Connect a separate preview UI to the gateway. Do not change `main`.
5. Conduct clinical editorial review, multilingual safety and adversarial testing, verify source URLs and content-grounding. The three returned links are a trusted DIRECTORY, **not citations verifying each AI claim**.
6. Do not ask users for medical records or identifying information. Assess privacy/GDPR requirements before public use.

## Known limitations
- Prompt-level medical rules are not sufficient clinical safety assurance.
- There is no authentication, edge rate limiting, moderation layer, verified retrieval, or user consent interface yet.
- This code has not been deployed or end-to-end tested against a live AI service.
- The language model may hallucinate or produce unsafe answers. Keep the public website on the existing implementation until reviewed.
