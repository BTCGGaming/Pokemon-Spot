(() => {
  const warm=new Map(),watched=new WeakSet();
  function isPokemon(img){return img instanceof HTMLImageElement&&(img.dataset.monId||/\/images\/pokemon\//.test(img.src));}
  function preload(src){if(!src||warm.has(src))return;const image=new Image();image.decoding='async';image.src=src;warm.set(src,image);if(warm.size>64)warm.delete(warm.keys().next().value);image.decode().catch(()=>{});}
  function watch(img){if(!isPokemon(img)||watched.has(img))return;watched.add(img);img.decoding='async';if(img.closest('#player,#enemy'))img.fetchPriority='high';img.addEventListener('load',()=>{img.hidden=false;img.dataset.mediaRecovery='ready';},{passive:true});if(img.complete&&!img.naturalWidth)globalThis.recoverPokemonImage?.(img);setTimeout(()=>{if(img.isConnected&&!img.complete&&!img.dataset.spriteRecovering)globalThis.recoverPokemonImage?.(img);},3500);}
  new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType!==1)continue;if(node.matches('img'))watch(node);node.querySelectorAll('img').forEach(watch);}}).observe(document.body,{childList:true,subtree:true});
  document.querySelectorAll('img').forEach(watch);
  globalThis.prepareBattleMedia=run=>{if(!run?.enemy)return;for(const mon of [run.team?.[run.active],run.enemy].filter(Boolean)){preload(sprite(mon));preload(sprite(mon,false,true));}if(run.trainer)for(const url of globalThis.pokerogueArt?.trainer(run.trainer[2])??[])preload(url);for(const url of playerTrainerFrames())preload(url);};
})();