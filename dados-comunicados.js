/* ============================================================================
   IPREMB — Comunicados e Avisos
   Fase 1.15-7. CAMADA DE DADOS.

   Os 4 comunicados que estavam escritos a mao em comunicados.html viram
   REGISTROS. Um comunicado novo passa a ser um item nesta lista — nao um
   bloco de HTML novo, e muito menos uma pagina nova.

   Texto, selos e datas copiados VERBATIM. Nada foi inventado, resumido ou
   reordenado. Os paragrafos guardam a marcacao institucional original
   (links do proprio projeto), por isso sao tratados como HTML confiavel.

   Contrato de um registro:
     id           identificador estavel
     selo         rotulo curto ja usado na pagina ("Informativo", "Novidade")
     tom          'informativo' | 'novidade'  -> define so a cor do selo
     data         texto da data, exatamente como publicado
     titulo       titulo do comunicado
     paragrafos[] corpo, um item por paragrafo

   Ponto de substituicao futuro (FAC): trocar a origem desta lista por um
   retorno de servico com o mesmo formato. A pagina nao muda.
   ========================================================================== */
(function (raiz) {
  'use strict';

  var dados = {
    /* ordem de exibicao: a mesma em que ja apareciam na pagina */
    comunicados: [
      {
        id: 'prova-de-vida-anual',
        selo: 'Informativo',
        tom: 'informativo',
        data: '2026',
        titulo: 'Prova de Vida anual',
        paragrafos: [
          'A Prova de Vida deve ser realizada anualmente por aposentados e pensionistas, sempre no mês de aniversário. O procedimento contribui para a atualização cadastral e para a continuidade regular do pagamento dos benefícios.',
          'Em caso de dúvidas, consulte os canais de atendimento do IPREMB ou acesse as orientações disponíveis na página de Prova de Vida.'
        ]
      },
      {
        id: 'novo-horario-atendimento',
        selo: 'Informativo',
        tom: 'informativo',
        data: '02 de abril de 2026',
        titulo: 'Novo horário de atendimento presencial',
        paragrafos: [
          'O atendimento presencial funciona de segunda a sexta-feira, das 9h às 16h30, sem intervalo. O horário unificado visa facilitar o acesso dos segurados ao instituto.',
          'O atendimento telefônico e digital permanece disponível no mesmo horário, pelo número (31) 3594-5380 ou via WhatsApp (31) 9450-9461.'
        ]
      },
      {
        id: 'informe-rendimentos-2025',
        selo: 'Novidade',
        tom: 'novidade',
        data: '28 de março de 2026',
        titulo: 'Informe de Rendimentos 2025 disponível',
        paragrafos: [
          'O Informe de Rendimentos referente ao ano-calendário 2025 já está disponível no Portal do Segurado. O documento é necessário para a declaração anual do Imposto de Renda Pessoa Física.',
          'Para acessar, entre no <a href="https://ipremb.mg.gov.br/facServidor/" target="_blank" rel="noopener" style="color:var(--blue-600);font-weight:600;">Portal do Segurado</a> com seu CPF e senha. Em caso de dúvidas, entre em contato pelo (31) 3594-5380.'
        ]
      },
      {
        id: 'canais-de-atendimento',
        selo: 'Informativo',
        tom: 'informativo',
        data: '2026',
        titulo: 'Canais de atendimento do IPREMB',
        paragrafos: [
          'O IPREMB disponibiliza atendimento presencial, telefônico e digital para aposentados, pensionistas e servidores ativos do município de Betim. Informações sobre serviços, prazos e procedimentos são publicadas regularmente nesta página.',
          'Para dúvidas ou orientações, entre em contato pelo telefone (31) 3594-5380 ou pelo WhatsApp (31) 9450-9461, de segunda a sexta-feira, das 9h às 16h30.'
        ]
      }
    ],

    /* exibido quando nao houver nenhum comunicado publicado */
    vazio: {
      titulo: 'Nenhum comunicado publicado',
      descricao: 'Os comunicados e avisos oficiais do IPREMB serão publicados nesta página.'
    }
  };

  if (raiz) raiz.IPREMB_DADOS_COMUNICADOS = dados;
  if (typeof module !== 'undefined' && module.exports) module.exports = dados;

})(typeof window !== 'undefined' ? window : null);
