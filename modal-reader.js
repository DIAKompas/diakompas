/* DIA Kompas modal reader — experimental, test branch only */
(() => {
  'use strict';
  const root = '/diakompas/';
  const translations = {
    cs:{close:'Zavřít',back:'Zpět na předchozí článek',title:'Čtečka DIA Kompas',loading:'Načítám článek…',error:'Článek se nepodařilo načíst. Otevřít samostatně'},
    sk:{close:'Zavrieť',back:'Späť na predchádzajúci článok',title:'Čítačka DIA Kompas',loading:'Načítavam článok…',error:'Článok sa nepodarilo načítať. Otvoriť samostatne'},
    en:{close:'Close',back:'Previous article',title:'DIA Kompas reader',loading:'Loading article…',error:'Could not load article. Open separately'},
    hu:{close:'Bezárás',back:'Előző cikk',title:'DIA Kompas olvasó',loading:'Cikk betöltése…',error:'A cikk nem tölthető be. Megnyitás külön'}
  };
  let dialog, content, back, closeBottom, title, origin, scrollY=0, previousFocus, stack=[], current=null, request=0;
  const lang=()=>{const p=new URLSearchParams(location.search).get('lang');return translations[p]?p:(translations[document.documentElement.lang]?document.documentElement.lang:'cs');};
  const t=()=>translations[lang()];
  function eligible(anchor) {
    if(!anchor || anchor.target || anchor.hasAttribute('download')) return null;
    let u;try{u=new URL(anchor.href,location.href)}catch{return null}
    if(u.origin!==location.origin || !u.pathname.startsWith(root)) return null;
    if(!/^\/(?:diakompas\/)(cs|sk|en|hu)\/clanky\/[^/]+\/?(?:index\.html)?$/.test(u.pathname))return null;
    return u;
  }
  function init(){
    dialog=document.createElement('dialog');dialog.id='dk-modal-reader';dialog.setAttribute('aria-label',t().title);
    dialog.innerHTML='<div class="dk-modal-shell"><header class="dk-modal-header"><button type="button" class="dk-modal-back"></button><strong class="dk-modal-title"></strong><button type="button" class="dk-modal-x" aria-label="Close">×</button></header><div class="dk-modal-scroll" tabindex="0"><div class="dk-modal-content"></div><footer><button type="button" class="dk-modal-close"></button></footer></div></div>';
    document.body.append(dialog);
    content=dialog.querySelector('.dk-modal-content');back=dialog.querySelector('.dk-modal-back');title=dialog.querySelector('.dk-modal-title');closeBottom=dialog.querySelector('.dk-modal-close');
    dialog.querySelector('.dk-modal-x').addEventListener('click',()=>dialog.close());
    closeBottom.addEventListener('click',()=>dialog.close());
    back.addEventListener('click',()=>{const url=stack.pop();if(url)load(url,false)});
    dialog.addEventListener('close',()=>{request++;stack=[];current=null;document.body.classList.remove('dk-modal-active');window.scrollTo(0,scrollY);if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});});
    dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
    dialog.addEventListener('cancel',()=>{});
    refresh();
  }
  function refresh(){const l=t();dialog.setAttribute('aria-label',l.title);title.textContent=l.title;back.textContent='← '+l.back;back.hidden=!stack.length;closeBottom.textContent=l.close;dialog.querySelector('.dk-modal-x').setAttribute('aria-label',l.close);}
  async function load(url,push=true){
    if(push && current)stack.push(current);
    current=url;refresh();content.textContent=t().loading;
    const token=++request;
    try{
      const response=await fetch(url,{credentials:'same-origin'});if(!response.ok)throw Error('HTTP '+response.status);
      const doc=new DOMParser().parseFromString(await response.text(),'text/html');
      const main=doc.querySelector('main');if(!main)throw Error('Article main missing');
      if(token!==request)return;
      // Never inject remote scripts, styles, forms, inline handlers, or unsafe URL schemes.
      main.querySelectorAll('script,style,iframe,object,embed,form,base').forEach(n=>n.remove());
      main.querySelectorAll('*').forEach(n=>{
        [...n.attributes].forEach(a=>{if(/^on/i.test(a.name)||((a.name==='href'||a.name==='src')&&/^\s*(javascript|data):/i.test(a.value)))n.removeAttribute(a.name)});
      });
      content.replaceChildren(...[...main.childNodes].map(n=>document.importNode(n,true)));
      content.querySelectorAll('a[href]').forEach(a=>{
        const u=eligible(a);if(u)return;
        const href=new URL(a.href,location.href);
        if(href.origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer'}
      });
      dialog.querySelector('.dk-modal-scroll').scrollTop=0;
    }catch(e){
      if(token!==request)return;
      content.replaceChildren();
      const a=document.createElement('a');a.href=url;a.textContent=t().error;content.append(a);
    }
  }
  document.addEventListener('click',e=>{
    const anchor=e.target.closest?.('a[href]');const url=eligible(anchor);
    if(!url || e.defaultPrevented || e.button!==0 || e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    e.preventDefault();
    if(!dialog)init();
    if(!dialog.open){previousFocus=anchor;scrollY=window.scrollY;stack=[];current=null;dialog.showModal();document.body.classList.add('dk-modal-active')}
    load(url.href,true);
  },true);
})();
