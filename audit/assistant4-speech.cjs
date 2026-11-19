/* Node contract tests for the native speech adapter. This uses a simulated backend. */
const assert = require('node:assert/strict');
const { test } = require('node:test');

test('speech is opt-in, chooses local voices, and cancellation ignores stale events', async () => {
  const list = [
    { voiceURI: 'local-cs-a', localService: true, lang: 'cs-CZ', default: true },
    { voiceURI: 'local-cs-b', localService: true, lang: 'cs-CZ' },
    { voiceURI: 'remote-cs', localService: false, lang: 'cs-CZ' },
    { voiceURI: 'local-hu', localService: true, lang: 'hu-HU' }
  ];
  let active;
  let cancels = 0;
  const native = Object.assign(new EventTarget(), {
    getVoices: () => list,
    speak: utterance => { active = utterance; },
    cancel: () => { cancels++; active = undefined; }
  });
  globalThis.window = { speechSynthesis: native, SpeechSynthesisUtterance: true };
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  try {
    const { createSpeech } = await import('../assets/assistant4/speech.js');
    const states = [];
    let notifications = 0;
    const speech = createSpeech({ onState: state => states.push(state), onVoices: () => { notifications++; } });
    assert.equal(active, undefined);
    assert.deepEqual(speech.voices('cs').map(voice => voice.voiceURI), ['local-cs-a', 'local-cs-b']);
    native.dispatchEvent(new Event('voiceschanged'));
    assert.equal(notifications, 1);
    speech.read('Text vzdělávací odpovědi', 'cs', 'local-cs-b');
    assert.equal(active.voice.voiceURI, 'local-cs-b');
    assert.equal(active.lang, 'cs-CZ');
    assert.equal(states.at(-1), 'pending');
    const prior = active;
    speech.stop();
    assert.equal(cancels, 1);
    prior.onstart();
    assert.equal(states.at(-1), 'idle');

    speech.read('Tájékoztató szöveg', 'hu');
    assert.equal(active.voice.voiceURI, 'local-hu');
    active.onstart();
    assert.equal(states.at(-1), 'speaking');
    active.onend();
    assert.equal(states.at(-1), 'idle');
    speech.read('Text', 'en');
    assert.equal(states.at(-1), 'error');
  } finally {
    delete globalThis.window;
    delete globalThis.SpeechSynthesisUtterance;
  }
});
