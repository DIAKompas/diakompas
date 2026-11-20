// Accessible, user-controlled communication preference. No health status is inferred.
const translations = {
 cs: {welcome:'Vítejte na DIA Kompasu. Vyberte způsob komunikace. Řekněte nebo stiskněte jedna pro hlasového průvodce, dva pro běžné ovládání, tři pro hlas i text.',title:'Jak chcete DIA Kompas používat?',one:'1 – Hlasový průvodce',two:'2 – Běžné ovládání',three:'3 – Hlas i text',start:'Přehrát hlasové přivítání',listen:'Odpovědět hlasem',change:'Změnit způsob komunikace',stop:'Vypnout hlas',enable:'Zapnout hlas',note:'Mikrofon se aktivuje pouze po vašem souhlasu. Pokud hlas není dostupný, použijte klávesnici nebo odečítač obrazovky.'},
 sk: {welcome:'Vitajte na DIA Kompase. Vyberte spôsob komunikácie. Povedzte alebo stlačte jedna pre hlasového sprievodcu, dva pre bežné ovládanie, tri pre hlas aj text.',title:'Ako chcete DIA Kompas používať?',one:'1 – Hlasový sprievodca',two:'2 – Bežné ovládanie',three:'3 – Hlas aj text',start:'Prehrať hlasové privítanie',listen:'Odpovedať hlasom',change:'Zmeniť spôsob komunikácie',stop:'Vypnúť hlas',enable:'Zapnúť hlas',note:'Mikrofón sa aktivuje iba s vaším súhlasom. Môžete použiť aj klávesnicu alebo čítačku obrazovky.'},
 en: {welcome:'Welcome to DIA Kompas. Choose how to communicate. Say or press one for a voice guide, two for standard controls, three for voice and text.',title:'How would you like to use DIA Kompas?',one:'1 – Voice guide',two:'2 – Standard controls',three:'3 – Voice and text',start:'Play spoken welcome',listen:'Choose by voice',change:'Change communication mode',stop:'Turn voice off',enable:'Turn voice on',note:'The microphone is used only with your permission. You can also use the keyboard or a screen reader.'},
 hu: {welcome:'Üdvözöljük a DIA Kompas oldalon. Válasszon kommunikációs módot. Mondja vagy nyomja meg az egyest a hangos útmutatóhoz, a kettest a hagyományos módhoz, a hármast a hanghoz és szöveghez.',title:'Hogyan szeretné használni a DIA Kompast?',one:'1 – Hangos útmutató',two:'2 – Hagyományos vezérlés',three:'3 – Hang és szöveg',start:'Hangos üdvözlés',listen:'Hangos választás',change:'Kommunikációs mód módosítása',stop:'Hang kikapcsolása',enable:'Hang bekapcsolása',note:'A mikrofont csak engedéllyel használjuk. Billentyűzet és képernyőolvasó is használható.'}
};
const locales = { cs: 'cs-CZ', sk: 'sk-SK', en: 'en-GB', hu: 'hu-HU' };
const feedback = {
  cs: ['Poslouchám. Řekněte jedna, dva nebo tři.', 'Hlasovou volbu se nepodařilo rozpoznat. Zkuste to znovu nebo použijte tlačítka 1, 2 a 3.', 'Přivítání se nepřehrálo. Zkuste tlačítko přehrávání nebo vyberte režim níže.', 'Hlasová volba může využít službu rozpoznávání řeči vašeho prohlížeče. Řekněte pouze číslo volby.'],
  sk: ['Počúvam. Povedzte jeden, dva alebo tri.', 'Hlasová voľba sa nerozpoznala. Skúste znova alebo použite tlačidlá 1, 2 a 3.', 'Privítanie sa neprehralo. Skúste tlačidlo prehrávania alebo vyberte režim.', 'Hlasová voľba môže využiť službu prehliadača na rozpoznávanie reči. Povedzte iba číslo voľby.'],
  en: ['Listening. Say one, two or three.', 'The voice choice couldn’t be recognized. Try again or use buttons 1, 2 and 3.', 'The welcome couldn’t play. Try the play button or select a mode below.', 'Voice selection may use your browser’s speech recognition service. Say only the number of your choice.'],
  hu: ['Figyelek. Mondja, hogy egy, kettő vagy három.', 'A hangos választás nem sikerült. Próbálja újra, vagy használja az 1, 2 és 3 gombot.', 'Az üdvözlés nem indult el. Próbálja a lejátszás gombot, vagy válasszon módot.', 'A hangos választás igénybe veheti a böngésző beszédfelismerő szolgáltatását. Csak a választott számot mondja.']
};
const requestingMicrophone = {
  cs: 'Čekám na mikrofon. Pokud se prohlížeč zeptá, povolte přístup. Escape ukončí hlasovou volbu.',
  sk: 'Čakám na mikrofón. Ak sa prehliadač spýta, povoľte prístup. Escape ukončí hlasovú voľbu.',
  en: 'Waiting for the microphone. If your browser asks, allow access. Press Escape to cancel.',
  hu: 'Várakozás a mikrofonra. Ha a böngésző kéri, engedélyezze a hozzáférést. Az Escape megszakítja a választást.'
};
const normalizedModes = new Map([
  ['1', '1'], ['jedna', '1'], ['jednicka', '1'], ['jeden', '1'], ['one', '1'], ['egy', '1'], ['egyes', '1'],
  ['2', '2'], ['dva', '2'], ['dve', '2'], ['dvojka', '2'], ['two', '2'], ['ketto', '2'], ['kettes', '2'],
  ['3', '3'], ['tri', '3'], ['trojka', '3'], ['three', '3'], ['harom', '3'], ['harmas', '3']
]);
const storageKey = 'dk4-communication-mode';
const language = () => Object.hasOwn(translations, document.documentElement.lang) ? document.documentElement.lang : 'cs';

