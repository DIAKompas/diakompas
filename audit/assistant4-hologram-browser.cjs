/* Real Chromium. No replacement of the speech or WebGL APIs. */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { spawn } = require('node:child_process');
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { once } = require('node:events');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const questions = { cs: 'Co je HbA1c?', sk: 'Čo je HbA1c?', en: 'What is HbA1c?', hu: 'Mi az a HbA1c?' };
const followups = { cs: 'Jak se to měří?', sk: 'Ako sa to meria?', en: 'How is it measured?', hu: 'Hogyan mérik?' };
const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 393, height: 873 } };
const expected = createHash('sha256').update(readFileSync(path.join(root, 'assets/assistant4/hologram.glb'))).digest('hex');
const results = [];
const output = path.resolve(process.env.DIA38_OUTPUT || path.join(root, 'audit-output/hologram'));
mkdirSync(output, { recursive: true });
const record = (status, name, detail = '') => {
  results.push({ status, name, detail });
  console.log(status, name, detail);
};
async function check(name, fn) {
  try { await fn(); record('PASS', name); }
  catch (error) { record('FAIL', name, error.message.slice(0, 800)); }
}
async function browserServer() {
  const server = spawn('python3', ['-u', '-m', 'http.server', '0', '--bind', '127.0.0.1'], { cwd: root });
  const [data] = await once(server.stdout, 'data');
  const port = String(data).match(/port (\d+)/)?.[1];
  if (!port) throw Error('Local audit server did not start');
  return { base: 'http://127.0.0.1:' + port + '/', server };
}

async function audit(browser, base, device, viewport, lang) {
  const name = lang + ' ' + device;
  const context = await browser.newContext({ viewport, isMobile: device === 'mobile', hasTouch: device === 'mobile' });
  const page = await context.newPage();
  page.setDefaultTimeout(6500);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const welcome = page.locator('#dk4-accessibility');
  const option = number => welcome.locator('button[data-action="' + number + '"]');
  const settings = welcome.locator('[data-action="change"]');
  const voice = welcome.locator('[data-action="voice"]');
  const search = page.locator('#search');
  const history = page.locator('#dk-dialog-log .assistant');
  const canvas = page.locator('.dk4-assistant[data-display="3d"] canvas');
  const audio = page.locator('.dk4-audio');
  const model = page.waitForResponse(response => response.url().includes('/hologram.glb?')).catch(() => null);
  const target = base + '?lang=' + lang;
  await page.goto(target);
  try {
    await check(name + ' fresh visit, three options, focus and accessible names', async () => {
      await option(1).waitFor();
      assert.equal(await page.locator('html').getAttribute('lang'), lang);
      assert.equal(await page.evaluate(() => localStorage.getItem('dk4-communication-mode')), null);
      assert.deepEqual(await page.evaluate(() => [innerWidth, innerHeight, document.documentElement.scrollWidth]),
        [viewport.width, viewport.height, viewport.width]);
      assert.equal(await welcome.getByRole('group').getByRole('button').count(), 3);
      const tree = await welcome.ariaSnapshot();
      assert.match(tree, /region ".+"/);
      for (const digit of [1, 2, 3]) assert.match(tree, new RegExp('button "' + digit + ' – '));
      assert.equal(await welcome.getByRole('status').count(), 1);
      await welcome.locator('[data-action="welcome"]').focus();
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').getAttribute('data-action'), 'listen');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').getAttribute('data-action'), '1');
    });
    await check(name + ' transparent animated GLB, canvas and no solid backdrop', async () => {
      await canvas.waitFor();
      const response = await model;
      assert.ok(response?.ok());
      assert.equal(createHash('sha256').update(await response.body()).digest('hex'), expected);
      assert.equal(await canvas.evaluate(node => node.getContext('webgl2').getContextAttributes().alpha), true);
      assert.equal(await canvas.evaluate(node => getComputedStyle(node.parentNode).backgroundColor), 'rgba(0, 0, 0, 0)');
      const first = await canvas.screenshot();
      await page.waitForTimeout(330);
      assert.notDeepEqual(first, await canvas.screenshot());
    });
    const nativeVoice = await page.evaluate(code => speechSynthesis.getVoices().some(v => v.lang.split('-')[0] === code), lang);
    if (nativeVoice) {
      await check(name + ' native welcome after one activation', async () => {
        await welcome.locator('[data-action="welcome"]').press('Enter');
        await page.waitForFunction(() => speechSynthesis.speaking && !speechSynthesis.pending);
      });
    } else record('BLOCKED', name + ' native welcome', 'No native test voice for this language');
    await check(name + ' keyboard modes 1/2/3, remembered mode and restored focus', async () => {
      await option(1).press('Enter');
      assert.equal(await welcome.getAttribute('data-mode'), '1');
      await settings.press('Enter');
      assert.equal(await page.locator(':focus').getAttribute('id'), 'dk4-accessibility-title');
      await page.keyboard.press('2');
      assert.equal(await welcome.getAttribute('data-mode'), '2');
      await settings.press('Enter');
      await option(3).press('Space');
      await page.reload();
      await settings.waitFor();
      assert.equal(await welcome.getAttribute('data-mode'), '3');
      assert.equal(await option(1).isVisible(), false);
      await voice.press('Enter');
      assert.equal(await welcome.getAttribute('data-mode'), '2');
      await search.fill(questions[lang]);
      await search.press('1');
      assert.match(await search.inputValue(), /1$/);
      await search.fill(questions[lang]);
      await search.press('Enter');
      await history.first().waitFor();
      assert.match(await history.first().innerText(), /HbA1c/i);
      assert.equal(await audio.getAttribute('data-speech-state'), 'idle');
      await page.locator('.dk-dialog-head button').press('Enter');
      assert.ok(!(await history.count()));
    });
    await check(name + ' voice re-enable, readable HbA1c and stable conversation', async () => {
      await voice.press('Enter');
      assert.equal(await welcome.getAttribute('data-mode'), '3');
      const before = page.url();
      const assistantParent = await canvas.evaluate(node => node.closest('.dk4-assistant').parentNode.className);
      await search.fill(questions[lang]);
      await search.press('Enter');
      await history.first().waitFor();
      assert.match(await history.first().innerText(), /HbA1c/i);
      assert.equal(page.url(), before);
      assert.equal(await canvas.evaluate(node => node.closest('.dk4-assistant').parentNode.className), assistantParent);
      assert.ok(await history.first().locator('a').count() >= 2);
    });
    if (nativeVoice) {
      await check(name + ' actual native HbA1c speech and stop', async () => {
        await page.locator('.dk4-audio[data-speech-state="speaking"]').waitFor();
        await audio.getByRole('button').press('Enter');
        await page.locator('.dk4-audio[data-speech-state="idle"]').waitFor();
        await page.waitForFunction(() => !speechSynthesis.speaking && !speechSynthesis.pending);
      });
    } else record('BLOCKED', name + ' native HbA1c speech', 'No native test voice for this language');
    await check(name + ' follow-up preserves both answers and the accessible conversation log', async () => {
      await voice.press('Enter');
      await search.fill(followups[lang]);
      await search.press('Enter');
      await history.nth(1).waitFor();
      assert.equal(await history.count(), 2);
      assert.match(await history.last().innerText(), /HbA1c/i);
      assert.equal(await page.locator('#dk-dialog-log').getAttribute('aria-live'), 'polite');
      assert.equal(await page.locator('#dk-dialog-log').getAttribute('role'), 'log');
      assert.equal(page.url(), target);
    });
    await check(name + ' reduced motion and no JavaScript errors', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const first = await canvas.screenshot();
      await page.waitForTimeout(420);
      assert.deepEqual(await canvas.screenshot(), first);
      assert.deepEqual(errors, []);
    });
    if (lang === 'cs') {
      await page.reload();
      await canvas.waitFor();
      await page.evaluate(() => scrollTo(0,0));
      await page.screenshot({ path: path.join(output, device + '.png') });
    }
  } finally {
    await context.close();
  }
}

