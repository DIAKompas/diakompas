// Run: npx playwright test tests/assistant.spec.cjs --browser chromium
const {test,expect}=require('@playwright/test');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const preview=pathToFileURL(path.resolve(__dirname,'../preview/index.html')).href;
const cases=[
 ['🇨🇿 CZ',['Mám vysoký cukr','A co jednotky?','Co je HbA1c?','A jak se to měří?','Co je TIR?','Jaký je rozdíl mezi CGM a glukometrem?','Můžu jíst banány?','Kolik inzulinu si mám píchnout?'],['hyperglykemie','mg/dl','HbA1c','krevního vzorku','TIR','kapilární krve','Banány','neposuzuji']],
 ['🇸🇰 SK',['Mám vysoký cukor','A čo jednotky?','Čo je HbA1c?','A ako sa to meria?','Čo je TIR?','Aký je rozdiel medzi CGM a glukomerom?','Môžem jesť banány?','Koľko inzulínu si mám pichnúť?'],['hyperglykémia','mg/dl','HbA1c','krvnej vzorky','TIR','kapilárnej krvi','Banány','neposudzujem']],
 ['🇬🇧 EN',['I have high blood sugar','What about units?','What is HbA1c?','And how is it measured?','What is TIR?','What is the difference between CGM and a glucose meter?','Can I eat bananas?','How much insulin should I inject?'],['hyperglycaemia','mg/dL','HbA1c','blood sample','TIR','capillary blood','Bananas','cannot assess']],
 ['Magyar',['Magas a vércukrom','És a mértékegységek?','Mi a HbA1c?','És hogyan mérik?','Mi a TIR?','Mi a különbség a CGM és a vércukormérő között?','Ehetek banánt?','Mennyi inzulint adjak be?'],['hiperglikémia','mg/dl','HbA1c','vérmintából','TIR','kapilláris','Banán','nem értékelem']]
];
async function ready(page,label='🇨🇿 CZ'){
 await page.goto(preview);
 const frame=page.frameLocator('#guide');
 await expect(frame.locator('#search')).toHaveAttribute('aria-controls','dk-dialog-panel');
 await frame.getByRole('button',{name:label,exact:true}).click();
 return frame;
}
async function ask(frame,question,expected){
 await frame.locator('#search').fill(question);
 await frame.locator('#search').press('Enter');
 await expect(frame.locator('#dk-dialog-log article').last()).toContainText(expected);
}
for(const [label,questions,expected] of cases){
 test('contextual scenarios '+label,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const frame=await ready(page,label);
  for(let i=0;i<questions.length;i++)await ask(frame,questions[i],expected[i]);
  await expect(frame.locator('#search')).toBeVisible();
  expect(errors).toEqual([]);
 });
}
test('feedback, twenty repetitions and reset',async({page})=>{
 const frame=await ready(page);
 await ask(frame,'Co je TIR?','TIR');
 await frame.locator('#dk-dialog-log article').last().getByRole('button',{name:'Ano',exact:true}).click();
 await expect(frame.locator('#dk-dialog-log article').last()).toContainText('Děkujeme za hodnocení.');
 await ask(frame,'Co je HbA1c?','HbA1c');
 await frame.locator('#dk-dialog-log article').last().getByRole('button',{name:'Ne',exact:true}).click();
 await expect(frame.locator('#dk-dialog-log article').last()).toContainText('Děkujeme za hodnocení.');
 for(let i=0;i<20;i++)await ask(frame,i%2?'A co jednotky?':'Mám vysoký cukr',i%2?'mg/dl':'hyperglykemie');
 await expect(frame.locator('#dk-dialog-log article')).toHaveCount(16);
 await frame.getByRole('button',{name:'Nový rozhovor',exact:true}).click();
 await expect(frame.locator('#dk-dialog-log article')).toHaveCount(0);
 await ask(frame,'Co je TIR?','TIR');
});
for(const width of [390,360]){
 test('mobile viewport '+width,async({page})=>{
  await page.setViewportSize({width,height:800});
  const frame=await ready(page);
  await ask(frame,'Mám vysoký cukr','hyperglykemie');
  await ask(frame,'A co jednotky?','mg/dl');
  await expect(frame.locator('#search')).toBeVisible();
  await expect(frame.locator('#searchBtn')).toBeVisible();
  const size=await frame.locator('html').evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth}));
  expect(size.scroll).toBeLessThanOrEqual(size.client);
 });
}
