/* ============================================================================
   IPREMB — Piloto Fase 1.15-1: consulta documental por exercicio
   Assunto piloto: Avaliacao Atuarial

   CAMADA DE LOGICA + APRESENTACAO GERADA.
   Nao contem dados institucionais (ver dados-avaliacao-atuarial.js).

   Organizacao:
     1. utilitarios puros
     2. regras de URL e resolucao de exercicio     (secoes 3 e 5 do contrato)
     3. consulta aos dados                          (secao 2 do contrato)
     4. geracao de HTML por estado                  (secao 7.2 do contrato)
     5. provedor de dados                           (secao 7.3 — ponto FAC)
     6. ligacao com o DOM e historico               (secao 4 do contrato)

   As secoes 1 a 5 sao puras: nao tocam DOM, window, history nem location.
   Por isso podem ser executadas e testadas fora do navegador.
   ========================================================================== */
(function (raiz) {
  'use strict';

  var API = {};

  /* --------------------------------------------------------------------------
     1. UTILITARIOS PUROS
     ------------------------------------------------------------------------ */

  /* Todo texto vindo dos dados passa por aqui antes de virar HTML. */
  function escapar(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var ICONE_DOC =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">' +
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';

  var ICONE_DOC_G =
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false">' +
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';

  var ICONE_BAIXAR =
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">' +
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

  var ICONE_SETA =
    '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" focusable="false">' +
    '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

  var ICONE_CHECK =
    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true" focusable="false">' +
    '<polyline points="20 6 9 17 4 12"/></svg>';

  var ICONE_ALERTA =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">' +
    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

  /* --------------------------------------------------------------------------
     2. REGRAS DE URL E RESOLUCAO DE EXERCICIO  (contrato, secoes 3 e 5)
     ------------------------------------------------------------------------ */

  var NOME_PARAM = 'exercicio';

  /* Le o parametro de forma protegida. Devolve string bruta ou null.
     Nunca lanca excecao, mesmo com percent-encoding malformado. */
  function lerParametro(search) {
    if (typeof search !== 'string' || search === '') return null;
    var consulta = search.charAt(0) === '?' ? search.slice(1) : search;
    if (consulta === '') return null;

    if (typeof URLSearchParams === 'function') {
      try {
        return new URLSearchParams(consulta).get(NOME_PARAM);
      } catch (e) { /* cai no fallback manual abaixo */ }
    }

    var partes = consulta.split('&');
    for (var i = 0; i < partes.length; i++) {
      var sep = partes[i].indexOf('=');
      var chave = sep === -1 ? partes[i] : partes[i].slice(0, sep);
      if (chave !== NOME_PARAM) continue;
      var bruto = sep === -1 ? '' : partes[i].slice(sep + 1).replace(/\+/g, ' ');
      try { return decodeURIComponent(bruto); } catch (e2) { return bruto; }
    }
    return null;
  }

  function listaExercicios(dados) {
    return (dados && Array.isArray(dados.exercicios)) ? dados.exercicios : [];
  }

  function existeExercicio(dados, exercicio) {
    var lista = listaExercicios(dados);
    for (var i = 0; i < lista.length; i++) {
      if (lista[i] && lista[i].exercicio === exercicio) return true;
    }
    return false;
  }

  /* Exercicio padrao: assunto.exercicioPadrao, senao o vigente,
     senao o mais recente da lista. Contrato, secao 3.2. */
  function exercicioPadrao(dados) {
    var lista = listaExercicios(dados);
    if (!lista.length) return null;

    var declarado = dados && dados.assunto && dados.assunto.exercicioPadrao;
    if (declarado && existeExercicio(dados, declarado)) return declarado;

    for (var i = 0; i < lista.length; i++) {
      if (lista[i] && lista[i].vigente) return lista[i].exercicio;
    }

    var recente = null;
    for (var j = 0; j < lista.length; j++) {
      var atual = lista[j] && lista[j].exercicio;
      if (atual && (recente === null || atual > recente)) recente = atual;
    }
    return recente;
  }

  /* Resolve o exercicio efetivo a partir da URL.
     status: 'padrao' | 'valido' | 'invalido' | 'inexistente'
     normalizar: true quando a URL deve ser corrigida via replaceState. */
  function resolver(search, dados) {
    var padrao = exercicioPadrao(dados);
    var bruto = lerParametro(search);

    if (bruto === null) {
      return { exercicio: padrao, bruto: null, status: 'padrao', normalizar: false };
    }

    var limpo = String(bruto).trim();

    if (!/^\d{4}$/.test(limpo)) {
      return { exercicio: padrao, bruto: bruto, status: 'invalido', normalizar: true };
    }
    if (!existeExercicio(dados, limpo)) {
      return { exercicio: padrao, bruto: bruto, status: 'inexistente', normalizar: true };
    }
    return { exercicio: limpo, bruto: bruto, status: 'valido', normalizar: false };
  }

  /* Monta a query string do exercicio preservando os demais parametros. */
  function urlDoExercicio(exercicio, search) {
    var consulta = (typeof search === 'string' && search.charAt(0) === '?')
      ? search.slice(1) : (search || '');

    if (typeof URLSearchParams === 'function') {
      try {
        var p = new URLSearchParams(consulta);
        p.set(NOME_PARAM, exercicio);
        return '?' + p.toString();
      } catch (e) { /* fallback abaixo */ }
    }
    return '?' + NOME_PARAM + '=' + encodeURIComponent(exercicio);
  }

  /* --------------------------------------------------------------------------
     3. CONSULTA AOS DADOS  (contrato, secao 2)
     ------------------------------------------------------------------------ */

  function filtrarDocumentos(dados, exercicio) {
    if (!dados || !Array.isArray(dados.documentos)) return [];
    var assuntoId = dados.assunto && dados.assunto.id;
    var saida = [];
    for (var i = 0; i < dados.documentos.length; i++) {
      var d = dados.documentos[i];
      if (!d) continue;
      if (assuntoId && d.assunto !== assuntoId) continue;
      if (d.exercicio !== exercicio) continue;
      saida.push(d);
    }
    return saida;
  }

  /* Linha de metadados derivada — nunca armazenada pronta (contrato 2.4.1). */
  function metaDocumento(doc) {
    if (!doc) return '';
    var partes = [];
    if (doc.dataDocumento) partes.push('Documento de ' + doc.dataDocumento);
    if (doc.dataPublicacao) partes.push('Publicada em ' + doc.dataPublicacao);
    if (doc.descricao) partes.push(doc.descricao);
    return partes.join(' · ');
  }

  function seloDocumento(doc) {
    if (!doc || !doc.situacao) return null;
    if (doc.situacao === 'vigente') return { classe: 'vig', texto: 'Vigente' };
    if (doc.situacao === 'anterior') return { classe: 'enc', texto: 'Anterior' };
    return { classe: 'enc', texto: String(doc.situacao) };
  }

  /* --------------------------------------------------------------------------
     4. GERACAO DE HTML POR ESTADO  (contrato, secao 7.2)
     Todas as funcoes recebem dados e devolvem string. Sem DOM.
     ------------------------------------------------------------------------ */

  /* --- 4.1 cards de exercicio --- */

  function htmlCards(dados, exercicioAtivo, search) {
    var lista = listaExercicios(dados);
    var partes = [];

    for (var i = 0; i < lista.length; i++) {
      var ex = lista[i];
      if (!ex || !ex.exercicio) continue;

      var ativo = ex.exercicio === exercicioAtivo;
      var rotulo = ex.rotulo || ex.exercicio;

      /* O estado ativo NAO depende so da cor: ha aria-current, o texto
         "Selecionado" e o icone de confirmacao. Contrato, criterio 3. */
      var linhaTipo = ex.vigente ? 'Exercício vigente' : 'Exercício';
      var linhaAcao = ativo
        ? ICONE_CHECK + ' Selecionado'
        : 'Acessar ' + ICONE_SETA;

      partes.push(
        '<a class="inv-yc' + (ativo ? ' act' : '') + '"' +
        ' href="' + escapar(urlDoExercicio(ex.exercicio, search)) + '"' +
        ' data-exercicio="' + escapar(ex.exercicio) + '"' +
        (ativo ? ' aria-current="true"' : '') + '>' +
          '<span class="inv-yn">' + escapar(rotulo) + '</span>' +
          '<span class="inv-yl">' + linhaTipo + '</span>' +
          '<span class="inv-ya">' + linhaAcao + '</span>' +
        '</a>'
      );
    }
    return partes.join('');
  }

  function htmlCardsCarregando(quantidade) {
    var total = quantidade > 0 ? quantidade : 8;
    var partes = [];
    for (var i = 0; i < total; i++) {
      partes.push('<div class="inv-yc aa-esqueleto" aria-hidden="true"></div>');
    }
    return partes.join('');
  }

  /* --- 4.2 aviso de parametro invalido (contrato 3.3) --- */

  function htmlAviso(resolucao) {
    if (!resolucao || (resolucao.status !== 'invalido' && resolucao.status !== 'inexistente')) {
      return '';
    }
    var motivo = resolucao.status === 'inexistente'
      ? 'não há exercício'
      : 'não é um exercício válido';

    return '<div class="aa-aviso">' + ICONE_ALERTA +
      '<span>O endereço informava <strong>' + escapar(resolucao.bruto) + '</strong>, mas ' +
      motivo + ' com esse valor. Exibindo o exercício <strong>' +
      escapar(resolucao.exercicio) + '</strong>.</span></div>';
  }

  /* --- 4.3 estados da consulta documental --- */

  function htmlCarregando() {
    return '<div class="aa-carregando">' +
      '<span class="aa-spinner" aria-hidden="true"></span>' +
      '<span>Carregando documentos…</span></div>';
  }

  function htmlVazio(exercicio) {
    return '<div class="inv-empty">' + ICONE_DOC_G +
      '<div class="inv-empty-t">Nenhum documento disponível para o exercício ' +
      escapar(exercicio) + '.</div>' +
      '<div class="inv-empty-d">Selecione outro exercício na lista acima.</div></div>';
  }

  function htmlErro(mensagem) {
    return '<div class="inv-empty aa-erro">' + ICONE_ALERTA +
      '<div class="inv-empty-t">Não foi possível carregar os documentos.</div>' +
      '<div class="inv-empty-d">' + escapar(mensagem || 'Tente novamente em instantes.') + '</div>' +
      '<button type="button" class="aa-repetir" data-acao="repetir">Tentar novamente</button></div>';
  }

  function htmlDocumento(doc) {
    var selo = seloDocumento(doc);
    var meta = metaDocumento(doc);
    var temArquivo = !!(doc && doc.arquivo);

    /* Documento sem arquivo real nao vira link quebrado (contrato 2.4.2). */
    var acao = temArquivo
      ? '<a class="inv-ddl" href="' + escapar(doc.arquivo) + '" download>' +
          ICONE_BAIXAR + ' Baixar<span class="aa-sr"> ' + escapar(doc.titulo) + '</span></a>'
      : '<span class="inv-ddl aa-ddl-off" aria-disabled="true" ' +
          'title="Arquivo ainda não publicado">Indisponível</span>';

    return '<div class="inv-dr">' +
      '<div class="inv-di">' + ICONE_DOC + '</div>' +
      '<div class="aa-dtx"><div class="inv-dn">' + escapar(doc.titulo) + '</div>' +
      (meta ? '<div class="inv-dm">' + escapar(meta) + '</div>' : '') + '</div>' +
      (selo ? '<span class="inv-db ' + selo.classe + '">' + escapar(selo.texto) + '</span>' : '') +
      acao +
    '</div>';
  }

  function htmlListaDocumentos(documentos) {
    var partes = [];
    for (var i = 0; i < documentos.length; i++) partes.push(htmlDocumento(documentos[i]));
    return '<div class="inv-dl">' + partes.join('') + '</div>';
  }

  /* Estado completo da area de documentos: aviso + (conteudo | vazio). */
  function htmlDocumentos(dados, resolucao) {
    var documentos = filtrarDocumentos(dados, resolucao.exercicio);
    var corpo = documentos.length
      ? htmlListaDocumentos(documentos)
      : htmlVazio(resolucao.exercicio);
    return htmlAviso(resolucao) + corpo;
  }

  /* --------------------------------------------------------------------------
     5. PROVEDOR DE DADOS  (contrato, secao 7.3 — ponto de troca pela FAC)
     Hoje: le o objeto estatico. Futuro: trocar SOMENTE este corpo por uma
     chamada de rede que devolva o mesmo contrato da secao 2.
     ------------------------------------------------------------------------ */

  function carregarDados() {
    return new Promise(function (resolve, reject) {
      var d = raiz && raiz.IPREMB_DADOS_AVALIACAO_ATUARIAL;
      if (!d || !Array.isArray(d.exercicios) || !d.exercicios.length) {
        reject(new Error('A base de exercícios não foi encontrada.'));
        return;
      }
      resolve(d);
    });
  }

  /* --------------------------------------------------------------------------
     6. LIGACAO COM O DOM E HISTORICO  (contrato, secao 4)
     Unica parte que depende do navegador.
     ------------------------------------------------------------------------ */

  function ligar(doc, win) {
    var elAnos    = doc.getElementById('aaAnos');
    var elDocs    = doc.getElementById('aaDocs');
    var elRotulo  = doc.getElementById('aaExercicioAtual');
    if (!elAnos || !elDocs) return null;

    var temHistory = !!(win.history && typeof win.history.pushState === 'function');
    var base = null;   /* dados carregados */

    /* estado visual de carregamento, antes de qualquer resolucao */
    elAnos.innerHTML = htmlCardsCarregando(10);
    elDocs.innerHTML = htmlCarregando();

    function pintar(resolucao) {
      elAnos.innerHTML = htmlCards(base, resolucao.exercicio, win.location.search);
      elDocs.innerHTML = htmlDocumentos(base, resolucao);
      if (elRotulo) elRotulo.textContent = resolucao.exercicio || '';
    }

    /* Caminho unico usado pela carga inicial, pelo popstate e pelo clique.
       A URL e a unica fonte de verdade (contrato 4.1). */
    function aplicarDaUrl() {
      var resolucao = resolver(win.location.search, base);
      if (resolucao.normalizar && temHistory) {
        /* replaceState: normaliza sem criar registro de historico invalido */
        win.history.replaceState(
          { exercicio: resolucao.exercicio },
          '',
          urlDoExercicio(resolucao.exercicio, win.location.search)
        );
      }
      pintar(resolucao);
    }

    function selecionar(exercicio) {
      if (!existeExercicio(base, exercicio)) return;
      var atual = resolver(win.location.search, base).exercicio;
      if (exercicio === atual) return;          /* sem registro duplicado */
      win.history.pushState(
        { exercicio: exercicio },
        '',
        urlDoExercicio(exercicio, win.location.search)
      );
      aplicarDaUrl();
    }

    elAnos.addEventListener('click', function (ev) {
      var alvo = ev.target && ev.target.closest ? ev.target.closest('a[data-exercicio]') : null;
      if (!alvo) return;
      /* sem History API, ou com modificador/abrir em nova aba: navegacao normal */
      if (!temHistory || ev.defaultPrevented || ev.button !== 0 ||
          ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      ev.preventDefault();
      selecionar(alvo.getAttribute('data-exercicio'));
    });

    elDocs.addEventListener('click', function (ev) {
      var alvo = ev.target && ev.target.closest ? ev.target.closest('[data-acao="repetir"]') : null;
      if (!alvo) return;
      iniciar();
    });

    win.addEventListener('popstate', function () {
      /* popstate nunca empurra estado novo (contrato 4.2) */
      if (base) aplicarDaUrl();
    });

    function iniciar() {
      elAnos.innerHTML = htmlCardsCarregando(10);
      elDocs.innerHTML = htmlCarregando();
      carregarDados().then(function (d) {
        base = d;
        aplicarDaUrl();
      })['catch'](function (erro) {
        base = null;
        elAnos.innerHTML = '';
        elDocs.innerHTML = htmlErro(erro && erro.message);
        if (elRotulo) elRotulo.textContent = '—';
      });
    }

    iniciar();
    return { recarregar: iniciar };
  }

  /* --------------------------------------------------------------------------
     Exposicao
     ------------------------------------------------------------------------ */

  API.escapar            = escapar;
  API.lerParametro       = lerParametro;
  API.existeExercicio    = existeExercicio;
  API.exercicioPadrao    = exercicioPadrao;
  API.resolver           = resolver;
  API.urlDoExercicio     = urlDoExercicio;
  API.filtrarDocumentos  = filtrarDocumentos;
  API.metaDocumento      = metaDocumento;
  API.seloDocumento      = seloDocumento;
  API.htmlCards          = htmlCards;
  API.htmlCardsCarregando= htmlCardsCarregando;
  API.htmlAviso          = htmlAviso;
  API.htmlCarregando     = htmlCarregando;
  API.htmlVazio          = htmlVazio;
  API.htmlErro           = htmlErro;
  API.htmlDocumentos     = htmlDocumentos;
  API.carregarDados      = carregarDados;
  API.ligar              = ligar;

  if (raiz) raiz.PilotoAvaliacaoAtuarial = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

  /* auto-inicializacao apenas no navegador */
  if (typeof document !== 'undefined' && raiz) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { ligar(document, raiz); });
    } else {
      ligar(document, raiz);
    }
  }

})(typeof window !== 'undefined' ? window : null);
