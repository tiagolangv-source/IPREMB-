/* ============================================================================
   IPREMB — Carrossel da pagina inicial
   Fase 1.15-7. Extraido VERBATIM do <script> que vivia dentro do index.html.
   Nenhuma linha foi reescrita: apenas mudou de lugar.

   Este modulo e EXCLUSIVO da home e por isso NAO entrou no ipremb-layout.js,
   que continua responsavel apenas por layout global e navegacao.
   ========================================================================== */
(function() {
    var TOTAL = 4, INTERVAL = 7000, current = 0, timer = null, progress = 0, progTimer = null;
    var track = document.getElementById('mhTrack');
    var dotsEl = document.getElementById('mhDots');
    var progressEl = document.getElementById('mhProgress');
    if (!track) return;
    var dots = dotsEl ? Array.from(dotsEl.querySelectorAll('.mh-dot')) : [];
    function render() {
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function(d, i) {
        var ativo = i === current;
        d.classList.toggle('active', ativo);
        if (ativo) { d.setAttribute('aria-current', 'true'); } else { d.removeAttribute('aria-current'); }
      });
    }
    function startProgress() {
      clearInterval(progTimer); progress = 0;
      if (progressEl) progressEl.style.width = '0%';
      progTimer = setInterval(function() {
        progress += 100 / (INTERVAL / 100);
        if (progressEl) progressEl.style.width = Math.min(progress, 100) + '%';
      }, 100);
    }
    function startAuto() {
      clearInterval(timer); startProgress();
      timer = setInterval(function() { current = (current + 1) % TOTAL; render(); startProgress(); }, INTERVAL);
    }
    window.mhGoTo = function(n) { current = n; render(); startAuto(); };
    window.mhNext = function() { current = (current + 1) % TOTAL; render(); startAuto(); };
    window.mhPrev = function() { current = (current - 1 + TOTAL) % TOTAL; render(); startAuto(); };
    var hero = document.getElementById('mainHero');
    if (hero) {
      hero.addEventListener('mouseenter', function() { clearInterval(timer); clearInterval(progTimer); });
      hero.addEventListener('mouseleave', startAuto);
      var touchX = 0;
      hero.addEventListener('touchstart', function(e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
      hero.addEventListener('touchend', function(e) {
        var diff = touchX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) { diff > 0 ? window.mhNext() : window.mhPrev(); }
      }, { passive: true });
    }
    render(); startAuto();
  })();
