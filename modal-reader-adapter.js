/* Experimental adapter for DIA Kompas legacy in-page articles and recipes. */
(() => {
  'use strict';
  function isActive(el){return !!el && getComputedStyle(el).display!=='none' && !el.hidden;}
  function currentView(){return [...document.querySelectorAll('#home,#topics-view,#articles-view,#article-view,#glossary-view,.subpage')].find(isActive)?.id || null;}
  function restore(view,hash,y){
    if(view && typeof window.dkShow==='function'){window.dkShow(view==='home'?null:view)}
    else if(view==='home' && typeof window.showPage==='function')window.showPage('home');
    history.replaceState(null,'',location.pathname+location.search+hash);
    window.scrollTo({top:y,left:0,behavior:'instant'});
  }
  function openArticle(id,source){
    if(!window.DKModalReader || typeof window.dkArticle!=='function')return false;
    // Preserve the pre-click page before invoking the existing, fully translated article renderer.
    const view=currentView(),hash=location.hash,y=window.scrollY;
    const original=window.dkArticle;
    try{
      original(id);
      const body=document.getElementById('article-body');
      if(!body || !body.childNodes.length)return false;
      const clone=body.cloneNode(true);
      clone.id='dk-modal-article-body';
      clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
      restore(view,hash,y);
      window.DKModalReader.openNode(clone,source);
      return true;
    }catch(err){restore(view,hash,y);return false}
  }
  document.addEventListener('click',event=>{
    if(event.defaultPrevented || event.button!==0 || event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    if(event.target.closest('#dk-modal-reader'))return;
    const card=event.target.closest('[data-open-article]');
    if(card && card.dataset.openArticle){
      event.preventDefault();event.stopImmediatePropagation();
      if(!openArticle(card.dataset.openArticle,card))window.dkArticle(card.dataset.openArticle);
      return;
    }
    const link=event.target.closest('a[href*="#clanek-"]');
    if(link){
      const u=new URL(link.href,location.href);
      if(u.origin!==location.origin || u.pathname!==location.pathname)return;
      const id=decodeURIComponent(u.hash.slice(8));
      if(id){event.preventDefault();event.stopImmediatePropagation();if(!openArticle(id,link))location.href=link.href}
      return;
    }
    const recipe=event.target.closest('#recipes .recipe');
    if(recipe && !event.target.closest('a,button,input,select,textarea')){
      event.preventDefault();event.stopImmediatePropagation();
      window.DKModalReader?.openNode(recipe,recipe);
    }
  },true);
  // Add keyboard support to recipe cards without changing the layout.
  function enhanceRecipes(){
    document.querySelectorAll('#recipes .recipe').forEach(card=>{
      if(card.dataset.dkModalEnhanced)return;
      card.dataset.dkModalEnhanced='1';card.tabIndex=0;card.setAttribute('role','button');
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.DKModalReader?.openNode(card,card)}});
    });
  }
  enhanceRecipes();
  new MutationObserver(enhanceRecipes).observe(document.getElementById('recipes')||document.body,{childList:true,subtree:true});
})();
