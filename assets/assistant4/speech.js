const locales = { cs: 'cs-CZ', sk: 'sk-SK', en: 'en-GB', hu: 'hu-HU' };

export function createSpeech({ onState, onVoices, onEnd }) {
  const synth = window.speechSynthesis;
  const available = Boolean(synth && window.SpeechSynthesisUtterance);
  let current = null;

  function voices(language) {
    return available ? synth.getVoices().filter(voice =>
      voice.lang.split(/[-_]/)[0].toLowerCase() === language
    ) : [];
  }

  function stop() {
    if (current) {
      current = null;
      synth.cancel();
    }
    onState('idle');
  }

  function read(text, language, voiceId) {
    const matching = voices(language);
    const voice = matching.find(candidate => candidate.voiceURI === voiceId)
      || matching.find(candidate => candidate.default) || matching[0];
    if (!available) {
      onState('error');
      return;
    }
    stop();
    const utterance = new SpeechSynthesisUtterance(text);
    current = utterance;
    utterance.lang = locales[language] || locales.cs;
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    // If no matching voice is installed, let the browser attempt its language fallback.
    utterance.onstart = () => { if (current === utterance) onState('speaking'); };
    const finish = state => {
      if (current !== utterance) return;
      current = null;
      onState(state);
      if (state === 'idle') onEnd?.();
    };
    utterance.onend = () => finish('idle');
    utterance.onerror = () => finish('error');
    onState('pending');
    try {
      synth.speak(utterance);
    } catch {
      finish('error');
    }
  }

  synth?.addEventListener('voiceschanged', onVoices);
  return { available, voices, read, stop };
}
