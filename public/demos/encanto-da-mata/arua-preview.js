/* Camada de pré-visualização da Aruá: borrão progressivo fixo no rodapé, marca d'água e botão.
 * Só existe na demonstração do portfólio; o site do cliente fica intacto (ver docs/demos/encanto-da-mata.md).
 * - O borrão fica ABAIXO da barra de reserva e do botão de WhatsApp do próprio site (z-index 53),
 *   para não esconder nem atrapalhar os controles do cliente; e não captura cliques (pointer-events: none).
 * - Marca d'água e botão ficam por cima e sobem acima da barra de reserva quando ela aparece no celular.
 */
(function () {
  "use strict";
  var WHATSAPP = "5538999636208"; // WhatsApp da Aruá
  var BUSINESS = "Pousada Encanto da Mata";

  var css =
    ".arua-blur{position:fixed;left:0;right:0;bottom:0;height:160px;z-index:53;pointer-events:none;" +
    "-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);" +
    "-webkit-mask-image:linear-gradient(to top,rgba(0,0,0,1) 20%,rgba(0,0,0,0) 100%);" +
    "mask-image:linear-gradient(to top,rgba(0,0,0,1) 20%,rgba(0,0,0,0) 100%)}" +
    ".arua-preview{position:fixed;left:0;right:0;bottom:calc(var(--arua-offset,0px) + 14px + env(safe-area-inset-bottom));" +
    "z-index:9999;display:flex;justify-content:center;align-items:center;gap:10px;flex-wrap:wrap;padding:0 16px;" +
    "pointer-events:none;font:600 12px/1.2 system-ui,-apple-system,'Segoe UI',sans-serif;transition:bottom .25s ease}" +
    ".arua-mark{letter-spacing:.14em;text-transform:uppercase;color:#fff;background:rgba(14,24,20,.5);" +
    "border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:8px 14px;" +
    "-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:.92}" +
    ".arua-cta{pointer-events:auto;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 16px;" +
    "border-radius:999px;background:#0B2D5B;color:#fff;text-decoration:none;font-size:13px;letter-spacing:.01em;" +
    "box-shadow:0 8px 24px rgba(11,45,91,.35);transition:transform .15s ease,box-shadow .15s ease}" +
    ".arua-cta:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(11,45,91,.45)}" +
    ".arua-cta:focus-visible{outline:3px solid #f5c542;outline-offset:2px}" +
    ".arua-spacer{height:120px}" +
    "@media (max-width:640px){.arua-blur{height:120px}.arua-mark{font-size:10px;padding:7px 11px}}" +
    "@media (prefers-reduced-motion:reduce){.arua-preview,.arua-cta{transition:none}}" +
    "@media print{.arua-blur,.arua-preview,.arua-spacer{display:none}}";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function init() {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    // Espaço no fim da página, para o rodapé do site não ficar preso sob o borrão.
    document.body.appendChild(el("div", "arua-spacer"));

    var blur = el("div", "arua-blur");
    blur.setAttribute("aria-hidden", "true");

    var bar = el("div", "arua-preview");
    bar.setAttribute("role", "note");
    bar.setAttribute("aria-label", "Modo demonstração da Aruá");
    bar.appendChild(el("span", "arua-mark", "Modo demonstração • Aruá ©"));

    var cta = el("a", "arua-cta", "Quero um site assim");
    var message =
      "Olá! Vi a demonstração do site da " + BUSINESS + " no portfólio da Aruá e quero um site assim para o meu negócio.";
    cta.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(message);
    cta.target = "_blank";
    cta.rel = "noopener noreferrer";
    bar.appendChild(cta);

    document.body.appendChild(blur);
    document.body.appendChild(bar);

    // No celular, o site mostra uma barra de reserva fixa no rodapé: o botão sobe acima dela.
    var dock = document.getElementById("dock");
    var queued = false;
    function place() {
      queued = false;
      var offset = 0;
      if (dock && getComputedStyle(dock).display !== "none") {
        var top = dock.getBoundingClientRect().top;
        offset = Math.max(0, Math.round(window.innerHeight - top));
      }
      bar.style.setProperty("--arua-offset", offset + "px");
    }
    function schedule() {
      if (!queued) {
        queued = true;
        requestAnimationFrame(place);
      }
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    if (dock) dock.addEventListener("transitionend", schedule);
    place();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
