/* DIA Kompas modal reader. */
(() => {
  'use strict';

  const root = new URL('.', location.href);
  const labels = {
    cs: ['Zavřít', 'Zpět na předchozí text', 'Čtečka DIA Kompas', 'Načítám článek…', 'Článek se nepodařilo načíst. Otevřít samostatně'],
    sk: ['Zavrieť', 'Späť na predchádzajúci text', 'Čítačka DIA Kompas', 'Načítavam článok…', 'Článok sa nepodarilo načítať. Otvoriť samostatne'],
    en: ['Close', 'Back to previous text', 'DIA Kompas reader', 'Loading article…', 'Could not load article. Open separately'],
    hu: ['Bezárás', 'Vissza az előző szöveghez', 'DIA Kompas olvasó', 'Cikk betöltése…', 'A cikk nem tölthető be. Megnyitás külön']
  };
  const language = () => document.documentElement.lang;
  const copy = () => labels[language()] || labels.cs;
  const stack = [];
  let dialog, content, scroll, back, closeTop, closeBottom, title, previousFocus, scrollY;
  let request = 0;
  let reading = false;

  function init() {
    dialog = document.createElement('dialog');
    dialog.id = 'dk-modal-reader';
    dialog.innerHTML = '<div class="dk-modal-shell"><header class="dk-modal-header"><button type="button" class="dk-modal-back"></button><strong class="dk-modal-title"></strong><button type="button" class="dk-modal-x" autofocus>×</button></header><div class="dk-modal-scroll" tabindex="0"><div class="dk-modal-content"></div><footer><button type="button" class="dk-modal-close"></button></footer></div></div>';
    document.body.append(dialog);
    content = dialog.querySelector('.dk-modal-content');
    scroll = dialog.querySelector('.dk-modal-scroll');
    back = dialog.querySelector('.dk-modal-back');
    closeTop = dialog.querySelector('.dk-modal-x');
    closeBottom = dialog.querySelector('.dk-modal-close');
    title = dialog.querySelector('.dk-modal-title');

    closeTop.addEventListener('click', close);
    closeBottom.addEventListener('click', close);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('close', () => { if (!dialog.open) finish(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
    back.addEventListener('click', () => {
      const previous = stack.pop();
      if (!previous) return;
      request++;
      content.replaceChildren(...previous.nodes);
      refresh();
      scroll.scrollTop = previous.top;
      previous.focus?.focus({ preventScroll: true });
    });
  }

  function refresh() {
    const [closeLabel, backLabel, titleLabel] = copy();
    dialog.setAttribute('aria-label', titleLabel);
    title.textContent = titleLabel;
    back.textContent = '← ' + backLabel;
    back.hidden = !stack.length;
    closeTop.setAttribute('aria-label', closeLabel);
    closeBottom.textContent = closeLabel;
  }

  function begin(source) {
    if (!dialog) init();
    if (dialog.open) {
      stack.push({ nodes: [...content.childNodes], top: scroll.scrollTop, focus: source });
    } else {
      previousFocus = source || document.activeElement;
      scrollY = window.scrollY;
      reading = true;
      dialog.showModal();
      document.body.classList.add('dk-modal-active');
    }
    refresh();
    closeTop.focus({ preventScroll: true });
    scroll.scrollTop = 0;
    return ++request;
  }

  function finish() {
    if (!reading) return;
    reading = false;
    request++;
    stack.length = 0;
    content.replaceChildren();
    document.body.classList.remove('dk-modal-active');
    previousFocus?.focus({ preventScroll: true });
    window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
  }

  function close() {
    if (!dialog?.open) return;
    dialog.close();
    finish();
  }

  function prepare(node, url) {
    // Scope local fragment destinations to the reader, including the Dexcom G7 contents.
    node.querySelectorAll('[id]').forEach(element => {
      element.dataset.readerFragment = element.id;
      element.removeAttribute('id');
    });
    node.querySelectorAll('a[href], [src]').forEach(element => {
      const attribute = element.matches('a') ? 'href' : 'src';
      const value = element.getAttribute(attribute);
      if (!value) return;
      if (attribute === 'href' && value.startsWith('#') &&
          [...node.querySelectorAll('[data-reader-fragment]')].some(target => '#' + target.dataset.readerFragment === value)) {
        element.dataset.readerJump = value.slice(1);
        return;
      }
      const resolved = new URL(value, url);
      element.setAttribute(attribute, resolved.href);
      if (attribute === 'href' && resolved.origin !== root.origin && /^https?:$/.test(resolved.protocol)) {
        element.target = '_blank';
        element.rel = 'noopener noreferrer';
      }
    });
    return node;
  }

  function openNode(node, source) {
    begin(source);
    content.replaceChildren(prepare(node.cloneNode(true), location.href));
  }

  async function openUrl(url, source) {
    const token = begin(source);
    content.textContent = copy()[3];
    try {
      const response = await fetch(url, { credentials: 'same-origin' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const article = new DOMParser().parseFromString(await response.text(), 'text/html');
      const locale = new URL(url).searchParams.get('lang');
      const localized = [...article.querySelectorAll('template[data-article-lang]')]
        .find(template => template.dataset.articleLang === locale);
      const main = localized?.content || article.querySelector('main');
      if (!main) throw new Error('Article main missing');
      if (token !== request) return;

      main.querySelectorAll('script,style,iframe,object,embed,form,base').forEach(node => node.remove());
      main.querySelectorAll('*').forEach(node => {
        for (const attribute of [...node.attributes]) {
          if (/^on/i.test(attribute.name) ||
              (/^(href|src)$/i.test(attribute.name) && /^\s*(javascript|data):/i.test(attribute.value))) {
            node.removeAttribute(attribute.name);
          }
        }
      });
      const body = document.createElement('div');
      body.lang = localized ? locale : article.documentElement.lang;
      body.append(...main.childNodes);
      content.replaceChildren(prepare(body, response.url));
    } catch {
      if (token !== request) return;
      const fallback = document.createElement('a');
      fallback.href = url;
      fallback.target = '_blank';
      fallback.rel = 'noopener noreferrer';
      fallback.textContent = copy()[4];
      content.replaceChildren(fallback);
    }
  }

  function openLink(url, anchor) {
    if (anchor.dataset.readerJump && dialog?.open) {
      const target = [...content.querySelectorAll('[data-reader-fragment]')]
        .find(element => element.dataset.readerFragment === anchor.dataset.readerJump);
      if (!target) return false;
      target.scrollIntoView({ block: 'start' });
      return true;
    }
    if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) return false;
    const path = url.pathname.slice(root.pathname.length);
    if (!/^(cs|sk|en|hu)\/clanky\/[a-z0-9-]+\/(?:index\.html)?$/.test(path) &&
        !/^clanky\/alkohol-drogy-diabetes\/(?:index\.html)?$/.test(path)) return false;
    if (path.startsWith('clanky/') && !url.searchParams.has('lang')) url.searchParams.set('lang', language());
    openUrl(url, anchor);
    return true;
  }

  window.DKModalReader = { openNode, openUrl, openLink, close };
})();
