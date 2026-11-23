// Read-only real Chromium keyboard/mobile checks. Run against public production; no mutations.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true});
  const url='https://diakompas.github.io/diakompas/';
  const report={url,checks:[],failures:[],warnings:[]};
  for(const viewport of [{width:393,height:873},{width:1440,height:900}]){
    const page=await browser.newPage({viewport});
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForTimeout(1500);
    const x=await page.evaluate(()=>{
      const w=document.documentElement.scrollWidth,inner=window.innerWidth;
      const visible=el=>{const r=el.getBoundingClientRect(),st=getComputedStyle(el);return r.width>0&&r.height>0&&st.visibility!=='hidden'&&st.display!=='none'};
      const buttons=[...document.querySelectorAll('button,a,input,select,textarea,[role=button]')].filter(visible);
      const unlabeled=buttons.filter(el=>!(el.innerText||el.getAttribute('aria-label')||el.getAttribute('title')||el.getAttribute('alt')||'').trim()).slice(0,20).map(el=>el.outerHTML.slice(0,200));
      const small=buttons.filter(el=>{const r=el.getBoundingClientRect();return r.width<24||r.height<24}).slice(0,20).map(el=>({text:(el.innerText||el.getAttribute('aria-label')||'').slice(0,45),w:Math.round(el.getBoundingClientRect().width),h:Math.round(el.getBoundingClientRect().height)}));
      return {scrollWidth:w,innerWidth:inner,controls:buttons.length,unlabeled,small,lang:document.documentElement.lang};
    });
    if(x.scrollWidth>x.innerWidth+2){
      const offenders=await page.evaluate(()=>[...document.querySelectorAll('body *')].map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,cls:String(el.className||'').slice(0,110),id:el.id,right:Math.round(r.right),left:Math.round(r.left),width:Math.round(r.width),position:getComputedStyle(el).position}}).filter(o=>o.right>window.innerWidth+2&&o.left<o.right&&o.position!=='fixed').sort((a,b)=>b.right-a.right).slice(0,20));
      x.overflowOffenders=offenders;
    }
    report.checks.push({viewport,...x});
    if(x.scrollWidth>x.innerWidth+2)report.failures.push('horizontal overflow at '+viewport.width+'px');
    if(x.unlabeled.length)report.warnings.push('unlabeled controls at '+viewport.width+'px: '+x.unlabeled.length);
    await page.keyboard.press('Tab');
    const focus=await page.evaluate(()=>({tag:document.activeElement?.tagName,label:document.activeElement?.getAttribute('aria-label')||document.activeElement?.textContent?.trim().slice(0,60),outline:getComputedStyle(document.activeElement).outlineStyle}));
    report.checks[report.checks.length-1].firstTab=focus;
    if(focus.tag==='BODY')report.failures.push('Tab did not focus interactive control at '+viewport.width+'px');
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(report,null,2));
  if(report.failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=2});
