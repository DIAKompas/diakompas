import { mountCommunication, shouldSpeak } from './accessibility.js?v=mic-permission-pr38';
import { assistantCopy } from './copy.js?v=rocketbox-f020';
import { createSpeech } from './speech.js?v=voice-pr38';

const panel = document.querySelector('#dk-dialog-panel');
const search = document.querySelector('#search');
const entry = search.closest('.search');
const clear = panel.querySelector('.dk-dialog-head button');
const log = panel.querySelector('#dk-dialog-log');
const language = () => document.documentElement.lang;
const copy = () => assistantCopy[language()] || assistantCopy.cs;
const motion = matchMedia('(prefers-reduced-motion: reduce)');

const viewKey = 'dk4-accessibility-view';
const labels = {
  cs: ['Pro nevidomé', 'Přejít na běžný web', 'Hlasové prostředí', 'Odpověď DIA Kompasu', 'Zavřít a vrátit se', 'Text je ukončen. Vracím se do původního menu.'],
  sk: ['Pre nevidiacich', 'Prejsť na bežný web', 'Hlasové prostredie', 'Odpoveď DIA Kompasu', 'Zavrieť a vrátiť sa', 'Text je ukončený. Vraciam sa do pôvodnej ponuky.'],
  en: ['For blind visitors', 'Return to standard website', 'Voice experience', 'DIA Kompas answer', 'Close and return', 'The reading has finished. Returning to the previous menu.'],
  hu: ['Vakoknak', 'Vissza a normál weboldalra', 'Hangos felület', 'DIA Kompas válasz', 'Bezárás és visszatérés', 'A felolvasás véget ért. Visszatérek az előző menübe.']
};

function element(tag, className = '') {
  const node = document.createElement(tag);
  node.className = className;
  if (tag === 'button') node.type = 'button';
  return node;
}

const nav = document.querySelector('#nav');
const navToggle = document.querySelector('#hamb');
const homeLink = nav.querySelector('[data-page="home"]');
const diabetesLink = element('a');
diabetesLink.href = '#zacinam';
diabetesLink.dataset.dkStart = '';
homeLink.after(diabetesLink);
const blindLink = element('button');
blindLink.id = 'dk4-blind-navigation';
blindLink.setAttribute('aria-controls', 'dk4-blind-view');
nav.append(blindLink);

const blindView = element('section');
blindView.id = 'dk4-blind-view';
blindView.setAttribute('aria-labelledby', 'dk4-blind-heading');
blindView.hidden = true;
const blindHeading = element('h2');
blindHeading.id = 'dk4-blind-heading';
blindHeading.tabIndex = -1;
const standardButton = element('button');
blindView.append(blindHeading, standardButton);
document.querySelector('header').after(blindView);

const searchSlot = document.createComment('Standard guide position');
entry.before(searchSlot);
const newConversation = element('button', 'dk4-new-conversation');
newConversation.hidden = true;
entry.after(newConversation);
newConversation.addEventListener('click', () => clear.click());

const reader = element('dialog');
reader.id = 'dk4-answer-reader';
reader.setAttribute('aria-labelledby', 'dk4-answer-reader-title');
const readerTitle = element('h2');
readerTitle.id = 'dk4-answer-reader-title';
const readerClose = element('button');
readerClose.autofocus = true;
reader.append(readerTitle, readerClose, panel);
document.body.append(reader);

const readButton = element('button');
const voicePicker = element('select', 'dk4-voices');
const voiceLabel = element('label', 'dk4-voice-label');
const voiceText = element('small', 'dk4-note');
voiceLabel.append(voiceText, voicePicker);
const audioControls = element('div', 'dk4-audio');
const audioStatus = element('span', 'dk4-audio-status');
audioStatus.setAttribute('role', 'status');
audioControls.append(readButton, voiceLabel, audioStatus);
panel.querySelector('.dk-dialog-head').after(audioControls);

let speechState = 'idle';
let currentAnswer = '';
let readingStage = 'idle';
let readerReturnFocus;
const inBlindMode = () => document.documentElement.dataset.dk4View === 'blind';

const speech = createSpeech({
  onState(state) {
    speechState = state;
    if (state === 'error') readingStage = 'idle';
    render();
  },
  onEnd() {
    if (!shouldSpeak()) return;
    if (readingStage === 'answer') {
      readingStage = 'notice';
      speech.read((labels[language()] || labels.cs)[5], language(), voicePicker.value);
    } else if (readingStage === 'notice') {
      closeReader();
    }
  },
  onVoices: updateVoices
});

function stopReading() {
  readingStage = 'idle';
  speech.stop();
}

function closeReader(resume = true) {
  if (!reader.open) return;
  stopReading();
  reader.close();
  restoreReaderFocus();
  if (resume) document.dispatchEvent(new Event('dk4:spoken-answer-finished'));
}

function restoreReaderFocus() {
  const target = readerReturnFocus;
  readerReturnFocus = undefined;
  if (target?.isConnected && target.getClientRects().length) target.focus({ preventScroll: true });
  else if (target && search.getClientRects().length) search.focus({ preventScroll: true });
}

function openReader() {
  if (reader.open) return;
  const trigger = document.activeElement;
  readerReturnFocus = trigger && (trigger === search || entry.contains(trigger) || blindView.contains(trigger))
    ? trigger : search;
  reader.showModal();
  readerClose.focus({ preventScroll: true });
}

function presentView(enabled, persist = true) {
  document.documentElement.dataset.dk4View = enabled ? 'blind' : 'standard';
  if (persist) {
    try { localStorage.setItem(viewKey, enabled ? 'blind' : 'standard'); } catch {}
  }
  closeReader(false);
  blindView.hidden = !enabled;
  blindLink.hidden = enabled;
  if (enabled) blindView.append(entry, newConversation);
  else searchSlot.after(entry, newConversation);
  entry.before(communicationRegion);
  render();
  document.dispatchEvent(new Event('dk4:view-changed'));
}