async function rotation(browser, base) {
  const page = await browser.newPage({ viewport: viewports.desktop });
  await page.goto(base + '?lang=cs');
  await page.locator('#dk4-accessibility [data-action="2"]').press('Enter');
  const canvas = page.locator('.dk4-assistant[data-display="3d"] canvas');
  await canvas.waitFor();
  const images = [];
  // Record an actual uninterrupted turn. Start the clock after WebGL initialization.
  const started = Date.now();
  for (const [i, angle] of ['front', 'profile', 'rear', 'other-profile', 'full-turn'].entries()) {
    const wait = started + 7500 * i - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    images.push(await canvas.screenshot({ path: path.join(output, angle + '.png') }));
  }
  await check('actual 360-degree turn captures four distinct angles', () => {
    assert.equal(new Set(images.slice(0, 4).map(buffer => createHash('sha256').update(buffer).digest('hex'))).size, 4);
  });
  await page.close();
}

(async () => {
  let browser, server;
  try {
    let base = process.env.DIA38_BASE;
    if (!base) ({ base, server } = await browserServer());
    const args = ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'];
    if (process.env.DIA4_SPEECH_DISPATCHER === '1') args.push('--enable-speech-dispatcher');
    browser = await chromium.launch({ args });
    const turn = process.env.DIA38_ROTATION === '1' ? rotation(browser, base) : Promise.resolve();
    for (const [device, viewport] of Object.entries(viewports))
      for (const lang of Object.keys(questions)) await audit(browser, base, device, viewport, lang);
    await turn;
  } catch (error) {
    record('FAIL', 'browser test runner', error.stack);
  } finally {
    await browser?.close();
    server?.kill();
    const counts = Object.fromEntries(['PASS','FAIL','BLOCKED'].map(key =>
      [key, results.filter(result => result.status === key).length]));
    writeFileSync(path.join(output, 'results.json'), JSON.stringify({ counts, results }, null, 2));
    console.log(counts);
    process.exitCode = counts.FAIL ? 1 : 0;
  }
})();
