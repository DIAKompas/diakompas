const { chromium }=require('playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const base=process.env.DIA_TEST_URL||'http://127.0.0.1:8765/';
 const sizes=[{width:320,height:720},{width:360,height:800},{width:393,height:873},{width:768,height:1024},{width:1024,height:768},{width:1280,height:800},{width:1440,height:900},{width:1920,height:1080}];
 const report={url:base,checks:[],errors:[],warnings:[],limits:['Automated Chromium is not TalkBack/NVDA','Touch target bounding boxes do not prove real touch usability','No voice or microphone checks']};
 for(const size of sizes){
  const context=await browser.newContext({viewport:size,hasTouch:size.width<=768,isMobile:size.width<=768,deviceScaleFactor:1});
  const page=await context.newPage();
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForTimeout(500);
  const info=await page.evaluate(()=>{
   const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
   const nodes=[...document.querySelectorAll('a[href],button,input,select,textarea,[role="button"]')].filter(visible);
   const targets=nodes.map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,text:(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'').trim().slice(0,55),w:Math.round(r.width),h:Math.round(r.height),html:e.outerHTML.slice(0,150)}});
   return {innerWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth,lang:document.documentElement.lang,controls:nodes.length,smallTargets:targets.filter(x=>x.w<24||x.h<24).slice(0,30),under44:targets.filter(x=>x.w<44||x.h<44).length,unlabeled:targets.filter(x=>!x.text).slice(0,12)};
  });
  const focused=[];
  for(let i=0;i<8;i++){await page.keyboard.press('Tab');focused.push(await page.evaluate(()=>({tag:document.activeElement?.tagName,text:(document.activeElement?.getAttribute('aria-label')||document.activeElement?.textContent||'').trim().slice(0,50),outline:getComputedStyle(document.activeElement).outlineStyle})));}
  info.focusSequence=focused;
  const rec={viewport:size,...info};
  report.checks.push(rec);
  if(info.scrollWidth>info.innerWidth+2)report.errors.push('horizontal overflow at '+size.width+': '+info.scrollWidth);
  if(focused.every(x=>x.tag==='BODY'))report.errors.push('no keyboard focus at '+size.width);
  if(info.unlabeled.length)report.warnings.push('unlabeled controls at '+size.width+': '+info.unlabeled.length);
  if(info.smallTargets.length)report.warnings.push('under-24px target dimensions at '+size.width+': '+info.smallTargets.length);
  await context.close();
 }
 await browser.close();
 fs.mkdirSync('test-results',{recursive:true});
 fs.writeFileSync('test-results/p3-accessibility-browser.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({url:base,summary:report.checks.map(x=>({width:x.viewport.width,scrollWidth:x.scrollWidth,controls:x.controls,under44:x.under44,small:x.smallTargets.map(t=>({text:t.text,w:t.w,h:t.h}))})),errors:report.errors,warnings:report.warnings},null,2));
 if(report.errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=2});
