/* ============================================================================
   IPREMB — Galeria orientada por dados
   Fase 1.15-3.

   Catalogo unico (instituto-fotos.html) com tres niveis, todos por URL:

       (sem parametro)        -> acervo + anos
       ?ano=AAAA              -> meses/albuns do ano
       ?ano=AAAA&mes=NOME     -> fotos do album

   Nenhum HTML novo por ano ou por mes. Ano e mes sao DADOS e FILTROS.

   Um album real pode continuar tendo URL propria: basta a pagina declarar
   <div data-galeria="album" data-album="2026-junho"></div> — o mesmo modelo
   tecnico e reutilizado, sem duplicar markup.

   Regras de URL e historico seguem o contrato aprovado no piloto:
     parametro invalido nao quebra a pagina, cai no nivel valido mais proximo
     e a URL e normalizada por replaceState.

   Secoes 1 a 5 sao puras (sem DOM) e podem ser testadas fora do navegador.
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

  /* normaliza para comparacao: minusculas e sem acento, para que
     ?mes=Junho, ?mes=junho e ?mes=JUNHO cheguem ao mesmo album */
  function chave(v) {
    var s = String(v === null || v === undefined ? '' : v).trim().toLowerCase();
    if (typeof s.normalize === 'function') {
      s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return s;
  }

  var ICONE_SETA = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" focusable="false"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
  var ICONE_VOLTAR = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" focusable="false"><polyline points="15 18 9 12 15 6"/></svg>';
  var ICONE_FOTO = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
  var ICONE_FOTO_G = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
  var ICONE_ALERTA = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

  /* --------------------------------------------------------------------------
     2. LEITURA DA URL
     ------------------------------------------------------------------------ */

  function lerParam(search, nome) {
    if (typeof search !== 'string' || !search) return null;
    var q = search.charAt(0) === '?' ? search.slice(1) : search;
    if (!q) return null;
    if (typeof URLSearchParams === 'function') {
      try { return new URLSearchParams(q).get(nome); } catch (e) { /* fallback */ }
    }
    var partes = q.split('&');
    for (var i = 0; i < partes.length; i++) {
      var s = partes[i].indexOf('=');
      if ((s === -1 ? partes[i] : partes[i].slice(0, s)) !== nome) continue;
      var v = s === -1 ? '' : partes[i].slice(s + 1).replace(/\+/g, ' ');
      try { return decodeURIComponent(v); } catch (e2) { return v; }
    }
    return null;
  }

  function anos(dados) { return (dados && Array.isArray(dados.anos)) ? dados.anos : []; }
  function albuns(dados) { return (dados && Array.isArray(dados.albuns)) ? dados.albuns : []; }

  function existeAno(dados, ano) {
    return anos(dados).some(function (a) { return a.ano === ano; });
  }
  function albunsDoAno(dados, ano) {
    return albuns(dados).filter(function (a) { return a.ano === ano; });
  }
  function acharAlbum(dados, ano, mes) {
    var k = chave(mes);
    return albuns(dados).filter(function (a) {
      return a.ano === ano && chave(a.mes) === k;
    })[0] || null;
  }
  function albumPorId(dados, id) {
    return albuns(dados).filter(function (a) { return a.id === id; })[0] || null;
  }

  /* Resolve o nivel a partir da URL.
     nivel: 'catalogo' | 'ano' | 'album'
     status: 'ok' | 'ano-invalido' | 'mes-invalido' */
  function resolver(search, dados) {
    var ano = lerParam(search, 'ano');
    var mes = lerParam(search, 'mes');

    if (ano === null) {
      return { nivel: 'catalogo', ano: null, mes: null, album: null, status: 'ok', normalizar: false };
    }
    var anoLimpo = String(ano).trim();
    if (!/^\d{4}$/.test(anoLimpo) || !existeAno(dados, anoLimpo)) {
      return { nivel: 'catalogo', ano: null, mes: null, album: null,
               status: 'ano-invalido', recebido: ano, normalizar: true };
    }
    if (mes === null || String(mes).trim() === '') {
      return { nivel: 'ano', ano: anoLimpo, mes: null, album: null, status: 'ok', normalizar: mes !== null };
    }
    var album = acharAlbum(dados, anoLimpo, mes);
    if (!album) {
      return { nivel: 'ano', ano: anoLimpo, mes: null, album: null,
               status: 'mes-invalido', recebido: mes, normalizar: true };
    }
    return { nivel: 'album', ano: anoLimpo, mes: album.mes, album: album, status: 'ok', normalizar: false };
  }

  function urlDoEstado(ano, mes) {
    if (!ano) return '?';
    if (!mes) return '?ano=' + encodeURIComponent(ano);
    return '?ano=' + encodeURIComponent(ano) + '&mes=' + encodeURIComponent(mes);
  }

  /* --------------------------------------------------------------------------
     3. TEMPLATES  (dados -> string, sem DOM)
     ------------------------------------------------------------------------ */

  function htmlAviso(res) {
    if (!res || res.status === 'ok') return '';
    var texto = res.status === 'ano-invalido'
      ? 'O endereço informava o ano <strong>' + esc(res.recebido) + '</strong>, que não existe na galeria. Exibindo o catálogo completo.'
      : 'O endereço informava o mês <strong>' + esc(res.recebido) + '</strong>, que não existe em ' + esc(res.ano) + '. Exibindo os álbuns do ano.';
    return '<div class="gal-aviso">' + ICONE_ALERTA + '<span>' + texto + '</span></div>';
  }

  /* nivel 1: acervo + anos */
  function htmlCatalogo(dados) {
    var ac = dados.acervo;
    var destaque = ac ? (
      '<a href="' + esc(ac.href) + '" class="fotos-acervo">' +
        '<div class="fotos-acervo-left">' +
          '<div class="fotos-acervo-badge">' + esc(ac.selo) + '</div>' +
          '<div class="fotos-acervo-title">' + esc(ac.titulo) + '</div>' +
          '<div class="fotos-acervo-desc">' + esc(ac.descricao) + '</div>' +
        '</div>' +
        '<div class="fotos-acervo-right">' +
          '<div class="fotos-acervo-icon">' + ICONE_FOTO + '</div>' +
          '<div class="fotos-acervo-arrow">' + esc(ac.acao) + ' ' + ICONE_SETA + '</div>' +
        '</div>' +
      '</a>') : '';

    var lista = anos(dados);
    if (!lista.length) {
      return destaque + '<div class="gal-vazio">' + ICONE_FOTO_G +
        '<div class="gal-vazio-t">Nenhum ano disponível.</div></div>';
    }

    var cards = lista.map(function (a) {
      var qtd = albunsDoAno(dados, a.ano).length;
      var nota = qtd === 1 ? '1 álbum' : (qtd > 1 ? qtd + ' álbuns' : 'Sem álbum publicado');
      return '<a href="' + esc(urlDoEstado(a.ano, null)) + '" class="fotos-year-card" data-ano="' + esc(a.ano) + '">' +
        '<span class="fotos-year-num">' + esc(a.ano) + '</span>' +
        '<span class="fotos-year-desc">' + esc(a.descricao) + '</span>' +
        '<span class="gal-nota">' + esc(nota) + '</span>' +
        '<span class="fotos-year-link">Ver fotos ' + ICONE_SETA + '</span>' +
      '</a>';
    }).join('');

    return destaque +
      '<div class="fotos-years-label">Fotos por ano</div>' +
      '<div class="fotos-years-grid">' + cards + '</div>';
  }

  /* nivel 2: meses/albuns de um ano */
  function htmlAno(dados, ano) {
    var lista = albunsDoAno(dados, ano);
    var voltar = '<div class="fotos-ano-back-wrap">' +
      '<a href="?" class="fotos-ano-back" data-ano="">' + ICONE_VOLTAR + ' Voltar para Fotos</a></div>';

    if (!lista.length) {
      return '<p class="fotos-ano-intro">Álbuns publicados em ' + esc(ano) + ':</p>' +
        '<div class="gal-vazio">' + ICONE_FOTO_G +
        '<div class="gal-vazio-t">Nenhum álbum publicado em ' + esc(ano) + '.</div>' +
        '<div class="gal-vazio-d">Selecione outro ano no catálogo.</div></div>' + voltar;
    }

    var cards = lista.map(function (al) {
      var n = (al.fotos || []).length;
      return '<div class="fotos-ano-card">' +
        '<div class="fotos-ano-month">' + esc(al.mesRotulo || al.mes) + '</div>' +
        '<div class="fotos-ano-title">' + esc(al.titulo) + '</div>' +
        '<div class="fotos-ano-count">' + n + (n === 1 ? ' foto' : ' fotos') + '</div>' +
        '<a href="' + esc(urlDoEstado(al.ano, al.mes)) + '" class="fotos-ano-link" ' +
          'data-ano="' + esc(al.ano) + '" data-mes="' + esc(al.mes) + '">Acessar galeria ' + ICONE_SETA + '</a>' +
      '</div>';
    }).join('');

    return '<p class="fotos-ano-intro">Selecione o mês desejado para acessar a galeria de fotos:</p>' +
      '<div class="fotos-ano-grid">' + cards + '</div>' + voltar;
  }

  /* nivel 3: fotos do album */
  function htmlAlbum(album, comVoltar) {
    if (!album) {
      return '<div class="gal-vazio">' + ICONE_FOTO_G +
        '<div class="gal-vazio-t">Álbum não encontrado.</div></div>';
    }
    var fotos = album.fotos || [];
    var n = fotos.length;

    var cabecalho =
      '<div class="fotos-2026-month">' + esc(album.mesRotulo || album.mes) + '</div>' +
      '<div class="fotos-2026-header">' +
        '<div class="fotos-2026-title">' + esc(album.titulo) + '</div>' +
        '<div class="fotos-2026-count">' + n + (n === 1 ? ' foto' : ' fotos') + '</div>' +
      '</div>';

    var corpo = n
      ? '<div class="fotos-2026-grid">' + fotos.map(function (f) {
          return '<div class="fotos-2026-item">' +
            '<a href="' + esc(f.arquivo) + '" target="_blank" rel="noopener">' +
            '<img src="' + esc(f.arquivo) + '" alt="' + esc(f.alt) + '" class="fotos-2026-img" loading="lazy">' +
            '</a></div>';
        }).join('') + '</div>'
      : '<div class="gal-vazio">' + ICONE_FOTO_G +
        '<div class="gal-vazio-t">Nenhuma foto publicada neste álbum.</div></div>';

    var voltar = comVoltar ? '<div class="fotos-ano-back-wrap">' +
      '<a href="' + esc(urlDoEstado(album.ano, null)) + '" class="fotos-ano-back" ' +
      'data-ano="' + esc(album.ano) + '">' + ICONE_VOLTAR + ' Voltar para ' + esc(album.ano) + '</a></div>' : '';

    return cabecalho + corpo + voltar;
  }

  function htmlCarregando() {
    return '<div class="gal-carregando"><span class="gal-spinner" aria-hidden="true"></span>' +
      '<span>Carregando galeria…</span></div>';
  }

  function htmlErro(mensagem) {
    return '<div class="gal-vazio gal-erro">' + ICONE_ALERTA +
      '<div class="gal-vazio-t">Não foi possível carregar a galeria.</div>' +
      '<div class="gal-vazio-d">' + esc(mensagem || 'Tente novamente em instantes.') + '</div>' +
      '<button type="button" class="gal-repetir" data-acao="repetir">Tentar novamente</button></div>';
  }

  /* render completo do catalogo, para um estado resolvido */
  function htmlEstado(dados, res) {
    var corpo = res.nivel === 'catalogo' ? htmlCatalogo(dados)
              : res.nivel === 'ano'      ? htmlAno(dados, res.ano)
              :                            htmlAlbum(res.album, true);
    return htmlAviso(res) + corpo;
  }

  /* trilha de navegacao interna (breadcrumb do catalogo) */
  function htmlTrilha(res) {
    if (res.nivel === 'catalogo') return '';
    var partes = ['<a href="?" data-ano="">Fotos</a>'];
    if (res.nivel === 'ano') partes.push('<span aria-current="true">' + esc(res.ano) + '</span>');
    else {
      partes.push('<a href="' + esc(urlDoEstado(res.ano, null)) + '" data-ano="' + esc(res.ano) + '">' + esc(res.ano) + '</a>');
      partes.push('<span aria-current="true">' + esc(res.album.mesRotulo || res.album.mes) + '</span>');
    }
    return '<nav class="gal-trilha" aria-label="Navegação da galeria">' +
      partes.join('<span class="gal-trilha-sep" aria-hidden="true">›</span>') + '</nav>';
  }

  /* --------------------------------------------------------------------------
     4. PROVEDOR DE DADOS  (ponto de troca pela FAC)
     ------------------------------------------------------------------------ */

  function carregarDados() {
    return new Promise(function (resolve, reject) {
      var d = raiz && raiz.IPREMB_DADOS_GALERIA;
      if (!d || !Array.isArray(d.anos)) {
        reject(new Error('A base da galeria não foi encontrada.'));
        return;
      }
      resolve(d);
    });
  }

  /* --------------------------------------------------------------------------
     5. LIGACAO COM O DOM
     ------------------------------------------------------------------------ */

  function ligar(doc, win) {
    var alvo = doc.querySelector('[data-galeria]');
    if (!alvo) return null;

    var modo = alvo.getAttribute('data-galeria');          /* 'catalogo' | 'album' */
    var idAlbum = alvo.getAttribute('data-album') || null;
    var trilha = doc.getElementById('galTrilha');
    var temHistory = !!(win.history && typeof win.history.pushState === 'function');
    var base = null;

    alvo.innerHTML = htmlCarregando();

    function pintar(res) {
      alvo.innerHTML = htmlEstado(base, res);
      if (trilha) trilha.innerHTML = htmlTrilha(res);
    }

    function aplicarDaUrl() {
      var res = resolver(win.location.search, base);
      if (res.normalizar && temHistory) {
        win.history.replaceState({ ano: res.ano, mes: res.mes }, '', urlDoEstado(res.ano, res.mes));
      }
      pintar(res);
    }

    function ir(ano, mes) {
      if (!temHistory) return false;
      win.history.pushState({ ano: ano, mes: mes }, '', urlDoEstado(ano, mes));
      aplicarDaUrl();
      return true;
    }

    alvo.addEventListener('click', function (ev) {
      if (!ev.target || !ev.target.closest) return;

      var repetir = ev.target.closest('[data-acao="repetir"]');
      if (repetir) { iniciar(); return; }

      /* so intercepta navegacao interna do catalogo */
      if (modo !== 'catalogo') return;
      var link = ev.target.closest('a[data-ano]');
      if (!link) return;
      if (!temHistory || ev.defaultPrevented || ev.button !== 0 ||
          ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      ev.preventDefault();
      ir(link.getAttribute('data-ano') || null, link.getAttribute('data-mes') || null);
    });

    if (trilha) {
      trilha.addEventListener('click', function (ev) {
        var link = ev.target && ev.target.closest ? ev.target.closest('a[data-ano]') : null;
        if (!link || !temHistory || ev.button !== 0 ||
            ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
        ev.preventDefault();
        ir(link.getAttribute('data-ano') || null, link.getAttribute('data-mes') || null);
      });
    }

    win.addEventListener('popstate', function () {
      if (base && modo === 'catalogo') aplicarDaUrl();
    });

    function iniciar() {
      alvo.innerHTML = htmlCarregando();
      carregarDados().then(function (d) {
        base = d;
        if (modo === 'album') {
          /* pagina de album com URL propria: renderiza o album declarado */
          var al = albumPorId(base, idAlbum);
          alvo.innerHTML = htmlAlbum(al, false);
          if (trilha) {
            trilha.innerHTML = al ? htmlTrilha({ nivel: 'album', ano: al.ano, album: al }) : '';
          }
        } else {
          aplicarDaUrl();
        }
      })['catch'](function (erro) {
        base = null;
        alvo.innerHTML = htmlErro(erro && erro.message);
        if (trilha) trilha.innerHTML = '';
      });
    }

    iniciar();
    return { recarregar: iniciar, modo: modo };
  }

  /* --------------------------------------------------------------------------
     Exposicao
     ------------------------------------------------------------------------ */

  API.esc = esc;
  API.lerParam = lerParam;
  API.existeAno = existeAno;
  API.albunsDoAno = albunsDoAno;
  API.acharAlbum = acharAlbum;
  API.albumPorId = albumPorId;
  API.resolver = resolver;
  API.urlDoEstado = urlDoEstado;
  API.htmlCatalogo = htmlCatalogo;
  API.htmlAno = htmlAno;
  API.htmlAlbum = htmlAlbum;
  API.htmlAviso = htmlAviso;
  API.htmlCarregando = htmlCarregando;
  API.htmlErro = htmlErro;
  API.htmlEstado = htmlEstado;
  API.htmlTrilha = htmlTrilha;
  API.carregarDados = carregarDados;
  API.ligar = ligar;

  if (raiz) raiz.IPREMB_GALERIA = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

  if (typeof document !== 'undefined' && raiz) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { ligar(document, raiz); });
    } else {
      ligar(document, raiz);
    }
  }

})(typeof window !== 'undefined' ? window : null);
