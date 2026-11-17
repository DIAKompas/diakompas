const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
(async()=>{
 const server=spawn('python3',['-m','http.server','8000','--directory','..'],{stdio:'ignore'});
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let pass=0;
 try{
  await new Promise(r=>setTimeout(r,1000));
  for(const lang of ['cs','sk','en','hu'])for(const width of [393,1440]){
   const page=await browser.newPage({viewport:{width,height:873}});
   try{
    await page.goto('http://127.0.0.1:8000/diakompas/?lang='+lang,{waitUntil:'domcontentloaded'});
    await page.locator('#topics .topic').first().waitFor();
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(250);
    const sizes=await page.evaluate(()=>({
      starts:[...document.querySelectorAll('#zacinam .dk-start-card')].map(e=>e.getBoundingClientRect().height),
      topics:[...document.querySelectorAll('#topics .topic')].map(e=>e.getBoundingClientRect().height),
      grid:getComputedStyle(document.querySelector('#topics .topics')).gridTemplateColumns,
      hidden:getComputedStyle(document.querySelector('#topics .topic .dk-2026-update')).display
    }));
    if(width===393){
      const expected=Math.max(...sizes.starts);
      assert.ok(sizes.topics.every(n=>Math.abs(n-expected)<=2),JSON.stringify(sizes));
      assert.equal(sizes.hidden,'none');
      assert.equal(sizes.grid.split(' ').length,4);
    }else assert.notEqual(sizes.hidden,'none');
    await page.locator('#topics .topic').first().click();
    await page.locator('#articles-view.active').waitFor({timeout:5000});
    pass++;
    console.log('PASS',lang,width);
   }finally{await page.close()}
  }
 }finally{await browser.close();server.kill()}
 console.log('PASS',pass,'FAIL',0);
})().catch(e=>{console.error(e);process.exitCode=1});
