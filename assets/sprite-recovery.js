/* Retry local Pokemon artwork without changing species, form, shininess or facing. */
(() => {
 'use strict';
 const base=new URL('./pokerogue/',document.currentScript.src);
 const states=new WeakMap();
 function artPath(img){try{const src=new URL(img.currentSrc||img.src,location.href);if(src.origin!==base.origin||!src.pathname.startsWith(base.pathname))return null;const path=decodeURIComponent(src.pathname.slice(base.pathname.length));return /^images\/pokemon\/(?:back\/)?(?:shiny\/)?[^/]+\.png$/.test(path)?{src,path}:null;}catch{return null;}}
 function embedded(path){
  const back=path.includes('/back/'),shiny=path.includes('/shiny/');
  const key=path.slice(path.lastIndexOf('/')+1,-4);
  try{if(back)return typeof ndsBattleArt!=='undefined'?ndsBattleArt.backs?.[key]?.[shiny?1:0]:null;
   return globalThis.emeraldSprites?.[key]?.[shiny?1:0];
  }catch{return null;}
 }
 function assign(img,state,src){
  if(!img.isConnected)return;
  state.expected=src;img.removeAttribute('onerror');img.hidden=false;img.src=src;
 }
 document.addEventListener('error',event=>{
  const img=event.target;if(!(img instanceof HTMLImageElement))return;
  const art=artPath(img);let state=states.get(img);
  if(!art&&!(state&&img.src===state.expected))return;
  event.stopImmediatePropagation();img.removeAttribute('onerror');
  if(!state||art&&art.path!==state.path){const clean=new URL(art.src);clean.searchParams.delete('_sprite_retry');state={path:art.path,original:clean.href,attempt:0,embedded:false,onlineRetried:false};states.set(img,state);}
  img.hidden=true;img.dataset.spriteRecovering='true';
  clearTimeout(state.timer);
  if(state.attempt<2){
   const attempt=++state.attempt;
   state.timer=setTimeout(()=>{const retry=new URL(state.original);retry.searchParams.set('_sprite_retry',String(attempt));assign(img,state,retry.href);},attempt===1?180:650);
   return;
  }
  const fallback=!state.embedded&&embedded(state.path);
  if(fallback){state.embedded=true;img.dataset.spriteFallback='true';assign(img,state,fallback);return;}
  delete img.dataset.spriteRecovering;img.dataset.spriteUnavailable='true';
 },true);
 document.addEventListener('load',event=>{
  const img=event.target;if(!(img instanceof HTMLImageElement))return;
  const state=states.get(img);if(!state||img.src!==state.expected)return;
  img.hidden=false;delete img.dataset.spriteRecovering;delete img.dataset.spriteUnavailable;
  if(!img.src.startsWith('data:'))delete img.dataset.spriteFallback;
 },true);
 addEventListener('online',()=>{
  for(const img of document.querySelectorAll('img[data-sprite-unavailable],img[data-sprite-fallback]')){
   const state=states.get(img);if(!state||state.onlineRetried)continue;
   state.onlineRetried=true;state.attempt=0;state.embedded=false;
   const retry=new URL(state.original);retry.searchParams.set('_sprite_retry','online');assign(img,state,retry.href);
  }
 });
})();
