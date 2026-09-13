/* ============================================================================
   IPREMB — Dados dos Relatorios
   Fase 1.15-6. CAMADA DE DADOS: sem HTML, sem CSS, sem comportamento.

   Extraido das 6 paginas relatorios-*.html.

   Diagnostico desta familia:
     - ASSUNTOS DIFERENTES (preservados como destinos proprios):
         Auditorias, Credito Consignado, Gerenciais, Investimentos,
         Outros, Visitas de Instituicoes Financeiras.
     - Onde a unica variacao era EXERCICIO -> virou filtro (Investimentos,
       Gerenciais, Credito Consignado).
     - Onde a variacao era TIPO -> virou categoria (Auditorias).
     - Onde nao havia recorte temporal -> continua sem filtro (Outros,
       Visitas de Instituicoes Financeiras).
   ========================================================================== */
(function (raiz) {
  'use strict';

  function anos(lista) {
    return lista.map(function (a, i) { return { exercicio: String(a), vigente: i === 0 }; });
  }

  var dados = {
    familia: 'relatorios',
    nome: 'Relatórios',

    /* mesma ordem que a sidebar ja tinha */
    sidebar: {
      titulo: 'Relatórios',
      itens: [
        { rotulo: 'Outros', href: 'relatorios-outros.html', id: 'outros' },
        { rotulo: 'Relatórios de Auditorias', href: 'relatorios-auditorias.html', id: 'auditorias' },
        { rotulo: 'Relatório de Investimentos', href: 'relatorios-investimentos.html', id: 'investimentos' },
        { rotulo: 'Relatório do Crédito Consignado', href: 'relatorios-credito-consignado.html', id: 'credito-consignado' },
        { rotulo: 'Relatórios Gerenciais', href: 'relatorios-gerenciais.html', id: 'gerenciais' },
        { rotulo: 'Relatório de Visitas de Instituições Financeiras', href: 'relatorios-visitas-financeiras.html', id: 'visitas-financeiras' }
      ]
    },

    assuntos: [

      /* --------------------------------------- Auditorias: TIPO vira categoria */
      {
        id: 'auditorias', nome: 'Relatórios de Auditorias',
        filtro: 'categoria', colunas: 4,
        rotuloFiltro: 'Selecione o tipo',
        rotuloDocumentos: 'Documentos recentes',
        categorias: [
          { id: 'auditoria-externa', rotulo: 'Auditoria Externa', descricao: 'Relatórios de auditores externos credenciados', ativo: true },
          { id: 'auditoria-interna', rotulo: 'Auditoria Interna', descricao: 'Relatórios do controle interno do IPREMB' },
          { id: 'avaliacao-atuarial', rotulo: 'Avaliação Atuarial', descricao: 'Relatórios atuariais periódicos' },
          { id: 'quadrimestrais', rotulo: 'Quadrimestrais', descricao: 'Relatórios de acompanhamento quadrimestral' }
        ],
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Selecione uma categoria acima para visualizar os relatórios correspondentes.'
        }
      },

      /* -------------------------------------------------- Credito Consignado */
      {
        id: 'credito-consignado', nome: 'Relatório do Crédito Consignado',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o período',
        rotuloDocumentos: 'Documentos',
        exercicios: anos([2026, 2025]),
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os relatórios do crédito consignado do exercício corrente serão publicados conforme disponibilidade.'
        },
        blocosExtras: [
          {
            rotulo: 'Análise especial', tipo: 'cartoes',
            cartoes: [
              { rotulo: 'Análise Evolução Consignado 2023 – 2025',
                descricao: 'Estudo comparativo multianual', href: null }
            ]
          }
        ]
      },

      /* ------------------------------------------------------- Gerenciais */
      {
        id: 'gerenciais', nome: 'Relatórios Gerenciais',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o ano',
        rotuloDocumentos: 'Documentos recentes',
        /* o card ativo dizia "Recente", nao "Vigente" */
        exercicios: [2024, 2023, 2022, 2021, 2020, 2019].map(function (a) {
          return { exercicio: String(a), vigente: false };
        }),
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Selecione um ano ou categoria para visualizar os relatórios gerenciais correspondentes.'
        },
        blocosExtras: [
          {
            rotulo: 'Relatórios anuais', tipo: 'cartoes',
            cartoes: [
              { rotulo: 'Relatórios Anuais', descricao: 'Consolidados anuais de gestão', href: null }
            ]
          }
        ]
      },

      /* --------------------------------------------- Relatorio de Investimentos */
      {
        id: 'investimentos', nome: 'Relatório de Investimentos',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o ano',
        rotuloDocumentos: 'Relatórios',
        exercicios: anos([2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016]),
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os relatórios de investimentos do exercício corrente serão publicados conforme disponibilidade.'
        }
      },

      /* ----------------------------------------------------------- Outros */
      {
        id: 'outros', nome: 'Outros Relatórios',
        filtro: 'nenhum',
        rotuloDocumentos: 'Arquivos anexos',
        documentos: [
        ],
        vazio: { titulo: 'Nenhum documento publicado', descricao: null }
      },

      /* --------------------------------------------------- Visitas Financeiras */
      {
        id: 'visitas-financeiras', nome: 'Relatório de Visitas de Instituições Financeiras',
        filtro: 'nenhum',
        rotuloDocumentos: 'Documentos publicados',
        documentos: [],
        vazio: { titulo: 'Nenhum documento publicado', descricao: null }
        /* O bloco extra "Documentos anteriores" foi retirado enquanto nao ha
           nenhum documento publicado: com as duas listas vazias a pagina
           exibia dois estados vazios identicos e consecutivos. Para voltar a
           exibi-lo quando houver acervo, basta restaurar:

           blocosExtras: [
             { rotulo: 'Documentos anteriores', documentos: [ ...docs... ],
               vazio: { titulo: 'Nenhum documento publicado', descricao: null } }
           ]

           htmlExtras() em ipremb-consulta.js ja trata a chave; nada no motor
           precisou mudar. Vale so para este assunto. */
      }
    ]
  };

  if (raiz) raiz.IPREMB_DADOS_RELATORIOS = dados;
  if (typeof module !== 'undefined' && module.exports) module.exports = dados;

})(typeof window !== 'undefined' ? window : null);
