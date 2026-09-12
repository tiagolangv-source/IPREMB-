/* ============================================================================
   IPREMB — Dados da Ouvidoria
   Fase 1.15-7. CAMADA DE DADOS: sem CSS e sem comportamento.

   Reune o que estava repetido nas paginas da Ouvidoria:

     - perguntasFrequentes: as 10 perguntas e respostas de ouvidoria-faq.html,
       copiadas VERBATIM. As respostas contem marcacao institucional propria
       (<strong>, links de e-mail) e por isso sao guardadas como HTML confiavel
       vindo do proprio projeto — nao ha conteudo de terceiros aqui.

     - manifestacoes: os 6 fluxos de formulario. O diagnostico mostrou que os 6
       formularios eram ESTRUTURALMENTE IDENTICOS: mesmos 4 blocos, mesmos 10
       campos, mesmos rotulos, mesmos botoes. A UNICA diferenca era o valor do
       campo "Categoria da manifestação". Por isso cada fluxo continua com
       pagina e URL proprias — o fluxo segue identificavel —, mas a estrutura
       passa a vir de um modelo unico.

   IMPORTANTE: os formularios sao FRONTEND DEMONSTRATIVO. Nao ha envio, API,
   banco, SMTP, captcha nem persistencia. O <form> mantem onsubmit="return false;",
   exatamente como ja estava publicado.
   ========================================================================== */
