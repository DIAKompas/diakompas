# DIA Kompas — static article pages

Source of truth remains the approved multilingual article data in the repository root `index.html`. Never edit generated article pages independently or invent a newer medical-content date.

After an approved article change, regenerate all static pages, archive pages, content-version manifest and sitemap:

```
npm install --prefix tools/seo
node tools/seo/regenerate.cjs
```

Requires Node.js compatible with jsdom 30.1.3 and Python 3 (standard library only). The generator loads the existing application in jsdom without external resources, selects each language and exports the same article body, sources and dates seen by visitors. It does not call an LLM, translate or publish anything. Review and test the diff before committing the generated files. Root legacy `#clanek-...` links are retained. Canonical static paths are `/diakompas/{cs,sk,en,hu}/clanky/{article-id}/`.

Canonical identity mapping and unchanged source dates/hashes are in `seo/articles.json`. A URL migration or regeneration is not a new content version for social publication. Google verification files in the root must be preserved. The project-path `robots.txt` is informational: crawler rules are read from the hostname root, which this project repository does not control.

Static pages use the existing analytics consent key. No external analytics request is made before opt-in; GPC is respected. Only allowlisted social/search-source labels are transmitted; search terms, arbitrary URL query parameters and health values are excluded. Search Console performance becomes available only after property verification and connector authorization, and may take time to populate.
