const copy = {
  cs: {
    prefixes: ['krok', 'tema', 'clanek|cislo'],
    numbers: ['jedna|jeden', 'dva|dve', 'tri', 'ctyri', 'pet', 'sest', 'sedm', 'osm', 'devet', 'deset', 'jedenact', 'dvanact'],
    menu: ['Řekněte číslo kroku, například krok jedna.', 'Řekněte číslo nebo název tématu.', 'Řekněte číslo nebo název článku.'],
    choices: ['Bod jedna: přečíst článek znovu.', 'Bod dva: vysvětlit pojem v Názvosloví.', 'Bod tři: zpět do předchozí nabídky.'],
    spokenChoices: [
      'Pro opakování článku řekněte bod jedna.',
      'Pro vysvětlení neznámých pojmů řekněte bod dva.',
      'Pro návrat do předchozího menu řekněte bod tři.'
    ],
    term: 'Který pojem nebo zkratku chcete vysvětlit?',
    missing: 'Tento pojem jsem v Názvosloví nenašel. Zkuste jiný pojem.',
    invalid: 'Tuto volbu jsem nerozpoznal.',
    unavailable: 'Text se nepodařilo otevřít nebo přečíst.', find: 'Vyhledat pojem'
  },
  sk: {
    prefixes: ['krok', 'tema', 'clanok|cislo'],
    numbers: ['jeden|jedna', 'dva|dve', 'tri', 'styri', 'pat', 'sest', 'sedem', 'osem', 'devat', 'desat', 'jedenast', 'dvanast'],
    menu: ['Povedzte číslo kroku, napríklad krok jeden.', 'Povedzte číslo alebo názov témy.', 'Povedzte číslo alebo názov článku.'],
    choices: ['Bod jeden: prečítať článok znova.', 'Bod dva: vysvetliť pojem v Názvosloví.', 'Bod tri: späť do predchádzajúcej ponuky.'],
    term: 'Ktorý pojem alebo skratku chcete vysvetliť?',
    missing: 'Tento pojem som v Názvosloví nenašiel. Skúste iný pojem.',
    invalid: 'Túto voľbu som nerozpoznal.',
    unavailable: 'Text sa nepodarilo otvoriť alebo prečítať.', find: 'Vyhľadať pojem'
  },
  en: {
    prefixes: ['step', 'topic', 'article|number'],
    numbers: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
    menu: ['Say the step number, for example step one.', 'Say the topic number or title.', 'Say the article number or title.'],
    choices: ['Step one: read the article again.', 'Step two: explain a glossary term.', 'Step three: return to the previous menu.'],
    term: 'Which word or abbreviation would you like me to explain?',
    missing: 'I could not find that term in the glossary. Try another term.',
    invalid: 'I did not recognize that choice.',
    unavailable: 'The text could not be opened or read.', find: 'Look up term'
  },
  hu: {
    prefixes: ['lepes', 'tema', 'cikk|szam'],
    numbers: ['egy|elso|egyes', 'ket|ketto|masodik|kettes', 'harom|harmadik|harmas', 'negy|negyedik|negyes', 'ot|otodik|otos', 'hat|hatodik|hatos', 'het|hetedik|hetes', 'nyolc|nyolcadik|nyolcas', 'kilenc', 'tiz', 'tizenegy', 'tizenketto'],
    menu: ['Mondja a lépés számát, például: első lépés.', 'Mondja a téma számát vagy címét.', 'Mondja a cikk számát vagy címét.'],
    choices: ['Egyik pont: a cikk újraolvasása.', 'Kettes pont: kifejezés magyarázata a szójegyzékből.', 'Három: vissza az előző menübe.'],
    term: 'Melyik kifejezést vagy rövidítést szeretné megérteni?',
    missing: 'Ez a kifejezés nem található a szójegyzékben. Próbáljon másik kifejezést.',
    invalid: 'Nem ismertem fel a választást.',
    unavailable: 'A szöveget nem sikerült megnyitni vagy felolvasni.', find: 'Kifejezés keresése'
  }
};

const select = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const text = node => (node?.innerText || node?.textContent)?.replace(/\s+/g, ' ').trim() || '';
export const normalizeVoice = value => value.toLowerCase().normalize('NFD')
  .replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

function numberFor(command, menu, lang) {
  const prefix = copy[lang].prefixes[menu];
  let number = command.replace(new RegExp('^(?:' + prefix + ') '), '');
  if (lang === 'hu') number = number.replace(new RegExp(' (?:' + prefix + ')$'), '');
  if (/^\d+$/.test(number)) return Number(number);
  return copy[lang].numbers.findIndex(forms => forms.split('|').includes(number)) + 1;
}

