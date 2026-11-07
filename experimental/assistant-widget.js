/* DIA Kompas experimental assistant. Local, source-linked educational answers.
   This is NOT a generative AI backend. No questions are transmitted or stored. */
(()=>{'use strict';
if(document.getElementById('dk-assistant-launcher'))return;
const translations={
cs:{launch:'Zeptejte se DIA Kompasu',title:'DIA Kompas – průvodce',hello:'Dobrý den! Zeptejte se na diabetes, HbA1c, senzory nebo glykémii. Odpovídám z dostupných vzdělávacích podkladů.',placeholder:'Napište otázku…',send:'Odeslat',close:'Zavřít chat',reset:'Nový rozhovor',fallback:'K tomuto dotazu zatím nemám ověřenou odpověď. Zkuste se zeptat na glykémii, HbA1c nebo senzory.',units:'Glykémie se obvykle udává v mmol/l (někde v mg/dl). HbA1c se vyjadřuje v mmol/mol nebo v procentech. Jde o různé veličiny.',high:'Vysoký cukr znamená zvýšenou hladinu glukózy v krvi – hyperglykémii.',low:'Nízký cukr znamená hypoglykémii. Pokud je člověk v bezvědomí nebo nemůže bezpečně polykat, volejte záchrannou službu a nic nepodávejte ústy.',hba:'HbA1c neboli glykovaný hemoglobin poskytuje informaci o dlouhodobější hladině glukózy v krvi.',cgm:'CGM je senzor pro průběžné sledování glukózy. Měří glukózu v mezibuněčné tekutině, nikoli přímo v krvi.',personal:'Nemohu posoudit vaše individuální výsledky ani doporučit dávkování. Obraťte se na svého zdravotníka.',urgent:'Při bezvědomí, vážných potížích s dýcháním nebo jiném akutním ohrožení volejte záchrannou službu.',source:'Více informací',note:'Obecné vzdělávání, nikoli diagnóza nebo léčebné doporučení.'},
sk:{launch:'Opýtajte sa DIA Kompasu',title:'DIA Kompas – sprievodca',hello:'Dobrý deň! Opýtajte sa na diabetes, HbA1c, senzory alebo glykémiu.',placeholder:'Napíšte otázku…',send:'Odoslať',close:'Zavrieť chat',reset:'Nový rozhovor',fallback:'Zatiaľ nemám overenú odpoveď. Skúste otázku o glykémii, HbA1c alebo senzoroch.',units:'Glykémia sa zvyčajne udáva v mmol/l (niekde v mg/dl), HbA1c v mmol/mol alebo percentách.',high:'Vysoký cukor znamená zvýšenú hladinu glukózy v krvi – hyperglykémiu.',low:'Nízky cukor znamená hypoglykémiu. Pri bezvedomí alebo nemožnosti bezpečne prehĺtať volajte záchrannú službu; nič nepodávajte ústami.',hba:'HbA1c (glykovaný hemoglobín) informuje o dlhodobejšej hladine glukózy.',cgm:'CGM je senzor na priebežné sledovanie glukózy v medzibunkovej tekutine.',personal:'Nemôžem hodnotiť individuálne výsledky ani odporúčať dávky liekov. Kontaktujte zdravotníka.',urgent:'Pri bezvedomí, vážnych ťažkostiach s dýchaním alebo inom akútnom ohrození volajte záchrannú službu.',source:'Viac informácií',note:'Všeobecné vzdelávanie, nie diagnóza ani liečba.'},
en:{launch:'Ask DIA Kompas',title:'DIA Kompas – guide',hello:'Hello! Ask about diabetes, HbA1c, glucose or sensors.',placeholder:'Type a question…',send:'Send',close:'Close chat',reset:'New conversation',fallback:'I do not have a verified answer yet. Try asking about glucose, HbA1c or sensors.',units:'Blood glucose is commonly reported in mmol/L (or mg/dL). HbA1c is reported in mmol/mol or percent.',high:'High blood sugar is an elevated blood glucose level, called hyperglycaemia.',low:'Low blood sugar is hypoglycaemia. If someone is unconscious or cannot swallow safely, call emergency services; give nothing by mouth.',hba:'HbA1c (glycated haemoglobin) reflects longer-term blood glucose levels.',cgm:'CGM is a sensor that continuously monitors glucose in interstitial fluid.',personal:'I cannot interpret your personal results or recommend medication doses. Contact your healthcare team.',urgent:'For unconsciousness, severe breathing problems or other emergencies, call emergency services.',source:'Learn more',note:'General education, not diagnosis or treatment advice.'},
hu:{launch:'Kérdezze a DIA Kompast',title:'DIA Kompas – útmutató',hello:'Üdvözlöm! Kérdezzen a cukorbetegségről, HbA1c-ről, vércukorról vagy szenzorokról.',placeholder:'Írja be kérdését…',send:'Küldés',close:'Chat bezárása',reset:'Új beszélgetés',fallback:'Erre még nincs ellenőrzött válaszom. Kérdezzen a vércukorról, HbA1c-ről vagy szenzorokról.',units:'A vércukrot általában mmol/l-ben (vagy mg/dl-ben), a HbA1c-t mmol/mol-ban vagy százalékban adják meg.',high:'A magas vércukorszint neve hiperglikémia.',low:'Az alacsony vércukorszint neve hipoglikémia. Eszméletlenség vagy nyelési képtelenség esetén hívjon sürgősségi segítséget, és ne adjon semmit szájon át.',hba:'A HbA1c a hosszabb távú vércukorszintre utal.',cgm:'A CGM a szövetközi folyadék glükózszintjét folyamatosan mérő szenzor.',personal:'Nem értékelhetek egyéni eredményeket vagy gyógyszeradagokat. Forduljon egészségügyi szakemberhez.',urgent:'Eszméletlenség vagy súlyos légzési nehézség esetén hívjon sürgősségi segítséget.',source:'További információ',note:'Általános tájékoztatás, nem diagnózis vagy kezelés.'}};
const language=()=>translations[document.documentElement.lang]?document.documentElement.lang:'cs';
const t=()=>translations[language()];
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const styles=document.createElement('style');styles.textContent=`
#dk-assistant-launcher{position:fixed;right:18px;bottom:18px;z-index:9998;border:0;border-radius:99px;background:#086ca5;color:#fff;padding:13px 19px;font:600 14px system-ui;box-shadow:0 5px 22px #123b5a44;cursor:pointer}
#dk-assistant-panel{position:fixed;right:18px;bottom:78px;z-index:9999;width:min(390px,calc(100vw - 24px));height:min(560px,calc(100dvh - 110px));background:#fff;color:#153e5b;border:1px solid #bcd9e9;border-radius:16px;box-shadow:0 14px 45px #123b5a44;display:flex;flex-direction:column;overflow:hidden;font:14px/1.5 system-ui}
#dk-assistant-panel[hidden]{display:none!important}
#dk-assistant-panel header{position:static!important;display:flex;align-items:center;justify-content:space-between;background:#eaf5fb;padding:12px 14px;min-height:auto;box-shadow:none}
#dk-assistant-panel button{cursor:pointer}
#dk-assistant-panel header button{background:transparent;border:0;color:#153e5b;font-size:19px}
#dk-assistant-log{flex:1;overflow:auto;padding:14px;overscroll-behavior:contain}
.dk-assistant-bubble{padding:10px 12px;margin:0 0 12px;border-radius:12px;background:#eef6fa;white-space:pre-wrap;overflow-wrap:anywhere}
.dk-assistant-bubble.user{background:#dceefb;margin-left:35px}
.dk-assistant-bubble a{display:block;margin-top:7px;color:#075e9c}
#dk-assistant-form{display:flex;gap:7px;padding:10px;border-top:1px solid #d6e6ef}
#dk-assistant-question{min-width:0;flex:1;padding:11px;border:1px solid #bdd5e5;border-radius:9px;font:inherit}
#dk-assistant-form button{border:0;border-radius:9px;background:#086ca5;color:white;padding:9px 12px;font:inherit}
#dk-assistant-note{font-size:11px;color:#536c7c;padding:0 12px 9px;margin:0}
@media(max-width:540px){#dk-assistant-panel{inset:8px 8px 74px;width:auto;height:auto;border-radius:12px}#dk-assistant-launcher{right:12px;bottom:12px}}
`;document.head.append(styles);
const launcher=document.createElement('button');launcher.id='dk-assistant-launcher';launcher.type='button';launcher.setAttribute('aria-expanded','false');
const panel=document.createElement('section');panel.id='dk-assistant-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');
const head=document.createElement('header'),heading=document.createElement('strong'),controls=document.createElement('span');
const reset=document.createElement('button'),close=document.createElement('button');reset.type=close.type='button';reset.textContent='↺';close.textContent='×';controls.append(reset,close);head.append(heading,controls);
const log=document.createElement('div');log.id='dk-assistant-log';log.setAttribute('role','log');log.setAttribute('aria-live','polite');
const form=document.createElement('form');form.id='dk-assistant-form';const input=document.createElement('input');input.id='dk-assistant-question';input.maxLength=500;input.autocomplete='off';const send=document.createElement('button');send.type='submit';form.append(input,send);
const note=document.createElement('p');note.id='dk-assistant-note';panel.append(head,log,form,note);document.body.append(launcher,panel);
let context=null;
function bubble(text,role,url){const p=document.createElement('div');p.className='dk-assistant-bubble'+(role==='user'?' user':'');p.append(document.createTextNode(text));if(url){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=t().source;p.append(a)}log.append(p);while(log.children.length>30)log.firstChild.remove();log.scrollTop=log.scrollHeight;}
function resetChat(){context=null;log.replaceChildren();bubble(t().hello);input.value='';}
function refresh(){launcher.textContent='☏ '+t().launch;heading.textContent=t().title;reset.title=reset.getAttribute('aria-label')=t().reset;close.title=close.getAttribute('aria-label')=t().close;input.placeholder=t().placeholder;input.setAttribute('aria-label',t().placeholder);send.textContent=t().send;note.textContent=t().note;}
function openChat(){refresh();panel.hidden=false;launcher.setAttribute('aria-expanded','true');if(!log.children.length)resetChat();input.focus();}
function closeChat(){panel.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus();}
launcher.onclick=()=>panel.hidden?openChat():closeChat();close.onclick=closeChat;reset.onclick=resetChat;
panel.addEventListener('keydown',e=>{if(e.key==='Escape')closeChat();});
function respond(question){
const n=norm(question),concepts=window.DiaKompasTerminology?.matchConcept(question,language())||[];
const emergency=/(bezvedom|bez vedom|unconscious|not breathing|cannot breathe|nemohu dychat|nemuzu dychat|eszmeletlen|nem kap levegot)/.test(n);
if(emergency)return [t().urgent,null];
const personal=/(kolik|how much|menny|ako|jak).*(inzulin|insulin|davk|dose|adag)/.test(n)||(/\d+[,.]?\d*\s*(mmol|mg\/dl|mmol\/mol)/.test(n)&&/(mam|moje|muj|my|nekem)/.test(n));
if(personal)return [t().personal,null];
const units=/(jednot|units?|egyse|mmol|mg\/dl)/.test(n);
if(units){return [t().units,'https://diakompas.github.io/diakompas/'+language()+'/clanky/hba1c-vysledky/'];}
let key=null;
if(concepts.includes('hypoglycemia')||/(nizk|low|alacsony).*(cukr|cukor|sugar|vercuk)/.test(n))key='low';
else if(concepts.includes('hyperglycemia')||/(vysok|high|magas).*(cukr|cukor|sugar|vercuk)/.test(n))key='high';
else if(concepts.includes('hba1c')||/hba1c|glykovan|glycated/.test(n))key='hba';
else if(concepts.includes('cgm')||/cgm|senzor|sensor|szenzor|glukometr/.test(n))key='cgm';
else if(context&&/^(a co|a jak|and what|what about|ako|hogyan|es mi|a jednot)/.test(n))key=context;
if(!key)return [t().fallback,null];
context=key;
const articles={hba:'hba1c-vysledky',cgm:'cgm',high:'diabetes-typy',low:'diabetes-typy'};
const source=key==='low'?'https://www.nhs.uk/conditions/low-blood-sugar-hypoglycaemia/':key==='high'?'https://www.nhs.uk/conditions/high-blood-sugar-hyperglycaemia/':'https://diakompas.github.io/diakompas/'+language()+'/clanky/'+articles[key]+'/';
return [t()[key],source];
}
form.onsubmit=e=>{e.preventDefault();const q=input.value.trim();if(!q)return;input.value='';bubble(q,'user');const [answer,url]=respond(q);bubble(answer,'assistant',url);input.focus();};
const observer=new MutationObserver(()=>refresh());observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});refresh();
})();