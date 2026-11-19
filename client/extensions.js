(() => {
  'use strict';
  if (location.origin !== 'https://81-90-31-167.sslip.io' || window.__ltExtensions) return;
  window.__ltExtensions = true;
  const KEY = 'limotools.extensions.v2';
  const defaults = {focus:false, blurMedia:false, hideAvatars:false, monochrome:false,
    radius:18, font:'system', lineHeight:1.45, width:100};
  const fonts = {system:'system-ui,sans-serif', rounded:'ui-rounded,system-ui,sans-serif',
    mono:'ui-monospace,Consolas,monospace', serif:'Georgia,serif'};
  const normalize = value => {
    const clean = {...defaults};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return clean;
    for (const k of ['focus','blurMedia','hideAvatars','monochrome']) clean[k] = value[k] === true;
    for (const [k,min,max] of [['radius',0,32],['lineHeight',1.1,2],['width',60,100]]) {
      if (typeof value[k] === 'number' && Number.isFinite(value[k])) clean[k] = Math.max(min,Math.min(max,value[k]));
    }
    if (Object.hasOwn(fonts,value.font)) clean.font = value.font;
    return clean;
  };
  let prefs;
  try { prefs = normalize(JSON.parse(localStorage.getItem(KEY)||'{}')); } catch { prefs = {...defaults}; }
  const style = document.createElement('style'); style.id='lt-extensions-style'; document.head.append(style);
  const apply = () => {
    style.textContent = `
      #app .bubble{border-radius:${prefs.radius}px!important;font-family:${fonts[prefs.font]}!important;line-height:${prefs.lineHeight}!important}
      #app .bubble .text{line-height:${prefs.lineHeight}!important}
      #app .messages-inner{max-width:${prefs.width}%!important;margin-inline:auto!important}
      ${prefs.focus?'#app .stories-strip,#app .theme-effect,#app .blob{display:none!important}':''}
      ${prefs.blurMedia?'#app .bubble-image img,#app .bubble video{filter:blur(16px)}#app .bubble-image:focus-within img,#app .bubble-image:hover img,#app .bubble video:focus{filter:none}':''}
      ${prefs.hideAvatars?'#app .chat-item>.avatar,#app .msg-avatar{display:none!important}':''}
      ${prefs.monochrome?'#app{filter:grayscale(1)}':''}
      #lt-button{top:auto!important;bottom:max(85px,calc(env(safe-area-inset-bottom) + 75px))!important;right:12px!important}
      #lt-panel{width:min(520px,calc(100vw - 24px))!important;padding:20px!important}
      #lt-panel section{margin-top:18px;padding-top:14px;border-top:1px solid #ffffff20}
      #lt-panel h3{font-size:16px;margin:0 0 10px}#lt-panel .lt-field{display:flex;flex-wrap:wrap;gap:8px}
      #lt-panel .lt-field span{flex:1;min-width:150px}#lt-panel select,#lt-panel textarea,#lt-search,#lt-transfer{background:#252135;color:#f6f4ff;border:1px solid #ffffff30;border-radius:10px;padding:10px;box-sizing:border-box;font:14px system-ui}
      #lt-panel textarea,#lt-search,#lt-transfer{width:100%}#lt-panel textarea{resize:vertical;min-height:80px}
      #lt-panel [hidden]{display:none!important}#lt-panel .lt-actions{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
      #lt-panel .lt-hint{font-size:12px;color:#c2bad6;line-height:1.5}#lt-panel output{min-width:45px;text-align:right}
      #lt-panel .lt-template{display:flex;gap:8px;margin:8px 0}#lt-panel .lt-template button:first-child{flex:1;text-align:left;white-space:pre-wrap;overflow-wrap:anywhere}
      #lt-panel button:focus-visible,#lt-panel input:focus-visible,#lt-panel textarea:focus-visible,#lt-panel select:focus-visible{outline:2px solid #b6a4ff;outline-offset:3px}
    `;
  };
  apply();
  const mount = () => {
    const panel=document.getElementById('lt-panel'); if(!panel)return false;
    const make=(tag,text,attrs={})=>{const el=document.createElement(tag);if(text)el.textContent=text;for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;};
    const status=make('p','',{role:'status','aria-live':'polite',class:'lt-hint'});
    const tell=text=>{status.textContent=text;};
    const persist=()=>{apply();try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch{tell('Не удалось сохранить: память устройства заполнена или недоступна.');}};
    const search=make('input','',{id:'lt-search',type:'search',placeholder:'Найти настройку или инструмент…','aria-label':'Поиск настроек'});
    panel.querySelector('h2').after(search);
    const section=(title,description)=>{const el=make('section');el.append(make('h3',title));if(description)el.append(make('p',description,{class:'lt-hint'}));panel.append(el);return el;};
    const appearance=section('Оформление и фокус','Дополнительные настройки LimoTools 0.2.0.');
    const controls=[];
    const field=(name,label,type,options)=>{
      const row=make('label','',{class:'lt-field'});row.append(make('span',label));
      const input=make(type==='select'?'select':'input','',{'aria-label':label,'data-lt-pref':name});
      if(type==='select')for(const [v,t] of options)input.append(make('option',t,{value:v}));
      else{input.type=type;if(options){input.min=options[0];input.max=options[1];input.step=options[2];}}
      row.append(input);let output;if(type==='range'){output=make('output');row.append(output);}
      const sync=()=>{if(type==='checkbox')input.checked=prefs[name];else input.value=String(prefs[name]);if(output)output.textContent=String(prefs[name]);};
      input.addEventListener('input',()=>{prefs[name]=type==='checkbox'?input.checked:type==='range'?Number(input.value):input.value;prefs=normalize(prefs);sync();persist();});
      controls.push(sync);sync();appearance.append(row);
    };
    field('focus','Режим фокуса: убрать истории и фоновые эффекты','checkbox');
    field('blurMedia','Размывать фото и видео в переписке','checkbox');
    field('hideAvatars','Скрыть аватарки в списке и переписке','checkbox');
    field('monochrome','Монохромный режим','checkbox');
    field('radius','Скругление пузырьков','range',[0,32,1]);
    field('font','Шрифт сообщений','select',[['system','Системный'],['rounded','Округлый'],['mono','Моноширинный'],['serif','С засечками']]);
    field('lineHeight','Межстрочный интервал','range',[1.1,2,.05]);
    field('width','Ширина переписки, %','range',[60,100,5]);
    appearance.append(make('p','Размытие — только визуальный эффект. Наведите мышь или нажмите на медиа, чтобы открыть его обычным просмотрщиком.',{class:'lt-hint'}));
    const notesSection=section('Личный блокнот','Хранится только на этом устройстве, общий для аккаунтов этого клиента. Не отправляется в чат и не входит в экспорт настроек.');
    const notes=make('textarea','',{'aria-label':'Личный блокнот',maxlength:10000,placeholder:'Запиши идею, список дел или черновик…'});
    const notesCount=make('p','',{class:'lt-hint'});try{notes.value=(localStorage.getItem('limotools.notes.v1')||'').slice(0,10000);}catch{}
    const countNotes=()=>notesCount.textContent=notes.value.length+' / 10000 — сохраняется автоматически';countNotes();
    notes.addEventListener('input',()=>{countNotes();try{localStorage.setItem('limotools.notes.v1',notes.value.slice(0,10000));}catch{tell('Блокнот не сохранён: память недоступна.');}});notesSection.append(notes,notesCount);
    const templatesSection=section('Шаблоны ответов','Нажатие вставляет текст в поле открытого чата. Отправить сообщение нужно самостоятельно. Шаблоны общие для аккаунтов на устройстве.');
    const draft=make('textarea','',{'aria-label':'Новый шаблон',maxlength:2000,placeholder:'Текст быстрого ответа…'});
    const add=make('button','Сохранить шаблон',{type:'button'});const list=make('div');
    let templates=[];try{const v=JSON.parse(localStorage.getItem('limotools.templates.v1')||'[]');if(Array.isArray(v))templates=v.filter(t=>typeof t==='string'&&t.trim()).slice(0,20).map(t=>t.slice(0,2000));}catch{}
    const renderTemplates=()=>{list.replaceChildren();if(!templates.length)list.append(make('p','Пока нет шаблонов. Можно сохранить до 20.',{class:'lt-hint'}));templates.forEach((text,index)=>{
      const row=make('div','',{class:'lt-template'});const use=make('button',text,{type:'button','aria-label':'Вставить шаблон '+(index+1)});const remove=make('button','×',{type:'button','aria-label':'Удалить шаблон '+(index+1)});
      use.onclick=()=>{const composer=document.querySelector('textarea.composer-input');if(!composer||composer.disabled){tell('Сначала откройте чат с доступным полем сообщения.');return;}
        const start=composer.selectionStart??composer.value.length,end=composer.selectionEnd??start;
        const value=composer.value.slice(0,start)+text+composer.value.slice(end);
        if(composer.maxLength>0&&value.length>composer.maxLength){tell('Шаблон не вставлен: превышена длина сообщения.');return;}
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(composer,value);
        composer.dispatchEvent(new Event('input',{bubbles:true}));panel.close();composer.focus();composer.setSelectionRange(start+text.length,start+text.length);
      };
      remove.onclick=()=>{templates.splice(index,1);storeTemplates();renderTemplates();};row.append(use,remove);list.append(row);
    });};
    const storeTemplates=()=>{try{localStorage.setItem('limotools.templates.v1',JSON.stringify(templates));}catch{tell('Шаблоны не сохранены: память недоступна.');}};
    add.onclick=()=>{const value=draft.value.trim();if(!value)return tell('Введите текст шаблона.');if(templates.length>=20)return tell('Можно сохранить не больше 20 шаблонов.');templates.push(value.slice(0,2000));storeTemplates();draft.value='';renderTemplates();tell('Шаблон сохранён.');};
    templatesSection.append(draft,add,list);renderTemplates();
    const transferSection=section('Перенос настроек','Экспорт содержит только оформление LimoTools. Пароли, сессии, переписки, блокнот и шаблоны в него не входят. Скопируйте код на другое устройство.');
    const transfer=make('textarea','',{id:'lt-transfer','aria-label':'Код настроек',maxlength:20000,placeholder:'Здесь появится код экспорта; сюда же вставь код для импорта.'});
    const actions=make('div','',{class:'lt-actions'});const exportButton=make('button','Экспорт',{type:'button'});const importButton=make('button','Импорт',{type:'button'});const reset=make('button','Сброс дополнений',{type:'button'});
    const baseNormalize=value=>{const out={};if(!value||typeof value!=='object'||Array.isArray(value))return out;
      if(typeof value.accent==='string'&&/^#[0-9a-f]{6}$/i.test(value.accent))out.accent=value.accent;
      if(typeof value.size==='number'&&Number.isFinite(value.size))out.size=Math.max(12,Math.min(22,value.size));
      for(const k of ['compact','motion','privacy'])if(typeof value[k]==='boolean')out[k]=value[k];return out;};
    exportButton.onclick=()=>{let base={};try{base=baseNormalize(JSON.parse(localStorage.getItem('limotools.preferences.v1')||'{}'));}catch{}
      transfer.value=JSON.stringify({format:'LimoTools',version:2,base,extensions:prefs},null,2);transfer.focus();transfer.select();tell('Код готов: скопируйте его.');};
    importButton.onclick=()=>{try{const data=JSON.parse(transfer.value);if(!data||data.format!=='LimoTools'||data.version!==2||!data.extensions||typeof data.extensions!=='object'||Array.isArray(data.extensions))throw new Error();
        const next=normalize(data.extensions),base=baseNormalize(data.base);
        const baseKey='limotools.preferences.v1',oldBase=localStorage.getItem(baseKey),oldExtra=localStorage.getItem(KEY);
        try{localStorage.setItem(baseKey,JSON.stringify(base));localStorage.setItem(KEY,JSON.stringify(next));}catch(e){try{oldBase===null?localStorage.removeItem(baseKey):localStorage.setItem(baseKey,oldBase);oldExtra===null?localStorage.removeItem(KEY):localStorage.setItem(KEY,oldExtra);}catch{}throw e;}
        prefs=next;apply();controls.forEach(sync=>sync());tell('Дополнения применены. Цвет и основные настройки применятся после перезапуска клиента.');
      }catch{tell('Не удалось импортировать: проверьте код LimoTools v2 и доступность памяти.');}};
    reset.onclick=()=>{prefs={...defaults};persist();controls.forEach(sync=>sync());tell('Дополнения сброшены. Блокнот и шаблоны сохранены.');};
    actions.append(exportButton,importButton,reset);transferSection.append(transfer,actions);panel.append(status);
    search.addEventListener('input',()=>{const query=search.value.trim().toLocaleLowerCase();
      for(const row of panel.querySelectorAll(':scope > label'))row.hidden=!!query&&!row.textContent.toLocaleLowerCase().includes(query);
      for(const part of panel.querySelectorAll('section')){const title=part.querySelector('h3')?.textContent.toLocaleLowerCase()||'';const fields=[...part.querySelectorAll('.lt-field')];
        if(fields.length){for(const row of fields)row.hidden=!!query&&!title.includes(query)&&!row.textContent.toLocaleLowerCase().includes(query);part.hidden=!!query&&fields.every(row=>row.hidden);}
        else part.hidden=!!query&&!part.textContent.toLocaleLowerCase().includes(query);
      }
    });
    return true;
  };
  if(!mount()){
    const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});
    observer.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),15000);
  }
})();
