/* Connect legacy home, article and glossary entry points to the reader. */
(() => {
  'use strict';

  const reader = window.DKModalReader;
  const legacyArticle = window.dkArticle;
  const root = new URL('.', location.href);
  const language = () => document.documentElement.lang;

  function openArticle(id, source) {
    if (!DK_ARTICLES.some(article => article.id === id)) return false;
    if (id === 'alkohol-drogy-diabetes') {
      const url = new URL('clanky/alkohol-drogy-diabetes/', root);
      url.searchParams.set('lang', language());
      reader.openUrl(url, source);
      return true;
    }

    // Reuse the localized renderer without changing the document route or visible view.
    const original = document.getElementById('article-body');
    const body = original.cloneNode(false);
    original.replaceWith(body);
    dkArticleRenderId = id;
    try {
      legacyArticle(id);
    } finally {
      dkArticleRenderId = null;
      body.replaceWith(original);
    }
    body.id = 'dk-modal-article-body';
    reader.openNode(body, source);
    return true;
  }

  window.dkArticle = function (id) {
    if (!openArticle(id, document.activeElement)) legacyArticle(id);
  };

  function openTerm(id, source) {
    const entry = document.getElementById('pojem-' + id);
    if (!entry) return false;
    const definition = entry.cloneNode(true);
    definition.removeAttribute('id');
    definition.querySelectorAll('[data-glossary-return],.dk-term-return').forEach(button => button.remove());
    reader.openNode(definition, source);
    return true;
  }

  const onRoot = url => url.origin === root.origin &&
    (url.pathname === root.pathname || url.pathname === root.pathname + 'index.html');

  // Window capture runs before the document's legacy route handlers.
  window.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey ||
        event.shiftKey || event.altKey) return;

    const source = event.target.closest?.('a[href],button,summary,input,select,textarea,[data-open-article],#recipes .recipe');
    if (!source) return;
    const inside = Boolean(source.closest('#dk-modal-reader'));
    const anchor = source.matches('a[href]') && !source.target && !source.hasAttribute('download');
    const url = anchor ? new URL(source.href) : null;
    const article = source.closest('[data-open-article]')?.dataset.openArticle ||
      source.dataset.dkJourneyArticle || source.dataset.dkSocialArticle ||
      (url && onRoot(url) && url.hash.match(/^#clanek-([a-z0-9-]+)$/)?.[1]);
    const term = source.dataset.term ||
      (url && onRoot(url) && url.hash.match(/^#pojem-([a-z0-9-]+)$/)?.[1]);

    let handled = false;
    if (article) handled = openArticle(article, source);
    else if (term) handled = openTerm(term, source);
    else if (anchor) handled = reader.openLink(url, source);
    else if (!inside && source.matches('#recipes .recipe')) {
      reader.openNode(source, source);
      handled = true;
    }

    if (handled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    } else if (inside && url && onRoot(url)) {
      // These destination links intentionally leave the reader.
      reader.close();
      if (url.hash === '#domu') {
        event.preventDefault();
        showPage('home');
        location.hash = url.hash;
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }
  }, true);

  function enhanceRecipes() {
    document.querySelectorAll('#recipes .recipe:not([data-dk-modal-enhanced])').forEach(card => {
      card.dataset.dkModalEnhanced = '1';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.addEventListener('keydown', event => {
        if (event.target !== card || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        reader.openNode(card, card);
      });
    });
  }

  const recipes = document.getElementById('recipes');
  if (recipes) {
    enhanceRecipes();
    new MutationObserver(enhanceRecipes).observe(recipes, { childList: true, subtree: true });
  }
})();
