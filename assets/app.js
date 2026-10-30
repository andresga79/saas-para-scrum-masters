/* SaaS para Scrum Masters — carga de módulos, navegación y progreso. */
(function () {
  'use strict';

  var STORAGE_KEY = 'saas-sm:completados';
  var SITE_TITLE = 'SaaS para Scrum Masters';
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  var mobileQuery = window.matchMedia('(max-width: 899px)');

  var state = {
    modules: [],
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
    storageNote: document.getElementById('storage-note')
  };

  /* ---------- Almacenamiento (tolerante a fallos) ---------- */

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

    // Tablas con scroll horizontal propio.
    root.querySelectorAll('table').forEach(function (table) {
      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('tabindex', '0');
      var caption = table.querySelector('th');
      wrap.setAttribute('aria-label', 'Tabla' + (caption ? ': ' + caption.textContent.trim() : ''));
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
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
        '<input class="check" type="checkbox" data-slug="' + m.slug + '" ' +
        'aria-label="Completado: ' + escapeHtml(m.title) + '">' +
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

  function render(focusHeading) {
    var slug = currentSlug();
    var index = indexOfSlug(slug);
    var token = ++state.renderToken;

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
        document.title = (h1 ? h1.textContent : mod.title) + ' · ' + SITE_TITLE;
        setPager(el.prev, state.modules[index - 1], 'Anterior');
        setPager(el.next, state.modules[index + 1], 'Siguiente');
        el.footer.hidden = false;
        window.scrollTo(0, 0);
        if (focusHeading && h1) {
          h1.setAttribute('tabindex', '-1');
          h1.focus({ preventScroll: true });
        }
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

  /* ---------- Arranque ---------- */

  function init() {
    loadDone();
    el.storageNote.hidden = state.storageOk;

    fetch('content/modules.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (modules) {
        state.modules = modules;
        buildNav();
        if (!window.location.hash) {
          history.replaceState(null, '', '#/' + modules[0].slug);
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
