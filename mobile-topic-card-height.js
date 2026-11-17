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
        height: 154px !important;
        max-height: 154px !important;
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
      #topics .topic > .dk-2026-update { display: none !important; }
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
