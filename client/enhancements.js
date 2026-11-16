(() => {
  'use strict';
  if (location.origin !== 'https://81-90-31-167.sslip.io' || window.__limoTools) return;
  window.__limoTools = true;
  const key = 'limotools.preferences.v1';
  const defaults = {accent:'#8b7bff', size:16, compact:false, motion:false, privacy:false};
  let prefs;
  try { prefs = {...defaults,...JSON.parse(localStorage.getItem(key)||'{}')}; } catch { prefs = {...defaults}; }
  const style = document.createElement('style');
  document.head.append(style);
  const apply = () => {
    const accent = /^#[0-9a-f]{6}$/i.test(prefs.accent) ? prefs.accent : defaults.accent;
    const size = Math.max(12,Math.min(22,Number(prefs.size)||16));
    style.textContent = `:root{--accent:${accent}!important}.msg-text{font-size:${size}px!important}
      ${prefs.compact?'.chat-item{padding-top:7px!important;padding-bottom:7px!important}.msg-row.first{margin-top:4px!important}':''}
      ${prefs.motion?'*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;scroll-behavior:auto!important}':''}
      ${prefs.privacy?'.chat-item-preview{filter:blur(5px)}.chat-item:hover .chat-item-preview,.chat-item:focus-within .chat-item-preview{filter:none}':''}
      #lt-button{position:fixed;right:14px;top:max(8px,env(safe-area-inset-top));z-index:10000;border:1px solid #ffffff30;background:#242034;color:#fff;border-radius:14px;padding:9px 13px;font:600 13px system-ui;box-shadow:0 5px 22px #0004;cursor:pointer}
      #lt-panel{border:1px solid #ffffff25;border-radius:24px;background:#171522;color:#f6f4ff;width:min(380px,calc(100vw - 32px));max-height:85dvh;overflow:auto;padding:24px;box-sizing:border-box;font:15px system-ui;box-shadow:0 20px 90px #0008}
      #lt-panel::backdrop{background:#080610a8;backdrop-filter:blur(6px)}
      #lt-panel h2{margin:0 0 5px;font-size:26px}#lt-panel p{color:#bcb5d0;font-size:13px;line-height:1.5}#lt-panel label{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid #ffffff12}#lt-panel input{accent-color:${accent}}#lt-panel button{border:0;border-radius:10px;padding:11px 15px;background:#332e49;color:white;font:inherit;cursor:pointer}#lt-panel .lt-footer{display:flex;justify-content:space-between;gap:10px;margin-top:20px}`;
  };
  const save = () => {try{localStorage.setItem(key,JSON.stringify(prefs));}catch{} apply();};
  apply();
  const mount = () => {
    if(document.getElementById('lt-button'))return;
    const button=document.createElement('button');button.id='lt-button';button.textContent='✦ LimoTools';button.setAttribute('aria-label','Настройки клиента LimoTools');
    const panel=document.createElement('dialog');panel.id='lt-panel';
    panel.innerHTML='<h2>LimoTools</h2><p>Твой Limochat. Твой стиль.<br>Настройки действуют только на этом устройстве.</p><label>Цвет акцента<input type="color" data-pref="accent" aria-label="Цвет акцента"></label><label>Размер сообщений <input type="range" min="12" max="22" data-pref="size" aria-label="Размер сообщений"></label><label>Компактные чаты<input type="checkbox" data-pref="compact"></label><label>Уменьшить анимации<input type="checkbox" data-pref="motion"></label><label>Скрыть превью сообщений<input type="checkbox" data-pref="privacy"></label><p>Скрытие превью — визуальная настройка, не блокировка приложения. Звонки и аккаунты обслуживает сервер Limochat.</p><div class="lt-footer"><button type="button" id="lt-reset">Сбросить</button><button type="button" id="lt-close">Готово</button></div>';
    const sync=()=>panel.querySelectorAll('[data-pref]').forEach(input=>{input.type==='checkbox'?input.checked=!!prefs[input.dataset.pref]:input.value=prefs[input.dataset.pref];});
    sync();panel.addEventListener('input',e=>{const input=e.target;if(!input.dataset.pref)return;prefs[input.dataset.pref]=input.type==='checkbox'?input.checked:input.type==='range'?Number(input.value):input.value;save();});
    panel.querySelector('#lt-reset').onclick=()=>{prefs={...defaults};save();sync();};
    panel.querySelector('#lt-close').onclick=()=>panel.close();
    button.onclick=()=>{if(!panel.open)panel.showModal();};
    document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.shiftKey&&e.code==='KeyL'){e.preventDefault();button.click();}});
    document.body.append(button,panel);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
