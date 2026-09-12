/* ============================================================================
   IPREMB — Dados de Investimentos
   Fase 1.15-6. CAMADA DE DADOS: sem HTML, sem CSS, sem comportamento.

   Extraido das 9 paginas investimentos-*.html. Exercicios, documentos, selos,
   metadados e textos de estado vazio sao os que ja estavam publicados.

   Os 9 assuntos continuam sendo DESTINOS PROPRIOS. O que deixou de crescer e o
   HTML por exercicio: onde a unica variacao era o ano, ele virou filtro.

   DECRETOS (Investimentos) permanece assunto proprio, distinto de
   Decreto (Normativos) — decisao fechada, nao consolidar.

   A Avaliacao Atuarial e a referencia desta arquitetura (piloto aprovado).
   ========================================================================== */
(function (raiz) {
  'use strict';

  function anos(lista) {
    return lista.map(function (a, i) {
      return { exercicio: String(a), vigente: i === 0 };
    });
  }

  var dados = {
    familia: 'investimentos',
    nome: 'Investimentos',

    sidebar: {
      titulo: 'Investimentos',
      itens: [
        { rotulo: 'ALM', href: 'investimentos-alm.html', id: 'alm' },
        { rotulo: 'Atas Comitê de Investimentos', href: 'investimentos-atas-comite.html', id: 'atas-comite' },
        { rotulo: 'Autorização de Aplicação e Resgate', href: 'investimentos-autorizacao-aplicacao-resgate.html', id: 'autorizacao-aplicacao-resgate' },
        { rotulo: 'Avaliação Atuarial', href: 'investimentos-avaliacao-atuarial.html', id: 'avaliacao-atuarial' },
        { rotulo: 'Certificado de Regularidade Previdenciária', href: 'investimentos-certificado-regularidade.html', id: 'certificado-regularidade' },
        { rotulo: 'Composição da Carteira', href: 'investimentos-composicao-da-carteira.html', id: 'composicao-da-carteira' },
        { rotulo: 'Decretos', href: 'investimentos-decretos.html', id: 'decretos' },
        { rotulo: 'Política de Investimento', href: 'investimentos-politica-de-investimento.html', id: 'politica-de-investimento' },
        { rotulo: 'Procedimento para aplicações financeiras', href: 'investimentos-procedimento-aplicacoes-financeiras.html', id: 'procedimento-aplicacoes-financeiras' }
      ]
    },

    assuntos: [

      /* ------------------------------------------------------------- ALM
         Arquivo unico, sem recorte temporal: continua sem filtro. */
      {
        id: 'alm', nome: 'ALM',
        filtro: 'nenhum',
        rotuloDocumentos: 'Arquivos ALM',
        documentos: [],
        vazio: { titulo: 'Nenhum documento publicado', descricao: null }
      },

      /* ------------------------------------------ Atas Comite de Investimentos */
      {
        id: 'atas-comite', nome: 'Atas do Comitê de Investimentos',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o ano',
        rotuloDocumentos: 'Atas',
        exercicios: anos([2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014]),
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'As atas das reuniões serão publicadas após aprovação em assembleia.'
        }
      },

      /* ----------------------------------- Autorizacao de Aplicacao e Resgate */
      {
        id: 'autorizacao-aplicacao-resgate', nome: 'Autorização de Aplicação e Resgate',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o ano',
        rotuloDocumentos: 'APR',
        exercicios: anos([2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2016]),
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'As autorizações do exercício corrente serão publicadas conforme disponibilidade.'
        }
      },

      /* --------------------------------------------------- Avaliacao Atuarial
         Assunto piloto. Mesmos dados de dados-avaliacao-atuarial.js. */
      {
        id: 'avaliacao-atuarial', nome: 'Avaliação Atuarial',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o ano',
        rotuloDocumentos: 'Documentos disponíveis',
        exercicios: anos([2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016]),
        documentos: [
        ],
        vazio: {
          titulo: 'Nenhum documento disponível',
          descricao: 'Selecione outro exercício na lista acima.'
        }
      },

      /* -------------------------- Certificado de Regularidade Previdenciaria */
      {
        id: 'certificado-regularidade', nome: 'Certificado de Regularidade Previdenciária',
        filtro: 'nenhum',
        rotuloDocumentos: 'Certificados emitidos',
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os certificados de regularidade previdenciária serão publicados após emissão pelo Ministério da Previdência Social.'
        },
        blocosExtras: [
          {
            rotulo: 'Status atual', tipo: 'status',
            status: {
              estado: 'pendente',
              titulo: 'CRP — Aguardando publicação',
              descricao: 'O certificado será publicado após emissão pelo Ministério da Previdência Social.'
            }
          }
        ]
      },

      /* ------------------------------------------------ Composicao da Carteira */
      {
        id: 'composicao-da-carteira', nome: 'Composição da Carteira',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o exercício',
        rotuloDocumentos: 'Relatórios',
        exercicios: anos([2025, 2024]),
        documentos: [
        ],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os relatórios do exercício selecionado serão publicados conforme disponibilidade.'
        }
      },

      /* ----------------------------------------- Decretos (assunto proprio) */
      {
        id: 'decretos', nome: 'Decretos',
        filtro: 'nenhum',
        rotuloDocumentos: 'Decretos publicados',
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os decretos relacionados aos investimentos serão listados conforme publicação oficial.'
        }
      },

      /* ---------------------------------------------- Politica de Investimento */
      {
        id: 'politica-de-investimento', nome: 'Política de Investimento',
        filtro: 'nenhum',
        rotuloDocumentos: 'Documentos disponíveis',
        documentos: [
        ],
        vazio: { titulo: 'Nenhum documento publicado', descricao: null }
      },

      /* ------------------------- Procedimento para aplicacoes financeiras */
      {
        id: 'procedimento-aplicacoes-financeiras', nome: 'Procedimento para aplicações financeiras',
        filtro: 'nenhum',
        rotuloDocumentos: 'Procedimento para aplicações financeiras',
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os atos que disciplinam o procedimento para aplicações financeiras serão disponibilizados nesta seção conforme publicação oficial.'
        }
      }
    ]
  };

  if (raiz) raiz.IPREMB_DADOS_INVESTIMENTOS = dados;
  if (typeof module !== 'undefined' && module.exports) module.exports = dados;

})(typeof window !== 'undefined' ? window : null);
