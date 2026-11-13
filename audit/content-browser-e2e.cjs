/* Real Chromium UI tests for the 2026-11-13 content release. No DOM simulation. */
const {chromium}=require('playwright');
const {spawn}=require('child_process');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'audit-output/content');fs.mkdirSync(out,{recursive:true});
const articles=JSON.parse(fs.readFileSync(path.join(root,'content/articles-20261113.json'))),newRecipes=JSON.parse(fs.readFileSync(path.join(root,'content/recipes-20261113.json')));
const origin=process.env.CONTENT_TEST_ORIGIN||'http://127.0.0.1:8766/';
const server=process.env.CONTENT_TEST_ORIGIN?null:spawn('python3',['-m','http.server','8766','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const results=[];let browser;
const languages=['cs','sk','en','hu'];
const add=(lang,view,name,fn)=>async()=>{try{await fn();results.push({lang,view,name,result:'PASS'});}catch(e){results.push({lang,view,name,result:'FAIL',error:String(e)});console.error(lang,view,name,String(e));}};
async function geometry(page){const g=await page.evaluate(()=>({width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth-innerWidth}));assert.ok(g.overflow<=2,JSON.stringify(g));return g;}
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
 for(const [view,viewport] of Object.entries({desktop:{width:1440,height:900},mobile:{width:393,height:873}})){
  for(const lang of languages){
   const context=await browser.newContext({viewport,locale:lang}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(origin,{waitUntil:'load'});await page.locator('.langs button[data-lang="'+lang+'"]').click();
   await add(lang,view,'viewport and language',async()=>{assert.equal(await page.locator('html').getAttribute('lang'),lang);assert.deepEqual(await page.evaluate(()=>({width:innerWidth,height:innerHeight})),viewport);await geometry(page);})();
   // Navigate using existing UI links; open each new article and check full localized paragraphs.
   for(const a of articles){
    await add(lang,view,'article '+a.id,async()=>{
     if(!await page.locator('[data-scroll="articles"]').isVisible())await page.locator('.hamb').click();
     await page.locator('[data-scroll="articles"]').click();
     const card=page.locator('#articles-view [data-open-article="'+a.id+'"]');assert.equal(await card.locator('h2').innerText(),a.locales[lang].title);await card.click();
     assert.equal(await page.locator('#article-body h1').innerText(),a.locales[lang].title);
     const text=await page.locator('#article-body').innerText();for(const [h,p] of a.locales[lang].sections){assert.ok(text.includes(h));assert.ok(text.replace(/\s+/g,' ').includes(p.replace(/\s+/g,' ')));}
     const urls=await page.locator('#article-body .content-sources a').evaluateAll(as=>as.map(a=>a.href));assert.deepEqual(urls,a.sources.map(s=>s[1]));
     await geometry(page);
    })();
   }
   await page.goto(origin+'?lang='+lang+'#recepty',{waitUntil:'load'});
   await add(lang,view,'34 recipes and 34 local photographs',async()=>{assert.equal(await page.locator('#recipes .recipe').count(),34);assert.equal(await page.locator('#recipes .recipe img').count(),34);})();
   for(let i=0;i<34;i++){
    await add(lang,view,'recipe '+i,async()=>{
     const card=page.locator('#recipes .recipe').nth(i),details=card.locator('details');await card.locator('summary').click();assert.ok(await details.getAttribute('open')!==null);
     if(i>=24){const r=newRecipes[i-24].locales[lang];assert.equal(await card.locator('h3').innerText(),r[0]);assert.deepEqual(await details.locator('ul li').allTextContents(),r[1]);assert.deepEqual(await details.locator('ol li').allTextContents(),r[2]);}
     await card.locator('img').scrollIntoViewIfNeeded();await page.waitForFunction(i=>{const img=document.querySelectorAll('#recipes .recipe img')[i];return img.complete&&img.naturalWidth>0},i);
     assert.match(await card.locator('img').getAttribute('src'),/^assets\/recipes\/recipe-\d\d\.webp$/);assert.ok((await card.locator('img').getAttribute('alt')).length>3);
     assert.equal(await card.locator('figcaption a').count(),2);await geometry(page);
     await card.locator('summary').click();
    })();
   }
   await add(lang,view,'meal filters',async()=>{const buttons=page.locator('#recipes .dk-recipe-filters button');for(let i=1;i<5;i++){await buttons.nth(i).click();assert.ok(await page.locator('#recipes .recipe:visible').count()>0);}await buttons.nth(0).click();assert.equal(await page.locator('#recipes .recipe:visible').count(),34);})();
   await page.locator('#recipes .recipe').nth(24).locator('summary').click();await page.locator('#recipes .recipe').nth(24).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,lang+'-'+view+'-recipes.png')});
   await add(lang,view,'payment QR opens and remains bounded',async()=>{await page.locator('#dk-donate-open').click();const dlg=page.locator('#dk-donate-dialog');assert.ok(await dlg.isVisible());const box=await dlg.boundingBox();assert.ok(box.width<=viewport.width&&box.height<=viewport.height);const qr=await page.locator('#dk-donate-qr-container svg').boundingBox();assert.ok(qr.width<=206&&qr.height<=206);await page.screenshot({path:path.join(out,lang+'-'+view+'-qr.png')});await page.locator('#dk-donate-close').click();assert.equal(await dlg.isVisible(),false);})();
   await add(lang,view,'runtime errors',async()=>assert.deepEqual(errors,[]))();await context.close();
  }
 }
})().catch(e=>{results.push({name:'runner',result:'BLOCKED',error:String(e)});console.error(e)}).finally(async()=>{
 await browser?.close();server?.kill();const counts=results.reduce((c,r)=>(c[r.result]++,c),{PASS:0,FAIL:0,BLOCKED:0});fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({engine:'Real Chromium / Playwright',finished:new Date().toISOString(),counts,results},null,2));console.log(JSON.stringify(counts));process.exitCode=counts.FAIL||counts.BLOCKED?1:0;
});
