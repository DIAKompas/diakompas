const translations = {
  cs: {
    title: 'Hlasový průvodce', voiceOn: 'Zapnout hlas', voiceOff: 'Vypnout hlas',
    micOn: 'Zapnout mikrofon', micOff: 'Vypnout mikrofon', replay: 'Přehrát hlasové přivítání',
    blocked: 'Prohlížeč zablokoval automatické přehrávání. Použijte tlačítko Přehrát hlasové přivítání.',
    audioError: 'Přivítání se nepodařilo přehrát. Zkuste přehrání znovu.',
    waiting: 'Čekám na mikrofon. Pokud prohlížeč požádá o přístup, potvrďte jej.',
    listening: 'Mikrofon je aktivní. Poslouchám vaši otázku.',
    denied: 'Mikrofon je zablokovaný. Povolte jej v nastavení prohlížeče, pak zvolte Zapnout mikrofon. Můžete také otázku napsat.',
    failed: 'Mikrofon neposlouchá. Zvolte Zapnout mikrofon nebo otázku napište.',
    micStopped: 'Mikrofon je vypnutý.'
  },
  sk: {
    title: 'Hlasový sprievodca', voiceOn: 'Zapnúť hlas', voiceOff: 'Vypnúť hlas',
    micOn: 'Zapnúť mikrofón', micOff: 'Vypnúť mikrofón', replay: 'Prehrať hlasové privítanie',
    blocked: 'Prehliadač zablokoval automatické prehrávanie. Použite tlačidlo Prehrať hlasové privítanie.',
    audioError: 'Privítanie sa nepodarilo prehrať. Skúste to znovu.',
    waiting: 'Čakám na mikrofón. Ak prehliadač požiada o prístup, potvrďte ho.',
    listening: 'Mikrofón je aktívny. Počúvam vašu otázku.',
    denied: 'Mikrofón je zablokovaný. Povoľte ho v nastaveniach prehliadača a zvoľte Zapnúť mikrofón. Otázku môžete aj napísať.',
    failed: 'Mikrofón nepočúva. Zvoľte Zapnúť mikrofón alebo otázku napíšte.',
    micStopped: 'Mikrofón je vypnutý.'
  },
  en: {
    title: 'Voice guide', voiceOn: 'Turn voice on', voiceOff: 'Turn voice off',
    micOn: 'Turn microphone on', micOff: 'Turn microphone off', replay: 'Play spoken welcome',
    blocked: 'Your browser blocked autoplay. Use the Play spoken welcome button.',
    audioError: 'The welcome could not play. Try playing it again.',
    waiting: 'Waiting for the microphone. If your browser asks for access, select Allow.',
    listening: 'The microphone is active. I’m listening for your question.',
    denied: 'The microphone is blocked. Allow it in browser settings, then select Turn microphone on. You can also type your question.',
    failed: 'The microphone is idle. Select Turn microphone on or type your question.',
    micStopped: 'The microphone is off.'
  },
  hu: {
    title: 'Hangos útmutató', voiceOn: 'Hang bekapcsolása', voiceOff: 'Hang kikapcsolása',
    micOn: 'Mikrofon bekapcsolása', micOff: 'Mikrofon kikapcsolása', replay: 'A hangos üdvözlés lejátszása',
    blocked: 'A böngésző letiltotta az automatikus lejátszást. Használja a hangos üdvözlés lejátszására szolgáló gombot.',
    audioError: 'Az üdvözlést nem sikerült lejátszani. Próbálja újra.',
    waiting: 'Várakozás a mikrofonra. Ha a böngésző hozzáférést kér, engedélyezze.',
    listening: 'A mikrofon aktív. Várom a kérdését.',
    denied: 'A mikrofon le van tiltva. Engedélyezze a böngésző beállításaiban, majd válassza a Mikrofon bekapcsolása lehetőséget. Be is írhatja a kérdését.',
    failed: 'A mikrofon nem figyel. Kapcsolja be a mikrofont, vagy írja be a kérdését.',
    micStopped: 'A mikrofon ki van kapcsolva.'
  }
};

const locales = { cs: 'cs-CZ', sk: 'sk-SK', en: 'en-GB', hu: 'hu-HU' };
const microphoneCommands = {
  cs: ['zapni mikrofon', 'zapnout mikrofon'],
  sk: ['zapni mikrofon', 'zapnut mikrofon'],
  en: ['turn on the microphone', 'turn the microphone on'],
  hu: ['kapcsold be a mikrofont', 'kapcsolja be a mikrofont']
};
const language = () => Object.hasOwn(translations, document.documentElement.lang) ? document.documentElement.lang : 'cs';
const voiceKey = 'dk4-voice-enabled';
const microphoneKey = 'dk4-microphone-enabled';

