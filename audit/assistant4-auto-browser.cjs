/* DIA Kompas 4.0 — regression tests for automatic 3D and voice.
 * Run: node audit/assistant4-auto-browser.cjs
 * Uses actual site code and a browser; requires Playwright and Chromium.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.glb':'model/gltf-binary','.png':'image/png','.svg':'image/svg+xml'};
const server = http.createServer((req,res)=>{
  const pathname = new URL(req.url,'http://localhost').pathname;
  if (!pathname.startsWith('/diakompas/')) return res.writeHead(404).end();
  const relative = pathname.slice('/diakompas/'.length) || 'index.html';
  const full = path.resolve(root,relative);
  if (!full.startsWith(root + path.sep)) return res.writeHead(403).end();
  fs.readFile(full,(err,data)=>err?res.writeHead(404).end():res.writeHead(200,{'Content-Type':types[path.extname(full)]||'application/octet-stream'}).end(data));
});
(async()=>{
  const results=[];
  const check=async(name,fn)=>{try{await fn();results.push({name,status:'PASS'});console.log('PASS',name)}catch(e){results.push({name,status:'FAIL',error:String(e)});console.error('FAIL',name,e)}};
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port+'/diakompas/';
  let browser;
  try{
    browser=await chromium.launch({args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
    for(const lang of ['cs','sk','en','hu']){
      const page=await browser.newPage({viewport:{width:393,height:873},locale:lang});
      await page.goto(base+'?lang='+lang);
      await check(lang+' no visible 3D/motion switches',async()=>{
        await page.locator('.dk4-assistant').waitFor();
        assert.equal(await page.locator('.dk4-assistant button').count(),0);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      });
      await check(lang+' automatic 3D activation',async()=>{
        await page.locator('.dk4-assistant[data-display="3d"] canvas').waitFor({timeout:15000});
      });
      await check(lang+' WebGL resolution bounded on mobile',async()=>{
        const resolution = await page.locator('.dk4-assistant canvas').evaluate(c=>({width:c.width,height:c.height,cssWidth:c.clientWidth,cssHeight:c.clientHeight}));
        assert.ok(resolution.width <= Math.ceil(resolution.cssWidth*1.25)+2);
        assert.ok(resolution.height <= Math.ceil(resolution.cssHeight*1.25)+2);
      });
      await check(lang+' answer remains available',async()=>{
        await page.locator('#search').fill(({cs:'Co je HbA1c?',sk:'Čo je HbA1c?',en:'What is HbA1c?',hu:'Mi az a HbA1c?'})[lang]);
        await page.locator('#search').press('Enter');
        await page.locator('#dk-dialog-log .assistant').first().waitFor();
        assert.match(await page.locator('#dk-dialog-log .assistant').first().innerText(),/HbA1c/i);
      });
      await page.close();
    }
    const page=await browser.newPage({viewport:{width:393,height:873},reducedMotion:'reduce'});
    await page.goto(base);
    await check('reduced motion respected',async()=>{
      await page.locator('.dk4-assistant[data-display="3d"] canvas').waitFor({timeout:15000});
      assert.equal(await page.locator('html.dk4-reduced').count(),1);
    });
    await page.close();
  }finally{
    await browser?.close();
    await new Promise(resolve=>server.close(resolve));
    const counts={PASS:results.filter(r=>r.status==='PASS').length,FAIL:results.filter(r=>r.status==='FAIL').length};
    console.log(JSON.stringify({counts,results},null,2));
    if(counts.FAIL)process.exitCode=1;
  }
})().catch(e=>{console.error(e);server.close();process.exitCode=2});
