/* GA4: aggregate game activity; no save contents, passwords, or personal fields. */
(() => {
  'use strict';
  const measurementId='G-GXMM2BQMYM';
  const storageKey='poke-slot-ga4-events-v1';
  const production=location.hostname==='btcggaming.github.io'&&/^\/Pokemon-Spot(?:\/|$)/.test(location.pathname);
  let disabled=!production;
  try{disabled ||= localStorage.getItem('poke-slot-analytics-disabled')==='1';}catch{}
  const seen=new Set();
  try{const saved=JSON.parse(sessionStorage.getItem(storageKey)||'[]');if(Array.isArray(saved))for(const key of saved.slice(-256))if(typeof key==='string')seen.add(key);}catch{}
  const eventNames=new Set(['game_start','first_spin','game_end']);
  globalThis.slotAnalytics={
    gameEvent(name,run){
      if(disabled||!eventNames.has(name)||!run?.runId||run.testStartStage||run.promotionConfig)return false;
      const key=run.runId+':'+name;
      if(seen.has(key))return false;
      seen.add(key);
      if(seen.size>256)seen.delete(seen.values().next().value);
      try{sessionStorage.setItem(storageKey,JSON.stringify([...seen]));}catch{}
      const region=run.adventure?.national?'national':run.adventure?.region??run.adventure?.league??'national';
      const params={send_to:measurementId,game_mode:run.tutorial?'tutorial':'formal',adventure_region:region,stage:Number(run.stage)||1,team_size:run.team?.length??0};
      if(name==='game_end')params.result=run.finished?'completed':run.surrendered?'surrendered':'defeated';
      globalThis.gtag('event',name,params);
      return true;
    }
  };
  if(disabled)return;
  globalThis.dataLayer=globalThis.dataLayer||[];
  globalThis.gtag=globalThis.gtag||function(){globalThis.dataLayer.push(arguments);};
  // Strip URL queries/fragments and referrer paths before recording visits.
  let referrer='';
  try{referrer=document.referrer?new URL(document.referrer).origin:'';}catch{}
  globalThis.gtag('js',new Date());
  globalThis.gtag('config',measurementId,{
    page_title:'寶可夢拉霸 POKEMON SLOT',
    page_location:location.origin+location.pathname,
    page_referrer:referrer,
    allow_google_signals:false,
    allow_ad_personalization_signals:false,
    cookie_flags:'SameSite=Lax;Secure'
  });
  const tag=document.createElement('script');
  tag.async=true;
  tag.src='https://www.googletagmanager.com/gtag/js?id='+measurementId;
  document.head.append(tag);
})();
