/* DIA Kompas conversational DOM smoke test — run in browser console on AUDIT preview only.
   No writes, no network, no personal data. */
(async()=>{
const tests=[];const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const input=document.querySelector('#search'),log=document.querySelector('#dk-dialog-log');
const send=document.querySelector('#searchBtn');
const clear=[...document.querySelectorAll('button')].find(b=>/nový rozhovor|new conversation|nový rozhovor|új beszélgetés/i.test(b.textContent));
function check(name,ok,detail=''){tests.push({name,result:ok?'PASS':'FAIL',detail});}
check('Input exists',!!input);check('Send button exists',!!send);check('Conversation log exists',!!log);check('Reset button exists',!!clear);
if(!input||!send||!log){console.table(tests);return tests;}
async function ask(q){const before=log.children.length;input.value=q;input.dispatchEvent(new Event('input',{bubbles:true}));send.click();await sleep(180);return {before,after:log.children.length,text:log.lastElementChild?.textContent||'',lastUser:[...log.children].at(-2)?.textContent||''};}
const questions=['Co je HbA1c?','A jak se to měří?','A jak často se to kontroluje?','Co je TIR?','Jaký je rozdíl mezi CGM a glukometrem?','Mám vysoký cukr','A co jednotky?','A co jednotky?','Můžu jíst banány?','Kolik inzulinu si mám píchnout?','Mám nízký cukr a třesu se.','Člověk s diabetem je v bezvědomí.'];
for(let i=0;i<questions.length;i++){const q=questions[i],r=await ask(q);check('Turn '+(i+1)+': '+q,r.after>0&&r.lastUser.includes(q)&&r.text.trim().length>10,'messages '+r.before+' -> '+r.after);}
if(clear){clear.click();await sleep(100);check('Reset clears conversation',log.children.length===0,'remaining '+log.children.length);const r=await ask('Co je HbA1c?');check('New conversation accepts input',r.after>0);}
console.table(tests);console.info('DIA Kompas smoke test:',tests.filter(x=>x.result==='PASS').length+'/'+tests.length,'passed');return tests;
})();