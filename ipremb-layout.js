/* ============================================================================
   IPREMB — Componentes globais de layout
   Fase 1.15-2 (prova controlada na familia piloto).

   CAMADA DE APRESENTACAO GLOBAL. Nao contem dados institucionais: toda a
   arvore de navegacao, contatos e textos vem de ipremb-navegacao.js.

   Monta e da comportamento a:
     banner informativo, top bar, header, menu desktop (mega-menu),
     menu mobile (acordeoes), rodape, modal de busca e botao do WhatsApp.

   COMO USAR numa pagina:
     1. <link rel="stylesheet" href="ipremb-global.css">
     2. marcadores no corpo:  <div data-ipremb="header"></div>  etc.
     3. <script src="ipremb-navegacao.js"></script>
        <script src="ipremb-layout.js"></script>
     4. opcional: <body data-secao-ativa="Investimentos"> destaca o item do menu.

   Os marcadores sao SUBSTITUIDOS (outerHTML), nunca preenchidos. Isso mantem a
   arvore do DOM identica a que existia com o HTML embutido — importante porque
   .header usa position:sticky e um <div> intermediario quebraria o efeito.

   O markup gerado reproduz exatamente as mesmas classes do HTML anterior.
   Nenhuma regra de CSS precisou ser alterada.
   ========================================================================== */
