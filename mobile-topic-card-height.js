/* Approved DIA Kompas 3.0 mobile design: topic cards match the Start with Diabetes cards. */
(() => {
  'use strict';
  const mq = window.matchMedia('(max-width: 600px)');
  const style = document.createElement('style');
  style.id = 'dk-mobile-topic-height-20261117';
  style.textContent = `
    @media (max-width: 600px) {
      #topics .topic {
        box-sizing: border-box !important;
        height: var(--dk-start-card-height, 144px) !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }
      #topics .topic-img { height: 36px !important; flex: 0 0 36px !important; }
      #topics .topic > h3 {
        flex: 0 0 auto !important;
        padding: 5px 6px 2px !important;
        margin: 0 !important;
        min-height: 0 !important;
        font-size: 12px !important;
        line-height: 1.35 !important;
      }
      /* Keep the full update on desktop and show a readable teaser on phones. */
      #topics .topic > .dk-2026-update { display: none !important; }
      #topics .topic > .dk-mobile-topic-teaser {
        display: -webkit-box !important;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        overflow: hidden;
        margin: 0 6px 5px;
        padding: 0;
        font-size: 10.5px;
        line-height: 1.3;
        color: #526f88;
        overflow-wrap: anywhere;
      }
    }
  `;
  document.head.append(style);
  const prepareTeasers = () => {
    document.querySelectorAll('#topics .topic').forEach(card => {
      if (card.querySelector('.dk-mobile-topic-teaser')) return;
      const paragraphs = [...card.querySelectorAll('.dk-2026-update p')];
      const source = paragraphs.find(p => !p.classList.contains('dk-2026-label') && !p.querySelector('a') && p.textContent.trim().length > 30);
      if (!source) return;
      const teaser = document.createElement('p');
      teaser.className = 'dk-mobile-topic-teaser';
      teaser.textContent = source.textContent.trim();
      teaser.style.display = 'none';
      card.append(teaser);
    });
  };
  const sync = () => {
    if (!mq.matches) {
      document.documentElement.style.removeProperty('--dk-start-card-height');
      return;
    }
    const cards = [...document.querySelectorAll('#zacinam .dk-start-card')]
      .filter(el => el.getClientRects().length);
    if (!cards.length) return;
    const height = Math.ceil(Math.max(...cards.map(el => el.getBoundingClientRect().height)));
    if (height > 0) document.documentElement.style.setProperty('--dk-start-card-height', height + 'px');
  };
  const init = () => {
    prepareTeasers();
    sync();
    const start = document.getElementById('zacinam');
    if (start && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(sync);
      start.querySelectorAll('.dk-start-card').forEach(el => observer.observe(el));
    }
    mq.addEventListener?.('change', sync);
    window.addEventListener('resize', sync, {passive:true});
    document.fonts?.ready?.then(sync);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
