/* ============================================================================
   IPREMB — Fonte unica de navegacao e conteudo estrutural
   Fase 1.15-2 (prova controlada na familia piloto).

   CAMADA DE DADOS. Nao contem HTML, CSS nem comportamento.
   Quem transforma isto em markup e o ipremb-layout.js.

   Toda a arvore abaixo foi extraida do proprio piloto (que por sua vez veio da
   pagina original). Nenhum link, rotulo, telefone, endereco ou destino foi
   inventado, renomeado, acrescentado ou removido.

   Antes: a mesma arvore existia DUAS vezes por pagina (menu desktop e menu
   mobile), em dezenas de paginas. Agora existe UMA vez, aqui.

   Ponto de substituicao futuro (FAC): trocar a origem deste objeto por um
   retorno de servico que respeite o mesmo formato. O layout nao muda.
   ========================================================================== */
(function (raiz) {
  'use strict';

  var PORTAL_SEGURADO = 'https://ipremb.mg.gov.br/facServidor/';
  var DIARIO_OFICIAL  = 'https://www.betim.mg.gov.br/portal/diario-oficial';

  var navegacao = {

    /* ---------------------------------------------------------------- marca */
    marca: {
      href: 'index.html',
      logo: 'images/LOGOIPREMB.png',
      alt: 'IPREMB',
      nome: 'IPREMB',
      tagline: 'Instituto de Previdência de Betim'
    },

    /* ------------------------------------------------------ banner superior */
    banner: {
      id: 'alertBanner',
      titulo: 'Informativo:',
      texto: 'Acompanhe os comunicados e atualizações oficiais do IPREMB.',
      link: { rotulo: 'Ver comunicados', href: 'comunicados.html' }
    },

    /* ------------------------------------------------------------- top bar */
    topo: {
      horario: 'Seg–Sex, 9h às 16h30',
      contatos: [
        { tipo: 'telefone', rotulo: '(31) 3594-5380', href: 'tel:+553135945380' },
        { tipo: 'email', rotulo: 'atendimento@ipremb.betim.mg.gov.br',
          href: 'mailto:atendimento@ipremb.betim.mg.gov.br' }
      ],
      links: [
        { rotulo: 'Acesso à Informação', href: 'ouvidoria-acesso-informacao.html' },
        { rotulo: 'LGPD', href: 'instituto-lgpd-privacidade.html' }
      ]
    },

    /* ------------------------------------------------- acao do cabecalho */
    portalSegurado: { rotulo: 'Portal do Segurado', href: PORTAL_SEGURADO },

    /* ==================================================================
       MENU PRINCIPAL — fonte unica de desktop e mobile.

       secao.tipo:
         'dropdown' -> lista simples (desktop) / acordeao (mobile)
         'mega'     -> grade de 2 colunas (desktop) / lista unica (mobile)
         'simples'  -> link direto, sem filhos

       'divisao' existe apenas no tipo 'mega' e diz quantos itens ficam na
       primeira coluna do desktop. O mobile ignora e lista tudo na ordem.
       ================================================================== */
    menu: [
      {
        rotulo: 'Instituto', href: '#', tipo: 'dropdown',
        itens: [
          { rotulo: 'Conselho', href: 'instituto-conselho.html' },
          { rotulo: 'LGPD — Privacidade', href: 'instituto-lgpd-privacidade.html' },
          { rotulo: 'Fotos', href: 'instituto-fotos.html' },
          { rotulo: 'Histórico Previdenciário', href: 'instituto-historico-previdenciario.html' },
          { rotulo: 'Presidência', href: 'instituto-presidencia.html' },
          { rotulo: 'Quem somos', href: 'instituto-quem-somos.html' },
          { rotulo: 'Sede', href: 'instituto-sede.html' }
        ]
      },
      {
        rotulo: 'Serviços', href: 'servicos.html', tipo: 'dropdown',
        itens: [
          { rotulo: 'Empréstimo Consignado IPREMB', href: 'servicos-emprestimo-consignado.html' },
          { rotulo: 'Programa Portas Abertas', href: 'servicos-portas-abertas-cursos.html' },
          { rotulo: 'Alteração de Cadastro e Senha', href: 'servicos-alteracao-de-cadastro-e-senha.html' },
          { rotulo: 'Informe de Rendimentos', href: 'servicos-informe-de-rendimentos.html' },
          { rotulo: 'Diário Oficial', href: DIARIO_OFICIAL, externo: true },
          { rotulo: 'Seleção de Estagiários', href: 'servicos-selecao-de-estagiarios.html' },
          { rotulo: 'Tutoriais IPREMB', href: 'servicos-tutoriais-ipremb.html' }
        ]
      },
      {
        rotulo: 'Previdência', href: '#', tipo: 'dropdown',
        itens: [
          { rotulo: 'Abono de Permanência', href: 'previdencia-abono-de-permanencia.html' },
          { rotulo: 'Acumulação', href: 'previdencia-acumulacao.html' },
          { rotulo: 'Aposentadoria', href: 'previdencia-aposentadoria.html' },
          { rotulo: 'Certidão de Tempo de Contribuição', href: 'previdencia-certidao-de-tempo-de-contribuicao.html' },
          { rotulo: 'Contribuição', href: 'previdencia-contribuicao.html' },
          { rotulo: 'Documentos para abertura de processos', href: 'previdencia-documentos-necessarios.html' },
          { rotulo: 'Estudo Prévio', href: 'previdencia-estudo-previo.html' },
          { rotulo: 'Pensão', href: 'previdencia-pensao.html' }
        ]
      },
      {
        rotulo: 'Transparência', href: '#', tipo: 'dropdown',
        itens: [
          { rotulo: 'Contratos', href: 'transparencia-contratos.html' },
          { rotulo: 'Diárias de Viagem', href: 'transparencia-diarias-de-viagem.html' },
          { rotulo: 'Editais', href: 'transparencia-editais.html' },
          { rotulo: 'Licitações', href: 'transparencia-licitacoes.html' },
          { rotulo: 'Plano de Contratações Anuais', href: 'transparencia-plano-de-contratacoes-anuais.html' },
          /* FASE 1.15-7 — decisao do responsavel pelo projeto:
             Pro-Gestao deixa de ser submenu em cascata e passa a ser um
             DESTINO CLICAVEL proprio. Os tres assuntos continuam como paginas
             independentes, acessados pela pagina de entrada. */
          { rotulo: 'Pró-Gestão', href: 'transparencia-pro-gestao.html' }
        ]
      },
      {
        rotulo: 'Investimentos', href: '#', tipo: 'mega', divisao: 4,
        itens: [
          { rotulo: 'ALM', href: 'investimentos-alm.html' },
          { rotulo: 'Atas Comitê de Investimentos', href: 'investimentos-atas-comite.html' },
          { rotulo: 'Autorização de Aplicação e Resgate', href: 'investimentos-autorizacao-aplicacao-resgate.html' },
          { rotulo: 'Avaliação Atuarial', href: 'investimentos-avaliacao-atuarial.html' },
          { rotulo: 'Certificado de Regularidade Previdenciária', href: 'investimentos-certificado-regularidade.html' },
          { rotulo: 'Composição da Carteira', href: 'investimentos-composicao-da-carteira.html' },
          { rotulo: 'Decretos', href: 'investimentos-decretos.html' },
          { rotulo: 'Política de Investimento', href: 'investimentos-politica-de-investimento.html' },
          { rotulo: 'Procedimento para aplicações financeiras', href: 'investimentos-procedimento-aplicacoes-financeiras.html' }
        ]
      },
      {
        rotulo: 'Normativos', href: '#', tipo: 'mega', divisao: 4,
        itens: [
          { rotulo: 'Decreto', href: 'normativos-decreto.html' },
          { rotulo: 'Demais Legislações', href: 'normativos-demais-legislacoes.html' },
          { rotulo: 'Leis Municipais', href: 'normativos-leis-municipais.html' },
          { rotulo: 'Notas Técnicas', href: 'normativos-notas-tecnicas.html' },
          { rotulo: 'Portarias Administrativas', href: 'normativos-portarias-administrativas.html' },
          { rotulo: 'Portarias de Benefícios', href: 'normativos-portarias-de-beneficios.html' },
          { rotulo: 'Portarias Organizacionais', href: 'normativos-portarias-organizacionais.html' },
          { rotulo: 'Regulamento do Empréstimo Consignado', href: 'normativos-regulamento-emprestimo.html' }
        ]
      },
      {
        rotulo: 'Relatórios', href: '#', tipo: 'mega', divisao: 3,
        itens: [
          { rotulo: 'Outros', href: 'relatorios-outros.html' },
          { rotulo: 'Relatórios de Auditorias', href: 'relatorios-auditorias.html' },
          { rotulo: 'Relatório de Investimentos', href: 'relatorios-investimentos.html' },
          { rotulo: 'Relatório do Crédito Consignado', href: 'relatorios-credito-consignado.html' },
          { rotulo: 'Relatórios Gerenciais', href: 'relatorios-gerenciais.html' },
          { rotulo: 'Relatório de Visitas de Instituições Financeiras', href: 'relatorios-visitas-financeiras.html' }
        ]
      },
      {
        rotulo: 'Contabilidade', href: '#', tipo: 'dropdown',
        itens: [
          { rotulo: 'Balancetes', href: 'contabilidade-balancetes.html' },
          { rotulo: 'Despesas', href: 'contabilidade-despesas.html' },
          { rotulo: 'Receitas', href: 'contabilidade-receitas.html' }
        ]
      },
      {
        rotulo: 'Contato', href: 'contato.html', tipo: 'simples'
      }
    ],

    /* ------------------------------------- atalhos do rodape do menu mobile */
    atalhosMobile: [
      { rotulo: 'Contracheque', href: PORTAL_SEGURADO, externo: true },
      { rotulo: 'Informe IR', href: PORTAL_SEGURADO, externo: true },
      { rotulo: 'Prova de Vida', href: 'servicos-prova-de-vida.html' },
      { rotulo: 'Portal do Segurado', href: PORTAL_SEGURADO, externo: true }
    ],

    /* --------------------------------------------------------------- busca */
    busca: {
      titulo: 'Buscar no site',
      placeholder: 'O que você procura?',
      dica: 'Ex: Contracheque, Prova de Vida, Informe de Rendimentos',
      aviso: 'Utilize o menu de navegação para encontrar o que procura.'
    },

    /* ------------------------------------------------------------ whatsapp */
    whatsapp: {
      href: 'https://api.whatsapp.com/send?phone=5531994509461&text=Ol%C3%A1%2C+gostaria+de+informa%C3%A7%C3%B5es+sobre+o+IPREMB.',
      rotulo: 'Fale conosco pelo WhatsApp'
    },

    /* -------------------------------------------------------------- rodape */
    rodape: {
      nome: 'IPREMB',
      tagline: 'Instituto de Previdência Social do Município de Betim',
      descricao: 'Autarquia municipal responsável por administrar o Regime Próprio de Previdência Social dos servidores públicos efetivos de Betim — MG.',
      social: [
        { rede: 'instagram', href: 'https://www.instagram.com/ipremb.betim.mg/', titulo: 'Instagram do IPREMB' }
      ],
      colunas: [
        {
          titulo: 'O Instituto',
          links: [
            { rotulo: 'Sobre o IPREMB', href: 'instituto-quem-somos.html' },
            { rotulo: 'Estrutura Organizacional', href: 'instituto-quem-somos.html' },
            { rotulo: 'Legislação', href: 'normativos-leis-municipais.html' },
            { rotulo: 'Notícias', href: 'comunicados.html' },
            { rotulo: 'Fale Conosco', href: 'contato.html' }
          ]
        },
        {
          titulo: 'Transparência',
          links: [
            { rotulo: 'Portal da Transparência', href: 'transparencia-contratos.html' },
            { rotulo: 'Licitações', href: 'transparencia-licitacoes.html' },
            { rotulo: 'Contratos', href: 'transparencia-contratos.html' },
            { rotulo: 'Investimentos', href: 'investimentos-politica-de-investimento.html' },
            { rotulo: 'Relatórios Oficiais', href: 'relatorios-gerenciais.html' },
            { rotulo: 'Diário Oficial', href: DIARIO_OFICIAL, externo: true }
          ]
        },
        {
          /* Coluna "Contato": substitui a antiga coluna "Atendimento", cujos
             itens (Portal do Segurado, Contracheque, Informe de Rendimentos,
             Prova de Vida, Ouvidoria, LGPD) ja aparecem no menu principal e na
             faixa de acesso rapido. Nenhum dado novo foi inventado: telefones,
             WhatsApp, e-mail e horario sao os mesmos publicados em contato.html
             e que ja viviam no bloco de contato deste rodape. */
          titulo: 'Contato',
          links: [
            { rotulo: '(31) 3594-5380', href: 'tel:+553135945380' },
            { rotulo: '(31) 3595-7828', href: 'tel:+553135957828' },
            { rotulo: '(31) 9450-9461', href: 'https://api.whatsapp.com/send?phone=5531994509461', externo: true },
            { rotulo: 'atendimento@ipremb.betim.mg.gov.br',
              href: 'mailto:atendimento@ipremb.betim.mg.gov.br',
              classe: 'footer-email' }
          ],
          horario: 'Seg–Sex · 9h às 16h30'
        }
      ],
      creditos: '© 2026 IPREMB — Praça José Lino da Silva, 144, Brasiléia – Betim/MG · CEP 32600-308 · Todos os direitos reservados.',
      linksFinais: [
        { rotulo: 'Privacidade', href: 'instituto-lgpd-privacidade.html' },
        { rotulo: 'LGPD', href: 'instituto-lgpd-privacidade.html' }
      ]
    }
  };

  if (raiz) raiz.IPREMB_NAVEGACAO = navegacao;
  if (typeof module !== 'undefined' && module.exports) module.exports = navegacao;

})(typeof window !== 'undefined' ? window : null);
