/* Chromium regression for issue #30. Uses the actual Pages files and browser UI. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createServer } = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const repo = path.resolve(__dirname, '..');
const pages = new URL('https://diakompas.github.io/diakompas/');
const live = process.env.ISSUE30_LIVE === '1';
const externalInventory = process.env.ISSUE30_EXTERNAL_INVENTORY;
const languages = { cs: 'cs-CZ', sk: 'sk-SK', en: 'en-GB', hu: 'hu-HU' };
const views = { desktop: { width: 1440, height: 900 }, mobile: { width: 393, height: 873 } };
const modal = '#dk-modal-reader[open]';
const localizedAlcohol = {
  cs: [/Alkohol, drogy a diabetes/i, /Proč na tom záleží/, /Časté otázky/],
  sk: [/Alkohol, drogy a diabetes/i, /Prečo na tom záleží/, /Časté otázky/],
  en: [/Alcohol, drugs and diabetes/i, /Why it matters/, /Frequently asked questions/],
  hu: [/Alkohol, drogok és cukorbetegség/i, /Miért fontos/, /Gyakori kérdések/]
};
const results = [];
const links = new Map();
let browser, server, origin;

function record(result, test, error) {
  results.push({ result, test, ...(error ? { error: String(error).slice(0, 1000) } : {}) });
  if (result !== 'PASS') console.error(result, test, String(error).slice(0, 1000));
}

async function check(test, fn) {
  try {
    await fn();
    record('PASS', test);
  } catch (error) {
    record('FAIL', test, error);
  }
}

function serve() {
  const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
    '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
  server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith(pages.pathname)) return res.writeHead(404).end();
    const file = path.resolve(repo, url.pathname.slice(pages.pathname.length));
    if (file !== repo && !file.startsWith(repo + path.sep)) return res.writeHead(404).end();
    const target = url.pathname.endsWith('/') ? path.join(file, 'index.html') : file;
    fs.readFile(target, (err, data) => {
      if (err) return res.writeHead(404).end();
      res.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream' }).end(data);
    });
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => {
    resolve('http://127.0.0.1:' + server.address().port);
  }));
}

async function contextFor(lang, view) {
  const context = await browser.newContext({
    viewport: views[view], locale: languages[lang], isMobile: view === 'mobile',
    hasTouch: view === 'mobile', reducedMotion: 'reduce'
  });
  if (!live && !externalInventory) {
    // Preserve the real origin and URL structure while serving files from this checkout.
    await context.route(pages.href + '**', async route => {
      const url = new URL(route.request().url());
      const response = await route.fetch({ url: origin + url.pathname + url.search });
      await route.fulfill({ response });
    });
  }
  return context;
}

async function openPage(page, suffix = '') {
  const response = await page.goto(pages.href + suffix, { waitUntil: 'domcontentloaded' }) ||
    await page.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200);
}

async function state(page) {
  return page.evaluate(() => ({
    url: location.href,
    views: [...document.querySelectorAll('#home,.content-view,.subpage,#nav a,#nav')].map(node => node.className),
    y: window.scrollY
  }));
}

async function samePage(page, before) {
  const after = await state(page);
  assert.equal(after.url, before.url);
  assert.deepEqual(after.views, before.views);
  assert.ok(Math.abs(after.y - before.y) <= 4, `Page scrolled from ${before.y} to ${after.y}`);
}

async function inventory(container, label) {
  const anchors = await container.locator('a[href]').evaluateAll(nodes =>
    nodes.map(node => ({ href: node.href, text: node.textContent.trim(), jump: node.dataset.readerJump }))
  );
  for (const anchor of anchors) {
    if (anchor.jump) continue;
    if (!links.has(anchor.href)) links.set(anchor.href, new Set());
    links.get(anchor.href).add(label + ' · ' + anchor.text);
  }
  return anchors;
}

async function close(page) {
  if (await page.locator(modal).count()) {
    await page.keyboard.press('Escape');
    await page.locator(modal).waitFor({ state: 'hidden' });
  }
}

async function languageChecks(page, context, lang) {
  await openPage(page);
  const assertLang = async expected => {
    assert.equal(await page.locator('html').getAttribute('lang'), expected);
    assert.equal(await page.locator('.langs button.active').getAttribute('data-lang'), expected);
  };
  await assertLang(lang);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await assertLang(lang);
  const other = lang === 'hu' ? 'sk' : 'hu';
  await openPage(page, '?lang=' + lang);
  await page.locator('.langs button[data-lang="' + other + '"]').click();
  await assertLang(other);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await assertLang(other);
  const next = await context.newPage();
  try {
    await openPage(next);
    assert.equal(await next.locator('html').getAttribute('lang'), other);
  } finally {
    await next.close();
  }
}

async function glossaryChecks(page, lang, label) {
  await openPage(page, '?lang=' + lang + '#nazvoslovi');
  await page.locator('#glossary-view.active').waitFor();
  const terms = page.locator('#glossary-view button[data-term]');
  assert.ok(await terms.count() >= 15);
  for (const term of await terms.all()) {
    const id = await term.getAttribute('data-term');
    await check(label + ' glossary ' + id, async () => {
      await term.scrollIntoViewIfNeeded();
      const before = await state(page);
      const title = await page.locator('#pojem-' + id + ' h2').textContent();
      await term.click();
      assert.equal(await page.locator(modal + ' .dk-modal-content h2').first().textContent(), title);
      await inventory(page.locator(modal + ' .dk-modal-content'), label + ' glossary ' + id);
      await close(page);
      await samePage(page, before);
      assert.ok(await term.evaluate(node => node === document.activeElement));
    });
  }
}

async function articleChecks(page, lang, label) {
  await openPage(page, '?lang=' + lang + '#clanky');
  const cards = page.locator('#articles-view [data-open-article]');
  assert.ok(await cards.count() >= 20);
  for (const card of await cards.all()) {
    const id = await card.getAttribute('data-open-article');
    await check(label + ' article ' + id, async () => {
      await close(page);
      if (!(await card.isVisible())) await openPage(page, '?lang=' + lang + '#clanky');
      await card.scrollIntoViewIfNeeded();
      const before = await state(page);
      const heading = page.locator(modal + ' .dk-modal-content h1');
      await card.click();
      assert.ok((await heading.innerText()).length > 4);
      await samePage(page, before);
      const reader = page.locator(modal + ' .dk-modal-content');
      assert.ok((await reader.innerText()).length > 120);
      if (id === 'alkohol-drogy-diabetes') {
        const [title, body, faq] = localizedAlcohol[lang];
        assert.match(await heading.innerText(), title);
        assert.match(await reader.innerText(), body);
        assert.match(await reader.innerText(), faq);
        assert.equal(await reader.locator('div[lang]').getAttribute('lang'), lang);
      }
      const labelWithArticle = label + ' ' + id;
      const all = await inventory(reader, labelWithArticle);
      for (const details of await reader.locator('details:not([open])').all()) await details.locator('summary').click();
      const titleBefore = await heading.innerText();
      const anchors = reader.locator('a[href]');
      for (let i = 0; i < all.length; i++) {
        const item = all[i];
        const url = new URL(item.href);
        const term = url.hash.match(/^#pojem-([a-z0-9-]+)$/)?.[1];
        const next = url.hash.startsWith('#clanek-') || /^\/(?:diakompas\/)(cs|sk|en|hu)\/clanky\/[^/]+\/$/.test(url.pathname);
        if (!item.jump && !term && !next) continue;
        await check(labelWithArticle + ' link ' + (i + 1) + ' ' + item.href, async () => {
          const anchor = anchors.nth(i);
          await anchor.click();
          if (item.jump) {
            assert.equal(await heading.innerText(), titleBefore);
            await samePage(page, before);
            return;
          }
          if (term) {
            const expected = await page.locator('#pojem-' + term + ' h2').textContent();
            assert.equal(await reader.locator('h2').first().textContent(), expected);
          } else {
            assert.ok((await heading.innerText()).length > 4);
          }
          await samePage(page, before);
          await page.locator(modal + ' .dk-modal-back').click();
          assert.equal(await heading.innerText(), titleBefore);
          assert.ok(await anchor.evaluate(node => node === document.activeElement));
        });
        if (!(await heading.count()) || await heading.innerText() !== titleBefore) {
          await close(page);
          await openPage(page, '?lang=' + lang + '#clanky');
          await card.click();
          for (const details of await reader.locator('details:not([open])').all()) await details.locator('summary').click();
        }
      }
      await page.locator(modal + ' .dk-modal-x').click();
      await samePage(page, before);
      assert.ok(await card.evaluate(node => node === document.activeElement));
    });
  }
}

async function sectionChecks(page, lang, view, label) {
  await openPage(page, '?lang=' + lang);
  await inventory(page.locator('body'), label + ' home and navigation');
  await check(label + ' localized home, glossary entry and modal close controls', async () => {
    const labels = { cs: /Názvosloví/, sk: /Názvoslovie/, en: /Glossary/, hu: /Fogalomtár/ };
    const teaser = page.locator('.dk-glossary-teaser');
    assert.match(await teaser.locator('h2').textContent(), labels[lang]);
    await teaser.locator('button').click();
    assert.ok(await page.locator('#glossary-view.active').isVisible());
    await page.locator('header .logo').click();
    const card = page.locator('#articles .article').first();
    if (view === 'mobile') await card.tap();
    else await card.press('Enter');
    await page.locator(modal + ' h1').waitFor();
    await page.locator(modal + ' .dk-modal-close').click();
    assert.equal(await page.locator(modal).count(), 0);
  });
  await check(label + ' layout and seven Start link destinations', async () => {
    const geometry = await page.evaluate(() => {
      const grid = selector => getComputedStyle(document.querySelector(selector)).gridTemplateColumns.split(' ').length;
      return {
        viewport: { width: innerWidth, height: innerHeight }, overflow: document.documentElement.scrollWidth - innerWidth,
        start: grid('#zacinam .dk-start-grid'), topics: grid('#topics .topics')
      };
    });
    assert.deepEqual(geometry.viewport, views[view]);
    assert.ok(geometry.overflow <= 2);
    if (view === 'mobile') {
      assert.equal(geometry.start, 4);
      assert.equal(geometry.topics, 4);
    }
    const cards = page.locator('#zacinam > .wrap > .dk-start-grid > a.dk-start-card');
    assert.equal(await cards.count(), 7);
    for (const card of await cards.all()) {
      await card.click();
      await page.locator(modal + ' h1').waitFor();
      await close(page);
    }
    const practical = page.locator('#zacinam .dk-start-practical > button');
    await practical.click();
    assert.equal(await practical.getAttribute('aria-expanded'), 'true');
    for (const link of await page.locator('#zacinam .dk-start-practical-panel a').all()) {
      await link.click();
      await page.locator(modal + ' h1').waitFor();
      await close(page);
    }
    await practical.click();
  });

  await check(label + ' topic filters, calculator, about and home', async () => {
    const topics = page.locator('#topics .topic');
    assert.equal(await topics.count(), 6);
    for (const topic of await topics.all()) {
      await topic.locator('h3').click();
      assert.ok(await page.locator('#articles-view [data-open-article]:visible').count());
      await page.locator('header .logo').click();
    }
    for (const section of ['calc', 'about', 'home']) {
      const link = page.locator('#nav [data-page="' + section + '"]');
      if (!(await link.isVisible())) await page.locator('#hamb').click();
      await link.click();
      assert.ok(await page.locator('#' + section).isVisible());
      if (section === 'calc') {
        await page.locator('#glucose').fill('5');
        assert.match(await page.locator('#result').innerText(), /90 mg\/dl/);
      }
    }
  });
  await check(label + ' guide links and reset', async () => {
    const queries = { cs: 'Co je HbA1c?', sk: 'Čo je HbA1c?', en: 'What is HbA1c?', hu: 'Mi az a HbA1c?' };
    await openPage(page, '?lang=' + lang);
    await page.locator('#search').fill(queries[lang]);
    await page.locator('#searchBtn').click();
    const answer = page.locator('#dk-dialog-log .assistant').last();
    assert.match(await answer.innerText(), /HbA1c/i);
    await inventory(answer, label + ' guide answer');
    const term = answer.locator('a[href$="#pojem-hba1c"]').first();
    await term.click();
    assert.match(await page.locator(modal + ' h2').first().innerText(), /HbA1c/i);
    await close(page);
    await page.locator('.dk-dialog-head button').click();
    assert.equal(await page.locator('#dk-dialog-log > *').count(), 0);
  });
}

async function staticArticles(page, lang, label) {
  const directories = fs.readdirSync(path.join(repo, lang, 'clanky'), { withFileTypes: true })
    .filter(entry => entry.isDirectory()).map(entry => lang + '/clanky/' + entry.name + '/');
  for (const dir of [lang + '/clanky/', ...directories, 'clanky/alkohol-drogy-diabetes/']) {
    await check(label + ' direct ' + dir, async () => {
      const suffix = dir.startsWith('clanky/') ? '?lang=' + lang : '';
      await openPage(page, dir + suffix);
      assert.equal(await page.locator('html').getAttribute('lang'), lang);
      assert.ok(await page.locator('main h1').isVisible());
      const privacy = page.locator('dialog[open][aria-labelledby="privacy-title"] .privacy-actions button').nth(1);
      if (await privacy.isVisible()) await privacy.click();
      const anchors = await inventory(page.locator('body'), label + ' direct ' + dir);
      for (let i = 0; i < anchors.length; i++) {
        const term = new URL(anchors[i].href).hash.match(/^#pojem-([a-z0-9-]+)$/)?.[1];
        if (!term) continue;
        await check(label + ' direct ' + dir + ' glossary link ' + (i + 1), async () => {
          const link = page.locator('body a[href]').nth(i);
          if (!(await link.isVisible())) {
            const summary = link.locator('xpath=ancestor::details[not(@open)][1]/summary');
            if (await summary.count()) await summary.click();
          }
          await link.click();
          await page.waitForURL(url => url.hash === '#pojem-' + term).catch(async () => {
            assert.equal(new URL(page.url()).hash, '#pojem-' + term);
          });
          assert.ok(await page.locator('#pojem-' + term + ' h2').isVisible());
        });
        await openPage(page, dir + suffix);
        if (await privacy.isVisible()) await privacy.click();
      }
    });
  }
}

async function liveChecks(page, context, lang, view, label) {
  await check(label + ' production language and manual preference', () => languageChecks(page, context, lang));
  await check(label + ' production contents and modal return', async () => {
    await openPage(page, '?lang=' + lang + '#clanky');
    for (const [id, term] of [['cgm', 'cgm'], ['hba1c-vysledky', 'hba1c']]) {
      const card = page.locator('#articles-view [data-open-article="' + id + '"]');
      await card.scrollIntoViewIfNeeded();
      const before = await state(page);
      await card.click();
      const reader = page.locator(modal + ' .dk-modal-content');
      const target = reader.locator('a[href$="#pojem-' + term + '"]:visible').first();
      await target.click();
      assert.match(await reader.locator('h2').first().innerText(), new RegExp(term, 'i'));
      await page.locator(modal + ' .dk-modal-back').click();
      await reader.locator('h1').waitFor();
      await close(page);
      await samePage(page, before);
    }
    await page.locator('#articles-view [data-open-article="alkohol-drogy-diabetes"]').click();
    const reader = page.locator(modal + ' .dk-modal-content');
    const [title, body, faq] = localizedAlcohol[lang];
    assert.match(await reader.locator('h1').innerText(), title);
    const content = await reader.innerText();
    assert.match(content, body);
    assert.match(content, faq);
    await close(page);
  });
  await sectionChecks(page, lang, view, label + ' production');
}

async function linkDestinations() {
  const context = await contextFor('en', 'desktop');
  const page = await context.newPage();
  const urls = [...links.keys()].filter(url => /^https?:/.test(url));
  const local = externalInventory ? [] : urls.filter(url => url.startsWith(pages.href));
  for (const url of local) {
    await check('internal destination ' + url, async () => {
      await openPage(page, url.slice(pages.href.length));
      const id = new URL(url).hash.slice(1);
      if (!id) return;
      if (id.startsWith('clanek-')) {
        const heading = page.locator('#article-view.active h1, #dk-modal-reader[open] h1, body:not(:has(#home)) main h1');
        await heading.first().waitFor();
        return;
      }
      const sections = {
        domu: 'home', temata: 'topics-view', clanky: 'articles-view', recepty: 'recipes',
        prevodnik: 'calc', glykemie: 'calc', oprojektu: 'about', nazvoslovi: 'glossary-view', 'socialni-site': 'social-view'
      };
      const target = page.locator('[id=' + JSON.stringify(sections[id] || decodeURIComponent(id)) + ']');
      await target.first().waitFor();
    });
  }
  if (process.env.ISSUE30_EXTERNAL !== '0') {
    const external = urls.filter(url => !url.startsWith(pages.href));
    await Promise.all(Array.from({ length: 6 }, async () => {
      const tab = await context.newPage();
      try {
        while (external.length) {
          const url = external.pop();
          const test = 'external destination ' + url;
          let onDownload;
          const downloadStarted = new Promise(resolve => { onDownload = resolve; });
          tab.once('download', onDownload);
          try {
            const navigate = () => tab.goto(url, { waitUntil: 'commit', timeout: 18000 });
            const response = await navigate();
            let status = response?.status();
            if (status === 429) {
              const retryAfter = Number(response.headers()['retry-after'] || 3);
              if (Number.isFinite(retryAfter) && retryAfter >= 0 && retryAfter <= 30) {
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                status = (await navigate())?.status();
              }
            }
            if (status >= 200 && status < 400) record('PASS', test);
            else if ([404, 410].includes(status)) record('FAIL', test, 'HTTP ' + status);
            else record('BLOCKED', test, 'HTTP ' + status);
          } catch (error) {
            if (/Download is starting/.test(String(error))) {
              await check(test + ' PDF download', async () => {
                const download = await Promise.race([
                  downloadStarted, new Promise(resolve => setTimeout(() => resolve(null), 5000))
                ]);
                assert.ok(download, 'No browser download event');
                assert.equal(await download.failure(), null);
                const file = await fs.promises.open(await download.path(), 'r');
                try {
                  const signature = Buffer.alloc(5);
                  await file.read(signature, 0, signature.length, 0);
                  assert.equal(signature.toString(), '%PDF-');
                } finally {
                  await file.close();
                }
              });
            } else {
              record('BLOCKED', test, error);
            }
          } finally {
            tab.removeListener('download', onDownload);
          }
        }
      } finally {
        await tab.close();
      }
    }));
  }
  await context.close();
}

(async () => {
  if (!live && !externalInventory) origin = await serve();
  const proxy = process.env.ISSUE30_BROWSER_PROXY;
  browser = await chromium.launch(proxy ? { proxy: { server: proxy, bypass: '127.0.0.1,localhost' } } : {});
  if (externalInventory) {
    const reports = fs.readdirSync(externalInventory, { withFileTypes: true }).filter(entry => entry.isDirectory());
    assert.equal(reports.length, 8, 'Expected all eight Windows browser inventories');
    for (const report of reports) {
      const file = path.join(externalInventory, report.name, 'results.json');
      for (const { url, contexts } of JSON.parse(fs.readFileSync(file)).links) {
        if (!links.has(url)) links.set(url, new Set());
        for (const context of contexts) links.get(url).add(context);
      }
    }
    await linkDestinations();
    return;
  }
  for (const view of Object.keys(views)) for (const lang of Object.keys(languages)) {
    const label = lang + ' ' + view;
    if (process.env.ISSUE30_SCOPE && process.env.ISSUE30_SCOPE !== label.replace(' ', '-')) continue;
    const context = await contextFor(lang, view);
    const page = await context.newPage();
    page.setDefaultTimeout(6500);
    page.setDefaultNavigationTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      if (live) {
        await liveChecks(page, context, lang, view, label);
      } else {
        await check(label + ' locale initialization, reload and new tab', () => languageChecks(page, context, lang));
        await sectionChecks(page, lang, view, label);
        await glossaryChecks(page, lang, label);
        await articleChecks(page, lang, label);
        await staticArticles(page, lang, label);
      }
      await check(label + ' runtime errors', async () => assert.deepEqual(errors, []));
    } catch (error) {
      record('BLOCKED', label + ' audit interrupted', error);
    } finally {
      await context.close();
      console.log(label, results.reduce((n, result) => n + Number(result.test.startsWith(label)), 0), 'checks');
    }
  }
  if (!live) await linkDestinations();
})().catch(error => record('BLOCKED', 'test runner', error)).finally(async () => {
  const engine = browser?.version();
  await browser?.close();
  server?.close();
  const counts = { PASS: 0, FAIL: 0, BLOCKED: 0 };
  results.forEach(({ result }) => counts[result]++);
  const out = path.resolve(process.env.ISSUE30_OUTPUT || 'audit-output/issue-30');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({
    engine, platform: os.platform(), live, counts, results,
    links: [...links].map(([url, contexts]) => ({ url, contexts: [...contexts] }))
  }, null, 2));
  console.log(counts);
  if (counts.FAIL || counts.BLOCKED) process.exitCode = 1;
});
