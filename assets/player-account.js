/* Pokémon Slot account adapter. Supabase public key only; no admin credentials. */
(() => {
'use strict';
const URL='https://giptktculfrnawpbodqw.supabase.co';
const KEY='sb_publishable_ptQQD8lB-TRK5vjyYjUkCw_ynjp9MFD';
const redirectTo='https://btcggaming.github.io/Pokemon-Spot/';
const keys=['poke-slot-profile-v1','poke-slot-wallet-v1','poke-slot-settings-v1',...['auto',1,2,3].map(x=>'poke-slot-run-v1-'+x)];
const marker='poke-slot-account-active-v1',cachePrefix='poke-slot-cloud-cache-v1-';
const $=id=>document.getElementById(id);
let client,session,records={},revision=0,pending=false,request=null,sending=null,blocked=false,timer,booted=false,busy=false,errorKind='',message='';
let initialized=false,registeredName='',nameReady=false;
const initialSettings=()=>{try{return JSON.parse(localStorage.getItem('poke-slot-settings-v1')||'{}');}catch{return {};}};
const text=(zh,en)=>((booted?document.documentElement.lang:initialSettings().language)==='en'?en:zh);
function valid(data){return data&&typeof data==='object'&&!Array.isArray(data)&&Object.entries(data).every(([k,v])=>keys.includes(k)&&typeof v==='string');}
function cacheKey(){return cachePrefix+session.user.id;}
function persist(){if(!session)return;localStorage.setItem(cacheKey(),JSON.stringify({records,revision,pending,request}));}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('script'));document.head.append(s);});}
async function sdk(){if(!client){await loadScript('./assets/vendor/supabase.js?v=20261125');client=supabase.createClient(URL,KEY,{auth:{flowType:'pkce',detectSessionInUrl:true,persistSession:true,autoRefreshToken:true},global:{fetch:(input,options={})=>fetch(input,{...options,signal:options.signal||AbortSignal.timeout(12000)})}});}return client;}
function ui(){
 if(!$('accountDialog')){
 const style=document.createElement('style');style.textContent=`
 #accountDialog,#accountInheritance{width:min(640px,94vw);max-height:90dvh;border:4px solid #554966;background:#ece7d4;color:#253c36;padding:1rem;box-shadow:inset 0 0 0 3px #fff8e3;font:inherit}#accountDialog::backdrop,#accountInheritance::backdrop{background:#000b}#accountDialog h2,#accountInheritance h2{margin:0 0 .8rem;background:#43374f;color:#fff0bc;padding:.6rem}#accountDialog p,#accountInheritance p{overflow-wrap:anywhere}#accountDialog button,#accountInheritance button{font:inherit;min-height:44px;margin:.25rem;padding:.45rem .7rem;border-radius:0}#accountDialog .account-actions,#accountInheritance .account-actions{display:flex;gap:.3rem;flex-wrap:wrap}#accountGoogle{background:white;color:#253c36;display:inline-flex;align-items:center;gap:.7rem}#accountGoogle svg{width:24px;height:24px;flex:none}#accountBadge{position:fixed;right:.4rem;bottom:.4rem;z-index:200;background:#fff0bc;color:#322c40;border:2px solid #554966;padding:.3rem;max-width:85vw;font:inherit;font-size:.8rem}#accountStartup{position:fixed;inset:0;z-index:2000;background:#d5cfdd;display:grid;place-content:center;text-align:center;color:#30283c;padding:1rem}#accountStartup[hidden],#accountBadge[hidden]{display:none}#accountControls{position:absolute;left:1.5%;bottom:2%;z-index:3;display:flex;gap:.4em;align-items:stretch;max-width:70%}#accountControls #changelogOpen{position:static;flex:none}#accountControls button{font-size:clamp(10px,1.25cqw,20px);min-height:2.5em;padding:.3em .6em;margin:0;border-radius:0;white-space:nowrap}#accountLanguage{font:inherit}#accountQuickLogout{font:inherit;min-height:44px;margin:0;padding:.4em .7em;font-size:clamp(12px,1.2cqw,20px);border-radius:0}#accountQuickLogout[hidden]{display:none}#accountOpenLabel{max-width:17ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#accountNameSection{border:2px solid #8c8198;background:#fff4cf;padding:.7rem;margin:.7rem 0}#accountNameSection label{display:block;margin-bottom:.4rem}#accountNameInput{font:inherit;width:min(100%,18em);min-height:44px;border:2px solid #554966;border-radius:0;background:#fffef6;color:#253c36;padding:.3rem;user-select:text!important}#accountNameSection[hidden]{display:none}#accountOpen{font:inherit;display:flex;align-items:center;gap:.5em;min-height:44px;margin:0;padding:.4em .7em;font-size:clamp(12px,1.2cqw,20px);border-radius:0}#accountOpen svg{width:24px;height:24px;flex:none}#accountHint{font-size:.9em}#accountMessage{white-space:pre-line}#accountDialog button:focus-visible{outline:3px solid #d79829;outline-offset:2px}
@media(max-width:700px){
 #menu>h1.menu-logo{position:absolute;left:4%;top:6%;margin:0;width:46cqw}
 #menu>p.menu-subtitle{position:absolute;left:4%;top:24%;margin:0}
 #menu nav{position:absolute;left:4%;top:33%;bottom:15%;width:40%;margin:0;gap:.5cqw;grid-template-rows:repeat(6,minmax(0,1fr))}
 #menu nav button{min-height:0;font-size:1.8cqw;line-height:1.1;padding:.2cqw .6cqw;border-width:.35cqw}
 #menu #accountControls{left:1.5%;bottom:2%;width:65%;max-width:65%;gap:.6cqw;display:flex;align-items:stretch}
 #menu #accountControls button,#menu .menu-controls button{font-size:1.65cqw;line-height:1.1;min-height:4.5cqw;height:4.5cqw;padding:.3cqw .7cqw;border-width:.35cqw;margin:0}
 #menu #accountOpen{min-width:0;flex:1;gap:.6cqw}
 #menu #accountOpenLabel{min-width:0;max-width:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 #menu #accountOpen svg{width:2.8cqw;height:2.8cqw;flex:none}
 #menu #changelogOpen,#menu #accountLanguage,#menu #accountQuickLogout{flex:none}
 #menu .menu-controls{right:1.5%;bottom:2%;width:30%;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6cqw}
 #menu .menu-controls .mobile-fullscreen-control{grid-column:1/-1;justify-self:stretch}
}
`;
 document.head.append(style);
 const wrapper=document.createElement('div');wrapper.innerHTML=`<dialog id="accountDialog" aria-labelledby="accountTitle"><h2 id="accountTitle"></h2><p id="accountIdentity"></p><section id="accountNameSection" hidden><label id="accountNameLabel" for="accountNameInput"></label><input id="accountNameInput" type="text" maxlength="15" pattern="[A-Za-z0-9]{1,15}" autocomplete="nickname"><button id="accountNameSave" type="button"></button><p id="accountNameHint"></p></section><p id="accountHint"></p><p id="accountMessage" role="status" aria-live="polite"></p><div class="account-actions"><button id="accountGoogle" type="button"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 24.5c0-1.5-.1-2.9-.4-4.3H24v8.1h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.7c3.9-3.6 6-8.9 6-15.2Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.2c-1.8 1.2-4.1 1.9-6.8 1.9-5.3 0-9.9-3.6-11.5-8.4H5.6v5.3A20.4 20.4 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.5 27.4a12.2 12.2 0 0 1 0-7.8v-5.3H5.6a20.1 20.1 0 0 0 0 18.4Z"/><path fill="#EA4335" d="M24 11.2c3 0 5.6 1 7.7 3l5.8-5.8A19.4 19.4 0 0 0 24 3 20.4 20.4 0 0 0 5.6 14.3l6.9 5.3C14.1 14.8 18.7 11.2 24 11.2Z"/></svg><span id="accountGoogleText"></span></button><button id="accountImport" type="button"></button><button id="accountRetry" type="button"></button><button id="accountDownload" type="button"></button><button id="accountReload" type="button"></button><button id="accountLogout" type="button"></button><button id="accountClose" type="button"></button></div><p id="accountImportPrompt" hidden></p><div id="accountImportConfirm" hidden><button id="accountImportYes" type="button"></button><button id="accountImportNo" type="button"></button></div></dialog><button id="accountBadge" type="button" hidden></button><div id="accountStartup"><p id="accountStartupText"></p><button id="accountStartupRetry" type="button"></button><button id="accountStartupGuest" type="button"></button></div>`;
 document.body.append(wrapper);
 $('accountClose').onclick=()=>{$('accountDialog').close();$('accountOpen')?.focus();};
 $('accountGoogle').onclick=login;
 $('accountLogout').onclick=logout;$('accountNameSave').onclick=saveName;$('accountNameInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();saveName();}};
 $('accountRetry').onclick=async()=>{if(busy)return;if(errorKind==='conflict')return;blocked=false;await flush();};
 $('accountDownload').onclick=download;
 $('accountReload').onclick=()=>{if(confirm(text('先下載備份。重新讀取雲端將捨棄這個裝置尚未同步的變更，確定繼續？','Download a backup first. Reloading cloud progress discards unsynced changes on this device. Continue?'))){localStorage.removeItem(cacheKey());location.reload();}};
 $('accountImport').onclick=()=>{$('accountImportConfirm').hidden=false;$('accountImportPrompt').hidden=false;$('accountImportYes').focus();};
 $('accountImportNo').onclick=()=>{$('accountImportConfirm').hidden=true;$('accountImportPrompt').hidden=true;$('accountImport').focus();};
 $('accountImportYes').onclick=importGuest;
 $('accountBadge').onclick=open;
 $('accountStartupRetry').onclick=()=>location.reload();
 $('accountStartupGuest').onclick=async()=>{if(busy)return;busy=true;try{if(client){const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;}localStorage.removeItem(marker);const clean=new globalThis.URL(location.href);for(const key of ['code','error','error_code','error_description'])clean.searchParams.delete(key);clean.hash='';location.replace(clean.href);}catch{busy=false;message=text('登出失敗，請重試。','Sign-out failed. Please retry.');render();}};
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 }
}
function render(){
 if(!$('accountDialog'))return;
 $('accountTitle').textContent=text('玩家帳號','Player account');
 $('accountIdentity').textContent=session?text('目前登入帳號：','Signed-in account: ')+(session.user.email||session.user.user_metadata?.email||text('Google 帳號','Google account')):text('訪客模式','Guest mode');
 $('accountNameSection').hidden=!session;
 $('accountNameLabel').textContent=text('玩家暱稱','Player nickname');
 $('accountNameSave').textContent=text('儲存暱稱','Save nickname');
 $('accountNameHint').textContent=text('僅限 1–15 個英文字母或數字，不可與其他玩家重複（不分大小寫）。','Use 1–15 letters or digits. Names must be unique, ignoring letter case.');
 $('accountNameSave').disabled=!booted||busy||!!sending||blocked||!nameReady;$('accountNameInput').disabled=!nameReady;
 if($('accountQuickLogout')){$('accountQuickLogout').hidden=!session;$('accountQuickLogout').disabled=busy||!!sending;$('accountQuickLogout').textContent=text('登出','Sign out');}
 $('accountHint').textContent=text('登入後跨裝置保存進度。本機訪客紀錄會保留，首次登入不會自動匯入。','Sign in to save progress across devices. Guest progress stays on this device and is never imported automatically.');
 $('accountGoogleText').textContent=text('使用 Google 登入','Sign in with Google');
 for(const [id,zh,en]of [['accountImport','匯入本機訪客進度','Import guest progress'],['accountRetry','重試同步','Retry sync'],['accountDownload','下載未同步備份','Download unsynced backup'],['accountReload','重新讀取雲端進度','Reload cloud progress'],['accountLogout','登出','Sign out'],['accountClose','關閉','Close'],['accountImportYes','確認匯入並重新載入','Import and reload'],['accountImportNo','取消','Cancel'],['accountStartupRetry','重新連線','Reconnect'],['accountStartupGuest','登出並使用訪客紀錄','Sign out and use guest progress']])$(id).textContent=text(zh,en);
 $('accountImportPrompt').textContent=text('確定把此瀏覽器的訪客紀錄匯入這個全新帳號？匯入後重新載入遊戲。本機原紀錄仍會保留。','Import this browser’s guest progress into this new account? The game will reload. The original guest progress will remain.');
 $('accountMessage').textContent=message;
 $('accountGoogle').hidden=!!session;
 $('accountImport').hidden=!session||revision!==0||Object.keys(records).length>0||pending||!booted;
 $('accountLogout').hidden=!session;
 $('accountRetry').hidden=!pending||errorKind==='conflict';
 $('accountDownload').hidden=!pending;
 $('accountReload').hidden=errorKind!=='conflict';
 if($('accountLanguage')){$('accountLanguage').textContent=text('English','繁體中文');$('accountLanguage').title=text('切換為英文','Switch to Traditional Chinese');}
 for(const id of ['accountGoogle','accountLogout','accountImport','accountImportYes','accountReload'])$(id).disabled=busy||!!sending;
 const badge=$('accountBadge');badge.hidden=!booted||!session||!pending;
 badge.textContent=blocked?text('雲端尚未同步・查看','Cloud not synced · Details'):text('雲端同步中…','Syncing cloud progress…');
 $('accountStartupText').textContent=message||text('讀取帳號進度中…','Loading account progress…');
 $('accountStartupRetry').hidden=!errorKind;
 $('accountStartupGuest').hidden=!errorKind;
 if($('accountOpenLabel'))$('accountOpenLabel').textContent=session?(nickname()||text('已登入','Signed in'))+text('・帳號',' · Account'):busy?text('連線中…','Connecting…'):text('Google 登入','Sign in with Google');
}
function nickname(){return registeredName;}
async function saveName(){
 if(!session||!booted||busy||sending||blocked||!nameReady)return;
 const name=$('accountNameInput').value.trim();
 if(!/^[A-Za-z0-9]{1,15}$/.test(name)){message=text('暱稱僅可包含 1–15 個英文字母或數字。','Nicknames must contain 1–15 letters or digits.');render();$('accountNameInput').focus();return;}
 busy=true;render();
 try{const {data,error}=await client.rpc('set_player_nickname',{new_nickname:name});if(error)throw error;if(data?.nickname!==name)throw new Error('response');registeredName=data.nickname;profile.playerName=registeredName;saveProfile();await flush();}
 catch(e){message=e?.code==='PT409'?text('此暱稱已被使用，請換一個。','This nickname is already taken. Choose another.'):text('暱稱尚未儲存，請稍後重試。','Nickname was not saved. Please retry.');}
 finally{busy=false;render();}
}
function open(){if(document.activeElement!==$('accountNameInput'))$('accountNameInput').value=nickname();render();if(!$('accountDialog').open)$('accountDialog').showModal();}
function failure(error){blocked=true;if(error?.name==='QuotaExceededError'){errorKind='storage';message=text('此裝置儲存空間不足，變更暫時只在記憶體中。請立即下載未同步備份，再清理瀏覽器空間並重試。','Device storage is full. Changes are currently only in memory. Download an unsynced backup now, free browser storage, and retry.');render();return;}errorKind=error?.code==='PT409'||error?.status===409?'conflict':'network';message=errorKind==='conflict'?text('另一個裝置已有較新進度。已保留此裝置的未同步資料。請先下載備份，再重新讀取雲端。','Another device has newer progress. Unsynced changes are preserved here. Download a backup, then reload cloud progress.'):text('雲端同步失敗，已保留此裝置的變更。請重試；確認同步完成後再登出。','Cloud sync failed. Changes are preserved on this device. Retry and finish syncing before signing out.');render();}
async function flush(){
 clearTimeout(timer);
 if(sending)return sending;
 if(!session||blocked||(!pending&&!request))return !pending;
 sending=(async()=>{try{while(pending||request){if(!request){request={expected_revision:revision,new_records:{...records}};pending=false;persist();}const {data,error}=await client.rpc('save_player_game',request);if(error)throw error;if(!Number.isSafeInteger(data?.revision))throw new Error('response');revision=data.revision;pending=JSON.stringify(records)!==JSON.stringify(request.new_records);request=null;persist();}message=text('雲端進度已同步。','Cloud progress synced.');errorKind='';return true;}catch(e){pending=true;try{persist();}catch{}failure(e);return false;}finally{sending=null;render();}})();render();return sending;
}
async function login(){if(busy)return;busy=true;render();try{const c=await sdk();const {error}=await c.auth.signInWithOAuth({provider:'google',options:{redirectTo,queryParams:{prompt:'select_account'}}});if(error)throw error;}catch{busy=false;message=text('Google 登入無法開啟，請確認連線後再試。','Google sign-in could not start. Check your connection and retry.');render();open();}}
async function logout(){if(busy)return;busy=true;render();try{if(pending||request){blocked=false;if(errorKind==='conflict'){blocked=true;return;}if(!await flush())return;}const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;localStorage.removeItem(marker);location.reload();}catch{message=text('無法登出，請稍後重試。','Unable to sign out. Please retry.');}finally{busy=false;render();}}
function download(){const blob=new Blob([JSON.stringify({version:1,records,revision,unsynced:true},null,2)],{type:'application/json'});const url=globalThis.URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pokemon-slot-unsynced-backup.json';a.click();setTimeout(()=>globalThis.URL.revokeObjectURL(url),1000);}
async function importGuest(){if(busy||revision!==0||Object.keys(records).length)return;busy=true;render();try{for(const key of keys){const value=localStorage.getItem(key);if(value!==null)records[key]=value;}pending=true;persist();if(await flush())location.reload();}catch(e){failure(e);}finally{busy=false;render();}}
function guestSnapshot(){
 const snapshot={};for(const key of keys){const value=localStorage.getItem(key);if(value!==null)snapshot[key]=value;}return snapshot;
}
async function chooseGuestInheritance(){
 if(!session||revision!==0||Object.keys(records).length||pending||request)return;
 const guest=guestSnapshot();if(!Object.keys(guest).length)return;
 const dialog=document.createElement('dialog');dialog.id='accountInheritance';dialog.setAttribute('aria-labelledby','accountInheritanceTitle');
 const title=document.createElement('h2');title.id='accountInheritanceTitle';title.textContent=text('是否繼承這個網站的現有紀錄？','Keep this website’s existing progress?');
 const description=document.createElement('p');description.textContent=text('此 Google 帳號尚無雲端進度。你可以繼承這個瀏覽器的圖鑑、金幣、扭蛋、設定與存檔，或建立全新進度。無論選哪一項，原本的訪客紀錄都會保留。','This Google account has no cloud progress yet. Import this browser’s Pokédex, coins, eggs, settings and saves, or start fresh. Your original guest progress stays on this device either way.');
 const status=document.createElement('p');status.setAttribute('role','status');
 const actions=document.createElement('div');actions.className='account-actions';
 const yes=document.createElement('button'),no=document.createElement('button'),reload=document.createElement('button');
 for(const button of [yes,no,reload])button.type='button';
 yes.textContent=text('繼承現有紀錄','Keep existing progress');no.textContent=text('不繼承，建立新進度','Start fresh');reload.textContent=text('重新讀取雲端','Reload cloud progress');reload.hidden=true;
 actions.append(yes,no,reload);dialog.append(title,description,status,actions);document.body.append(dialog);dialog.oncancel=event=>event.preventDefault();
 try{await new Promise(resolve=>{
   let chosen=null,working=false;
   const choose=async inherit=>{
    if(working||chosen!==null&&chosen!==inherit)return;working=true;yes.disabled=no.disabled=true;reload.hidden=true;
    status.textContent=text('正在建立帳號進度…','Preparing account progress…');
    try{
     if(chosen===null){chosen=inherit;records=inherit?{...guest}:{};pending=true;persist();}
     if(errorKind==='conflict'){reload.hidden=false;status.textContent=message;return;}
     blocked=false;
     if(await flush()){resolve();return;}
     status.textContent=message;reload.hidden=errorKind!=='conflict';
    }catch(error){failure(error);status.textContent=message;}
    finally{working=false;yes.disabled=chosen!==true;no.disabled=chosen!==false;}
   };
   yes.onclick=()=>choose(true);no.onclick=()=>choose(false);
   reload.onclick=()=>{localStorage.removeItem(cacheKey());location.reload();};
   dialog.showModal();yes.focus();
  });
 }finally{dialog.close();dialog.remove();}
}
async function boot(){if(booted)return;const script=document.createElement('script');const source=$('slotGameSource');script.textContent=source.textContent;document.body.append(script);source.remove();script.remove();booted=true;const btn=document.createElement('button');btn.id='accountOpen';btn.type='button';btn.onclick=()=>session?open():login();btn.append($('accountGoogle').querySelector('svg').cloneNode(true));const label=document.createElement('span');label.id='accountOpenLabel';btn.append(label);const controls=document.createElement('div');controls.id='accountControls';controls.append($('changelogOpen'),btn);const language=document.createElement('button');language.id='accountLanguage';language.type='button';language.onclick=()=>{settings.language=settings.language==='en'?'zh-Hant':'en';saveSettings();render();};controls.append(language);const signout=document.createElement('button');signout.id='accountQuickLogout';signout.type='button';signout.onclick=logout;controls.append(signout);$('menu').append(controls);$('accountStartup').hidden=true;render();await loadScript('./assets/ui-language.js?v=20261124-perf');if(session&&nameReady&&!nickname()&&!blocked){open();$('accountNameInput').focus();}if(pending&&!blocked)timer=setTimeout(flush,150);}
const adapter=globalThis.slotAccount={
 getItem(key){return session?(records[key]??null):localStorage.getItem(key);},
 setItem(key,value){if(!keys.includes(key))throw new Error('Unknown save key');if(!session){localStorage.setItem(key,value);return;}records[key]=String(value);pending=true;try{persist();}catch(e){failure(e);return;}render();if(!blocked){clearTimeout(timer);timer=setTimeout(flush,350);}},
 flush,
};
addEventListener('beforeunload',e=>{if(session&&(pending||request)){e.preventDefault();e.returnValue='';}});
addEventListener('online',()=>{if(errorKind==='network'){blocked=false;flush();}});
async function start(){ui();render();try{
 const query=new globalThis.URL(location.href).searchParams;
 const authError=query.has('error')||location.hash.includes('error=');
 const hasSession=!!localStorage.getItem('sb-giptktculfrnawpbodqw-auth-token');const wasSignedIn=!!localStorage.getItem(marker);
 if(!query.has('code')&&!hasSession&&!localStorage.getItem(marker)&&!authError){await boot();return;}
 const c=await sdk();const result=await c.auth.getSession();if(result.error)throw result.error;session=result.data.session;
 if(authError||query.has('code')){const clean=new globalThis.URL(location.href);for(const key of ['code','error','error_code','error_description'])clean.searchParams.delete(key);if(clean.hash.includes('error='))clean.hash='';history.replaceState(null,'',clean.pathname+clean.search+clean.hash);}
 if(!session){localStorage.removeItem(marker);message=authError?text('Google 登入未完成，請再試一次。','Google sign-in did not finish. Please retry.'):wasSignedIn?text('登入已過期，目前使用訪客紀錄。請重新登入讀取帳號進度。','Your session expired. Guest progress is active. Sign in again to load account progress.'):'';await boot();if(message)open();return;}
 localStorage.setItem(marker,'1');
 let cached;try{cached=JSON.parse(localStorage.getItem(cacheKey())||'null');}catch{}
 const {data,error}=await c.rpc('get_player_save');if(error)throw error;if(!Number.isSafeInteger(data?.revision)||!valid(data.records))throw new Error('response');
 records=data.records;revision=data.revision;
 if(cached&&(cached.pending||cached.request)&&valid(cached.records)&&Number.isSafeInteger(cached.revision)){
 records=cached.records;revision=cached.revision;pending=true;request=cached.request;
 if(request&&(!Number.isSafeInteger(request.expected_revision)||!valid(request.new_records)))throw new Error('cache');
 await flush();
 }
 const named=await c.rpc('get_player_nickname');if(!named.error&&(named.data?.nickname===null||typeof named.data?.nickname==='string')){registeredName=named.data.nickname||'';nameReady=true;}else{message=text('暱稱功能暫時無法使用，請稍後重新載入。','Nicknames are temporarily unavailable. Reload later.');}
 await chooseGuestInheritance();
 persist();initialized=true;await boot();
 c.auth.onAuthStateChange((event,next)=>{if(!initialized)return;if((next?.user?.id??null)!==session.user.id){blocked=true;message=text('登入狀態已改變。請重新載入，避免使用錯誤帳號的進度。','Sign-in status changed. Reload to use the correct account progress.');errorKind='auth';$('accountStartup').hidden=false;render();}});
 }catch{errorKind='startup';message=text('無法安全讀取帳號進度。遊戲尚未啟動，訪客紀錄沒有被覆蓋。請重新連線，或登出後玩訪客模式。','Account progress could not be loaded safely. The game has not started and guest progress is unchanged. Reconnect or sign out to play as a guest.');render();}}
start();
})();

