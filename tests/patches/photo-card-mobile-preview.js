/* Reuse already embedded topic photos from this site's existing assets.
 * Preview-only: no third-party image downloads or claims of new licenses.
 */
(()=>{'use strict';
 const images=()=>[...document.querySelectorAll('#topics .topic-img')].map(el=>getComputedStyle(el).backgroundImage).filter(x=>x&&x!=='none');
 function paint(){
  const cards=[...document.querySelectorAll('#zacinam .dk-start-grid > .dk-start-card')].slice(0,7);
  const practical=document.querySelector('#zacinam .dk-start-practical > .dk-start-card');
  if(practical)cards.push(practical);
  const photos=images();if(!photos.length)return;
  // Existing site topic photography, reused only for visual prototype.
  const map=[0,1,4,2,3,4,5,1];
  cards.forEach((card,i)=>{
   if(card.querySelector('.dk-photo-thumb'))return;
   const thumb=document.createElement('span');thumb.className='dk-photo-thumb';thumb.setAttribute('aria-hidden','true');
   thumb.style.backgroundImage=photos[map[i]%photos.length];
   thumb.style.backgroundPosition='center';thumb.style.backgroundSize='cover';
   card.insertBefore(thumb,card.firstChild);
  });
 }
 let pending=false;
 const observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;paint()})});
 function init(){paint();const root=document.getElementById('zacinam');if(root)observer.observe(root,{childList:true,subtree:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
