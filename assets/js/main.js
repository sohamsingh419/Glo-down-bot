/* ============================================================
   main.js — shared interactions for the documentation site
   ============================================================ */
(function () {
  'use strict';

  /* ---- Mobile nav toggle ---- */
  var burger = document.querySelector('.burger');
  var links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('open');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }

  /* ---- Copy buttons for code blocks ---- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = btn.closest('.codebox');
      var pre = box ? box.querySelector('pre') : null;
      if (!pre) return;
      var text = pre.innerText;
      var done = function () {
        var old = btn.innerText;
        btn.innerText = 'Copied ✓';
        btn.classList.add('copied');
        setTimeout(function () { btn.innerText = old; btn.classList.remove('copied'); }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text); done(); });
      } else {
        legacyCopy(text); done();
      }
    });
  });

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Card pointer glow ---- */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    });
  });

  /* ---- TOC active state (docs pages) ---- */
  var tocLinks = document.querySelectorAll('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) {
      var id = a.getAttribute('href').replace('#', '');
      var sec = document.getElementById(id);
      if (sec) map[id] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove('on'); });
          var a = map[e.target.id];
          if (a) a.classList.add('on');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  /* ---- Command filter (commands.html) ---- */
  var cmdInput = document.getElementById('cmdSearch');
  var chips = document.querySelectorAll('[data-filter]');
  var currentChip = 'all';

  function applyCmdFilter() {
    var q = cmdInput ? cmdInput.value.trim().toLowerCase() : '';
    var visible = 0;
    document.querySelectorAll('.cmd-card').forEach(function (card) {
      var type = card.getAttribute('data-type') || 'user';
      var text = card.innerText.toLowerCase();
      var okChip = currentChip === 'all' || type === currentChip;
      var okText = !q || text.indexOf(q) !== -1;
      var show = okChip && okText;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    document.querySelectorAll('.cmd-group-ttl').forEach(function (ttl) {
      var next = ttl.nextElementSibling;
      var any = false;
      while (next && !next.classList.contains('cmd-group-ttl')) {
        if (next.classList.contains('cmd-card') && next.style.display !== 'none') any = true;
        next = next.nextElementSibling;
      }
      ttl.style.display = any ? '' : 'none';
    });
    var nr = document.getElementById('noResult');
    if (nr) nr.style.display = visible ? 'none' : 'block';
  }

  if (cmdInput) cmdInput.addEventListener('input', applyCmdFilter);
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('on'); });
      chip.classList.add('on');
      currentChip = chip.getAttribute('data-filter');
      applyCmdFilter();
    });
  });

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.acc-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.acc-item');
      var ans = item.querySelector('.acc-a');
      var open = item.classList.toggle('open');
      ans.style.maxHeight = open ? ans.scrollHeight + 'px' : '0';
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---- Footer year ---- */
  var y = document.getElementById('yr');
  if (y) y.innerText = new Date().getFullYear();
})();
