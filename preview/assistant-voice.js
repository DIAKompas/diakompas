/* DIA Kompas 4.0: progressive enhancement; no external services, no data collection. */
(function () {
  'use strict';
  const avatar = document.getElementById('avatar');
  const output = document.getElementById('answer');
  const form = document.getElementById('ask');
  const question = document.getElementById('question');
  const voiceButton = document.getElementById('voiceToggle');
  const langSelect = document.getElementById('language');
  const synth = window.speechSynthesis;
  const supported = Boolean(synth && window.SpeechSynthesisUtterance);
  const langs = {cz:'cs-CZ',sk:'sk-SK',en:'en-US',hu:'hu-HU'};
  let speaking = false;
  function state(name) { avatar.dataset.state = name; }
  function stop() {
    if (supported) synth.cancel();
    speaking = false; state('idle');
    voiceButton.textContent = 'Přečíst odpověď';
    voiceButton.setAttribute('aria-pressed','false');
  }
  voiceButton.hidden = !supported;
  voiceButton.addEventListener('click', () => {
    if (!supported) return;
    if (speaking) { stop(); return; }
    const value = output.textContent.trim();
    if (!value) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = langs[langSelect.value] || 'cs-CZ';
    utterance.rate = 0.92;
    utterance.onstart = () => { speaking = true; state('reply'); voiceButton.textContent='Zastavit hlas'; voiceButton.setAttribute('aria-pressed','true'); };
    utterance.onend = stop;
    utterance.onerror = stop;
    synth.speak(utterance);
  });
  form.addEventListener('submit', () => { stop(); state('thinking'); requestAnimationFrame(() => state('idle')); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  langSelect.addEventListener('change', stop);
})();
