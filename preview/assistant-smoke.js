/* Browser smoke checks for the standalone DIA Kompas 4.0 preview.
 * Open preview/assistant-4-prototype.html?smoke=1 in a real browser.
 * These checks do not replace multi-viewport browser E2E.
 */
(async function () {
  'use strict';
  if (new URLSearchParams(location.search).get('smoke') !== '1') return;
  const results = [];
  const check = (name, condition) => results.push({name, status:condition?'PASS':'FAIL'});
  const cards = [...document.querySelectorAll('.card[data-topic]')];
  const modal = document.getElementById('reader');
  check('three topic cards', cards.length === 3);
  check('dialog exists', modal instanceof HTMLDialogElement);
  check('four language choices', document.querySelectorAll('#language option').length === 4);
  check('question field labelled', Boolean(document.querySelector('#question[aria-label]')));
  check('voice toggle exists', Boolean(document.querySelector('#voiceToggle[aria-pressed]')));
  check('no external script dependencies', [...document.scripts].every(x => !x.src || new URL(x.src).origin === location.origin));
  if (cards.length && modal) {
    cards[0].click();
    check('card opens dialog', modal.open);
    check('HbA1c content present', document.getElementById('modalText').textContent.includes('HbA1c'));
    document.getElementById('close').click();
    check('dialog closes', !modal.open);
  }
  const form = document.getElementById('ask');
  const input = document.getElementById('question');
  input.value = 'Co je HbA1c?';
  form.requestSubmit();
  check('prototype explicitly labels response as demo', document.getElementById('answer').textContent.includes('ukázka animace'));
  check('avatar returns idle after demo response', document.getElementById('avatar').dataset.state === 'idle');
  const report = document.createElement('section');
  report.setAttribute('aria-label','Výsledky smoke testů');
  report.style.cssText = 'margin:24px auto;padding:16px;max-width:1100px;border:2px solid #06738c;background:white;border-radius:16px';
  const h = document.createElement('h2');
  h.textContent = 'Smoke test: ' + results.filter(r=>r.status==='PASS').length + '/' + results.length + ' PASS';
  report.append(h);
  const list = document.createElement('ul');
  for (const r of results) { const li=document.createElement('li'); li.textContent=r.status+' — '+r.name; list.append(li); }
  report.append(list);
  document.body.append(report);
  window.__DIA4_SMOKE_RESULTS__ = results;
})();
