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

/* ============================================================================
   IPREMB — Home mobile: seletor vertical de perfil (Bloco 2)
   Ativa o comportamento expansivel SOMENTE em max-width:580px, o mesmo
   breakpoint mobile ja usado pela Home. Acima disso o modulo remove a classe
   .js-accordion e todo estado, devolvendo os tres cards completos — o desktop
   permanece exatamente como e hoje.
   O elemento acionador e um <button> nativo: Enter e Espaco ja funcionam sem
   codigo adicional e o foco nunca e movido pelo script.
   ========================================================================== */
(function() {
    var grid = document.querySelector('.profile-access .profile-grid');
    if (!grid) return;
    var toggles = Array.prototype.slice.call(grid.querySelectorAll('.profile-toggle'));
    if (!toggles.length) return;
    var mq = window.matchMedia('(max-width: 580px)');

    function cardDe(btn) {
      var el = btn.parentNode;
      while (el && el.classList && !el.classList.contains('profile-card')) { el = el.parentNode; }
      return el;
    }
    function definir(btn, aberto) {
      var card = cardDe(btn);
      btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      if (card) card.classList.toggle('is-collapsed', !aberto);
    }
    function abrirSomente(btn) {
      toggles.forEach(function(t) { definir(t, t === btn); });
    }
    function ativar() {
      grid.classList.add('js-accordion');
      abrirSomente(toggles[0]);
    }
    function desativar() {
      grid.classList.remove('js-accordion');
      toggles.forEach(function(t) {
        t.setAttribute('aria-expanded', 'true');
        var card = cardDe(t);
        if (card) card.classList.remove('is-collapsed');
      });
    }

    toggles.forEach(function(t) {
      t.addEventListener('click', function() {
        if (!mq.matches) return;
        var antes = t.getBoundingClientRect().top;
        if (t.getAttribute('aria-expanded') === 'true') { definir(t, false); }
        else { abrirSomente(t); }
        /* Mantem o botao acionado parado na tela: sem salto de pagina. */
        var depois = t.getBoundingClientRect().top;
        if (depois !== antes) window.scrollBy(0, depois - antes);
      });
    });

    if (mq.matches) { ativar(); } else { desativar(); }
    if (mq.addEventListener) {
      mq.addEventListener('change', function(e) { e.matches ? ativar() : desativar(); });
    } else if (mq.addListener) {
      mq.addListener(function(e) { e.matches ? ativar() : desativar(); });
    }
  })();

/* ============================================================================
   IPREMB — Home mobile: miniatura condicional em Noticias (Bloco 3)
   Marca com .has-thumb apenas os cards que realmente possuem imagem. Enquanto
   nao houver <img> publicada, nenhum card recebe a classe e o layout mobile
   nao reserva area grafica. A classe nao tem efeito no desktop: as regras que
   a consomem vivem dentro de @media (max-width:580px).
   ========================================================================== */
(function() {
    var cards = document.querySelectorAll('.news .news-card');
    if (!cards.length) return;
    Array.prototype.forEach.call(cards, function(card) {
      var img = card.querySelector('.news-img img');
      if (img) card.classList.add('has-thumb');
    });
  })();
