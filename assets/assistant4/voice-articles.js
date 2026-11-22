const copy = {
  cs: {
    prefixes: ['krok', 'tema', 'clanek|cislo'],
    numbers: ['jedna|jeden', 'dva|dve', 'tri', 'ctyri', 'pet', 'sest', 'sedm', 'osm', 'devet', 'deset', 'jedenact', 'dvanact'],
    menu: ['Řekněte číslo kroku, například krok jedna.', 'Řekněte číslo nebo název tématu.', 'Řekněte číslo nebo název článku.'],
    choices: ['Bod jedna: přečíst článek znovu.', 'Bod dva: vysvětlit pojem v Názvosloví.', 'Bod tři: zpět do předchozí nabídky.'],
    term: 'Který pojem nebo zkratku chcete vysvětlit?',
    invalid: 'Tuto volbu jsem nerozpoznal.',
    unavailable: 'Text se nepodařilo otevřít nebo přečíst.', find: 'Vyhledat pojem'
  },
  sk: {
    prefixes: ['krok', 'tema', 'clanok|cislo'],
    numbers: ['jeden|jedna', 'dva|dve', 'tri', 'styri', 'pat', 'sest', 'sedem', 'osem', 'devat', 'desat', 'jedenast', 'dvanast'],
    menu: ['Povedzte číslo kroku, napríklad krok jeden.', 'Povedzte číslo alebo názov témy.', 'Povedzte číslo alebo názov článku.'],
    choices: ['Bod jeden: prečítať článok znova.', 'Bod dva: vysvetliť pojem v Názvosloví.', 'Bod tri: späť do predchádzajúcej ponuky.'],
    term: 'Ktorý pojem alebo skratku chcete vysvetliť?',
    invalid: 'Túto voľbu som nerozpoznal.',
    unavailable: 'Text sa nepodarilo otvoriť alebo prečítať.', find: 'Vyhľadať pojem'
  },
  en: {
    prefixes: ['step', 'topic', 'article|number'],
    numbers: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
    menu: ['Say the step number, for example step one.', 'Say the topic number or title.', 'Say the article number or title.'],
    choices: ['Step one: read the article again.', 'Step two: explain a glossary term.', 'Step three: return to the previous menu.'],
    term: 'Which word or abbreviation would you like me to explain?',
    invalid: 'I did not recognize that choice.',
    unavailable: 'The text could not be opened or read.', find: 'Look up term'
  },
  hu: {
    prefixes: ['lepes', 'tema', 'cikk|szam'],
    numbers: ['egy|elso|egyes', 'ket|ketto|masodik|kettes', 'harom|harmadik|harmas', 'negy|negyedik|negyes', 'ot|otodik|otos', 'hat|hatodik|hatos', 'het|hetedik|hetes', 'nyolc|nyolcadik|nyolcas', 'kilenc', 'tiz', 'tizenegy', 'tizenketto'],
    menu: ['Mondja a lépés számát, például: első lépés.', 'Mondja a téma számát vagy címét.', 'Mondja a cikk számát vagy címét.'],
    choices: ['Egyik pont: a cikk újraolvasása.', 'Kettes pont: kifejezés magyarázata a szójegyzékből.', 'Három: vissza az előző menübe.'],
    term: 'Melyik kifejezést vagy rövidítést szeretné megérteni?',
    invalid: 'Nem ismertem fel a választást.',
    unavailable: 'A szöveget nem sikerült megnyitni vagy felolvasni.', find: 'Kifejezés keresése'
  }
};

