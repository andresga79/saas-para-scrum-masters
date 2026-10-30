/* SaaS para Scrum Masters — carga de módulos, navegación y progreso. */
(function () {
  'use strict';

  var STORAGE_KEY = 'saas-sm:completados';
  var LAST_KEY = 'saas-sm:ultimo';
  var VOICE_KEY = 'saas-sm:voz';
  var SITE_TITLE = 'SaaS para Scrum Masters';
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  var mobileQuery = window.matchMedia('(max-width: 899px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var state = {
    modules: [],
    aliases: {},
    done: new Set(),
    current: null,
    renderToken: 0,
    storageOk: true
  };

  var el = {
    doc: document.getElementById('doc'),
    footer: document.getElementById('doc-footer'),
    navList: document.getElementById('nav-list'),
    count: document.getElementById('progress-count'),
    bars: document.querySelectorAll('.progress__bar'),
    progress: document.querySelector('.progress[role="progressbar"]'),
    doneCurrent: document.getElementById('done-current'),
    prev: document.getElementById('prev'),
    next: document.getElementById('next'),
    sidebar: document.getElementById('sidebar'),
    menuBtn: document.querySelector('.menu-btn'),
    scrim: document.querySelector('.scrim'),
    storageNote: document.getElementById('storage-note'),
    player: document.getElementById('player'),
    playerTitle: document.getElementById('player-title'),
    playerStatus: document.getElementById('player-status'),
    playerBar: document.querySelector('.player__progress span'),
    playerToggle: document.querySelector('[data-player="toggle"]'),
    playerRate: document.querySelector('[data-player="rate"]'),
    playerSettingsBtn: document.querySelector('[data-player="settings"]'),
    playerSettings: document.getElementById('player-settings'),
    playerVoice: document.getElementById('player-voice'),
    playerAuto: document.getElementById('player-auto')
  };

  /* ---------- Almacenamiento (tolerante a fallos) ---------- */

  function readStore(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function writeStore(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* Solo comodidad: si falla, no se recuerda. */
    }
  }

  function loadDone() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) state.done = new Set(list);
    } catch (e) {
      state.storageOk = false;
    }
  }

  function saveDone() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(state.done)));
    } catch (e) {
      state.storageOk = false;
    }
    el.storageNote.hidden = state.storageOk;
  }

  /* ---------- Utilidades ---------- */

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function moduleNumber(slug) {
    return slug.slice(0, 2);
  }

  function indexOfSlug(slug) {
    for (var i = 0; i < state.modules.length; i++) {
      if (state.modules[i].slug === slug) return i;
    }
    return -1;
  }

  function currentSlug() {
    var match = /^#\/([\w-]+)/.exec(window.location.hash);
    return match ? match[1] : state.modules[0].slug;
  }

  // Slugs antiguos (módulos renumerados) siguen funcionando y conservan su progreso.
  function registerAliases(modules) {
    modules.forEach(function (m) {
      (m.aliases || []).forEach(function (alias) {
        state.aliases[alias] = m.slug;
        if (state.done.has(alias)) {
          state.done.delete(alias);
          state.done.add(m.slug);
          saveDone();
        }
      });
    });
  }

  /* ---------- Markdown y Mermaid ---------- */

  marked.use({
    gfm: true,
    renderer: {
      code: function (token) {
        if ((token.lang || '').trim() === 'mermaid') {
          return '<figure class="diagram" data-src="' + escapeHtml(token.text) + '">' +
            '<p class="diagram__pending">Dibujando diagrama…</p></figure>\n';
        }
        return false;
      }
    }
  });

  function mermaidConfig() {
    var dark = darkQuery.matches;
    var vars = dark
      ? {
          darkMode: true,
          background: '#131d31',
          primaryColor: '#1c2b4b',
          primaryTextColor: '#e2e8f1',
          primaryBorderColor: '#84a6ff',
          secondaryColor: '#3a3214',
          secondaryTextColor: '#f6ebbd',
          secondaryBorderColor: '#f5c400',
          tertiaryColor: '#18233a',
          tertiaryTextColor: '#e2e8f1',
          tertiaryBorderColor: '#3b4a68',
          lineColor: '#9aa7bd',
          textColor: '#e2e8f1',
          noteBkgColor: '#3a3214',
          noteTextColor: '#f6ebbd',
          noteBorderColor: '#f5c400',
          actorBkg: '#1c2b4b',
          actorBorder: '#84a6ff',
          actorTextColor: '#e2e8f1',
          signalColor: '#c9d3e3',
          signalTextColor: '#e2e8f1',
          labelBoxBkgColor: '#1c2b4b',
          labelTextColor: '#e2e8f1',
          loopTextColor: '#e2e8f1',
          activationBkgColor: '#26365a',
          clusterBkg: '#111b2e',
          clusterBorder: '#3b4a68',
          edgeLabelBackground: '#131d31',
          attributeBackgroundColorOdd: '#18233a',
          attributeBackgroundColorEven: '#131d31',
          sectionBkgColor: '#18233a',
          altSectionBkgColor: '#131d31',
          sectionBkgColor2: '#1c2b4b',
          taskBkgColor: '#2c4ea8',
          taskBorderColor: '#84a6ff',
          taskTextColor: '#ffffff',
          taskTextLightColor: '#ffffff',
          taskTextOutsideColor: '#e2e8f1',
          taskTextDarkColor: '#e2e8f1',
          activeTaskBkgColor: '#f5c400',
          activeTaskBorderColor: '#f5c400',
          doneTaskBkgColor: '#3b4a68',
          doneTaskBorderColor: '#8e9ab0',
          critBkgColor: '#b8432f',
          critBorderColor: '#ff8a7a',
          gridColor: '#26324a',
          todayLineColor: '#f5c400',
          titleColor: '#e2e8f1'
        }
      : {
          darkMode: false,
          background: '#f3f5f8',
          primaryColor: '#dce5fb',
          primaryTextColor: '#14213d',
          primaryBorderColor: '#1f4fd1',
          secondaryColor: '#fff1b8',
          secondaryTextColor: '#14213d',
          secondaryBorderColor: '#c99f00',
          tertiaryColor: '#e7ebf1',
          tertiaryTextColor: '#14213d',
          tertiaryBorderColor: '#a9b4c4',
          lineColor: '#34425e',
          textColor: '#14213d',
          noteBkgColor: '#fff1b8',
          noteTextColor: '#14213d',
          noteBorderColor: '#c99f00',
          actorBkg: '#dce5fb',
          actorBorder: '#1f4fd1',
          actorTextColor: '#14213d',
          signalColor: '#14213d',
          signalTextColor: '#14213d',
          labelBoxBkgColor: '#dce5fb',
          labelTextColor: '#14213d',
          loopTextColor: '#14213d',
          activationBkgColor: '#c6d4f7',
          clusterBkg: '#eef1f6',
          clusterBorder: '#a9b4c4',
          edgeLabelBackground: '#f3f5f8',
          attributeBackgroundColorOdd: '#f3f5f8',
          attributeBackgroundColorEven: '#e7ebf1',
          sectionBkgColor: '#e7ebf1',
          altSectionBkgColor: '#f3f5f8',
          sectionBkgColor2: '#dce5fb',
          taskBkgColor: '#1f4fd1',
          taskBorderColor: '#163a9e',
          taskTextColor: '#ffffff',
          taskTextLightColor: '#ffffff',
          taskTextOutsideColor: '#14213d',
          taskTextDarkColor: '#14213d',
          activeTaskBkgColor: '#f5c400',
          activeTaskBorderColor: '#c99f00',
          doneTaskBkgColor: '#a9b4c4',
          doneTaskBorderColor: '#5a6780',
          critBkgColor: '#d9563f',
          critBorderColor: '#b42318',
          gridColor: '#c3ccd9',
          todayLineColor: '#c99f00',
          titleColor: '#14213d'
        };

    vars.fontFamily = '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif';
    vars.fontSize = '15px';

    return {
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      themeVariables: vars,
      flowchart: { curve: 'basis', padding: 12 },
      sequence: { mirrorActors: false },
      gantt: { barHeight: 22, fontSize: 12, sectionFontSize: 13, leftPadding: 175 }
    };
  }

  var mermaidSeq = 0;
  // Bajo esta escala el texto del diagrama deja de ser legible: se conserva el
  // tamaño y la caja del diagrama se desplaza horizontalmente.
  // Si cabe completo a una escala de al menos FIT_SCALE, se prefiere eso al scroll.
  var MIN_SCALE = 0.7;
  var FIT_SCALE = 0.6;
  var GANTT_MIN_WIDTH = 720;

  function fitDiagram(figure) {
    var canvas = figure.querySelector('.diagram__canvas');
    var svg = canvas && canvas.querySelector('svg');
    var hint = figure.querySelector('.diagram__hint');
    if (!svg || !hint) return;
    if (!figure.classList.contains('diagram--gantt')) {
      var natural = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal.width : 0;
      svg.style.width = '';
      svg.style.maxWidth = natural ? natural + 'px' : '';
      var minWidth = Math.ceil(natural * MIN_SCALE);
      if (natural && canvas.clientWidth / natural < FIT_SCALE) {
        svg.style.width = minWidth + 'px';
        svg.style.maxWidth = 'none';
      }
    }
    hint.hidden = canvas.scrollWidth <= canvas.clientWidth + 1;
  }

  function fitAllDiagrams() {
    el.doc.querySelectorAll('.diagram').forEach(fitDiagram);
  }

  function renderDiagrams(root, token) {
    if (!window.mermaid) return Promise.resolve();
    mermaid.initialize(mermaidConfig());
    var figures = Array.prototype.slice.call(root.querySelectorAll('.diagram'));
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

    return fontsReady.then(function () {
      // mermaid.render no admite llamadas concurrentes: se dibujan en serie.
      return figures.reduce(function (chain, figure) {
        return chain.then(function () {
          if (token !== state.renderToken) return;
          var src = figure.getAttribute('data-src');
          var id = 'mmd-' + (++mermaidSeq);
          var isGantt = /^gantt\b/.test(src.trim());
          figure.classList.toggle('diagram--gantt', isGantt);
          figure.innerHTML = '<div class="diagram__canvas"><div class="diagram__stage">' +
            '<p class="diagram__pending">Dibujando diagrama…</p></div></div>' +
            '<p class="diagram__hint" hidden>Desliza horizontalmente para ver el diagrama completo →</p>';
          var stage = figure.querySelector('.diagram__stage');
          // El Gantt calcula su ancho a partir del contenedor en que se dibuja.
          if (isGantt) stage.style.width = 'max(' + GANTT_MIN_WIDTH + 'px, 100%)';
          return mermaid.render(id, src, stage).then(function (out) {
            if (token !== state.renderToken) return;
            stage.innerHTML = out.svg;
            if (out.bindFunctions) out.bindFunctions(stage);
            fitDiagram(figure);
          }).catch(function (err) {
            var stray = document.getElementById('d' + id);
            if (stray) stray.remove();
            figure.innerHTML = '<p class="diagram__error">No se pudo dibujar este diagrama: ' +
              escapeHtml(err && err.message ? err.message : String(err)) + '</p>' +
              '<pre><code>' + escapeHtml(src) + '</code></pre>';
          });
        });
      }, Promise.resolve());
    });
  }

  /* ---------- Mejora del HTML renderizado ---------- */

  function nextElement(node, tagName) {
    var n = node.nextElementSibling;
    while (n && n.tagName !== 'H2') {
      if (n.tagName === tagName) return n;
      n = n.nextElementSibling;
    }
    return null;
  }

  function enhance(root) {
    // Enlaces entre módulos escritos como "03-bases-de-datos.md" (funcionan en GitHub).
    root.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      var local = /^(?:\.\/)?(\d\d-[\w-]+)\.md$/.exec(href);
      if (local) {
        a.setAttribute('href', '#/' + local[1]);
      } else if (/^https?:\/\//.test(href)) {
        a.setAttribute('rel', 'noopener');
        a.setAttribute('target', '_blank');
      }
    });

    // Tablas con scroll horizontal propio. En pantallas angostas el CSS las apila
    // como fichas: cada celda muestra su encabezado (data-label). Los roles ARIA
    // explícitos conservan la semántica de tabla cuando cambia el display.
    root.querySelectorAll('table').forEach(function (table) {
      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('tabindex', '0');
      var caption = table.querySelector('th');
      wrap.setAttribute('aria-label', 'Tabla' + (caption ? ': ' + caption.textContent.trim() : ''));
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);

      var headers = Array.prototype.map.call(table.querySelectorAll('thead th'), function (th) {
        return th.textContent.trim();
      });
      table.setAttribute('role', 'table');
      table.querySelectorAll('thead, tbody').forEach(function (g) { g.setAttribute('role', 'rowgroup'); });
      table.querySelectorAll('tr').forEach(function (tr) { tr.setAttribute('role', 'row'); });
      table.querySelectorAll('th').forEach(function (th) { th.setAttribute('role', 'columnheader'); });
      table.querySelectorAll('tbody tr').forEach(function (tr) {
        Array.prototype.forEach.call(tr.children, function (td, i) {
          td.setAttribute('role', 'cell');
          if (headers[i]) td.setAttribute('data-label', headers[i]);
        });
      });
    });

    root.querySelectorAll('h2').forEach(function (h2) {
      var text = h2.textContent.trim().toLowerCase();
      if (text.indexOf('idea clave') === 0) {
        var lead = nextElement(h2, 'P');
        if (lead) lead.classList.add('lead');
      }
      if (text.indexOf('preguntas para tu equipo') === 0) {
        var ol = nextElement(h2, 'OL');
        if (ol) ol.classList.add('questions');
      }
    });

    root.querySelectorAll('blockquote').forEach(function (bq) {
      var label = bq.querySelector('p:first-child > strong:first-child');
      var text = label ? label.textContent.toLowerCase() : '';
      bq.classList.add('callout');
      if (/^(ojo|atención|advertencia|aviso)/.test(text)) bq.classList.add('callout--warn');
    });
  }

  /* ---------- Navegación lateral y progreso ---------- */

  function buildNav() {
    var html = state.modules.map(function (m) {
      return '<li class="nav-item" data-slug="' + m.slug + '">' +
        '<a class="nav-link" href="#/' + m.slug + '">' +
        '<span class="nav-num">' + moduleNumber(m.slug) + '</span>' +
        '<span class="nav-title">' + escapeHtml(m.title) + '</span></a>' +
        // La etiqueta agranda el área táctil de la casilla.
        '<label class="nav-check"><input class="check" type="checkbox" data-slug="' + m.slug + '" ' +
        'aria-label="Completado: ' + escapeHtml(m.title) + '"></label>' +
        '</li>';
    }).join('');
    el.navList.innerHTML = html;

    el.navList.addEventListener('change', function (e) {
      if (e.target.matches('.check')) setDone(e.target.getAttribute('data-slug'), e.target.checked);
    });
    el.navList.addEventListener('click', function (e) {
      if (e.target.closest('.nav-link') && mobileQuery.matches) setMenu(false);
    });
  }

  function setDone(slug, isDone) {
    if (isDone) state.done.add(slug);
    else state.done.delete(slug);
    saveDone();
    syncProgress();
  }

  function syncProgress() {
    var total = state.modules.length;
    var count = state.modules.filter(function (m) { return state.done.has(m.slug); }).length;
    var pct = total ? Math.round((count / total) * 100) : 0;

    el.count.textContent = count + ' / ' + total;
    el.bars.forEach(function (bar) { bar.style.width = pct + '%'; });
    el.progress.setAttribute('aria-valuenow', String(pct));
    el.progress.setAttribute('aria-valuetext', count + ' de ' + total + ' módulos completados');

    el.navList.querySelectorAll('.nav-item').forEach(function (li) {
      var slug = li.getAttribute('data-slug');
      var isDone = state.done.has(slug);
      li.classList.toggle('is-done', isDone);
      li.classList.toggle('is-current', slug === state.current);
      li.querySelector('.check').checked = isDone;
      var link = li.querySelector('.nav-link');
      if (slug === state.current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    if (state.current) el.doneCurrent.checked = state.done.has(state.current);
  }

  /* ---------- Menú móvil ---------- */

  function setMenu(open) {
    document.body.classList.toggle('nav-open', open);
    el.menuBtn.setAttribute('aria-expanded', String(open));
    el.scrim.hidden = !open;
    syncSidebarInert();
    if (open) {
      var link = el.sidebar.querySelector('.is-current .nav-link') || el.sidebar.querySelector('a');
      if (link) link.focus();
    }
  }

  function syncSidebarInert() {
    var hide = mobileQuery.matches && !document.body.classList.contains('nav-open');
    if (hide) el.sidebar.setAttribute('inert', '');
    else el.sidebar.removeAttribute('inert');
  }

  /* ---------- Render de un módulo ---------- */

  function setPager(link, mod, label) {
    if (!mod) {
      link.hidden = true;
      return;
    }
    link.hidden = false;
    link.href = '#/' + mod.slug;
    link.innerHTML = '<small>' + label + ' · ' + moduleNumber(mod.slug) + '</small>' + escapeHtml(mod.title);
  }

  function showNotice(html) {
    el.doc.innerHTML = '<div class="notice">' + html + '</div>';
    el.footer.hidden = true;
  }

  function showFetchError() {
    showNotice(
      '<h1>No se pudo cargar el contenido</h1>' +
      '<p>Esta guía lee sus módulos desde la carpeta <code>content/</code>, y los navegadores ' +
      'bloquean esas lecturas cuando abres <code>index.html</code> directamente desde el disco ' +
      '(<code>file://</code>).</p>' +
      '<p>Levanta un servidor local desde la carpeta del proyecto:</p>' +
      '<pre><code>cd saas-para-scrum-masters\npython3 -m http.server 8000</code></pre>' +
      '<p>y abre <a href="http://localhost:8000">http://localhost:8000</a>.</p>'
    );
  }

  function readingMeta(root) {
    var words = 0;
    root.querySelectorAll('p, li, td, th, h2, h3, h4').forEach(function (n) {
      if (n.closest('figure, pre, .eyebrow')) return;
      if (n.tagName === 'P' && n.closest('li, td')) return;
      words += n.textContent.split(/\s+/).filter(Boolean).length;
    });
    // ~200 palabras por minuto leyendo y ~150 escuchando a velocidad normal.
    var read = Math.max(1, Math.round(words / 200));
    var listen = Math.max(1, Math.round(words / 150));
    return read + ' min de lectura · ~' + listen + ' min de audio';
  }

  function insertDocTools(h1) {
    if (!h1) return;
    var tools = document.createElement('div');
    tools.className = 'doc-tools';
    tools.innerHTML = (speech.supported
      ? '<button type="button" class="listen-btn" data-listen>' + ICONS.speaker +
        '<span>Escuchar este módulo</span></button>'
      : '') + '<span class="doc-meta">' + readingMeta(el.doc) + '</span>';
    h1.insertAdjacentElement('afterend', tools);
  }

  function render(focusHeading) {
    var slug = currentSlug();
    if (state.aliases[slug]) {
      history.replaceState(null, '', '#/' + state.aliases[slug]);
      slug = state.aliases[slug];
    }
    var index = indexOfSlug(slug);
    var token = ++state.renderToken;

    // Al cambiar de módulo la lectura se detiene, salvo que avance sola al siguiente.
    var continueSpeech = speech.continueOnRender;
    speech.continueOnRender = false;
    if (continueSpeech) {
      speech.token++;
      setHighlight(null);
    } else {
      stopSpeech();
    }

    if (index === -1) {
      state.current = null;
      syncProgress();
      document.title = 'Módulo no encontrado · ' + SITE_TITLE;
      showNotice('<h1>Módulo no encontrado</h1><p>No existe un módulo llamado <code>' +
        escapeHtml(slug) + '</code>. <a href="#/' + state.modules[0].slug + '">Volver al inicio</a>.</p>');
      return;
    }

    var mod = state.modules[index];
    state.current = slug;
    syncProgress();
    el.doc.setAttribute('aria-busy', 'true');

    fetch('content/' + slug + '.md')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (md) {
        if (token !== state.renderToken) return;
        el.doc.innerHTML = '<p class="eyebrow">Módulo ' + moduleNumber(slug) + ' de ' +
          moduleNumber(state.modules[state.modules.length - 1].slug) + '</p>' + marked.parse(md);
        enhance(el.doc);

        var h1 = el.doc.querySelector('h1');
        insertDocTools(h1);
        document.title = (h1 ? h1.textContent : mod.title) + ' · ' + SITE_TITLE;
        setPager(el.prev, state.modules[index - 1], 'Anterior');
        setPager(el.next, state.modules[index + 1], 'Siguiente');
        el.footer.hidden = false;
        writeStore(LAST_KEY, slug);
        window.scrollTo(0, 0);
        if (focusHeading && h1) {
          h1.setAttribute('tabindex', '-1');
          h1.focus({ preventScroll: true });
        }
        if (continueSpeech) startSpeech(0);
        return renderDiagrams(el.doc, token);
      })
      .catch(function (err) {
        if (token !== state.renderToken) return;
        if (err instanceof TypeError) showFetchError();
        else showNotice('<h1>Error al cargar el módulo</h1><p>' + escapeHtml(err.message) + '</p>');
      })
      .then(function () {
        if (token === state.renderToken) el.doc.removeAttribute('aria-busy');
      });
  }

  /* ---------- Lectura en voz alta (Web Speech API) ----------
     El texto se lee por fragmentos cortos (un párrafo, ítem o fila), porque
     algunos navegadores cortan las locuciones largas. "Pausar" cancela y
     recuerda el fragmento: pause()/resume() nativos no son confiables en iOS. */

  var ICONS = {
    speaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7l-1.4-1.4a3 3 0 0 0 0-4.2zM19 6a8.5 8.5 0 0 1 0 12l-1.4-1.4a6.5 6.5 0 0 0 0-9.2z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>'
  };
  var SPEECH_RATES = [0.85, 1, 1.15, 1.3, 1.5];
  var VOICE_PREFS = ['es-cl', 'es-419', 'es-us', 'es-mx', 'es-es'];
  var MAX_CHUNK = 220;
  var SPEAKABLE = 'h1, h2, h3, h4, p, li, tr, figure.diagram';
  var UNITS = {
    d: ['día', 'días'], h: ['hora', 'horas'], min: ['minuto', 'minutos'], s: ['segundo', 'segundos']
  };

  var speech = {
    supported: 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function',
    chunks: [],
    index: 0,
    playing: false,
    token: 0,
    rate: 1,
    voiceURI: '',
    autoNext: true,
    continueOnRender: false,
    utterance: null,
    watchdog: null,
    wakeLock: null,
    highlighted: null
  };

  function loadSpeechPrefs() {
    try {
      var prefs = JSON.parse(readStore(VOICE_KEY) || '{}');
      if (SPEECH_RATES.indexOf(prefs.rate) !== -1) speech.rate = prefs.rate;
      if (typeof prefs.voiceURI === 'string') speech.voiceURI = prefs.voiceURI;
      if (typeof prefs.autoNext === 'boolean') speech.autoNext = prefs.autoNext;
    } catch (e) {
      /* Preferencias corruptas: se usan las por defecto. */
    }
  }

  function saveSpeechPrefs() {
    writeStore(VOICE_KEY, JSON.stringify({
      rate: speech.rate, voiceURI: speech.voiceURI, autoNext: speech.autoNext
    }));
  }

  function speechText(text) {
    return String(text)
      // "3 d 15 h" → "3 días 15 horas". \b no sirve: sin el flag u trata "í" como no-letra.
      .replace(/(\d+(?:,\d+)?)\s?(d|h|min|s)(?![\wÀ-ÿ])/g, function (m, n, unit) {
        return n + ' ' + UNITS[unit][n === '1' ? 0 : 1];
      })
      .replace(/[·→←]/g, ', ')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:])/g, '$1')
      .replace(/,\s*,/g, ',')
      .trim();
  }

  // Agrupa piezas en fragmentos de hasta MAX_CHUNK caracteres.
  function pack(pieces) {
    var out = [];
    var buf = '';
    pieces.forEach(function (piece) {
      if (buf && (buf + piece).length > MAX_CHUNK) {
        out.push(buf.trim());
        buf = '';
      }
      buf += piece;
    });
    if (buf.trim()) out.push(buf.trim());
    return out;
  }

  function splitText(text) {
    if (text.length <= MAX_CHUNK) return [text];
    // Corta tras puntuación seguida de espacio: "99,9" o "100.000" no se parten.
    var sentences = pack(text.match(/.+?(?:[.!?;:](?=\s)|$)\s*/g) || [text]);
    var out = [];
    sentences.forEach(function (s) {
      if (s.length <= MAX_CHUNK) out.push(s);
      else out = out.concat(pack(s.match(/.+?(?:,(?=\s)|$)\s*/g) || [s]));
    });
    return out;
  }

  function ownText(node) {
    var clone = node.cloneNode(true);
    clone.querySelectorAll('ul, ol').forEach(function (list) { list.remove(); });
    return clone.textContent;
  }

  function rowText(tr) {
    var headers = tr.querySelectorAll('th');
    if (headers.length) {
      return 'Tabla con columnas: ' + Array.prototype.map.call(headers, function (th) {
        return th.textContent.trim();
      }).join(', ') + '.';
    }
    return Array.prototype.map.call(tr.children, function (td, i) {
      var label = i > 0 && td.getAttribute('data-label');
      return (label ? label + ': ' : '') + td.textContent.trim();
    }).join('. ');
  }

  function buildChunks(root) {
    var chunks = [];
    root.querySelectorAll(SPEAKABLE).forEach(function (node) {
      if (node.closest('.eyebrow, .doc-tools, pre, .notice')) return;
      if (node.tagName !== 'FIGURE' && node.closest('figure.diagram')) return;
      if (node.tagName === 'P' && node.closest('li')) return;
      var text;
      if (node.tagName === 'FIGURE') text = 'Diagrama: míralo en pantalla cuando puedas.';
      else if (node.tagName === 'TR') text = rowText(node);
      else if (node.tagName === 'LI') text = ownText(node);
      else text = node.textContent;
      text = speechText(text);
      if (!text) return;
      if (!/[.!?:;]$/.test(text)) text += '.';
      splitText(text).forEach(function (t) { chunks.push({ text: t, el: node }); });
    });
    return chunks;
  }

  function spanishVoices() {
    return window.speechSynthesis.getVoices().filter(function (v) {
      return /^es([-_]|$)/i.test(v.lang);
    });
  }

  function pickVoice() {
    var voices = spanishVoices();
    if (!voices.length) return null;
    var match = voices.filter(function (v) { return v.voiceURI === speech.voiceURI; })[0];
    if (match) return match;
    for (var i = 0; i < VOICE_PREFS.length; i++) {
      for (var j = 0; j < voices.length; j++) {
        if (voices[j].lang.replace('_', '-').toLowerCase() === VOICE_PREFS[i]) return voices[j];
      }
    }
    return voices[0];
  }

  function populateVoices() {
    var voices = spanishVoices();
    var selected = pickVoice();
    // Se compara por voiceURI: getVoices() puede devolver objetos nuevos en cada llamada.
    var selectedURI = selected ? selected.voiceURI : '';
    el.playerVoice.innerHTML = voices.map(function (v) {
      return '<option value="' + escapeHtml(v.voiceURI) + '"' + (v.voiceURI === selectedURI ? ' selected' : '') + '>' +
        escapeHtml(v.name) + ' (' + escapeHtml(v.lang) + ')</option>';
    }).join('') || '<option value="">Voz en español del sistema</option>';
  }

  function requestWakeLock() {
    // Mantiene la pantalla encendida mientras se escucha (si el navegador lo permite).
    if (speech.wakeLock || !('wakeLock' in navigator)) return;
    navigator.wakeLock.request('screen').then(function (lock) {
      speech.wakeLock = lock;
      lock.addEventListener('release', function () { speech.wakeLock = null; });
    }).catch(function () { /* No disponible: se ignora. */ });
  }

  function releaseWakeLock() {
    if (!speech.wakeLock) return;
    speech.wakeLock.release().catch(function () {});
    speech.wakeLock = null;
  }

  function setHighlight(node) {
    if (speech.highlighted === node) return;
    if (speech.highlighted) speech.highlighted.classList.remove('is-speaking');
    speech.highlighted = node;
    if (!node) return;
    node.classList.add('is-speaking');
    var rect = node.getBoundingClientRect();
    var top = mobileQuery.matches ? 72 : 16;
    var bottom = window.innerHeight - (el.player.hidden ? 0 : el.player.offsetHeight) - 16;
    if (rect.top < top || rect.bottom > bottom) {
      node.scrollIntoView({ block: 'center', behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
  }

  function formatRate(rate) {
    return String(rate).replace('.', ',') + '×';
  }

  function updatePlayer(message) {
    var total = speech.chunks.length;
    var mod = state.modules[indexOfSlug(state.current)];
    el.playerTitle.textContent = mod ? mod.title : '';
    el.playerStatus.textContent = message ||
      (total ? 'Fragmento ' + Math.min(speech.index + 1, total) + ' de ' + total : '');
    el.playerBar.style.width = total ? Math.round((speech.index / total) * 100) + '%' : '0';
    el.playerToggle.innerHTML = speech.playing ? ICONS.pause : ICONS.play;
    el.playerToggle.setAttribute('aria-label', speech.playing ? 'Pausar' : 'Reproducir');
    el.playerRate.textContent = formatRate(speech.rate);
    el.playerAuto.checked = speech.autoNext;

    var listen = el.doc.querySelector('[data-listen]');
    if (listen) {
      var label = speech.playing ? 'Pausar lectura' : (speech.chunks.length ? 'Continuar lectura' : 'Escuchar este módulo');
      listen.querySelector('span').textContent = label;
      listen.classList.toggle('is-active', speech.playing);
    }
  }

  function showPlayer(show) {
    el.player.hidden = !show;
    document.body.classList.toggle('has-player', show);
    if (!show) setSettings(false);
  }

  function setSettings(open) {
    el.playerSettings.hidden = !open;
    el.playerSettingsBtn.setAttribute('aria-expanded', String(open));
    if (open) populateVoices();
  }

  function speakCurrent() {
    clearTimeout(speech.watchdog);
    var token = ++speech.token;
    var chunk = speech.chunks[speech.index];
    if (!chunk) {
      finishModule();
      return;
    }
    speech.playing = true;
    setHighlight(chunk.el);
    updatePlayer();

    var utterance = new SpeechSynthesisUtterance(chunk.text);
    var voice = pickVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'es-ES';
    }
    utterance.rate = speech.rate;
    var started = false;
    utterance.onstart = function () {
      started = true;
      clearTimeout(speech.watchdog);
    };
    utterance.onend = function () {
      if (token !== speech.token) return;
      speech.index++;
      speakCurrent();
    };
    utterance.onerror = function (e) {
      if (token !== speech.token || e.error === 'interrupted' || e.error === 'canceled') return;
      if (e.error === 'not-allowed') {
        pauseSpeech('Toca ▶ para empezar');
        return;
      }
      speech.index++;
      speakCurrent();
    };
    // Se guarda la referencia: si el objeto se recolecta, algunos navegadores no emiten onend.
    speech.utterance = utterance;

    var synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) synth.cancel();
    synth.resume();
    synth.speak(utterance);
    // iOS bloquea la voz si no empieza tras un toque: en ese caso se queda en pausa.
    speech.watchdog = setTimeout(function () {
      if (token === speech.token && !started) pauseSpeech('Toca ▶ para continuar');
    }, 5000);
  }

  function startSpeech(fromIndex) {
    if (!speech.supported) return;
    speech.chunks = buildChunks(el.doc);
    speech.index = Math.max(0, Math.min(fromIndex || 0, speech.chunks.length - 1));
    showPlayer(true);
    requestWakeLock();
    speakCurrent();
  }

  function resumeSpeech() {
    if (!speech.chunks.length) {
      startSpeech(0);
      return;
    }
    if (speech.index >= speech.chunks.length) speech.index = 0;
    requestWakeLock();
    speakCurrent();
  }

  function pauseSpeech(message) {
    clearTimeout(speech.watchdog);
    speech.playing = false;
    speech.token++;
    if (speech.supported) window.speechSynthesis.cancel();
    releaseWakeLock();
    updatePlayer(message);
  }

  function stopSpeech() {
    if (!speech.supported) return;
    pauseSpeech();
    speech.chunks = [];
    speech.index = 0;
    setHighlight(null);
    showPlayer(false);
  }

  function finishModule() {
    var next = state.modules[indexOfSlug(state.current) + 1];
    if (speech.autoNext && next) {
      speech.continueOnRender = true;
      window.location.hash = '#/' + next.slug;
      return;
    }
    speech.playing = false;
    speech.index = speech.chunks.length;
    releaseWakeLock();
    setHighlight(null);
    updatePlayer('Fin del módulo');
  }

  // Avanza o retrocede al inicio del bloque (párrafo, ítem o fila) siguiente o anterior.
  function stepSpeech(direction) {
    var chunks = speech.chunks;
    if (!chunks.length) return;
    var i = Math.min(speech.index, chunks.length - 1);
    var current = chunks[i].el;
    if (direction > 0) {
      while (i < chunks.length && chunks[i].el === current) i++;
      if (i >= chunks.length) i = chunks.length - 1;
    } else {
      while (i > 0 && chunks[i - 1].el === current) i--;
      if (i > 0) {
        var previous = chunks[i - 1].el;
        i--;
        while (i > 0 && chunks[i - 1].el === previous) i--;
      }
    }
    speech.index = i;
    if (speech.playing) {
      speakCurrent();
    } else {
      setHighlight(chunks[i].el);
      updatePlayer();
    }
  }

  function initSpeech() {
    if (!speech.supported) return;
    loadSpeechPrefs();
    populateVoices();
    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', populateVoices);
    }

    el.player.addEventListener('click', function (e) {
      var button = e.target.closest('[data-player]');
      if (!button) return;
      var action = button.getAttribute('data-player');
      if (action === 'toggle') {
        if (speech.playing) pauseSpeech();
        else resumeSpeech();
      } else if (action === 'prev') {
        stepSpeech(-1);
      } else if (action === 'next') {
        stepSpeech(1);
      } else if (action === 'rate') {
        var i = SPEECH_RATES.indexOf(speech.rate);
        speech.rate = SPEECH_RATES[(i + 1) % SPEECH_RATES.length];
        saveSpeechPrefs();
        if (speech.playing) speakCurrent();
        else updatePlayer();
      } else if (action === 'settings') {
        setSettings(el.playerSettings.hidden);
      } else if (action === 'close') {
        stopSpeech();
      }
    });

    el.playerVoice.addEventListener('change', function () {
      speech.voiceURI = el.playerVoice.value;
      saveSpeechPrefs();
      if (speech.playing) speakCurrent();
    });
    el.playerAuto.addEventListener('change', function () {
      speech.autoNext = el.playerAuto.checked;
      saveSpeechPrefs();
    });

    el.doc.addEventListener('click', function (e) {
      if (e.target.closest('[data-listen]')) {
        if (speech.playing) pauseSpeech();
        else resumeSpeech();
        return;
      }
      // Con el reproductor abierto, tocar un bloque de texto lee desde ahí.
      if (el.player.hidden || e.target.closest('a, button, input, select, label, .diagram__canvas')) return;
      var selection = window.getSelection && window.getSelection();
      if (selection && String(selection).length) return;
      for (var i = 0; i < speech.chunks.length; i++) {
        if (speech.chunks[i].el.contains(e.target)) {
          speech.index = i;
          requestWakeLock();
          speakCurrent();
          return;
        }
      }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible' || !speech.playing) return;
      requestWakeLock();
      // Si el sistema cortó la voz en segundo plano, se retoma el fragmento actual.
      if (!window.speechSynthesis.speaking) speakCurrent();
    });
  }

  /* ---------- Arranque ---------- */

  function init() {
    loadDone();
    el.storageNote.hidden = state.storageOk;
    initSpeech();

    fetch('content/modules.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (modules) {
        state.modules = modules;
        registerAliases(modules);
        buildNav();
        if (!window.location.hash) {
          // Sin módulo en la URL se retoma el último que se abrió.
          var last = readStore(LAST_KEY);
          last = state.aliases[last] || last;
          var start = indexOfSlug(last) !== -1 ? last : modules[0].slug;
          history.replaceState(null, '', '#/' + start);
        }
        render(false);
        window.addEventListener('hashchange', function () { render(true); });
      })
      .catch(function () {
        showFetchError();
      });

    el.doneCurrent.addEventListener('change', function () {
      if (state.current) setDone(state.current, el.doneCurrent.checked);
    });

    el.menuBtn.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('nav-open'));
    });
    el.scrim.addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        setMenu(false);
        el.menuBtn.focus();
      }
    });

    mobileQuery.addEventListener('change', function () {
      if (!mobileQuery.matches) setMenu(false);
      syncSidebarInert();
    });
    syncSidebarInert();

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fitAllDiagrams, 150);
    });

    // Mermaid cambia de tema junto con el sistema operativo.
    darkQuery.addEventListener('change', function () {
      if (!state.current) return;
      var token = ++state.renderToken;
      el.doc.querySelectorAll('.diagram').forEach(function (fig) {
        fig.innerHTML = '<p class="diagram__pending">Dibujando diagrama…</p>';
      });
      renderDiagrams(el.doc, token);
    });
  }

  if (!window.marked) {
    document.getElementById('doc').innerHTML =
      '<div class="notice"><h1>Sin conexión a la CDN</h1><p>No se pudo cargar la librería ' +
      '<code>marked</code> desde jsDelivr. Revisa tu conexión a internet y recarga la página.</p></div>';
    return;
  }

  init();
})();
