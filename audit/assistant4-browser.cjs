/* Real Chromium tests for DIA Kompas 4.0. Tests the actual Pages files and UI. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('node:http');
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
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port + prefix;
  browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });

  for (const [view, viewport] of Object.entries(viewports)) {
    for (const [language, locale] of Object.entries(locales)) {
      const context = await browser.newContext({ viewport, locale, hasTouch: view === 'mobile', isMobile: view === 'mobile' });
      const page = await context.newPage();
      page.setDefaultTimeout(6500);
      const errors = [];
      const assets = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(base) && response.status() >= 400) errors.push(response.status() + ' ' + response.url());
      });
      page.on('requestfinished', request => {
        if (request.url().includes('/assets/assistant4/')) assets.push(request.url().split('/').pop());
      });
      const scope = language + ' ' + view;
      const guide = page.locator('.dk4-assistant');
      const audio = page.locator('.dk4-audio button');
      const log = page.locator('#dk-dialog-log');
      await page.goto(base + '?lang=' + language, { waitUntil: 'load' });
      await waitFor(page, '.dk4-assistant');
      await check(scope + ' initial viewport, locale and lazy loading', async () => {
        assert.equal(await page.locator('html').getAttribute('lang'), language);
        assert.deepEqual(await page.evaluate(() => [innerWidth, innerHeight, document.documentElement.scrollWidth]),
          [viewport.width, viewport.height, viewport.width]);
        assert.notEqual((await guide.locator('h2').innerText()).trim(), '');
        await page.waitForFunction(() => document.querySelector('.dk4-portrait').naturalWidth === 160);
        assert.ok(!assets.includes('assistant.glb') && !assets.includes('three-vendor.js'));
        assert.equal(await page.evaluate(() => Boolean(window.speechSynthesis?.speaking)), false);
        const timings = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          const resources = performance.getEntriesByType('resource').filter(r => r.name.includes('/assets/assistant4/'));
          return { domReadyMs: Math.round(navigation.domContentLoadedEventEnd),
            initialAssistantBytes: resources.reduce((total, r) => total + r.encodedBodySize, 0) };
        });
        assert.ok(timings.initialAssistantBytes < 32 * 1024);
        measurements.push({ scope, ...timings });
      });
      await check(scope + ' real 3D avatar, reduced animation and 2D toggle', async () => {
        const toggle = guide.locator('button').first();
        const motion = guide.locator('button').last();
        const activated = Date.now();
        await toggle.click();
        await waitFor(page, '.dk4-assistant[data-display="3d"] canvas');
        const modelBytes = await page.evaluate(() =>
          performance.getEntriesByType('resource').find(asset => asset.name.endsWith('/assistant.glb')).encodedBodySize);
        assert.ok(modelBytes > 0 && modelBytes <= 900 * 1024);
        Object.assign(measurements.find(entry => entry.scope === scope) || {},
          { avatarReadyMs: Date.now() - activated, modelBytes });
        const canvas = guide.locator('canvas');
        assert.equal(await canvas.evaluate(c => Boolean(c.getContext('webgl2'))), true);
        await motion.click();
        assert.equal(await motion.getAttribute('aria-pressed'), 'false');
        assert.equal(await page.locator('html').evaluate(node => node.classList.contains('dk4-reduced')), true);
        await toggle.click();
        await waitFor(page, '.dk4-assistant[data-display="2d"] img');
        await toggle.click();
        await waitFor(page, '.dk4-assistant[data-display="3d"] canvas');
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
        assert.equal(await page.evaluate(() => Boolean(window.speechSynthesis?.speaking)), false);

        const voices = await page.evaluate(code => window.speechSynthesis?.getVoices().filter(v =>
          v.localService && v.lang.split(/[-_]/)[0].toLowerCase() === code).length, language);
        if (!voices) {
          assert.ok(await audio.isDisabled());
          record('BLOCKED', scope + ' native playback and stop', 'No matching local voice in Chromium');
        } else {
          await audio.click();
          await page.waitForFunction(() => speechSynthesis.speaking);
          await audio.click();
          await page.waitForFunction(() => !speechSynthesis.speaking && !speechSynthesis.pending);
          record('PASS', scope + ' native playback and stop');
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
      await shell.locator('button').first().click();
      if (label === 'hardware acceleration unavailable') {
        await waitFor(page, '.dk4-assistant[data-display="fallback"] img');
        await page.locator('.dk4-lesson button').first().click();
        await waitFor(page, '.dk4-diagram');
        assert.ok(await page.locator('.dk4-lesson button').first().isDisabled());
      } else {
        await waitFor(page, '.dk4-assistant[data-display="3d"] canvas');
        const control = shell.locator('button').last();
        assert.equal(await control.getAttribute('aria-pressed'), 'false');
        assert.equal(await control.isDisabled(), true);
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
