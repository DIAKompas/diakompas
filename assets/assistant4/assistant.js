import { mountCommunication, shouldSpeak } from './accessibility.js?v=voice-opt-out-pr38';
import { assistantCopy } from './copy.js?v=rocketbox-f020';
import { createSpeech } from './speech.js?v=voice-pr38';
import { addLearningModels } from './learning.js?v=hologram-pr38';

const panel = document.querySelector('#dk-dialog-panel');
const search = document.querySelector('#search');
const language = () => document.documentElement.lang;
const copy = () => assistantCopy[language()] || assistantCopy.cs;
const motion = matchMedia('(prefers-reduced-motion: reduce)');

const blindModeKey = 'dk4-accessibility-view';
const blindCopy = {
  cs: ['Pro nevidomé','Přejít na běžný web','Hlasové prostředí'],
  sk: ['Pre nevidiacich','Prejsť na bežný web','Hlasové prostredie'],
  en: ['For blind visitors','Return to standard website','Voice experience'],
  hu: ['Vakoknak','Vissza a normál weboldalra','Hangos felület']
};
const blindView = document.createElement('section');
blindView.id = 'dk4-blind-view';
blindView.setAttribute('aria-label','Hlasové prostředí');
blindView.style.cssText = 'max-width:850px;margin:16px auto;padding:18px;border:2px solid #155471;border-radius:14px;background:#f2f9fc';
const blindHeading = document.createElement('h2');
const standardButton = document.createElement('button');
standardButton.type = 'button';
standardButton.style.cssText = 'min-height:48px;padding:8px 14px;border:2px solid #155471;border-radius:8px;background:white;color:#17384c;font:inherit';
blindView.append(blindHeading,standardButton);
const blindLink = document.createElement('button');
blindLink.type = 'button';
blindLink.id = 'dk4-blind-navigation';
blindLink.style.cssText = 'min-height:44px;margin:6px;padding:8px 12px;border:2px solid currentColor;border-radius:8px;background:white;color:#17384c;font:inherit';
const navTarget = document.querySelector('header nav, nav[aria-label], header') || document.body;
navTarget.append(blindLink);
document.querySelector('main')?.prepend(blindView);
if (!blindView.isConnected) document.body.prepend(blindView);
const communicationAnchor = search.closest('.search');
const savedBlindView = (() => { try { return localStorage.getItem(blindModeKey) === 'blind'; } catch { return false; } })();
function setBlindView(enabled, persist = true) {
  document.documentElement.dataset.dk4View = enabled ? 'blind' : 'standard';
  if (persist) { try { localStorage.setItem(blindModeKey, enabled ? 'blind' : 'standard'); } catch {} }
  const labels = blindCopy[language()] || blindCopy.cs;
  blindLink.textContent = labels[0];
  standardButton.textContent = labels[1];
  blindHeading.textContent = labels[2];
  blindView.hidden = !enabled;
  blindLink.hidden = enabled;
  if (communicationAnchor) blindView.append(communicationAnchor);
  if (!enabled && communicationAnchor && communicationAnchor.parentElement === blindView) {
    // The standard guide is restored to its original location below the voice section.
    blindView.after(communicationAnchor);
  }
  document.dispatchEvent(new Event('dk4:view-changed'));
}
blindLink.addEventListener('click', () => { setBlindView(true); blindHeading.focus(); });
standardButton.addEventListener('click', () => { setBlindView(false); blindLink.focus(); });
blindHeading.tabIndex = -1;
setBlindView(savedBlindView, false);


function element(tag, className, text = '') {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

const readButton = element('button', '');
const voicePicker = element('select', 'dk4-voices');
const voiceLabel = element('label', 'dk4-voice-label');
const voiceText = element('small', 'dk4-note');
readButton.type = 'button';
voiceLabel.append(voiceText, voicePicker);
const audioControls = element('div', 'dk4-audio');
const audioStatus = element('span', 'dk4-audio-status');
audioStatus.setAttribute('role', 'status');
audioControls.append(readButton, voiceLabel, audioStatus);
const dialogHead = panel.querySelector('.dk-dialog-head');
dialogHead.after(audioControls);

let speechState = 'idle';
let currentAnswer = '';
let readingStage = 'idle';
const finishedNotice = {cs:'Text je ukončen. Vracím se do původního menu.',sk:'Text je ukončený. Vraciam sa do pôvodnej ponuky.',en:'The reading has finished. Returning to the previous menu.',hu:'A felolvasás véget ért. Visszatérek az előző menübe.'};
let reduced = motion.matches;

const speech = createSpeech({
  onState(state) {
    speechState = state;
    render();
    if (state === 'error' && readingStage !== 'idle') continueConversation();
  },
  onEnd() {
    if (!shouldSpeak()) { readingStage = 'idle'; return; }
    if (readingStage === 'answer') {
      readingStage = 'notice';
      speech.read(finishedNotice[language()] || finishedNotice.cs, language(), voicePicker.value);
    } else if (readingStage === 'notice') {
      continueConversation();
    }
  },
  onVoices: updateVoices
});

function continueConversation() {
  readingStage = 'idle';
  document.dispatchEvent(new Event('dk4:spoken-answer-finished'));
}

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
  document.documentElement.classList.toggle('dk4-reduced', reduced);
  audioControls.dataset.speechState = speechState;
  readButton.textContent = isSpeaking() ? t.stop : t.read;
  readButton.disabled = !currentAnswer || !speech.available;
  voiceText.textContent = t.voice;
  const audioMessage = speechState === 'error' ? t.audioError : speech.available ? '' : t.noVoice;
  if (audioStatus.textContent !== audioMessage) audioStatus.textContent = audioMessage;
}

document.addEventListener('dk4:communication-mode', ({detail}) => {
  if (!detail.voiceEnabled) speech.stop();
  render();
});
motion.addEventListener('change', () => {
  reduced = motion.matches;
  render();
});
readButton.addEventListener('click', () => {
  if (isSpeaking()) speech.stop();
  else if (currentAnswer) speech.read(currentAnswer, language(), voicePicker.value);
});
voicePicker.addEventListener('change', () => speech.stop());

function answerText(row) {
  return [...row.children]
    .filter(node => node.matches('h4, p, ol, ul'))
    .map(node => node.innerText.trim())
    .filter(Boolean).join('\n');
}

panel.addEventListener('dk:guide-state', ({ detail }) => {
  if (detail.state === 'thinking' || detail.state === 'reset') {
    readingStage = 'idle';
    speech.stop();
    currentAnswer = '';
  }
  if (detail.state === 'answered') {
    currentAnswer = answerText(detail.row);
    // The user's submitted question is the interaction that requests spoken feedback.
    // Browser autoplay policies and missing local voices can still prevent playback.
    if (speech.available && shouldSpeak()) {
      readingStage = 'answer';
      speech.read(currentAnswer, language(), voicePicker.value);
    } else {
      continueConversation();
    }
  }
  render();
});

new MutationObserver(() => {
  speech.stop();
  updateVoices();
}).observe(document.documentElement, { attributeFilter: ['lang'] });

document.addEventListener('visibilitychange', () => {
  if (document.hidden) speech.stop();
});
window.addEventListener('pagehide', () => speech.stop());
window.addEventListener('pageshow', render);
updateVoices();
mountCommunication(search.closest('.search'), search);
document.dispatchEvent(new Event('dk4:view-changed'));
// Removed the unsolicited learning-model block from the home page.
