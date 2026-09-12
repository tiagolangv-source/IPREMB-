/* ============================================================================
   IPREMB — Dados da Transparencia
   Fase 1.15-6. CAMADA DE DADOS: sem HTML, sem CSS, sem comportamento.

   Extraido das 8 paginas transparencia-*.html.

   HIERARQUIA INSTITUCIONAL PRESERVADA:
     Transparencia > Pro-Gestao > Manuais | Mapeamentos dos Processos |
     Comite de Etica  — esta hierarquia representa assuntos reais e continua
     existindo, tanto no menu quanto na sidebar (item {grupo:"Pró-Gestão"}).
     O que foi eliminado da navegacao foi apenas o crescimento por ANO.

   O texto institucional das paginas do Pro-Gestao (paragrafos e composicao do
   Comite) NAO esta aqui: e conteudo proprio daquelas paginas e permanece no
   HTML delas, preservado integralmente.
   ========================================================================== */
(function (raiz) {
  'use strict';

  function anos(lista) {
    return lista.map(function (a, i) { return { exercicio: String(a), vigente: i === 0 }; });
  }

  var dados = {
    familia: 'transparencia',
    nome: 'Transparência',

    sidebar: {
      titulo: 'Transparência',
      itens: [
        { rotulo: 'Contratos', href: 'transparencia-contratos.html', id: 'contratos' },
        { rotulo: 'Diárias de Viagem', href: 'transparencia-diarias-de-viagem.html', id: 'diarias-de-viagem' },
        { rotulo: 'Editais', href: 'transparencia-editais.html', id: 'editais' },
        { rotulo: 'Licitações', href: 'transparencia-licitacoes.html', id: 'licitacoes' },
        { rotulo: 'Plano de Contratações Anuais', href: 'transparencia-plano-de-contratacoes-anuais.html', id: 'plano-de-contratacoes-anuais' },
        /* hierarquia institucional real — preservada */
        { grupo: 'Pró-Gestão', href: 'transparencia-pro-gestao.html', id: 'pro-gestao' },
        { rotulo: 'Manuais', href: 'transparencia-pro-gestao-manuais.html', id: 'pro-gestao-manuais' },
        { rotulo: 'Mapeamentos dos Processos', href: 'transparencia-pro-gestao-mapeamento-de-processos.html', id: 'pro-gestao-mapeamento-de-processos' },
        { rotulo: 'Comitê de Ética', href: 'transparencia-pro-gestao-comite-de-etica.html', id: 'pro-gestao-comite-de-etica' }
      ]
    },

    assuntos: [

      /* ------------------------------------------------------- Contratos */
      {
        id: 'contratos', nome: 'Contratos',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o ano',
        rotuloDocumentos: 'Contratos',
        exercicios: anos([2025, 2024, 2023, 2022]),
        documentos: [
          { id: 'ct-2025', titulo: 'Contratos serão publicados conforme vigência',
            tipo: 'contrato', exercicio: '2025', mes: null, numero: null,
            dataAto: null, dataPublicacao: null,
            situacao: 'Vigente', seloClasse: 'vig',
            meta: 'Publicação em conformidade com a Lei de Acesso à Informação', arquivo: null }
        ],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os contratos do exercício selecionado serão publicados conforme vigência.'
        }
      },

      /* ------------------------------------------------ Diarias de Viagem */
      {
        id: 'diarias-de-viagem', nome: 'Diárias de Viagem',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o ano',
        rotuloDocumentos: 'Diárias',
        exercicios: anos([2025, 2024, 2023, 2022]),
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os registros de diárias de viagem serão publicados conforme disponibilidade.'
        }
      },

      /* ---------------------------------------------------------- Editais */
      {
        id: 'editais', nome: 'Editais',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o ano',
        rotuloDocumentos: 'Editais',
        exercicios: anos([2025, 2024, 2021, 2020]),
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os editais serão publicados aqui conforme abertura dos processos.'
        }
      },

      /* ------------------------------------------------------- Licitacoes */
      {
        id: 'licitacoes', nome: 'Licitações',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o ano',
        rotuloDocumentos: 'Licitações — Em andamento',
        exercicios: anos([2025, 2024, 2023, 2022, 2021, 2020]),
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Nenhuma licitação em andamento no momento. Os processos serão publicados conforme abertura.'
        },
        blocosExtras: [
          {
            rotulo: 'Licitações — Encerradas',
            documentos: [],
            vazio: {
              titulo: 'Nenhum documento publicado',
              descricao: 'O histórico de licitações encerradas será publicado em breve.'
            }
          }
        ]
      },

      /* ------------------------------------- Plano de Contratacoes Anuais */
      {
        id: 'plano-de-contratacoes-anuais', nome: 'Plano de Contratações Anuais',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o exercício',
        rotuloDocumentos: 'Documentos disponíveis',
        exercicios: anos([2026, 2025, 2024]),
        documentos: [
          { id: 'pca-2025', titulo: 'Plano de Contratações Anuais — 2025',
            tipo: 'plano', exercicio: '2025', mes: null, numero: null,
            dataAto: null, dataPublicacao: null,
            situacao: 'Vigente', seloClasse: 'vig',
            meta: 'Publicado conforme Lei nº 14.133/2021', arquivo: null },
          { id: 'pca-2024', titulo: 'Plano de Contratações Anuais — 2024',
            tipo: 'plano', exercicio: '2024', mes: null, numero: null,
            dataAto: null, dataPublicacao: null,
            situacao: 'Encerrado', seloClasse: 'enc',
            meta: 'Exercício encerrado', arquivo: null }
        ],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os planos de contratações do exercício selecionado serão publicados conforme disponibilidade.'
        }
      },

      /* --------------------------------- Pro-Gestao (hierarquia real) --- */
      {
        id: 'pro-gestao-manuais', nome: 'Manuais',
        filtro: 'nenhum',
        rotuloDocumentos: 'Manuais',
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os manuais do Pró-Gestão serão disponibilizados nesta seção conforme publicação oficial.'
        }
      },
      {
        id: 'pro-gestao-mapeamento-de-processos', nome: 'Mapeamentos dos Processos',
        filtro: 'nenhum',
        rotuloDocumentos: 'Mapeamentos dos Processos',
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os mapeamentos dos processos serão disponibilizados nesta seção conforme publicação oficial.'
        }
      },
      {
        id: 'pro-gestao-comite-de-etica', nome: 'Comitê de Ética',
        filtro: 'nenhum',
        rotuloDocumentos: 'Comitê de Ética',
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os documentos do Comitê de Ética serão disponibilizados nesta seção conforme publicação oficial.'
        }
      }
    ]
  };

  if (raiz) raiz.IPREMB_DADOS_TRANSPARENCIA = dados;
  if (typeof module !== 'undefined' && module.exports) module.exports = dados;

})(typeof window !== 'undefined' ? window : null);