// Voice choices use the same existing page sections as the visual website.
document.addEventListener('dk4:voice-navigation', ({ detail }) => {
  if (!inBlindMode()) return;
  const target = detail?.section === 'start'
    ? document.getElementById('zacinam') || document.getElementById('dk-start-title')
    : detail?.section === 'topics'
      ? document.getElementById('temata') || document.querySelector('[data-page="topics"], [href="#temata"]')
      : null;
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

blindLink.addEventListener('click', () => {
  nav.classList.remove('open');
  presentView(true);
  blindHeading.focus();
});
function restoreStandardHome() {
  // Reset both legacy subpages and article views before exposing the home guide.
  window.dkShow();
  history.replaceState(history.state, '', '#domu');
  nav.querySelectorAll('.active').forEach(item => item.classList.remove('active'));
  homeLink.classList.add('active');
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

// The existing journey handler then scrolls to the original eight-step section.
window.addEventListener('click', event => {
  if (!diabetesLink.contains(event.target)) return;
  window.dkShow();
  queueMicrotask(() => diabetesLink.classList.add('active'));
}, true);
standardButton.addEventListener('click', () => {
  presentView(false);
  restoreStandardHome();
  (blindLink.getClientRects().length ? blindLink : navToggle).focus({ preventScroll: true });
});
readerClose.addEventListener('click', () => closeReader());
reader.addEventListener('cancel', event => {
  event.preventDefault();
  closeReader();
});
reader.addEventListener('close', () => { if (!reader.open) restoreReaderFocus(); });

function updateVoices() {
  const selected = voicePicker.value;
  voicePicker.replaceChildren(new Option(copy().defaultVoice, ''));
  const voices = speech.voices(language());
  for (const voice of voices) voicePicker.add(new Option(voice.name, voice.voiceURI));
  if (voices.some(voice => voice.voiceURI === selected)) voicePicker.value = selected;
  voiceLabel.hidden = voices.length < 2;
  render();
}

const isSpeaking = () => speechState === 'pending' || speechState === 'speaking';

function render() {
  const t = copy();
  const [blind, standard, viewTitle, answerTitle, closeLabel] = labels[language()] || labels.cs;
  diabetesLink.textContent = document.getElementById('dk-start-title').textContent;
  blindLink.textContent = blind;
  standardButton.textContent = standard;
  blindHeading.textContent = viewTitle;
  readerTitle.textContent = answerTitle;
  readerClose.textContent = closeLabel;
  newConversation.textContent = clear.textContent;
  document.documentElement.classList.toggle('dk4-reduced', motion.matches);
  audioControls.dataset.speechState = speechState;
  audioControls.hidden = !inBlindMode();
  readButton.textContent = isSpeaking() ? t.stop : t.read;
  readButton.disabled = !currentAnswer || !speech.available || !shouldSpeak();
  voiceText.textContent = t.voice;
  const audioMessage = speechState === 'error' ? t.audioError : speech.available ? '' : t.noVoice;
  if (audioStatus.textContent !== audioMessage) audioStatus.textContent = audioMessage;
}

function readAnswer() {
  if (!currentAnswer || !speech.available || !shouldSpeak()) return;
  readingStage = 'answer';
  speech.read(currentAnswer, language(), voicePicker.value);
}

document.addEventListener('dk4:communication-mode', ({ detail }) => {
  if (!detail.voiceEnabled) stopReading();
  render();
});
motion.addEventListener('change', render);
readButton.addEventListener('click', () => {
  if (isSpeaking()) stopReading();
  else readAnswer();
});
voicePicker.addEventListener('change', stopReading);
reader.addEventListener('click', event => {
  if (event.target.closest('a[href]')) stopReading();
}, true);
// Article links may be handled by the existing window capture listener before the reader sees the click.
new MutationObserver(() => {
  if (document.querySelector('#dk-modal-reader[open]') && reader.open && isSpeaking()) stopReading();
}).observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true, childList: true });

panel.addEventListener('dk:guide-state', ({ detail }) => {
  if (detail.state === 'thinking' || detail.state === 'reset') {
    stopReading();
    currentAnswer = '';
  }
  if (detail.state === 'reset') {
    closeReader(false);
    newConversation.hidden = true;
  }
  if (detail.state === 'answered') {
    currentAnswer = [...detail.row.children]
      .filter(node => node.matches('h4, p, ol, ul'))
      .map(node => node.innerText.trim())
      .filter(Boolean).join('\n');
    newConversation.hidden = false;
    openReader();
    log.scrollTop = detail.row.offsetTop - log.offsetTop;
    readAnswer();
  }
  render();
});

new MutationObserver(() => {
  stopReading();
  updateVoices();
}).observe(document.documentElement, { attributeFilter: ['lang'] });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopReading();
});
window.addEventListener('pagehide', stopReading);

const communicationRegion = mountCommunication(entry, search);
let savedView = false;
try { savedView = localStorage.getItem(viewKey) === 'blind'; } catch {}
const requestedView = new URLSearchParams(location.search).get('dk4view');
const explicitView = requestedView === 'blind' || requestedView === 'standard';
if (explicitView) {
  const url = new URL(location.href);
  url.searchParams.delete('dk4view');
  try { history.replaceState(history.state, '', url); } catch {}
}
presentView(explicitView ? requestedView === 'blind' : savedView, explicitView);
if (requestedView === 'standard') restoreStandardHome();
updateVoices();
