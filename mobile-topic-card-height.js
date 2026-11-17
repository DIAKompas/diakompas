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
        height: 294px !important;
        max-height: 294px !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }
      #topics .topic-img { height: 64px !important; flex: 0 0 64px !important; }
      #topics .topic > h3 {
        flex: 1 1 auto !important;
        padding: 8px 6px !important;
        margin: 0 !important;
        min-height: 0 !important;
        font-size: 12px !important;
        line-height: 1.35 !important;
      }
      /* The full 2026 update remains available on desktop; the mobile card
         opens the corresponding topic and its articles without a long excerpt. */
      #topics .topic > .dk-2026-update {
        display: block !important;
        flex: 0 0 auto !important;
        min-height: 0 !important;
        padding: 0 6px 8px !important;
        overflow: hidden !important;
      }
      #topics .topic .dk-2026-label,
      #topics .topic .dk-2026-update h4,
      #topics .topic .dk-2026-update p:last-child { display: none !important; }
      #topics .topic .dk-2026-update > p:not(.dk-2026-label):not(:last-child) {
        display: -webkit-box !important;
        -webkit-box-orient: vertical !important;
        -webkit-line-clamp: 3 !important;
        overflow: hidden !important;
        max-height: 4.2em !important;
        font-size: 11px !important;
        line-height: 1.4 !important;
        margin: 0 !important;
      }
      #topics .topic > h3 { flex: 0 0 auto !important; }

    }
  `;
  document.head.append(style);
  const sync = () => {
    if (!mq.matches) {
      document.documentElement.style.removeProperty('--dk-start-card-height');
      return;
    }
    const cards = [...document.querySelectorAll('#zacinam .dk-start-card')]
      .filter(el => el.getClientRects().length);
    if (!cards.length) return;
    /* Do not derive topic height from stretched start-grid items: their measured
       height can exceed 400px on phones and leave large blank cards. */
  };
  const init = () => {
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