function titleMatch(command, items, kind, lang) {
  const prefix = copy[lang].prefixes[kind];
  const requested = command.replace(new RegExp('^(?:' + prefix + ') '), '');
  const connectors = /^(a|i|aj|vs|versus|and|es)$/;
  const words = value => normalizeVoice(value).split(' ').filter(word => !connectors.test(word))
    .map(word => numberFor(word, kind, lang) || word);
  const spoken = words(requested);
  const named = items.map(item => ({ item, title: words(item.title) }));
  const exact = named.filter(({ title }) => title.join(' ') === spoken.join(' '));
  if (exact.length === 1) return exact[0].item;
  if (exact.length || spoken.length < 2) return undefined;
  const matches = named.filter(({ title }) => title.some((_, index) =>
    spoken.every((word, offset) => word === title[index + offset])));
  return matches.length === 1 ? matches[0].item : undefined;
}

function readingLines(body) {
  const clone = body.cloneNode(true);
  clone.querySelectorAll('nav,footer,button,[hidden],[aria-hidden="true"],script,style').forEach(node => node.remove());
  const blocks = 'article,section,div,h1,h2,h3,h4,h5,h6,p,li,dt,dd,caption,tr,th,td,blockquote,br';
  const extract = node => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const contents = Array.from(node.childNodes, extract).join('');
    return node.matches(blocks) ? '\n' + contents + '\n' : contents;
  };
  return extract(clone).split(/\n+/).flatMap(line => {
    const chunks = [];
    let chunk = '';
    for (const word of line.trim().split(/\s+/)) {
      if (chunk && chunk.length + word.length > 220) {
        chunks.push(chunk);
        chunk = '';
      }
      chunk += (chunk ? ' ' : '') + word;
    }
    if (chunk) chunks.push(chunk);
    return chunks;
  });
}