(function (raiz) {
  'use strict';

  var API = {};

  /* --------------------------------------------------------------------------
     1. UTILITARIOS
     ------------------------------------------------------------------------ */

  function esc(v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* href de dados ja pode conter & de query string; escapa so o necessario */
  function escAttr(v) {
    if (v === null || v === undefined) return '';
    return String(v).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/"/g, '&quot;');
  }

  function alvo(item) {
    return item && item.externo ? ' target="_blank" rel="noopener"' : '';
  }

  /* <a> simples a partir de um item de navegacao */
  function link(item, classe) {
    var cls = classe ? ' class="' + classe + '"'
      : (item.classe ? ' class="' + escAttr(item.classe) + '"' : '');
    var est = item.estilo ? ' style="' + escAttr(item.estilo) + '"' : '';
    if (!item.href) return '<a' + cls + est + '>' + esc(item.rotulo) + '</a>';
    return '<a href="' + escAttr(item.href) + '"' + cls + alvo(item) + est + '>' + esc(item.rotulo) + '</a>';
  }

  var SVG = {
    chevron: '<svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    chevron14: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    setaSub: '<svg class="nav-sub-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>',
    setaSubMobile: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    info: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;opacity:0.7"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    fechar14: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    fechar18: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    fecharBusca: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    telefone: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6.72 6.72l1.03-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    email: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    contraste: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" stroke="none"/></svg>',
    lupa16: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
    lupaBusca: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    relogio: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:4px;opacity:0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    whatsapp: '<svg class="wa-float-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>'
  };

  /* fallback do logo, com aspas corretamente escapadas */
  function onerroLogo(classe) {
    return 'this.parentElement.innerHTML=&#39;&lt;div class=&quot;' + classe + '&quot;&gt;IP&lt;/div&gt;&#39;';
  }

  /* --------------------------------------------------------------------------
     2. TEMPLATES  (puros: dados -> string)
     ------------------------------------------------------------------------ */

  function tplBanner(n) {
    var b = n.banner;
    if (!b) return '';
    return '<div class="alert-banner" id="' + esc(b.id || 'alertBanner') + '">' +
      '<div class="container">' + SVG.info +
      '<strong>' + esc(b.titulo) + '</strong> ' + esc(b.texto) + ' ' +
      '<a href="' + escAttr(b.link.href) + '" style="color:#1D4ED8;font-weight:600;">' + esc(b.link.rotulo) + '</a>' +
      '<button class="alert-close" data-ipremb-acao="fechar-banner" aria-label="Fechar">' + SVG.fechar14 + '</button>' +
      '</div></div>';
  }

  function tplTopBar(n) {
    var t = n.topo;
    var contatos = t.contatos.map(function (c) {
      var icone = c.tipo === 'email' ? SVG.email : SVG.telefone;
      return '<div class="top-bar-divider"></div>' +
        '<a href="' + escAttr(c.href) + '">' + icone + ' ' + esc(c.rotulo) + '</a>';
    }).join('');

    return '<div class="top-bar"><div class="container">' +
      '<div class="top-bar-left">' +
        '<div class="horario"><span class="horario-dot"></span><span>' + esc(t.horario) + '</span></div>' +
        contatos +
      '</div>' +
      '<div class="top-bar-right">' +
        '<div class="accessibility-controls"><span>Acessibilidade</span>' +
          '<button data-ipremb-acao="contraste" title="Alto contraste">' + SVG.contraste + '</button>' +
        '</div>' +
        '<div class="top-bar-divider"></div>' +
        t.links.map(function (l) { return link(l); }).join('') +
      '</div>' +
      '</div></div>';
  }

  /* ---- menu desktop, derivado da MESMA arvore do mobile ---- */

  function tplDropdownSimples(secao) {
    return '<div class="nav-dropdown">' + secao.itens.map(function (it) {
      if (it.subitens) {
        return '<div class="nav-sub">' +
          '<a class="nav-sub-trigger" tabindex="0" aria-haspopup="true">' + esc(it.rotulo) + SVG.setaSub + '</a>' +
          '<div class="nav-sub-menu">' + it.subitens.map(function (s) { return link(s); }).join('') + '</div>' +
          '</div>';
      }
      return link(it);
    }).join('') + '</div>';
  }

  function tplMega(secao) {
    var corte = secao.divisao > 0 ? secao.divisao : Math.ceil(secao.itens.length / 2);
    var colA = secao.itens.slice(0, corte);
    var colB = secao.itens.slice(corte);
    var coluna = function (itens) {
      return '<div class="nav-mega-col">' + itens.map(function (i) { return link(i); }).join('') + '</div>';
    };
    return '<div class="nav-dropdown nav-mega"><div class="nav-mega-grid cols-2">' +
      coluna(colA) + coluna(colB) + '</div></div>';
  }

  function tplMenuDesktop(n, secaoAtiva) {
    return '<nav class="main-nav" id="mainNav">' + n.menu.map(function (secao) {
      var ativo = secaoAtiva && secao.rotulo === secaoAtiva ? ' active' : '';
      if (secao.tipo === 'simples' || !secao.itens || !secao.itens.length) {
        return '<div class="nav-item"><a href="' + escAttr(secao.href) + '" class="nav-link' + ativo + '">' +
          esc(secao.rotulo) + '</a></div>';
      }
      var painel = secao.tipo === 'mega' ? tplMega(secao) : tplDropdownSimples(secao);
      return '<div class="nav-item">' +
        '<a href="' + escAttr(secao.href) + '" class="nav-link' + ativo + '">' + esc(secao.rotulo) + SVG.chevron + '</a>' +
        painel + '</div>';
    }).join('') + '</nav>';
  }

  function tplHeader(n, secaoAtiva) {
    var m = n.marca;
    return '<header class="header"><div class="container"><div class="header-inner">' +
      '<a href="' + escAttr(m.href) + '" class="logo-area">' +
        '<div class="logo-icon-img" style="width:160px;height:52px;">' +
          '<img src="' + escAttr(m.logo) + '" alt="' + esc(m.alt) + '" class="logo-img" ' +
          'style="width:160px;height:52px;object-fit:contain;object-position:left center;" ' +
          'onerror="' + onerroLogo('logo-icon-fallback') + '">' +
        '</div>' +
      '</a>' +
      tplMenuDesktop(n, secaoAtiva) +
      '<div class="header-actions">' +
        '<button class="search-btn" title="Buscar" data-ipremb-acao="abrir-busca">' + SVG.lupa16 + '</button>' +
        '<a href="' + escAttr(n.portalSegurado.href) + '" target="_blank" rel="noopener" class="btn btn-primary btn-sm">' +
          esc(n.portalSegurado.rotulo) + '</a>' +
        '<button class="hamburger" data-ipremb-acao="menu-mobile" aria-label="Menu" aria-expanded="false" aria-controls="mobileMenu">' +
          '<span></span><span></span><span></span></button>' +
      '</div>' +
      '</div></div></header>';
  }

  /* ---- menu mobile, derivado da MESMA arvore do desktop ---- */

  function tplMenuMobile(n) {
    var m = n.marca;

    var secoes = n.menu.map(function (secao) {
      if (secao.tipo === 'simples' || !secao.itens || !secao.itens.length) {
        return '<a href="' + escAttr(secao.href) + '" class="mobile-nav-simple-link">' + esc(secao.rotulo) + '</a>';
      }
      var corpo = secao.itens.map(function (it) {
        if (it.subitens) {
          return '<div class="mobile-subaccordion">' +
            '<button class="mobile-subaccordion-toggle" aria-expanded="false" data-ipremb-acao="subacordeao">' +
              esc(it.rotulo) + SVG.setaSubMobile + '</button>' +
            '<div class="mobile-subaccordion-body">' +
              it.subitens.map(function (s) { return link(s); }).join('') + '</div>' +
            '</div>';
        }
        return link(it);
      }).join('');

      return '<div>' +
        '<button class="mobile-accordion-toggle" aria-expanded="false" data-ipremb-acao="acordeao">' +
          esc(secao.rotulo) + SVG.chevron14 + '</button>' +
        '<div class="mobile-accordion-body">' + corpo + '</div>' +
        '</div>';
    }).join('');

    var atalhos = n.atalhosMobile.map(function (a) { return link(a, 'mobile-quick-btn'); }).join('');

    return '<div class="mobile-menu" id="mobileMenu">' +
      '<div class="mobile-menu-header">' +
        '<div class="logo-area">' +
          '<div class="logo-icon-img logo-icon-mobile">' +
            '<img src="' + escAttr(m.logo) + '" alt="' + esc(m.alt) + '" class="logo-img logo-img-white" ' +
            'onerror="' + onerroLogo('logo-icon-fallback logo-icon-fallback-mobile') + '">' +
          '</div>' +
          '<div class="logo-text">' +
            '<div class="logo-name" style="color:white;">' + esc(m.nome) + '</div>' +
            '<div class="logo-tagline" style="color:rgba(255,255,255,0.5);">' + esc(m.tagline) + '</div>' +
          '</div>' +
        '</div>' +
        '<button class="mobile-close" data-ipremb-acao="menu-mobile" aria-label="Fechar menu">' + SVG.fechar18 + '</button>' +
      '</div>' +
      '<nav class="mobile-nav-links" style="padding:0;">' + secoes + '</nav>' +
      '<div class="mobile-quick-btns">' + atalhos + '</div>' +
      '</div>';
  }

  function tplRodape(n) {
    var r = n.rodape;

    /* Uma coluna pode fechar com o horario de atendimento (hoje so a coluna
       "Contato" usa). Substituiu o antigo 'blocoContato', que aninhava um
       segundo titulo dentro da coluna "Atendimento" — coluna que deixou de
       existir. Nenhum outro dado do projeto usava aquela chave. */
    var colunas = r.colunas.map(function (col) {
      var bloco = col.horario
        ? '<div class="footer-horario">' + SVG.relogio + ' ' + esc(col.horario) + '</div>'
        : '';
      return '<div class="footer-col">' +
        '<div class="footer-col-title">' + esc(col.titulo) + '</div>' +
        '<div class="footer-links">' + col.links.map(function (l) { return link(l); }).join('') + '</div>' +
        bloco + '</div>';
    }).join('');

    var social = r.social.map(function (s) {
      return '<a href="' + escAttr(s.href) + '" target="_blank" rel="noopener" ' +
        'title="' + esc(s.titulo) + '" aria-label="' + esc(s.titulo) + '">' +
        (SVG[s.rede] || '') + '</a>';
    }).join('');

    return '<footer><div class="container">' +
      '<div class="footer-top">' +
        '<div class="footer-brand">' +
          '<div class="footer-logo">' +
            /* A logo pequena (.footer-logo-img) saiu desta coluna: apertava o
               canto esquerdo e roubava largura do subtitulo. As regras de
               .footer-logo-img / -img-tag / -icon-fallback continuam em
               ipremb-global.css, inertes, caso a marca precise voltar. */
            '<div><div class="footer-logo-name">' + esc(r.nome) + '</div>' +
            '<div class="footer-logo-tag">' + esc(r.tagline) + '</div></div>' +
          '</div>' +
          '<p class="footer-desc">' + esc(r.descricao) + '</p>' +
          /* Instagram fecha a coluna, abaixo da descricao e alinhado a
             esquerda. Cabe na folga que ja existia entre o fim do texto e a
             divisoria — a altura do rodape nao muda. */
          '<div class="footer-social">' + social + '</div>' +
        '</div>' +
        colunas +
      '</div>' +
      '<div class="footer-bottom">' +
        '<div class="footer-bottom-text">' + esc(r.creditos) + '</div>' +
        '<div class="footer-bottom-links">' + r.linksFinais.map(function (l) { return link(l); }).join('') + '</div>' +
      '</div>' +
      '</div></footer>';
  }

  function tplBusca(n) {
    var b = n.busca;
    return '<div class="search-modal-overlay" id="searchModal">' +
      '<div class="search-modal" role="dialog" aria-modal="true" aria-labelledby="searchModalTitle">' +
        '<div class="search-modal-header">' +
          '<span class="search-modal-title" id="searchModalTitle">' + esc(b.titulo) + '</span>' +
          '<button class="search-modal-close" data-ipremb-acao="fechar-busca" aria-label="Fechar">' + SVG.fecharBusca + '</button>' +
        '</div>' +
        '<div class="search-modal-input-wrap">' +
          '<span class="search-modal-input-icon">' + SVG.lupaBusca + '</span>' +
          '<input type="text" class="search-modal-input" id="searchInput" placeholder="' + esc(b.placeholder) + '">' +
        '</div>' +
        '<p class="search-modal-hint" id="searchHint">' + esc(b.dica) + '</p>' +
        '<p style="font-size:12px;color:#6b7280;text-align:center;margin-top:10px;padding-top:10px;border-top:1px solid #e5e7eb;">' +
          esc(b.aviso) + '</p>' +
        /* recipiente de resultados: fica vazio nas paginas sem busca local */
        '<div class="search-results" id="searchResults"></div>' +
      '</div></div>';
  }

  function tplWhatsapp(n) {
    var w = n.whatsapp;
    return '<a class="wa-float" href="' + escAttr(w.href) + '" target="_blank" rel="noopener" ' +
      'title="' + esc(w.rotulo) + '" aria-label="' + esc(w.rotulo) + '">' +
      '<span class="wa-float-tip" aria-hidden="true">' + esc(w.rotulo) + '</span>' +
      SVG.whatsapp + '</a>';
  }

  var TEMPLATES = {
    banner      : tplBanner,
    topbar      : tplTopBar,
    header      : tplHeader,
    'menu-mobile': tplMenuMobile,
    rodape      : tplRodape,
    busca       : tplBusca,
    whatsapp    : tplWhatsapp
  };

  /* --------------------------------------------------------------------------
     3. MONTAGEM
     ------------------------------------------------------------------------ */

  function montar(doc, nav, secaoAtiva) {
    var marcadores = doc.querySelectorAll('[data-ipremb]');
    var montados = [];
    Array.prototype.forEach.call(marcadores, function (el) {
      var nome = el.getAttribute('data-ipremb');
      var tpl = TEMPLATES[nome];
      if (!tpl) return;
      /* outerHTML: o marcador SAI do DOM e e trocado pelo componente, para que
         a arvore final seja igual a do HTML embutido (sticky, z-index, etc.) */
      el.outerHTML = tpl(nav, secaoAtiva);
      montados.push(nome);
    });
    return montados;
  }

  /* --------------------------------------------------------------------------
     4. COMPORTAMENTO
     ------------------------------------------------------------------------ */

  function ligarComportamento(doc, win) {

    /* ---- menu mobile ---- */
    function alternarMenuMobile() {
      var menu = doc.getElementById('mobileMenu');
      if (!menu) return;
      var aberto = menu.classList.toggle('open');
      doc.body.style.overflow = aberto ? 'hidden' : '';
      var hamburger = doc.querySelector('[data-ipremb-acao="menu-mobile"].hamburger');
      if (hamburger) hamburger.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    }

    /* ---- acordeao do menu mobile (um aberto por vez, como antes) ---- */
    function alternarAcordeao(btn) {
      var corpo = btn.nextElementSibling;
      if (!corpo) return;
      var estavaAberto = corpo.classList.contains('open');
      Array.prototype.forEach.call(doc.querySelectorAll('.mobile-accordion-body.open'), function (b) {
        b.classList.remove('open');
        if (b.previousElementSibling) {
          b.previousElementSibling.classList.remove('open');
          b.previousElementSibling.setAttribute('aria-expanded', 'false');
        }
      });
      if (!estavaAberto) {
        corpo.classList.add('open');
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    }

    function alternarSubAcordeao(btn) {
      var corpo = btn.nextElementSibling;
      if (!corpo) return;
      var abrir = !corpo.classList.contains('open');
      corpo.classList.toggle('open', abrir);
      btn.classList.toggle('open', abrir);
      btn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    }

    /* ---- busca ---- */
    function abrirBusca() {
      var m = doc.getElementById('searchModal');
      if (!m) return;
      m.classList.add('open');
      var inp = doc.getElementById('searchInput');
      if (inp) setTimeout(function () { inp.focus(); }, 60);
    }
    function fecharBusca() {
      var m = doc.getElementById('searchModal');
      if (m) m.classList.remove('open');
    }

    /* ---- um unico ouvinte de clique para todas as acoes ---- */
    doc.addEventListener('click', function (ev) {
      var alvoEl = ev.target && ev.target.closest ? ev.target.closest('[data-ipremb-acao]') : null;

      if (alvoEl) {
        switch (alvoEl.getAttribute('data-ipremb-acao')) {
          case 'fechar-banner':
            var banner = alvoEl.closest('.alert-banner');
            if (banner) banner.style.display = 'none';
            return;
          case 'contraste':
            doc.body.classList.toggle('high-contrast');
            return;
          case 'menu-mobile':
            alternarMenuMobile();
            return;
          case 'acordeao':
            alternarAcordeao(alvoEl);
            return;
          case 'subacordeao':
            alternarSubAcordeao(alvoEl);
            return;
          case 'abrir-busca':
            abrirBusca();
            return;
          case 'fechar-busca':
            fecharBusca();
            return;
        }
      }

      /* clique no fundo do modal de busca fecha */
      if (ev.target && ev.target.id === 'searchModal') fecharBusca();

      /* clique fora do menu principal fecha os dropdowns */
      if (!(ev.target && ev.target.closest && ev.target.closest('#mainNav'))) fecharDropdowns();
    });

    doc.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { fecharBusca(); fecharDropdowns(); }
    });

    /* ---- mega-menu: hover com atraso + clique como alternativa ---- */
    var itensNav = doc.querySelectorAll('#mainNav .nav-item');
    var timerAbrir, timerFechar;

    function fecharDropdowns() {
      Array.prototype.forEach.call(itensNav, function (i) { i.classList.remove('open'); });
    }

    Array.prototype.forEach.call(itensNav, function (item) {
      var dropdown = item.querySelector('.nav-dropdown');
      if (!dropdown) return;

      item.addEventListener('mouseenter', function () {
        clearTimeout(timerFechar);
        timerAbrir = setTimeout(function () {
          fecharDropdowns();
          item.classList.add('open');
        }, 60);
      });

      item.addEventListener('mouseleave', function () {
        clearTimeout(timerAbrir);
        timerFechar = setTimeout(function () { item.classList.remove('open'); }, 120);
      });

      var gatilho = item.querySelector('.nav-link');
      if (gatilho) {
        gatilho.addEventListener('click', function (ev) {
          ev.preventDefault();
          var aberto = item.classList.contains('open');
          fecharDropdowns();
          if (!aberto) item.classList.add('open');
        });
      }
    });

    /* ---- sombra do header ao rolar ---- */
    var header = doc.querySelector('.header');
    if (header) {
      win.addEventListener('scroll', function () {
        header.style.boxShadow = win.scrollY > 8
          ? '0 2px 0 var(--gray-200), 0 6px 28px rgba(9,29,69,0.10)'
          : '0 1px 0 var(--gray-200), 0 4px 20px rgba(9,29,69,0.06)';
      }, { passive: true });
    }

    /* ---- alto contraste: injeta a regra uma unica vez ---- */
    if (!doc.getElementById('iprembContraste')) {
      var estilo = doc.createElement('style');
      estilo.id = 'iprembContraste';
      estilo.textContent = '.high-contrast { filter: contrast(1.5) grayscale(0.15); }';
      doc.head.appendChild(estilo);
    }

    /* ---- animacao fade-up (paginas que usam .fade-up) ---- */
    ativarFadeUp(doc, win);
  }

  function ativarFadeUp(doc, win) {
    var elementos = Array.prototype.slice.call(doc.querySelectorAll('.fade-up'));
    if (!elementos.length) return;

    function ativar(el) {
      el.classList.add('visible');
      Array.prototype.forEach.call(
        el.querySelectorAll('.service-card, .profile-card, .news-card, .transparency-item, .quick-card'),
        function (filho, i) {
          filho.style.transitionDelay = (i * 0.06) + 's';
          setTimeout(function () { filho.style.transitionDelay = ''; }, 1200);
        });
    }

    if ('IntersectionObserver' in win) {
      var io = new win.IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) { if (e.isIntersecting) { ativar(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.01, rootMargin: '120px 0px 0px 0px' });
      elementos.forEach(function (el) {
        if (el.getBoundingClientRect().top < win.innerHeight + 120) ativar(el);
        else io.observe(el);
      });
    } else {
      elementos.forEach(ativar);
    }
    /* rede de seguranca: nada pode ficar invisivel */
    setTimeout(function () {
      elementos.forEach(function (el) { if (!el.classList.contains('visible')) ativar(el); });
    }, 1000);
  }

  /* --------------------------------------------------------------------------
     5. INICIALIZACAO
     ------------------------------------------------------------------------ */

  function iniciar(doc, win) {
    var nav = win && win.IPREMB_NAVEGACAO;
    if (!nav) {
      if (win && win.console) win.console.error('[IPREMB] ipremb-navegacao.js nao foi carregado.');
      return null;
    }
    var secaoAtiva = doc.body ? doc.body.getAttribute('data-secao-ativa') : null;
    var montados = montar(doc, nav, secaoAtiva);
    ligarComportamento(doc, win);
    return { montados: montados, secaoAtiva: secaoAtiva };
  }

  /* --------------------------------------------------------------------------
     Exposicao
     ------------------------------------------------------------------------ */

  API.esc            = esc;
  API.escAttr        = escAttr;
  API.tplBanner      = tplBanner;
  API.tplTopBar      = tplTopBar;
  API.tplMenuDesktop = tplMenuDesktop;
  API.tplHeader      = tplHeader;
  API.tplMenuMobile  = tplMenuMobile;
  API.tplRodape      = tplRodape;
  API.tplBusca       = tplBusca;
  API.tplWhatsapp    = tplWhatsapp;
  API.montar         = montar;
  API.iniciar        = iniciar;

  if (raiz) raiz.IPREMB_LAYOUT = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

  if (typeof document !== 'undefined' && raiz) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { iniciar(document, raiz); });
    } else {
      iniciar(document, raiz);
    }
  }

})(typeof window !== 'undefined' ? window : null);
