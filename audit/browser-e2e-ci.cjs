/* Real browser E2E. Runs the checked-out site, not jsdom or a mock.
   4 languages x 2 viewports x 8 question scenarios = 64 question checks.
   Additional reset, scroll and link checks are tracked separately. */
const {chromium}=require('playwright');
const {spawn}=require('child_process');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'audit-output');
fs.mkdirSync(out,{recursive:true});
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const origin='http://127.0.0.1:8765/';
const scenarios={
cs:['Mám vysoký cukr','A co jednotky?','Co mám dělat?','Co je HbA1c?','Jak se to měří?','Jak často?','Mám nízký cukr a třesu se.','Kolik inzulinu si mám píchnout?'],
sk:['Mám vysoký cukor','A čo jednotky?','Čo mám robiť?','Čo je HbA1c?','Ako sa to meria?','Ako často?','Mám nízky cukor a trasiem sa.','Koľko inzulínu si mám pichnúť?'],
en:['I have high blood sugar','What about units?','What should I do?','What is HbA1c?','How is it measured?','How often?','I have low blood sugar and I am shaking.','How much insulin should I inject?'],
hu:['Magas a vércukrom','És a mértékegységek?','Mit tegyek?','Mi az a HbA1c?','Hogyan mérik?','Milyen gyakran?','Alacsony a vércukrom és remegek.','Mennyi inzulint adjak be?']
};
const views={desktop:{width:1440,height:900},mobile:{width:393,height:873}};
const results=[];let browser;
function record(lang,view,name,ok,detail=''){results.push({lang,view,name,result:ok?'PASS':'FAIL',detail});}
async function main(){
  let ready=false;
  for(let i=0;i<40;i++){try{const r=await fetch(origin);if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}
  if(!ready)throw Error('Local site server not reachable');
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  for(const [view,viewport] of Object.entries(views))for(const [lang,questions]of Object.entries(scenarios)){
    const context=await browser.newContext({viewport,isMobile:view==='mobile',hasTouch:view==='mobile'});
    const page=await context.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    try{
      await page.goto(origin+'?lang='+lang,{waitUntil:'load'});
      await page.locator('#search').waitFor({timeout:10000});
      for(let i=0;i<questions.length;i++){
        const q=questions[i];
        await page.locator('#search').fill(q);
        await page.locator('#searchBtn').click();
        const panel=page.locator('#dk-dialog-panel');
        const assistant=page.locator('#dk-dialog-log .assistant').last();
        let ok=false,detail='';
        try{
          await assistant.waitFor({timeout:4000});
          detail=(await assistant.innerText()).slice(0,240);
          ok=await panel.isVisible()&&detail.length>35&&!(await page.locator('#dk-search-results.active').count());
          if(i===1)ok=ok&&/mmol\/l/i.test(detail);
          if(i===3)ok=ok&&/hba1c/i.test(detail);
        }catch(e){detail=String(e).slice(0,240);}
        record(lang,view,'Q'+(i+1)+': '+q,ok,detail);
        if(!ok)await page.screenshot({path:path.join(out,lang+'-'+view+'-Q'+(i+1)+'.png'),fullPage:true});
      }
      const reset=page.locator('.dk-dialog-head button');
      await reset.click();
      record(lang,view,'reset clears conversation',(await page.locator('#dk-dialog-log').locator(':scope > *').count())===0);
      await page.locator('#search').fill(questions[3]);await page.locator('#searchBtn').click();
      const visible=await page.locator('#dk-dialog-log .assistant').last().isVisible();
      record(lang,view,'new conversation after reset',visible);
      record(lang,view,'no browser runtime errors',errors.length===0,errors.join('; ').slice(0,500));
      if(view==='mobile'){
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
        record(lang,view,'no horizontal overflow',!overflow);
      }
      await page.screenshot({path:path.join(out,lang+'-'+view+'-final.png'),fullPage:true});
    }catch(e){record(lang,view,'session fatal',false,String(e));await page.screenshot({path:path.join(out,lang+'-'+view+'-fatal.png'),fullPage:true}).catch(()=>{});}
    await context.close();
  }
}
main().catch(e=>{results.push({result:'FAIL',name:'runner',detail:String(e)});}).finally(async()=>{
  await browser?.close().catch(()=>{});server.kill();
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));
  const pass=results.filter(r=>r.result==='PASS').length,fail=results.filter(r=>r.result==='FAIL').length;
  console.log('Real Chromium E2E:',pass,'PASS',fail,'FAIL');
  for(const r of results.filter(r=>r.result==='FAIL'))console.log(r.lang,r.view,r.name,r.detail);
  process.exitCode=fail?1:0;
});
