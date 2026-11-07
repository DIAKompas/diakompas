/* DIA Kompas: synonym expansion for educational navigation.
 * Independent browser module; not yet wired to the production UI.
 * Does not diagnose, triage, or generate medical advice.
 */
(function (root) {
  "use strict";
  const concepts = {
    hyperglycemia: {
      cs: ["vysoký cukr", "vyšší cukr", "zvýšená glykémie", "vysoká glykémie", "hyperglykémie"],
      sk: ["vysoký cukor", "zvýšená glykémia", "hyperglykémia"],
      en: ["high blood sugar", "high glucose", "hyperglycemia", "hyperglycaemia"],
      hu: ["magas vércukor", "magas vércukorszint", "hiperglikémia"]
    },
    hypoglycemia: {
      cs: ["nízký cukr", "nízká glykémie", "hypoglykémie"],
      sk: ["nízky cukor", "nízka glykémia", "hypoglykémia"],
      en: ["low blood sugar", "low glucose", "hypoglycemia", "hypoglycaemia"],
      hu: ["alacsony vércukor", "hipoglikémia"]
    },
    hba1c: {
      cs: ["dlouhý cukr", "glykovaný hemoglobin", "hba1c"],
      sk: ["dlhý cukor", "glykovaný hemoglobín", "hba1c"],
      en: ["a1c", "hba1c", "glycated hemoglobin"],
      hu: ["hba1c", "glikált hemoglobin"]
    },
    cgm: {
      cs: ["čidlo na cukr", "senzor glukózy", "glukózový senzor", "cgm"],
      sk: ["senzor glukózy", "glukózový senzor", "cgm"],
      en: ["glucose sensor", "continuous glucose monitor", "cgm"],
      hu: ["glükózszenzor", "folyamatos glükózmonitorozás", "cgm"]
    }
  };
  const normalize = value => String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  function matchConcept(query, language) {
    const q = normalize(query);
    if (!q) return [];
    const lang = Object.prototype.hasOwnProperty.call(concepts.hyperglycemia, language) ? language : "cs";
    return Object.entries(concepts).filter(([, translations]) =>
      translations[lang].some(term => {
        const t = normalize(term);
        return q === t || (t.length > 4 && q.includes(t));
      })
    ).map(([id]) => id);
  }
  function synonyms(conceptId, language) {
    const item = concepts[conceptId];
    return item ? [...(item[language] || item.cs)] : [];
  }
  const api = Object.freeze({ normalize, matchConcept, synonyms });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DiaKompasTerminology = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
