/* ============================================================================
   IPREMB — Dados da Galeria de Fotos
   Fase 1.15-3. CAMADA DE DADOS: sem HTML, sem CSS, sem comportamento.

   Todo o conteudo veio das paginas existentes:
     instituto-fotos.html            -> acervo + anos + descricoes
     instituto-fotos-2026.html       -> album de junho/2026 (titulo e contagem)
     instituto-fotos-2026-junho.html -> as 9 fotos efetivamente publicadas

   NADA foi inventado. Anos sem album ficam SEM album (estado vazio legitimo).

   Observacao de acervo: existem 35 arquivos em images/fotos/2026/junho/, mas
   somente 9 estao publicados na pagina. Os outros 26 nao foram incluidos porque
   nenhuma pagina os referencia — incluir seria publicar conteudo por conta
   propria. Ver o relatorio da Fase 1.15-3.

   Ponto de substituicao futuro (FAC): trocar a origem deste objeto.
   ========================================================================== */
(function (raiz) {
  'use strict';

  var PASTA_2026_JUNHO = 'images/fotos/2026/junho/';
  var ALT_2026_JUNHO = 'Atividade institucional IPREMB — Junho 2026';

  function foto(arquivo) {
    return { arquivo: PASTA_2026_JUNHO + arquivo, alt: ALT_2026_JUNHO };
  }

  var dados = {

    /* destaque do catalogo */
    acervo: {
      selo: 'Acervo completo',
      titulo: 'Acervo Fotográfico',
      descricao: 'Acesse o acervo completo de imagens institucionais do IPREMB.',
      acao: 'Ver acervo',
      href: 'instituto-fotos-acervo.html'
    },

    /* anos do catalogo, na ordem em que ja apareciam */
    anos: [
      { ano: '2023', descricao: 'Registros das atividades realizadas no ano de 2023.',
        paginaAntiga: 'instituto-fotos-2023.html' },
      { ano: '2024', descricao: 'Registros das atividades realizadas no ano de 2024.',
        paginaAntiga: 'instituto-fotos-2024.html' },
      { ano: '2025', descricao: 'Registros das atividades realizadas no ano de 2025.',
        paginaAntiga: 'instituto-fotos-2025.html' },
      { ano: '2026', descricao: 'Registros das atividades realizadas no ano de 2026.',
        paginaAntiga: 'instituto-fotos-2026.html' }
    ],

    /* albuns reais. Um album pode ter pagina propria (URL institucional). */
    albuns: [
      {
        id: '2026-junho',
        ano: '2026',
        mes: 'junho',
        mesRotulo: 'Junho 2026',
        titulo: 'Galeria de Junho',
        descricao: null,
        pagina: 'instituto-fotos-2026-junho.html',
        fotos: [
          foto('IMG_3599.JPG.jpeg'),
          foto('IMG_3600.JPG.jpeg'),
          foto('IMG_3601.JPG.jpeg'),
          foto('IMG_3602.JPG.jpeg'),
          foto('IMG_3603.JPG.jpeg'),
          foto('IMG_3604.JPG.jpeg'),
          foto('IMG_3605.JPG.jpeg'),
          foto('IMG_3606.JPG.jpeg'),
          foto('IMG_3620.JPG.jpeg')
        ]
      }
    ]
  };

  if (raiz) raiz.IPREMB_DADOS_GALERIA = dados;
  if (typeof module !== 'undefined' && module.exports) module.exports = dados;

})(typeof window !== 'undefined' ? window : null);
