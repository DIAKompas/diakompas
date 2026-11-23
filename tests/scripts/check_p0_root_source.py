#!/usr/bin/env python3
"""Read-only P0 source-of-truth gate: compares 16 safety fixtures with the actual root app."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
html = (root / "index.html").read_text(encoding="utf-8")
fixtures = json.loads((root / "tests/fixtures/plain-language-safety-20261123.json").read_text(encoding="utf-8"))
langs = ("cs", "sk", "en", "hu")
decoder = json.JSONDecoder()
results = []
for fixture in fixtures:
    needle = '"id":"' + fixture["id"] + '"'
    start = html.find(needle)
    assert start >= 0, f"Missing root article {fixture['id']}"
    # Embedded content uses JSON objects; decode the full object rather than substring matching.
    opening = html.rfind("{", 0, start)
    article, _ = decoder.raw_decode(html[opening:])
    assert article["id"] == fixture["id"]
    assert article["sources"] == fixture["sources"], f"Source links drift: {fixture['id']}"
    for lang in langs:
        original = article["locales"][lang]
        revised = fixture["locales"][lang]
        assert len(original["sections"]) == len(revised["sections"]), (fixture["id"], lang)
        assert original["title"] == revised["title"], (fixture["id"], lang, "title")
        assert original["lead"] == revised["lead"], (fixture["id"], lang, "lead")
        for (old_heading, old_text), (new_heading, new_text) in zip(original["sections"], revised["sections"]):
            assert old_heading == new_heading, (fixture["id"], lang, "heading")
            assert new_text.startswith(old_text), (fixture["id"], lang, "original text changed")
        results.append((fixture["id"], lang, all(a == b for a, b in zip(original["sections"], revised["sections"]))))
assert len(results) == 16
integrated = sum(x[2] for x in results)
print(f"PASS: 16 fixture variants match the live root source structure, headings, original text and source URLs")
print(f"INFO: {16-integrated} of 16 revised variants still differ from root index.html; this is NOT a deployment test")
print("INFO: source-of-truth verified; no file was modified")
