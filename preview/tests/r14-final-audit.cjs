/* DIA Kompas R14: standalone Playwright audit.
Run: DIA_TEST_URL='https://raw.githack.com/DIAKompas/diakompas/<commit>/preview/index.html' node preview/tests/r14-final-audit.cjs
Optional: DIA_CHROMIUM_PATH=/usr/bin/chromium DIA_QA_OUT=/absolute/output
Requires the free playwright package and an installed Chromium browser.
No deployments, writes to the site, paid services or public-site navigation.
*/
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const url=process.env.DIA_TEST_URL;
if(!url)throw Error('DIA_TEST_URL is required');
const target=new URL(url);
const local=process.env.DIA_QA_LOCAL==='1'&&target.origin==='http://127.0.0.1:8765'&&target.pathname==='/preview/index.html';
if(!local){assert.equal(target.origin,'https://raw.githack.com');assert.match(target.pathname,/^\/DIAKompas\/diakompas\/[a-f0-9]{40}\/preview\/index\.html$/);}
const out=path.resolve(process.env.DIA_QA_OUT||'test-results/r14-final-audit');
fs.mkdirSync(out,{recursive:true});
const result={url,sourceCommit:process.env.GITHUB_SHA||null,started:new Date().toISOString(),tests:[],console:[],network:[]};
const cases=[
 {lang:'cs',q:['Mám vysoký cukr, zvracení a bolest břicha','Mám nízký cukr a třesu se.','Kolik jednotek inzulinu si mám píchnout?','Člověk s diabetem je v bezvědomí','Můžu přestat brát metformin?']},
 {lang:'sk',q:['Mám vysoký cukor, vraciam a bolí ma brucho.','Mám nízky cukor a trasiem sa.','Koľko jednotiek inzulínu si mám pichnúť?','Človek s diabetom je v bezvedomí','Môžem prestať brať metformín?']},
 {lang:'en',q:['I have high blood sugar, vomiting and abdominal pain.','I have low blood sugar and I am shaking.','How many units of insulin should I inject?','A person with diabetes is unconscious','Can I stop taking metformin?']},
 {lang:'hu',q:['Magas a vércukrom, hányok és fáj a hasam.','Alacsony a vércukrom és remegek.','Hány egység inzulint adjak be magamnak?','Egy cukorbeteg ember eszméletlen','Abbahagyhatom a metformin szedését?']}
];
const chains=[['Co je HbA1c?','Jak se to měří?','A jak často se to kontroluje?'],['Co je HbA1c?','Co je CGM?','A jak to funguje?'],['Mám vysoký cukr','A co jednotky?','A co jednotky?']];
const words=[/ketoacid|ketoacidosis|ketoacidózis/i,/hypogly|hypoglyk|hipoglik/i,/nelze|nemožno|cannot|nem tud/i,/155|112|emergency|segélyhív/i,/nevysaz|nevysadz|do not stop|ne hagyja/i];
async function boot(p){await p.goto(url,{waitUntil:'networkidle'});const notice=p.getByRole('button',{name:'Open the page',exact:true});if(await notice.isVisible())await notice.click();await p.locator('#search').waitFor({state:'visible'});}
async function reset(p){if(await p.locator('#dk-dialog-panel').isVisible())await p.locator('#dk-dialog-panel button').first().click();await p.locator('#search').waitFor({state:'visible'});}
async function ask(p,q){await p.locator('#search').fill(q);await p.locator('#search').press('Enter');await p.locator('#dk-dialog-log .assistant').last().waitFor({state:'visible'});return p.locator('#dk-dialog-log .assistant').last();}
async function record(id,fn){const t={id};try{Object.assign(t,await fn());t.status='PASS';}catch(e){t.status='FAIL';t.error=String(e);}result.tests.push(t);}
(async()=>{let browser;try{
 browser=await chromium.launch({headless:true,...(process.env.DIA_CHROMIUM_PATH?{executablePath:process.env.DIA_CHROMIUM_PATH}:{})});
 for(const view of [{width:1440,height:900},{width:393,height:873}]){
  const mobile=view.width===393;
  const context=await browser.newContext({viewport:view,isMobile:mobile,hasTouch:mobile,...(mobile?{userAgent:'Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'}:{})});
  const p=await context.newPage();
  context.on('page',page=>{page.on('pageerror',e=>result.console.push({view,error:String(e)}));page.on('requestfailed',r=>result.network.push({view,url:r.url(),failure:r.failure()}));page.on('response',r=>{if(r.status()>=400)result.network.push({view,url:r.url(),status:r.status()});});});
  p.on('console',m=>{if(m.type()==='error')result.console.push({view,error:m.text()});});
  p.on('pageerror',e=>result.console.push({view,error:String(e)}));
  p.on('requestfailed',r=>result.network.push({view,url:r.url(),failure:r.failure()}));
  p.on('response',r=>{if(r.status()>=400)result.network.push({view,url:r.url(),status:r.status()});});
  await boot(p);
  await record(view.width+'-viewport',async()=>{const actual=await p.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth}));assert.equal(actual.width,view.width);assert.equal(actual.height,view.height);assert.ok(actual.scrollWidth<=actual.width);await p.screenshot({path:path.join(out,view.width+'-home.png')});return {view,actual};});
  const sources=new Set();
  for(const c of cases){
   await p.locator('.langs button[data-lang="'+c.lang+'"]').click();await reset(p);
   for(let i=0;i<c.q.length;i++)await record(view.width+'-'+c.lang+'-'+i,async()=>{
    await reset(p);const answer=await ask(p,c.q[i]);
    const text=await answer.innerText(),first=await answer.locator(':scope > p').first().innerText();
    const inputBox=await p.locator('#search').boundingBox(),sendBox=await p.locator('#searchBtn').boundingBox();
    for(const box of [inputBox,sendBox]){assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=view.width+1&&box.y+box.height<=view.height+1,'Input and submit must fit the actual viewport');}
    assert.match(first,words[i]);
    assert.equal(await p.locator('html').getAttribute('lang'),c.lang);
    assert.equal(await answer.locator('.dk-clinical-source').count(),1);
    const href=await answer.locator('.dk-clinical-source').getAttribute('href');sources.add(href);
    const internal=answer.locator('.dk-dialog-article').first();const article=await internal.getAttribute('href');const expectedHeading=(await internal.innerText()).split(' — ')[0];
    assert.match(article,/#clanek-/);
    assert.equal(new URL(article,p.url()).origin,target.origin);
    assert.ok(await p.locator('#search').isEnabled());
    await p.screenshot({path:path.join(out,view.width+'-'+c.lang+'-'+i+'.png')});
    await internal.click();await p.locator('#article-body h1').waitFor({state:'visible'});
    const heading=await p.locator('#article-body h1').innerText();assert.equal(heading,expectedHeading);
    if(!await p.locator('#nav a').first().isVisible())await p.locator('#hamb').click();
    await p.locator('#nav a').first().click();
    await p.locator('#search').waitFor({state:'visible'});
    return {view,lang:c.lang,query:c.q[i],response:text,source:href,article,heading};
   });
  }
  await p.locator('.langs button[data-lang="cs"]').click();
  for(let n=0;n<chains.length;n++){
   await reset(p);
   for(let i=0;i<chains[n].length;i++)await record(view.width+'-context-'+n+'-'+i,async()=>{const answer=await ask(p,chains[n][i]);const text=await answer.innerText();assert.ok(text.length>80);assert.ok(await p.locator('#search').isEnabled());if(n===0)assert.match(text,/HbA1c/);if(n===1&&i===2)assert.match(text,/CGM|Senzor/);if(n===2&&i>0)assert.match(text,/mmol\/l.*mg\/dl/s);return {view,query:chains[n][i],response:text};});
  }
  // Genuine direct navigation tests (without the SPA's click handler).
  await reset(p);
  const link=await p.locator('#zacinam a').filter({hasText:'HbA1c'}).getAttribute('href');
  const direct=await context.newPage();
  await record(view.width+'-direct-link',async()=>{const response=await direct.goto(new URL(link,p.url()).href,{waitUntil:'networkidle'});assert.equal(response.status(),200);await direct.locator('#article-body h1').waitFor({state:'visible'});return {view,url:direct.url(),http:response.status(),heading:await direct.locator('#article-body h1').innerText()};});

  await record(view.width+'-fragment-navigation',async()=>{const href=await p.locator('#zacinam a').first().getAttribute('href');await direct.goto(new URL(href,p.url()).href);await direct.getByRole('heading',{level:1,name:'Rozdíl mezi diabetem 1. a 2. typu',exact:true}).waitFor({state:'visible'});return {view,url:direct.url(),heading:await direct.locator('#article-body h1').innerText()};});
  for(const source of sources)await record(view.width+'-source-'+new URL(source).pathname,async()=>{assert.ok(['www.nhs.uk','www.resus.org.uk','www.niddk.nih.gov'].includes(new URL(source).hostname));const response=await direct.goto(source,{waitUntil:'domcontentloaded'});assert.ok(response.status()<400);return {view,url:direct.url(),http:response.status(),title:await direct.title()};});
  await context.close();
 }
 result.status=result.tests.some(t=>t.status==='FAIL')||result.console.length||result.network.length?'FAIL':'PASS';if(result.status==='FAIL')process.exitCode=1;
}catch(e){result.status=browser?'FAIL':'BLOCKED';result.error=String(e);process.exitCode=browser?1:2;}
finally{if(browser)await browser.close();result.ended=new Date().toISOString();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({status:result.status,tests:result.tests.length,result:path.join(out,'results.json'),error:result.error}));}})();

