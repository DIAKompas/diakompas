/* Real Chromium tests for DIA Kompas 4.0. Tests the actual Pages files and UI. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('node:http');
const { createHash } = require('node:crypto');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp',
  '.glb': 'model/gltf-binary', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };
const prefix = '/diakompas/';
const locales = { cs: 'cs-CZ', sk: 'sk-SK', en: 'en-GB', hu: 'hu-HU' };
const questions = {
  cs: 'Co je HbA1c?', sk: 'Čo je HbA1c?', en: 'What is HbA1c?', hu: 'Mi az a HbA1c?'
};
const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 393, height: 873 } };
const results = [];
const measurements = [];
const modelHash = createHash('sha256').update(fs.readFileSync(path.join(root, 'assets/assistant4/assistant.glb'))).digest('hex');
const screenshots = process.env.DIA4_SCREENSHOTS;
const stopLabels = { cs: 'Zastavit hlas', sk: 'Zastaviť hlas', en: 'Stop speech', hu: 'Felolvasás leállítása' };
let browser;
const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (!url.pathname.startsWith(prefix)) return response.writeHead(404).end();
  const relative = url.pathname.slice(prefix.length) + (url.pathname.endsWith('/') ? 'index.html' : '');
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep)) return response.writeHead(404).end();
  fs.readFile(file, (error, data) => {
    if (error) return response.writeHead(404).end();
    response.writeHead(200, { 'Content-Type': type[path.extname(file)] || 'application/octet-stream' }).end(data);
  });
});

function record(status, name, detail = '') {
  results.push({ status, name, detail });
  console.log(status, name, detail);
}

async function check(name, callback) {
  try {
    await callback();
    record('PASS', name);
  } catch (error) {
    record('FAIL', name, String(error).slice(0, 800));
  }
}

async function waitFor(page, selector) {
  await page.locator(selector).waitFor({ state: 'visible' });
}

async function run() {
  if (screenshots) fs.mkdirSync(screenshots, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port + prefix;
  const launchArgs = ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'];
  if (process.env.DIA4_SPEECH_DISPATCHER === '1') launchArgs.push('--enable-speech-dispatcher');
  browser = await chromium.launch({ args: launchArgs });

  for (const [view, viewport] of Object.entries(viewports)) {
    for (const [language, locale] of Object.entries(locales)) {
      const context = await browser.newContext({ viewport, locale, hasTouch: view === 'mobile', isMobile: view === 'mobile' });
      const page = await context.newPage();
      page.setDefaultTimeout(6500);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(base) && response.status() >= 400) errors.push(response.status() + ' ' + response.url());
      });
      const scope = language + ' ' + view;
      const guide = page.locator('.dk4-assistant');
      const audio = page.locator('.dk4-audio button');
      const log = page.locator('#dk-dialog-log');
      const opened = Date.now();
      const request = page.waitForResponse(response => new URL(response.url()).pathname === prefix + 'assets/assistant4/assistant.glb');
      await page.goto(base + '?lang=' + language, { waitUntil: 'load' });
      await waitFor(page, '.dk4-assistant');
      await check(scope + ' initial viewport, locale and automatic controls', async () => {
        assert.equal(await page.locator('html').getAttribute('lang'), language);
        assert.deepEqual(await page.evaluate(() => [innerWidth, innerHeight, document.documentElement.scrollWidth]),
          [viewport.width, viewport.height, viewport.width]);
        assert.notEqual((await guide.locator('h2').innerText()).trim(), '');
        await page.waitForFunction(() => document.querySelector('.dk4-portrait').naturalWidth === 160);
        assert.equal(await guide.getByRole('button').count(), 0);
        assert.equal(await page.evaluate(() => Boolean(window.speechSynthesis?.speaking)), false);
        const timings = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          const resources = performance.getEntriesByType('resource').filter(r => r.name.includes('/assets/assistant4/'));
          return { domReadyMs: Math.round(navigation.domContentLoadedEventEnd),
            assistantResourceBytes: resources.reduce((total, r) => total + r.encodedBodySize, 0) };
        });
        measurements.push({ scope, ...timings });
      });
      await check(scope + ' new GLB starts automatically and draws live 3D', async () => {
        await waitFor(page, '.dk4-assistant[data-display="3d"] canvas');
        const response = await request;
        assert.equal(response.status(), 200);
        assert.equal(createHash('sha256').update(await response.body()).digest('hex'), modelHash);
        const canvas = guide.locator('canvas');
        const modelBytes = await page.evaluate(() =>
          performance.getEntriesByType('resource').find(asset => new URL(asset.name).pathname.endsWith('/assistant.glb')).encodedBodySize);
        assert.ok(modelBytes > 0 && modelBytes <= 900 * 1024);
        Object.assign(measurements.find(entry => entry.scope === scope) || {},
          { avatarReadyMs: Date.now() - opened, modelBytes });
        assert.equal(await canvas.evaluate(c => Boolean(c.getContext('webgl2'))), true);
        assert.notDeepEqual(await canvas.screenshot(), await canvas.screenshot(),
          'Idle animation should change rendered frames');
        if (screenshots && language === 'cs') {
          await page.screenshot({ path: path.join(screenshots, view + '.png') });
          await canvas.screenshot({ path: path.join(screenshots, view + '-avatar.png') });
        }
      });
      await check(scope + ' real guide, contextual response, links and keyboard reset', async () => {
        const search = page.locator('#search');
        await search.fill(questions[language]);
        assert.equal(await guide.getAttribute('data-guide-state'), 'typing');
        await search.press('Enter');
        await waitFor(page, '#dk-dialog-log .assistant');
        assert.equal(await guide.getAttribute('data-guide-state'), 'answered');
        assert.ok(await guide.evaluate(node => Boolean(node.closest('#dk-dialog-panel'))));
        await waitFor(page, '#dk-dialog-panel .dk4-assistant[data-display="3d"] canvas');
        assert.match(await log.locator('.assistant').last().innerText(), /HbA1c/i);
        assert.ok(await log.locator('.assistant a[href]').count() >= 2);
        const voices = await page.evaluate(code => window.speechSynthesis?.getVoices().filter(v =>
          v.lang.split(/[-_]/)[0].toLowerCase() === code).length, language);
        const speaking = page.locator('.dk4-audio[data-speech-state="speaking"]');
        const began = await speaking.waitFor({ timeout: voices ? 6000 : 900 }).then(() => true, () => false);
        if (!began && !voices) {
          assert.equal(await audio.isEnabled(), true, 'Text is available and manual voice retry is offered');
          record('BLOCKED', scope + ' native automatic playback and stop', 'Chromium has no voice for this locale');
        } else {
          await check(scope + ' native automatic playback and stop', async () => {
            assert.ok(began, 'Matching voice was listed, but automatic playback did not begin');
            assert.equal(await audio.innerText(), stopLabels[language]);
            await audio.click();
            await page.locator('.dk4-audio[data-speech-state="idle"]').waitFor();
            await page.waitForFunction(() => !speechSynthesis.speaking && !speechSynthesis.pending);
          });
        }
        await page.locator('.dk-dialog-head button').press('Enter');
        assert.equal(await log.locator('.assistant').count(), 0);
        assert.equal(await guide.getAttribute('data-guide-state'), 'idle');
        assert.equal(await search.evaluate(node => node === document.activeElement), true);
      });
      await check(scope + ' 3D learning models, rotation, sources and 2D mode', async () => {
        const section = page.locator('.dk4-learning');
        const choices = section.locator(':scope > .dk4-buttons button');
        const modelControls = section.locator('.dk4-lesson button');
        assert.equal(await choices.count(), 3);
        for (const [index, label] of ['CGM', 'HbA1c', 'nutrition'].entries()) {
          await choices.nth(index).click();
          assert.equal(await choices.nth(index).getAttribute('aria-pressed'), 'true', label);
          assert.equal(await section.locator('.dk4-diagram').getAttribute('data-lesson'), String(index));
          assert.match(await section.locator('a').getAttribute('href'), /^https:\/\//);
        }
        await modelControls.first().click();
        const canvas = section.locator('canvas');
        await canvas.waitFor({ state: 'visible' });
        const silhouettes = [];
        for (const choice of await choices.all()) {
          await choice.click();
          silhouettes.push(await canvas.screenshot({ animations: 'disabled' }));
        }
        assert.notDeepEqual(silhouettes[0], silhouettes[1]);
        assert.notDeepEqual(silhouettes[1], silhouettes[2]);
        const previous = silhouettes[2];
        await modelControls.nth(2).press('Enter');
        const after = await canvas.screenshot({ animations: 'disabled' });
        assert.notDeepEqual(previous, after);
        await modelControls.first().click();
        await section.locator('.dk4-diagram').waitFor({ state: 'visible' });
      });
      await check(scope + ' keyboard cards, reader focus and payment QR', async () => {
        const topic = page.locator('#topics .topic').first();
        const heading = (await topic.locator('h3').innerText()).trim().replace(/\s+/g, ' ');
        assert.ok((await topic.getAttribute('aria-label')).endsWith(heading));
        await topic.press('Enter');
        await waitFor(page, '#articles-view.active');
        await page.locator('header .logo').click();

        const article = page.locator('#home #articles .article[data-open-article]').first();
        await article.press('Enter');
        const dialog = page.getByRole('dialog').and(page.locator('#dk-modal-reader[open]'));
        await dialog.waitFor();
        await page.keyboard.press('Tab');
        assert.equal(await dialog.evaluate(node => node.contains(document.activeElement)), true);
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden' });
        assert.equal(await article.evaluate(node => node === document.activeElement), true);

        await page.locator('#dk-donate-open').click();
        await waitFor(page, '#dk-donate-dialog[open] #dk-donate-qr-container svg');
        assert.ok(await page.locator('#dk-donate-qr-container svg path').count() > 0);
        await page.locator('#dk-donate-close').click();
        await page.locator('#dk-donate-dialog').waitFor({ state: 'hidden' });
      });
      await check(scope + ' no JS errors or missing local assets', () => assert.deepEqual(errors, []));
      await context.close();
    }
  }

  for (const [label, args] of [
    ['system reduced motion', { reducedMotion: 'reduce' }],
    ['hardware acceleration unavailable', {}]
  ]) {
    const noWebGL = label === 'hardware acceleration unavailable';
    const engine = noWebGL ? await chromium.launch({ args: ['--disable-webgl'] }) : browser;
    const context = await engine.newContext({ ...args, viewport: viewports.mobile, hasTouch: true });
    const page = await context.newPage();
    await page.goto(base);
    await check(label + ' and working guide', async () => {
      const shell = page.locator('.dk4-assistant');
      if (label === 'hardware acceleration unavailable') {
        await waitFor(page, '.dk4-assistant[data-display="fallback"] img');
        await page.locator('.dk4-lesson button').first().click();
        await waitFor(page, '.dk4-diagram');
        assert.ok(await page.locator('.dk4-lesson button').first().isDisabled());
      } else {
        await waitFor(page, '.dk4-assistant[data-display="3d"] canvas');
        assert.ok(await page.locator('html.dk4-reduced').count());
        const canvas = shell.locator('canvas');
        assert.deepEqual(await canvas.screenshot(), await canvas.screenshot());
        await shell.locator('canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
        await waitFor(page, '.dk4-assistant[data-display="fallback"] img');
      }
      await page.locator('#search').fill('What is CGM?');
      await page.locator('#search').press('Enter');
      await waitFor(page, '#dk-dialog-log .assistant');
    });
    await context.close();
    if (noWebGL) await engine.close();
  }
}

run().catch(error => record('BLOCKED', 'Browser runner', String(error))).finally(async () => {
  const engine = browser?.version();
  await browser?.close();
  server.close();
  const counts = Object.fromEntries(['PASS', 'FAIL', 'BLOCKED'].map(status =>
    [status, results.filter(result => result.status === status).length]));
  const report = { engine, counts, measurements, results };
  if (process.env.DIA4_REPORT) fs.writeFileSync(process.env.DIA4_REPORT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ engine, counts, measurements }));
  process.exitCode = counts.FAIL ? 1 : counts.BLOCKED ? 2 : 0;
});