function preference(key) {
  try {
    const value = localStorage.getItem(key);
    if (value === 'off' || value === 'on') return value === 'on';
    // Mode 2 was the previous text-only opt-out.
    return localStorage.getItem('dk4-communication-mode') !== '2';
  } catch {
    return true;
  }
}

function savePreference(key, enabled) {
  try { localStorage.setItem(key, enabled ? 'on' : 'off'); } catch {}
}

let voiceEnabled = preference(voiceKey);
export const shouldSpeak = () => voiceEnabled && document.documentElement.dataset.dk4View === 'blind';

export function mountCommunication(anchor, search) {
  let microphoneEnabled = preference(microphoneKey);
  const inBlindMode = () => document.documentElement.dataset.dk4View === 'blind';
  let microphoneState = 'idle';
  let microphoneMessage = '';
  let manualMicRequired = false;
  let recognition;
  let recognitionTimeout;
  let welcomeAttempt;
  let welcomeState = 'idle';
  let welcomeMessage = '';
  let showReplay = false;

  const region = document.createElement('section');
  region.id = 'dk4-accessibility';
  region.className = 'dk4-communication';
  region.setAttribute('aria-label', translations[language()].title);
  region.innerHTML = `
    <div class="dk4-buttons dk4-preferences"></div>
    <p id="dk4-welcome-status" class="dk4-communication-status" role="status" aria-atomic="true"></p>
    <p id="dk4-microphone-status" class="dk4-communication-status" role="status" aria-atomic="true"></p>
    <audio preload="none"></audio>`;
  const controls = region.querySelector('.dk4-preferences');
  const welcomeStatus = region.querySelector('#dk4-welcome-status');
  const microphoneStatus = region.querySelector('#dk4-microphone-status');
  const player = region.querySelector('audio');

  function button(action, description, handler) {
    const control = document.createElement('button');
    control.type = 'button';
    control.dataset.action = action;
    control.setAttribute('aria-describedby', description);
    control.addEventListener('click', handler);
    controls.append(control);
    return control;
  }

  const voice = button('voice', welcomeStatus.id, () => {
    voiceEnabled = !voiceEnabled;
    savePreference(voiceKey, voiceEnabled);
    document.dispatchEvent(new CustomEvent('dk4:communication-mode', { detail: { voiceEnabled } }));
    if (voiceEnabled) playWelcome();
    else {
      showReplay = false;
      stopWelcome();
    }
  });
  const microphone = button('microphone', microphoneStatus.id, () => {
    microphoneEnabled = microphoneState === 'idle';
    savePreference(microphoneKey, microphoneEnabled);
    if (microphoneEnabled) {
      manualMicRequired = false;
      stopWelcome();
      startListening();
    } else {
      stopListening('micStopped');
    }
  });
  const replay = button('welcome', welcomeStatus.id, playWelcome);

  function render() {
    const copy = translations[language()];
    region.setAttribute('aria-label', copy.title);
    region.dataset.voiceEnabled = String(voiceEnabled);
    region.dataset.microphoneState = microphoneState;
    region.dataset.welcomeState = welcomeState;
    voice.textContent = voiceEnabled ? copy.voiceOff : copy.voiceOn;
    microphone.textContent = microphoneState === 'idle' ? copy.micOn : copy.micOff;
    replay.textContent = copy.replay;
    replay.hidden = !voiceEnabled || !showReplay;
    const welcomeText = copy[welcomeMessage] || '';
    const microphoneText = copy[microphoneMessage] || '';
    if (welcomeStatus.textContent !== welcomeText) welcomeStatus.textContent = welcomeText;
    if (microphoneStatus.textContent !== microphoneText) microphoneStatus.textContent = microphoneText;
  }

  function stopWelcome() {
    // Clear the attempt before pause so a rejected superseded play cannot change the UI.
    welcomeAttempt = undefined;
    player.pause();
    welcomeState = 'idle';
    welcomeMessage = '';
    render();
  }

  function welcomeFailed(attempt, error) {
    if (welcomeAttempt !== attempt) return;
    welcomeAttempt = undefined;
    welcomeState = 'blocked';
    showReplay = true;
    welcomeMessage = error?.name === 'NotAllowedError' ? 'blocked' : 'audioError';
    render();
  }

  function playWelcome() {
    if (!voiceEnabled || !inBlindMode() || document.hidden) return;
    stopWelcome();
    if (recognition) stopListening();
    const source = new URL('./welcome/' + language() + '.mp3', import.meta.url).href;
    if (player.src !== source) player.src = source;
    else player.currentTime = 0;
    const attempt = {};
    welcomeAttempt = attempt;
    welcomeState = 'pending';
    render();
    // Call play within the button event for browsers that require user activation.
    player.play().then(() => {
      if (welcomeAttempt !== attempt) return;
      welcomeState = 'playing';
      render();
    }).catch(error => welcomeFailed(attempt, error));
  }

  player.addEventListener('error', () => {
    if (welcomeAttempt && player.error) welcomeFailed(welcomeAttempt, player.error);
  });

  player.addEventListener('ended', () => {
    if (!welcomeAttempt) return;
    const restoreFocus = document.activeElement === replay;
    showReplay = false;
    stopWelcome();
    if (restoreFocus) microphone.focus();
    startListening();
  });

  function stopListening(message = '') {
    const active = recognition;
    recognition = undefined;
    clearTimeout(recognitionTimeout);
    microphoneState = 'idle';
    microphoneMessage = message;
    active?.abort();
    render();
  }

  function submitQuestion(question) {
    search.value = question
      .replace(/\b(?:h\s*b\s*a\s*1\s*c|hb1ac|h\s*b\s*a\s*jedna\s*c[eé])\b/giu, 'HbA1c')
      .replace(/\b(?:c\s*g\s*m|c[eé]\s*g[eé]\s*em)\b/giu, 'CGM');
    search.dispatchEvent(new Event('input', { bubbles: true }));
    const form = search.closest('form');
    if (form) form.requestSubmit();
    else search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }));
  }

  function startListening() {
    if (!inBlindMode() || !microphoneEnabled || manualMicRequired || recognition || welcomeAttempt || document.hidden) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      stopListening('failed');
      return;
    }
    const lang = language();
    const attempt = new Recognition();
    recognition = attempt;
    microphoneState = 'pending';
    microphoneMessage = 'waiting';
    render();
    attempt.lang = locales[lang];
    attempt.interimResults = false;

    function failed(event) {
      if (recognition !== attempt) return;
      const denied = ['not-allowed', 'service-not-allowed'].includes(event?.error || event?.name) || event?.name === 'NotAllowedError';
      manualMicRequired = true;
      stopListening(denied ? 'denied' : 'failed');
    }

    attempt.onaudiostart = () => {
      if (recognition !== attempt) return;
      microphoneState = 'active';
      microphoneMessage = 'listening';
      render();
    };
    attempt.onaudioend = () => {
      if (recognition !== attempt) return;
      microphoneState = 'pending';
      microphoneMessage = '';
      render();
    };
    attempt.onresult = event => {
      if (recognition !== attempt) return;
      const question = event.results[event.resultIndex]?.[0]?.transcript?.trim();
      if (!question) { failed(); return; }
      stopListening();
      const command = question.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[.!?]+$/, '');
      if (microphoneCommands[lang].includes(command)) startListening();
      else submitQuestion(question);
    };
    attempt.onerror = failed;
    attempt.onend = () => failed();
    recognitionTimeout = setTimeout(failed, 15000);
    try { attempt.start(); } catch (error) { failed(error); }
  }

  function suspend() {
    stopWelcome();
    stopListening();
  }

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !recognition) return;
    microphoneEnabled = false;
    savePreference(microphoneKey, false);
    stopListening('micStopped');
  });
  new MutationObserver(() => {
    suspend();
    if (voiceEnabled && inBlindMode()) playWelcome();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) suspend();
  });
  window.addEventListener('pagehide', suspend);
  document.addEventListener('dk4:spoken-answer-finished', startListening);
  search.ownerDocument.addEventListener('dk:guide-state', ({ detail }) => {
    if (detail.state === 'thinking' || detail.state === 'reset') suspend();
  });

  anchor.before(region);
  document.addEventListener('dk4:view-changed', () => {
    if (!inBlindMode()) { suspend(); region.hidden = true; }
    else { region.hidden = false; if (voiceEnabled) playWelcome(); else startListening(); }
  });
  region.hidden = !inBlindMode();
  render();
  requestAnimationFrame(() => {
    if (!inBlindMode()) return;
    if (voiceEnabled) playWelcome();
    else if (microphoneEnabled) {
      navigator.permissions?.query({ name: 'microphone' })
        .then(permission => { if (permission.state === 'granted') startListening(); })
        .catch(() => {});
    }
  });
}
