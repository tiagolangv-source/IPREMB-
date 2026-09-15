/* ============================================================================
   IPREMB — Motor de consulta documental
   Fases 1.15-4 (Normativos), 1.15-5 (Contabilidade) e 1.15-6 (Investimentos,
   Relatorios e Transparencia).

   Generaliza o que foi aprovado no piloto da Avaliacao Atuarial: exercicio,
   ano, mes, tipo e categoria deixam de ser paginas e passam a ser DADOS e
   FILTROS dentro do assunto.

   Um assunto continua sendo um destino proprio. O que deixa de crescer e a
   quantidade de HTML por periodo.

   Regras de URL, historico, parametros invalidos e estados seguem
   FASE_1_15_0_CONTRATOS_E_REGRAS.md (secoes 2 a 5).

   COMO USAR numa pagina:
     <div data-consulta="normativos" data-assunto="portarias-de-beneficios"></div>
     <script src="dados-normativos.js"></script>
     <script src="ipremb-consulta.js"></script>

   As secoes 1 a 5 sao puras (sem DOM) e sao testadas fora do navegador.
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

  function escAttr(v) {
    if (v === null || v === undefined) return '';
    return String(v).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/"/g, '&quot;');
  }

  function chave(v) {
    var s = String(v === null || v === undefined ? '' : v).trim().toLowerCase();
    if (typeof s.normalize === 'function') s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  var ICO_DOC = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  var ICO_DOC_G = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  var ICO_BAIXAR = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  var ICO_SETA = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" focusable="false"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
  var ICO_SETA11 = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" focusable="false"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
  var ICO_CHECK = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"/></svg>';
  var ICO_ALERTA = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  var ICO_PASTA = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>';

  /* --------------------------------------------------------------------------
     2. REGRAS DE URL  (contrato, secoes 3 e 5)
     Um assunto tem no maximo UM filtro: 'exercicio' ou 'categoria'.
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

  function opcoes(assunto) {
    if (!assunto) return [];
    if (assunto.filtro === 'exercicio') return assunto.exercicios || [];
    if (assunto.filtro === 'categoria') return assunto.categorias || [];
    return [];
  }

  /* valor de identidade de uma opcao, conforme o filtro */
  function valorDe(assunto, opcao) {
    return assunto.filtro === 'exercicio' ? opcao.exercicio : opcao.id;
  }

  function existe(assunto, valor) {
    return opcoes(assunto).some(function (o) { return valorDe(assunto, o) === valor; });
  }

  function padrao(assunto) {
    var lista = opcoes(assunto);
    if (!lista.length) return null;
    if (assunto.padrao && existe(assunto, assunto.padrao)) return assunto.padrao;
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].vigente || lista[i].ativo) return valorDe(assunto, lista[i]);
    }
    return valorDe(assunto, lista[0]);      /* preserva a ordem original da pagina */
  }

  /* status: 'sem-filtro' | 'padrao' | 'valido' | 'invalido' | 'inexistente' */
  function resolver(search, assunto) {
    if (!assunto || assunto.filtro === 'nenhum' || !opcoes(assunto).length) {
      return { valor: null, bruto: null, status: 'sem-filtro', normalizar: false };
    }
    var nome = assunto.filtro;
    var pad = padrao(assunto);
    var bruto = lerParam(search, nome);

    if (bruto === null) return { valor: pad, bruto: null, status: 'padrao', normalizar: false };

    var limpo = String(bruto).trim();
    if (nome === 'exercicio') {
      if (!/^\d{4}$/.test(limpo)) return { valor: pad, bruto: bruto, status: 'invalido', normalizar: true };
      if (!existe(assunto, limpo)) return { valor: pad, bruto: bruto, status: 'inexistente', normalizar: true };
      return { valor: limpo, bruto: bruto, status: 'valido', normalizar: false };
    }
    /* categoria: aceita o slug tal como publicado, com tolerancia de acento/caixa */
    var alvo = chave(limpo);
    if (!alvo) return { valor: pad, bruto: bruto, status: 'invalido', normalizar: true };
    var achado = null;
    opcoes(assunto).forEach(function (o) { if (chave(o.id) === alvo) achado = o.id; });
    if (!achado) return { valor: pad, bruto: bruto, status: 'inexistente', normalizar: true };
    return { valor: achado, bruto: bruto, status: 'valido', normalizar: achado !== limpo };
  }

  function urlDoValor(assunto, valor, search) {
    var nome = assunto.filtro;
    var q = (typeof search === 'string' && search.charAt(0) === '?') ? search.slice(1) : (search || '');
    if (typeof URLSearchParams === 'function') {
      try {
        var p = new URLSearchParams(q);
        p.set(nome, valor);
        return '?' + p.toString();
      } catch (e) { /* fallback */ }
    }
    return '?' + nome + '=' + encodeURIComponent(valor);
  }

  /* --------------------------------------------------------------------------
     3. CONSULTA AOS DADOS  (contrato, secao 2)
     ------------------------------------------------------------------------ */

  function documentos(assunto) {
    return (assunto && Array.isArray(assunto.documentos)) ? assunto.documentos : [];
  }

  function filtrar(assunto, valor) {
    var lista = documentos(assunto);
    if (!assunto || assunto.filtro === 'nenhum' || valor === null) return lista;
    return lista.filter(function (d) {
      return assunto.filtro === 'exercicio' ? d.exercicio === valor : d.categoria === valor;
    });
  }

  /* linha de metadados DERIVADA, nunca armazenada pronta (contrato 2.4.1) */
  function meta(doc) {
    if (!doc) return '';
    if (doc.meta) return doc.meta;          /* texto institucional ja existente */
    var p = [];
    if (doc.numero) p.push(doc.numero);
    if (doc.dataAto) p.push('Ato de ' + doc.dataAto);
    if (doc.dataPublicacao) p.push('Publicado em ' + doc.dataPublicacao);
    if (doc.revogacao) p.push('Revogado em ' + doc.revogacao);
    if (doc.descricao) p.push(doc.descricao);
    return p.join(' · ');
  }

  function selo(doc) {
    if (!doc || !doc.situacao) return null;
    var s = String(doc.situacao);
    /* seloClasse preserva exatamente a classe que a pagina original usava
       (ex.: "Publicado" vinha com a classe vig, nao enc) */
    if (doc.seloClasse) return { classe: doc.seloClasse, texto: doc.seloRotulo || s };
    var k = chave(s);
    var classe = (k === 'vigente' || k === 'recente') ? 'vig'
               : (k === 'pdf') ? 'pdf' : 'enc';
    return { classe: classe, texto: doc.seloRotulo || s };
  }

  /* cartao de arquivo unico (paginas tipo ALM) */
  function htmlFicheiro(fi) {
    var acao = fi.arquivo
      ? '<a class="cd-ddl" href="' + escAttr(fi.arquivo) + '" download>' + ICO_BAIXAR + ' Baixar</a>'
      : '<span class="cd-ddl-off" aria-disabled="true" title="Arquivo ainda não publicado">Indisponível</span>';
    return '<div class="cd-file-card">' +
      '<div class="cd-file-icon">' + ICO_DOC + '</div>' +
      '<div class="cd-dtx"><div class="cd-file-name">' + esc(fi.titulo) + '</div>' +
      (fi.meta ? '<div class="cd-file-meta">' + esc(fi.meta) + '</div>' : '') + '</div>' +
      (fi.selo ? '<span class="cd-file-badge">' + esc(fi.selo) + '</span>' : '') +
      acao + '</div>';
  }

  /* bloco de situacao (usado pelo Certificado de Regularidade) */
  function htmlStatus(st) {
    return '<div class="cd-crp-status">' +
      '<span class="cd-crp-dot ' + esc(st.estado || 'pendente') + '" aria-hidden="true"></span>' +
      '<div><div class="cd-crp-label">' + esc(st.titulo) + '</div>' +
      (st.descricao ? '<div class="cd-crp-sub">' + esc(st.descricao) + '</div>' : '') + '</div></div>';
  }

  /* cartoes informativos estaticos (ex.: "Analise especial", "Relatorios anuais") */
  function htmlCartoes(lista) {
    return '<div class="cd-grid cols' + (lista.length > 3 ? 4 : lista.length) + '">' + lista.map(function (c) {
      var corpo = '<span class="cd-cc-icon">' + ICO_PASTA + '</span>' +
        '<span class="cd-cc-label">' + esc(c.rotulo) + '</span>' +
        (c.descricao ? '<span class="cd-cc-sub">' + esc(c.descricao) + '</span>' : '');
      return c.href
        ? '<a class="cd-cc" href="' + escAttr(c.href) + '">' + corpo +
          '<span class="cd-cc-arrow">Acessar ' + ICO_SETA11 + '</span></a>'
        : '<div class="cd-cc" aria-disabled="true">' + corpo + '</div>';
    }).join('') + '</div>';
  }

  /* --------------------------------------------------------------------------
     4. TEMPLATES  (dados -> string, sem DOM)
     ------------------------------------------------------------------------ */

  function htmlCards(assunto, ativo, search) {
    var lista = opcoes(assunto);
    if (!lista.length) return '';

    if (assunto.filtro === 'exercicio') {
      return '<div class="cd-grid' + (assunto.colunas ? ' cols' + assunto.colunas : '') + '">' +
        lista.map(function (ex) {
          var sel = ex.exercicio === ativo;
          var linha2 = ex.vigente ? 'Exercício vigente' : (ex.rotuloLinha || 'Exercício');
          var acao = sel ? ICO_CHECK + ' Selecionado' : 'Acessar ' + ICO_SETA;
          return '<a class="cd-yc' + (sel ? ' act' : '') + '"' +
            ' href="' + escAttr(urlDoValor(assunto, ex.exercicio, search)) + '"' +
            ' data-valor="' + escAttr(ex.exercicio) + '"' + (sel ? ' aria-current="true"' : '') + '>' +
            '<span class="cd-yn">' + esc(ex.rotulo || ex.exercicio) + '</span>' +
            '<span class="cd-yl">' + esc(linha2) + '</span>' +
            '<span class="cd-ya">' + acao + '</span></a>';
        }).join('') + '</div>';
    }

    /* categorias */
    return '<div class="cd-grid' + (assunto.colunas ? ' cols' + assunto.colunas : '') + '">' +
      lista.map(function (c) {
        var sel = c.id === ativo;
        var acao = sel ? ICO_CHECK + ' Selecionada' : 'Acessar ' + ICO_SETA11;
        return '<a class="cd-cc' + (sel ? ' act' : '') + '"' +
          ' href="' + escAttr(urlDoValor(assunto, c.id, search)) + '"' +
          ' data-valor="' + escAttr(c.id) + '"' + (sel ? ' aria-current="true"' : '') + '>' +
          '<span class="cd-cc-icon">' + ICO_PASTA + '</span>' +
          '<span class="cd-cc-label">' + esc(c.rotulo) + '</span>' +
          (c.descricao ? '<span class="cd-cc-sub">' + esc(c.descricao) + '</span>' : '') +
          '<span class="cd-cc-arrow">' + acao + '</span></a>';
      }).join('') + '</div>';
  }

  function htmlCardsCarregando(qtd) {
    var n = qtd > 0 ? qtd : 6, p = [];
    for (var i = 0; i < n; i++) p.push('<div class="cd-yc cd-esqueleto" aria-hidden="true"></div>');
    return '<div class="cd-grid">' + p.join('') + '</div>';
  }

  function htmlAviso(assunto, res) {
    if (!res || (res.status !== 'invalido' && res.status !== 'inexistente')) return '';
    var oQue = assunto.filtro === 'exercicio' ? 'exercício' : 'categoria';
    var motivo = res.status === 'inexistente' ? 'não existe ' + oQue : 'não é ' + (oQue === 'exercício' ? 'um exercício' : 'uma categoria') + ' válida';
    return '<div class="cd-aviso">' + ICO_ALERTA +
      '<span>O endereço informava <strong>' + esc(res.bruto) + '</strong>, mas ' + motivo +
      ' com esse valor. Exibindo <strong>' + esc(rotuloDe(assunto, res.valor)) + '</strong>.</span></div>';
  }

  function rotuloDe(assunto, valor) {
    var achado = null;
    opcoes(assunto).forEach(function (o) { if (valorDe(assunto, o) === valor) achado = o; });
    if (!achado) return valor;
    return achado.rotulo || achado.exercicio || achado.id;
  }

  function htmlCarregando() {
    return '<div class="cd-carregando"><span class="cd-spinner" aria-hidden="true"></span>' +
      '<span>Carregando documentos…</span></div>';
  }

  function htmlVazio(assunto) {
    var v = assunto.vazio || {};
    return '<div class="cd-empty">' + ICO_DOC_G +
      '<div class="cd-empty-t">' + esc(v.titulo || 'Nenhum documento publicado') + '</div>' +
      (v.descricao ? '<div class="cd-empty-d">' + esc(v.descricao) + '</div>' : '') + '</div>';
  }

  function htmlErro(mensagem) {
    return '<div class="cd-empty cd-erro">' + ICO_ALERTA +
      '<div class="cd-empty-t">Não foi possível carregar os documentos.</div>' +
      '<div class="cd-empty-d">' + esc(mensagem || 'Tente novamente em instantes.') + '</div>' +
      '<button type="button" class="cd-repetir" data-acao="repetir">Tentar novamente</button></div>';
  }

  function htmlDocumento(doc) {
    var sl = selo(doc), mt = meta(doc), tem = !!doc.arquivo;
    var acao = tem
      ? '<a class="cd-ddl" href="' + escAttr(doc.arquivo) + '" download>' + ICO_BAIXAR +
        ' Baixar<span class="cd-sr"> ' + esc(doc.titulo) + '</span></a>'
      : '<span class="cd-ddl-off" aria-disabled="true" title="Arquivo ainda não publicado">Indisponível</span>';
    return '<div class="cd-dr">' +
      '<div class="cd-di">' + ICO_DOC + '</div>' +
      '<div class="cd-dtx"><div class="cd-dn">' + esc(doc.titulo) + '</div>' +
      (mt ? '<div class="cd-dm">' + esc(mt) + '</div>' : '') + '</div>' +
      (sl ? '<span class="cd-db ' + sl.classe + '">' + esc(sl.texto) + '</span>' : '') +
      acao + '</div>';
  }

  function htmlDocumentos(assunto, res) {
    var lista = filtrar(assunto, res.valor);
    var corpo = lista.length
      ? '<div class="cd-dl">' + lista.map(htmlDocumento).join('') + '</div>'
      : htmlVazio(assunto);
    return htmlAviso(assunto, res) + corpo;
  }

  /* Sidebar da familia: uma unica definicao nos dados, em vez de repetir a
     mesma lista em todas as paginas do assunto. Um item {grupo:"..."} vira um
     subtitulo — e assim a hierarquia institucional (ex.: Pro-Gestao) continua
     visivel, sem virar submenu de ano/mes. */
  function htmlSidebar(base, idAtual) {
    var sb = base && base.sidebar;
    if (!sb || !Array.isArray(sb.itens)) return '';
    var linhas = sb.itens.map(function (it) {
      if (it.grupo) {
        /* um grupo pode ser apenas um subtitulo ou tambem um destino proprio
           (caso do Pro-Gestao, que ganhou pagina de entrada na Fase 1.15-7) */
        var titulo = it.href
          ? '<a href="' + escAttr(it.href) + '"' + (it.id === idAtual ? ' class="cur" aria-current="page"' : '') + '>' + esc(it.grupo) + '</a>'
          : esc(it.grupo);
        return '<div class="cd-snav-t" style="margin-top:14px;">' + titulo + '</div>';
      }
      var cur = it.id === idAtual ? ' class="cur"' : '';
      return '<a href="' + escAttr(it.href) + '"' + cur +
        (it.id === idAtual ? ' aria-current="page"' : '') + '>' + esc(it.rotulo) + '</a>';
    }).join('');
    return '<div class="cd-snav"><div class="cd-snav-t">' + esc(sb.titulo) + '</div>' + linhas + '</div>';
  }

  /* Blocos extras: secoes adicionais que a pagina original ja exibia alem da
     consulta principal (ex.: "Versoes anteriores", "Documentos anteriores").
     Sao estaticos e vem dos dados — nada e inventado aqui. */
  function htmlExtras(assunto) {
    var blocos = (assunto && Array.isArray(assunto.blocosExtras)) ? assunto.blocosExtras : [];
    if (!blocos.length) return '';
    return blocos.map(function (b) {
      if (b.tipo === 'ficheiro') {
        /* lista vazia: mantem o rotulo e cai no mesmo estado vazio dos demais
           blocos (htmlVazio le a chave opcional 'vazio' do proprio bloco). */
        var fichs = b.ficheiros || [];
        return '<div class="cd-sl">' + esc(b.rotulo) + '</div>' +
          (fichs.length ? fichs.map(htmlFicheiro).join('') : htmlVazio(b));
      }
      if (b.tipo === 'status') {
        return '<div class="cd-sl">' + esc(b.rotulo) + '</div>' + htmlStatus(b.status || {});
      }
      if (b.tipo === 'cartoes') {
        return '<div class="cd-sl">' + esc(b.rotulo) + '</div>' + htmlCartoes(b.cartoes || []);
      }
      var corpo = (b.documentos && b.documentos.length)
        ? '<div class="cd-dl">' + b.documentos.map(htmlDocumento).join('') + '</div>'
        : '<div class="cd-empty">' + ICO_DOC_G +
          '<div class="cd-empty-t">' + esc((b.vazio && b.vazio.titulo) || 'Nenhum documento publicado') + '</div>' +
          ((b.vazio && b.vazio.descricao) ? '<div class="cd-empty-d">' + esc(b.vazio.descricao) + '</div>' : '') +
          '</div>';
      return '<div class="cd-sl">' + esc(b.rotulo) + '</div>' + corpo;
    }).join('');
  }

  /* rotulo da secao de documentos, com o filtro ativo quando houver */
  function rotuloDocs(assunto, res) {
    var base = assunto.rotuloDocumentos || 'Documentos';
    if (res.status === 'sem-filtro' || res.valor === null) return base;
    return base + ' <span class="cd-ex">' + esc(rotuloDe(assunto, res.valor)) + '</span>';
  }

  /* --------------------------------------------------------------------------
     5. PROVEDOR DE DADOS  (ponto de troca pela FAC)
     ------------------------------------------------------------------------ */

  var BASES = {
    normativos: 'IPREMB_DADOS_NORMATIVOS',
    contabilidade: 'IPREMB_DADOS_CONTABILIDADE',
    investimentos: 'IPREMB_DADOS_INVESTIMENTOS',
    relatorios: 'IPREMB_DADOS_RELATORIOS',
    transparencia: 'IPREMB_DADOS_TRANSPARENCIA'
  };

  function carregarAssunto(familia, idAssunto) {
    return new Promise(function (resolve, reject) {
      var nomeGlobal = BASES[familia];
      var base = nomeGlobal && raiz ? raiz[nomeGlobal] : null;
      if (!base || !Array.isArray(base.assuntos)) {
        reject(new Error('A base de dados de ' + familia + ' não foi encontrada.'));
        return;
      }
      var a = base.assuntos.filter(function (x) { return x.id === idAssunto; })[0];
      if (!a) { reject(new Error('Assunto "' + idAssunto + '" não encontrado.')); return; }
      resolve({ base: base, assunto: a });
    });
  }

  /* --------------------------------------------------------------------------
     6. LIGACAO COM O DOM E HISTORICO  (contrato, secao 4)
     ------------------------------------------------------------------------ */

  function ligar(doc, win) {
    var alvo = doc.querySelector('[data-consulta]');
    if (!alvo) return null;

    var familia = alvo.getAttribute('data-consulta');
    var idAssunto = alvo.getAttribute('data-assunto');
    var elCards = doc.getElementById('cdCards');
    var elDocs = doc.getElementById('cdDocs');
    var elRotFiltro = doc.getElementById('cdRotuloFiltro');
    var elRotDocs = doc.getElementById('cdRotuloDocs');
    var elExtras = doc.getElementById('cdExtras');
    var elSidebar = doc.getElementById('cdSidebar');
    if (!elDocs) return null;

    var temHistory = !!(win.history && typeof win.history.pushState === 'function');
    var assunto = null;

    if (elCards) elCards.innerHTML = htmlCardsCarregando(6);
    elDocs.innerHTML = htmlCarregando();

    function pintar(res) {
      /* innerHTML destroi o card focado (navegacao por teclado); se o foco
         estava dentro de #cdCards, restaura-o no equivalente recem-ativado
         apos a repintura, em vez de deixa-lo cair para o body. */
      var restaurarFoco = elCards && elCards.contains(doc.activeElement);
      if (elCards) elCards.innerHTML = htmlCards(assunto, res.valor, win.location.search);
      elDocs.innerHTML = htmlDocumentos(assunto, res);
      if (elRotFiltro) elRotFiltro.innerHTML = esc(assunto.rotuloFiltro || '');
      if (elRotDocs) elRotDocs.innerHTML = rotuloDocs(assunto, res);
      if (elExtras) elExtras.innerHTML = htmlExtras(assunto);
      if (restaurarFoco) {
        var novoAtivo = elCards.querySelector('a[aria-current="true"]') || elCards.querySelector('a[data-valor]');
        if (novoAtivo) novoAtivo.focus();
      }
    }

    function aplicarDaUrl() {
      var res = resolver(win.location.search, assunto);
      if (res.normalizar && temHistory && res.valor !== null) {
        win.history.replaceState({ valor: res.valor }, '',
          urlDoValor(assunto, res.valor, win.location.search));
      }
      pintar(res);
    }

    function selecionar(valor) {
      if (!existe(assunto, valor)) return;
      if (valor === resolver(win.location.search, assunto).valor) return;
      win.history.pushState({ valor: valor }, '', urlDoValor(assunto, valor, win.location.search));
      aplicarDaUrl();
    }

    if (elCards) {
      elCards.addEventListener('click', function (ev) {
        var a = ev.target && ev.target.closest ? ev.target.closest('a[data-valor]') : null;
        if (!a) return;
        if (!temHistory || ev.defaultPrevented || ev.button !== 0 ||
            ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
        ev.preventDefault();
        selecionar(a.getAttribute('data-valor'));
      });
    }

    elDocs.addEventListener('click', function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest('[data-acao="repetir"]') : null;
      if (b) iniciar();
    });

    win.addEventListener('popstate', function () { if (assunto) aplicarDaUrl(); });

    function iniciar() {
      if (elCards) elCards.innerHTML = htmlCardsCarregando(6);
      elDocs.innerHTML = htmlCarregando();
      carregarAssunto(familia, idAssunto).then(function (r) {
        assunto = r.assunto;
        if (elSidebar) elSidebar.innerHTML = htmlSidebar(r.base, idAssunto);
        aplicarDaUrl();
      })['catch'](function (erro) {
        assunto = null;
        if (elCards) elCards.innerHTML = '';
        elDocs.innerHTML = htmlErro(erro && erro.message);
      });
    }

    iniciar();
    return { recarregar: iniciar, familia: familia, assunto: idAssunto };
  }

  /* --------------------------------------------------------------------------
     Exposicao
     ------------------------------------------------------------------------ */

  API.esc = esc; API.escAttr = escAttr; API.chave = chave;
  API.lerParam = lerParam; API.opcoes = opcoes; API.existe = existe; API.padrao = padrao;
  API.resolver = resolver; API.urlDoValor = urlDoValor;
  API.filtrar = filtrar; API.meta = meta; API.selo = selo; API.rotuloDe = rotuloDe;
  API.htmlCards = htmlCards; API.htmlCardsCarregando = htmlCardsCarregando;
  API.htmlAviso = htmlAviso; API.htmlCarregando = htmlCarregando; API.htmlVazio = htmlVazio;
  API.htmlErro = htmlErro; API.htmlDocumento = htmlDocumento; API.htmlDocumentos = htmlDocumentos;
  API.htmlFicheiro = htmlFicheiro; API.htmlStatus = htmlStatus; API.htmlCartoes = htmlCartoes; API.htmlSidebar = htmlSidebar; API.htmlExtras = htmlExtras; API.rotuloDocs = rotuloDocs; API.carregarAssunto = carregarAssunto; API.ligar = ligar;

  if (raiz) raiz.IPREMB_CONSULTA = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

  if (typeof document !== 'undefined' && raiz) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { ligar(document, raiz); });
    } else {
      ligar(document, raiz);
    }
  }

})(typeof window !== 'undefined' ? window : null);