let mode = null;
try {
  const saved = localStorage.getItem(storageKey);
  if (['1', '2', '3'].includes(saved)) mode = saved;
} catch {}

export const shouldSpeak = () => mode === '1' || mode === '3';

export function mountCommunication(anchor, search) {
  let editing = !mode;
  let vocalMode = mode === '1' ? '1' : '3';
  let recognition;
  let recognitionTimeout;
  let greeting;
  const region = document.createElement('section');
  region.id = 'dk4-accessibility';
  region.className = 'dk4-communication';
  region.setAttribute('aria-labelledby', 'dk4-accessibility-title');
  region.innerHTML = `
    <h2 id="dk4-accessibility-title" tabindex="-1"></h2>
    <div class="dk4-buttons dk4-welcome"></div>
    <div class="dk4-modes" role="group" aria-labelledby="dk4-accessibility-title"></div>
    <div class="dk4-buttons dk4-preferences"></div>
    <p class="dk4-communication-note"></p>
    <p class="dk4-communication-status" role="status" aria-atomic="true"></p>`;
  const heading = region.querySelector('h2');
  const actions = region.querySelector('.dk4-welcome');
  const choices = region.querySelector('.dk4-modes');
  const preferences = region.querySelector('.dk4-preferences');
  const note = region.querySelector('.dk4-communication-note');
  note.id = 'dk4-microphone-note';
  const status = region.querySelector('[role="status"]');
  const button = (parent, action, handler) => {
    const control = document.createElement('button');
    control.type = 'button';
    control.dataset.action = action;
    control.addEventListener('click', handler);
    parent.append(control);
    return control;
  };
  const welcome = button(actions, 'welcome', speakWelcome);
  const listen = button(actions, 'listen', startListening);
  listen.setAttribute('aria-describedby', note.id);
  const options = ['1', '2', '3'].map(value => button(choices, value, () => choose(value)));
  const change = button(preferences, 'change', () => {
    editing = true;
    status.textContent = '';
    render();
    heading.focus();
  });
  const toggle = button(preferences, 'voice', () => choose(shouldSpeak() ? '2' : vocalMode, toggle));
  const ask = button(preferences, 'ask', startQuestion);
  const questionCopy = {cs:'Položit otázku hlasem',sk:'Položiť otázku hlasom',en:'Ask a question by voice',hu:'Kérdezés hanggal'};

  function render() {
    const lang = language();
    const copy = translations[lang];
    heading.textContent = copy.title;
    options.forEach((option, index) => {
      option.textContent = [copy.one, copy.two, copy.three][index];
      option.setAttribute('aria-pressed', String(mode === String(index + 1)));
    });
    note.textContent = copy.note + ' ' + feedback[lang][3];
    welcome.textContent = copy.start;
    listen.textContent = copy.listen;
    change.textContent = copy.change;
    toggle.textContent = shouldSpeak() ? copy.stop : copy.enable;
    ask.textContent = questionCopy[lang];
    ask.hidden = !shouldSpeak();
    heading.hidden = actions.hidden = choices.hidden = note.hidden = !editing;
    // Voice-first: choices remain accessible to screen readers and keyboards but do not occupy the visual layout.
    choices.classList.add('dk4-visually-hidden');
    preferences.hidden = editing;
    change.hidden = true;
    toggle.hidden = true;
    region.dataset.mode = mode ?? '';
  }

  function stopListening() {
    const active = recognition;
    recognition = undefined;
    clearTimeout(recognitionTimeout);
    active?.abort();
  }

  function stopGreeting() {
    if (!greeting) return;
    greeting = undefined;
    window.speechSynthesis.cancel();
  }

  function choose(value, focus = change) {
    stopListening();
    stopGreeting();
    mode = value;
    if (shouldSpeak()) vocalMode = value;
    try { localStorage.setItem(storageKey, value); } catch {}
    editing = false;
    document.dispatchEvent(new CustomEvent('dk4:communication-mode', { detail: { voiceEnabled: shouldSpeak() } }));
    render();
    focus.focus();
    status.textContent = options[Number(value) - 1].textContent;
    if (shouldSpeak()) setTimeout(startQuestion, 250);
  }

  function speakWelcome() {
    stopListening();
    stopGreeting();
    const lang = language();
    const synth = window.speechSynthesis;
    status.textContent = '';
    if (!synth || !window.SpeechSynthesisUtterance) {
      status.textContent = feedback[lang][2];
      return;
    }
    const utterance = new SpeechSynthesisUtterance(translations[lang].welcome);
    utterance.lang = locales[lang];
    const voice = synth.getVoices().find(candidate => candidate.lang.split(/[-_]/)[0] === lang);
    if (voice) utterance.voice = voice;
    greeting = utterance;
    utterance.onend = () => { if (greeting === utterance) { greeting = undefined; if (editing) startListening(); } };
    utterance.onerror = () => {
      if (greeting !== utterance) return;
      greeting = undefined;
      status.textContent = feedback[lang][2];
    };
    try {
      synth.speak(utterance);
    } catch {
      greeting = undefined;
      status.textContent = feedback[lang][2];
    }
  }

  function startQuestion() {
    if (!mode || mode === '2') return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { status.textContent = feedback[language()][1]; return; }
    stopListening(); stopGreeting();
    const attempt = new Recognition();
    recognition = attempt;
    const lang = language();
    attempt.lang = locales[lang];
    attempt.interimResults = false;
    status.textContent = requestingMicrophone[language()];
    const failed = () => {
      if (recognition !== attempt) return;
      stopListening();
      status.textContent = feedback[lang][1];
    };
    attempt.onresult = event => {
      if (recognition !== attempt) return;
      const question = event.results[event.resultIndex]?.[0]?.transcript?.trim();
      stopListening();
      if (!question) { status.textContent = feedback[language()][1]; return; }
      status.textContent = question;
      search.value = question
        .replace(/\b(?:h\s*b\s*a\s*1\s*c|hb1ac|h\s*b\s*a\s*jedna\s*c[eé])\b/giu, 'HbA1c')
        .replace(/\b(?:c\s*g\s*m|c[eé]\s*g[eé]\s*em)\b/giu, 'CGM');
      search.dispatchEvent(new Event('input', {bubbles:true}));
      // Reuse the existing guide submit behavior, not a separate answer engine.
      const form = search.closest('form');
      if (form) form.requestSubmit();
      else search.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));
    };
    attempt.onerror = failed;
    attempt.onend = failed;
    recognitionTimeout = setTimeout(failed, 15000);
    try { attempt.start(); } catch { failed(); }
  }

  function startListening() {
    const lang = language();
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (recognition) return;
    stopGreeting();
    if (!Recognition) {
      status.textContent = feedback[lang][1];
      return;
    }
    const attempt = new Recognition();
    recognition = attempt;
    status.textContent = requestingMicrophone[lang];
    attempt.lang = locales[lang];
    attempt.interimResults = false;
    attempt.maxAlternatives = 3;
    const failed = () => {
      if (recognition !== attempt) return;
      stopListening();
      status.textContent = feedback[lang][1];
    };
    attempt.onaudiostart = () => { if (recognition === attempt) status.textContent = feedback[lang][0]; };
    attempt.onresult = event => {
      if (recognition !== attempt) return;
      const alternatives = Array.from(event.results[event.resultIndex] ?? []);
      const selected = alternatives.map(({ transcript }) => normalizedModes.get(
        transcript.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').trim().replace(/[.!?]+$/, '')
      )).find(Boolean);
      if (selected) choose(selected);
      else failed();
    };
    attempt.onerror = failed;
    attempt.onend = failed;
    recognitionTimeout = setTimeout(failed, 15000);
    try { attempt.start(); } catch { failed(); }
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && recognition) {
      stopListening();
      status.textContent = '';
      return;
    }
    const focused = event.target;
    if (!editing || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        focused.closest?.('input, textarea, select, [contenteditable], [role="dialog"], dialog, a, button') ||
        !['1', '2', '3'].includes(event.key)) return;
    event.preventDefault();
    choose(event.key);
  });
  new MutationObserver(() => {
    stopListening();
    stopGreeting();
    status.textContent = '';
    render();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('pagehide', () => {
    stopListening();
    stopGreeting();
  });
  document.addEventListener('dk4:spoken-answer-finished', () => { if (shouldSpeak() && !editing) startQuestion(); });
  search.ownerDocument.addEventListener('dk:guide-state', ({ detail }) => {
    if (detail.state === 'thinking') {
      stopListening();
      stopGreeting();
      status.textContent = '';
    }
  });
  anchor.before(region);
  render();
  if (editing) requestAnimationFrame(() => { if (editing && !mode) speakWelcome(); });
}
