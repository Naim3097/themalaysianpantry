/* The Malaysian Pantry — search, navigation, header state.
   No dependencies. The search index is fetched once, on first open. */
(function () {
  'use strict';

  /* ---------- header shadow on scroll ---------- */
  var masthead = document.querySelector('.masthead');
  if (masthead) {
    var onScroll = function () {
      masthead.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- mobile drawer ---------- */
  var drawer = document.getElementById('drawer');
  var openDrawer = document.querySelector('[data-open-drawer]');
  var closeDrawer = document.querySelectorAll('[data-close-drawer]');

  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
    if (open) {
      var first = drawer.querySelector('a, button');
      if (first) first.focus();
    } else if (openDrawer) {
      openDrawer.focus();
    }
  }
  if (openDrawer) openDrawer.addEventListener('click', function () { setDrawer(true); });
  Array.prototype.forEach.call(closeDrawer, function (el) {
    el.addEventListener('click', function () { setDrawer(false); });
  });

  /* ---------- search ---------- */
  var search = document.getElementById('search');
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var defaults = document.getElementById('search-default');
  var triggers = document.querySelectorAll('[data-open-search]');
  var closers = document.querySelectorAll('[data-close-search]');
  var index = null;
  var activeSection = '';

  function loadIndex() {
    if (index) return Promise.resolve(index);
    return fetch('/search-index.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { index = data; return index; })
      .catch(function () { index = []; return index; });
  }

  function setSearch(open) {
    if (!search) return;
    search.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
    if (open) {
      loadIndex();
      setTimeout(function () { if (input) input.focus(); }, 40);
    } else if (input) {
      input.value = '';
      render('');
    }
  }

  Array.prototype.forEach.call(triggers, function (el) {
    el.addEventListener('click', function () { setDrawer(false); setSearch(true); });
  });
  Array.prototype.forEach.call(closers, function (el) {
    el.addEventListener('click', function (e) {
      if (e.target === el) setSearch(false);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setSearch(false); setDrawer(false); }
    // "/" focuses search, the way most content sites behave
    if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      setSearch(true);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearch(true); }
  });

  function score(item, q) {
    var hay = (item.t + ' ' + item.s + ' ' + item.d + ' ' + item.k).toLowerCase();
    var terms = q.split(/\s+/).filter(Boolean);
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      if (hay.indexOf(terms[i]) === -1) return 0;
      total += item.t.toLowerCase().indexOf(terms[i]) > -1 ? 3 : 1;
    }
    return total;
  }

  function render(q) {
    if (!results || !defaults) return;
    var query = (q || '').trim().toLowerCase();

    if (!query && !activeSection) {
      defaults.hidden = false;
      results.innerHTML = '';
      return;
    }
    defaults.hidden = true;

    loadIndex().then(function (data) {
      var hits = data.filter(function (item) {
        if (activeSection && item.s !== activeSection) return false;
        return query ? score(item, query) > 0 : true;
      });
      if (query) {
        hits.sort(function (a, b) { return score(b, query) - score(a, query); });
      }

      if (!hits.length) {
        results.innerHTML = '<p class="search-empty">Nothing matches that yet. The archive is still small &mdash; try a section above, or browse everything.</p>';
        return;
      }
      results.innerHTML = hits.map(function (h) {
        return '<a class="result" href="' + h.u + '">' +
          '<span class="meta">' + h.s + '</span>' +
          '<div><h4>' + h.t + '</h4><p>' + h.d + '</p></div>' +
          '<span class="meta">' + h.m + ' min</span></a>';
      }).join('');
    });
  }

  if (input) {
    input.addEventListener('input', function () { render(input.value); });
  }

  /* section filter chips inside the overlay */
  Array.prototype.forEach.call(document.querySelectorAll('[data-filter]'), function (chip) {
    chip.addEventListener('click', function () {
      var val = chip.getAttribute('data-filter');
      activeSection = activeSection === val ? '' : val;
      Array.prototype.forEach.call(document.querySelectorAll('[data-filter]'), function (c) {
        c.classList.toggle('is-active', c.getAttribute('data-filter') === activeSection);
      });
      render(input ? input.value : '');
    });
  });

  /* suggested search terms prefill the box */
  Array.prototype.forEach.call(document.querySelectorAll('[data-term]'), function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      if (!input) return;
      input.value = el.getAttribute('data-term');
      input.focus();
      render(input.value);
    });
  });

  /* ---------- footer year ---------- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
