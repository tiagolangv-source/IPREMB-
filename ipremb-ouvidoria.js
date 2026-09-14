/* ============================================================================
   IPREMB — Ouvidoria: formulario demonstrativo e FAQ
   Fase 1.15-7.

   Dois componentes, ambos alimentados por dados-ouvidoria.js:

     <div data-ouvidoria="formulario" data-manifestacao="denuncia"></div>
     <div data-ouvidoria="faq"></div>

   FORMULARIO — permanece FRONTEND DEMONSTRATIVO:
     nao ha envio, action, API, banco, SMTP, captcha nem persistencia.
     O <form> continua com onsubmit="return false;", como ja estava publicado.
     O botao "Enviar" nao envia nada; "Limpar Formulario" e um reset nativo.

   FAQ — o acordeao ganhou semantica que faltava (aria-expanded, aria-controls,
   regiao com role) sem alterar nenhuma pergunta ou resposta.

   Este modulo NAO entra no ipremb-layout.js: ele e especifico da Ouvidoria.
   ========================================================================== */
(function (raiz) {
  'use strict';

  var API = {};

  function esc(v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var ICO_MAIS = '<svg class="faq-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" focusable="false"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';

  /* --------------------------------------------------------------------------
     1. FORMULARIO  (puro: config -> string)
     ------------------------------------------------------------------------ */

  function htmlCampo(c, categoria) {
    var req = c.obrigatorio ? ' <span class="form-req">*</span>' : '';
    var reqAttr = c.obrigatorio ? ' required' : '';

    if (c.tipo === 'radio') {
      return '<label class="form-radio-item">' +
        '<input type="radio" name="' + esc(c.nome) + '" value="' + esc(c.valor) + '">' +
        '<span>' + esc(c.rotulo) + '</span></label>';
    }

    var id = esc(c.id || c.nome);
    var rotulo = '<label class="form-label" for="' + id + '">' + esc(c.rotulo) + req + '</label>';

    if (c.tipo === 'textarea') {
      return '<div class="form-group">' + rotulo +
        '<textarea class="form-textarea" id="' + id + '" name="' + esc(c.nome) + '"' + reqAttr + '></textarea></div>';
    }
    if (c.tipo === 'arquivo') {
      return '<div class="form-group">' + rotulo +
        '<input class="form-input" type="file" id="' + id + '" name="' + esc(c.nome) + '" multiple>' +
        '<div class="form-hint">Os arquivos não são enviados nesta versão demonstrativa.</div></div>';
    }

    var tipoHtml = c.tipo === 'email' ? 'email' : (c.tipo === 'tel' ? 'tel' : 'text');
    var extra = c.somenteLeitura
      ? ' value="' + esc(categoria) + '" readonly'
      : '';
    return '<div class="form-group">' + rotulo +
      '<input class="form-input" type="' + tipoHtml + '" id="' + id + '" name="' + esc(c.nome) + '"' +
      extra + reqAttr + '></div>';
  }

  function htmlBloco(b, categoria) {
    var radios = b.campos.filter(function (c) { return c.tipo === 'radio'; });
    var demais = b.campos.filter(function (c) { return c.tipo !== 'radio'; });

    var corpo = '';
    if (radios.length) {
      corpo += '<div class="form-radio-group" role="radiogroup" aria-label="' + esc(b.titulo) + '">' +
        radios.map(function (c) { return htmlCampo(c, categoria); }).join('') + '</div>';
    }
    /* campos marcados com linha:true ficam lado a lado, como antes */
    var i = 0;
    while (i < demais.length) {
      if (demais[i].linha && demais[i + 1] && demais[i + 1].linha) {
        corpo += '<div class="form-row">' + htmlCampo(demais[i], categoria) +
                 htmlCampo(demais[i + 1], categoria) + '</div>';
        i += 2;
      } else {
        corpo += htmlCampo(demais[i], categoria);
        i += 1;
      }
    }
    return '<div class="form-section">' +
      '<div class="form-section-title">' + esc(b.titulo) + '</div>' + corpo + '</div>';
  }

  function htmlFormulario(modelo, categoria) {
    var blocos = modelo.blocos.map(function (b) { return htmlBloco(b, categoria); }).join('');
    var botoes = '<div class="form-actions">' + modelo.botoes.map(function (bt) {
      var cls = bt.estilo === 'primario' ? 'btn btn-primary' : 'btn btn-outline';
      return '<button type="' + esc(bt.tipo) + '" class="' + cls + '">' + esc(bt.rotulo) + '</button>';
    }).join('') + '</div>';

    /* onsubmit="return false;" preservado: nada e enviado */
    return '<div class="form-wrapper">' +
      '<form id="' + esc(modelo.id) + '" onsubmit="return false;" autocomplete="off">' +
      blocos + botoes +
      '<p class="form-hint" style="margin-top:14px;">Formulário demonstrativo: esta versão do site não realiza envio.</p>' +
      '</form></div>';
  }

  /* --------------------------------------------------------------------------
     2. FAQ  (puro)
     ------------------------------------------------------------------------ */

  function htmlFaq(lista) {
    if (!lista || !lista.length) {
      return '<div class="empty-state"><div class="empty-state-title">Nenhuma pergunta publicada.</div></div>';
    }
    return '<div class="faq-list">' + lista.map(function (q, i) {
      var idP = 'faqP' + (i + 1), idR = 'faqR' + (i + 1);
      return '<div class="faq-item">' +
        '<button class="faq-question" type="button" id="' + idP + '" ' +
          'aria-expanded="false" aria-controls="' + idR + '">' +
          esc(q.pergunta) + ICO_MAIS + '</button>' +
        '<div class="faq-answer" id="' + idR + '" role="region" aria-labelledby="' + idP + '">' +
        /* resposta: HTML institucional do proprio projeto, preservado verbatim */
        '<div class="faq-answer-inner">' + q.resposta + '</div>' +
        '</div></div>';
    }).join('') + '</div>';
  }

  /* --------------------------------------------------------------------------
     3. LIGACAO COM O DOM
     ------------------------------------------------------------------------ */

  function ligar(doc, win) {
    var base = win && win.IPREMB_DADOS_OUVIDORIA;
    if (!base) return null;

    var montados = [];

    /* --- formulario --- */
    var alvoForm = doc.querySelector('[data-ouvidoria="formulario"]');
    if (alvoForm) {
      var idM = alvoForm.getAttribute('data-manifestacao');
      var m = (base.manifestacoes || []).filter(function (x) { return x.id === idM; })[0];
      if (m) {
        alvoForm.innerHTML = htmlFormulario(base.modeloFormulario, m.categoria);
        montados.push('formulario:' + idM);
      } else {
        alvoForm.innerHTML = '<div class="empty-state"><div class="empty-state-title">' +
          'Formulário não configurado.</div></div>';
      }
    }

    /* --- FAQ --- */
    var alvoFaq = doc.querySelector('[data-ouvidoria="faq"]');
    if (alvoFaq) {
      alvoFaq.innerHTML = htmlFaq(base.perguntasFrequentes);
      montados.push('faq');

      alvoFaq.addEventListener('click', function (ev) {
        var btn = ev.target && ev.target.closest ? ev.target.closest('.faq-question') : null;
        if (!btn) return;
        var resp = doc.getElementById(btn.getAttribute('aria-controls'));
        if (!resp) return;
        var aberto = btn.getAttribute('aria-expanded') === 'true';

        /* um aberto por vez, como no comportamento original */
        Array.prototype.forEach.call(alvoFaq.querySelectorAll('.faq-question'), function (b) {
          b.setAttribute('aria-expanded', 'false');
          b.classList.remove('open');
          var r = doc.getElementById(b.getAttribute('aria-controls'));
          if (r) r.style.maxHeight = '';
        });

        if (!aberto) {
          btn.setAttribute('aria-expanded', 'true');
          btn.classList.add('open');
          resp.style.maxHeight = resp.scrollHeight + 'px';
        }
      });
    }

    return montados.length ? { montados: montados } : null;
  }

  API.esc = esc;
  API.htmlCampo = htmlCampo;
  API.htmlBloco = htmlBloco;
  API.htmlFormulario = htmlFormulario;
  API.htmlFaq = htmlFaq;
  API.ligar = ligar;

  if (raiz) raiz.IPREMB_OUVIDORIA = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

  if (typeof document !== 'undefined' && raiz) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { ligar(document, raiz); });
    } else {
      ligar(document, raiz);
    }
  }

})(typeof window !== 'undefined' ? window : null);
