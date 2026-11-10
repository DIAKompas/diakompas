/* Actual Chromium E2E: original 48 conversations x two exact viewports.
 * No jsdom, mocked DOM, direct answer() calls or clinicalGuard replicas.
 * Replaces the earlier smoke run because it lacked independent conversations,
 * repeated HbA1c follow-up, content assertions and scroll geometry checks.
 */
const {chromium}=require('playwright');
const {spawn,execFileSync}=require('child_process');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'audit-output');
fs.mkdirSync(out,{recursive:true});
const origin='http://127.0.0.1:8765/';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const questions={
cs:['Jak alkohol ovlivňuje cukr?','A co když mám cukrovku 2?','Mám vysoký cukr','A co jednotky?','Co mám dělat?','Co je HbA1c?','Jak se to měří?','Jak často?','Jak často?','Jaký je rozdíl mezi diabetem 1. a 2. typu?','Jaký je rozdíl mezi CGM a glukometrem?','Co je TIR?','Mám nízký cukr a třesu se.','Člověk s diabetem je v bezvědomí.','Mám vysoký cukr, zvracím a bolí mě břicho.','Kolik inzulinu si mám píchnout?','Můžu vysadit metformin?','Jak THC ovlivňuje diabetes?'],
sk:['Ako alkohol ovplyvňuje cukor?','A čo keď mám cukrovku 2?','Mám vysoký cukor','A čo jednotky?','Čo mám robiť?','Čo je HbA1c?','Ako sa to meria?','Ako často?','Ako často?','Aký je rozdiel medzi diabetom 1. a 2. typu?','Aký je rozdiel medzi CGM a glukomerom?','Čo je TIR?','Mám nízky cukor a trasiem sa.','Človek s diabetom je v bezvedomí.','Mám vysoký cukor, vraciam a bolí ma brucho.','Koľko inzulínu si mám pichnúť?','Môžem vysadiť metformín?','Ako THC ovplyvňuje diabetes?'],
en:['How does alcohol affect blood sugar?','What if I have type 2 diabetes?','I have high blood sugar','What about units?','What should I do?','What is HbA1c?','How is it measured?','How often?','How often?','What is the difference between type 1 and type 2 diabetes?','What is the difference between CGM and a glucose meter?','What is TIR?','I have low blood sugar and I am shaking.','A person with diabetes is unconscious.','I have high blood sugar, vomiting and abdominal pain.','How much insulin should I inject?','Can I stop taking metformin?','How does THC affect diabetes?'],
hu:['Hogyan hat az alkohol a vércukorra?','És ha 2-es típusú cukorbetegségem van?','Magas a vércukrom','És a mértékegységek?','Mit tegyek?','Mi az a HbA1c?','Hogyan mérik?','Milyen gyakran?','Milyen gyakran?','Mi a különbség az 1-es és a 2-es típusú cukorbetegség között?','Mi a különbség a CGM és a vércukormérő között?','Mi az a TIR?','Alacsony a vércukrom és remegek.','Egy cukorbeteg ember eszméletlen.','Magas a vércukrom, hányok és fáj a hasam.','Mennyi inzulint adjak be?','Abbahagyhatom a metformint?','Hogyan hat a THC a cukorbetegségre?']};
const conversations=[['C01',[0,1]],['C02',[2,3,4]],['C03',[5,6,7,8]],...Array.from({length:9},(_,i)=>['C'+String(i+4).padStart(2,'0'),[i+9]])];
const norm=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
const expected=[/alcohol|alkohol/,/(alcohol|alkohol).*(hypogly|hipogli)/s,/hypergly|hipergli/,/mmol\/l.*mg\/dl/is,/keton/,/hba1c/,/labor|blood sample|vermin/,/hba1c.*(tri mes|three month|haromhav|dvakrat|twice)/s,/hba1c.*(tri mes|three month|haromhav|dvakrat|twice)/s,/1.*(autoimmun|autoimun|immun|imunit|nem termel|does not produce|produces little)/s,/cgm.*(krv|blood|ver|glukometr|glukomer|meter)/s,/tir.*(rozme|range|tartom)/s,/15.*(sacharid|carbohyd|szenhidrat)|(?:sacharid|carbohyd|szenhidrat).*15/s,/(155|112).*(ust|mouth|szaj)/s,/keto|neodklad|emergency|surgos/,/nelze|nemozno|cannot|nem tud/,/nevys|do not stop|ne hagyja/,/thc|cannabis|konop|kannab/];
const views={desktop:{width:1440,height:900},mobile:{width:393,height:873}};
const results=[],auxiliary=[],metadata={started:new Date().toISOString(),commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()};
let browser;
async function geometry(page){return page.evaluate(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};};return {width:innerWidth,height:innerHeight,visualHeight:visualViewport.height,header:rect('header'),panel:rect('#dk-dialog-panel'),input:rect('#search'),reset:rect('.dk-dialog-head button'),log:rect('#dk-dialog-log'),answer:rect('#dk-dialog-log .assistant:last-child'),overflow:document.documentElement.scrollWidth-innerWidth};});}
async function main(){
 let ready=false;for(let i=0;i<40;i++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}if(!ready)throw Error('Local server unavailable');
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});metadata.browser=browser.version();
 for(const [view,viewport]of Object.entries(views))for(const [lang,qs]of Object.entries(questions)){
  const context=await browser.newContext({viewport,isMobile:view==='mobile',hasTouch:view==='mobile',locale:{cs:'cs-CZ',sk:'sk-SK',en:'en-GB',hu:'hu-HU'}[lang]});
  const page=await context.newPage(),errors=[];page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(origin+'?lang='+lang,{waitUntil:'load'});await page.locator('#search').waitFor();
   // Allow the application's scheduled 600 ms initialization render to complete.
   await page.waitForTimeout(700);
   for(const [id,indices]of conversations){
    const result={lang,view,id,viewport,result:'PASS',steps:[]};const errorStart=errors.length;
    try{
     if(await page.locator('#dk-dialog-panel').isVisible()){await page.locator('.dk-dialog-head button').click();if(await page.locator('#dk-dialog-log > *').count())throw Error('Reset did not clear log');}
     for(const i of indices){
      const before=await page.locator('#dk-dialog-log .assistant').count();
      await page.locator('#search').fill(qs[i]);
      if(i===8)await page.locator('#search').press('Enter');else await page.locator('#searchBtn').click();
      await page.waitForFunction(n=>document.querySelectorAll('#dk-dialog-log .assistant').length===n+1,before);
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const assistant=page.locator('#dk-dialog-log .assistant').last(),text=await assistant.innerText();
      const links=await assistant.locator('a').evaluateAll(as=>as.map(a=>({text:a.textContent,href:a.href})));
      const g=await geometry(page),failures=[];
      if(!expected[i].test(norm(text)))failures.push('Expected content '+expected[i]);
      if(await page.locator('#dk-search-results.active').count())failures.push('Search fallback active');
      if(await page.locator('html').getAttribute('lang')!==lang)failures.push('Wrong language');
      if(g.width!==viewport.width||g.height!==viewport.height)failures.push('Wrong actual viewport');
      if(g.reset.top<g.header.bottom-1||g.input.bottom>g.visualHeight+1||g.input.top<g.header.bottom||g.answer.top<g.log.top-2||g.answer.top>g.log.bottom-20)failures.push('Answer/reset/input geometry');
      if(g.overflow>2)failures.push('Horizontal overflow');
      if(!await assistant.isVisible())failures.push('Answer hidden');
      result.steps.push({q:qs[i],text,links,geometry:g,failures});
      if(failures.length)result.result='FAIL';
     }
     if(errors.length>errorStart){result.result='FAIL';result.runtimeErrors=errors.slice(errorStart);}
    }catch(e){result.result='FAIL';result.error=String(e);}
    if(result.result==='FAIL')await page.screenshot({path:path.join(out,lang+'-'+view+'-'+id+'.png'),fullPage:true}).catch(()=>{});
    results.push(result);console.log(lang,view,id,result.result,result.steps.flatMap(s=>s.failures).join(';'),result.error||'');
   }
   await page.screenshot({path:path.join(out,lang+'-'+view+'-final.png'),fullPage:true});
   auxiliary.push({lang,view,name:'runtime errors',result:errors.length?'FAIL':'PASS',errors});
  }catch(e){for(const [id]of conversations)if(!results.some(r=>r.lang===lang&&r.view===view&&r.id===id))results.push({lang,view,id,result:'BLOCKED',error:String(e)});}
  await context.close();
 }
}
main().catch(e=>{metadata.runnerError=String(e);for(const view of Object.keys(views))for(const lang of Object.keys(questions))for(const[id]of conversations)if(!results.some(r=>r.lang===lang&&r.view===view&&r.id===id))results.push({lang,view,id,result:'BLOCKED',error:String(e)});}).finally(async()=>{
 await browser?.close().catch(()=>{});server.kill();metadata.finished=new Date().toISOString();
 const counts=results.reduce((a,r)=>(a[r.result]++,a),{PASS:0,FAIL:0,BLOCKED:0});
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({metadata,counts,results,auxiliary},null,2));
 console.log('Original 96 browser variants:',JSON.stringify(counts));process.exitCode=counts.FAIL||counts.BLOCKED?1:0;
});
