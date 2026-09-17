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

/* ============================================================================
   IPREMB — Popup institucional da Prova de Vida (exclusivo da Home)
   Abre uma unica vez por sessao do navegador. O controle usa sessionStorage;
   se o armazenamento estiver indisponivel (modo restrito, cookies bloqueados),
   o site continua funcionando normalmente e o popup apenas deixa de lembrar
   que ja foi visto naquela sessao.

   Acessibilidade: role="dialog" + aria-modal ja estao no HTML; aqui cuidamos
   do foco inicial, do ciclo de Tab dentro do modal, do ESC e da devolucao do
   foco ao elemento anterior. Nada fora do modal e alterado de forma
   permanente: o bloqueio de rolagem restaura o valor original ao fechar.
   ========================================================================== */
(function() {
    var CHAVE = 'ipremb_prova_vida_popup_2026';
    var popup = document.getElementById('pvPopup');
    if (!popup) return;

    var dialog = popup.querySelector('.pv-popup-dialog');
    var btnFechar = document.getElementById('pvPopupFechar');
    var overlay = popup.querySelector('[data-pv-fechar]');
    var focoAnterior = null;
    var scrollAnterior = '';
    var aberto = false;

    /* sessionStorage pode lancar excecao antes mesmo de ser lido. */
    function jaVisto() {
      try { return window.sessionStorage.getItem(CHAVE) === '1'; }
      catch (e) { return false; }
    }
    function marcarVisto() {
      try { window.sessionStorage.setItem(CHAVE, '1'); }
      catch (e) { /* segue sem memoria de sessao */ }
    }

    function focaveis() {
      return Array.prototype.filter.call(
        dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
        function(el) { return !el.disabled && el.offsetParent !== null; }
      );
    }

    function aoTeclar(ev) {
      if (ev.key === 'Escape' || ev.key === 'Esc') { ev.preventDefault(); fechar(); return; }
      if (ev.key !== 'Tab') return;
      var itens = focaveis();
      if (!itens.length) { ev.preventDefault(); return; }
      var primeiro = itens[0], ultimo = itens[itens.length - 1];
      if (ev.shiftKey && document.activeElement === primeiro) { ev.preventDefault(); ultimo.focus(); }
      else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primeiro.focus(); }
      else if (!dialog.contains(document.activeElement)) { ev.preventDefault(); primeiro.focus(); }
    }

    function abrir() {
      if (aberto) return;
      aberto = true;
      focoAnterior = document.activeElement;
      scrollAnterior = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      popup.hidden = false;
      if (btnFechar) btnFechar.focus();
      document.addEventListener('keydown', aoTeclar, true);
    }

    function fechar() {
      if (!aberto) return;
      aberto = false;
      document.removeEventListener('keydown', aoTeclar, true);
      popup.hidden = true;
      /* Restaura exatamente o estado anterior: nada de classe presa. */
      if (scrollAnterior) { document.body.style.overflow = scrollAnterior; }
      else { document.body.style.removeProperty('overflow'); }
      marcarVisto();
      if (focoAnterior && typeof focoAnterior.focus === 'function' &&
          document.body.contains(focoAnterior)) {
        focoAnterior.focus();
      }
    }

    if (btnFechar) btnFechar.addEventListener('click', fechar);
    if (overlay) overlay.addEventListener('click', fechar);
    /* O link "Saiba mais" navega para outra pagina: encerra o estado antes. */
    var cta = popup.querySelector('.pv-popup-cta');
    if (cta) cta.addEventListener('click', function() { marcarVisto(); });

    if (!jaVisto()) { abrir(); }
  })();
