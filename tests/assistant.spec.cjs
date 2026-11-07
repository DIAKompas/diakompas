// Browser smoke test for preview/index.html. Run: npx playwright test tests/assistant.spec.cjs
const {test,expect}=require('@playwright/test');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const preview=pathToFileURL(path.resolve(__dirname,'../preview/index.html')).href;
test('open, ask twice, reset, close and reopen',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(preview);
 const launch=page.locator('#dk-assistant-launcher');
 await expect(launch,'Chat launcher missing. Browser errors: '+errors.join(' | ')).toBeVisible({timeout:5000});
 await launch.click();
 await expect(page.locator('#dk-assistant-panel')).toBeVisible();
 await page.locator('#dk-assistant-question').fill('vysoký cukr');
 await page.locator('#dk-assistant-form button').click();
 await expect(page.locator('#dk-assistant-log')).toContainText('hyperglykémii');
 await page.locator('#dk-assistant-question').fill('A co jednotky?');
 await page.locator('#dk-assistant-form button').click();
 await expect(page.locator('#dk-assistant-log')).toContainText('mmol/l');
 await page.locator('#dk-assistant-panel header button').first().click();
 await expect(page.locator('#dk-assistant-log')).not.toContainText('hyperglykémii');
 await page.locator('#dk-assistant-panel header button').last().click();
 await expect(page.locator('#dk-assistant-panel')).toBeHidden();
 await launch.click();
 await expect(page.locator('#dk-assistant-panel')).toBeVisible();
});
for(const [lang,question,expected] of [['cs','nízký cukr','hypoglykémii'],['sk','vysoký cukor','hyperglykémiu'],['en','high blood sugar','hyperglycaemia'],['hu','magas vércukor','hiperglikémia']]){
 test('language '+lang,async({page})=>{
  await page.goto(preview);
  await page.locator('#language').selectOption(lang);
  await page.locator('#dk-assistant-launcher').click();
  await page.locator('#dk-assistant-question').fill(question);
  await page.locator('#dk-assistant-form button').click();
  await expect(page.locator('#dk-assistant-log')).toContainText(expected);
 });
}
test('medical dosing request is refused',async({page})=>{
 await page.goto(preview);
 await page.locator('#dk-assistant-launcher').click();
 await page.locator('#dk-assistant-question').fill('Kolik inzulinu si mam dat?');
 await page.locator('#dk-assistant-form button').click();
 await expect(page.locator('#dk-assistant-log')).toContainText('Nemohu posoudit');
});