const closing = {
  cs: {
    lines: [
      'Čtení bylo dokončeno. Máte tři možnosti.',
      'Bod jedna – Přečíst ještě jednou. Řekněte přečíst.',
      'Bod dva – Vyhledat nebo vysvětlit pojmy z textu. Řekněte vyhledat pojmy.',
      'Bod tři – Návrat do předchozí nabídky. Stačí říct návrat.'
    ],
    commands: [/^(precist|precist jeste jednou|znovu)$/, /^(vyhledat pojmy|vysvetlit pojmy)$/, /^navrat$/],
    missing: 'Tento pojem jsem nenašel v dočteném textu a současně v Názvosloví.',
    backFromTerms: 'K původnímu textu se vrátíte příkazem návrat.',
    atMain: 'Jste v hlavní nabídce.'
  },
  sk: {
    lines: [
      'Čítanie bolo dokončené. Máte tri možnosti.',
      'Bod jeden – Prečítať ešte raz. Povedzte prečítať.',
      'Bod dva – Vyhľadať alebo vysvetliť pojmy z textu. Povedzte vyhľadať pojmy.',
      'Bod tri – Návrat do predchádzajúcej ponuky. Stačí povedať návrat.'
    ],
    commands: [/^(precitat|precitat este raz|znova)$/, /^(vyhladat pojmy|vysvetlit pojmy)$/, /^navrat$/],
    missing: 'Tento pojem som nenašiel v dočítanom texte a zároveň v Názvosloví.',
    backFromTerms: 'K pôvodnému textu sa vrátite príkazom návrat.',
    atMain: 'Ste v hlavnej ponuke.'
  },
  en: {
    lines: [
      'Reading is complete. You have three options.',
      'Option one – Read it again. Say read again.',
      'Option two – Look up or explain terms from the text. Say look up terms.',
      'Option three – Return to the previous menu. Just say go back.'
    ],
    commands: [/^(read again|read|reread)$/, /^(look up terms|explain terms)$/, /^go back$/],
    missing: 'I could not find that term in both the text you just heard and the glossary.',
    backFromTerms: 'Say go back to return to the original text.',
    atMain: 'You are in the main menu.'
  },
  hu: {
    lines: [
      'A felolvasás befejeződött. Három lehetőség közül választhat.',
      'Első lehetőség – Újraolvasás. Mondja: olvasd újra.',
      'Második lehetőség – A szövegben szereplő kifejezések keresése vagy magyarázata. Mondja: keress kifejezéseket.',
      'Harmadik lehetőség – Visszatérés az előző menübe. Elég annyit mondania: vissza.'
    ],
    commands: [/^(olvasd ujra|ujraolvasas)$/, /^(keress kifejezeseket|magyarazd el a kifejezeseket)$/, /^vissza$/],
    missing: 'A kifejezés a felolvasott szövegben és a szójegyzékben együtt nem található.',
    backFromTerms: 'Az eredeti szöveghez mondja: vissza.',
    atMain: 'A főmenüben van.'
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

export function createArticleNavigation({ language, speak, silence, resume, microphone, mainPrompt, returnToMain }) {
  let menu;
  let article;
  let glossary = false;
  let finished;
  let controls;
  let termForm;
  let load;

  const words = () => copy[language()];
  const ending = () => closing[language()];
  const reader = () => document.getElementById('dk-modal-reader');
  const closeArticle = () => {
    article = undefined;
    glossary = false;
    finished = undefined;
    load?.abort();
    load = undefined;
    controls?.remove();
    controls = undefined;
    termForm = undefined;
    window.DKModalReader.close();
  };

  function offerChoices(context) {
    finished = context;
    glossary = false;
    if (termForm) termForm.hidden = true;
    if (controls) controls.hidden = false;
    speak(ending().lines);
  }

  function readContent(context, prefix = []) {
    finished = undefined;
    glossary = false;
    if (termForm) termForm.hidden = true;
    if (controls) controls.hidden = true;
    speak([...prefix, ...context.lines], {
      locale: context.locale,
      done: () => offerChoices(context),
      failed: () => {
        if (context.kind === 'article') {
          finished = context;
          controls.hidden = false;
        }
        speak([words().unavailable]);
      }
    });
  }

  function announceMain() {
    menu = undefined;
    const context = {
      kind: 'main', lines: [mainPrompt()],
      back: () => readContent(context, [ending().atMain])
    };
    readContent(context);
  }

  function announceOverview(lines, back) {
    readContent({ kind: 'overview', lines, back });
  }

  function announceMenu(prefix = []) {
    const lines = [menu.title,
      ...menu.items.map((item, index) => (index + 1) + '. ' + item.title),
      words().menu[menu.kind]];
    readContent({ kind: 'menu', lines, back: backFromMenu }, prefix);
  }

  function restoreMenu() {
    if (!menu) {
      announceMain();
      return;
    }
    if (menu.kind === 2 &&
        (menu.parent.kind === 1 || menu.source.getAttribute('aria-expanded') === 'false')) menu.source.click();
    announceMenu();
  }

  function backFromMenu() {
    if (!menu?.parent) {
      returnToMain();
      return;
    }
    const { parent, source } = menu;
    menu = parent;
    if (menu.kind === 1) window.dkShow();
    source.focus({ preventScroll: true });
    source.scrollIntoView({ block: 'nearest' });
    announceMenu();
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

  function readArticle() {
    readContent({ ...article, kind: 'article', back: goBack });
  }

  function glossaryNames(entry) {
    const title = text(entry.querySelector('h2'));
    return [entry.id.slice(6), title, ...title.split(/[:–—()]| - /)]
      .map(normalizeVoice).filter(Boolean);
  }

  function lookup(value) {
    if (!finished) return;
    const key = normalizeVoice(value);
    const compact = key
      .replace(/^(ce ge em|cee gee em)$/, 'cgm')
      .replace(/^ha be a (jedna|jeden|egy|1) ce$/, 'hba1c')
      .replace(/ /g, '');
    const source = ' ' + normalizeVoice(finished.lines.join(' ')) + ' ';
    const entry = select('#glossary-view article[id^="pojem-"]').find(candidate => {
      const names = glossaryNames(candidate);
      return names.some(name => key === name || compact === name) &&
        names.some(name => source.includes(' ' + name + ' '));
    });
    const explanation = text(entry?.querySelector('p'));
    if (!explanation) {
      glossary = true;
      speak([ending().missing, words().term, ending().backFromTerms]);
      return;
    }
    glossary = true;
    if (termForm) termForm.hidden = true;
    speak([text(entry.querySelector('h2')), explanation, ending().backFromTerms]);
  }

  function askTerm() {
    glossary = true;
    if (termForm) termForm.hidden = false;
    speak([words().term, ending().backFromTerms]);
  }

  function handleEnding(command, destination) {
    if (!finished) return false;
    let choice = ending().commands.findIndex(pattern => pattern.test(command));
    if (choice < 0 && finished.kind === 'article' && destination >= 0) {
      choice = destination === 3 ? 1 : destination;
    }
    if (choice === 0) readContent(finished);
    else if (choice === 1) askTerm();
    else if (choice === 2) {
      if (glossary) offerChoices(finished);
      else finished.back();
    } else if (glossary) lookup(command);
    else return false;
    return true;
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
        finished = undefined;
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
    if (handleEnding(command, destination)) return 'závěrečná hlasová nabídka';
    if (finished?.kind === 'overview' && destination === 2) {
      finished.back();
      return 'návrat z přehledu';
    }
    if (article) {
      if (destination === 2) goBack();
      else if (destination === 0) readArticle();
      else if (destination === 1 || destination === 3) {
        finished = { ...article, kind: 'article', back: goBack };
        askTerm();
      } else {
        speak([words().invalid, ...ending().lines]);
        return 'neplatný povel po článku';
      }
    } else if (load && reader()?.open) {
      if (destination === 2) goBack();
      else return 'čekám na načtení článku';
    } else if (finished?.kind !== 'overview' && menu && (destination === -1 || englishStepSelection(command))) {
      const lang = language();
      const item = menu.items[numberFor(command, menu.kind, lang) - 1] ||
        (menu.kind === 0 ? undefined : titleMatch(command, menu.items, menu.kind, lang));
      if (item) selectItem(item);
      else {
        announceMenu([words().invalid]);
        return 'číslo nebo název nebyl nalezen v nabídce';
      }
    } else if (menu && destination === 2) {
      backFromMenu();
    } else if (finished?.kind === 'menu' && (destination === 0 || destination === 1) &&
        /^(?:prosim )?(?:bod|bol|bot|point|step)(?: |[0-9])| pont$/.test(command)) {
      speak([words().invalid, ...ending().lines]);
      return 'povel hlavní nabídky odmítnut v závěrečné nabídce';
    } else if (finished?.kind === 'overview' && destination === -1) {
      speak([words().invalid, ...ending().lines]);
      return 'neplatný povel v přehledu';
    } else {
      if (destination !== 3) menu = undefined;
      return false;
    }
    return 'povel zpracovala hlasová navigace';
  }

  return {
    start, handle, announceMain, announceOverview, restoreMenu,
    state() {
      if (glossary) return 'názvosloví';
      if (article) return 'článek';
      if (load && reader()?.open) return 'načítání článku';
      return menu ? ['kroky', 'témata', 'seznam článků'][menu.kind] : 'hlavní nabídka';
    },
    reset() {
      if (load) closeArticle();
      menu = undefined;
      finished = undefined;
      glossary = false;
    }
  };
}
