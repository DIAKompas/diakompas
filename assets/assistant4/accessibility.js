import { createSpeech } from './speech.js';
import { createArticleNavigation, normalizeVoice } from './voice-articles.js?v=p0-navigation';

const translations = {
  cs: {
    openTab: 'Otevřít hlasový režim přímo v prohlížeči',
    frameBlocked: 'Tento náhled nepovoluje mikrofon. Otevřete hlasový režim v samostatné kartě.',
    unavailable: 'Prohlížeč nenašel dostupný mikrofon. Zkontrolujte přístup v systému nebo napište otázku.',
    network: 'Rozpoznávání řeči se nepodařilo připojit. Zkuste mikrofon zapnout znovu nebo napište otázku.',
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
    openTab: 'Otvoriť hlasový režim priamo v prehliadači',
    frameBlocked: 'Tento náhľad nepovoľuje mikrofón. Otvorte hlasový režim v samostatnej karte.',
    unavailable: 'Prehliadač nenašiel dostupný mikrofón. Skontrolujte prístup v systéme alebo napíšte otázku.',
    network: 'Rozpoznávanie reči sa nepodarilo pripojiť. Skúste mikrofón zapnúť znova alebo napíšte otázku.',
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
    openTab: 'Open voice mode in a separate tab',
    frameBlocked: 'This preview blocks microphone access. Open voice mode in a separate tab.',
    unavailable: 'The browser found no available microphone. Check system access or type your question.',
    network: 'Speech recognition could not connect. Try turning the microphone on again or type your question.',
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
    openTab: 'Hangos mód megnyitása új lapon',
    frameBlocked: 'Ez az előnézet tiltja a mikrofont. Nyissa meg a hangos módot külön lapon.',
    unavailable: 'A böngésző nem talált elérhető mikrofont. Ellenőrizze a rendszer beállításait, vagy írja be a kérdését.',
    network: 'A beszédfelismerés nem tudott csatlakozni. Kapcsolja be újra a mikrofont, vagy írja be a kérdését.',
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
const welcomeNavigation = {
  cs: {
    prompt: 'Začínám s diabetem – řekněte bod jedna. Témata – řekněte bod dva.',
    labels: ['Začínám s diabetem', 'Témata'],
    commands: [/^bod (jedna|1)$/, /^(?:prosim )?bod(?: cislo)? ?(?:dva|dve|druhy|dvojka|2)(?: prosim)?$/, /^(bod (tri|3)|navrat|(?:vratit se |vrat se |vratte se )?zpet(?: do (?:predchoziho )?menu)?)$/, /^nazvoslovi$/]
  },
  sk: {
    prompt: 'Začínám s diabetom – povedzte bod jeden. Témy – povedzte bod dva.',
    labels: ['Začínam s diabetom', 'Témy'],
    commands: [/^bod (jeden|1)$/, /^bod (dva|2)$/, /^bod (tri|3)$/, /^nazvoslovie$/]
  },
  en: {
    prompt: 'Getting started with diabetes – say step one. Topics – say step two.',
    labels: ['Getting started with diabetes', 'Topics'],
    commands: [/^(point|step) (one|1)$/, /^(point|step) (two|2)$/, /^(point|step) (three|3)$/, /^glossary$/]
  },
  hu: {
    prompt: 'Kezdés cukorbetegséggel – mondja: egyik pont. Témák – mondja: kettes pont.',
    labels: ['Első lépések a cukorbetegséggel', 'Témák'],
    commands: [/^(egy|egyik|1) pont$/, /^(ket|kettes|2) pont$/, /^harom$/, /^szojegyzek$/]
  }
};

const recognitionRestartDelay = 450;
const navigationCommandPrefixes = {
  cs: /^(bod|krok|tema|clanek|cislo)(?: |$)/,
  sk: /^(bod|krok|tema|clanok|cislo)(?: |$)/,
  en: /^(point|step|topic|article|number)(?: |$)/,
  hu: /^(pont|lepes|tema|cikk|szam)(?: |$)| (pont|lepes|tema|cikk|szam)$/
};

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

export function mountCommunication(anchor, search, navigateWelcome) {
  // Entering the dedicated blind experience defaults to hands-free listening.
  // Explicit in-session microphone off remains respected until the next entry.
  let microphoneEnabled = true;
  const inBlindMode = () => document.documentElement.dataset.dk4View === 'blind';
  let microphoneState = 'idle';
  let microphoneMessage = '';
  let manualMicRequired = false;
  let permissionAttempt;
  let recognition;
  let recognitionTimeout;
  let listeningRetryTimer;
  let listeningRetryCount = 0;
  let listeningGeneration = 0;
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
    <a class="dk4-microphone-link" target="_blank" rel="noopener" hidden></a>
    <audio preload="none"></audio>
    <div class="dk4-buttons dk4-welcome-navigation" hidden></div>`;
  const controls = region.querySelector('.dk4-preferences');
  const welcomeStatus = region.querySelector('#dk4-welcome-status');
  const microphoneStatus = region.querySelector('#dk4-microphone-status');
  const player = region.querySelector('audio');
  const navigation = region.querySelector('.dk4-welcome-navigation');
  const navigationButtons = welcomeNavigation.cs.labels.map((_, index) => {
    const control = document.createElement('button');
    control.type = 'button';
    control.addEventListener('click', () => {
      navigateWelcome(index, index === 1);
      if (index === 1) articles.start(1);
    });
    navigation.append(control);
    return control;
  });
  let navigationPromptActive = false;
  let navigationPromptTimeout;
  let navigationLines = [];
  let navigationDone;
  let navigationFailed;
  let navigationLanguage;
  let microphoneDrain = null;
  let navigationGeneration = 0;
  const navigationSpeech = createSpeech({
    onState: state => { if (state === 'error') finishNavigationPrompt(false); },
    onVoices: () => {},
    onEnd: readNavigationLine
  });


  const openTab = region.querySelector('.dk4-microphone-link');
  const standaloneUrl = new URL(location.href);
  const debugOutput = standaloneUrl.searchParams.get('dk4voiceqa') === '1'
    ? document.createElement('p') : null;
  if (debugOutput) {
    debugOutput.textContent = 'Diagnostika hlasu: čekám na přepis příkazu.';
    region.append(debugOutput);
  }
  standaloneUrl.searchParams.set('dk4view', 'blind');
  standaloneUrl.hash = '';
  openTab.href = standaloneUrl.href;
  const embedded = window.top !== window;
  const microphonePolicy = document.permissionsPolicy || document.featurePolicy;
  const policyBlocksMicrophone = () => microphonePolicy?.allowsFeature('microphone') === false;

  function button(action, description, handler) {
    const control = document.createElement('button');
    control.type = 'button';
    control.dataset.action = action;
    control.setAttribute('aria-describedby', description);
    control.addEventListener('click', handler);
    controls.append(control);
    return control;
  }

  /* Legacy voice toggle retained in source for compatibility but not shown in blind UI. */
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
    // A pending first start may be stuck: a click must retry, not disable it.
    microphoneEnabled = microphoneState !== 'active';
    savePreference(microphoneKey, microphoneEnabled);
    if (microphoneEnabled) {
      manualMicRequired = false;
      stopWelcome();
      const drain = releaseMicrophone();
      listeningRetryCount = 0;
      if (drain) drain.then(requestMicrophone);
      else requestMicrophone();
    } else {
      stopListening('micStopped');
    }
  });
  const replay = button('welcome', welcomeStatus.id, playWelcome);
  const articles = createArticleNavigation({
    language, speak: speakNavigation, silence: stopNavigation,
    resume: () => requestMicrophone(), microphone
  });

  function render() {
    const lang = language();
    const copy = translations[lang];
    navigationButtons.forEach((control, index) => {
      const label = welcomeNavigation[lang].labels[index];
      if (control.textContent !== label) control.textContent = label;
    });
    region.setAttribute('aria-label', copy.title);
    region.dataset.voiceEnabled = String(voiceEnabled);
    region.dataset.microphoneState = microphoneState;
    region.dataset.welcomeState = welcomeState;
    voice.hidden = true;
    voice.textContent = voiceEnabled ? copy.voiceOff : copy.voiceOn;
    microphone.textContent = microphoneState === 'idle' ? copy.micOn : copy.micOff;
    replay.textContent = copy.replay;
    replay.hidden = !voiceEnabled || !showReplay;
    const welcomeText = copy[welcomeMessage] || '';
    const microphoneText = copy[microphoneMessage] || '';
    openTab.textContent = copy.openTab;
    openTab.hidden = !embedded || !['frameBlocked', 'denied', 'unavailable', 'failed'].includes(microphoneMessage);
    if (welcomeStatus.textContent !== welcomeText) welcomeStatus.textContent = welcomeText;
    if (microphoneStatus.textContent !== microphoneText) microphoneStatus.textContent = microphoneText;
  }

  function finishNavigationPrompt(completed = true) {
    if (!navigationPromptActive) return;
    const callback = completed ? navigationDone : navigationFailed;
    stopNavigation();
    navigation.hidden = false;
    if (callback) callback();
    else if (microphoneEnabled) requestMicrophone();
  }

  function stopNavigation() {
    navigationGeneration++;
    if (!navigationPromptActive) return;
    navigationPromptActive = false;
    navigationLines = [];
    clearTimeout(navigationPromptTimeout);
    navigationSpeech.stop();
  }

  function stopWelcome() {
    stopNavigation();
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
    navigation.hidden = false;
    showReplay = true;
    welcomeMessage = error?.name === 'NotAllowedError' ? 'blocked' : 'audioError';
    render();
  }

  function playWelcome() {
    if (!voiceEnabled || !inBlindMode() || document.hidden) return;
    stopWelcome();
    navigation.hidden = true;
    const generation = navigationGeneration;
    const drain = releaseMicrophone();
    const source = new URL('./welcome/' + language() + '.mp3', import.meta.url).href;
    if (player.src !== source) player.src = source;
    else player.currentTime = 0;
    if (drain) {
      drain.then(() => { if (generation === navigationGeneration) playWelcome(); });
      return;
    }
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
    speakNavigation(welcomeNavigation[language()].prompt);
  });

  function readNavigationLine() {
    clearTimeout(navigationPromptTimeout);
    const line = navigationLines.shift();
    if (line === undefined) {
      finishNavigationPrompt();
      return;
    }
    navigationPromptTimeout = setTimeout(() => finishNavigationPrompt(false), 45000);
    navigationSpeech.read(line, navigationLanguage);
  }

  function releaseMicrophone() {
    if (recognition) stopListening();
    return microphoneDrain;
  }

  function speakNavigation(value, { locale = language(), done, failed } = {}) {
    stopNavigation();
    const generation = navigationGeneration;
    navigationPromptActive = true;
    navigationLines = typeof value === 'string' ? [value] : [...value];
    navigationDone = done;
    navigationFailed = failed;
    navigationLanguage = locale;
    const begin = () => {
      if (generation !== navigationGeneration) return;
      if (voiceEnabled) readNavigationLine();
      else finishNavigationPrompt();
    };
    const drain = releaseMicrophone();
    if (drain) drain.then(begin);
    else begin();
  }

  function stopListening(message = '', abort = true) {
    const active = recognition;
    recognition = undefined;
    permissionAttempt = undefined;
    clearTimeout(recognitionTimeout);
    clearTimeout(listeningRetryTimer);
    listeningGeneration++;
    microphoneState = 'idle';
    microphoneMessage = message;
    if (active && abort) {
      microphoneDrain = new Promise(resolve => {
        active.onend = () => {
          setTimeout(() => {
            microphoneDrain = null;
            resolve();
          }, recognitionRestartDelay);
        };
      });
      active.abort();
    }
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

  function microphoneFailure(code) {
    if (policyBlocksMicrophone() && embedded) return 'frameBlocked';
    if (['not-allowed', 'service-not-allowed', 'NotAllowedError', 'PermissionDeniedError', 'SecurityError'].includes(code)) return 'denied';
    if (['audio-capture', 'NotFoundError', 'NotReadableError'].includes(code)) return 'unavailable';
    return code === 'network' ? 'network' : 'failed';
  }

  function requestMicrophone() {
    // SpeechRecognition acquires its own audio input. A separate getUserMedia
    // probe immediately released before start() caused a fragile hand-off.
    // The explicit button click calls start() synchronously in its user gesture.
    if (policyBlocksMicrophone()) {
      stopListening(embedded ? 'frameBlocked' : 'denied');
      return;
    }
    startListening();
  }

  function retryListening() {
    const generation = listeningGeneration;
    const restart = () => {
      if (generation === listeningGeneration) startListening();
    };
    if (microphoneDrain) microphoneDrain.then(restart);
    else listeningRetryTimer = setTimeout(restart, recognitionRestartDelay);
  }

  function startListening() {
    if (!inBlindMode() || !microphoneEnabled || manualMicRequired || recognition || permissionAttempt || welcomeAttempt || navigationPromptActive || microphoneDrain || document.hidden) return;
    if (policyBlocksMicrophone()) {
      stopListening(embedded ? 'frameBlocked' : 'denied');
      return;
    }
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
    if (lang === 'cs') attempt.maxAlternatives = 3;

    function failed(event, ended = false) {
      if (recognition !== attempt) return;
      const error = event?.error || event?.name || '';
      // Transient first-start failure after the welcome: retry without a click.
      const retry = (!error || ['no-speech', 'aborted', 'timeout'].includes(error)) && listeningRetryCount < 2 && microphoneEnabled && inBlindMode();
      if (retry) listeningRetryCount++;
      stopListening(retry ? 'waiting' : microphoneFailure(error), !ended);
      if (retry) {
        manualMicRequired = false;
        retryListening();
      } else manualMicRequired = true;
    }

    attempt.onaudiostart = () => {
      if (recognition !== attempt) return;
      microphoneState = 'active';
      listeningRetryCount = 0;
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
      const result = event.results[event.resultIndex];
      const question = result?.[0]?.transcript?.trim();
      if (!question) { failed(); return; }
      if (debugOutput) {
        const transcripts = Array.from(result).slice(0, 3).map(item => item.transcript.trim().slice(0, 100));
        debugOutput.textContent = 'Přepis Chrome: ' + transcripts.map(value => '„' + value + '“').join(' / ');
      }
      const command = normalizeVoice(question);
      const commands = welcomeNavigation[lang].commands;
      let destination = commands.findIndex(pattern => pattern.test(command));
      // Missing or misheard numerals may appear correctly in another result.
      // Only consider alternatives when the preferred result is a point command.
      if (lang === 'cs' && destination === -1 && /^(?:prosim )?bod(?: |$)/.test(command) &&
          Array.from(result).slice(1).some(option => commands[1].test(normalizeVoice(option.transcript)))) {
        destination = 1;
      }
      if (!microphoneCommands[lang].includes(command) && articles.handle(command, destination)) return;
      if (destination !== -1) {
        const introduction = navigateWelcome(destination, true)
          ?? (destination === 2 ? welcomeNavigation[lang].prompt : undefined);
        if (destination < 2) articles.start(destination);
        else speakNavigation(introduction || []);
      } else if (microphoneCommands[lang].includes(command)) {
        attempt.onend = () => {
          if (recognition !== attempt) return;
          stopListening('', false);
          retryListening();
        };
      } else if (navigationCommandPrefixes[lang].test(command)) {
        stopListening('waiting');
        retryListening();
      } else {
        stopListening();
        submitQuestion(question);
      }
    };
    attempt.onerror = event => {
      if (recognition === attempt && debugOutput) debugOutput.textContent = 'Chyba rozpoznávače: ' + event.error;
      failed(event, true);
    };
    attempt.onend = () => failed({ error: 'no-speech' }, true);
    recognitionTimeout = setTimeout(() => failed({ error: 'timeout' }), 30000);
    try { attempt.start(); } catch (error) { failed(error, true); }
  }

  function suspend() {
    articles.reset();
    stopWelcome();
    stopListening();
  }

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || (!recognition && !permissionAttempt) || document.querySelector('dialog[open]')) return;
    microphoneEnabled = false;
    savePreference(microphoneKey, false);
    stopListening('micStopped');
  });
  new MutationObserver(() => {
    suspend();
    if (voiceEnabled && inBlindMode()) playWelcome();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !permissionAttempt) suspend();
  });
  window.addEventListener('pagehide', suspend);
  document.addEventListener('dk4:spoken-answer-finished', () => {
    if (microphoneDrain) retryListening();
    else startListening();
  });
  search.ownerDocument.addEventListener('dk:guide-state', ({ detail }) => {
    if (detail.state === 'thinking' || detail.state === 'reset') suspend();
  });

  anchor.before(region);
  document.addEventListener('dk4:view-changed', () => {
    if (!inBlindMode()) { suspend(); region.hidden = true; }
    else {
      region.hidden = false;
      microphoneEnabled = true;
      manualMicRequired = false;
      voiceEnabled = true;
      render();
      if (voiceEnabled) playWelcome(); else requestMicrophone();
    }
  });
  region.hidden = !inBlindMode();
  render();
  return region;
}
