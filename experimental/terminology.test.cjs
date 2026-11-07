// Run with: node --test experimental/terminology.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const terminology = require("./terminology.js");
const cases = [
  ["cs", "Vysoký cukr", "hyperglycemia"],
  ["cs", "zvýšená glykémie", "hyperglycemia"],
  ["cs", "nízký cukr", "hypoglycemia"],
  ["cs", "hypoglykémie", "hypoglycemia"],
  ["cs", "dlouhý cukr", "hba1c"],
  ["sk", "vysoký cukor", "hyperglycemia"],
  ["en", "high blood sugar", "hyperglycemia"],
  ["hu", "magas vércukor", "hyperglycemia"],
  ["cs", "čidlo na cukr", "cgm"]
];
for (const [language, query, expected] of cases) {
  test(language + ": " + query, () => {
    assert.ok(terminology.matchConcept(query, language).includes(expected));
  });
}
test("empty query returns no matches", () => {
  assert.deepEqual(terminology.matchConcept("", "cs"), []);
});
test("accent and case normalization", () => {
  assert.deepEqual(terminology.matchConcept("HYPERGLYKEMIE", "cs"), ["hyperglycemia"]);
});
