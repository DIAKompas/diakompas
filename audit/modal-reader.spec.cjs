// Run from repository root with Playwright installed:
// npx playwright test audit/modal-reader.spec.cjs
const { test, expect } = require('@playwright/test');
const url = process.env.DK_TEST_URL || 'http://127.0.0.1:8000/';
for(const lang of ['cs','sk','en','hu']){
  for(const viewport of [{width:393,height:873},{width:1440,height:900}]){
    test(`modal reader ${lang} ${viewport.width}px preserves context`,async({browser})=>{
      const context=await browser.newContext({viewport});
      const page=await context.newPage();
      await page.goto(url+'?lang='+lang,{waitUntil:'domcontentloaded'});
      await page.locator('[data-open-article]').first().waitFor();
      const before=await page.evaluate(()=>({url:location.href,scroll:window.scrollY}));
      await page.locator('[data-open-article]').first().click();
      await expect(page.locator('#dk-modal-reader')).toBeVisible();
      await expect(page.locator('#dk-modal-article-body')).toBeVisible();
      await page.locator('#dk-modal-reader .dk-modal-close').click();
      await expect(page.locator('#dk-modal-reader')).not.toBeVisible();
      const after=await page.evaluate(()=>({url:location.href,scroll:window.scrollY}));
      expect(after.url).toBe(before.url);
      expect(Math.abs(after.scroll-before.scroll)).toBeLessThan(8);
      await context.close();
    });
  }
}
test('direct article link still resolves as standalone HTML',async({page})=>{
  await page.goto(url+'cs/clanky/cgm/');
  await expect(page.locator('main h1')).toBeVisible();
});
