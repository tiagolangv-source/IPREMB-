/* ============================================================================
   IPREMB — Dados da consulta documental: Avaliacao Atuarial
   Fase 1.15-1 (piloto). Contrato definido em FASE_1_15_0_CONTRATOS_E_REGRAS.md

   CAMADA DE DADOS. Este arquivo NAO contem HTML, CSS, classes, icones nem
   qualquer texto de interface. Somente conteudo.

   Todo o conteudo abaixo foi extraido de investimentos-avaliacao-atuarial.html
   (checkpoint 1aafad2). Nada foi inventado. Campo sem dado real fica null.

   Ponto de substituicao futuro (FAC): o consumidor le apenas este objeto.
   Trocar a origem = devolver o mesmo formato. O layout nao muda.
   ========================================================================== */
(function (raiz) {
  'use strict';

  var dados = {

    assunto: {
      id: 'avaliacao-atuarial',
      nome: 'Avaliação Atuarial',
      /* null => aplica-se a regra 3.2: usa o exercicio vigente */
      exercicioPadrao: null
    },

    /* Os 10 exercicios que ja existiam como cards na pagina original.
       2025 era o unico com a classe "act" / rotulo "Vigente". */
    exercicios: [
      { exercicio: '2025', vigente: true,  rotulo: null },
      { exercicio: '2024', vigente: false, rotulo: null },
      { exercicio: '2023', vigente: false, rotulo: null },
      { exercicio: '2022', vigente: false, rotulo: null },
      { exercicio: '2021', vigente: false, rotulo: null },
      { exercicio: '2020', vigente: false, rotulo: null },
      { exercicio: '2019', vigente: false, rotulo: null },
      { exercicio: '2018', vigente: false, rotulo: null },
      { exercicio: '2017', vigente: false, rotulo: null },
      { exercicio: '2016', vigente: false, rotulo: null }
    ],

    /* Os 2 unicos documentos existentes na pagina original.
       arquivo: null  -> na pagina original o href era "#", ou seja, nao ha
                         arquivo real publicado no repositorio. Ver regra 2.4.2. */
    documentos: [
      {
        id: 'aa-2024',
        assunto: 'avaliacao-atuarial',
        exercicio: '2024',
        titulo: 'Avaliação Atuarial — Exercício 2024',
        arquivo: null,
        tipo: 'relatorio',
        dataDocumento: null,
        dataPublicacao: '2024',
        descricao: 'Atuário habilitado',
        situacao: 'vigente'
      },
      {
        id: 'aa-2023',
        assunto: 'avaliacao-atuarial',
        exercicio: '2023',
        titulo: 'Avaliação Atuarial — Exercício 2023',
        arquivo: null,
        tipo: 'relatorio',
        dataDocumento: null,
        dataPublicacao: '2023',
        descricao: null,
        situacao: 'anterior'
      }
    ]
  };

  if (raiz) raiz.IPREMB_DADOS_AVALIACAO_ATUARIAL = dados;
  if (typeof module !== 'undefined' && module.exports) module.exports = dados;

})(typeof window !== 'undefined' ? window : null);