(function (raiz) {
  'use strict';

  var dados = {

    /* ------------------------------------------------ perguntas frequentes */
    perguntasFrequentes: [
      { pergunta: 'O que é a Ouvidoria do IPREMB?',
        resposta: 'A Ouvidoria do IPREMB é um canal institucional destinado a receber e encaminhar manifestações de segurados, servidores e cidadãos em geral, como reclamações, sugestões, elogios, denúncias e solicitações de informação, contribuindo para a melhoria contínua dos serviços prestados pelo Instituto.' },
      { pergunta: 'Quem pode registrar uma manifestação?',
        resposta: 'Qualquer pessoa pode registrar uma manifestação na Ouvidoria do IPREMB: segurados, servidores públicos municipais, familiares ou qualquer cidadão que tenha interesse legítimo em algum serviço ou ação do Instituto.' },
      { pergunta: 'Posso fazer uma manifestação anônima?',
        resposta: 'Sim. É possível registrar manifestações de forma anônima. Nesse caso, o IPREMB não poderá enviar uma resposta individual ao manifestante, mas a manifestação será registrada e poderá ser analisada internamente conforme os procedimentos aplicáveis.' },
      { pergunta: 'Quais tipos de manifestação posso registrar?',
        resposta: 'A Ouvidoria do IPREMB recebe os seguintes tipos de manifestação: <strong>Reclamação</strong> — insatisfação com serviços ou atendimento; <strong>Sugestão</strong> — proposta de melhoria; <strong>Elogio</strong> — reconhecimento de boas práticas; <strong>Denúncia</strong> — relato de irregularidade ou assédio; <strong>Solicitação</strong> — pedido de providência ou informação; <strong>Acesso à Informação</strong> — pedido de documentos ou dados públicos com base na LAI.' },
      { pergunta: 'Como posso entrar em contato com a Ouvidoria?',
        resposta: 'O canal eletrônico está em implantação. Enquanto isso, você pode enviar sua manifestação pelo e-mail <a href="mailto:ouvidoria@ipremb.mg.gov.br">ouvidoria@ipremb.mg.gov.br</a> ou pelo telefone <a href="tel:+553135958607">(31) 3595-8607</a>, de segunda a sexta-feira, das 9h às 16h30. Também é possível comparecer presencialmente à sede do IPREMB.' },
      { pergunta: 'Qual o prazo para resposta?',
        resposta: 'O IPREMB observa os prazos legais e procedimentos aplicáveis a cada tipo de manifestação. Em pedidos de acesso à informação, os prazos seguem a Lei de Acesso à Informação e demais normas aplicáveis.' },
      { pergunta: 'Como acompanho minha manifestação?',
        resposta: 'O sistema de acompanhamento eletrônico de manifestações está em implantação. Caso tenha registrado sua manifestação por e-mail ou telefone, você poderá acompanhar o andamento entrando em contato diretamente com a Ouvidoria pelos mesmos canais utilizados no registro.' },
      { pergunta: 'Meus dados pessoais estão protegidos?',
        resposta: 'Sim. O IPREMB trata as informações pessoais fornecidas à Ouvidoria com sigilo e em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Os dados são utilizados exclusivamente para fins de análise e resposta à manifestação registrada.' },
      { pergunta: 'O que é a Lei de Acesso à Informação?',
        resposta: 'A Lei de Acesso à Informação (Lei Federal nº 12.527/2011) assegura a qualquer pessoa o direito de solicitar informações e documentos públicos de órgãos e entidades da administração pública, sem necessidade de justificativa. O IPREMB, como autarquia municipal, observa os procedimentos legais aplicáveis. Para saber mais, acesse a <a href="ouvidoria-acesso-informacao.html">página de Acesso à Informação</a>.' },
      { pergunta: 'A Ouvidoria atende presencialmente?',
        resposta: 'Sim. O IPREMB está localizado na Praça José Lino da Silva, 144, Brasiléia — Betim/MG, CEP 32600-308, com atendimento de segunda a sexta-feira, das 9h às 16h30. Você pode comparecer pessoalmente para registrar sua manifestação ou obter informações sobre os serviços da Ouvidoria.' }
    ],

    /* --------------------------------------------- modelo unico de formulario
       Reproduz exatamente a estrutura que ja estava nas 6 paginas. */
    modeloFormulario: {
      id: 'ouvidoria-form',
      blocos: [
        {
          titulo: 'Sua identidade',
          campos: [
            { tipo: 'radio', nome: 'identidade', valor: 'anonima',
              rotulo: 'Não quero me identificar (manifestação anônima)' },
            { tipo: 'radio', nome: 'identidade', valor: 'identificada',
              rotulo: 'Quero me identificar e autorizo a divulgação dos meus dados pessoais' },
            { tipo: 'radio', nome: 'identidade', valor: 'sigilosa',
              rotulo: 'Quero me identificar, mas solicito sigilo sobre meus dados pessoais' }
          ]
        },
        {
          titulo: 'Tipo de informação',
          campos: [
            { tipo: 'texto', nome: 'tipo_informacao', id: 'tipo-informacao',
              rotulo: 'Categoria da manifestação', somenteLeitura: true }
          ]
        },
        {
          titulo: 'Dados da mensagem',
          campos: [
            { tipo: 'texto', nome: 'nome', id: 'nome', rotulo: 'Nome completo' },
            { tipo: 'email', nome: 'email', id: 'email', rotulo: 'E-mail', linha: true },
            { tipo: 'tel', nome: 'telefone', id: 'telefone', rotulo: 'Telefone', linha: true },
            { tipo: 'texto', nome: 'assunto', id: 'assunto', rotulo: 'Assunto', obrigatorio: true },
            { tipo: 'textarea', nome: 'mensagem', id: 'mensagem',
              rotulo: 'Descrição da manifestação', obrigatorio: true }
          ]
        },
        {
          titulo: 'Anexos',
          campos: [
            { tipo: 'arquivo', nome: 'anexos', id: 'anexos', rotulo: 'Documentos de apoio' }
          ]
        }
      ],
      botoes: [
        { rotulo: 'Enviar', tipo: 'submit', estilo: 'primario' },
        { rotulo: 'Limpar Formulário', tipo: 'reset', estilo: 'secundario' }
      ]
    },

    /* um registro por fluxo: so muda a categoria exibida */
    manifestacoes: [
      { id: 'denuncia', categoria: 'Denúncia', pagina: 'ouvidoria-denuncia.html' },
      { id: 'denuncia-assedio', categoria: 'Denúncia de Assédio', pagina: 'ouvidoria-denuncia-assedio.html' },
      { id: 'elogio', categoria: 'Elogio', pagina: 'ouvidoria-elogio.html' },
      { id: 'reclamacao', categoria: 'Reclamação', pagina: 'ouvidoria-reclamacao.html' },
      { id: 'solicitacao', categoria: 'Solicitação', pagina: 'ouvidoria-solicitacao.html' },
      { id: 'sugestao', categoria: 'Sugestão', pagina: 'ouvidoria-sugestao.html' }
    ]
  };

  if (raiz) raiz.IPREMB_DADOS_OUVIDORIA = dados;
  if (typeof module !== 'undefined' && module.exports) module.exports = dados;

})(typeof window !== 'undefined' ? window : null);
