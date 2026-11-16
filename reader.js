/* 页内 Markdown 阅读器。
 * 渲染使用 marked 15（GFM）+ DOMPurify；代码高亮 highlight.js；流程图 mermaid。
 * 通过 http 打开时直接读取 md 文件；双击 file:// 打开时改读 md-bundle.js。
 */
(function () {
  var reader = document.getElementById('reader');
  var article = document.getElementById('readerArticle');
  var toc = document.getElementById('readerToc');
  var scrollEl = document.getElementById('readerScroll');
  var titleEl = document.getElementById('readerTitle');
  var pathEl = document.getElementById('readerPath');
  var rawEl = document.getElementById('readerRaw');
  var themeBtn = document.getElementById('themeBtn');
  var readerTheme = document.getElementById('readerTheme');
  if (!reader || !article) return;

  var libsReady = null;
  var mermaidReady = null;
  var scriptLoads = {};
  var markedReady = false;
  var openToken = 0;
  var drawGen = 0;
  var currentPath = '';
  var currentSrc = '';
  var tocObserver = null;

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }
  function loadScript(src) {
    if (scriptLoads[src]) return scriptLoads[src];
    scriptLoads[src] = new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      el.src = src;
      el.onload = function () { resolve(); };
      el.onerror = function () { reject(new Error(src)); };
      document.head.appendChild(el);
    });
    return scriptLoads[src];
  }
  function loadCss(href, id) {
    return new Promise(function (resolve) {
      if (document.getElementById(id)) { resolve(); return; }
      var link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      var done = false;
      function finish() { if (!done) { done = true; resolve(); } }
      link.onload = finish;
      link.onerror = finish;
      document.head.appendChild(link);
      setTimeout(finish, 4000);
    });
  }
  function syncHljsTheme() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    var light = document.getElementById('hljs-light');
    var darkCss = document.getElementById('hljs-dark');
    if (light) light.disabled = dark;
    if (darkCss) darkCss.disabled = !dark;
  }
  function loosenCjkEmphasis(src) {
    return src.split(/(```[\s\S]*?```)/g).map(function (part, i) {
      if (i % 2 === 1) return part;
      return part
        .replace(/([^\s*])\*\*(?=[“"「『])/g, '$1 **')
        .replace(/([”"」』])\*\*(?=[^\s*])/g, '$1** ');
    }).join('');
  }
  function setupMarked() {
    if (markedReady) return;
    markedReady = true;
    marked.use({
      gfm: true,
      renderer: {
        code: function (token) {
          var text = token && typeof token === 'object' ? (token.text || '') : String(token || '');
          var langRaw = token && typeof token === 'object' ? (token.lang || '') : '';
          var lang = String(langRaw).trim().toLowerCase();
          if (lang === 'mermaid') return '<div class="mermaid">' + escapeHtml(text) + '</div>';
          var pretty = String(langRaw).trim() || 'text';
          var codeHtml = escapeHtml(text);
          if (window.hljs && lang && hljs.getLanguage(lang)) {
            try {
              codeHtml = hljs.highlight(text, { language: lang, ignoreIllegals: true }).value;
            } catch (e) {
              codeHtml = escapeHtml(text);
            }
          }
          return '<pre class="md-code" data-lang="' + escapeAttr(pretty) + '"><code class="hljs">' + codeHtml + '</code></pre>';
        }
      }
    });
  }
  function ensureLibs() {
    if (libsReady) return libsReady;
    libsReady = Promise.all([
      loadScript('vendor/marked.umd.min.js'),
      loadScript('vendor/purify.min.js'),
      loadScript('vendor/highlight.min.js').catch(function () {}),
      loadCss('vendor/github.min.css', 'hljs-light'),
      loadCss('vendor/github-dark.min.css', 'hljs-dark')
    ]).then(function () {
      if (!window.marked || !window.marked.parse || !window.DOMPurify) throw new Error('lib');
      setupMarked();
      syncHljsTheme();
    });
    libsReady.catch(function () { libsReady = null; });
    return libsReady;
  }
  function ensureMermaid() {
    if (window.mermaid) return Promise.resolve();
    if (mermaidReady) return mermaidReady;
    mermaidReady = loadScript('vendor/mermaid.min.js').catch(function () {});
    mermaidReady.catch(function () { mermaidReady = null; });
    return mermaidReady;
  }
  function docPathFromHash() {
    var h = location.hash || '';
    if (h.indexOf('#doc=') !== 0) return '';
    var cur = h.slice(5);
    var i, next;
    for (i = 0; i < 2; i++) {
      try { next = decodeURIComponent(cur); } catch (e) { break; }
      if (next === cur) break;
      cur = next;
    }
    return cur;
  }
  function resolvePath(fromFile, href) {
    var hash = '';
    var cut = href.indexOf('#');
    if (cut >= 0) {
      hash = href.slice(cut + 1);
      href = href.slice(0, cut);
    }
    var q = href.indexOf('?');
    if (q >= 0) href = href.slice(0, q);
    if (!href) return { path: '', hash: hash };
    try { href = decodeURIComponent(href); } catch (e) {}
    var parts = fromFile.split('/').slice(0, -1);
    href.split('/').forEach(function (seg) {
      if (!seg || seg === '.') return;
      if (seg === '..') parts.pop();
      else parts.push(seg);
    });
    return { path: parts.join('/'), hash: hash };
  }
  function loadBundled(path) {
    return loadScript('md-bundle.js').then(function () {
      var text = window.GEOPRO_MD && window.GEOPRO_MD[path];
      if (typeof text !== 'string') throw new Error('bundle');
      return text;
    });
  }
  function loadMarkdown(path) {
    var url = path.split('/').map(function (seg) { return encodeURIComponent(seg); }).join('/');
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      return fetch(url).then(function (res) {
        if (!res.ok) throw new Error('http');
        return res.text();
      }).catch(function () { return loadBundled(path); });
    }
    return loadBundled(path);
  }
  function copyText(text, btn) {
    function done() {
      btn.textContent = '已复制';
      setTimeout(function () { btn.textContent = '复制'; }, 1200);
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); }
      catch (e) { btn.textContent = '复制失败'; }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  }
  function decorate(path) {
    article.querySelectorAll('table').forEach(function (table) {
      if (table.parentElement && table.parentElement.classList.contains('md-table')) return;
      var wrap = document.createElement('div');
      wrap.className = 'md-table';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
    article.querySelectorAll('pre.md-code').forEach(function (pre) {
      if (pre.parentElement && pre.parentElement.classList.contains('md-codebox')) return;
      var wrap = document.createElement('div');
      wrap.className = 'md-codebox';
      var bar = document.createElement('div');
      bar.className = 'md-code-bar';
      var name = document.createElement('span');
      name.textContent = pre.getAttribute('data-lang') || 'text';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'md-copy';
      btn.textContent = '复制';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        copyText(code ? code.textContent : pre.textContent, btn);
      });
      bar.appendChild(name);
      bar.appendChild(btn);
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(bar);
      wrap.appendChild(pre);
    });
    article.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (/^(https?:|mailto:)/i.test(href)) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        return;
      }
      var resolved = resolvePath(path, href);
      if (!resolved.path) return;
      if (/\.md$/i.test(resolved.path)) {
        a.setAttribute('href', '#doc=' + encodeURIComponent(resolved.path));
        return;
      }
      if (/(^|\/)geo-platform-report\.html$/i.test(resolved.path)) {
        a.setAttribute('href', '#' + (resolved.hash || 'overview'));
      }
    });
  }
  function buildToc() {
    if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }
    toc.innerHTML = '';
    article.querySelectorAll('h1, h2, h3, h4').forEach(function (h, i) { h.id = 'mdh-' + i; });
    var heads = article.querySelectorAll('h2, h3');
    if (!heads.length) {
      toc.innerHTML = '<p class="reader-toc-empty">本文没有小节</p>';
      return;
    }
    var links = [];
    heads.forEach(function (h) {
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.className = h.tagName === 'H3' ? 'lv3' : 'lv2';
      a.textContent = h.textContent.replace(/\s+/g, ' ').trim();
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var top = h.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop - 8;
        scrollEl.scrollTo({ top: top, behavior: 'smooth' });
        reader.classList.remove('toc-open');
      });
      toc.appendChild(a);
      links.push(a);
    });
    tocObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + en.target.id;
          a.classList.toggle('active', on);
          if (on) {
            var box = a.getBoundingClientRect();
            var pane = toc.getBoundingClientRect();
            if (box.top < pane.top + 8 || box.bottom > pane.bottom - 8) a.scrollIntoView({ block: 'nearest' });
          }
        });
      });
    }, { root: scrollEl, rootMargin: '0px 0px -72% 0px', threshold: 0 });
    heads.forEach(function (h) { tocObserver.observe(h); });
  }
  function renderDiagrams(gen) {
    var nodes = article.querySelectorAll('.mermaid');
    if (!nodes.length) return Promise.resolve();
    return ensureMermaid().then(function () {
      if (gen !== drawGen || !window.mermaid) return;
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'antiscript',
        theme: dark ? 'dark' : 'neutral',
        fontFamily: '"PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif',
        flowchart: { useMaxWidth: false, htmlLabels: true, wrappingWidth: 240 },
        sequence: { useMaxWidth: false },
        gantt: { useMaxWidth: false }
      });
      return mermaid.run({
        nodes: Array.prototype.slice.call(nodes),
        suppressErrors: true
      });
    }).then(function () {
      if (gen !== drawGen) return;
      article.querySelectorAll('.mermaid').forEach(function (node) { node.classList.add('is-drawn'); });
    }).catch(function () {});
  }
  function renderArticle(path, src, keepScroll) {
    var gen = ++drawGen;
    var y = keepScroll ? scrollEl.scrollTop : 0;
    var html;
    try {
      html = DOMPurify.sanitize(marked.parse(loosenCjkEmphasis(src)), {
        ADD_ATTR: ['align', 'checked', 'disabled'],
        ADD_TAGS: ['input']
      });
    } catch (e) {
      article.innerHTML = '<p class="md-status">这份文档渲染失败。</p>';
      return;
    }
    article.innerHTML = html;
    decorate(path);
    var h1 = article.querySelector('h1');
    titleEl.textContent = h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : path.split('/').pop();
    pathEl.textContent = path;
    rawEl.href = path.split('/').map(function (seg) { return encodeURIComponent(seg); }).join('/');
    buildToc();
    renderDiagrams(gen).then(function () {
      if (gen !== drawGen) return;
      scrollEl.scrollTop = keepScroll ? y : 0;
    });
    if (!keepScroll) scrollEl.scrollTop = 0;
  }
  function fail(msg) {
    titleEl.textContent = '无法打开文档';
    toc.innerHTML = '';
    article.innerHTML = '<p class="md-status">' + msg + '</p>';
  }
  function openReader(path) {
    var token = ++openToken;
    reader.classList.add('open');
    reader.setAttribute('aria-hidden', 'false');
    document.body.classList.add('reading');
    pathEl.textContent = path;
    titleEl.textContent = '正在打开…';
    if (readerTheme && themeBtn) readerTheme.textContent = themeBtn.textContent;
    article.innerHTML = '<p class="md-status">正在载入文档…</p>';
    toc.innerHTML = '';
    rawEl.href = path.split('/').map(function (seg) { return encodeURIComponent(seg); }).join('/');
    ensureLibs().then(function () {
      return loadMarkdown(path);
    }).then(function (src) {
      if (token !== openToken || docPathFromHash() !== path) return;
      currentPath = path;
      currentSrc = src;
      renderArticle(path, src, false);
    }).catch(function () {
      if (token !== openToken) return;
      currentSrc = '';
      fail('没有读到这份文档。直接双击打开时使用 md-bundle.js；如果刚改过 Markdown，请运行 <code>node scripts/build-md-bundle.js</code>，或通过本地静态服务打开本页。');
    });
  }
  function closeReader() {
    openToken++;
    reader.classList.remove('open', 'toc-open');
    reader.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('reading');
  }
  function syncFromHash() {
    var path = docPathFromHash();
    if (!path) { closeReader(); return; }
    openReader(path);
  }

  document.getElementById('readerClose').addEventListener('click', function () {
    if ((location.hash || '').indexOf('#doc=') === 0) location.hash = 'docs';
    else closeReader();
  });
  document.getElementById('readerTocBtn').addEventListener('click', function () {
    reader.classList.toggle('toc-open');
  });
  scrollEl.addEventListener('click', function () { reader.classList.remove('toc-open'); });
  if (readerTheme && themeBtn) {
    readerTheme.addEventListener('click', function () {
      themeBtn.click();
      readerTheme.textContent = themeBtn.textContent;
      syncHljsTheme();
      if (currentSrc && document.body.classList.contains('reading')) renderArticle(currentPath, currentSrc, true);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('reading')) location.hash = 'docs';
  });
  window.addEventListener('hashchange', syncFromHash);
  syncFromHash();
})();
