/* Actual Chromium geometry and UI checks; no simulated DOM. */
const {chromium}=require('playwright');
const {spawn,execFileSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'audit-output/mobile-four-columns');
fs.mkdirSync(out,{recursive:true});
const origin=process.env.MOBILE_TEST_ORIGIN||'http://127.0.0.1:8767/';
const server=process.env.MOBILE_TEST_ORIGIN?null:spawn('python3',['-m','http.server','8767','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const baseline=execFileSync('git',['show','8091d5aed19a35cbe33582a66f26b49ce3b41f03:index.html'],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
const results=[];let browser;
async function check(lang,view,name,fn){try{const evidence=await fn();results.push({lang,view,name,result:'PASS',evidence});console.log(lang,view,name,'PASS');}catch(e){results.push({lang,view,name,result:'FAIL',error:String(e)});console.error(lang,view,name,String(e));}}
async function geometry(page){return page.evaluate(()=>{
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
 const grid=s=>{const e=document.querySelector(s);return {columns:getComputedStyle(e).gridTemplateColumns,cards:[...e.children].map(rect)};};
 const text=[...document.querySelectorAll('#zacinam .dk-start-card h3,#zacinam .dk-start-card p,#topics h3,#topics h4,#topics .dk-2026-update p,#topics .dk-2026-update a')].filter(e=>e.getBoundingClientRect().width).map(e=>({text:e.textContent,size:parseFloat(getComputedStyle(e).fontSize),clipped:e.scrollWidth>e.clientWidth+1||(!(parseInt(getComputedStyle(e).webkitLineClamp)>0)&&e.scrollHeight>e.clientHeight+1)}));
 return {width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth-innerWidth,start:grid('#zacinam .dk-start-grid'),topics:grid('#topics .topics'),text};
});}
(async()=>{
 // On main, wait for Pages to serve this exact CSS revision before browser checks.
 for(let i=0;i<90;i++){try{const html=await (await fetch(origin)).text();if(html.includes('dk-mobile-four-columns-20261114'))break;if(i===89)throw Error('Pages did not serve four-column revision');}catch(e){if(i===89)throw e;}await new Promise(r=>setTimeout(r,2000));}
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const [view,viewport]of Object.entries({mobile:{width:393,height:873},tablet:{width:768,height:1024},desktop:{width:1440,height:900}}))for(const lang of ['cs','sk','en','hu']){
 const context=await browser.newContext({viewport,locale:lang,isMobile:view==='mobile',hasTouch:view==='mobile'}),page=await context.newPage(),errors=[];
 page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(String(e)));await page.goto(origin+'?lang='+lang);await page.waitForTimeout(750);
 await check(lang,view,'exact viewport, language, grid, readable unclipped text',async()=>{
 const g=await geometry(page);assert.equal(g.width,viewport.width);assert.equal(g.height,viewport.height);assert.equal(await page.locator('html').getAttribute('lang'),lang);assert.equal(g.start.cards.length,8);assert.equal(g.topics.cards.length,6);
 if(view==='mobile'){
 assert.ok(g.overflow<=2,JSON.stringify(g));
 const rows=cards=>Object.values(cards.reduce((r,c)=>{(r[Math.round(c.y)]??=[]).push(c);return r;},{})).map(r=>r.length);
 assert.deepEqual(rows(g.start.cards),[4,4]);assert.deepEqual(rows(g.topics.cards),[4,2]);
 for(const c of [...g.start.cards,...g.topics.cards])assert.ok(c.w>=70&&c.h>=44,JSON.stringify(c));
 assert.deepEqual(g.text.filter(t=>t.clipped),[]);assert.ok(g.text.every(t=>t.size>=12));
 }else{
 const old=await context.newPage();await old.route('**/*',route=>route.request().resourceType()==='document'?route.fulfill({status:200,contentType:'text/html',body:baseline}):route.continue());await old.goto(origin+'?lang='+lang);await old.waitForTimeout(750);const before=await geometry(old);assert.deepEqual(g,before,'Tablet/desktop geometry changed');await old.close();
 }return g;
 });
 if(view==='mobile'){
 await page.locator('#zacinam').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,lang+'-mobile-steps.png')});
 await page.locator('#topics').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,lang+'-mobile-topics.png')});
 for(let i=0;i<7;i++)await check(lang,view,'step link '+(i+1),async()=>{await page.goto(origin+'?lang='+lang+'#zacinam');const card=page.locator('#zacinam a.dk-start-card').nth(i),href=await card.getAttribute('href');await card.click();await page.locator('#article-body h1').waitFor({state:'visible'});assert.equal(new URL(page.url()).hash,new URL(href,origin).hash);assert.ok((await page.locator('#article-body').innerText()).length>300);});
 await page.goto(origin+'?lang='+lang+'#zacinam');await check(lang,view,'step 8 disclosure',async()=>{const b=page.locator('#zacinam .dk-start-practical>button');await b.click();assert.equal(await b.getAttribute('aria-expanded'),'true');await b.click();assert.equal(await b.getAttribute('aria-expanded'),'false');});
 const links=await page.locator('#topics .dk-2026-update a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
 for(let i=0;i<links.length;i++)await check(lang,view,'topic link '+(i+1),async()=>{await page.locator('header a.logo').click();await page.locator('#topics .dk-2026-update a').nth(i).click();if(links[i].includes('recepty')){await page.locator('#recipes .recipe').first().waitFor({state:'visible'});}else{await page.locator('#article-body h1').waitFor({state:'visible'});assert.ok((await page.locator('#article-body').innerText()).length>300);}});
 await page.locator('header a.logo').click();await check(lang,view,'guide answer and reset',async()=>{await page.locator('#search').fill({cs:'Co je HbA1c?',sk:'Čo je HbA1c?',en:'What is HbA1c?',hu:'Mi az a HbA1c?'}[lang]);await page.locator('#searchBtn').click();await page.locator('#dk-dialog-log .assistant').waitFor();assert.match(await page.locator('#dk-dialog-log .assistant').innerText(),/HbA1c/i);await page.locator('.dk-dialog-head button').click();assert.equal(await page.locator('#dk-dialog-log>*').count(),0);});
 await check(lang,view,'payment QR',async()=>{await page.locator('#dk-donate-open').click();assert.ok(await page.locator('#dk-donate-dialog').isVisible());assert.equal(await page.locator('#dk-donate-qr-container svg').count(),1);await page.locator('#dk-donate-close').click();});
 }
 await check(lang,view,'runtime errors',()=>assert.deepEqual(errors,[]));await context.close();
 }
})().catch(e=>{results.push({name:'runner',result:'BLOCKED',error:String(e)});console.error(e);}).finally(async()=>{await browser?.close();server?.kill();const counts=results.reduce((a,r)=>(a[r.result]++,a),{PASS:0,FAIL:0,BLOCKED:0});fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({engine:'Actual Chromium',origin,finished:new Date().toISOString(),counts,results},null,2));console.log(JSON.stringify(counts));process.exitCode=counts.FAIL||counts.BLOCKED?1:0;});
