/* ============================================================================
   IPREMB — Dados dos Normativos
   Fase 1.15-4. CAMADA DE DADOS: sem HTML, sem CSS, sem comportamento.

   Extraido das 8 paginas existentes de normativos-*.html. Anos, categorias,
   documentos, selos e textos de estado vazio sao exatamente os que ja estavam
   publicados. Nada foi inventado, renomeado ou acrescentado.

   ASSUNTOS PRESERVADOS COMO DESTINOS PROPRIOS (decisao fechada):
     Portarias Administrativas, Portarias de Beneficios e Portarias
     Organizacionais continuam separadas. Nomeacao, Exoneracao, Concessao,
     Cassacao e Suspensao passaram a ser CATEGORIAS (filtro), nao paginas.

   Campos previstos pelo contrato da Fase 1.15-4 — numero, tipo, categoria,
   exercicio, mes, dataAto, dataPublicacao, situacao, vigencia, revogacao,
   arquivo, titulo. Campo sem dado real fica ausente/null: nao se inventa.

   Ponto de substituicao futuro (FAC): trocar a origem deste objeto.
   ========================================================================== */
(function (raiz) {
  'use strict';

  /* helper: lista de exercicios a partir dos anos que a pagina ja exibia.
     O primeiro da lista era o que estava marcado como ativo/vigente. */
  function anos(lista, vigente) {
    return lista.map(function (a) {
      return { exercicio: String(a), vigente: String(a) === String(vigente) };
    });
  }

  var dados = {
    familia: 'normativos',
    nome: 'Normativos',

    /* sidebar da familia — os mesmos 8 destinos de antes, na mesma ordem */
    sidebar: {
      titulo: 'Normativos',
      itens: [
        { rotulo: 'Decreto', href: 'normativos-decreto.html', id: 'decreto' },
        { rotulo: 'Demais Legislações', href: 'normativos-demais-legislacoes.html', id: 'demais-legislacoes' },
        { rotulo: 'Leis Municipais', href: 'normativos-leis-municipais.html', id: 'leis-municipais' },
        { rotulo: 'Notas Técnicas', href: 'normativos-notas-tecnicas.html', id: 'notas-tecnicas' },
        { rotulo: 'Portarias Administrativas', href: 'normativos-portarias-administrativas.html', id: 'portarias-administrativas' },
        { rotulo: 'Portarias de Benefícios', href: 'normativos-portarias-de-beneficios.html', id: 'portarias-de-beneficios' },
        { rotulo: 'Portarias Organizacionais', href: 'normativos-portarias-organizacionais.html', id: 'portarias-organizacionais' },
        { rotulo: 'Regulamento do Empréstimo Consignado', href: 'normativos-regulamento-emprestimo.html', id: 'regulamento-emprestimo' }
      ]
    },

    assuntos: [

      /* ---------------------------------------------------------- Decreto */
      {
        id: 'decreto',
        nome: 'Decreto',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o ano',
        rotuloDocumentos: 'Decretos',
        exercicios: anos([2021, 2020, 2019, 2018, 2017, 2016, 2014, 2013, 2010], 2021),
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Os decretos do exercício selecionado serão listados aqui após publicação.'
        }
      },

      /* ---------------------------------------------- Demais Legislacoes */
      {
        id: 'demais-legislacoes',
        nome: 'Demais Legislações',
        /* assunto proprio, sem recorte temporal: decisao fechada */
        filtro: 'nenhum',
        rotuloDocumentos: 'Documentos publicados',
        documentos: [
        ],
        vazio: { titulo: 'Nenhum documento publicado', descricao: null }
      },

      /* -------------------------------------------------- Leis Municipais */
      {
        id: 'leis-municipais',
        nome: 'Leis Municipais',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o ano',
        rotuloDocumentos: 'Leis',
        exercicios: anos([2021, 2020, 2019, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2007, 2006, 2005, 2000, 1990], 2021),
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'As leis municipais do exercício selecionado serão listadas após publicação.'
        }
      },

      /* --------------------------------------------------- Notas Tecnicas */
      {
        id: 'notas-tecnicas',
        nome: 'Notas Técnicas',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o ano',
        rotuloDocumentos: 'Notas Técnicas',
        exercicios: anos([2019], 2019),
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'As notas técnicas do exercício selecionado serão listadas após publicação.'
        }
      },

      /* ---------------------------------------- Portarias Administrativas */
      {
        id: 'portarias-administrativas',
        nome: 'Portarias Administrativas',
        filtro: 'categoria',
        colunas: 2,
        rotuloFiltro: 'Selecione a categoria',
        rotuloDocumentos: 'Documentos',
        categorias: [
          { id: 'exoneracao', rotulo: 'Exoneração', descricao: 'Atos de exoneração de cargos', ativo: true },
          { id: 'nomeacao', rotulo: 'Nomeação', descricao: 'Atos de nomeação de cargos' }
        ],
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Selecione uma categoria acima para visualizar as portarias correspondentes.'
        }
      },

      /* ------------------------------------------ Portarias de Beneficios */
      {
        id: 'portarias-de-beneficios',
        nome: 'Portarias de Benefícios',
        filtro: 'categoria',
        colunas: 3,
        rotuloFiltro: 'Selecione a categoria',
        rotuloDocumentos: 'Documentos',
        categorias: [
          { id: 'concessao', rotulo: 'Concessão', descricao: 'Portarias de concessão de benefícios', ativo: true },
          { id: 'cassacao', rotulo: 'Cassação', descricao: 'Portarias de cassação de benefícios' },
          { id: 'suspensao', rotulo: 'Suspensão', descricao: 'Portarias de suspensão de benefícios' }
        ],
        /* tipoBeneficio (Aposentadoria/Pensao) esta previsto no contrato como
           campo do documento. Nenhum documento publicado hoje o declara, entao
           nenhum valor foi inventado. */
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'Selecione uma categoria acima para visualizar as portarias correspondentes.'
        }
      },

      /* ---------------------------------------- Portarias Organizacionais */
      {
        id: 'portarias-organizacionais',
        nome: 'Portarias Organizacionais',
        filtro: 'exercicio',
        rotuloFiltro: 'Selecione o ano',
        rotuloDocumentos: 'Portarias Organizacionais',
        exercicios: anos([2022, 2021, 2020], 2022),
        documentos: [],
        vazio: {
          titulo: 'Nenhum documento publicado',
          descricao: 'As portarias do exercício selecionado serão listadas após publicação.'
        }
      },

      /* ------------------------------- Regulamento do Emprestimo Consignado */
      {
        id: 'regulamento-emprestimo',
        nome: 'Regulamento do Empréstimo Consignado',
        filtro: 'nenhum',
        rotuloDocumentos: 'Documentos publicados',
        documentos: [
        ],
        vazio: { titulo: 'Nenhum documento publicado', descricao: null },
        blocosExtras: [
          {
            rotulo: 'Versões anteriores',
            documentos: [],
            vazio: {
              titulo: 'Nenhum documento publicado',
              descricao: 'Versões anteriores do regulamento serão listadas aqui.'
            }
          }
        ]
      }
    ]
  };

  if (raiz) raiz.IPREMB_DADOS_NORMATIVOS = dados;
  if (typeof module !== 'undefined' && module.exports) module.exports = dados;

})(typeof window !== 'undefined' ? window : null);
