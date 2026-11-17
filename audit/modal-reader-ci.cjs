const { chromium }=require('playwright');
const {spawn}=require('child_process');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const server=spawn('python3',['-m','http.server','8000','--bind','127.0.0.1','--directory','..'],{stdio:'ignore'});
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const results=[];
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 await sleep(1100);
 try{
  for(const lang of ['cs','sk','en','hu'])for(const viewport of [{width:393,height:873},{width:1440,height:900}]){
   const page=await browser.newPage({viewport});
   try{
    await page.goto('http://127.0.0.1:8000/diakompas/?lang='+lang,{waitUntil:'domcontentloaded'});
    const card=page.locator('[data-open-article]').first();await card.waitFor({timeout:15000});
    await card.scrollIntoViewIfNeeded();
    const before=await page.evaluate(()=>({hash:location.hash,y:window.scrollY}));
    await card.click();
    await page.locator('#dk-modal-reader[open]').waitFor({timeout:10000});
    await page.locator('#dk-modal-article-body').waitFor({timeout:10000});
    assert.ok((await page.locator('#dk-modal-article-body').innerText()).length>80);
    await page.locator('#dk-modal-reader .dk-modal-close').click();
    await page.waitForTimeout(200);
    const after=await page.evaluate(()=>({hash:location.hash,y:window.scrollY,open:document.querySelector('#dk-modal-reader').open}));
    assert.equal(after.hash,before.hash);assert.equal(after.open,false);
    assert.ok(Math.abs(after.y-before.y)<12,`scroll changed ${before.y} -> ${after.y}`);
    results.push({lang,viewport:viewport.width,status:'PASS'});
   }catch(e){results.push({lang,viewport:viewport.width,status:'FAIL',error:e.message.slice(0,400)})}
   await page.close();
  }
  for(const lang of ['cs','sk','en','hu']){
    const page=await browser.newPage({viewport:{width:393,height:873}});
    try{
      await page.goto('http://127.0.0.1:8000/diakompas/?lang='+lang,{waitUntil:'domcontentloaded'});
      const glossary=page.locator('a[href*="#pojem-"],button[data-term]').first();
      await glossary.waitFor({timeout:12000});await glossary.click();
      await page.locator('#dk-modal-reader[open]').waitFor({timeout:8000});
      assert.ok((await page.locator('#dk-modal-reader .dk-modal-content').innerText()).length>20);
      await page.keyboard.press('Escape');
      await page.locator('#dk-modal-reader:not([open])').waitFor({timeout:8000});
      results.push({lang,test:'glossary Escape',status:'PASS'});
    }catch(e){results.push({lang,test:'glossary Escape',status:'FAIL',error:e.message.slice(0,400)})}
    await page.close();
  }
  const page=await browser.newPage();await page.goto('http://127.0.0.1:8000/diakompas/cs/clanky/cgm/');assert.ok(await page.locator('main h1').count());results.push({test:'direct article',status:'PASS'});await page.close();
 }finally{await browser.close();server.kill();fs.mkdirSync('audit-output/modal-reader',{recursive:true});fs.writeFileSync('audit-output/modal-reader/results.json',JSON.stringify(results,null,2));}
 console.log(JSON.stringify(results));if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
