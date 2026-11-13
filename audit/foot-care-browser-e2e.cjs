/* Actual Chromium UI checks; run in GitHub Actions with Playwright installed. */
const {chromium}=require('playwright'),{spawn}=require('child_process'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'audit-output/foot-care');fs.mkdirSync(out,{recursive:true});
const articles=JSON.parse(fs.readFileSync(path.join(root,'content/articles-foot-care-20261113.json')));
const origin=process.env.FOOT_TEST_ORIGIN||'http://127.0.0.1:8767/';
const server=process.env.FOOT_TEST_ORIGIN?null:spawn('python3',['-m','http.server','8767','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
let browser;const results=[];
async function check(lang,view,name,fn){try{await fn();results.push({lang,view,name,result:'PASS'});}catch(e){results.push({lang,view,name,result:'FAIL',error:String(e)});console.error(name,e);}}
async function geometry(page){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'horizontal overflow');}
(async()=>{browser=await chromium.launch({headless:true,args:['--no-sandbox']});
for(const [view,viewport] of Object.entries({desktop:{width:1440,height:900},mobile:{width:393,height:873}}))for(const lang of ['cs','sk','en','hu']){
 const context=await browser.newContext({viewport,locale:lang}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(origin+'?lang='+lang,{waitUntil:'load'});
 for(const a of articles){await check(lang,view,'SPA '+a.id,async()=>{
  if(!await page.locator('[data-scroll="articles"]').isVisible())await page.locator('.hamb').click();
  await page.locator('[data-scroll="articles"]').click();
  const card=page.locator('#articles-view [data-open-article="'+a.id+'"]');assert.equal(await card.locator('h2').innerText(),a.locales[lang].title);await card.click();
  assert.equal(await page.locator('#article-body h1').innerText(),a.locales[lang].title);
  const text=(await page.locator('#article-body').innerText()).replace(/\s+/g,' ');
  for(const [h,p] of a.locales[lang].sections){assert.ok(text.includes(h));assert.ok(text.includes(p.replace(/\s+/g,' ')));}
  assert.deepEqual(await page.locator('#article-body .content-sources a').evaluateAll(as=>as.map(a=>a.href)),a.sources.map(x=>x[1]));await geometry(page);
 });}
 await check(lang,view,'guide conversation and reset',async()=>{
  await page.goto(origin+'?lang='+lang+'#domu',{waitUntil:'load'});
  const questions={cs:['Co je HbA1c?','Jak se to měří?'],sk:['Čo je HbA1c?','Ako sa to meria?'],en:['What is HbA1c?','How is it measured?'],hu:['Mi az a HbA1c?','Hogyan mérik?']}[lang];
  for(const q of questions){await page.locator('#search').fill(q);await page.locator('#search').press('Enter');await page.waitForFunction(n=>document.querySelectorAll('#dk-dialog-log .dk-dialog-message.assistant').length===n,questions.indexOf(q)+1);}
  assert.equal(await page.locator('#dk-dialog-log .dk-dialog-message.assistant').count(),2);
  assert.ok((await page.locator('#dk-dialog-log').innerText()).includes('HbA1c'));
  await page.locator('#dk-dialog-panel .dk-dialog-head button').click();assert.equal(await page.locator('#dk-dialog-log').innerText(),'');await geometry(page);
 });
 await check(lang,view,'guide finds leg-ulcer article',async()=>{
  await page.locator('#search').fill({cs:'Bércové vředy',sk:'Vredy predkolenia',en:'Leg ulcers',hu:'Lábszárfekély'}[lang]);await page.locator('#search').press('Enter');
  await page.locator('#dk-dialog-log a[href*="bercove-vredy"]').first().waitFor({state:'visible'});
  await page.locator('#dk-dialog-panel .dk-dialog-head button').click();
 });
 await check(lang,view,'payment QR visible',async()=>{
  await page.locator('#dk-donate-open').click();const img=page.locator('#dk-donate-qr-container svg');await img.waitFor({state:'visible'});assert.ok(await img.locator('path').getAttribute('d'));await geometry(page);await page.locator('#dk-donate-close').click();
 });
 for(const a of articles){await check(lang,view,'static '+a.id,async()=>{
  const response=await page.goto(origin+lang+'/clanky/'+a.id+'/',{waitUntil:'load'});assert.equal(response.status(),200);assert.equal(await page.locator('html').getAttribute('lang'),lang);assert.equal(await page.locator('h1').innerText(),a.locales[lang].title);await geometry(page);
  for(const [name,url] of a.sources)assert.ok(await page.locator('a[href="'+url+'"]').count());
 });}
 await page.screenshot({path:path.join(out,lang+'-'+view+'.png'),fullPage:true});
 await check(lang,view,'no browser script errors',async()=>assert.deepEqual(errors,[]));await context.close();
}
})().catch(e=>{results.push({name:'runner',result:'FAIL',error:String(e)});console.error(e)}).finally(async()=>{await browser?.close();server?.kill();const counts=Object.fromEntries(['PASS','FAIL','BLOCKED'].map(k=>[k,results.filter(r=>r.result===k).length]));fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({kind:'Real Chromium UI tests',counts,results},null,2));console.log(JSON.stringify(counts));process.exitCode=counts.FAIL?1:0;});
