import { mountCommunication, shouldSpeak } from './accessibility.js?v=hologram-pr38';
import { assistantCopy } from './copy.js?v=rocketbox-f020';
import { createSpeech } from './speech.js';
import { addLearningModels } from './learning.js?v=hologram-pr38';

const panel = document.querySelector('#dk-dialog-panel');
const search = document.querySelector('#search');
const language = () => document.documentElement.lang;
const copy = () => assistantCopy[language()] || assistantCopy.cs;
const motion = matchMedia('(prefers-reduced-motion: reduce)');

function element(tag, className, text = '') {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

const shell = element('section', 'dk4-assistant');
const visual = element('div', 'dk4-visual');
visual.setAttribute('aria-hidden', 'true');
const portrait = element('img', 'dk4-portrait');
portrait.alt = '';
portrait.width = portrait.height = 160;
portrait.loading = 'lazy';
portrait.src = new URL('./hologram.svg?v=hologram-pr38', import.meta.url);
const controls = element('div', 'dk4-controls');
const title = element('h2', 'dk4-title');
title.id = 'dk4-title';
shell.setAttribute('aria-labelledby', title.id);
const status = element('p', 'dk4-status');
const readButton = element('button', '');
const voicePicker = element('select', 'dk4-voices');
const voiceLabel = element('label', 'dk4-voice-label');
const voiceText = element('small', 'dk4-note');
readButton.type = 'button';
voiceLabel.append(voiceText, voicePicker);
visual.append(portrait);
// The 3D presentation is automatic; no visual mode switches are shown.
controls.append(title, status);
shell.append(visual, controls);
search.closest('.search').before(shell);

const audioControls = element('div', 'dk4-audio');
const audioStatus = element('span', 'dk4-audio-status');
audioStatus.setAttribute('role', 'status');
audioControls.append(readButton, voiceLabel, audioStatus);
const dialogHead = panel.querySelector('.dk-dialog-head');
dialogHead.after(audioControls);

let guideState = 'idle';
let speechState = 'idle';
let currentAnswer = '';
let viewer;
let failed = false;
let loading = false;
let offscreen = false;
let reduced = motion.matches;

const speech = createSpeech({
  onState(state) {
    speechState = state;
    render();
  },
  onVoices: updateVoices
});

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
  title.textContent = t.title;
  status.textContent = t[guideState];
  shell.dataset.guideState = guideState;
  shell.dataset.display = failed ? 'fallback' : viewer ? '3d' : '2d';
  visual.classList.toggle('dk4-expanded', Boolean(viewer));
  portrait.hidden = Boolean(viewer);
  document.documentElement.classList.toggle('dk4-reduced', reduced);
  audioControls.dataset.speechState = speechState;
  readButton.textContent = isSpeaking() ? t.stop : t.read;
  readButton.disabled = !currentAnswer || !speech.available;
  voiceText.textContent = t.voice;
  const audioMessage = speechState === 'error' ? t.audioError : speechState === 'speaking' ? t.approximate : speech.available ? '' : t.noVoice;
  if (audioStatus.textContent !== audioMessage) audioStatus.textContent = audioMessage;
  viewer?.setReduced(reduced);
  viewer?.setVisible(true);
  viewer?.setPaused(offscreen || document.hidden);
}

function fallBack() {
  viewer?.dispose();
  viewer = undefined;
  failed = true;
  loading = false;
  render();
}

async function initializeAvatar() {
  if (viewer || loading || failed) return;
  loading = true;
  render();
  try {
    const { mountAvatar } = await import('./engine.js?v=hologram-pr38');
    viewer = await mountAvatar(visual, fallBack);
    loading = false;
    render();
  } catch {
    fallBack();
  }
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
  guideState = detail.state === 'reset' ? 'idle' : detail.state;
  if (detail.state === 'thinking' || detail.state === 'reset') {
    speech.stop();
    currentAnswer = '';
  }
  if (detail.state === 'answered') {
    currentAnswer = answerText(detail.row);
    // The user's submitted question is the interaction that requests spoken feedback.
    // Browser autoplay policies and missing local voices can still prevent playback.
    if (speech.available && shouldSpeak()) speech.read(currentAnswer, language(), voicePicker.value);
  }
  render();
});

new MutationObserver(() => {
  speech.stop();
  updateVoices();
}).observe(document.documentElement, { attributeFilter: ['lang'] });

const observer = new IntersectionObserver(([entry]) => {
  offscreen = !entry.isIntersecting;
  viewer?.setPaused(offscreen || document.hidden);
});
observer.observe(shell);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) speech.stop();
  viewer?.setPaused(offscreen || document.hidden);
});
window.addEventListener('pagehide', () => {
  speech.stop();
  viewer?.setPaused(true);
});
window.addEventListener('pageshow', render);
updateVoices();
mountCommunication(shell, search);
// Load 3D on entry, while keeping the matching 2D outline as a WebGL fallback.
initializeAvatar();
addLearningModels(copy, element);
