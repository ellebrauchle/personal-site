/* "Ask my site" — chat launcher + panel, injected into every page.
   The browser only ever talks to /api/chat on this site.

   Restyled for direction 1a: soft radii and the forest / sand / sunset
   palette, replacing the old squared forest-and-cider treatment.
   To drop the feature, delete this file and the one <script> tag
   that loads it from each page. */
(function () {
  if (document.getElementById('ask-my-site')) return;

  var CSS = [
    '.ask-my-site{--ams-forest:#255551;--ams-sand:#ECE9DF;--ams-sunset:#DC8672;',
    '--ams-bg:#FAF8F3;--ams-ink:#474238;display:contents;',
    'font-family:Lato,"Helvetica Neue",Helvetica,Arial,system-ui,sans-serif;font-size:16px;line-height:1.5;text-align:left}',
    '.ask-my-site :where(h2,ul,li,p,small,form,input,button){all:revert}',
    '.ask-my-site,.ask-my-site *{box-sizing:border-box}',
    '.ask-my-site svg{display:block;flex:none;width:22px;height:22px;max-width:none;fill:none;stroke:currentColor}',
    '.ams-close svg{width:20px;height:20px}',

    '.ams-launcher{position:fixed;right:20px;bottom:20px;z-index:9999;display:flex;align-items:center;gap:9px;',
    'min-height:50px;margin:0;padding:0 20px 0 16px;border:0;border-radius:999px;font-family:inherit;font-size:.85rem;',
    'font-weight:700;letter-spacing:.06em;line-height:1;white-space:nowrap;color:#46180E;background:var(--ams-sunset);',
    'box-shadow:0 4px 14px rgba(46,43,37,.22);cursor:pointer;transition:background-color .16s ease,color .16s ease}',
    '.ams-launcher:hover{background:var(--ams-forest);color:var(--ams-bg)}',

    '.ams-panel{position:fixed;right:20px;bottom:82px;z-index:9999;display:flex;flex-direction:column;width:360px;',
    'max-width:calc(100vw - 40px);height:520px;max-height:calc(100dvh - 100px);overflow:hidden;color:var(--ams-ink);',
    'background:var(--ams-bg);border:2px solid var(--ams-sand);border-radius:20px;box-shadow:0 14px 40px rgba(46,43,37,.2)}',
    '.ams-panel[hidden]{display:none}',

    '.ams-header{display:flex;flex:none;align-items:center;justify-content:space-between;gap:8px;padding:6px 6px 6px 18px;',
    'color:var(--ams-bg);background:var(--ams-forest)}',
    '.ams-title{margin:0;font-family:inherit;font-size:.95rem;font-weight:700;letter-spacing:.04em;line-height:1.3;color:var(--ams-bg)}',
    '.ams-close{display:flex;flex:none;align-items:center;justify-content:center;width:40px;height:40px;margin:0;padding:0;',
    'border:0;border-radius:50%;color:inherit;background:transparent;cursor:pointer;transition:background-color .16s ease}',
    '.ams-close:hover{background:rgba(250,248,243,.18)}',

    '.ams-messages{display:flex;flex:1 1 auto;flex-direction:column;gap:10px;min-height:0;margin:0;padding:16px;',
    'list-style:none;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}',
    '.ams-messages li{align-self:flex-start;max-width:88%;margin:0;padding:10px 14px;border-radius:14px;',
    'color:var(--ams-ink);background:#fff;border:1px solid var(--ams-sand);font-size:15px;line-height:1.45;overflow-wrap:anywhere}',
    '.ams-messages li.ams-user{align-self:flex-end;background:var(--ams-sunset);border-color:var(--ams-sunset);color:#46180E}',
    '.ams-messages li.ams-note{max-width:none;padding:0;border:0;background:none;font-size:.82rem;color:#7A756A}',
    '.ams-messages li p{margin:0;white-space:pre-wrap}',
    '.ams-messages li small{display:block;margin-top:7px;font-size:12px;color:#7A756A}',

    '.ams-form{display:flex;flex:none;gap:8px;margin:0;padding:12px;border-top:1px solid var(--ams-sand)}',
    '.ams-form input{flex:1;min-width:0;min-height:44px;margin:0;padding:0 14px;font-family:inherit;font-size:16px;',
    'color:var(--ams-ink);background:#fff;border:1px solid var(--ams-sand);border-radius:999px}',
    '.ams-form input::placeholder{color:#9A9488}',
    '.ams-form button{flex:none;min-width:72px;min-height:44px;margin:0;padding:0 18px;border:0;border-radius:999px;',
    'font-family:inherit;font-size:.82rem;font-weight:700;color:var(--ams-bg);background:var(--ams-forest);cursor:pointer;',
    'transition:background-color .16s ease,color .16s ease}',
    '.ams-form button:hover:not(:disabled){background:var(--ams-sunset);color:#46180E}',
    '.ams-form button:disabled,.ams-form input:disabled{opacity:.6;cursor:default}',

    '.ask-my-site button:focus-visible,.ask-my-site input:focus-visible{outline:3px solid var(--ams-forest);outline-offset:2px}',
    '.ams-close:focus-visible{outline-color:var(--ams-sand);outline-offset:-3px}',

    '@media (max-width:480px){.ams-launcher{right:12px;bottom:12px}',
    '.ams-panel{left:8px;right:8px;bottom:74px;width:auto;max-width:none;max-height:calc(100dvh - 80px)}}',
    '@media (max-width:340px){.ams-launcher{justify-content:center;width:50px;padding:0}',
    '.ams-label{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}}',
    '@media (prefers-reduced-motion:no-preference){.ams-panel{animation:ams-open .16s ease-out}',
    '@keyframes ams-open{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}}',
    '@media (prefers-reduced-motion:reduce){.ask-my-site *{transition:none!important}}',
    '@media print{.ask-my-site{display:none!important}}'
  ].join('');

  var HTML = [
    '<div id="ams-panel" class="ams-panel" role="dialog" aria-label="Ask my site" hidden>',
    '<div class="ams-header"><h2 class="ams-title">Ask my site</h2>',
    '<button type="button" id="ams-close" class="ams-close" aria-label="Close chat">',
    '<svg viewBox="0 0 24 24" aria-hidden="true" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    '</button></div>',
    '<ul id="ams-messages" class="ams-messages" aria-live="polite">',
    '<li class="ams-note">Ask a question about what is on this site.</li></ul>',
    '<form id="ams-form" class="ams-form" autocomplete="off">',
    '<input id="ams-input" type="text" maxlength="600" placeholder="Ask a question…" aria-label="Your question" required>',
    '<button type="submit" id="ams-send">Send</button></form></div>',
    '<button type="button" id="ams-launcher" class="ams-launcher" aria-expanded="false" aria-controls="ams-panel">',
    '<svg viewBox="0 0 24 24" aria-hidden="true" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-4.5 3.5V17H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>',
    '<span class="ams-label">Ask my site</span></button>'
  ].join('');

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  var root = document.createElement('div');
  root.id = 'ask-my-site';
  root.className = 'ask-my-site';
  root.innerHTML = HTML;
  document.body.appendChild(root);

  var panel = document.getElementById('ams-panel');
  var launcher = document.getElementById('ams-launcher');
  var closeButton = document.getElementById('ams-close');
  var list = document.getElementById('ams-messages');
  var form = document.getElementById('ams-form');
  var input = document.getElementById('ams-input');
  var button = document.getElementById('ams-send');
  var history = []; // kept while the page is open, so closing the panel loses nothing

  function openPanel() {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    list.scrollTop = list.scrollHeight;
    input.focus();
  }

  function closePanel() {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }

  launcher.addEventListener('click', function () {
    if (panel.hidden) openPanel(); else closePanel();
  });
  closeButton.addEventListener('click', closePanel);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) closePanel();
  });

  function add(role, text, sources) {
    var item = document.createElement('li');
    item.className = 'ams-' + role;
    var body = document.createElement('p');
    body.textContent = text;
    item.appendChild(body);
    if (sources && sources.length) {
      var note = document.createElement('small');
      note.textContent = 'Sources: ' + sources.join(', ');
      item.appendChild(note);
    }
    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
    return item;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var question = input.value.trim();
    if (!question) return;
    add('user', question);
    input.value = '';
    input.disabled = true;
    button.disabled = true;
    var pending = add('assistant', 'Thinking…');

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question: question, history: history.slice(-6) })
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          return { status: response.status, data: data };
        });
      })
      .then(function (result) {
        pending.remove();
        var data = result.data;
        if (result.status === 200 && data && typeof data.answer === 'string') {
          add('assistant', data.answer, data.files_used);
          history.push({ role: 'user', content: question });
          history.push({ role: 'assistant', content: data.answer });
        } else if (result.status === 503) {
          add('assistant', "This site's chat isn't set up yet.");
        } else if (result.status === 429) {
          add('assistant', 'Too many questions for now — try again in a few minutes.');
        } else {
          add('assistant', 'Something went wrong. Please try again.');
        }
      })
      .catch(function () {
        pending.remove();
        add('assistant', 'Something went wrong. Please try again.');
      })
      .finally(function () {
        input.disabled = false;
        button.disabled = false;
        if (!panel.hidden) input.focus();
      });
  });
})();
