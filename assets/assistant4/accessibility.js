// Accessible, user-controlled communication preference. No health status is inferred.
const translations = {
 cs: {welcome:'Vítejte na DIA Kompasu. Vyberte způsob komunikace. Řekněte nebo stiskněte jedna pro hlasového průvodce, dva pro běžné ovládání, tři pro hlas i text.',title:'Jak chcete DIA Kompas používat?',one:'1 – Hlasový průvodce',two:'2 – Běžné ovládání',three:'3 – Hlas i text',start:'Přehrát hlasové přivítání',listen:'Odpovědět hlasem',change:'Změnit způsob komunikace',stop:'Vypnout hlas',enable:'Zapnout hlas',note:'Mikrofon se aktivuje pouze po vašem souhlasu. Pokud hlas není dostupný, použijte klávesnici nebo odečítač obrazovky.'},
 sk: {welcome:'Vitajte na DIA Kompase. Vyberte spôsob komunikácie. Povedzte alebo stlačte jedna pre hlasového sprievodcu, dva pre bežné ovládanie, tri pre hlas aj text.',title:'Ako chcete DIA Kompas používať?',one:'1 – Hlasový sprievodca',two:'2 – Bežné ovládanie',three:'3 – Hlas aj text',start:'Prehrať hlasové privítanie',listen:'Odpovedať hlasom',change:'Zmeniť spôsob komunikácie',stop:'Vypnúť hlas',enable:'Zapnúť hlas',note:'Mikrofón sa aktivuje iba s vaším súhlasom. Môžete použiť aj klávesnicu alebo čítačku obrazovky.'},
 en: {welcome:'Welcome to DIA Kompas. Choose how to communicate. Say or press one for a voice guide, two for standard controls, three for voice and text.',title:'How would you like to use DIA Kompas?',one:'1 – Voice guide',two:'2 – Standard controls',three:'3 – Voice and text',start:'Play spoken welcome',listen:'Choose by voice',change:'Change communication mode',stop:'Turn voice off',enable:'Turn voice on',note:'The microphone is used only with your permission. You can also use the keyboard or a screen reader.'},
 hu: {welcome:'Üdvözöljük a DIA Kompas oldalon. Válasszon kommunikációs módot. Mondja vagy nyomja meg az egyest a hangos útmutatóhoz, a kettest a hagyományos módhoz, a hármast a hanghoz és szöveghez.',title:'Hogyan szeretné használni a DIA Kompast?',one:'1 – Hangos útmutató',two:'2 – Hagyományos vezérlés',three:'3 – Hang és szöveg',start:'Hangos üdvözlés',listen:'Hangos választás',change:'Kommunikációs mód módosítása',stop:'Hang kikapcsolása',enable:'Hang bekapcsolása',note:'A mikrofont csak engedéllyel használjuk. Billentyűzet és képernyőolvasó is használható.'}
};
const codes={cs:'cs-CZ',sk:'sk-SK',en:'en-GB',hu:'hu-HU'};
const lang=()=>document.documentElement.lang in translations?document.documentElement.lang:'cs';
const t=()=>translations[lang()];
const key='dk4-communication-mode';
let stored=null;
try{stored=localStorage.getItem(key)}catch{}
let mode=['1','2','3'].includes(stored)?stored:null;
let recognition=null;
const dialog=document.createElement('section');
dialog.id='dk4-accessibility';
dialog.setAttribute('aria-labelledby','dk4-accessibility-title');
dialog.style.cssText='position:relative;z-index:4;max-width:42rem;margin:1rem auto;padding:1rem;border:1px solid #75b4ce;border-radius:1rem;background:var(--card-bg,#f4fcff);color:var(--text-color,#173b4d)';
dialog.innerHTML='<h2 id="dk4-accessibility-title"></h2><p id="dk4-accessibility-note"></p><div id="dk4-accessibility-choices" role="group" aria-label="Communication modes"></div><div id="dk4-accessibility-actions"></div><p id="dk4-accessibility-status" role="status" aria-live="polite"></p>';
const heading=dialog.querySelector('h2'),note=dialog.querySelector('#dk4-accessibility-note'),choices=dialog.querySelector('#dk4-accessibility-choices'),actions=dialog.querySelector('#dk4-accessibility-actions'),status=dialog.querySelector('#dk4-accessibility-status');
const voiceToggle=document.createElement('button');voiceToggle.type='button';voiceToggle.id='dk4-voice-toggle';
voiceToggle.style.cssText='margin:.3rem;padding:.55rem .9rem;min-height:44px';
const welcomeButton=document.createElement('button');welcomeButton.type='button';welcomeButton.style.cssText=voiceToggle.style.cssText;
const listenButton=document.createElement('button');listenButton.type='button';listenButton.style.cssText=voiceToggle.style.cssText;
const changeButton=document.createElement('button');changeButton.type='button';changeButton.style.cssText=voiceToggle.style.cssText;
const voiceEnabled=()=>mode!=='2';
const persist=()=>{try{localStorage.setItem(key,mode)}catch{}};
function speak(text){if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return false;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=codes[lang()];window.speechSynthesis.speak(u);return true}
function choose(value){mode=value;persist();recognition?.stop();recognition=null;if(!voiceEnabled())window.speechSynthesis?.cancel();document.dispatchEvent(new CustomEvent('dk4:communication-mode',{detail:{mode,voiceEnabled:voiceEnabled()}}));render();if(voiceEnabled())speak(t().title)}
function render(){
 const x=t();heading.textContent=x.title;note.textContent=x.note;choices.replaceChildren();
 for(const [value,label] of [['1',x.one],['2',x.two],['3',x.three]]){
  const button=document.createElement('button');button.type='button';button.textContent=label;button.style.cssText='display:block;width:100%;text-align:left;margin:.35rem 0;padding:.65rem;min-height:44px';button.setAttribute('aria-pressed',String(mode===value));button.addEventListener('click',()=>choose(value));choices.append(button);
 }
 choices.hidden=Boolean(mode);heading.hidden=Boolean(mode);note.hidden=Boolean(mode);
 voiceToggle.textContent=voiceEnabled()?x.stop:x.enable;welcomeButton.textContent=x.start;listenButton.textContent=x.listen;changeButton.textContent=x.change;
 welcomeButton.hidden=Boolean(mode);listenButton.hidden=Boolean(mode);changeButton.hidden=!mode;
 actions.replaceChildren(voiceToggle,welcomeButton,listenButton,changeButton);
}
voiceToggle.addEventListener('click',()=>choose(voiceEnabled()?'2':'3'));
welcomeButton.addEventListener('click',()=>{if(!speak(t().welcome))status.textContent=t().note});
changeButton.addEventListener('click',()=>{mode=null;render();heading.focus()});
listenButton.addEventListener('click',()=>{
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Recognition){status.textContent=t().note;return}
 recognition=new Recognition();recognition.lang=codes[lang()];recognition.interimResults=false;
 recognition.onresult=event=>{const result=event.results[0][0].transcript.toLowerCase().trim();const groups=[/^(1|one|jedna|jeden|egy|hlasov|hangos|voice)/,/^(2|two|dva|dve|kettő|standard|běžn|bežn|hagyományos)/,/^(3|three|tri|tři|három|kombin|combined|text)/];const selected=groups.findIndex(re=>re.test(result));if(selected>=0)choose(String(selected+1));else status.textContent=t().note};
 recognition.onerror=()=>{status.textContent=t().note};recognition.start();
});
document.addEventListener('keydown',event=>{if(mode||event.altKey||event.ctrlKey||event.metaKey||event.target?.closest?.('input,textarea,select,button,[contenteditable]'))return;if(['1','2','3'].includes(event.key)){event.preventDefault();choose(event.key)}});
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
const target=document.querySelector('.dk4-assistant')||document.querySelector('#search');
target?.parentNode?.insertBefore(dialog,target);
render();
document.dispatchEvent(new CustomEvent('dk4:communication-mode',{detail:{mode,voiceEnabled:voiceEnabled()}}));
// Browsers generally block sound before a user gesture. Attempt welcome once, and always expose a usable play button.
if(!mode)requestAnimationFrame(()=>speak(t().welcome));
export const shouldSpeak=()=>voiceEnabled();