export function createArticleNavigation({ language, speak, silence, resume, microphone }) {
  let menu;
  let article;
  let glossary = false;
  let controls;
  let termForm;
  let load;

  const words = () => copy[language()];
  const spokenChoices = () => words().spokenChoices || words().choices;
  const reader = () => document.getElementById('dk-modal-reader');
  const closeArticle = () => {
    article = undefined;
    glossary = false;
    load?.abort();
    load = undefined;
    controls?.remove();
    controls = undefined;
    termForm = undefined;
    window.DKModalReader.close();
  };

  function announceMenu(prefix = []) {
    speak([...prefix, menu.title,
      ...menu.items.map((item, index) => (index + 1) + '. ' + item.title),
      words().menu[menu.kind]]);
  }

  function start(index) {
    const nodes = index === 0
      ? select('#zacinam > .wrap > .dk-start-grid > .dk-start-card, #zacinam > .wrap > .dk-start-grid > .dk-start-practical > button')
      : select('#topics .topic');
    menu = {
      kind: index,
      title: text(document.querySelector(index === 0 ? '#dk-start-title' : '#topics [data-i18n="topics"]')),
      items: nodes.map(node => ({ title: text(node.querySelector('h3')), node }))
    };
    announceMenu();
  }

  function selectItem(item) {
    if (menu.kind === 1 || item.node.matches('.dk-start-practical > button')) {
      const parent = menu;
      const topic = menu.kind === 1;
      if (topic || item.node.getAttribute('aria-expanded') === 'false') item.node.click();
      const nodes = topic
        ? select('#articles-view [data-article-cat][data-open-article]:not([hidden])')
        : select('#zacinam .dk-start-practical-panel a[data-dk-journey-article]');
      menu = {
        parent, kind: 2, title: item.title, source: item.node,
        items: nodes.map(node => ({ title: text(node.querySelector('h2,h3') || node), node }))
      };
      announceMenu();
      return;
    }
    openArticle(item.node);
  }

  function goBack() {
    silence();
    closeArticle();
    announceMenu();
  }

  function showChoices() {
    glossary = false;
    termForm.hidden = true;
    controls.hidden = false;
  }

  function readArticle() {
    const current = article;
    glossary = false;
    termForm.hidden = true;
    controls.hidden = true;
    speak(current.lines, {
      locale: current.locale,
      done: () => {
        showChoices();
        speak(spokenChoices());
      },
      failed: () => {
        showChoices();
        speak([words().unavailable, ...spokenChoices()]);
      }
    });
  }

  function guessTerm(value) {
    const key = normalizeVoice(value);
    const compact = key
      .replace(/^(ce ge em|cee gee em)$/, 'cgm')
      .replace(/^ha be a (jedna|jeden|egy|1) ce$/, 'hba1c')
      .replace(/ /g, '');
    return select('#glossary-view article[id^="pojem-"]').find(entry => {
      const title = text(entry.querySelector('h2'));
      const names = [entry.id.slice(6), title, ...title.split(/[:–—()]| - /)];
      return names.some(name => {
        const normalized = normalizeVoice(name);
        return normalized && (key === normalized || compact === normalized);
      });
    });
  }

  function lookup(value) {
    const entry = guessTerm(value);
    const explanation = text(entry?.querySelector('p'));
    if (!explanation) {
      speak([words().missing, words().term]);
      return;
    }
    glossary = false;
    termForm.hidden = true;
    speak([text(entry.querySelector('h2')), explanation, ...spokenChoices()]);
  }

  function askTerm() {
    glossary = true;
    termForm.hidden = false;
    speak([words().term]);
  }

  function openArticle(source) {
    silence();
    source.click();
    const dialog = reader();
    const content = dialog?.querySelector('.dk-modal-content');
    if (!dialog?.open || !content) {
      announceMenu([words().unavailable]);
      return;
    }
    const controller = new AbortController();
    load = controller;
    dialog.addEventListener('close', () => {
      if (dialog.open) return;
      silence();
      closeArticle();
      resume();
    }, { signal: controller.signal });

    const prepare = () => {
      const body = content.firstElementChild;
      if (!body) return false;
      if (body.matches('a')) return false;
      const lines = readingLines(body);
      if (!lines.length) return false;
      article = { lines, locale: body.lang.split('-')[0] || language() };
      controls = document.createElement('div');
      controls.className = 'dk4-article-choices';
      [readArticle, askTerm, goBack].forEach((action, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = words().choices[index];
        button.addEventListener('click', action);
        controls.append(button);
      });
      termForm = document.createElement('form');
      termForm.hidden = true;
      const term = document.createElement('input');
      term.type = 'search';
      term.required = true;
      term.setAttribute('aria-label', words().term);
      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.textContent = words().find;
      termForm.append(term, submit);
      termForm.addEventListener('submit', event => {
        event.preventDefault();
        lookup(term.value);
      });
      controls.append(termForm);
      const mic = document.createElement('button');
      mic.type = 'button';
      const syncMicrophone = () => { mic.textContent = microphone.textContent; };
      syncMicrophone();
      mic.addEventListener('click', () => microphone.click());
      const micObserver = new MutationObserver(syncMicrophone);
      micObserver.observe(microphone, { childList: true });
      const readerObserver = new MutationObserver(() => {
        if (content.firstElementChild === body || !dialog.open) return;
        silence();
        controller.abort();
        load = undefined;
        article = undefined;
        glossary = false;
        controls.remove();
        mic.remove();
        controls = undefined;
        termForm = undefined;
        resume();
      });
      readerObserver.observe(content, { childList: true });
      controller.signal.addEventListener('abort', () => {
        readerObserver.disconnect();
        micObserver.disconnect();
        mic.remove();
      });
      dialog.querySelector('.dk-modal-x').before(mic);
      content.after(controls);
      readArticle();
      return true;
    };
    if (prepare()) return;
    const observer = new MutationObserver(() => {
      if (prepare()) finish();
      else if (content.firstElementChild?.matches('a')) unavailable();
    });
    const finish = () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
    const unavailable = () => {
      closeArticle();
      announceMenu([words().unavailable]);
    };
    const timeout = setTimeout(unavailable, 15000);
    controller.signal.addEventListener('abort', finish, { once: true });
    observer.observe(content, { childList: true });
  }

  function englishStepSelection(command) {
    return language() === 'en' && menu.kind === 0 && command.startsWith('step ');
  }

  function handle(command, destination) {
    if (article) {
      if (destination === 2) goBack();
      else if (destination === 0) readArticle();
      else if (destination === 1 || destination === 3) askTerm();
      else if (glossary) lookup(command);
      else speak([words().invalid, ...spokenChoices()]);
    } else if (load && reader()?.open) {
      if (destination === 2) goBack();
      else return false;
    } else if (menu && (destination === -1 || englishStepSelection(command))) {
      const lang = language();
      const item = menu.items[numberFor(command, menu.kind, lang) - 1] ||
        (menu.kind === 0 ? undefined : titleMatch(command, menu.items, menu.kind, lang));
      if (item) selectItem(item);
      else announceMenu([words().invalid]);
    } else if (menu?.parent && destination === 2) {
      const { parent, source } = menu;
      menu = parent;
      if (menu.kind === 1) window.dkShow();
      source.focus({ preventScroll: true });
      source.scrollIntoView({ block: 'nearest' });
      announceMenu();
    } else {
      menu = undefined;
      return false;
    }
    return true;
  }

  return {
    start, handle,
    reset() {
      if (load) closeArticle();
      menu = undefined;
    }
  };
}
