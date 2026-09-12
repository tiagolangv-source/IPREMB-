/* ============================================================================
   IPREMB — Dados da Contabilidade
   Fase 1.15-5. CAMADA DE DADOS: sem HTML, sem CSS, sem comportamento.

   Extraido das 3 paginas contabilidade-*.html. Os tres assuntos tinham
   exatamente os mesmos exercicios (2022..2017) e o mesmo texto de estado
   vazio — o que mudava entre eles era so o assunto contabil.

   DECISAO: Balancetes, Despesas e Receitas sao assuntos contabeis DISTINTOS e
   continuam como destinos proprios. Nao foram unificados: reduzir arquivos
   nao justifica misturar consultas contabeis diferentes.

   O que deixou de crescer e o HTML por exercicio/competencia: um novo
   exercicio, uma nova competencia ou um novo documento entram como DADO.

   Contrato de documento previsto para esta familia:
     exercicio, competencia (mes), tipo, titulo, dataPublicacao, situacao,
     arquivo. Nenhum documento esta publicado hoje — nada foi inventado.
   ========================================================================== */
(function (raiz) {
  'use strict';

  /* Os mesmos exercicios que as tres paginas ja exibiam, na mesma ordem.
     O primeiro (2022) era o card marcado como ativo — "Recente", nao
     "Vigente": por isso nenhum exercicio e marcado como vigente aqui. */
  function exerciciosContabeis() {
    return [2022, 2021, 2020, 2019, 2018, 2017].map(function (a) {
      return { exercicio: String(a), vigente: false };
    });
  }

  var VAZIO = {
    titulo: 'Nenhum documento publicado',
    descricao: 'Os demonstrativos serão publicados mensalmente conforme disponibilidade.'
  };

  function assunto(id, nome) {
    return {
      id: id,
      nome: nome,
      filtro: 'exercicio',
      rotuloFiltro: 'Selecione o ano',
      rotuloDocumentos: 'Documentos do ano selecionado',
      exercicios: exerciciosContabeis(),
      documentos: [],
      vazio: VAZIO
    };
  }

  var dados = {
    familia: 'contabilidade',
    nome: 'Contabilidade',

    sidebar: {
      titulo: 'Contabilidade',
      itens: [
        { rotulo: 'Balancetes', href: 'contabilidade-balancetes.html', id: 'balancetes' },
        { rotulo: 'Despesas', href: 'contabilidade-despesas.html', id: 'despesas' },
        { rotulo: 'Receitas', href: 'contabilidade-receitas.html', id: 'receitas' }
      ]
    },

    /* tres assuntos contabeis distintos, preservados */
    assuntos: [
      assunto('balancetes', 'Balancetes'),
      assunto('despesas', 'Despesas'),
      assunto('receitas', 'Receitas')
    ]
  };

  if (raiz) raiz.IPREMB_DADOS_CONTABILIDADE = dados;
  if (typeof module !== 'undefined' && module.exports) module.exports = dados;

})(typeof window !== 'undefined' ? window : null);
