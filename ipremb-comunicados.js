/* ============================================================================
   IPREMB — Comunicados orientados por dados
   Fase 1.15-7.

   Uso:  <div data-comunicados="lista"></div>
         <script src="dados-comunicados.js"></script>
         <script src="ipremb-comunicados.js"></script>

   Reproduz exatamente o mesmo markup que estava escrito a mao em
   comunicados.html (.info-block + selo + data + titulo + paragrafos).
   Nenhum estilo novo foi criado.

   Estados previstos: carregando, conteudo, vazio e erro — como no restante
   da arquitetura, para que a origem possa ser trocada pela FAC depois.
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

  /* estilos inline copiados do markup original, para nao mudar nada visual */
  var SELO = {
    informativo: 'background:rgba(74,124,240,0.12);color:var(--blue-700);border:1px solid rgba(74,124,240,0.30);',
    novidade: 'background:rgba(52,208,88,0.14);color:#065F46;border:1px solid rgba(52,208,88,0.35);'
  };
  var SELO_BASE = 'font-size:10.5px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;padding:3px 10px;border-radius:4px;';

  function htmlComunicado(c) {
    var estilo = SELO_BASE + (SELO[c.tom] || SELO.informativo);
    return '<article class="info-block">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">' +
        '<span style="' + estilo + '">' + esc(c.selo) + '</span>' +
        '<span style="font-size:11.5px;color:var(--gray-500);">' + esc(c.data) + '</span>' +
      '</div>' +
      '<h2 class="info-block-title">' + esc(c.titulo) + '</h2>' +
      /* paragrafos: HTML institucional do proprio projeto, preservado */
      (c.paragrafos || []).map(function (p) { return '<p>' + p + '</p>'; }).join('') +
      '</article>';
  }

  function htmlLista(base) {
    var lista = (base && base.comunicados) || [];
    if (!lista.length) {
      var v = (base && base.vazio) || {};
      return '<div class="empty-state">' +
        '<div class="empty-state-title">' + esc(v.titulo || 'Nenhum comunicado publicado') + '</div>' +
        (v.descricao ? '<div class="empty-state-desc">' + esc(v.descricao) + '</div>' : '') +
        '</div>';
    }
    return lista.map(htmlComunicado).join('');
  }

  function htmlCarregando() {
    return '<div class="empty-state"><div class="empty-state-title">Carregando comunicados…</div></div>';
  }

  function htmlErro(msg) {
    return '<div class="empty-state">' +
      '<div class="empty-state-title">Não foi possível carregar os comunicados.</div>' +
      '<div class="empty-state-desc">' + esc(msg || 'Tente novamente em instantes.') + '</div></div>';
  }

  function carregar() {
    return new Promise(function (resolve, reject) {
      var d = raiz && raiz.IPREMB_DADOS_COMUNICADOS;
      if (!d || !Array.isArray(d.comunicados)) {
        reject(new Error('A base de comunicados não foi encontrada.'));
        return;
      }
      resolve(d);
    });
  }

  function ligar(doc) {
    var alvo = doc.querySelector('[data-comunicados]');
    if (!alvo) return null;
    alvo.innerHTML = htmlCarregando();
    carregar().then(function (d) {
      alvo.innerHTML = htmlLista(d);
    })['catch'](function (e) {
      alvo.innerHTML = htmlErro(e && e.message);
    });
    return { alvo: alvo };
  }

  API.esc = esc;
  API.htmlComunicado = htmlComunicado;
  API.htmlLista = htmlLista;
  API.htmlCarregando = htmlCarregando;
  API.htmlErro = htmlErro;
  API.carregar = carregar;
  API.ligar = ligar;

  if (raiz) raiz.IPREMB_COMUNICADOS = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

  if (typeof document !== 'undefined' && raiz) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { ligar(document); });
    } else {
      ligar(document);
    }
  }

})(typeof window !== 'undefined' ? window : null);
